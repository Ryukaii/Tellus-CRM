import { useState, useEffect, useCallback } from 'react';
import { AdminPreRegistrationApi } from '../services/preRegistrationApi';
import { PreRegistration } from '../../../shared/types/preRegistration';
import { Lead } from '../../../shared/types/lead';

interface UsePreRegistrationsParams {
  page?: number;
  limit?: number;
  status?: 'approved' | 'pending';
  search?: string;
  type?: 'all' | 'credito' | 'consultoria' | 'agro' | 'geral' | 'credito_imobiliario';
}

interface UsePreRegistrationsReturn {
  preRegistrations: Lead[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  approvePreRegistration: (leadId: string) => Promise<boolean>;
  rejectPreRegistration: (leadId: string, reason?: string) => Promise<boolean>;
  deletePreRegistration: (leadId: string) => Promise<boolean>;
}

export function usePreRegistrations(params: UsePreRegistrationsParams = {}): UsePreRegistrationsReturn {
  const [preRegistrations, setPreRegistrations] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(params.page || 1);
  const [limit, setLimit] = useState(params.limit || 20);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPreRegistrations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await AdminPreRegistrationApi.getPreRegistrations({
        page: params.page || 1,
        limit: params.limit || 20,
        status: params.status,
        search: params.search,
        type: params.type
      });

      setPreRegistrations(result.preRegistrations);
      setTotal(result.total);
      setPage(result.page);
      setLimit(result.limit);
      setTotalPages(result.totalPages);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar pré-cadastros';
      setError(errorMessage);
      console.error('Error fetching pre-registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  const approvePreRegistration = useCallback(async (leadId: string): Promise<boolean> => {
    try {
      setError(null);
      await AdminPreRegistrationApi.approvePreRegistration(leadId);
      
      // Remover da lista local após aprovação
      setPreRegistrations(prev => prev.filter(pr => pr.id !== leadId));
      setTotal(prev => prev - 1);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao aprovar lead';
      setError(errorMessage);
      console.error('Error approving lead:', err);
      return false;
    }
  }, []);

  const rejectPreRegistration = useCallback(async (leadId: string, reason?: string): Promise<boolean> => {
    try {
      setError(null);
      const updatedLead = await AdminPreRegistrationApi.rejectPreRegistration(leadId, reason);
      
      // Atualizar na lista local
      setPreRegistrations(prev => 
        prev.map(pr => pr.id === leadId ? updatedLead : pr)
      );
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao rejeitar lead';
      setError(errorMessage);
      console.error('Error rejecting lead:', err);
      return false;
    }
  }, []);

  const deletePreRegistration = useCallback(async (leadId: string): Promise<boolean> => {
    try {
      setError(null);
      await AdminPreRegistrationApi.deletePreRegistration(leadId);
      
      // Remover da lista local
      setPreRegistrations(prev => prev.filter(pr => pr.id !== leadId));
      setTotal(prev => prev - 1);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir lead';
      setError(errorMessage);
      console.error('Error deleting lead:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchPreRegistrations();
  }, [params.page, params.limit, params.status, params.search, params.type]);

  return {
    preRegistrations,
    total,
    page,
    limit,
    totalPages,
    loading,
    error,
    refetch: fetchPreRegistrations,
    approvePreRegistration,
    rejectPreRegistration,
    deletePreRegistration
  };
}
