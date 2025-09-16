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
  hasRG: boolean;
  hasCPF: boolean;
  hasAddressProof: boolean;
  hasIncomeProof: boolean;
  hasMaritalStatusProof: boolean;
  hasCompanyDocs?: boolean;
  hasTaxReturn?: boolean;
  hasBankStatements?: boolean;
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
      hasRG: mongoLead.hasRG,
      hasCPF: mongoLead.hasCPF,
      hasAddressProof: mongoLead.hasAddressProof,
      hasIncomeProof: mongoLead.hasIncomeProof,
      hasMaritalStatusProof: mongoLead.hasMaritalStatusProof,
      hasCompanyDocs: mongoLead.hasCompanyDocs,
      hasTaxReturn: mongoLead.hasTaxReturn,
      hasBankStatements: mongoLead.hasBankStatements,
      notes: mongoLead.notes,
      status: mongoLead.status as any,
      rejectionReason: mongoLead.rejectionReason,
      rejectedAt: mongoLead.rejectedAt?.toISOString(),
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
      hasRG: leadData.hasRG,
      hasCPF: leadData.hasCPF,
      hasAddressProof: leadData.hasAddressProof,
      hasIncomeProof: leadData.hasIncomeProof,
      hasMaritalStatusProof: leadData.hasMaritalStatusProof,
      hasCompanyDocs: leadData.hasCompanyDocs,
      hasTaxReturn: leadData.hasTaxReturn,
      hasBankStatements: leadData.hasBankStatements,
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
      return await database.deleteLead(id);
    } catch (error) {
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
