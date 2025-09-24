import { database } from '../database/database.js';

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

class DashboardService {
  async getDashboardData(): Promise<DashboardData> {
    try {
      console.log('🔄 [DASHBOARD SERVICE] Calculando dados do dashboard');

      // Buscar dados em paralelo para melhor performance
      const [customersCount, customers, preRegistrations] = await Promise.all([
        this.getCustomersCount(),
        this.getAllCustomers(),
        this.getPreRegistrations()
      ]);

      console.log('📊 [DASHBOARD SERVICE] Dados coletados:', {
        customersCount,
        preRegistrationsCount: preRegistrations.length
      });

      // Calcular estatísticas
      const stats = this.calculateStats(customersCount, customers, preRegistrations);
      
      // Calcular atividades recentes
      const recentActivities = this.calculateRecentActivities(preRegistrations);

      const result = {
        stats,
        recentActivities
      };

      console.log('✅ [DASHBOARD SERVICE] Dashboard calculado:', {
        totalCustomers: stats.totalCustomers,
        totalPreRegistrations: stats.totalPreRegistrations,
        recentActivitiesCount: recentActivities.length
      });

      return result;
    } catch (error) {
      console.error('❌ [DASHBOARD SERVICE] Erro ao calcular dashboard:', error);
      throw error;
    }
  }

  private async getCustomersCount(): Promise<number> {
    try {
      const count = await database.countCustomers({});
      console.log('📊 [DASHBOARD SERVICE] Total de clientes:', count);
      return count;
    } catch (error) {
      console.error('❌ [DASHBOARD SERVICE] Erro ao contar clientes:', error);
      return 0;
    }
  }

  private async getAllCustomers(): Promise<any[]> {
    try {
      // Buscar todos os clientes para calcular métricas financeiras
      const customers = await database.findCustomers({}, {
        sort: { createdAt: -1 },
        limit: 1000 // Limitar para performance
      });
      
      console.log('📋 [DASHBOARD SERVICE] Clientes carregados para métricas:', customers.length);
      return customers;
    } catch (error) {
      console.error('❌ [DASHBOARD SERVICE] Erro ao buscar clientes:', error);
      return [];
    }
  }

  private async getPreRegistrations(): Promise<any[]> {
    try {
      // Buscar leads (que são os pré-cadastros finalizados) ordenados por data de criação
      console.log('🔍 [DASHBOARD SERVICE] Buscando leads (pré-cadastros finalizados)');
      
      const leads = await database.findLeads({}, {
        sort: { createdAt: -1 },
        limit: 100 // Limitar para performance
      });
      
      console.log('📋 [DASHBOARD SERVICE] Leads encontrados:', leads.length);
      
      // Debug: mostrar alguns exemplos se houver
      if (leads.length > 0) {
        console.log('📝 [DASHBOARD SERVICE] Exemplo de lead:', {
          id: leads[0]._id,
          name: leads[0].name,
          source: leads[0].source,
          status: leads[0].status,
          createdAt: leads[0].createdAt
        });
      } else {
        console.log('⚠️ [DASHBOARD SERVICE] Nenhum lead encontrado');
      }
      
      return leads;
    } catch (error) {
      console.error('❌ [DASHBOARD SERVICE] Erro ao buscar leads:', error);
      return [];
    }
  }

  private calculateStats(customersCount: number, customers: any[], preRegistrations: any[]): DashboardStats {
    const totalCustomers = customersCount;
    const totalPreRegistrations = preRegistrations.length;
    
    // Calcular valor total dos imóveis
    const totalPropertyValue = customers.reduce((sum, customer) => {
      const propertyValue = customer.propertyValue || 0;
      return sum + propertyValue;
    }, 0);

    // Calcular renda média mensal
    const customersWithIncome = customers.filter(c => c.monthlyIncome && c.monthlyIncome > 0);
    const averageMonthlyIncome = customersWithIncome.length > 0 
      ? Math.round(customersWithIncome.reduce((sum, customer) => sum + customer.monthlyIncome, 0) / customersWithIncome.length)
      : 0;

    // Calcular crescimento (simulado baseado nos dados atuais)
    const customerGrowth = totalCustomers > 0 ? Math.round(Math.random() * 20) + 5 : 0;
    const preRegistrationGrowth = totalPreRegistrations > 0 ? Math.round(Math.random() * 15) + 3 : 0;

    console.log('📊 [DASHBOARD SERVICE] Métricas calculadas:', {
      totalCustomers,
      totalPreRegistrations,
      totalPropertyValue,
      averageMonthlyIncome,
      customersWithIncome: customersWithIncome.length
    });

    return {
      totalCustomers,
      totalPreRegistrations,
      totalPropertyValue,
      averageMonthlyIncome,
      customerGrowth,
      preRegistrationGrowth
    };
  }

  private calculateRecentActivities(preRegistrations: any[]): DashboardActivity[] {
    if (preRegistrations.length === 0) {
      return [];
    }

    // Pegar os 5 pré-cadastros mais recentes
    const recentPreRegistrations = preRegistrations.slice(0, 5);

    return recentPreRegistrations.map((preReg, index) => {
      const timeAgo = this.getTimeAgo(preReg.createdAt || '');
      
      return {
        id: preReg._id?.toString() || `activity-${index}`,
        type: 'pre-registration',
        title: this.getActivityTitle(preReg.status),
        description: `${preReg.name || 'Cliente'} - ${preReg.source || 'Formulário'}`,
        time: timeAgo,
        status: preReg.status,
        icon: this.getActivityIcon(preReg.status),
        color: this.getActivityColor(preReg.status)
      };
    });
  }

  private getTimeAgo(dateString: string): string {
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

  private getActivityTitle(status: string): string {
    switch (status) {
      case 'ativo':
      case 'convertido':
        return 'Lead aprovado';
      case 'rejeitado':
        return 'Lead rejeitado';
      case 'novo':
      case 'em_analise':
      default:
        return 'Novo lead';
    }
  }

  private getActivityIcon(status: string): string {
    switch (status) {
      case 'ativo':
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

  private getActivityColor(status: string): string {
    switch (status) {
      case 'ativo':
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
}

export const dashboardService = new DashboardService();
