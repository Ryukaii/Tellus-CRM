const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface ExistingCustomerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  processes: string[]; // Array de tipos de processo: ['agro', 'credito', 'consultoria', 'credito_imobiliario']
  hasCompleteData: boolean;
  missingDocuments?: string[];
}

export interface CPFValidationResult {
  exists: boolean;
  customerData?: ExistingCustomerData;
  canProceed: boolean;
  message?: string;
}

export class CPFValidationService {
  /**
   * Verifica se um CPF já existe no sistema
   */
  static async validateCPF(cpf: string, currentProcessType: string): Promise<CPFValidationResult> {
    try {
      const cleanCPF = cpf.replace(/\D/g, '');
      
      if (cleanCPF.length !== 11) {
        return {
          exists: false,
          canProceed: false,
          message: 'CPF deve ter 11 dígitos'
        };
      }

      const response = await fetch(`${API_BASE_URL}/customers/check-cpf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          cpf: cleanCPF,
          processType: currentProcessType 
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao verificar CPF');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error validating CPF:', error);
      return {
        exists: false,
        canProceed: true,
        message: 'Erro ao verificar CPF. Tente novamente.'
      };
    }
  }

  /**
   * Busca dados completos de um cliente existente
   */
  static async getExistingCustomerData(cpf: string): Promise<ExistingCustomerData | null> {
    try {
      const cleanCPF = cpf.replace(/\D/g, '');
      
      const response = await fetch(`${API_BASE_URL}/customers/by-cpf/${cleanCPF}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return null;
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error getting existing customer data:', error);
      return null;
    }
  }

  /**
   * Adiciona um novo processo a um cliente existente
   */
  static async addProcessToExistingCustomer(cpf: string, processType: string): Promise<boolean> {
    try {
      const cleanCPF = cpf.replace(/\D/g, '');
      
      const response = await fetch(`${API_BASE_URL}/customers/add-process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          cpf: cleanCPF,
          processType: processType 
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error adding process to existing customer:', error);
      return false;
    }
  }
}
