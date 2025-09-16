import React, { useState, useEffect } from 'react';
import { Eye, Download, ExternalLink, Clock, AlertCircle, Loader2, FileText, RefreshCw } from 'lucide-react';
import { DocumentViewerService, SignedUrlResult } from '../../services/documentViewerService';
import { DocumentService } from '../../services/documentService';

interface DocumentViewerProps {
  filePath: string;
  fileName: string;
  fileType: string;
  className?: string;
  showDownload?: boolean;
  showExternalLink?: boolean;
  shareExpiresAt?: Date; // Tempo de expiração do compartilhamento
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  filePath,
  fileName,
  fileType,
  className = '',
  showDownload = true,
  showExternalLink = true,
  shareExpiresAt
}) => {
  const [signedUrl, setSignedUrl] = useState<SignedUrlResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Gerar URL assinada
  const generateSignedUrl = async () => {
    setLoading(true);
    setError(null);

    try {
      let result: SignedUrlResult;
      
      if (shareExpiresAt) {
        // Usar tempo de expiração do compartilhamento
        result = await DocumentViewerService.getSignedDocumentUrlForSharing(filePath, shareExpiresAt);
      } else {
        // Usar tempo padrão (1 hora)
        result = await DocumentViewerService.getSignedDocumentUrl(filePath);
      }
      
      if (result.error) {
        setError(result.error);
      } else {
        setSignedUrl(result);
      }
    } catch (err) {
      setError('Erro ao gerar link de acesso');
    } finally {
      setLoading(false);
    }
  };

  // Atualizar tempo restante
  useEffect(() => {
    if (!signedUrl || !DocumentViewerService.isUrlValid(signedUrl.expiresAt)) {
      setTimeRemaining('');
      return;
    }

    const updateTime = () => {
      const remaining = DocumentViewerService.getTimeRemaining(signedUrl.expiresAt);
      setTimeRemaining(remaining);
      
      if (remaining === 'Expirado') {
        setSignedUrl(null);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Atualizar a cada minuto

    return () => clearInterval(interval);
  }, [signedUrl]);

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('image')) return '🖼️';
    return '📎';
  };

  const handleView = async () => {
    console.log('🔍 DEBUG: handleView chamado para:', filePath);
    console.log('🔍 DEBUG: URL atual:', signedUrl?.signedUrl);
    
    // Sempre gerar nova URL quando clicar
    try {
      console.log('🔍 DEBUG: Chamando DocumentService.getFreshUrl...');
      const newUrl = await DocumentService.getFreshUrl(filePath);
      console.log('🔍 DEBUG: Nova URL recebida:', newUrl);
      
      setSignedUrl({
        signedUrl: newUrl,
        expiresAt: new Date(Date.now() + 3600000) // 1 hora
      });
      
      console.log('🔍 DEBUG: Abrindo nova URL...');
      window.open(newUrl, '_blank');
    } catch (error) {
      console.log('❌ DEBUG: Erro ao gerar URL, tentando método alternativo:', error);
      generateSignedUrl();
    }
  };

  const handleDownload = async () => {
    // Sempre gerar nova URL quando clicar
    try {
      const newUrl = await DocumentService.getFreshUrl(filePath);
      setSignedUrl({
        signedUrl: newUrl,
        expiresAt: new Date(Date.now() + 3600000) // 1 hora
      });
      
      const link = document.createElement('a');
      link.href = newUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.log('Erro ao gerar URL para download, tentando método alternativo:', error);
      generateSignedUrl();
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const newUrl = await DocumentService.getFreshUrl(filePath);
      setSignedUrl({
        signedUrl: newUrl,
        expiresAt: new Date(Date.now() + 3600000) // 1 hora
      });
    } catch (error) {
      setError('Erro ao regenerar URL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getFileIcon(fileType)}</span>
          <div>
            <h4 className="text-sm font-medium text-gray-900">{fileName}</h4>
            <p className="text-xs text-gray-500">{fileType}</p>
            {timeRemaining && (
              <div className="flex items-center space-x-1 mt-1">
                <Clock className="w-3 h-3 text-blue-500" />
                <span className="text-xs text-blue-600">{timeRemaining}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {error && (
            <div className="flex items-center space-x-1 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs">{error}</span>
            </div>
          )}

          {loading && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}

          <button
            onClick={handleView}
            disabled={loading}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>Ver</span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            title="Regenerar URL"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>

          {showDownload && signedUrl && DocumentViewerService.isUrlValid(signedUrl.expiresAt) && (
            <button
              onClick={handleDownload}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          )}

          {showExternalLink && signedUrl && DocumentViewerService.isUrlValid(signedUrl.expiresAt) && (
            <a
              href={signedUrl.signedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Abrir</span>
            </a>
          )}
        </div>
      </div>

      {signedUrl && DocumentViewerService.isUrlValid(signedUrl.expiresAt) && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-700">
              Link ativo por {timeRemaining}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente para múltiplos documentos
interface DocumentListViewerProps {
  documents: Array<{
    id: string;
    fileName: string;
    fileType: string;
    filePath?: string;
  }>;
  className?: string;
}

export const DocumentListViewer: React.FC<DocumentListViewerProps> = ({
  documents,
  className = ''
}) => {
  if (documents.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Nenhum documento encontrado</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {documents.map((doc) => (
        <DocumentViewer
          key={doc.id}
          filePath={doc.filePath || doc.id}
          fileName={doc.fileName}
          fileType={doc.fileType}
        />
      ))}
    </div>
  );
};
