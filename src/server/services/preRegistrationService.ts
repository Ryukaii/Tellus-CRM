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

  // Criar pré-cadastro a partir de dados do formulário
  static async createPreRegistrationFromForm(sessionId: string, formData: any): Promise<PreRegistration> {
    try {
      // Criar o pré-cadastro com os dados fornecidos (já como completo)
      const preRegistration = await database.createPreRegistration(sessionId, {
        currentStep: 1,
        isCompleted: true, // Já criar como completo
        personalData: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          cpf: formData.cpf,
          rg: formData.rg,
          birthDate: formData.birthDate,
          maritalStatus: formData.maritalStatus
        },
        addressData: formData.address,
        professionalData: {
          profession: formData.profession,
          employmentType: formData.employmentType,
          monthlyIncome: formData.monthlyIncome,
          companyName: formData.personalCompanyName || formData.companyName
        },
        spouseData: formData.hasSpouse ? {
          name: formData.spouseName,
          cpf: formData.spouseCpf,
          rg: formData.spouseRg,
          birthDate: formData.spouseBirthDate,
          profession: formData.spouseProfession,
          employmentType: formData.spouseEmploymentType,
          monthlyIncome: formData.spouseMonthlyIncome,
          companyName: formData.spouseCompanyName
        } : null,
        companyData: formData.hasCompany ? {
          cnpj: formData.companyCnpj,
          name: formData.companyName,
          address: formData.companyAddress
        } : null,
        govData: {
          password: formData.govPassword,
          hasTwoFactorDisabled: formData.hasTwoFactorDisabled
        },
        notes: formData.notes,
        type: formData.type,
        source: formData.source
      });

      return preRegistration as PreRegistration;
    } catch (error) {
      console.error('Error creating pre-registration from form:', error);
      throw new Error('Erro ao criar pré-cadastro');
    }
  }

  // Atualizar progresso do pré-cadastro
  static async updatePreRegistration(sessionId: string, data: any): Promise<PreRegistration> {
    try {
      console.log(`[DEBUG] updatePreRegistration called for sessionId: ${sessionId}`);
      console.log(`[DEBUG] Update data:`, data);
      
      const updatedPreRegistration = await database.updatePreRegistration(sessionId, data);
      console.log(`[DEBUG] Database update result:`, updatedPreRegistration ? 'SUCCESS' : 'FAILED');
      
      if (!updatedPreRegistration) {
        console.log(`[DEBUG] Updated pre-registration is null/undefined`);
        throw new Error('Pré-cadastro não encontrado');
      }

      console.log(`[DEBUG] Returning updated pre-registration`);
      return updatedPreRegistration as PreRegistration;
    } catch (error) {
      console.error('[DEBUG] Error updating pre-registration:', error);
      console.error('[DEBUG] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
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
      let nextStep = currentStep + 1;
      
      // Se a próxima etapa seria a 4 (que foi removida), pular para a 5
      if (nextStep === 4) {
        nextStep = 5;
      }
      
      // Atualiza os dados da etapa atual e avança para a próxima
      const updateData = {
        ...stepData,
        currentStep: nextStep,
        updatedAt: new Date(),
        lastAccessedAt: new Date()
      };

      // Se chegou na última etapa, marca como completo
      if (nextStep > 8) {
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
      console.log(`[DEBUG] previousStep called for sessionId: ${sessionId}`);
      
      const currentPreRegistration = await database.findPreRegistrationBySessionId(sessionId);
      console.log(`[DEBUG] Found pre-registration:`, currentPreRegistration ? 'YES' : 'NO');
      
      if (!currentPreRegistration) {
        console.log(`[DEBUG] Pre-registration not found for sessionId: ${sessionId}`);
        throw new Error('Pré-cadastro não encontrado');
      }

      const currentStep = currentPreRegistration.currentStep || 1;
      console.log(`[DEBUG] Current step: ${currentStep}`);
      
      let previousStep = Math.max(1, currentStep - 1);
      console.log(`[DEBUG] Calculated previous step: ${previousStep}`);
      
      // Se a etapa anterior seria a 4 (que foi removida), pular para a 3
      if (previousStep === 4) {
        previousStep = 3;
        console.log(`[DEBUG] Skipping removed step 4, going to step 3`);
      }
      
      // Se a etapa atual é maior que 8 (nova estrutura), ajustar para 8
      if (currentStep > 8) {
        previousStep = 8;
        console.log(`[DEBUG] Current step > 8, adjusting to step 8`);
      }
      
      console.log(`[DEBUG] Final previous step: ${previousStep}`);
      
      // Apenas atualizar a etapa atual, mantendo todos os dados existentes
      const updateData = {
        currentStep: previousStep,
        isCompleted: false,
        updatedAt: new Date(),
        lastAccessedAt: new Date()
      };

      console.log(`[DEBUG] Update data:`, updateData);
      
      // Usar update direto no banco para evitar problemas com o método updatePreRegistration
      const result = await database.updatePreRegistration(sessionId, updateData);
      console.log(`[DEBUG] Update result:`, result ? 'SUCCESS' : 'FAILED');
      
      if (!result) {
        console.log(`[DEBUG] Update failed, returning current pre-registration with updated step`);
        // Se o update falhou, retornar o pré-cadastro atual com a etapa atualizada
        return {
          ...currentPreRegistration,
          currentStep: previousStep,
          isCompleted: false,
          updatedAt: new Date(),
          lastAccessedAt: new Date()
        } as PreRegistration;
      }
      
      return result;
    } catch (error) {
      console.error('[DEBUG] Error going to previous step:', error);
      console.error('[DEBUG] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
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
