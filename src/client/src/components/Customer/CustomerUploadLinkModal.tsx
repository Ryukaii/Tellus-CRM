import React, { useState, useEffect } from 'react';
import { X, Copy, ExternalLink, Clock, Users, FileText, Settings, AlertCircle, CheckCircle } from 'lucide-react';
import { CustomerUploadService, CustomerUploadLink, CreateUploadLinkData } from '../../services/customerUploadService';

interface CustomerUploadLinkModalProps {
  customerId: string;
  customerName: string;
  isOpen: boolean;
  onClose: () => void;
  onLinkCreated?: (link: CustomerUploadLink) => void;
}

export const CustomerUploadLinkModal: React.FC<CustomerUploadLinkModalProps> = ({
  customerId,
  customerName,
  isOpen,
  onClose,
  onLinkCreated
}) => {
  const [loading, setLoading] = useState(false);
  const [uploadLink, setUploadLink] = useState<CustomerUploadLink | null>(null);
  const [copied, setCopied] = useState(false);
  const [existingLinks, setExistingLinks] = useState<CustomerUploadLink[]>([]);

  // Configurações fixas do link
  const expiresInHours = 72; // 72 horas
  const maxAccess = undefined; // Sem limite de acesso
  const maxFileSize = 10; // 10MB
  const maxFiles = 20; // 20 arquivos
  const allowedDocumentTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ];

  useEffect(() => {
    if (isOpen) {
      loadExistingLinks();
    }
  }, [isOpen, customerId]);

  const loadExistingLinks = async () => {
    try {
      const links = await CustomerUploadService.getUserUploadLinks();
      const customerLinks = links.filter(link => link.customerId === customerId);
      setExistingLinks(customerLinks);
    } catch (error) {
      console.error('Erro ao carregar links existentes:', error);
    }
  };

  const handleCreateLink = async () => {
    setLoading(true);

    try {
      const linkData: CreateUploadLinkData = {
        customerId,
        expiresInHours,
        maxAccess,
        maxFileSize,
        maxFiles,
        allowedDocumentTypes
      };

      const link = await CustomerUploadService.createUploadLink(linkData);
      setUploadLink(link);
      onLinkCreated?.(link);
      loadExistingLinks(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao criar link:', error);
      alert('Erro ao criar link de upload');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!uploadLink) return;

    try {
      const linkUrl = CustomerUploadService.getUploadLinkUrl(uploadLink.id);
      await navigator.clipboard.writeText(linkUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar link:', error);
    }
  };

  const handleDeactivateLink = async (linkId: string) => {
    if (!confirm('Tem certeza que deseja desativar este link?')) return;

    try {
      await CustomerUploadService.deactivateUploadLink(linkId);
      loadExistingLinks();
      if (uploadLink?.id === linkId) {
        setUploadLink(null);
      }
    } catch (error) {
      console.error('Erro ao desativar link:', error);
      alert('Erro ao desativar link');
    }
  };

  const formatTimeRemaining = (expiresAt: Date) => {
    const now = new Date();
    const timeRemaining = new Date(expiresAt).getTime() - now.getTime();
    return CustomerUploadService.formatTimeRemaining(timeRemaining);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-border">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text">
            Link de Upload - {customerName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-dark-textMuted dark:hover:text-dark-text"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Links Existentes */}
          {existingLinks.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text mb-4">
                Links Existentes
              </h3>
              <div className="space-y-3">
                {existingLinks.map((link) => (
                  <div
                    key={link.id}
                    className="border border-gray-200 dark:border-dark-border rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-dark-text">
                            {CustomerUploadService.getUploadLinkUrl(link.id)}
                          </span>
                          {CustomerUploadService.isLinkActive(link) ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-dark-textMuted">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>Expira em {formatTimeRemaining(link.expiresAt)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{link.accessCount} acessos</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FileText className="w-4 h-4" />
                            <span>Máx. {link.maxFiles} arquivos</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            const linkUrl = CustomerUploadService.getUploadLinkUrl(link.id);
                            navigator.clipboard.writeText(linkUrl);
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:text-dark-textMuted dark:hover:text-dark-text"
                          title="Copiar link"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.open(CustomerUploadService.getUploadLinkUrl(link.id), '_blank')}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:text-dark-textMuted dark:hover:text-dark-text"
                          title="Abrir link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        {CustomerUploadService.isLinkActive(link) && (
                          <button
                            onClick={() => handleDeactivateLink(link.id)}
                            className="px-3 py-1 text-sm text-red-600 hover:text-red-700 border border-red-200 rounded-md hover:bg-red-50"
                          >
                            Desativar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Criar Novo Link */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text mb-4">
              Criar Novo Link
            </h3>
            
            {/* Configurações do Link */}
            <div className="bg-gray-50 dark:bg-dark-surfaceLight rounded-lg p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500 dark:text-dark-textMuted" />
                  <span className="text-gray-700 dark:text-dark-textMuted">Expira em:</span>
                  <span className="font-medium text-gray-900 dark:text-dark-text">72 horas</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-500 dark:text-dark-textMuted" />
                  <span className="text-gray-700 dark:text-dark-textMuted">Acessos:</span>
                  <span className="font-medium text-gray-900 dark:text-dark-text">Ilimitado</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-500 dark:text-dark-textMuted" />
                  <span className="text-gray-700 dark:text-dark-textMuted">Tamanho máximo:</span>
                  <span className="font-medium text-gray-900 dark:text-dark-text">10 MB por arquivo</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-gray-500 dark:text-dark-textMuted" />
                  <span className="text-gray-700 dark:text-dark-textMuted">Máximo de arquivos:</span>
                  <span className="font-medium text-gray-900 dark:text-dark-text">20 arquivos</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCreateLink}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Criando...' : 'Criar Link de Upload'}
            </button>
          </div>

          {/* Link Criado */}
          {uploadLink && (
            <div className="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h4 className="text-lg font-medium text-green-800 dark:text-green-200">
                  Link criado com sucesso!
                </h4>
              </div>
              
              <div className="bg-white dark:bg-dark-surface border border-green-200 dark:border-green-700 rounded-md p-3 mb-3">
                <p className="text-sm text-gray-600 dark:text-dark-textMuted mb-1">Link de upload:</p>
                <p className="text-sm font-mono text-gray-900 dark:text-dark-text break-all">
                  {CustomerUploadService.getUploadLinkUrl(uploadLink.id)}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copied ? 'Copiado!' : 'Copiar Link'}</span>
                </button>
                
                <button
                  onClick={() => window.open(CustomerUploadService.getUploadLinkUrl(uploadLink.id), '_blank')}
                  className="flex items-center space-x-2 px-4 py-2 border border-green-600 text-green-600 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Abrir Link</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
