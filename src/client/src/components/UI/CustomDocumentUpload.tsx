import React, { useState } from 'react';
import { Upload, Plus, FileText } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

interface CustomDocumentUploadProps {
  cpf: string;
  onDocumentAdded: (doc: any) => void;
  onError: (error: string) => void;
  documentCategories?: Array<{ value: string; label: string }>;
}

export function CustomDocumentUpload({ 
  cpf, 
  onDocumentAdded, 
  onError,
  documentCategories 
}: CustomDocumentUploadProps) {
  const [customTitle, setCustomTitle] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Categorias padrão se não fornecidas
  const defaultCategories = [
    { value: 'identity', label: 'Documento de Identidade' },
    { value: 'address_proof', label: 'Comprovante de Residência' },
    { value: 'marital_status', label: 'Comprovante de Estado Civil' },
    { value: 'income_proof', label: 'Comprovante de Renda' },
    { value: 'tax_return', label: 'Declaração de IR' },
    { value: 'bank_statements', label: 'Extratos Bancários' },
    { value: 'contract_social', label: 'Contrato Social' },
    { value: 'cnpj', label: 'Cartão CNPJ' },
    { value: 'company_tax_return', label: 'IR Pessoa Jurídica' },
    { value: 'balance_sheet', label: 'Balanço Patrimonial' },
    { value: 'other', label: 'Outros Documentos' }
  ];

  const categories = documentCategories || defaultCategories;

  // Inicializar com primeira categoria
  React.useEffect(() => {
    if (!documentType && categories.length > 0) {
      setDocumentType(categories[0].value);
    }
  }, [categories, documentType]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validação de tamanho (25MB)
      if (file.size > 25 * 1024 * 1024) {
        onError('Arquivo muito grande. Tamanho máximo: 25MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !customTitle.trim()) {
      onError('Por favor, preencha o título e selecione um arquivo');
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('documentType', documentType);
      formData.append('userCpf', cpf);
      formData.append('customTitle', customTitle.trim());

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer upload do documento');
      }

      const result = await response.json();
      
      // Adicionar documento com título personalizado
      const doc = result.data || result.document;
      const newDoc = {
        id: doc.id || `doc-${Date.now()}`,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        documentType: documentType,
        uploadedAt: new Date(),
        url: doc.url || doc.signedUrl,
        filePath: doc.filePath || doc.id,
        customTitle: customTitle.trim()
      };

      onDocumentAdded(newDoc);
      
      // Resetar campos
      setCustomTitle('');
      setSelectedFile(null);
      
      // Resetar input de arquivo
      const fileInput = document.getElementById('custom-doc-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      onError('Erro ao fazer upload do documento');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Título do Documento */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          Título do Documento *
        </label>
        <input
          type="text"
          value={customTitle}
          onChange={(e) => setCustomTitle(e.target.value)}
          placeholder="Ex: Certidão de Matrícula - Fazenda São João"
          maxLength={100}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      {/* Categoria do Documento */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          Categoria do Documento *
        </label>
        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Upload do Arquivo */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          Arquivo *
        </label>
        <div className="flex items-center space-x-3">
          <label className="flex-1 cursor-pointer">
            <div className={`border-2 border-dashed ${selectedFile ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 hover:border-blue-400 dark:border-gray-600'} rounded-lg p-4 text-center transition-all`}>
              <input
                id="custom-doc-upload"
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="hidden"
              />
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
              {selectedFile ? (
                <div>
                  <p className="text-gray-900 dark:text-white font-medium text-sm">{selectedFile.name}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 text-sm">Clique para selecionar arquivo</p>
              )}
            </div>
          </label>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
          Formatos aceitos: PDF, JPG, PNG, DOC, DOCX (máx. 25MB)
        </p>
      </div>

      {/* Botão Adicionar */}
      <button
        type="button"
        onClick={handleUpload}
        disabled={!selectedFile || !customTitle.trim() || uploading}
        className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
          selectedFile && customTitle.trim() && !uploading
            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg transform hover:scale-105'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700'
        }`}
      >
        {uploading ? (
          <>
            <LoadingSpinner size="sm" />
            <span>Enviando...</span>
          </>
        ) : (
          <>
            <Plus className="w-5 h-5" />
            <span>Adicionar Documento</span>
          </>
        )}
      </button>
    </div>
  );
}

