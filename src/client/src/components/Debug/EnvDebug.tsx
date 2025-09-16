import React, { useState, useEffect } from 'react';
import { checkBucketExists, checkBucketExistsByOperation, testPublicUrl, testUpload, createSignedUrl, downloadFileWithServiceKey } from '../../lib/supabase';

export const EnvDebug: React.FC = () => {
  const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
  const supabaseKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;
  const supabaseServiceKey = (import.meta as any).env.VITE_SUPABASE_SERVICE_KEY;
  const [bucketStatus, setBucketStatus] = useState<{ exists: boolean; error?: string } | null>(null);
  const [bucketStatusByOp, setBucketStatusByOp] = useState<{ exists: boolean; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [urlTest, setUrlTest] = useState<{ accessible: boolean; error?: string } | null>(null);
  const [testUrl, setTestUrl] = useState('');
  const [uploadTest, setUploadTest] = useState<{ success: boolean; error?: string; url?: string } | null>(null);
  const [downloadTest, setDownloadTest] = useState<{ success: boolean; error?: string; url?: string } | null>(null);
  const [signedUrlTest, setSignedUrlTest] = useState<{ success: boolean; error?: string; url?: string } | null>(null);

  const checkBucket = async () => {
    setLoading(true);
    
    // Verificar com listBuckets
    const result1 = await checkBucketExists();
    setBucketStatus(result1);
    
    // Verificar com operação de listagem
    const result2 = await checkBucketExistsByOperation();
    setBucketStatusByOp(result2);
    
    setLoading(false);
  };

  const testUrlAccess = async () => {
    if (!testUrl.trim()) return;
    setLoading(true);
    const result = await testPublicUrl(testUrl);
    setUrlTest(result);
    setLoading(false);
  };

  const testUploadFile = async () => {
    setLoading(true);
    const result = await testUpload();
    setUploadTest(result);
    setLoading(false);
  };

  const testDownloadFile = async () => {
    if (!testUrl.trim()) return;
    setLoading(true);
    
    // Extrair o caminho do arquivo da URL
    const urlParts = testUrl.split('/storage/v1/object/public/user-documents/');
    if (urlParts.length < 2) {
      setDownloadTest({ success: false, error: 'URL inválida' });
      setLoading(false);
      return;
    }
    
    const filePath = urlParts[1];
    const result = await downloadFileWithServiceKey(filePath);
    setDownloadTest({ 
      success: !!result.url, 
      error: result.error, 
      url: result.url 
    });
    setLoading(false);
  };

  const testSignedUrl = async () => {
    if (!testUrl.trim()) return;
    setLoading(true);
    
    // Extrair o caminho do arquivo da URL
    const urlParts = testUrl.split('/storage/v1/object/public/user-documents/');
    if (urlParts.length < 2) {
      setSignedUrlTest({ success: false, error: 'URL inválida' });
      setLoading(false);
      return;
    }
    
    const filePath = urlParts[1];
    const result = await createSignedUrl(filePath, 3600); // 1 hora
    setSignedUrlTest({ 
      success: !!result.url, 
      error: result.error, 
      url: result.url 
    });
    setLoading(false);
  };

  useEffect(() => {
    if (supabaseUrl && supabaseKey) {
      checkBucket();
    }
  }, [supabaseUrl, supabaseKey]);
  
  return (
    <div className="p-4 bg-gray-100 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Debug - Supabase Configuration</h3>
      <div className="space-y-2 text-sm">
        <div>
          <strong>VITE_SUPABASE_URL:</strong> 
          <span className="ml-2 font-mono text-xs break-all">
            {supabaseUrl || 'NÃO DEFINIDA'}
          </span>
        </div>
        <div>
          <strong>VITE_SUPABASE_ANON_KEY:</strong> 
          <span className="ml-2 font-mono text-xs break-all">
            {supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NÃO DEFINIDA'}
          </span>
        </div>
        <div>
          <strong>VITE_SUPABASE_SERVICE_KEY:</strong> 
          <span className="ml-2 font-mono text-xs break-all">
            {supabaseServiceKey ? `${supabaseServiceKey.substring(0, 20)}...` : 'NÃO DEFINIDA'}
          </span>
        </div>
        <div>
          <strong>Status das Variáveis:</strong> 
          <span className={`ml-2 px-2 py-1 rounded text-xs ${
            supabaseUrl && supabaseKey ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {supabaseUrl && supabaseKey ? 'CONFIGURADO' : 'NÃO CONFIGURADO'}
          </span>
          {supabaseServiceKey && (
            <span className="ml-2 px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
              SERVICE KEY ATIVA
            </span>
          )}
        </div>
        <div>
          <strong>Bucket 'user-documents':</strong>
          {loading ? (
            <span className="ml-2 text-blue-600">Verificando...</span>
          ) : (
            <div className="ml-2 space-y-1">
              <div>
                <span className="text-xs text-gray-600">Método 1 (listBuckets):</span>
                {bucketStatus ? (
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    bucketStatus.exists ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {bucketStatus.exists ? 'EXISTE' : `NÃO EXISTE - ${bucketStatus.error}`}
                  </span>
                ) : (
                  <span className="ml-2 text-gray-500">Não verificado</span>
                )}
              </div>
              <div>
                <span className="text-xs text-gray-600">Método 2 (list files):</span>
                {bucketStatusByOp ? (
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    bucketStatusByOp.exists ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {bucketStatusByOp.exists ? 'EXISTE' : `NÃO EXISTE - ${bucketStatusByOp.error}`}
                  </span>
                ) : (
                  <span className="ml-2 text-gray-500">Não verificado</span>
                )}
              </div>
            </div>
          )}
          <button 
            onClick={checkBucket}
            className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
          >
            Verificar
          </button>
        </div>
        <div>
          <strong>Teste de URL Pública:</strong>
          <div className="mt-2 flex space-x-2">
            <input
              type="text"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="Cole uma URL do Supabase aqui"
              className="flex-1 px-2 py-1 border rounded text-xs"
            />
            <button 
              onClick={testUrlAccess}
              disabled={loading || !testUrl.trim()}
              className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              Testar URL
            </button>
            <button 
              onClick={testDownloadFile}
              disabled={loading || !testUrl.trim()}
              className="px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 disabled:bg-gray-400"
            >
              Baixar com Service Key
            </button>
            <button 
              onClick={testSignedUrl}
              disabled={loading || !testUrl.trim()}
              className="px-2 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 disabled:bg-gray-400"
            >
              Criar URL Assinada
            </button>
          </div>
          {urlTest && (
            <div className="mt-1">
              <span className={`px-2 py-1 rounded text-xs ${
                urlTest.accessible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {urlTest.accessible ? 'ACESSÍVEL' : `INACESSÍVEL - ${urlTest.error}`}
              </span>
            </div>
          )}
          {downloadTest && (
            <div className="mt-1">
              <div className={`px-2 py-1 rounded text-xs ${
                downloadTest.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {downloadTest.success ? 'DOWNLOAD SUCESSO' : `DOWNLOAD FALHOU - ${downloadTest.error}`}
              </div>
              {downloadTest.url && (
                <div className="mt-1">
                  <div className="text-xs text-gray-600">URL local gerada:</div>
                  <div className="text-xs break-all bg-gray-100 p-1 rounded">
                    {downloadTest.url}
                  </div>
                  <a 
                    href={downloadTest.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-1 inline-block px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                  >
                    Abrir Arquivo
                  </a>
                </div>
              )}
            </div>
          )}
          {signedUrlTest && (
            <div className="mt-1">
              <div className={`px-2 py-1 rounded text-xs ${
                signedUrlTest.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {signedUrlTest.success ? 'URL ASSINADA CRIADA' : `FALHA - ${signedUrlTest.error}`}
              </div>
              {signedUrlTest.url && (
                <div className="mt-1">
                  <div className="text-xs text-gray-600">URL assinada (válida por 1 hora):</div>
                  <div className="text-xs break-all bg-gray-100 p-1 rounded">
                    {signedUrlTest.url}
                  </div>
                  <a 
                    href={signedUrlTest.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-1 inline-block px-2 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600"
                  >
                    Abrir URL Assinada
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
        <div>
          <strong>Teste de Upload:</strong>
          <div className="mt-2">
            <button 
              onClick={testUploadFile}
              disabled={loading}
              className="px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 disabled:bg-gray-400"
            >
              {loading ? 'Testando...' : 'Testar Upload'}
            </button>
          </div>
          {uploadTest && (
            <div className="mt-2">
              <div className={`px-2 py-1 rounded text-xs ${
                uploadTest.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {uploadTest.success ? 'UPLOAD SUCESSO' : `UPLOAD FALHOU - ${uploadTest.error}`}
              </div>
              {uploadTest.url && (
                <div className="mt-1">
                  <div className="text-xs text-gray-600">URL gerada:</div>
                  <div className="text-xs break-all bg-gray-100 p-1 rounded">
                    {uploadTest.url}
                  </div>
                  <button 
                    onClick={() => setTestUrl(uploadTest.url!)}
                    className="mt-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                  >
                    Usar para teste de URL
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
