import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Phone, Mail, MapPin, FileText, Eye, Share2, 
  Search, Filter, ChevronRight, DollarSign, Calendar,
  Building, Heart, Trash2
} from 'lucide-react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';

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
    city: string;
    state: string;
    zipCode: string;
  };
  profession?: string;
  monthlyIncome?: number;
  companyName?: string;
  propertyValue?: number;
  propertyType?: string;
  uploadedDocuments?: Array<{
    id: string;
    fileName: string;
    documentType: string;
  }>;
  notes?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

interface CustomerListViewProps {
  customers: Customer[];
  loading?: boolean;
  onRefresh?: () => void;
  onDelete?: (customer: Customer) => void;
}

export const CustomerListView: React.FC<CustomerListViewProps> = ({
  customers,
  loading = false,
  onRefresh,
  onDelete
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Filtrar e ordenar clientes
  const filteredCustomers = customers
    .filter(customer => {
      const matchesSearch = 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.cpf.includes(searchTerm) ||
        customer.phone.includes(searchTerm);
      
      const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800';
      case 'inativo': return 'bg-gray-100 text-gray-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'suspenso': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleCustomerClick = (customerId: string) => {
    navigate(`/customers/${customerId}`);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border p-4 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="w-20 h-6 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Filtros */}
      <div className="bg-white rounded-lg border p-4 sm:p-6">
        <div className="space-y-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Clientes</h1>
            <p className="text-sm sm:text-base text-gray-600">
              {filteredCustomers.length} cliente{filteredCustomers.length !== 1 ? 's' : ''} encontrado{filteredCustomers.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          {/* Filtros - Mobile First */}
          <div className="space-y-3">
            {/* Busca - Full width on mobile */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>

            {/* Filtros em linha no mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Filtro de Status */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="all">Todos os status</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="pendente">Pendente</option>
                <option value="suspenso">Suspenso</option>
              </select>

              {/* Ordenação */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="name">Nome</option>
                <option value="createdAt">Data de cadastro</option>
                <option value="status">Status</option>
              </select>

              {/* Botão Atualizar */}
              {onRefresh && (
                <Button onClick={onRefresh} variant="outline" className="w-full sm:w-auto">
                  Atualizar
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Clientes */}
      <div className="space-y-4">
        {filteredCustomers.length === 0 ? (
          <div className="bg-white rounded-lg border p-12 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum cliente encontrado
            </h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Tente ajustar os filtros de busca'
                : 'Ainda não há clientes cadastrados'
              }
            </p>
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              onClick={() => handleCustomerClick(customer.id)}
              className="bg-white rounded-lg border hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <div className="p-4 sm:p-6">
                {/* Mobile Layout */}
                <div className="block sm:hidden">
                  <div className="flex items-start space-x-3 mb-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>

                    {/* Nome e Status */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                          {customer.name}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(customer.status)}`}>
                          {customer.status}
                        </span>
                      </div>
                      
                      {/* Informações principais no mobile */}
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span className="truncate">{customer.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span>{customer.phone}</span>
                        </div>
                        {customer.address && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span className="truncate">
                              {customer.address.city} - {customer.address.state}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ações Mobile */}
                    <div className="flex items-center space-x-1">
                      {onDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(customer);
                          }}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                          title="Excluir cliente"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Documentos Mobile */}
                  {customer.uploadedDocuments && customer.uploadedDocuments.length > 0 && (
                    <div className="flex items-center space-x-2 text-sm">
                      <FileText className="w-4 h-4 text-green-500" />
                      <span className="text-green-600 font-medium">
                        {customer.uploadedDocuments.length} documento{customer.uploadedDocuments.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:block">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>

                      {/* Informações Principais */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {customer.name}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(customer.status)}`}>
                            {customer.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                          {/* Contato */}
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="truncate">{customer.email}</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{customer.phone}</span>
                          </div>

                          {/* CPF */}
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span>{customer.cpf}</span>
                          </div>

                          {/* Localização */}
                          {customer.address && (
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="truncate">
                                {customer.address.city} - {customer.address.state}
                              </span>
                            </div>
                          )}

                          {/* Profissão */}
                          {customer.profession && (
                            <div className="flex items-center space-x-2">
                              <Building className="w-4 h-4 text-gray-400" />
                              <span className="truncate">{customer.profession}</span>
                            </div>
                          )}

                          {/* Renda */}
                          {customer.monthlyIncome && (
                            <div className="flex items-center space-x-2">
                              <DollarSign className="w-4 h-4 text-gray-400" />
                              <span>{formatCurrency(customer.monthlyIncome)}</span>
                            </div>
                          )}

                          {/* Estado Civil */}
                          {customer.maritalStatus && (
                            <div className="flex items-center space-x-2">
                              <Heart className="w-4 h-4 text-gray-400" />
                              <span className="capitalize">{customer.maritalStatus}</span>
                            </div>
                          )}

                          {/* Data de Cadastro */}
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>Cadastro: {formatDate(customer.createdAt)}</span>
                          </div>
                        </div>

                        {/* Documentos */}
                        {customer.uploadedDocuments && customer.uploadedDocuments.length > 0 && (
                          <div className="mt-3 flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-600 font-medium">
                              {customer.uploadedDocuments.length} documento{customer.uploadedDocuments.length !== 1 ? 's' : ''} anexado{customer.uploadedDocuments.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center space-x-2 ml-4">
                      {onDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(customer);
                          }}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                          title="Excluir cliente"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Estatísticas */}
      {filteredCustomers.length > 0 && (
        <div className="bg-white rounded-lg border p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Estatísticas</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">
                {filteredCustomers.length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Total</div>
            </div>
            
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {filteredCustomers.filter(c => c.status === 'ativo').length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Ativos</div>
            </div>
            
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-purple-600">
                {filteredCustomers.reduce((acc, c) => acc + (c.uploadedDocuments?.length || 0), 0)}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Documentos</div>
            </div>

            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-lg sm:text-2xl font-bold text-yellow-600">
                {formatCurrency(
                  filteredCustomers.reduce((acc, c) => acc + (c.monthlyIncome || 0), 0) / 
                  filteredCustomers.filter(c => c.monthlyIncome).length || 0
                )}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Renda Média</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
