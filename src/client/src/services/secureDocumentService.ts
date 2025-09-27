import { api } from './api';

export interface DocumentUpload {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  documentType: string;
  uploadedAt: Date;
  url: string;
  filePath: string;
}

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export class SecureDocumentService {
  // Upload de um documento via backend (seguro)
  static async uploadDocument(
    file: File,
    documentType: string,
    options: {
      userCpf?: string;
      sessionId?: string;
      onProgress?: (progress: UploadProgress) => void;
    } = {}
  ): Promise<DocumentUpload> {
    try {
      console.log('Iniciando upload seguro via backend:', {
        fileName: file.name,
        type: file.type,
        size: file.size,
        documentType
      });

      // Validar arquivo no frontend
      if (!this.validateFileType(file)) {
        throw new Error('Tipo de arquivo não suportado. Tipos aceitos: PDF, JPG, PNG, WEBP');
      }

      if (!this.validateFileSize(file)) {
        throw new Error('Arquivo muito grande. Tamanho máximo: 10MB');
      }

      // Iniciar progresso
      options.onProgress?.({
        fileName: file.name,
        progress: 0,
        status: 'uploading'
      });

      // Criar FormData para upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      
      if (options.userCpf) {
        formData.append('userCpf', options.userCpf);
      }
      if (options.sessionId) {
        formData.append('sessionId', options.sessionId);
      }

      // Progresso intermediário
      options.onProgress?.({
        fileName: file.name,
        progress: 50,
        status: 'uploading'
      });

      // Fazer upload via API do backend
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro no upload');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Upload falhou');
      }

      // Progresso final
      options.onProgress?.({
        fileName: file.name,
        progress: 100,
        status: 'success'
      });

      console.log('Upload seguro realizado com sucesso:', result.data);
      return result.data;

    } catch (error) {
      console.error('Erro no upload seguro:', error);
      options.onProgress?.({
        fileName: file.name,
        progress: 0,
        status: 'error',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      throw error;
    }
  }

  // Upload múltiplo de documentos via backend (seguro)
  static async uploadMultipleDocuments(
    files: File[],
    documentType: string,
    options: {
      userCpf?: string;
      sessionId?: string;
      onProgress?: (progress: UploadProgress[]) => void;
    } = {}
  ): Promise<DocumentUpload[]> {
    const results: DocumentUpload[] = [];
    const progress: UploadProgress[] = files.map(file => ({
      fileName: file.name,
      progress: 0,
      status: 'uploading'
    }));

    options.onProgress?.(progress);

    // Criar FormData para upload múltiplo
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('documentType', documentType);
    
    if (options.userCpf) {
      formData.append('userCpf', options.userCpf);
    }
    if (options.sessionId) {
      formData.append('sessionId', options.sessionId);
    }

    try {
      // Fazer upload múltiplo via API do backend
      const response = await fetch('/api/documents/upload-multiple', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro no upload múltiplo');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Upload múltiplo falhou');
      }

      // Atualizar progresso com resultados
      const successful = result.data.successful || [];
      const failed = result.data.failed || [];

      // Atualizar progresso para arquivos bem-sucedidos
      successful.forEach((doc: DocumentUpload, index: number) => {
        const progressIndex = files.findIndex(f => f.name === doc.fileName);
        if (progressIndex !== -1) {
          progress[progressIndex] = {
            fileName: doc.fileName,
            progress: 100,
            status: 'success'
          };
        }
        results.push(doc);
      });

      // Atualizar progresso para arquivos que falharam
      failed.forEach((fail: any) => {
        const progressIndex = files.findIndex(f => f.name === fail.fileName);
        if (progressIndex !== -1) {
          progress[progressIndex] = {
            fileName: fail.fileName,
            progress: 0,
            status: 'error',
            error: fail.error
          };
        }
      });

      options.onProgress?.(progress);

      console.log('Upload múltiplo seguro realizado:', {
        successful: successful.length,
        failed: failed.length
      });

      return results;

    } catch (error) {
      console.error('Erro no upload múltiplo seguro:', error);
      
      // Marcar todos como erro
      progress.forEach(p => {
        p.status = 'error';
        p.progress = 0;
        p.error = error instanceof Error ? error.message : 'Erro desconhecido';
      });
      
      options.onProgress?.(progress);
      throw error;
    }
  }

  // Deletar documento via backend (seguro)
  static async deleteDocument(filePath: string): Promise<void> {
    try {
      console.log('Deletando documento via backend:', filePath);

      const response = await fetch(`/api/documents/${encodeURIComponent(filePath)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao deletar documento');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Falha ao deletar documento');
      }

      console.log('Documento deletado com sucesso:', filePath);

    } catch (error) {
      console.error('Erro ao deletar documento:', error);
      throw error;
    }
  }

  // Validações no frontend
  private static validateFileType(file: File): boolean {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp'
    ];
    return allowedTypes.includes(file.type);
  }

  private static validateFileSize(file: File): boolean {
    const maxSize = 10 * 1024 * 1024; // 10MB
    return file.size <= maxSize;
  }

  // Obter URL de download (via backend se necessário)
  static getDownloadUrl(filePath: string): string {
    // Para documentos públicos, pode retornar URL direta
    // Para documentos privados, seria necessário passar pelo backend
    return filePath; // Simplificado por enquanto
  }
}
