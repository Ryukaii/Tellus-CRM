import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export interface DashboardStats {
  totalCustomers: number;
  totalPreRegistrations: number;
  totalPropertyValue: number;
  averageMonthlyIncome: number;
  customerGrowth: number;
  preRegistrationGrowth: number;
}

export interface DashboardActivity {
  id: string;
  type: 'customer' | 'pre-registration';
  title: string;
  description: string;
  time: string;
  status?: string;
  icon: string;
  color: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivities: DashboardActivity[];
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [USE DASHBOARD] Buscando dados do dashboard');
      
      const dashboardData = await apiService.getDashboardData();
      
      console.log('✅ [USE DASHBOARD] Dados recebidos:', {
        totalCustomers: dashboardData.stats.totalCustomers,
        totalPreRegistrations: dashboardData.stats.totalPreRegistrations,
        recentActivities: dashboardData.recentActivities.length
      });
      
      setData(dashboardData);
    } catch (err) {
      console.error('❌ [USE DASHBOARD] Erro ao carregar dados:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboardData
  };
}
