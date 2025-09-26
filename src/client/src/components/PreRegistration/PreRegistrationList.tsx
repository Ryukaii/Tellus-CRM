import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  Search,
  Filter,
  Trash2
} from 'lucide-react';
import { PreRegistration } from '../../../../shared/types/preRegistration';
import { Lead } from '../../../../shared/types/lead';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { ConfirmationModal } from '../UI/ConfirmationModal';
import { RejectConfirmationModal } from '../UI/RejectConfirmationModal';

interface PreRegistrationListProps {
  preRegistrations: Lead[];
  loading: boolean;
  onApprove: (leadId: string) => Promise<void>;
  onReject: (leadId: string, reason?: string) => Promise<void>;
  onDelete: (leadId: string) => Promise<void>;
  onViewDetails: (lead: Lead) => void;
  onSearch: (search: string) => void;
  onFilterChange: (status: 'all' | 'approved' | 'pending') => void;
  onTypeChange: (type: 'all' | 'credito' | 'consultoria' | 'agro' | 'geral' | 'credito_imobiliario') => void;
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function PreRegistrationList({
  preRegistrations,
  loading,
  onApprove,
  onReject,
  onDelete,
  onViewDetails,
  onSearch,
  onFilterChange,
  onTypeChange,
  total,
  page,
  limit,
  onPageChange
}: PreRegistrationListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'credito' | 'consultoria' | 'agro' | 'geral' | 'credito_imobiliario'>('all');
  const [processingActions, setProcessingActions] = useState<Set<string>>(new Set());
  
  // Estados para modais de confirmação
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    type: 'approve' | 'delete';
    leadId: string;
    leadName: string;
  }>({
    isOpen: false,
    type: 'approve',
    leadId: '',
    leadName: ''
  });

  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean;
    leadId: string;
    leadName: string;
  }>({
    isOpen: false,
    leadId: '',
    leadName: ''
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const handleFilterChange = (newFilter: 'all' | 'approved' | 'pending') => {
    setFilter(newFilter);
    onFilterChange(newFilter);
  };

  const handleTypeChange = (newType: 'all' | 'credito' | 'consultoria' | 'agro' | 'geral' | 'credito_imobiliario') => {
    setTypeFilter(newType);
    onTypeChange(newType);
  };

  const handleAction = async (
    leadId: string, 
    action: () => Promise<void>
  ) => {
    setProcessingActions(prev => new Set(prev).add(leadId));
    try {
      await action();
    } finally {
      setProcessingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(leadId);
        return newSet;
      });
    }
  };

  const openConfirmationModal = (type: 'approve' | 'delete', leadId: string, leadName: string) => {
    setConfirmationModal({
      isOpen: true,
      type,
      leadId,
      leadName
    });
  };

  const openRejectModal = (leadId: string, leadName: string) => {
    setRejectModal({
      isOpen: true,
      leadId,
      leadName
    });
  };

  const closeConfirmationModal = () => {
    setConfirmationModal({
      isOpen: false,
      type: 'approve',
      leadId: '',
      leadName: ''
    });
  };

  const closeRejectModal = () => {
    setRejectModal({
      isOpen: false,
      leadId: '',
      leadName: ''
    });
  };

  const handleConfirmAction = async () => {
    const { type, leadId } = confirmationModal;
    
    try {
      switch (type) {
        case 'approve':
          await handleAction(leadId, () => onApprove(leadId));
          break;
        case 'delete':
          await handleAction(leadId, () => onDelete(leadId));
          break;
      }
      closeConfirmationModal();
    } catch (error) {
      console.error('Erro ao executar ação:', error);
    }
  };

  const handleRejectAction = async (reason?: string) => {
    const { leadId } = rejectModal;
    
    try {
      await handleAction(leadId, () => onReject(leadId, reason));
      closeRejectModal();
    } catch (error) {
      console.error('Erro ao rejeitar lead:', error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLeadType = (source: string) => {
    const typeMap: Record<string, string> = {
      'lead_credito': 'Crédito Pessoal',
      'lead_consultoria': 'Consultoria Financeira',
      'lead_agro': 'Crédito Rural',
      'lead_geral': 'Crédito Geral',
      'lead_credito_imobiliario': 'Crédito Imobiliário',
      'formulario_publico': 'Formulário Público'
    };
    return typeMap[source] || 'Tipo não identificado';
  };

  const getLeadTypeColor = (source: string) => {
    const colorMap: Record<string, string> = {
      'lead_credito': 'bg-blue-100 text-blue-800',
      'lead_consultoria': 'bg-purple-100 text-purple-800',
      'lead_agro': 'bg-green-100 text-green-800',
      'lead_geral': 'bg-gray-100 text-gray-800',
      'lead_credito_imobiliario': 'bg-indigo-100 text-indigo-800',
      'formulario_publico': 'bg-orange-100 text-orange-800'
    };
    return colorMap[source] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (lead: Lead) => {
    if (lead.status === 'aprovado' || lead.status === 'convertido') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Aprovado
        </span>
      );
    }
    
    if (lead.status === 'rejeitado') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Rejeitado
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        <Clock className="w-3 h-3 mr-1" />
        Novo
      </span>
    );
  };

  const getProgressPercentage = () => {
    return 100; // Todos os leads já estão 100% completos
  };

  const totalPages = Math.ceil(total / limit);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text">Leads de Pré-Cadastro</h2>
          <p className="text-sm text-gray-600 mt-1 dark:text-dark-textSecondary">
            {total} {total === 1 ? 'lead encontrado' : 'leads encontrados'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 dark:text-dark-textMuted" />
            <Input
              type="text"
              placeholder="Buscar por nome, email ou CPF..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>

          {/* Filtro de Status */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 dark:text-dark-textMuted" />
            <select
              value={filter}
              onChange={(e) => handleFilterChange(e.target.value as 'all' | 'approved' | 'pending')}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tellus-primary focus:border-transparent appearance-none bg-white dark:bg-dark-input dark:border-dark-inputBorder dark:text-dark-text dark:focus:ring-dark-accent dark:focus:border-dark-accent"
            >
              <option value="all">Todos os Status</option>
              <option value="approved">Aprovados</option>
              <option value="pending">Pendentes</option>
            </select>
          </div>

          {/* Filtro de Tipo */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 dark:text-dark-textMuted" />
            <select
              value={typeFilter}
              onChange={(e) => handleTypeChange(e.target.value as 'all' | 'credito' | 'consultoria' | 'agro' | 'geral' | 'credito_imobiliario')}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tellus-primary focus:border-transparent appearance-none bg-white dark:bg-dark-input dark:border-dark-inputBorder dark:text-dark-text dark:focus:ring-dark-accent dark:focus:border-dark-accent"
            >
              <option value="all">Todos os Tipos</option>
              <option value="credito">Crédito Pessoal</option>
              <option value="consultoria">Consultoria Financeira</option>
              <option value="agro">Crédito Rural</option>
              <option value="geral">Crédito Geral</option>
              <option value="credito_imobiliario">Crédito Imobiliário</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de pré-cadastros */}
      {preRegistrations.length === 0 ? (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400 dark:text-dark-textMuted" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-dark-text">Nenhum lead encontrado</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-dark-textSecondary">
            {searchTerm || filter !== 'all' 
              ? 'Tente ajustar os filtros de busca.' 
              : 'Os leads aparecerão aqui quando os pré-cadastros forem finalizados.'}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md dark:bg-dark-card dark:shadow-lg">
          <ul className="divide-y divide-gray-200 dark:divide-dark-border">
            {preRegistrations.map((lead) => {
              const isProcessing = processingActions.has(lead.id!);
              
              return (
                <li key={lead.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-tellus-primary rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 flex-wrap">
                            <p className="text-sm font-medium text-gray-900 truncate dark:text-dark-text">
                              {lead.name || 'Nome não informado'}
                            </p>
                            {getStatusBadge(lead)}
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getLeadTypeColor(lead.source)}`}>
                              {getLeadType(lead.source)}
                            </span>
                          </div>
                          
                          <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0">
                            {lead.email && (
                              <div className="flex items-center text-sm text-gray-500 dark:text-dark-textSecondary">
                                <Mail className="flex-shrink-0 mr-1.5 h-4 w-4 dark:text-dark-textMuted" />
                                {lead.email}
                              </div>
                            )}
                            {lead.phone && (
                              <div className="flex items-center text-sm text-gray-500 dark:text-dark-textSecondary">
                                <Phone className="flex-shrink-0 mr-1.5 h-4 w-4 dark:text-dark-textMuted" />
                                {lead.phone}
                              </div>
                            )}
                            {lead.address?.city && (
                              <div className="flex items-center text-sm text-gray-500 dark:text-dark-textSecondary">
                                <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 dark:text-dark-textMuted" />
                                {lead.address.city}, {lead.address.state}
                              </div>
                            )}
                          </div>
                          
                          {/* Barra de progresso */}
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1 dark:text-dark-textSecondary">
                              <span>Formulário Completo</span>
                              <span>{getProgressPercentage()}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-dark-surfaceLight">
                              <div 
                                className="bg-tellus-primary h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${getProgressPercentage()}%` }}
                              />
                            </div>
                          </div>
                          
                          <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-dark-textSecondary">
                            <Calendar className="flex-shrink-0 mr-1 h-3 w-3 dark:text-dark-textMuted" />
                            Criado em {formatDate(lead.createdAt)}
                            {lead.updatedAt && (
                              <span className="ml-2">• Atualizado: {formatDate(lead.updatedAt)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails(lead)}
                        disabled={isProcessing}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      {lead.status === 'novo' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openConfirmationModal('approve', lead.id!, lead.name || 'Lead')}
                            disabled={isProcessing}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openRejectModal(lead.id!, lead.name || 'Lead')}
                            disabled={isProcessing}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openConfirmationModal('delete', lead.id!, lead.name || 'Lead')}
                        disabled={isProcessing}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 dark:border-dark-border dark:bg-dark-card">
          <div className="flex flex-1 justify-between sm:hidden">
            <Button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page <= 1}
              variant="outline"
            >
              Anterior
            </Button>
            <Button
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              variant="outline"
            >
              Próxima
            </Button>
          </div>
          
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-dark-textSecondary">
                Mostrando <span className="font-medium">{Math.min((page - 1) * limit + 1, total)}</span> até{' '}
                <span className="font-medium">{Math.min(page * limit, total)}</span> de{' '}
                <span className="font-medium">{total}</span> resultados
              </p>
            </div>
            
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <Button
                  onClick={() => onPageChange(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  variant="outline"
                  className="rounded-r-none"
                >
                  Anterior
                </Button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + Math.max(1, page - 2);
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <Button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      variant={pageNum === page ? "primary" : "outline"}
                      className="rounded-none"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                <Button
                  onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  variant="outline"
                  className="rounded-l-none"
                >
                  Próxima
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmationModal}
        onConfirm={handleConfirmAction}
        title={getConfirmationTitle()}
        message={getConfirmationMessage()}
        confirmText={getConfirmationButtonText()}
        type={getConfirmationType()}
        isLoading={processingActions.has(confirmationModal.leadId)}
      />

      {/* Modal de Rejeição */}
      <RejectConfirmationModal
        isOpen={rejectModal.isOpen}
        onClose={closeRejectModal}
        onConfirm={handleRejectAction}
        leadName={rejectModal.leadName}
        isLoading={processingActions.has(rejectModal.leadId)}
      />
    </div>
  );

  function getConfirmationTitle() {
    switch (confirmationModal.type) {
      case 'approve':
        return 'Aprovar Lead';
      case 'delete':
        return 'Excluir Lead';
      default:
        return 'Confirmar Ação';
    }
  }

  function getConfirmationMessage() {
    const leadName = confirmationModal.leadName;
    switch (confirmationModal.type) {
      case 'approve':
        return `Tem certeza que deseja aprovar o lead "${leadName}"? Esta ação irá converter o lead em cliente.`;
      case 'delete':
        return `Tem certeza que deseja excluir permanentemente o lead "${leadName}"? Esta ação não pode ser desfeita.`;
      default:
        return 'Tem certeza que deseja executar esta ação?';
    }
  }

  function getConfirmationButtonText() {
    switch (confirmationModal.type) {
      case 'approve':
        return 'Aprovar';
      case 'delete':
        return 'Excluir';
      default:
        return 'Confirmar';
    }
  }

  function getConfirmationType() {
    switch (confirmationModal.type) {
      case 'approve':
        return 'success';
      case 'delete':
        return 'danger';
      default:
        return 'warning';
    }
  }
}
