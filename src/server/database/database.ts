import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import { DATABASE_CONFIG } from './config.js';

class MongoDatabase {
  private client: MongoClient;
  private db: Db | null = null;
  private isConnected = false;

  constructor() {
    this.client = new MongoClient(DATABASE_CONFIG.mongodb.uri);
    this.init();
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
    return await collection.findOne({ _id: new ObjectId(id) });
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

  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
    }
  }
}

export const database = new MongoDatabase();
