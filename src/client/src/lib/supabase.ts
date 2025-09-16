import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'
const supabaseServiceKey = (import.meta as any).env.VITE_SUPABASE_SERVICE_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente com service key para operações que precisam ignorar RLS
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

// Configurações do Storage
export const STORAGE_BUCKET = 'user-documents'
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp'
]

// Função para gerar caminho do arquivo baseado no CPF
export const generateFilePath = (userCpf: string, originalName: string): string => {
  // Limpar CPF (remover pontos e traços)
  const cleanCpf = userCpf.replace(/[^0-9]/g, '')
  
  // Limpar nome do arquivo (manter extensão original)
  const cleanFileName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_')
  
  return `${cleanCpf}/${cleanFileName}`
}

// Função para gerar nome único do arquivo (compatibilidade com código antigo)
export const generateFileName = (sessionId: string, originalName: string, documentType: string): string => {
  const timestamp = Date.now()
  return `${sessionId}/${documentType}/${timestamp}_${originalName.replace(/[^a-zA-Z0-9.-]/g, '_')}`
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
    // Tentar com service key primeiro (tem mais permissões)
    const client = supabaseAdmin || supabase
    console.log('Verificando bucket com:', supabaseAdmin ? 'service key' : 'anon key')
    
    const { data, error } = await client.storage.listBuckets()
    
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

// Função para criar URL assinada (recomendado para buckets privados)
export const createSignedUrl = async (filePath: string, expiresIn: number = 3600): Promise<{ url: string; error?: string }> => {
  try {
    if (!supabaseAdmin) {
      return { 
        url: '', 
        error: 'Service key não disponível' 
      }
    }
    
    console.log('Criando URL assinada para:', filePath, 'expira em:', expiresIn, 'segundos')
    
    // Criar URL assinada usando service key
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(filePath, expiresIn)
    
    if (error) {
      console.log('Erro ao criar URL assinada:', error)
      return { 
        url: '', 
        error: error.message 
      }
    }
    
    if (!data?.signedUrl) {
      return { 
        url: '', 
        error: 'URL assinada não gerada' 
      }
    }
    
    console.log('URL assinada criada:', data.signedUrl)
    return { url: data.signedUrl }
  } catch (error) {
    console.log('Erro na criação da URL assinada:', error)
    return { 
      url: '', 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }
  }
}

// Função para baixar arquivo usando service key e criar URL local (fallback)
export const downloadFileWithServiceKey = async (filePath: string): Promise<{ url: string; error?: string }> => {
  try {
    if (!supabaseAdmin) {
      return { 
        url: '', 
        error: 'Service key não disponível' 
      }
    }
    
    console.log('Baixando arquivo com service key:', filePath)
    
    // Baixar arquivo usando service key (ignora RLS)
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .download(filePath)
    
    if (error) {
      console.log('Erro ao baixar arquivo:', error)
      return { 
        url: '', 
        error: error.message 
      }
    }
    
    if (!data) {
      return { 
        url: '', 
        error: 'Arquivo não encontrado' 
      }
    }
    
    // Criar URL local temporária
    const localUrl = URL.createObjectURL(data)
    console.log('URL local criada:', localUrl)
    
    return { url: localUrl }
  } catch (error) {
    console.log('Erro no download:', error)
    return { 
      url: '', 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }
  }
}

// Função alternativa para verificar se o bucket existe (testando operação)
export const checkBucketExistsByOperation = async (): Promise<{ exists: boolean; error?: string }> => {
  try {
    // Tentar listar arquivos do bucket (operação mais simples)
    const client = supabaseAdmin || supabase
    console.log('Testando bucket com operação de listagem...')
    
    const { data, error } = await client.storage
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
    
    // Obter URL pública usando service key (ignora RLS)
    const client = supabaseAdmin || supabase
    const { data: publicUrlData } = client.storage
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
