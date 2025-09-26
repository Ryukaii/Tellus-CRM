import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Mail, Phone, MapPin, Building, DollarSign, 
  Calendar, Heart, FileText, Share2, Edit, Trash2, Eye,
  AlertCircle, CheckCircle, Clock, Download, Loader2, Upload
} from 'lucide-react';
import { Button } from '../UI/Button';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { Modal } from '../UI/Modal';
import { DocumentViewer, DocumentListViewer } from '../UI/DocumentViewer';
import { ShareCustomerModal } from './ShareCustomerModal';
import { CustomerDocumentManager } from './CustomerDocumentManager';
import { CustomerUploadLinkModal } from './CustomerUploadLinkModal';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  rg?: string;
  birthDate?: string;
  maritalStatus?: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  profession?: string;
  employmentType?: string;
  monthlyIncome?: number;
  companyName?: string;
  propertyValue?: number;
  propertyType?: string;
  propertyCity?: string;
  propertyState?: string;
  uploadedDocuments?: Array<{
    id: string;
    fileName: string;
    fileType: string;
    documentType: string;
    uploadedAt: string;
    url: string;
  }>;
  notes?: string;
  status: string;
  source?: string;
  createdAt: string;
  updatedAt?: string;
}

export const CustomerDetailsPage: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUploadLinkModal, setShowUploadLinkModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [documents, setDocuments] = useState<Array<{
    id: string;
    fileName: string;
    fileType: string;
    documentType: string;
    uploadedAt: string;
    url: string;
  }>>([]);

  useEffect(() => {
    if (customerId) {
      loadCustomer(customerId);
    }
  }, [customerId]);

  const loadCustomer = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('tellus_token');
      const response = await fetch(`/api/customers/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Cliente não encontrado');
      }

      const result = await response.json();
      setCustomer(result.data);
      
      // Carregar documentos se existirem
      if (result.data.uploadedDocuments) {
        setDocuments(result.data.uploadedDocuments);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/customers');
  };

  const handleDocumentsChange = (newDocuments: Array<{
    id: string;
    fileName: string;
    fileType: string;
    documentType: string;
    uploadedAt: string;
    url: string;
  }>) => {
    setDocuments(newDocuments);
    
    // Atualizar o objeto customer com os novos documentos
    if (customer) {
      setCustomer({
        ...customer,
        uploadedDocuments: newDocuments
      });
    }
  };

  const handleEdit = () => {
    navigate(`/customers/${customerId}/edit`);
  };

  const handleDelete = () => {
    if (!customer) return;
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!customer || !customerId) return;

    try {
      setDeleting(true);
      const token = localStorage.getItem('tellus_token');
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Cliente excluído com sucesso!');
        navigate('/customers');
      } else {
        throw new Error('Erro ao excluir cliente');
      }
    } catch (err) {
      alert('Erro ao excluir cliente');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800 border-green-200';
      case 'inativo': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pendente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'suspenso': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getSourceDisplayName = (source?: string) => {
    const sourceMap: Record<string, string> = {
      'lead_agro': 'Formulário Agro',
      'lead_credito': 'Formulário Crédito',
      'lead_consultoria': 'Formulário Consultoria',
      'lead_credito_imobiliario': 'Formulário Crédito Imobiliário',
      'lead_geral': 'Formulário Geral',
      'lead_aprovado': 'Lead Aprovado',
      'indicacao': 'Indicação',
      'site': 'Site',
      'redes_sociais': 'Redes Sociais',
      'anuncio': 'Anúncio',
      'outros': 'Outros'
    };
    
    return sourceMap[source || ''] || source || 'Não informado';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-background flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-dark-textSecondary">Carregando dados do cliente...</p>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-background flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-red-900/20">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2 dark:text-dark-text">
            Cliente não encontrado
          </h1>
          <p className="text-gray-600 mb-4 dark:text-dark-textSecondary">{error}</p>
          <Button onClick={handleGoBack}>
            Voltar para lista
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-background">
      {/* Header */}
      <div className="bg-white shadow-sm border-b dark:bg-dark-card dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6">
            {/* Mobile Layout */}
            <div className="block sm:hidden space-y-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handleGoBack}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </Button>
                
                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(customer.status)}`}>
                  {customer.status}
                </span>
              </div>
              
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-dark-text">
                  {customer.name}
                </h1>
                <p className="text-sm text-gray-600 dark:text-dark-textSecondary">
                  Cliente desde {formatDate(customer.createdAt)}
                </p>
              </div>

              {/* Mobile Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center justify-center space-x-2 text-sm"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Compartilhar</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowUploadLinkModal(true)}
                  className="flex items-center justify-center space-x-2 text-sm"
                >
                  <Upload className="w-4 h-4" />
                  <span>Link Upload</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleEdit}
                  className="flex items-center justify-center space-x-2 text-sm"
                >
                  <Edit className="w-4 h-4" />
                  <span>Editar</span>
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={handleDelete}
                className="w-full flex items-center justify-center space-x-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir</span>
              </Button>
            </div>

            {/* Desktop Layout */}
            <div className="hidden sm:flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={handleGoBack}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </Button>
                
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">
                    {customer.name}
                  </h1>
                  <p className="text-gray-600 dark:text-dark-textSecondary">
                    Cliente desde {formatDate(customer.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(customer.status)}`}>
                  {customer.status}
                </span>
                
                <Button
                  variant="outline"
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center space-x-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Compartilhar</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowUploadLinkModal(true)}
                  className="flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Link Upload</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleEdit}
                  className="flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Editar</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleDelete}
                  className="flex items-center space-x-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Excluir</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-8">
            {/* Dados Pessoais */}
            <div className="bg-white rounded-lg shadow-sm border dark:bg-dark-card dark:border-dark-border">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b dark:border-dark-border">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center dark:text-dark-text">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-500 dark:text-dark-accent" />
                  Dados Pessoais
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-dark-textSecondary">Nome Completo</label>
                    <p className="text-gray-900 dark:text-dark-text">{customer.name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-dark-textSecondary">CPF</label>
                    <p className="text-gray-900 font-mono dark:text-dark-text">{customer.cpf}</p>
                  </div>

                  {customer.rg && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-dark-textSecondary">RG</label>
                      <p className="text-gray-900 font-mono dark:text-dark-text">{customer.rg}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-dark-textSecondary">Email</label>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400 dark:text-dark-textMuted" />
                      <a 
                        href={`mailto:${customer.email}`}
                        className="text-blue-600 hover:text-blue-700 dark:text-dark-accent dark:hover:text-dark-accentLight"
                      >
                        {customer.email}
                      </a>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-dark-textSecondary">Telefone</label>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400 dark:text-dark-textMuted" />
                      <a 
                        href={`tel:${customer.phone}`}
                        className="text-blue-600 hover:text-blue-700 dark:text-dark-accent dark:hover:text-dark-accentLight"
                      >
                        {customer.phone}
                      </a>
                    </div>
                  </div>

                  {customer.birthDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-dark-textSecondary">Data de Nascimento</label>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400 dark:text-dark-textMuted" />
                        <span className="text-gray-900 dark:text-dark-text">{formatDate(customer.birthDate)}</span>
                      </div>
                    </div>
                  )}

                  {customer.maritalStatus && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-dark-textSecondary">Estado Civil</label>
                      <div className="flex items-center space-x-2">
                        <Heart className="w-4 h-4 text-gray-400 dark:text-dark-textMuted" />
                        <span className="text-gray-900 capitalize dark:text-dark-text">{customer.maritalStatus}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Endereço */}
            {customer.address && (
              <div className="bg-white rounded-lg shadow-sm border dark:bg-dark-card dark:border-dark-border">
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b dark:border-dark-border">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center dark:text-dark-text">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-500 dark:text-green-400" />
                    Endereço
                  </h2>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-dark-textSecondary">Logradouro</label>
                      <p className="text-gray-900 dark:text-dark-text">
                        {customer.address.street}, {customer.address.number}
                        {customer.address.complement && ` - ${customer.address.complement}`}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-dark-textSecondary">Bairro</label>
                      <p className="text-gray-900 dark:text-dark-text">{customer.address.neighborhood}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-dark-textSecondary">CEP</label>
                      <p className="text-gray-900 font-mono dark:text-dark-text">{customer.address.zipCode}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-dark-textSecondary">Cidade</label>
                      <p className="text-gray-900 dark:text-dark-text">{customer.address.city}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-dark-textSecondary">Estado</label>
                      <p className="text-gray-900 dark:text-dark-text">{customer.address.state}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Dados Profissionais */}
            <div className="bg-white rounded-lg shadow-sm border dark:bg-dark-card dark:border-dark-border">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b dark:border-dark-border">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center dark:text-dark-text">
                  <Building className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-500 dark:text-purple-400" />
                  Dados Profissionais
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {customer.profession && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-dark-textSecondary">Profissão</label>
                      <p className="text-gray-900 dark:text-dark-text">{customer.profession}</p>
                    </div>
                  )}

                  {customer.employmentType && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-dark-textSecondary">Tipo de Emprego</label>
                      <p className="text-gray-900 capitalize dark:text-dark-text">{customer.employmentType.replace('_', ' ')}</p>
                    </div>
                  )}

                  {customer.monthlyIncome && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-dark-textSecondary">Renda Mensal</label>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-gray-400 dark:text-dark-textMuted" />
                        <span className="text-gray-900 font-semibold dark:text-dark-text">
                          {formatCurrency(customer.monthlyIncome)}
                        </span>
                      </div>
                    </div>
                  )}

                  {customer.companyName && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-dark-textSecondary">Empresa</label>
                      <p className="text-gray-900 dark:text-dark-text">{customer.companyName}</p>
                    </div>
                  )}

                  {customer.propertyValue && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-dark-textSecondary">Valor do Imóvel</label>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-gray-400 dark:text-dark-textMuted" />
                        <span className="text-gray-900 font-semibold dark:text-dark-text">
                          {formatCurrency(customer.propertyValue)}
                        </span>
                      </div>
                    </div>
                  )}

                  {customer.propertyType && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-dark-textSecondary">Tipo do Imóvel</label>
                      <p className="text-gray-900 capitalize dark:text-dark-text">{customer.propertyType}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Documentos */}
            <div className="bg-white rounded-lg shadow-sm border dark:bg-dark-card dark:border-dark-border">
              <div className="p-4 sm:p-6">
                <CustomerDocumentManager
                  customerId={customerId || ''}
                  customerCpf={customer.cpf}
                  documents={documents}
                  onDocumentsChange={handleDocumentsChange}
                  readOnly={false}
                />
              </div>
            </div>

            {/* Observações */}
            {customer.notes && (
              <div className="bg-white rounded-lg shadow-sm border dark:bg-dark-card dark:border-dark-border">
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b dark:border-dark-border">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-dark-text">Observações</h2>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap text-sm sm:text-base dark:text-dark-textSecondary">{customer.notes}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Informações Rápidas */}
            <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 dark:bg-dark-card dark:border-dark-border">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 dark:text-dark-text">Informações Rápidas</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-dark-textSecondary">Status</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(customer.status)}`}>
                    {customer.status}
                  </span>
                </div>

                {customer.source && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-dark-textSecondary">Origem</span>
                    <span className="text-sm font-medium text-gray-900 capitalize dark:text-dark-text">
                      {customer.source.replace('_', ' ')}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-dark-textSecondary">Cadastrado em</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-dark-text">
                    {formatDate(customer.createdAt)}
                  </span>
                </div>

                {customer.updatedAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-dark-textSecondary">Última atualização</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-dark-text">
                      {formatDate(customer.updatedAt)}
                    </span>
                  </div>
                )}

                {customer.uploadedDocuments && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-dark-textSecondary">Documentos</span>
                    <div className="flex items-center space-x-1">
                      <FileText className="w-4 h-4 text-green-500 dark:text-green-400" />
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        {customer.uploadedDocuments.length}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 dark:bg-dark-card dark:border-dark-border">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 dark:text-dark-text">Ações Rápidas</h3>
              
              <div className="space-y-2 sm:space-y-3">
                <Button
                  onClick={() => setShowShareModal(true)}
                  className="w-full flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Compartilhar Cliente</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleEdit}
                  className="w-full flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <Edit className="w-4 h-4" />
                  <span>Editar Dados</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => window.print()}
                  className="w-full flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <Download className="w-4 h-4" />
                  <span>Imprimir/Exportar</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Compartilhamento */}
      <ShareCustomerModal
        customer={customer}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onShared={(shareableLink) => {
          const shareUrl = `${window.location.origin}/shared/${shareableLink.id}`;
          navigator.clipboard.writeText(shareUrl);
          alert('Link de compartilhamento copiado para a área de transferência!');
        }}
      />

      {/* Modal de Link de Upload */}
      {customer && (
        <CustomerUploadLinkModal
          customerId={customer.id}
          customerName={customer.name}
          isOpen={showUploadLinkModal}
          onClose={() => setShowUploadLinkModal(false)}
          onLinkCreated={(link) => {
            console.log('Link de upload criado:', link);
          }}
        />
      )}

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        title="Confirmar Exclusão"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 dark:bg-red-900/20">
              <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text">
                Excluir cliente
              </h3>
              <p className="text-sm text-gray-600 mt-1 dark:text-dark-textSecondary">
                Tem certeza que deseja excluir o cliente{' '}
                <span className="font-medium text-gray-900 dark:text-dark-text">
                  "{customer?.name}"
                </span>?
              </p>
              <p className="text-xs text-red-600 mt-2 dark:text-red-400">
                ⚠️ Esta ação não pode ser desfeita. Todos os dados do cliente, incluindo documentos, serão removidos permanentemente.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t dark:border-dark-border">
            <Button
              variant="outline"
              onClick={cancelDelete}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
              className="flex items-center space-x-2"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Excluindo...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Excluir</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
