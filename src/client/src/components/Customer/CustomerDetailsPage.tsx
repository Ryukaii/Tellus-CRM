import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Mail, Phone, MapPin, Building, DollarSign, 
  Calendar, Heart, FileText, Share2, Edit, Trash2, Eye,
  AlertCircle, CheckCircle, Clock, Download
} from 'lucide-react';
import { Button } from '../UI/Button';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { Modal } from '../UI/Modal';
import { DocumentViewer, DocumentListViewer } from '../UI/DocumentViewer';
import { ShareCustomerModal } from './ShareCustomerModal';
import { CustomerDocumentManager } from './CustomerDocumentManager';

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
    navigate('/dashboard/customers');
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
    navigate(`/dashboard/customers/${customerId}/edit`);
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
        navigate('/dashboard/customers');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Carregando dados do cliente...</p>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Cliente não encontrado
          </h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleGoBack}>
            Voltar para lista
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
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
                <h1 className="text-2xl font-bold text-gray-900">
                  {customer.name}
                </h1>
                <p className="text-gray-600">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Dados Pessoais */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-500" />
                  Dados Pessoais
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                    <p className="text-gray-900">{customer.name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                    <p className="text-gray-900 font-mono">{customer.cpf}</p>
                  </div>

                  {customer.rg && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">RG</label>
                      <p className="text-gray-900 font-mono">{customer.rg}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a 
                        href={`mailto:${customer.email}`}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {customer.email}
                      </a>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a 
                        href={`tel:${customer.phone}`}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {customer.phone}
                      </a>
                    </div>
                  </div>

                  {customer.birthDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{formatDate(customer.birthDate)}</span>
                      </div>
                    </div>
                  )}

                  {customer.maritalStatus && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estado Civil</label>
                      <div className="flex items-center space-x-2">
                        <Heart className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900 capitalize">{customer.maritalStatus}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Endereço */}
            {customer.address && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-green-500" />
                    Endereço
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Logradouro</label>
                      <p className="text-gray-900">
                        {customer.address.street}, {customer.address.number}
                        {customer.address.complement && ` - ${customer.address.complement}`}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                      <p className="text-gray-900">{customer.address.neighborhood}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                      <p className="text-gray-900 font-mono">{customer.address.zipCode}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                      <p className="text-gray-900">{customer.address.city}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                      <p className="text-gray-900">{customer.address.state}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Dados Profissionais */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Building className="w-5 h-5 mr-2 text-purple-500" />
                  Dados Profissionais
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {customer.profession && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Profissão</label>
                      <p className="text-gray-900">{customer.profession}</p>
                    </div>
                  )}

                  {customer.employmentType && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Emprego</label>
                      <p className="text-gray-900 capitalize">{customer.employmentType.replace('_', ' ')}</p>
                    </div>
                  )}

                  {customer.monthlyIncome && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Renda Mensal</label>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900 font-semibold">
                          {formatCurrency(customer.monthlyIncome)}
                        </span>
                      </div>
                    </div>
                  )}

                  {customer.companyName && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                      <p className="text-gray-900">{customer.companyName}</p>
                    </div>
                  )}

                  {customer.propertyValue && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Valor do Imóvel</label>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900 font-semibold">
                          {formatCurrency(customer.propertyValue)}
                        </span>
                      </div>
                    </div>
                  )}

                  {customer.propertyType && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo do Imóvel</label>
                      <p className="text-gray-900 capitalize">{customer.propertyType}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Documentos */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
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
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">Observações</h2>
                </div>
                <div className="p-6">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{customer.notes}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Informações Rápidas */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Rápidas</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(customer.status)}`}>
                    {customer.status}
                  </span>
                </div>

                {customer.source && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Origem</span>
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {customer.source.replace('_', ' ')}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Cadastrado em</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(customer.createdAt)}
                  </span>
                </div>

                {customer.updatedAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Última atualização</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate(customer.updatedAt)}
                    </span>
                  </div>
                )}

                {customer.uploadedDocuments && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Documentos</span>
                    <div className="flex items-center space-x-1">
                      <FileText className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-green-600">
                        {customer.uploadedDocuments.length}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
              
              <div className="space-y-3">
                <Button
                  onClick={() => setShowShareModal(true)}
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Compartilhar Cliente</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleEdit}
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Editar Dados</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => window.print()}
                  className="w-full flex items-center justify-center space-x-2"
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

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        title="Confirmar Exclusão"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">
                Excluir cliente
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Tem certeza que deseja excluir o cliente{' '}
                <span className="font-medium text-gray-900">
                  "{customer?.name}"
                </span>?
              </p>
              <p className="text-xs text-red-600 mt-2">
                ⚠️ Esta ação não pode ser desfeita. Todos os dados do cliente, incluindo documentos, serão removidos permanentemente.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
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
