import { database } from '../database/database.js';
import { Lead, LeadFilters, LeadResponse } from '../../shared/types/lead.js';

interface MongoLead {
  _id?: any;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  rg: string;
  birthDate: string;
  maritalStatus: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  profession: string;
  employmentType: string;
  monthlyIncome: number;
  companyName?: string;
  propertyValue: number;
  propertyType: string;
  propertyCity: string;
  propertyState: string;
  govPassword: string;
  hasTwoFactorDisabled: boolean;
  hasSpouse: boolean;
  spouseName?: string;
  spouseCpf?: string;
  spouseRg?: string;
  spouseBirthDate?: string;
  spouseProfession?: string;
  spouseEmploymentType?: string;
  spouseMonthlyIncome?: number;
  spouseCompanyName?: string;
  companyCnpj?: string;
  companyAddress?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  hasRG: boolean;
  hasCPF: boolean;
  hasAddressProof: boolean;
  hasIncomeProof: boolean;
  hasMaritalStatusProof: boolean;
  hasCompanyDocs?: boolean;
  hasContractSocial?: boolean;
  hasCNPJ?: boolean;
  hasTaxReturn?: boolean;
  hasBankStatements?: boolean;
  hasSpouseRG?: boolean;
  hasSpouseCPF?: boolean;
  hasSpouseAddressProof?: boolean;
  hasSpouseMaritalStatusProof?: boolean;
  hasSpouseIncomeProof?: boolean;
  hasSpouseTaxReturn?: boolean;
  hasSpouseBankStatements?: boolean;
  uploadedDocuments?: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    documentType: string;
    uploadedAt: string;
    url: string;
  }>;
  notes?: string;
  status: string;
  rejectionReason?: string;
  rejectedAt?: Date;
  source: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class LeadService {
  private mapMongoToLead(mongoLead: MongoLead): Lead {
    return {
      id: mongoLead._id.toString(),
      name: mongoLead.name,
      email: mongoLead.email,
      phone: mongoLead.phone,
      cpf: mongoLead.cpf,
      rg: mongoLead.rg,
      birthDate: mongoLead.birthDate,
      maritalStatus: mongoLead.maritalStatus as any,
      address: mongoLead.address,
      profession: mongoLead.profession,
      employmentType: mongoLead.employmentType as any,
      monthlyIncome: mongoLead.monthlyIncome,
      companyName: mongoLead.companyName,
      propertyValue: mongoLead.propertyValue,
      propertyType: mongoLead.propertyType as any,
      propertyCity: mongoLead.propertyCity,
      propertyState: mongoLead.propertyState,
      govPassword: mongoLead.govPassword,
      hasTwoFactorDisabled: mongoLead.hasTwoFactorDisabled,
      hasSpouse: mongoLead.hasSpouse,
      spouseName: mongoLead.spouseName,
      spouseCpf: mongoLead.spouseCpf,
      spouseRg: mongoLead.spouseRg,
      spouseBirthDate: mongoLead.spouseBirthDate,
      spouseProfession: mongoLead.spouseProfession,
      spouseEmploymentType: mongoLead.spouseEmploymentType as any,
      spouseMonthlyIncome: mongoLead.spouseMonthlyIncome,
      spouseCompanyName: mongoLead.spouseCompanyName,
      companyCnpj: mongoLead.companyCnpj,
      companyAddress: mongoLead.companyAddress,
      hasRG: mongoLead.hasRG,
      hasCPF: mongoLead.hasCPF,
      hasAddressProof: mongoLead.hasAddressProof,
      hasIncomeProof: mongoLead.hasIncomeProof,
      hasMaritalStatusProof: mongoLead.hasMaritalStatusProof,
      hasCompanyDocs: mongoLead.hasCompanyDocs,
      hasContractSocial: mongoLead.hasContractSocial,
      hasCNPJ: mongoLead.hasCNPJ,
      hasTaxReturn: mongoLead.hasTaxReturn,
      hasBankStatements: mongoLead.hasBankStatements,
      hasSpouseRG: mongoLead.hasSpouseRG,
      hasSpouseCPF: mongoLead.hasSpouseCPF,
      hasSpouseAddressProof: mongoLead.hasSpouseAddressProof,
      hasSpouseMaritalStatusProof: mongoLead.hasSpouseMaritalStatusProof,
      hasSpouseIncomeProof: mongoLead.hasSpouseIncomeProof,
      hasSpouseTaxReturn: mongoLead.hasSpouseTaxReturn,
      hasSpouseBankStatements: mongoLead.hasSpouseBankStatements,
      uploadedDocuments: mongoLead.uploadedDocuments,
      notes: mongoLead.notes,
      status: mongoLead.status as any,
      rejectionReason: mongoLead.rejectionReason,
      rejectedAt: mongoLead.rejectedAt instanceof Date 
        ? mongoLead.rejectedAt.toISOString() 
        : mongoLead.rejectedAt,
      source: mongoLead.source,
      createdAt: mongoLead.createdAt?.toISOString(),
      updatedAt: mongoLead.updatedAt?.toISOString()
    };
  }

  private mapLeadToMongo(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Omit<MongoLead, '_id' | 'createdAt' | 'updatedAt'> {
    return {
      name: leadData.name,
      email: leadData.email,
      phone: leadData.phone,
      cpf: leadData.cpf,
      rg: leadData.rg,
      birthDate: leadData.birthDate,
      maritalStatus: leadData.maritalStatus,
      address: leadData.address,
      profession: leadData.profession,
      employmentType: leadData.employmentType,
      monthlyIncome: leadData.monthlyIncome,
      companyName: leadData.companyName,
      propertyValue: leadData.propertyValue,
      propertyType: leadData.propertyType,
      propertyCity: leadData.propertyCity,
      propertyState: leadData.propertyState,
      govPassword: leadData.govPassword,
      hasTwoFactorDisabled: leadData.hasTwoFactorDisabled,
      hasSpouse: leadData.hasSpouse,
      spouseName: leadData.spouseName,
      spouseCpf: leadData.spouseCpf,
      spouseRg: leadData.spouseRg,
      spouseBirthDate: leadData.spouseBirthDate,
      spouseProfession: leadData.spouseProfession,
      spouseEmploymentType: leadData.spouseEmploymentType,
      spouseMonthlyIncome: leadData.spouseMonthlyIncome,
      spouseCompanyName: leadData.spouseCompanyName,
      companyCnpj: leadData.companyCnpj,
      companyAddress: leadData.companyAddress,
      hasRG: leadData.hasRG,
      hasCPF: leadData.hasCPF,
      hasAddressProof: leadData.hasAddressProof,
      hasIncomeProof: leadData.hasIncomeProof,
      hasMaritalStatusProof: leadData.hasMaritalStatusProof,
      hasCompanyDocs: leadData.hasCompanyDocs,
      hasContractSocial: leadData.hasContractSocial,
      hasCNPJ: leadData.hasCNPJ,
      hasTaxReturn: leadData.hasTaxReturn,
      hasBankStatements: leadData.hasBankStatements,
      hasSpouseRG: leadData.hasSpouseRG,
      hasSpouseCPF: leadData.hasSpouseCPF,
      hasSpouseAddressProof: leadData.hasSpouseAddressProof,
      hasSpouseMaritalStatusProof: leadData.hasSpouseMaritalStatusProof,
      hasSpouseIncomeProof: leadData.hasSpouseIncomeProof,
      hasSpouseTaxReturn: leadData.hasSpouseTaxReturn,
      hasSpouseBankStatements: leadData.hasSpouseBankStatements,
      uploadedDocuments: leadData.uploadedDocuments,
      notes: leadData.notes,
      status: leadData.status,
      source: leadData.source
    };
  }

  async createLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> {
    try {
      const mongoData = this.mapLeadToMongo(leadData);
      const result = await database.createLead(mongoData);
      return this.mapMongoToLead(result);
    } catch (error: any) {
      console.error('Error creating lead:', error);
      throw error;
    }
  }

  async getLeads(filters: LeadFilters = {}): Promise<LeadResponse> {
    const { search, status, city, state, employmentType, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    // Build MongoDB filter
    const mongoFilter: any = {};

    if (search) {
      mongoFilter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { cpf: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      mongoFilter.status = status;
    }

    if (city) {
      mongoFilter['address.city'] = { $regex: city, $options: 'i' };
    }

    if (state) {
      mongoFilter['address.state'] = state;
    }

    if (employmentType) {
      mongoFilter.employmentType = employmentType;
    }

    // Get total count
    const total = await database.countLeads(mongoFilter);

    // Get leads with pagination
    const mongoLeads = await database.findLeads(mongoFilter, {
      skip,
      limit,
      sort: { createdAt: -1 }
    });

    const leads = mongoLeads.map(lead => this.mapMongoToLead(lead));

    return {
      leads,
      total,
      page,
      limit
    };
  }

  async getLeadById(id: string): Promise<Lead | null> {
    try {
      const mongoLead = await database.findLeadById(id);
      return mongoLead ? this.mapMongoToLead(mongoLead) : null;
    } catch (error) {
      return null;
    }
  }

  async updateLead(id: string, leadData: Partial<Lead>): Promise<Lead | null> {
    try {
      const existing = await this.getLeadById(id);
      if (!existing) return null;

      // Build update data
      const updateData: any = {};

      Object.keys(leadData).forEach(key => {
        if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
          updateData[key] = (leadData as any)[key];
        }
      });

      if (Object.keys(updateData).length === 0) {
        return existing;
      }

      const result = await database.updateLead(id, updateData);
      return result ? this.mapMongoToLead(result) : null;
    } catch (error: any) {
      console.error('Error updating lead:', error);
      throw error;
    }
  }

  async deleteLead(id: string): Promise<boolean> {
    try {
      // Primeiro, obter os dados do lead para acessar os documentos
      const lead = await this.getLeadById(id);
      
      if (lead && lead.uploadedDocuments && lead.uploadedDocuments.length > 0) {
        // Importar funções do supabaseService
        const { deleteFiles, extractFilePathsFromDocuments } = await import('./supabaseService.js');
        
        // Extrair caminhos dos arquivos
        const filePaths = extractFilePathsFromDocuments(lead.uploadedDocuments);
        
        if (filePaths.length > 0) {
          console.log(`Deletando ${filePaths.length} arquivos do lead ${id}`);
          
          // Deletar arquivos do bucket
          const deleteResult = await deleteFiles(filePaths);
          
          if (deleteResult.success) {
            console.log(`${deleteResult.deletedCount} arquivos deletados do bucket com sucesso`);
          } else {
            console.warn('Alguns arquivos não puderam ser deletados do bucket:', deleteResult.errors);
          }
        }
      }
      
      // Deletar o lead do banco de dados
      return await database.deleteLead(id);
    } catch (error) {
      console.error('Error deleting lead:', error);
      return false;
    }
  }

  async convertLeadToCustomer(id: string): Promise<boolean> {
    try {
      const lead = await this.getLeadById(id);
      if (!lead) return false;

      // Update lead status to converted
      await this.updateLead(id, { status: 'convertido' });
      
      return true;
    } catch (error) {
      console.error('Error converting lead:', error);
      return false;
    }
  }
}

export const leadService = new LeadService();
