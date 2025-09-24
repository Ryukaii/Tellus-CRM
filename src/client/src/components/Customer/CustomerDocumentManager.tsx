import React, { useState, useEffect } from 'react';
import { Plus, Upload, FileText, X, Eye, Download, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { DocumentUpload } from '../UI/DocumentUpload';
import { DocumentViewer } from '../UI/DocumentViewer';
import { DocumentService, DocumentUpload as DocumentUploadType } from '../../services/documentService';
import { LocalDocumentUpload } from './LocalDocumentUpload';
import { Button } from '../UI/Button';
import { Modal } from '../UI/Modal';

interface CustomerDocument {
  id: string;
  fileName: string;
  fileType: string;
  documentType: string;
  uploadedAt: string;
  url: string;
}

interface CustomerDocumentManagerProps {
  customerId: string;
  customerCpf: string;
  documents: CustomerDocument[];
  onDocumentsChange: (documents: CustomerDocument[]) => void;
  readOnly?: boolean;
  className?: string;
}

export const CustomerDocumentManager: React.FC<CustomerDocumentManagerProps> = ({
  customerId,
  customerCpf,
  documents,
  onDocumentsChange,
  readOnly = false,
  className = ''
}) => {
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<CustomerDocument | null>(null);

  // Verificar se o Supabase está configurado
  const isSupabaseConfigured = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    console.log('Verificando configuração do Supabase:');
    console.log('URL:', supabaseUrl);
    console.log('Key:', supabaseKey ? 'Configurada' : 'Não configurada');
    
    const isConfigured = supabaseUrl && 
           supabaseUrl !== 'https://your-project.supabase.co' && 
           supabaseUrl.includes('supabase.co') &&
           supabaseKey && 
           supabaseKey !== 'your-anon-key' &&
           supabaseKey.length > 50;
    
    console.log('Supabase configurado:', isConfigured);
    return isConfigured;
  };

  const handleUploadComplete = async (uploadedDocs: DocumentUploadType[]) => {
    try {
      setUploading(true);
      setError(null);

      console.log('Documentos enviados:', uploadedDocs);

      // Converter DocumentUpload para CustomerDocument
      const newDocuments: CustomerDocument[] = uploadedDocs.map(doc => ({
        id: doc.id,
        fileName: doc.fileName,
        fileType: doc.fileType,
        documentType: doc.documentType,
        uploadedAt: doc.uploadedAt.toISOString(),
        url: doc.url
      }));

      console.log('Documentos convertidos:', newDocuments);

      // Atualizar lista de documentos
      const updatedDocuments = [...documents, ...newDocuments];
      onDocumentsChange(updatedDocuments);

      // Salvar no backend
      await saveDocumentsToBackend(updatedDocuments);

      setShowUpload(false);
    } catch (err) {
      console.error('Erro no upload:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar documentos');
    } finally {
      setUploading(false);
    }
  };

  const handleUploadError = (error: string) => {
    setError(error);
  };

  const handleLocalUploadComplete = (uploadedDocs: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    documentType: string;
    uploadedAt: Date;
    url: string;
  }>) => {
    try {
      setUploading(true);
      setError(null);

      console.log('Documentos locais enviados:', uploadedDocs);

      // Converter para CustomerDocument
      const newDocuments: CustomerDocument[] = uploadedDocs.map(doc => ({
        id: doc.id,
        fileName: doc.fileName,
        fileType: doc.fileType,
        documentType: doc.documentType,
        uploadedAt: doc.uploadedAt.toISOString(),
        url: doc.url
      }));

      console.log('Documentos locais convertidos:', newDocuments);

      // Atualizar lista de documentos
      const updatedDocuments = [...documents, ...newDocuments];
      onDocumentsChange(updatedDocuments);

      setShowUpload(false);
    } catch (err) {
      console.error('Erro no upload local:', err);
      setError(err instanceof Error ? err.message : 'Erro ao processar documentos');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveDocument = (document: CustomerDocument) => {
    setDocumentToDelete(document);
    setShowDeleteModal(true);
  };

  const confirmRemoveDocument = async () => {
    if (!documentToDelete) return;

    try {
      setUploading(true);
      setError(null);

      // Remover do Supabase Storage
      await DocumentService.deleteDocument(documentToDelete.id);

      // Atualizar lista local
      const updatedDocuments = documents.filter(doc => doc.id !== documentToDelete.id);
      onDocumentsChange(updatedDocuments);

      // Salvar no backend
      await saveDocumentsToBackend(updatedDocuments);

      // Fechar modal
      setShowDeleteModal(false);
      setDocumentToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover documento');
    } finally {
      setUploading(false);
    }
  };

  const cancelRemoveDocument = () => {
    setShowDeleteModal(false);
    setDocumentToDelete(null);
  };

  const saveDocumentsToBackend = async (docs: CustomerDocument[]) => {
    try {
      const token = localStorage.getItem('tellus_token');
      const response = await fetch(`/api/customers/${customerId}/documents`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ documents: docs })
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar documentos no backend');
      }
    } catch (err) {
      console.error('Erro ao salvar documentos:', err);
      // Não bloquear a UI, apenas logar o erro
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="w-4 h-4 text-red-500" />;
    if (fileType.includes('image')) return <FileText className="w-4 h-4 text-blue-500" />;
    return <FileText className="w-4 h-4 text-gray-500" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center dark:text-dark-text">
          <FileText className="w-5 h-5 mr-2 text-orange-500 dark:text-dark-accent" />
          Documentos ({documents.length})
        </h3>
        
        {!readOnly && (
          <Button
            onClick={() => setShowUpload(true)}
            className="flex items-center justify-center space-x-2 text-sm"
            disabled={uploading}
            size="sm"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar</span>
          </Button>
        )}
      </div>

      {/* Configuração do Supabase */}
      {!isSupabaseConfigured() && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md dark:bg-amber-900/20 dark:border-amber-800">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-amber-400 mr-3 dark:text-amber-300" />
            <div>
              <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Supabase não configurado
              </h4>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                Para upload de documentos em nuvem, configure as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.
                Atualmente usando armazenamento local temporário.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-400 mr-3 dark:text-red-300" />
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Erro</h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
      {showUpload && !readOnly && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 dark:border-dark-border dark:bg-dark-surfaceLight">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-dark-text">Adicionar Novos Documentos</h4>
            <button
              onClick={() => setShowUpload(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors dark:text-dark-textMuted dark:hover:text-dark-text"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {isSupabaseConfigured() ? (
            <DocumentUpload
              sessionId={customerId}
              documentType="customer_document"
              label="Documentos do Cliente"
              description="Adicione documentos relacionados ao cliente (RG, CPF, comprovantes, etc.)"
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
              maxFiles={10}
              userCpf={customerCpf}
            />
          ) : (
            <LocalDocumentUpload
              onUploadComplete={handleLocalUploadComplete}
              onUploadError={handleUploadError}
              maxFiles={10}
            />
          )}
        </div>
      )}

      {/* Documents List */}
      {documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-dark-textMuted">
          <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Nenhum documento encontrado</p>
          {!readOnly && (
            <p className="text-sm mt-1">Clique em "Adicionar Documentos" para começar</p>
          )}
        </div>
      ) : (
        <div className="space-y-3 max-w-full overflow-hidden">
          {documents.map((document) => (
            <div key={document.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow dark:bg-dark-card dark:border-dark-border dark:hover:shadow-lg">
              <div className="space-y-3">
                {/* Header com informações do arquivo */}
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getFileIcon(document.fileType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate dark:text-dark-text" title={document.fileName}>
                      {document.fileName}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mt-1 dark:text-dark-textMuted">
                      <span>{document.fileType}</span>
                      <span>•</span>
                      <span>Enviado em {formatDate(document.uploadedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100 dark:border-dark-border">
                  {uploading && <Loader2 className="w-4 h-4 animate-spin text-blue-500 mr-2 dark:text-blue-400" />}
                  
                  <button
                    onClick={async () => {
                      try {
                        const { DocumentViewerService } = await import('../../services/documentViewerService');
                        const result = await DocumentViewerService.getSignedDocumentUrl(document.id);
                        if (result.signedUrl) {
                          window.open(result.signedUrl, '_blank');
                        }
                      } catch (err) {
                        console.error('Erro ao abrir documento:', err);
                      }
                    }}
                    className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20"
                    title="Visualizar documento"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver</span>
                  </button>

                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = document.url;
                      link.download = document.fileName;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20"
                    title="Baixar documento"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>

                  {!readOnly && (
                    <button
                      onClick={() => handleRemoveDocument(document)}
                      disabled={uploading}
                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                      title="Remover documento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remover</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Confirmação de Remoção */}
      <Modal
        isOpen={showDeleteModal}
        onClose={cancelRemoveDocument}
        title="Confirmar Remoção"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 dark:bg-red-900/20">
              <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text">
                Remover documento
              </h3>
              <p className="text-sm text-gray-600 mt-1 dark:text-dark-textSecondary">
                Tem certeza que deseja remover o documento{' '}
                <span className="font-medium text-gray-900 dark:text-dark-text">
                  "{documentToDelete?.fileName}"
                </span>?
              </p>
              <p className="text-xs text-red-600 mt-2 dark:text-red-400">
                ⚠️ Esta ação não pode ser desfeita. O arquivo será removido permanentemente.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t dark:border-dark-border">
            <Button
              variant="outline"
              onClick={cancelRemoveDocument}
              disabled={uploading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmRemoveDocument}
              disabled={uploading}
              className="flex items-center space-x-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Removendo...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Remover</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
