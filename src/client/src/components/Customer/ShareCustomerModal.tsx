import React, { useState } from 'react';
import { X, Share2, Clock, Eye, FileText, User, MapPin, DollarSign, MessageSquare, Copy, Check } from 'lucide-react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { SharingService, ShareableLink } from '../../services/documentViewerService';

interface Customer {
  id: string;
  name: string;
  cpf: string;
  email?: string;
  phone?: string;
  uploadedDocuments?: Array<{
    id: string;
    fileName: string;
    fileType: string;
    documentType: string;
  }>;
}

interface ShareCustomerModalProps {
  customer: Customer;
  isOpen: boolean;
  onClose: () => void;
  onShared?: (shareableLink: ShareableLink) => void;
}

export const ShareCustomerModal: React.FC<ShareCustomerModalProps> = ({
  customer,
  isOpen,
  onClose,
  onShared
}) => {
  const [loading, setLoading] = useState(false);
  const [shareableLink, setShareableLink] = useState<ShareableLink | null>(null);
  const [copied, setCopied] = useState(false);

  // Configurações de compartilhamento
  const [expiresInHours, setExpiresInHours] = useState(24);
  const [maxAccess, setMaxAccess] = useState<number | undefined>(undefined);
  const [permissions, setPermissions] = useState({
    viewPersonalData: true,
    viewAddress: false,
    viewFinancialData: false,
    viewDocuments: true,
    viewNotes: false,
  });
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);

  const handlePermissionChange = (permission: keyof typeof permissions) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: !prev[permission]
    }));
  };

  const handleDocumentToggle = (docId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleCreateShare = async () => {
    setLoading(true);

    try {
      const shareData = {
        customerId: customer.id,
        expiresInHours,
        maxAccess,
        permissions,
        documentIds: selectedDocuments
      };

      const link = await SharingService.createShareableLink(shareData);
      setShareableLink(link);
      onShared?.(link);
    } catch (error) {
      console.error('Erro ao criar compartilhamento:', error);
      alert('Erro ao criar link de compartilhamento');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareableLink) return;

    const shareUrl = `${window.location.origin}/shared/${shareableLink.id}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback para navegadores antigos
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetForm = () => {
    setShareableLink(null);
    setExpiresInHours(24);
    setMaxAccess(undefined);
    setPermissions({
      viewPersonalData: true,
      viewAddress: false,
      viewFinancialData: false,
      viewDocuments: true,
      viewNotes: false,
    });
    setSelectedDocuments([]);
    setCopied(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Compartilhar Cliente">
      <div className="space-y-6">
        {!shareableLink ? (
          <>
            {/* Informações do Cliente */}
            <div className="bg-gray-50 p-4 rounded-lg dark:bg-dark-surfaceLight">
              <h3 className="font-medium text-gray-900 mb-2 dark:text-dark-text">Cliente a ser compartilhado:</h3>
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400 dark:text-dark-textMuted" />
                <div>
                  <p className="font-medium dark:text-dark-text">{customer.name}</p>
                  <p className="text-sm text-gray-500 dark:text-dark-textSecondary">CPF: {customer.cpf}</p>
                </div>
              </div>
            </div>

            {/* Configurações de Tempo */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3 flex items-center dark:text-dark-text">
                <Clock className="w-4 h-4 mr-2" />
                Configurações de Tempo
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-dark-textSecondary">
                    Expira em (horas)
                  </label>
                  <select 
                    value={expiresInHours} 
                    onChange={(e) => setExpiresInHours(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 dark:border-dark-inputBorder dark:bg-dark-input dark:text-dark-text"
                  >
                    <option value={1}>1 hora</option>
                    <option value={6}>6 horas</option>
                    <option value={12}>12 horas</option>
                    <option value={24}>24 horas</option>
                    <option value={72}>3 dias</option>
                    <option value={168}>1 semana</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-dark-textSecondary">
                    Máximo de acessos
                  </label>
                  <select 
                    value={maxAccess || ''} 
                    onChange={(e) => setMaxAccess(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 dark:border-dark-inputBorder dark:bg-dark-input dark:text-dark-text"
                  >
                    <option value="">Ilimitado</option>
                    <option value={1}>1 acesso</option>
                    <option value={5}>5 acessos</option>
                    <option value={10}>10 acessos</option>
                    <option value={25}>25 acessos</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Permissões de Acesso */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3 flex items-center dark:text-dark-text">
                <Eye className="w-4 h-4 mr-2" />
                O que será compartilhado
              </h3>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={permissions.viewPersonalData}
                    onChange={() => handlePermissionChange('viewPersonalData')}
                    className="rounded border-gray-300 dark:border-dark-inputBorder dark:bg-dark-input"
                  />
                  <User className="w-4 h-4 text-gray-400 dark:text-dark-textMuted" />
                  <span className="text-sm dark:text-dark-text">Dados Pessoais (nome, CPF, email, telefone)</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={permissions.viewAddress}
                    onChange={() => handlePermissionChange('viewAddress')}
                    className="rounded border-gray-300 dark:border-dark-inputBorder dark:bg-dark-input"
                  />
                  <MapPin className="w-4 h-4 text-gray-400 dark:text-dark-textMuted" />
                  <span className="text-sm dark:text-dark-text">Endereço</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={permissions.viewFinancialData}
                    onChange={() => handlePermissionChange('viewFinancialData')}
                    className="rounded border-gray-300 dark:border-dark-inputBorder dark:bg-dark-input"
                  />
                  <DollarSign className="w-4 h-4 text-gray-400 dark:text-dark-textMuted" />
                  <span className="text-sm dark:text-dark-text">Dados Financeiros</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={permissions.viewDocuments}
                    onChange={() => handlePermissionChange('viewDocuments')}
                    className="rounded border-gray-300 dark:border-dark-inputBorder dark:bg-dark-input"
                  />
                  <FileText className="w-4 h-4 text-gray-400 dark:text-dark-textMuted" />
                  <span className="text-sm dark:text-dark-text">Documentos</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={permissions.viewNotes}
                    onChange={() => handlePermissionChange('viewNotes')}
                    className="rounded border-gray-300 dark:border-dark-inputBorder dark:bg-dark-input"
                  />
                  <MessageSquare className="w-4 h-4 text-gray-400 dark:text-dark-textMuted" />
                  <span className="text-sm dark:text-dark-text">Observações</span>
                </label>
              </div>
            </div>

            {/* Seleção de Documentos */}
            {permissions.viewDocuments && customer.uploadedDocuments && customer.uploadedDocuments.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3 dark:text-dark-text">
                  Selecionar Documentos
                </h3>
                
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {customer.uploadedDocuments.map((doc) => (
                    <label key={doc.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded dark:hover:bg-dark-surfaceLight">
                      <input
                        type="checkbox"
                        checked={selectedDocuments.includes(doc.id)}
                        onChange={() => handleDocumentToggle(doc.id)}
                        className="rounded border-gray-300 dark:border-dark-inputBorder dark:bg-dark-input"
                      />
                      <FileText className="w-4 h-4 text-gray-400 dark:text-dark-textMuted" />
                      <div className="flex-1">
                        <p className="text-sm font-medium dark:text-dark-text">{doc.fileName}</p>
                        <p className="text-xs text-gray-500 dark:text-dark-textSecondary">{doc.documentType}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="flex justify-end space-x-3 pt-4 border-t dark:border-dark-border">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateShare}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
                <span>Criar Link</span>
              </Button>
            </div>
          </>
        ) : (
          /* Link Criado */
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto dark:bg-green-900/20">
              <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2 dark:text-dark-text">
                Link de Compartilhamento Criado!
              </h3>
              <p className="text-sm text-gray-600 dark:text-dark-textSecondary">
                O link expira em {expiresInHours} hora{expiresInHours !== 1 ? 's' : ''}
                {maxAccess && ` e permite até ${maxAccess} acesso${maxAccess !== 1 ? 's' : ''}`}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg dark:bg-dark-surfaceLight">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={`${window.location.origin}/shared/${shareableLink.id}`}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm dark:bg-dark-input dark:border-dark-inputBorder dark:text-dark-text"
                />
                <Button
                  onClick={handleCopyLink}
                  className="flex items-center space-x-2"
                  variant={copied ? 'default' : 'outline'}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="flex justify-center space-x-3">
              <Button
                variant="outline"
                onClick={handleClose}
              >
                Fechar
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
