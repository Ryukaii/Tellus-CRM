import bcrypt from 'bcryptjs';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tellus-crm';
const DB_NAME = process.env.DB_NAME || 'telluscrm-dev';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@tellus.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Administrador Tellure';

async function createAdminUser() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Conectado ao MongoDB');
    
    const db = client.db(DB_NAME);
    const usersCollection = db.collection('users');
    
    // Verificar se já existe um usuário admin
    const existingUser = await usersCollection.findOne({ email: ADMIN_EMAIL });
    
    if (existingUser) {
      console.log('❌ Usuário admin já existe!');
      return;
    }
    
    // Criar hash da senha
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
    
    // Criar usuário admin
    const adminUser = {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await usersCollection.insertOne(adminUser);
    
    console.log('✅ Usuário admin criado com sucesso!');
    console.log(`ID: ${result.insertedId}`);
    console.log(`📧 Email: ${ADMIN_EMAIL}`);
    console.log(`🔒 Senha: ${ADMIN_PASSWORD}`);
    console.log('👤 Role: admin');
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error);
  } finally {
    await client.close();
    console.log('Conexão com MongoDB fechada');
  }
}

// Executar o script
createAdminUser().catch(console.error);
