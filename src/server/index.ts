import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import customersRouter from './routes/customers.js';
import authRouter from './routes/auth.js';
import leadsRouter from './routes/leads.js';
import preRegistrationRouter from './routes/preRegistration.js';
import sharingRouter from './routes/sharing.js';
import dashboardRouter from './routes/dashboard.js';
import { database } from './database/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "blob:"],
      connectSrc: [
        "'self'", 
        "http://localhost:3001", 
        "https://*.supabase.co",
        "https://consulta.fontesderenda.blog",
        "https://viacep.com.br"
      ],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB connection is handled in database.ts

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/customers', customersRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/pre-registration', preRegistrationRouter);
app.use('/api/sharing', sharingRouter);
app.use('/api/dashboard', dashboardRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ 
    success: true, 
    message: 'Tellures CRM API is running',
    timestamp: new Date().toISOString()
  });
});

// Public form routes
app.get('/cadastro', (_req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(__dirname, '../client/public-form.html'));
  } else {
    // In development, redirect to Vite dev server
    res.redirect('http://localhost:3000/public-form.html');
  }
});

app.get('/cadastro/agro', (_req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(__dirname, '../client/public-form.html'));
  } else {
    res.redirect('http://localhost:3000/public-form.html?form=agro');
  }
});

app.get('/cadastro/credito', (_req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(__dirname, '../client/public-form.html'));
  } else {
    res.redirect('http://localhost:3000/public-form.html?form=credito');
  }
});

app.get('/cadastro/consultoria', (_req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(__dirname, '../client/public-form.html'));
  } else {
    res.redirect('http://localhost:3000/public-form.html?form=consultoria');
  }
});

app.get('/cadastro/creditoimobiliario', (_req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(__dirname, '../client/public-form.html'));
  } else {
    res.redirect('http://localhost:3000/public-form.html?form=creditoimobiliario');
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const clientPath = path.join(__dirname, '../client');
  app.use(express.static(clientPath));
  
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
  });
}

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor'
  });
});

// Função para iniciar o servidor após conectar ao MongoDB
async function startServer() {
  try {
    console.log('🔄 Conectando ao MongoDB...');
    
    // Aguarda a conexão com o MongoDB
    await database.waitForConnection();
    
    console.log('✅ MongoDB conectado com sucesso!');
    
    // Inicia o servidor
    app.listen(PORT, () => {
      console.log(`🚀 Tellures CRM Server running on port ${PORT}`);
      console.log(`📊 API available at http://localhost:${PORT}/api`);
      console.log(`🏥 Health check at http://localhost:${PORT}/api/health`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao conectar com MongoDB:', error);
    console.error('🛑 Servidor não foi iniciado devido a falha na conexão com o banco de dados');
    process.exit(1);
  }
}

// Inicia o servidor
startServer();
