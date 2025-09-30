import React, { useState, useEffect } from 'react';
import { Eye, Download, ExternalLink, Clock, AlertCircle, Loader2, FileText } from 'lucide-react';
import { DocumentViewerService, SignedUrlResult } from '../../services/documentViewerService';

interface DocumentViewerProps {
  filePath: string;
  fileName: string;
  fileType: string;
  className?: string;
  showDownload?: boolean;
  showExternalLink?: boolean;
  shareExpiresAt?: Date; // Tempo de expiração do compartilhamento
  shareLinkId?: string; // ID do link de compartilhamento
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  filePath,
  fileName,
  fileType,
  className = '',
  showDownload = true,
  showExternalLink = true,
  shareExpiresAt,
  shareLinkId
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
      
      if (shareLinkId && shareExpiresAt) {
        // Usar endpoint público para documentos compartilhados
        const { SharingService } = await import('../../services/documentViewerService');
        result = await SharingService.getSharedDocumentSignedUrl(shareLinkId, filePath);
      } else if (shareExpiresAt) {
        // Usar tempo de expiração do compartilhamento (método antigo)
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

  const handleView = () => {
    if (signedUrl && DocumentViewerService.isUrlValid(signedUrl.expiresAt)) {
      window.open(signedUrl.signedUrl, '_blank');
    } else {
      generateSignedUrl();
    }
  };

  const handleDownload = () => {
    if (signedUrl && DocumentViewerService.isUrlValid(signedUrl.expiresAt)) {
      const link = document.createElement('a');
      link.href = signedUrl.signedUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
                <Clock className="w-3 h-3 text-tellus-primary" />
                <span className="text-xs text-tellus-primary">{timeRemaining}</span>
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

          {loading && <Loader2 className="w-4 h-4 animate-spin text-tellus-primary" />}

          <button
            onClick={handleView}
            disabled={loading}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm text-tellus-primary hover:text-tellus-charcoal-800 hover:bg-tellus-gold-50 rounded-md transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>Ver</span>
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
