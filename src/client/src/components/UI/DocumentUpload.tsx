import React, { useState, useRef } from 'react'
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { DocumentService, DocumentUpload as DocumentUploadType, UploadProgress } from '../../services/documentService'
import { PreRegistrationApi } from '../../services/preRegistrationApi'

interface DocumentUploadProps {
  sessionId: string
  documentType: string
  label: string
  description?: string
  onUploadComplete: (documents: DocumentUploadType[]) => void
  onUploadError?: (error: string) => void
  maxFiles?: number
  className?: string
  userCpf?: string // CPF do usuário para organizar arquivos
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  sessionId,
  documentType,
  label,
  description,
  onUploadComplete,
  onUploadError,
  maxFiles = 5,
  className = '',
  userCpf
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])
  const [uploadedDocuments, setUploadedDocuments] = useState<DocumentUploadType[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return

    // Verificar limite de arquivos
    if (uploadedDocuments.length + files.length > maxFiles) {
      onUploadError?.(`Máximo de ${maxFiles} arquivos permitidos`)
      return
    }

    setUploading(true)
    setUploadProgress([])

    try {
      const results = await DocumentService.uploadMultipleDocuments(
        sessionId,
        files,
        documentType,
        (progress) => setUploadProgress([...progress]),
        userCpf
      )

      const allDocuments = [...uploadedDocuments, ...results]
      setUploadedDocuments(allDocuments)
      
      // Salvar documentos no backend
      try {
        await PreRegistrationApi.saveDocuments(allDocuments)
      } catch (error) {
        console.error('Erro ao salvar documentos no backend:', error)
        // Não bloquear a UI, apenas logar o erro
      }
      
      onUploadComplete(allDocuments)
    } catch (error) {
      onUploadError?.(error instanceof Error ? error.message : 'Erro no upload')
    } finally {
      setUploading(false)
      setUploadProgress([])
    }
  }

  const removeDocument = (document: DocumentUploadType) => {
    if (window.confirm(`Tem certeza que deseja remover o arquivo "${document.fileName}"? Esta ação não pode ser desfeita.`)) {
      performRemoveDocument(document);
    }
  };

  const performRemoveDocument = async (document: DocumentUploadType) => {
    try {
      await DocumentService.deleteDocument(document.id)
      const remainingDocuments = uploadedDocuments.filter(doc => doc.id !== document.id)
      setUploadedDocuments(remainingDocuments)
      
      // Atualizar documentos no backend
      try {
        await PreRegistrationApi.saveDocuments(remainingDocuments)
      } catch (error) {
        console.error('Erro ao atualizar documentos no backend:', error)
        // Não bloquear a UI, apenas logar o erro
      }
      
      onUploadComplete(remainingDocuments)
    } catch (error) {
      onUploadError?.(error instanceof Error ? error.message : 'Erro ao remover arquivo')
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="w-4 h-4 text-red-500" />
    if (fileType.includes('image')) return <FileText className="w-4 h-4 text-blue-500" />
    return <FileText className="w-4 h-4 text-gray-500" />
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        {description && (
          <p className="text-xs text-gray-500 mb-2">{description}</p>
        )}
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

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="space-y-2">
          {uploadProgress.map((progress, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {progress.status === 'uploading' && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
                  {progress.status === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                  {progress.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                  <span className="text-sm font-medium text-gray-700">{progress.fileName}</span>
                </div>
                <span className="text-xs text-gray-500">{progress.progress}%</span>
              </div>
              
              {progress.status === 'uploading' && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
              )}
              
              {progress.error && (
                <p className="text-xs text-red-500 mt-1">{progress.error}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Documents */}
      {uploadedDocuments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Documentos Enviados</h4>
          {uploadedDocuments.map((document) => (
            <div key={document.id} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
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
  )
}
