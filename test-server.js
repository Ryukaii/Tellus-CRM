import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função para ler variáveis do .env
function loadEnvVars() {
  const envPath = path.join(__dirname, '.env');
  const envVars = {};
  
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      }
    }
  } catch (error) {
    console.log('⚠️  Arquivo .env não encontrado. Usando valores padrão.');
  }
  
  return envVars;
}

const PORT = 8080;

const server = http.createServer((req, res) => {
  // Adicionar headers CORS para permitir requisições do frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (req.url === '/' || req.url === '/test-upload.html') {
    // Servir o arquivo de teste
    const filePath = path.join(__dirname, 'test-upload.html');
    
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Erro ao carregar o arquivo de teste');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
  } else if (req.url === '/api/config') {
    // Servir configurações do .env
    const envVars = loadEnvVars();
    const config = {
      supabaseUrl: envVars.VITE_SUPABASE_URL || '',
      supabaseKey: envVars.VITE_SUPABASE_ANON_KEY || '',
      hasConfig: !!(envVars.VITE_SUPABASE_URL && envVars.VITE_SUPABASE_ANON_KEY)
    };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(config));
  } else {
    // 404 para outras rotas
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Página não encontrada');
  }
});

server.listen(PORT, () => {
  console.log('🚀 Servidor de teste rodando!');
  console.log(`📍 Acesse: http://localhost:${PORT}`);
  console.log('');
  console.log('📋 Como usar:');
  console.log('1. Configure suas credenciais do Supabase');
  console.log('2. Selecione arquivos para teste');
  console.log('3. Clique em "Testar Upload"');
  console.log('4. Verifique os logs no navegador');
  console.log('');
  console.log('⚠️  Certifique-se de que:');
  console.log('- Supabase está configurado corretamente');
  console.log('- Bucket "pre-registration-documents" existe');
  console.log('- Políticas de upload estão ativas');
});
