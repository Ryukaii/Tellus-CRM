import { PreRegistration } from '../../../shared/types/preRegistration';
import { Lead } from '../../../shared/types/lead';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export class PreRegistrationApi {
  private static SESSION_KEY = 'tellus_pre_registration_session';

  // Gerar ou recuperar ID da sessão
  static getSessionId(): string {
    let sessionId = localStorage.getItem(this.SESSION_KEY);
    
    if (!sessionId) {
      sessionId = this.generateSessionId();
      localStorage.setItem(this.SESSION_KEY, sessionId);
    }
    
    return sessionId;
  }

  // Gerar novo ID de sessão
  static generateNewSessionId(): string {
    const sessionId = this.generateSessionId();
    localStorage.setItem(this.SESSION_KEY, sessionId);
    return sessionId;
  }

  // Limpar sessão
  static clearSession(): void {
    localStorage.removeItem(this.SESSION_KEY);
  }

  private static generateSessionId(): string {
    return `pre_reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Buscar ou criar pré-cadastro
  static async getOrCreatePreRegistration(): Promise<PreRegistration> {
    const sessionId = this.getSessionId();
    
    try {
      const response = await fetch(`${API_BASE_URL}/pre-registration/session/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar pré-cadastro');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error getting pre-registration:', error);
      throw error;
    }
  }

  // Atualizar pré-cadastro
  static async updatePreRegistration(data: Partial<PreRegistration>): Promise<PreRegistration> {
    const sessionId = this.getSessionId();
    
    try {
      const response = await fetch(`${API_BASE_URL}/pre-registration/session/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar pré-cadastro');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error updating pre-registration:', error);
      throw error;
    }
  }

  // Avançar para próxima etapa
  static async nextStep(stepData: any): Promise<PreRegistration> {
    const sessionId = this.getSessionId();
    
    try {
      const response = await fetch(`${API_BASE_URL}/pre-registration/session/${sessionId}/next`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stepData),
      });

      if (!response.ok) {
        throw new Error('Erro ao avançar etapa');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error advancing step:', error);
      throw error;
    }
  }

  // Voltar para etapa anterior
  static async previousStep(): Promise<PreRegistration> {
    const sessionId = this.getSessionId();
    
    try {
      const response = await fetch(`${API_BASE_URL}/pre-registration/session/${sessionId}/previous`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao voltar etapa');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error going to previous step:', error);
      throw error;
    }
  }

  // Salvar documentos upados
  static async saveDocuments(documents: any[]): Promise<PreRegistration> {
    const sessionId = this.getSessionId();
    
    try {
      const response = await fetch(`${API_BASE_URL}/pre-registration/session/${sessionId}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documents }),
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar documentos');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error saving documents:', error);
      throw error;
    }
  }

  // Finalizar pré-cadastro
  static async completePreRegistration(source: string = 'formulario_publico'): Promise<any> {
    const sessionId = this.getSessionId();
    
    try {
      const response = await fetch(`${API_BASE_URL}/pre-registration/session/${sessionId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ source }),
      });

      if (!response.ok) {
        throw new Error('Erro ao finalizar pré-cadastro');
      }

      const result = await response.json();
      
      // Limpa a sessão após finalizar
      this.clearSession();
      
      return result.data;
    } catch (error) {
      console.error('Error completing pre-registration:', error);
      throw error;
    }
  }
}

// ========== API ADMINISTRATIVA (para CRM) ==========

export class AdminPreRegistrationApi {
  private static API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  private static getAuthHeaders() {
    const token = localStorage.getItem('tellus_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  // Buscar todos os leads finalizados
  static async getPreRegistrations(params: {
    page?: number;
    limit?: number;
    status?: 'approved' | 'pending';
    search?: string;
  } = {}): Promise<{
    preRegistrations: Lead[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.status) queryParams.append('status', params.status);
      if (params.search) queryParams.append('search', params.search);

      const response = await fetch(`${this.API_BASE_URL}/pre-registration?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar pré-cadastros');
      }

      const result = await response.json();
      return {
        preRegistrations: result.data,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      };
    } catch (error) {
      console.error('Error getting pre-registrations:', error);
      throw error;
    }
  }

  // Buscar lead específico
  static async getPreRegistration(leadId: string): Promise<Lead> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/pre-registration/admin/${leadId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar lead');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error getting lead:', error);
      throw error;
    }
  }

  // Aprovar lead
  static async approvePreRegistration(leadId: string): Promise<any> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/pre-registration/${leadId}/approve`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Erro ao aprovar lead');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error approving lead:', error);
      throw error;
    }
  }

  // Rejeitar lead
  static async rejectPreRegistration(leadId: string, reason?: string): Promise<Lead> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/pre-registration/${leadId}/reject`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        throw new Error('Erro ao rejeitar lead');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error rejecting lead:', error);
      throw error;
    }
  }

  // Excluir lead
  static async deletePreRegistration(leadId: string): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/pre-registration/${leadId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir lead');
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
      throw error;
    }
  }
}
