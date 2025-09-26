import React, { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface LocalDocument {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  documentType: string;
  uploadedAt: Date;
  url: string;
}

interface LocalDocumentUploadProps {
  onUploadComplete: (documents: LocalDocument[]) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  className?: string;
}

export const LocalDocumentUpload: React.FC<LocalDocumentUploadProps> = ({
  onUploadComplete,
  onUploadError,
  maxFiles = 999,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<LocalDocument[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp'
  ];

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return `Tipo de arquivo não suportado: ${file.type}`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(2)}MB (máx: 10MB)`;
    }
    return null;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;

    // Verificar limite de arquivos
    if (uploadedDocuments.length + files.length > maxFiles) {
      onUploadError?.(`Máximo de ${maxFiles} arquivos permitidos`);
      return;
    }

    setUploading(true);

    try {
      const newDocuments: LocalDocument[] = [];

      for (const file of files) {
        const validationError = validateFile(file);
        if (validationError) {
          onUploadError?.(validationError);
          continue;
        }

        // Criar URL local para o arquivo
        const fileUrl = URL.createObjectURL(file);
        
        const document: LocalDocument = {
          id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          documentType: 'customer_document',
          uploadedAt: new Date(),
          url: fileUrl
        };

        newDocuments.push(document);
      }

      const allDocuments = [...uploadedDocuments, ...newDocuments];
      setUploadedDocuments(allDocuments);
      onUploadComplete(allDocuments);

    } catch (error) {
      onUploadError?.(error instanceof Error ? error.message : 'Erro no upload');
    } finally {
      setUploading(false);
    }
  };

  const removeDocument = (document: LocalDocument) => {
    if (window.confirm(`Tem certeza que deseja remover o arquivo "${document.fileName}"? Esta ação não pode ser desfeita.`)) {
      performRemoveDocument(document);
    }
  };

  const performRemoveDocument = (document: LocalDocument) => {
    // Revogar URL do objeto para liberar memória
    URL.revokeObjectURL(document.url);
    
    const remainingDocuments = uploadedDocuments.filter(doc => doc.id !== document.id);
    setUploadedDocuments(remainingDocuments);
    onUploadComplete(remainingDocuments);
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

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Documentos do Cliente (Modo Local)
        </label>
        <p className="text-xs text-amber-600 mb-2">
          ⚠️ Supabase não configurado. Arquivos serão armazenados localmente.
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 mb-1">
          {isDragging ? 'Solte os arquivos aqui' : 'Clique ou arraste arquivos aqui'}
        </p>
        <p className="text-xs text-gray-500">
          PDF, JPG, PNG, WEBP (máx. 10MB cada)
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {uploadedDocuments.length}/{maxFiles} arquivos
        </p>
      </div>

      {/* Uploaded Documents */}
      {uploadedDocuments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Documentos Enviados</h4>
          {uploadedDocuments.map((document) => (
            <div key={document.id} className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-center space-x-3">
                {getFileIcon(document.fileType)}
                <div>
                  <p className="text-sm font-medium text-gray-700">{document.fileName}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(document.fileSize)}</p>
                </div>
              </div>
              <button
                onClick={() => removeDocument(document)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
