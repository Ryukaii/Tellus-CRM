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
