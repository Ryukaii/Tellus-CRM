import { database } from '../database/database.js';
import { Customer, CustomerUpdate, CustomerFilters, CustomerResponse } from '../../shared/types/customer.js';

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

    console.log('🔄 [CUSTOMER SERVICE] getCustomers com filtros:', {
      search, city, state, page, limit, skip
    });

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

    console.log('🔍 [CUSTOMER SERVICE] Filtro MongoDB:', mongoFilter);

    // Get total count
    const total = await database.countCustomers(mongoFilter);
    console.log('📊 [CUSTOMER SERVICE] Total de clientes encontrados:', total);

    // Get customers with pagination
    const mongoCustomers = await database.findCustomers(mongoFilter, {
      skip,
      limit,
      sort: { createdAt: -1 }
    });

    console.log('📋 [CUSTOMER SERVICE] Clientes encontrados:', {
      count: mongoCustomers.length,
      customers: mongoCustomers.map(c => ({ _id: c._id, name: c.name }))
    });

    const customers = mongoCustomers.map(customer => this.mapMongoToCustomer(customer));

    const result = {
      customers,
      total,
      page,
      limit
    };

    console.log('✅ [CUSTOMER SERVICE] Resultado final:', {
      customersCount: result.customers.length,
      total: result.total,
      page: result.page,
      limit: result.limit
    });

    return result;
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    try {
      console.log('🔍 [CUSTOMER SERVICE] Buscando cliente por ID:', { id });
      
      const mongoCustomer = await database.findCustomerById(id);
      
      if (mongoCustomer) {
        console.log('✅ [CUSTOMER SERVICE] Cliente encontrado no banco:', { 
          _id: mongoCustomer._id,
          name: mongoCustomer.name 
        });
        return this.mapMongoToCustomer(mongoCustomer);
      } else {
        console.log('❌ [CUSTOMER SERVICE] Cliente não encontrado no banco:', { id });
        return null;
      }
    } catch (error) {
      console.error('❌ [CUSTOMER SERVICE] Erro ao buscar cliente:', { id, error });
      return null;
    }
  }

  async updateCustomer(id: string, customerData: CustomerUpdate): Promise<Customer | null> {
    try {
      console.log('🔄 [CUSTOMER SERVICE] Buscando cliente para atualização:', { id });
      
      const existing = await this.getCustomerById(id);
      if (!existing) {
        console.error('❌ [CUSTOMER SERVICE] Cliente não encontrado no banco:', { id });
        return null;
      }
      
      console.log('✅ [CUSTOMER SERVICE] Cliente encontrado:', { 
        id: existing.id,
        name: existing.name 
      });

      // Build update data
      const updateData: any = {};

      if (customerData.name !== undefined) updateData.name = customerData.name;
      if (customerData.email !== undefined) updateData.email = customerData.email;
      if (customerData.phone !== undefined) updateData.phone = customerData.phone;
      if (customerData.cpf !== undefined) updateData.cpf = customerData.cpf;
      if (customerData.rg !== undefined) updateData.rg = customerData.rg;
      if (customerData.birthDate !== undefined) updateData.birthDate = customerData.birthDate;
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
      if (customerData.govPassword !== undefined) updateData.govPassword = customerData.govPassword;
      if (customerData.notes !== undefined) updateData.notes = customerData.notes;

      // Handle address updates - merge with existing address
      if (customerData.address) {
        const existingAddress = existing.address || {};
        updateData.address = {
          street: customerData.address.street !== undefined ? customerData.address.street : existingAddress.street,
          number: customerData.address.number !== undefined ? customerData.address.number : existingAddress.number,
          complement: customerData.address.complement !== undefined ? customerData.address.complement : existingAddress.complement,
          neighborhood: customerData.address.neighborhood !== undefined ? customerData.address.neighborhood : existingAddress.neighborhood,
          city: customerData.address.city !== undefined ? customerData.address.city : existingAddress.city,
          state: customerData.address.state !== undefined ? customerData.address.state : existingAddress.state,
          zipCode: customerData.address.zipCode !== undefined ? customerData.address.zipCode : existingAddress.zipCode
        };
      }

      if (Object.keys(updateData).length === 0) {
        console.log('ℹ️ [CUSTOMER SERVICE] Nenhum campo para atualizar, retornando cliente existente');
        return existing;
      }

      console.log('🔄 [CUSTOMER SERVICE] Enviando dados para database.updateCustomer:', {
        id,
        updateDataKeys: Object.keys(updateData)
      });

      const result = await database.updateCustomer(id, updateData);
      
      console.log('🔄 [CUSTOMER SERVICE] Resultado do database.updateCustomer:', {
        hasResult: !!result,
        resultType: typeof result
      });

      if (result) {
        const mappedCustomer = this.mapMongoToCustomer(result);
        console.log('✅ [CUSTOMER SERVICE] Cliente mapeado com sucesso:', {
          id: mappedCustomer.id,
          name: mappedCustomer.name
        });
        return mappedCustomer;
      } else {
        console.error('❌ [CUSTOMER SERVICE] database.updateCustomer retornou null/undefined');
        return null;
      }
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
