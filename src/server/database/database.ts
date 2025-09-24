import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import { DATABASE_CONFIG } from './config.js';

class MongoDatabase {
  private client: MongoClient;
  private db: Db | null = null;
  private isConnected = false;
  private connectionPromise: Promise<void>;

  constructor() {
    this.client = new MongoClient(DATABASE_CONFIG.mongodb.uri);
    this.connectionPromise = this.init();
  }

  private async init() {
    try {
      await this.client.connect();
      this.db = this.client.db(DATABASE_CONFIG.mongodb.dbName);
      this.isConnected = true;

      // Create indexes for better performance
      const customersCollection = this.db.collection('customers');
      await customersCollection.createIndex({ email: 1 }, { unique: true });
      await customersCollection.createIndex({ cpf: 1 }, { unique: true });
      await customersCollection.createIndex({ name: 1 });
      await customersCollection.createIndex({ 'address.city': 1 });
      await customersCollection.createIndex({ 'address.state': 1 });

      // Create users collection indexes
      const usersCollection = this.db.collection('users');
      await usersCollection.createIndex({ email: 1 }, { unique: true });

      // Create leads collection indexes
      const leadsCollection = this.db.collection('leads');
      await leadsCollection.createIndex({ email: 1 });
      await leadsCollection.createIndex({ cpf: 1 });
      await leadsCollection.createIndex({ status: 1 });
      await leadsCollection.createIndex({ createdAt: -1 });

      // Create pre-registrations collection indexes
      const preRegistrationsCollection = this.db.collection('preRegistrations');
      await preRegistrationsCollection.createIndex({ sessionId: 1 }, { unique: true });
      await preRegistrationsCollection.createIndex({ currentStep: 1 });
      await preRegistrationsCollection.createIndex({ isCompleted: 1 });
      await preRegistrationsCollection.createIndex({ createdAt: -1 });
      await preRegistrationsCollection.createIndex({ lastAccessedAt: -1 });

      console.log('MongoDB database initialized successfully');
    } catch (error) {
      console.error('Error initializing MongoDB database:', error);
      throw error;
    }
  }

  private ensureConnected() {
    if (!this.isConnected || !this.db) {
      throw new Error('Database not connected');
    }
  }

  // Método público para aguardar a conexão
  async waitForConnection(): Promise<void> {
    await this.connectionPromise;
  }

  getCollection(name: string): Collection {
    this.ensureConnected();
    return this.db!.collection(name);
  }

