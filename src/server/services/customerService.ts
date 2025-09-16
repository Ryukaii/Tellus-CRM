import { database } from '../database/database.js';
import { Customer, CustomerFilters, CustomerResponse } from '../../shared/types/customer.js';

interface MongoCustomer {
  _id?: any;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  rg?: string;
  birthDate?: string;
  maritalStatus?: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  profession?: string;
  employmentType?: string;
  monthlyIncome?: number;
  companyName?: string;
  propertyValue?: number;
  propertyType?: string;
  propertyCity?: string;
  propertyState?: string;
  uploadedDocuments?: Array<{
    id: string;
    fileName: string;
    fileType: string;
    documentType: string;
    uploadedAt: string;
    url: string;
  }>;
  notes?: string;
  status?: string;
  source?: string;
  govPassword?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class CustomerService {
  private mapMongoToCustomer(mongoCustomer: MongoCustomer): Customer {
    return {
      id: mongoCustomer._id.toString(),
      name: mongoCustomer.name,
      email: mongoCustomer.email,
      phone: mongoCustomer.phone,
      cpf: mongoCustomer.cpf,
      rg: mongoCustomer.rg,
      birthDate: mongoCustomer.birthDate,
      maritalStatus: mongoCustomer.maritalStatus,
      address: mongoCustomer.address,
      profession: mongoCustomer.profession,
      employmentType: mongoCustomer.employmentType,
      monthlyIncome: mongoCustomer.monthlyIncome,
      companyName: mongoCustomer.companyName,
      propertyValue: mongoCustomer.propertyValue,
      propertyType: mongoCustomer.propertyType,
      propertyCity: mongoCustomer.propertyCity,
      propertyState: mongoCustomer.propertyState,
      uploadedDocuments: mongoCustomer.uploadedDocuments,
      notes: mongoCustomer.notes,
      status: mongoCustomer.status || 'ativo',
      source: mongoCustomer.source,
      govPassword: mongoCustomer.govPassword,
      createdAt: mongoCustomer.createdAt?.toISOString(),
      updatedAt: mongoCustomer.updatedAt?.toISOString()
    };
  }

  private mapCustomerToMongo(customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Omit<MongoCustomer, '_id' | 'createdAt' | 'updatedAt'> {
    return {
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone,
      cpf: customerData.cpf,
      rg: customerData.rg,
      birthDate: customerData.birthDate,
      maritalStatus: customerData.maritalStatus,
      address: customerData.address,
      profession: customerData.profession,
      employmentType: customerData.employmentType,
      monthlyIncome: customerData.monthlyIncome,
      companyName: customerData.companyName,
      propertyValue: customerData.propertyValue,
      propertyType: customerData.propertyType,
      propertyCity: customerData.propertyCity,
      propertyState: customerData.propertyState,
      uploadedDocuments: customerData.uploadedDocuments,
      notes: customerData.notes,
      status: customerData.status,
      source: customerData.source,
      govPassword: customerData.govPassword
    };
  }

  async createCustomer(customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    try {
      const mongoData = this.mapCustomerToMongo(customerData);
      const result = await database.createCustomer(mongoData);
      return this.mapMongoToCustomer(result);
    } catch (error: any) {
      if (error.code === 11000) {
        // Duplicate key error
        if (error.message.includes('email')) {
          throw new Error('UNIQUE constraint failed: customers.email');
        }
        if (error.message.includes('cpf')) {
          throw new Error('UNIQUE constraint failed: customers.cpf');
        }
      }
      throw error;
    }
  }

  async getCustomers(filters: CustomerFilters = {}): Promise<CustomerResponse> {
    const { search, city, state, page = 1, limit = 20 } = filters;
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

    if (city) {
      mongoFilter['address.city'] = { $regex: city, $options: 'i' };
    }

    if (state) {
      mongoFilter['address.state'] = state;
    }

    // Get total count
    const total = await database.countCustomers(mongoFilter);

    // Get customers with pagination
    const mongoCustomers = await database.findCustomers(mongoFilter, {
      skip,
      limit,
      sort: { createdAt: -1 }
    });

    const customers = mongoCustomers.map(customer => this.mapMongoToCustomer(customer));

    return {
      customers,
      total,
      page,
      limit
    };
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    try {
      const mongoCustomer = await database.findCustomerById(id);
      return mongoCustomer ? this.mapMongoToCustomer(mongoCustomer) : null;
    } catch (error) {
      return null;
    }
  }

  async updateCustomer(id: string, customerData: Partial<Customer>): Promise<Customer | null> {
    try {
      const existing = await this.getCustomerById(id);
      if (!existing) return null;

      // Build update data
      const updateData: any = {};

      if (customerData.name) updateData.name = customerData.name;
      if (customerData.email) updateData.email = customerData.email;
      if (customerData.phone) updateData.phone = customerData.phone;
      if (customerData.cpf) updateData.cpf = customerData.cpf;
      if (customerData.rg !== undefined) updateData.rg = customerData.rg;
      if (customerData.birthDate) updateData.birthDate = customerData.birthDate;
      if (customerData.maritalStatus !== undefined) updateData.maritalStatus = customerData.maritalStatus;
      if (customerData.profession !== undefined) updateData.profession = customerData.profession;
      if (customerData.employmentType !== undefined) updateData.employmentType = customerData.employmentType;
      if (customerData.monthlyIncome !== undefined) updateData.monthlyIncome = customerData.monthlyIncome;
      if (customerData.companyName !== undefined) updateData.companyName = customerData.companyName;
      if (customerData.propertyValue !== undefined) updateData.propertyValue = customerData.propertyValue;
      if (customerData.propertyType !== undefined) updateData.propertyType = customerData.propertyType;
      if (customerData.propertyCity !== undefined) updateData.propertyCity = customerData.propertyCity;
      if (customerData.propertyState !== undefined) updateData.propertyState = customerData.propertyState;
      if (customerData.uploadedDocuments !== undefined) updateData.uploadedDocuments = customerData.uploadedDocuments;
      if (customerData.status !== undefined) updateData.status = customerData.status;
      if (customerData.source !== undefined) updateData.source = customerData.source;
      if (customerData.govPassword) updateData.govPassword = customerData.govPassword;
      if (customerData.notes !== undefined) updateData.notes = customerData.notes;

      if (customerData.address) {
        updateData.address = {
          ...existing.address,
          ...customerData.address
        };
      }

      if (Object.keys(updateData).length === 0) {
        return existing;
      }

      const result = await database.updateCustomer(id, updateData);
      return result ? this.mapMongoToCustomer(result) : null;
    } catch (error: any) {
      if (error.code === 11000) {
        // Duplicate key error
        if (error.message.includes('email')) {
          throw new Error('UNIQUE constraint failed: customers.email');
        }
        if (error.message.includes('cpf')) {
          throw new Error('UNIQUE constraint failed: customers.cpf');
        }
      }
      throw error;
    }
  }

  async deleteCustomer(id: string): Promise<boolean> {
    try {
      return await database.deleteCustomer(id);
    } catch (error) {
      return false;
    }
  }

  async updateCustomerDocuments(id: string, documents: Array<{
    id: string;
    fileName: string;
    fileType: string;
    documentType: string;
    uploadedAt: string;
    url: string;
  }>): Promise<Customer | null> {
    try {
      const existing = await this.getCustomerById(id);
      if (!existing) return null;

      const updateData = {
        uploadedDocuments: documents
      };

      const result = await database.updateCustomer(id, updateData);
      return result ? this.mapMongoToCustomer(result) : null;
    } catch (error) {
      throw error;
    }
  }
}

export const customerService = new CustomerService();
