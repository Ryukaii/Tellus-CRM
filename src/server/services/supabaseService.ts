import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase para o backend
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️ Supabase não configurado no backend. URLs assinadas não funcionarão.');
}

// Cliente do Supabase com service key (apenas no backend)
export const supabaseAdmin = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Configurações do Storage
export const STORAGE_BUCKET = 'user-documents';

/**
 * Gerar URL assinada para um arquivo
 */
export const createSignedUrl = async (
  filePath: string, 
  expiresIn: number = 3600
): Promise<{ url: string; error?: string }> => {
  try {
    if (!supabaseAdmin) {
      return { 
        url: '', 
        error: 'Supabase não configurado no backend' 
      };
    }

    console.log('Gerando URL assinada para:', filePath, 'expira em:', expiresIn, 'segundos');
    
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(filePath, expiresIn);
    
    if (error) {
      console.error('Erro ao criar URL assinada:', error);
      return { 
        url: '', 
        error: error.message 
      };
    }
    
    if (!data?.signedUrl) {
      return { 
        url: '', 
        error: 'URL assinada não gerada' 
      };
    }
    
    console.log('URL assinada criada com sucesso');
    return { url: data.signedUrl };
  } catch (error) {
    console.error('Erro na criação da URL assinada:', error);
    return { 
      url: '', 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
};

/**
 * Gerar múltiplas URLs assinadas
 */
export const createMultipleSignedUrls = async (
  filePaths: string[], 
  expiresIn: number = 3600
): Promise<{ urls: Record<string, string>; errors: Record<string, string> }> => {
  const urls: Record<string, string> = {};
  const errors: Record<string, string> = {};
  
  for (const filePath of filePaths) {
    const result = await createSignedUrl(filePath, expiresIn);
    if (result.url) {
      urls[filePath] = result.url;
    } else {
      errors[filePath] = result.error || 'Erro desconhecido';
    }
  }
  
  return { urls, errors };
};

/**
 * Verificar se um arquivo existe no storage
 */
export const checkFileExists = async (filePath: string): Promise<boolean> => {
  try {
    if (!supabaseAdmin) {
      return false;
    }

    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .list(filePath.split('/').slice(0, -1).join('/'), {
        search: filePath.split('/').pop()
      });
    
    return !error && data && data.length > 0;
  } catch (error) {
    console.error('Erro ao verificar arquivo:', error);
    return false;
  }
};

/**
 * Upload de arquivo para o Supabase Storage
 */
export const uploadFile = async (
  fileBuffer: Buffer, 
  fileName: string, 
  bucket: string = STORAGE_BUCKET
): Promise<{ success: boolean; filePath?: string; url?: string; error?: string }> => {
  try {
    if (!supabaseAdmin) {
      return { 
        success: false, 
        error: 'Supabase não configurado no backend' 
      };
    }

    console.log('Fazendo upload para Supabase:', fileName, 'bucket:', bucket);
    
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(fileName, fileBuffer, {
        contentType: 'application/octet-stream',
        upsert: false
      });
    
    if (error) {
      console.error('Erro ao fazer upload:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
    
    if (!data?.path) {
      return { 
        success: false, 
        error: 'Upload realizado mas caminho não retornado' 
      };
    }
    
    // Gerar URL assinada para o arquivo
    const { createSignedUrl } = await import('./supabaseService.js');
    const signedUrlResult = await createSignedUrl(data.path, 3600);
    
    console.log('Upload realizado com sucesso:', data.path);
    
    return {
      success: true,
      filePath: data.path,
      url: signedUrlResult.url
    };
  } catch (error) {
    console.error('Erro na função uploadFile:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
};

/**
 * Obter URL pública de um arquivo (se o bucket for público)
 */
export const getPublicUrl = (filePath: string): string => {
  if (!supabaseAdmin) {
    return '';
  }

  const { data } = supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);

  return data.publicUrl;
};
