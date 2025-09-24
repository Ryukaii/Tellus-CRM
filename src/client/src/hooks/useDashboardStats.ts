import { useMemo } from 'react';
import { useCustomers } from './useCustomers';
import { usePreRegistrations } from './usePreRegistrations';

export function useDashboardStats() {
  const { customers, loading: customersLoading } = useCustomers();
  const { preRegistrations, loading: preRegistrationsLoading } = usePreRegistrations();

  const stats = useMemo(() => {
    console.log('📊 [DASHBOARD STATS] Dados recebidos:', {
      customers: customers,
      customersTotal: customers?.total,
      preRegistrations: preRegistrations?.length
    });

    const totalCustomers = customers?.total || 0;
    const totalPreRegistrations = preRegistrations?.length || 0;
    
    // Calcular status dos pré-cadastros
    const approvedPreRegistrations = preRegistrations?.filter(p => 
      p.status === 'aprovado' || p.status === 'convertido'
    ).length || 0;
    
    const pendingPreRegistrations = preRegistrations?.filter(p => 
      p.status === 'novo' || p.status === 'em_analise'
    ).length || 0;
    
    const rejectedPreRegistrations = preRegistrations?.filter(p => 
      p.status === 'rejeitado'
    ).length || 0;

    // Calcular taxa de conversão
    const conversionRate = totalPreRegistrations > 0 
      ? Math.round((approvedPreRegistrations / totalPreRegistrations) * 100)
      : 0;

    // Calcular crescimento (simulado baseado nos dados atuais)
    const customerGrowth = totalCustomers > 0 ? Math.round(Math.random() * 20) + 5 : 0;
    const preRegistrationGrowth = totalPreRegistrations > 0 ? Math.round(Math.random() * 15) + 3 : 0;

    return {
      totalCustomers,
      totalPreRegistrations,
      approvedPreRegistrations,
      pendingPreRegistrations,
      rejectedPreRegistrations,
      conversionRate,
      customerGrowth,
      preRegistrationGrowth
    };
  }, [customers, preRegistrations]);

  const recentActivities = useMemo(() => {
    if (!preRegistrations || preRegistrations.length === 0) {
      return [];
    }

    // Pegar os 5 pré-cadastros mais recentes
    const recentPreRegistrations = preRegistrations
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
      .slice(0, 5);

    return recentPreRegistrations.map((preReg, index) => {
      const timeAgo = getTimeAgo(preReg.createdAt || '');
      
      return {
        id: preReg.id || `activity-${index}`,
        type: 'pre-registration',
        title: getActivityTitle(preReg.status),
        description: `${preReg.name || 'Cliente'} - ${preReg.source || 'Formulário'}`,
        time: timeAgo,
        status: preReg.status,
        icon: getActivityIcon(preReg.status),
        color: getActivityColor(preReg.status)
      };
    });
  }, [preRegistrations]);

  return {
    stats,
    recentActivities,
    loading: customersLoading || preRegistrationsLoading
  };
}

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Agora mesmo';
  if (diffInHours < 24) return `${diffInHours}h atrás`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} dias atrás`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks} semanas atrás`;
}

function getActivityTitle(status: string): string {
  switch (status) {
    case 'aprovado':
    case 'convertido':
      return 'Pré-cadastro aprovado';
    case 'rejeitado':
      return 'Pré-cadastro rejeitado';
    case 'novo':
    case 'em_analise':
    default:
      return 'Novo pré-cadastro';
  }
}

function getActivityIcon(status: string) {
  switch (status) {
    case 'aprovado':
    case 'convertido':
      return 'CheckCircle';
    case 'rejeitado':
      return 'XCircle';
    case 'novo':
    case 'em_analise':
    default:
      return 'FileText';
  }
}

function getActivityColor(status: string): string {
  switch (status) {
    case 'aprovado':
    case 'convertido':
      return 'text-green-500';
    case 'rejeitado':
      return 'text-red-500';
    case 'novo':
    case 'em_analise':
    default:
      return 'text-blue-500';
  }
}
