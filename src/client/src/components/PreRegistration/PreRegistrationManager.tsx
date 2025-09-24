import React, { useState } from 'react';
import { PreRegistration } from '../../../../shared/types/preRegistration';
import { usePreRegistrations } from '../../hooks/usePreRegistrations';
import { PreRegistrationList } from './PreRegistrationList';
import { PreRegistrationDetailsModal } from './PreRegistrationDetailsModal';

interface PreRegistrationManagerProps {
  className?: string;
}

export function PreRegistrationManager({ className = '' }: PreRegistrationManagerProps) {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: undefined as 'completed' | 'pending' | undefined,
    search: undefined as string | undefined,
    type: 'all' as 'all' | 'credito' | 'consultoria' | 'agro' | 'geral' | 'credito_imobiliario'
  });

  const [selectedPreRegistration, setSelectedPreRegistration] = useState<PreRegistration | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const {
    preRegistrations,
    total,
    page,
    limit,
    totalPages,
    loading,
    error,
    refetch,
    approvePreRegistration,
    rejectPreRegistration,
    deletePreRegistration
  } = usePreRegistrations(filters);

  const handleSearch = (search: string) => {
    setFilters(prev => ({
      ...prev,
      search: search || undefined,
      page: 1
    }));
  };

  const handleFilterChange = (status: 'all' | 'completed' | 'pending') => {
    setFilters(prev => ({
      ...prev,
      status: status === 'all' ? undefined : status,
      page: 1
    }));
  };

  const handleTypeChange = (type: 'all' | 'credito' | 'consultoria' | 'agro' | 'geral' | 'credito_imobiliario') => {
    setFilters(prev => ({
      ...prev,
      type,
      page: 1
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleViewDetails = (preRegistration: PreRegistration) => {
    setSelectedPreRegistration(preRegistration);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setSelectedPreRegistration(null);
    setIsDetailsModalOpen(false);
  };

  const handleApprove = async (sessionId: string) => {
    try {
      const success = await approvePreRegistration(sessionId);
      if (success) {
        // Mostrar notificação de sucesso
        console.log('Pré-cadastro aprovado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao aprovar pré-cadastro:', error);
    }
  };

  const handleReject = async (sessionId: string, reason?: string) => {
    try {
      const success = await rejectPreRegistration(sessionId, reason);
      if (success) {
        // Mostrar notificação de sucesso
        console.log('Pré-cadastro rejeitado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao rejeitar pré-cadastro:', error);
    }
  };

  const handleDelete = async (sessionId: string) => {
    try {
      const success = await deletePreRegistration(sessionId);
      if (success) {
        // Mostrar notificação de sucesso
        console.log('Pré-cadastro excluído com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao excluir pré-cadastro:', error);
    }
  };

  return (
    <div className={className}>
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-800">
          <p className="text-red-800 dark:text-red-200">{error}</p>
          <button
            onClick={refetch}
            className="mt-2 text-sm text-red-600 hover:text-red-500 underline dark:text-red-400 dark:hover:text-red-300"
          >
            Tentar novamente
          </button>
        </div>
      )}

      <PreRegistrationList
        preRegistrations={preRegistrations}
        loading={loading}
        onApprove={handleApprove}
        onReject={handleReject}
        onDelete={handleDelete}
        onViewDetails={handleViewDetails}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        onTypeChange={handleTypeChange}
        total={total}
        page={page}
        limit={limit}
        onPageChange={handlePageChange}
      />

      <PreRegistrationDetailsModal
        preRegistration={selectedPreRegistration}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        onApprove={handleApprove}
        onReject={handleReject}
        onDelete={handleDelete}
      />
    </div>
  );
}
