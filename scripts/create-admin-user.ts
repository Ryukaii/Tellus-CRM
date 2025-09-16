import bcrypt from 'bcryptjs';
import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://guilhermeryukaii:quebra2211cab@users.valzs.mongodb.net/telluscrm?retryWrites=true&w=majority&appName=users&authSource=admin&minPoolSize=0';
const DB_NAME = 'telluscrm';

async function createAdminUser() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Conectado ao MongoDB');
    
    const db = client.db(DB_NAME);
    const usersCollection = db.collection('users');
    
    // Verificar se já existe um usuário admin
    const existingUser = await usersCollection.findOne({ email: 'admin@tellus.com' });
    
    if (existingUser) {
      console.log('❌ Usuário admin já existe!');
      return;
    }
    
    // Criar hash da senha
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    // Criar usuário admin
    const adminUser = {
      name: 'Administrador Tellures',
      email: 'admin@tellus.com',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await usersCollection.insertOne(adminUser);
    
    console.log('✅ Usuário admin criado com sucesso!');
    console.log(`ID: ${result.insertedId}`);
    console.log('📧 Email: admin@tellus.com');
    console.log('🔒 Senha: admin123');
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
