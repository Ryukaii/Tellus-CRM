import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Upload, FileText, AlertCircle, CheckCircle, Clock, 
  Users, Loader2, X, Eye, Download
} from 'lucide-react';
import { CustomerUploadService, CustomerUploadLink } from '../../services/customerUploadService';

// Forçar tema light para página pública
document.documentElement.classList.remove('dark');
document.documentElement.classList.add('light');

export const CustomerUploadPage: React.FC = () => {
  const { linkId } = useParams<{ linkId: string }>();
  const [uploadLink, setUploadLink] = useState<CustomerUploadLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (linkId) {
      loadUploadLink(linkId);
    }
  }, [linkId]);

  const loadUploadLink = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const link = await CustomerUploadService.getUploadLink(id);
      setUploadLink(link);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar link');
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    if (!uploadLink) return;

    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      // Verificar tipo de arquivo
      if (!uploadLink.allowedDocumentTypes.includes(file.type)) {
        errors.push(`${file.name}: Tipo de arquivo não permitido`);
        return;
      }

      // Verificar tamanho do arquivo
      const maxSizeBytes = uploadLink.maxFileSize * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        errors.push(`${file.name}: Arquivo muito grande (máx. ${uploadLink.maxFileSize}MB)`);
        return;
      }

      // Verificar limite de arquivos
      if (uploadedFiles.length + validFiles.length >= uploadLink.maxFiles) {
        errors.push(`Limite de ${uploadLink.maxFiles} arquivos excedido`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      alert('Erros encontrados:\n' + errors.join('\n'));
    }

    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!uploadLink || uploadedFiles.length === 0) return;

    setUploading(true);
    const errors: string[] = [];

    try {
      for (const file of uploadedFiles) {
        try {
          await CustomerUploadService.uploadDocument(uploadLink.id, file);
        } catch (error) {
          errors.push(`${file.name}: ${error instanceof Error ? error.message : 'Erro no upload'}`);
        }
      }

      if (errors.length > 0) {
        alert('Alguns arquivos não foram enviados:\n' + errors.join('\n'));
      } else {
        alert('Todos os arquivos foram enviados com sucesso!');
        setUploadedFiles([]);
      }
    } catch (error) {
      alert('Erro no upload: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setUploading(false);
    }
  };

  const formatTimeRemaining = (timeRemaining: number) => {
    return CustomerUploadService.formatTimeRemaining(timeRemaining);
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-tellus-primary mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error || !uploadLink) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro</h1>
          <p className="text-gray-600 mb-4">
            {error || 'Link não encontrado ou expirado'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-tellus-charcoal-900 text-white rounded-lg hover:bg-tellus-charcoal-800 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Upload de Documentos
              </h1>
              <p className="text-gray-600">
                Cliente: {uploadLink.customerName}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 text-sm text-gray-500 mb-1">
                <Clock className="w-4 h-4" />
                <span>Expira em {formatTimeRemaining(uploadLink.timeRemaining || 0)}</span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Users className="w-4 h-4" />
                <span>{uploadLink.accessCount} acessos</span>
              </div>
            </div>
          </div>

          {/* Informações do Link */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-tellus-gold-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-tellus-primary" />
              <div>
                <p className="text-sm font-medium text-tellus-charcoal-900">Máximo de arquivos</p>
                <p className="text-sm text-tellus-charcoal-700">{uploadLink.maxFiles}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Upload className="w-5 h-5 text-tellus-primary" />
              <div>
                <p className="text-sm font-medium text-tellus-charcoal-900">Tamanho máximo</p>
                <p className="text-sm text-tellus-charcoal-700">{uploadLink.maxFileSize}MB por arquivo</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-tellus-primary" />
              <div>
                <p className="text-sm font-medium text-tellus-charcoal-900">Tipos permitidos</p>
                <p className="text-sm text-tellus-charcoal-700">PDF, JPG, PNG, WEBP</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Selecionar Arquivos
          </h2>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-tellus-primary bg-tellus-gold-50'
                : 'border-gray-300 hover:border-gray-400'
            } ${uploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <input
              id="file-input"
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600 mb-2">
              {dragActive ? 'Solte os arquivos aqui' : 'Clique ou arraste arquivos aqui'}
            </p>
            <p className="text-sm text-gray-500">
              PDF, JPG, PNG, WEBP (máx. {uploadLink.maxFileSize}MB cada)
            </p>
            <p className="text-sm text-gray-400 mt-2">
              {uploadedFiles.length}/{uploadLink.maxFiles} arquivos selecionados
            </p>
          </div>
        </div>

        {/* Files List */}
        {uploadedFiles.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Arquivos Selecionados ({uploadedFiles.length})
            </h2>
            
            <div className="space-y-3">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-6 py-2 bg-tellus-charcoal-900 text-white rounded-lg hover:bg-tellus-charcoal-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <span>{uploading ? 'Enviando...' : 'Enviar Arquivos'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Este link é seguro e temporário. Os documentos serão enviados diretamente para o sistema.</p>
        </div>
      </div>
    </div>
  );
};
