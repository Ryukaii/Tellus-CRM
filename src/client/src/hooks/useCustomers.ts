import { useState, useEffect, useCallback, useMemo } from 'react';
import { Customer, CustomerFilters, CustomerResponse } from '../../../shared/types/customer';
import { apiService } from '../services/api';

export function useCustomers(filters: CustomerFilters = {}) {
  const [data, setData] = useState<CustomerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoizar os filtros para evitar re-renders desnecessários
  const memoizedFilters = useMemo(() => filters, [
    filters.search,
    filters.city,
    filters.state,
    filters.page,
    filters.limit
  ]);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getCustomers(memoizedFilters);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  }, [memoizedFilters]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const createCustomer = useCallback(async (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await apiService.createCustomer(customer);
      await fetchCustomers(); // Refresh list
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar cliente');
      return false;
    }
  }, [fetchCustomers]);

  const updateCustomer = useCallback(async (id: string, customer: Partial<Customer>) => {
    try {
      await apiService.updateCustomer(id, customer);
      await fetchCustomers(); // Refresh list
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar cliente');
      return false;
    }
  }, [fetchCustomers]);

  const deleteCustomer = useCallback(async (id: string) => {
    try {
      await apiService.deleteCustomer(id);
      await fetchCustomers(); // Refresh list
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar cliente');
      return false;
    }
  }, [fetchCustomers]);

  return {
    customers: data?.customers || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 20,
    loading,
    error,
    refetch: fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
}
