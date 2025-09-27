import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ⚠️ ATENÇÃO: Service key NUNCA deve estar no frontend!
// Use apenas no backend para operações administrativas
export const supabaseAdmin = null

// Configurações do Storage (removido - agora usa backend seguro)
// export const STORAGE_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'user-documents'
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp'
]

// Função para gerar caminho do arquivo baseado no CPF com nome único
export const generateFilePath = async (userCpf: string, originalName: string): Promise<string> => {
  // Limpar CPF (remover pontos e traços)
  const cleanCpf = userCpf.replace(/[^0-9]/g, '')
  
  // Limpar nome do arquivo (manter extensão original)
  const cleanFileName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_')
  
  // Verificar se o arquivo já existe e gerar nome único
  const uniqueFileName = await generateUniqueFileName(cleanCpf, cleanFileName)
  
  return `${cleanCpf}/${uniqueFileName}`
}

// Função para gerar nome único de arquivo
export const generateUniqueFileName = async (folder: string, originalName: string): Promise<string> => {
  const { name, ext } = parseFileName(originalName)
  let counter = 1
  let fileName = originalName
  
  while (true) {
    try {
      // Verificar se o arquivo existe
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .list(folder, {
          search: fileName
        })
      
      if (error || !data || data.length === 0) {
        // Arquivo não existe, usar este nome
        return fileName
      }
      
      // Arquivo existe, gerar novo nome com contador
      fileName = `${name} (${counter})${ext}`
      counter++
      
      // Limite de segurança para evitar loop infinito
      if (counter > 1000) {
        // Se chegou ao limite, usar timestamp
        const timestamp = Date.now()
        return `${name}_${timestamp}${ext}`
      }
    } catch (error) {
      console.error('Erro ao verificar arquivo existente:', error)
      // Em caso de erro, usar timestamp para garantir unicidade
      const timestamp = Date.now()
      return `${name}_${timestamp}${ext}`
    }
  }
}

// Função para separar nome e extensão do arquivo
export const parseFileName = (fileName: string): { name: string; ext: string } => {
  const lastDotIndex = fileName.lastIndexOf('.')
  if (lastDotIndex === -1) {
    return { name: fileName, ext: '' }
  }
  return {
    name: fileName.substring(0, lastDotIndex),
    ext: fileName.substring(lastDotIndex)
  }
}

// Função para gerar nome único do arquivo (compatibilidade com código antigo)
export const generateFileName = async (sessionId: string, originalName: string, documentType: string): Promise<string> => {
  const cleanFileName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_')
  const uniqueFileName = await generateUniqueFileName(`${sessionId}/${documentType}`, cleanFileName)
  return `${sessionId}/${documentType}/${uniqueFileName}`
}

// Função para validar tipo de arquivo
export const validateFileType = (file: File): boolean => {
  return ALLOWED_FILE_TYPES.includes(file.type)
}

// Função para validar tamanho do arquivo
export const validateFileSize = (file: File): boolean => {
  return file.size <= MAX_FILE_SIZE
}

// Função para verificar se o bucket existe
export const checkBucketExists = async (): Promise<{ exists: boolean; error?: string }> => {
  try {
    // Usar apenas chave anônima (segura para frontend)
    console.log('Verificando bucket com chave anônima...')
    
    const { data, error } = await supabase.storage.listBuckets()
    
    console.log('Resultado listBuckets:', { data, error })
    
    if (error) {
      console.log('Erro ao listar buckets:', error)
      return { exists: false, error: error.message }
    }
    
    console.log('Buckets encontrados:', data?.map(b => b.name))
    const bucketExists = data?.some(bucket => bucket.name === STORAGE_BUCKET) || false
    console.log(`Bucket '${STORAGE_BUCKET}' existe:`, bucketExists)
    
    return { exists: bucketExists }
  } catch (error) {
    console.log('Erro na verificação do bucket:', error)
    return { 
      exists: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }
  }
}

// Função para testar se uma URL pública está acessível
export const testPublicUrl = async (url: string): Promise<{ accessible: boolean; error?: string }> => {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return { accessible: response.ok }
  } catch (error) {
    return { 
      accessible: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }
  }
}

// Função para criar URL assinada via backend (seguro)
export const createSignedUrl = async (filePath: string, expiresIn: number = 3600): Promise<{ url: string; error?: string }> => {
  try {
    const response = await fetch('/api/sharing/document/signed-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ filePath, expiresIn })
    });

    const data = await response.json();

    if (!data.success) {
      return { 
        url: '', 
        error: data.error || 'Erro ao gerar URL assinada' 
      };
    }

    return { url: data.data.signedUrl };
  } catch (error) {
    console.error('Erro ao chamar backend para URL assinada:', error);
    return { 
      url: '', 
      error: 'Erro de conexão com o servidor' 
    };
  }
}

// Função para baixar arquivo (apenas no backend)
export const downloadFileWithServiceKey = async (_filePath: string): Promise<{ url: string; error?: string }> => {
  return { 
    url: '', 
    error: 'Downloads com service key devem ser feitos no backend por segurança' 
  }
}

// Função alternativa para verificar se o bucket existe (testando operação)
export const checkBucketExistsByOperation = async (): Promise<{ exists: boolean; error?: string }> => {
  try {
    // Tentar listar arquivos do bucket (operação mais simples)
    console.log('Testando bucket com operação de listagem...')
    
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list('', { limit: 1 })
    
    console.log('Resultado list files:', { data, error })
    
    if (error) {
      // Se o erro for "Bucket not found", o bucket não existe
      if (error.message.includes('Bucket not found') || error.message.includes('not found')) {
        return { exists: false, error: 'Bucket não encontrado' }
      }
      // Outros erros podem indicar que o bucket existe mas não temos permissão
      return { exists: true, error: `Bucket existe mas sem permissão: ${error.message}` }
    }
    
    return { exists: true }
  } catch (error) {
    console.log('Erro na verificação por operação:', error)
    return { 
      exists: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }
  }
}

// Função para testar upload de arquivo de teste
export const testUpload = async (): Promise<{ success: boolean; error?: string; url?: string }> => {
  try {
    // Criar um arquivo de teste simples
    const testContent = 'Teste de upload - ' + new Date().toISOString()
    const testFile = new File([testContent], 'test-upload.txt', { type: 'text/plain' })
    
    // Gerar caminho único
    const filePath = `test-uploads/test-${Date.now()}.txt`
    
    // Fazer upload
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, testFile)
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    // Obter URL pública usando chave anônima
    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath)
    
    return { 
      success: true, 
      url: publicUrlData.publicUrl 
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }
  }
}
