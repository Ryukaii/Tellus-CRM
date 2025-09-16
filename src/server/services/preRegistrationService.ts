import { database } from '../database/database.js';
import { PreRegistration } from '../../shared/types/preRegistration.js';

export class PreRegistrationService {
  // Gerar ID único para sessão
  static generateSessionId(): string {
    return `pre_reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Criar ou buscar pré-cadastro existente
  static async getOrCreatePreRegistration(sessionId: string): Promise<PreRegistration> {
    try {
      // Primeiro tenta buscar se já existe
      let preRegistration = await database.findPreRegistrationBySessionId(sessionId);
      
      if (!preRegistration) {
        // Se não existe, cria um novo
        preRegistration = await database.createPreRegistration(sessionId);
      }

      return preRegistration as PreRegistration;
    } catch (error) {
      console.error('Error getting or creating pre-registration:', error);
      throw new Error('Erro ao acessar pré-cadastro');
    }
  }

  // Atualizar progresso do pré-cadastro
  static async updatePreRegistration(sessionId: string, data: any): Promise<PreRegistration> {
    try {
      const updatedPreRegistration = await database.updatePreRegistration(sessionId, data);
      
      if (!updatedPreRegistration) {
        throw new Error('Pré-cadastro não encontrado');
      }

      return updatedPreRegistration as PreRegistration;
    } catch (error) {
      console.error('Error updating pre-registration:', error);
      throw new Error('Erro ao salvar progresso do pré-cadastro');
    }
  }

  // Avançar para próxima etapa
  static async nextStep(sessionId: string, stepData: any): Promise<PreRegistration> {
    try {
      const currentPreRegistration = await database.findPreRegistrationBySessionId(sessionId);
      
      if (!currentPreRegistration) {
        throw new Error('Pré-cadastro não encontrado');
      }

      const currentStep = currentPreRegistration.currentStep || 1;
      const nextStep = currentStep + 1;
      
      // Atualiza os dados da etapa atual e avança para a próxima
      const updateData = {
        ...stepData,
        currentStep: nextStep,
        updatedAt: new Date(),
        lastAccessedAt: new Date()
      };

      // Se chegou na última etapa, marca como completo
      if (nextStep > 7) {
        updateData.isCompleted = true;
      }

      // Usar update direto no banco
      const updatedPreRegistration = await database.updatePreRegistration(sessionId, updateData);
      
      // Se não retornou resultado, buscar novamente
      if (!updatedPreRegistration) {
        const currentState = await database.findPreRegistrationBySessionId(sessionId);
        if (!currentState) {
          throw new Error('Erro ao atualizar pré-cadastro');
        }
        return currentState as PreRegistration;
      }

      return updatedPreRegistration as PreRegistration;
    } catch (error) {
      console.error('Error advancing to next step:', error);
      throw new Error('Erro ao avançar etapa');
    }
  }

  // Voltar para etapa anterior
  static async previousStep(sessionId: string): Promise<PreRegistration> {
    try {
      const currentPreRegistration = await database.findPreRegistrationBySessionId(sessionId);
      
      if (!currentPreRegistration) {
        throw new Error('Pré-cadastro não encontrado');
      }

      const currentStep = currentPreRegistration.currentStep || 1;
      const previousStep = Math.max(1, currentStep - 1);
      
      const updateData = {
        currentStep: previousStep,
        isCompleted: false
      };

      return await this.updatePreRegistration(sessionId, updateData);
    } catch (error) {
      console.error('Error going to previous step:', error);
      throw new Error('Erro ao voltar etapa');
    }
  }

  // Finalizar pré-cadastro (converter para lead)
  static async completePreRegistration(sessionId: string, source: string = 'formulario_publico'): Promise<any> {
    try {
      const preRegistration = await database.findPreRegistrationBySessionId(sessionId);
      
      if (!preRegistration) {
        throw new Error('Pré-cadastro não encontrado');
      }

      if (!preRegistration.isCompleted) {
        throw new Error('Pré-cadastro não está completo');
      }

      // Converte os dados do pré-cadastro para o formato de lead
      const leadData = {
        name: preRegistration.personalData?.name,
        email: preRegistration.personalData?.email,
        phone: preRegistration.personalData?.phone,
        cpf: preRegistration.personalData?.cpf,
        birthDate: preRegistration.personalData?.birthDate,
        maritalStatus: preRegistration.maritalStatus,
        address: preRegistration.address,
        profession: preRegistration.professionalData?.profession,
        employmentType: preRegistration.professionalData?.employmentType,
        monthlyIncome: preRegistration.professionalData?.monthlyIncome,
        companyName: preRegistration.professionalData?.companyName,
        propertyValue: preRegistration.propertyData?.propertyValue,
        propertyType: preRegistration.propertyData?.propertyType,
        propertyCity: preRegistration.propertyData?.propertyCity,
        propertyState: preRegistration.propertyData?.propertyState,
        hasSpouse: preRegistration.hasSpouse,
        spouseName: preRegistration.spouseName,
        spouseCpf: preRegistration.spouseCpf,
        hasRG: preRegistration.documents?.hasRG,
        hasCPF: preRegistration.documents?.hasCPF,
        hasAddressProof: preRegistration.documents?.hasAddressProof,
        hasIncomeProof: preRegistration.documents?.hasIncomeProof,
        hasMaritalStatusProof: preRegistration.documents?.hasMaritalStatusProof,
        hasCompanyDocs: preRegistration.documents?.hasCompanyDocs,
        hasTaxReturn: preRegistration.documents?.hasTaxReturn,
        uploadedDocuments: preRegistration.uploadedDocuments || [],
        hasBankStatements: preRegistration.documents?.hasBankStatements,
        notes: preRegistration.notes,
        status: 'novo',
        source: source
      };

      // Cria o lead
      const lead = await database.createLead(leadData);

      // Remove o pré-cadastro após conversão
      await database.deletePreRegistration(sessionId);

      return lead;
    } catch (error) {
      console.error('Error completing pre-registration:', error);
      throw new Error('Erro ao finalizar pré-cadastro');
    }
  }

  // Buscar pré-cadastros (para admin)
  static async getPreRegistrations(filters: any = {}, options: any = {}) {
    try {
      const preRegistrations = await database.findPreRegistrations(filters, options);
      const total = await database.countPreRegistrations(filters);
      
      return {
        preRegistrations,
        total,
        page: options.page || 1,
        limit: options.limit || 20
      };
    } catch (error) {
      console.error('Error getting pre-registrations:', error);
      throw new Error('Erro ao buscar pré-cadastros');
    }
  }
}