  // Customer-specific methods
  async createCustomer(customerData: any): Promise<any> {
    this.ensureConnected();
    const collection = this.getCollection('customers');
    
    const customer = {
      ...customerData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(customer);
    return { ...customer, _id: result.insertedId };
  }

  async findCustomerById(id: string): Promise<any | null> {
    this.ensureConnected();
    const collection = this.getCollection('customers');
    
    console.log('🔍 [DATABASE] Buscando cliente por ID:', { 
      id,
      idType: typeof id,
      idLength: id.length,
      isValidObjectId: ObjectId.isValid(id)
    });
    
    // Verificar se o ID é válido para ObjectId
    if (!ObjectId.isValid(id)) {
      console.error('❌ [DATABASE] ID inválido para ObjectId:', { id });
      return null;
    }
    
    try {
      const objectId = new ObjectId(id);
      console.log('🔍 [DATABASE] ObjectId criado:', { objectId: objectId.toString() });
      
      const result = await collection.findOne({ _id: objectId });
      
      if (result) {
        console.log('✅ [DATABASE] Cliente encontrado:', { 
          _id: result._id,
          name: result.name 
        });
      } else {
        console.log('❌ [DATABASE] Cliente não encontrado para ObjectId:', { 
          id,
          objectId: objectId.toString()
        });
        
        // Vamos também tentar listar alguns documentos para debug
        const sampleDocs = await collection.find({}).limit(3).toArray();
        console.log('📋 [DATABASE] Primeiros 3 clientes no banco:', 
          sampleDocs.map(doc => ({ _id: doc._id, name: doc.name }))
        );
      }
      
      return result;
    } catch (error) {
      console.error('❌ [DATABASE] Erro na query findCustomerById:', { id, error });
      throw error;
    }
  }

  async findCustomers(filter: any = {}, options: any = {}): Promise<any[]> {
    this.ensureConnected();
    const collection = this.getCollection('customers');
    
    const { skip = 0, limit = 20, sort = { createdAt: -1 } } = options;
    
    return await collection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  async countCustomers(filter: any = {}): Promise<number> {
    this.ensureConnected();
    const collection = this.getCollection('customers');
    return await collection.countDocuments(filter);
  }

  async updateCustomer(id: string, updateData: any): Promise<any | null> {
    this.ensureConnected();
    const collection = this.getCollection('customers');
    
    console.log('🔄 [DATABASE] Atualizando cliente:', {
      id,
      updateData,
      objectId: new ObjectId(id).toString()
    });
    
    try {
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            ...updateData, 
            updatedAt: new Date() 
          } 
        },
        { returnDocument: 'after' }
      );
      
      console.log('🔄 [DATABASE] Resultado da atualização:', {
        found: !!result,
        value: result ? { _id: result._id, name: result.name } : null
      });
      
      if (result) {
        console.log('✅ [DATABASE] Cliente atualizado com sucesso:', {
          _id: result._id,
          name: result.name
        });
        return result;
      } else {
        console.error('❌ [DATABASE] findOneAndUpdate não retornou resultado');
        return null;
      }
    } catch (error) {
      console.error('❌ [DATABASE] Erro na atualização:', { id, error });
      throw error;
    }
  }

  async deleteCustomer(id: string): Promise<boolean> {
    this.ensureConnected();
    const collection = this.getCollection('customers');
    
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  // User-specific methods
  async findUserByEmail(email: string): Promise<any | null> {
    this.ensureConnected();
    const collection = this.getCollection('users');
    return await collection.findOne({ email });
  }

  async findUserById(id: string): Promise<any | null> {
    this.ensureConnected();
    const collection = this.getCollection('users');
    return await collection.findOne({ _id: new ObjectId(id) });
  }

  async createUser(userData: any): Promise<any> {
    this.ensureConnected();
    const collection = this.getCollection('users');
    
    const user = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(user);
    return { ...user, _id: result.insertedId };
  }

  // Lead-specific methods
  async createLead(leadData: any): Promise<any> {
    this.ensureConnected();
    const collection = this.getCollection('leads');
    
    const lead = {
      ...leadData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(lead);
    return { ...lead, _id: result.insertedId };
  }

  async findLeads(filter: any = {}, options: any = {}): Promise<any[]> {
    this.ensureConnected();
    const collection = this.getCollection('leads');
    
    const { skip = 0, limit = 20, sort = { createdAt: -1 } } = options;
    
    return await collection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  async countLeads(filter: any = {}): Promise<number> {
    this.ensureConnected();
    const collection = this.getCollection('leads');
    return await collection.countDocuments(filter);
  }

  async findLeadById(id: string): Promise<any | null> {
    this.ensureConnected();
    const collection = this.getCollection('leads');
    return await collection.findOne({ _id: new ObjectId(id) });
  }

  async updateLead(id: string, updateData: any): Promise<any | null> {
    this.ensureConnected();
    const collection = this.getCollection('leads');
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...updateData, 
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );
    
    return result ? result.value : null;
  }

  async deleteLead(id: string): Promise<boolean> {
    this.ensureConnected();
    const collection = this.getCollection('leads');
    
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  // Pre-registration methods
  async createPreRegistration(sessionId: string): Promise<any> {
    this.ensureConnected();
    const collection = this.getCollection('preRegistrations');
    
    const preRegistration = {
      sessionId,
      currentStep: 1,
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastAccessedAt: new Date()
    };

    const result = await collection.insertOne(preRegistration);
    return { ...preRegistration, _id: result.insertedId };
  }

  async findPreRegistrationBySessionId(sessionId: string): Promise<any | null> {
    this.ensureConnected();
    const collection = this.getCollection('preRegistrations');
    return await collection.findOne({ sessionId });
  }

  async updatePreRegistration(sessionId: string, updateData: any): Promise<any | null> {
    this.ensureConnected();
    const collection = this.getCollection('preRegistrations');
    
    const result = await collection.findOneAndUpdate(
      { sessionId },
      { 
        $set: { 
          ...updateData, 
          updatedAt: new Date(),
          lastAccessedAt: new Date()
        } 
      },
      { returnDocument: 'after' }
    );
    
    return result?.value || null;
  }

  async deletePreRegistration(sessionId: string): Promise<boolean> {
    this.ensureConnected();
    const collection = this.getCollection('preRegistrations');
    
    const result = await collection.deleteOne({ sessionId });
    return result.deletedCount > 0;
  }

  async findPreRegistrations(filter: any = {}, options: any = {}): Promise<any[]> {
    this.ensureConnected();
    const collection = this.getCollection('preRegistrations');
    
    const { skip = 0, limit = 20, sort = { createdAt: -1 } } = options;
    
    return await collection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  async countPreRegistrations(filter: any = {}): Promise<number> {
    this.ensureConnected();
    const collection = this.getCollection('preRegistrations');
    return await collection.countDocuments(filter);
  }

  // Shareable Links methods
  async createShareableLink(shareableLink: any): Promise<any> {
    this.ensureConnected();
    const collection = this.getCollection('shareableLinks');
    
    const result = await collection.insertOne({
      ...shareableLink,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return { ...shareableLink, _id: result.insertedId };
  }

  async getShareableLinkById(linkId: string): Promise<any | null> {
    this.ensureConnected();
    const collection = this.getCollection('shareableLinks');
    
    const shareableLink = await collection.findOne({ id: linkId });
    return shareableLink;
  }

  async getShareableLinksByUser(userId: string, page: number = 1, limit: number = 10): Promise<any[]> {
    this.ensureConnected();
    const collection = this.getCollection('shareableLinks');
    
    const skip = (page - 1) * limit;
    
    const shareableLinks = await collection
      .find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return shareableLinks;
  }

  async incrementShareableLinkAccess(linkId: string): Promise<void> {
    this.ensureConnected();
    const collection = this.getCollection('shareableLinks');
    
    await collection.updateOne(
      { id: linkId },
      { 
        $inc: { accessCount: 1 },
        $set: { lastAccessedAt: new Date() }
      }
    );
  }

  async deactivateShareableLink(linkId: string): Promise<void> {
    this.ensureConnected();
    const collection = this.getCollection('shareableLinks');
    
    await collection.updateOne(
      { id: linkId },
      { 
        $set: { 
          isActive: false,
          deactivatedAt: new Date()
        }
      }
    );
  }

  async cleanupExpiredShareableLinks(): Promise<number> {
    this.ensureConnected();
    const collection = this.getCollection('shareableLinks');
    
    const result = await collection.deleteMany({
      $or: [
        { expiresAt: { $lt: new Date() } },
        { isActive: false }
      ]
    });

    return result.deletedCount;
  }

  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
    }
  }
}

export const database = new MongoDatabase();
