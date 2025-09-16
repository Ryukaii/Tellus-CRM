import { supabase, supabaseAdmin, STORAGE_BUCKET, generateFileName, generateFilePath, validateFileType, validateFileSize, createSignedUrl, downloadFileWithServiceKey } from '../lib/supabase'

export interface DocumentUpload {
  id: string
  fileName: string
  fileSize: number
  fileType: string
  documentType: string
  uploadedAt: Date
  url: string
}

export interface UploadProgress {
  fileName: string
  progress: number
  status: 'uploading' | 'success' | 'error'
  error?: string
}

export class DocumentService {
  // Upload de um documento
  static async uploadDocument(
    sessionId: string,
    file: File,
    documentType: string,
    onProgress?: (progress: UploadProgress) => void,
    userCpf?: string
  ): Promise<DocumentUpload> {
    try {
      console.log('Iniciando upload do arquivo:', file.name, 'Tipo:', file.type, 'Tamanho:', file.size);
      
      // Verificar configuração do Supabase
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      console.log('DocumentService - Verificando Supabase:');
      console.log('URL:', supabaseUrl);
      console.log('Key length:', supabaseKey ? supabaseKey.length : 0);
      
      if (!supabaseUrl || 
          supabaseUrl === 'https://your-project.supabase.co' || 
          !supabaseUrl.includes('supabase.co') ||
          !supabaseKey || 
          supabaseKey === 'your-anon-key' ||
          supabaseKey.length < 50) {
        throw new Error('Configuração do Supabase não encontrada. Verifique as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY');
      }

      // Validar arquivo
      if (!validateFileType(file)) {
        throw new Error(`Tipo de arquivo não suportado. Tipos aceitos: PDF, JPG, PNG, WEBP`)
      }

      if (!validateFileSize(file)) {
        throw new Error(`Arquivo muito grande. Tamanho máximo: 10MB`)
      }

      // Gerar caminho do arquivo baseado no CPF (se disponível) ou sessionId
      const filePath = userCpf 
        ? generateFilePath(userCpf, file.name)
        : generateFileName(sessionId, file.name, documentType)
      
      console.log('Caminho do arquivo gerado:', filePath);
      
      // Iniciar progresso de upload
      onProgress?.({
        fileName: file.name,
        progress: 0,
        status: 'uploading'
      })

      // Fazer upload real para o Supabase Storage
      console.log('Fazendo upload para Supabase...');
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Erro do Supabase:', error);
        throw new Error(`Erro no upload: ${error.message}`)
      }

      console.log('Upload bem-sucedido:', data);

      // Progresso intermediário
      onProgress?.({
        fileName: file.name,
        progress: 80,
        status: 'uploading'
      })

      // Gerar URL assinada (recomendado para buckets privados)
      let publicUrl: string
      
      if (supabaseAdmin) {
        // Usar service key para criar URL assinada (1 hora de validade)
        const { url: signedUrl, error: signedUrlError } = await createSignedUrl(filePath, 3600)
        
        if (signedUrlError) {
          console.log('Erro ao criar URL assinada:', signedUrlError)
          // Fallback para download e URL local
          const { url: localUrl, error: downloadError } = await downloadFileWithServiceKey(filePath)
          
          if (downloadError) {
            console.log('Erro ao baixar com service key:', downloadError)
            // Último fallback para URL pública (pode não funcionar)
            const { data: publicUrlData } = supabase.storage
              .from(STORAGE_BUCKET)
              .getPublicUrl(filePath)
            publicUrl = publicUrlData.publicUrl
          } else {
            publicUrl = localUrl
          }
        } else {
          publicUrl = signedUrl
        }
      } else {
        // Usar URL pública normal (pode não funcionar devido ao RLS)
        const { data: publicUrlData } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(filePath)
        publicUrl = publicUrlData.publicUrl
      }

      console.log('URL gerada:', publicUrl);
      console.log('Bucket usado:', STORAGE_BUCKET);
      console.log('Caminho do arquivo:', filePath);
      console.log('Usando service key:', !!supabaseAdmin);

      // Progresso final
      onProgress?.({
        fileName: file.name,
        progress: 100,
        status: 'success'
      })

      // Retornar dados reais do upload
      const result = {
        id: data.path,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        documentType,
        uploadedAt: new Date(),
        url: publicUrl
      };

      console.log('Resultado final do upload:', result);
      return result;

    } catch (error) {
      console.error('Erro no upload do documento:', error);
      onProgress?.({
        fileName: file.name,
        progress: 0,
        status: 'error',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      })
      throw error
    }
  }

  // Upload múltiplo de documentos
  static async uploadMultipleDocuments(
    sessionId: string,
    files: File[],
    documentType: string,
    onProgress?: (progress: UploadProgress[]) => void,
    userCpf?: string
  ): Promise<DocumentUpload[]> {
    const results: DocumentUpload[] = []
    const progress: UploadProgress[] = files.map(file => ({
      fileName: file.name,
      progress: 0,
      status: 'uploading'
    }))

    onProgress?.(progress)

    for (let i = 0; i < files.length; i++) {
      try {
        const result = await this.uploadDocument(sessionId, files[i], documentType, (uploadProgress) => {
          progress[i] = uploadProgress
          onProgress?.(progress)
        }, userCpf)
        results.push(result)
      } catch (error) {
        progress[i] = {
          fileName: files[i].name,
          progress: 0,
          status: 'error',
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        }
        onProgress?.(progress)
      }
    }

    return results
  }

  // Deletar documento
  static async deleteDocument(filePath: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([filePath])

      if (error) {
        throw new Error(`Erro ao deletar documento: ${error.message}`)
      }

      console.log(`Documento deletado: ${filePath}`)
    } catch (error) {
      console.error('Erro ao deletar documento:', error)
      throw error
    }
  }

  // Listar documentos de uma sessão
  static async listSessionDocuments(sessionId: string): Promise<DocumentUpload[]> {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(sessionId, {
        limit: 100,
        offset: 0
      })

    if (error) {
      throw new Error(`Erro ao listar documentos: ${error.message}`)
    }

    return data.map(file => ({
      id: file.name,
      fileName: file.name,
      fileSize: file.metadata?.size || 0,
      fileType: file.metadata?.mimetype || '',
      documentType: file.name.split('/')[1] || 'unknown',
      uploadedAt: new Date(file.created_at),
      url: ''
    }))
  }

  // Obter URL de download
  static getDownloadUrl(filePath: string): string {
    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  // Gerar nova URL sempre (mais simples e confiável)
  static async getFreshUrl(filePath: string): Promise<string> {
    return this.getDownloadUrl(filePath)
  }

  // Regenerar URL de um documento existente
  static async regenerateDocumentUrl(document: DocumentUpload): Promise<DocumentUpload> {
    try {
      const newUrl = await this.getFreshUrl(document.id)
      
      return {
        ...document,
        url: newUrl
      }
    } catch (error) {
      console.error('Erro ao regenerar URL do documento:', error)
      return document
    }
  }
}
