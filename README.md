# Tellure CRM

Um sistema de CRM personalizado desenvolvido para a marca Tellure, com interface moderna e campos específicos para gerenciamento de clientes.

## 🚀 Funcionalidades

- ✅ **Sistema de autenticação JWT** com login seguro
- ✅ **Página de login moderna** com design responsivo
- ✅ **Proteção de rotas** - acesso apenas para usuários autenticados
- ✅ Cadastro completo de clientes com validação
- ✅ Campos padrões: nome, email, telefone, CPF, data de nascimento
- ✅ Endereço completo (rua, número, complemento, bairro, cidade, estado, CEP)
- ✅ **Campo especial para senha gov.br**
- ✅ Campo de observações
- ✅ Busca avançada por nome, email ou CPF
- ✅ Listagem com paginação
- ✅ Edição e exclusão de clientes
- ✅ Interface moderna e responsiva
- ✅ Validação de dados em tempo real

## 🛠️ Tecnologias

### Backend
- **Node.js** com TypeScript
- **Express.js** para API REST
- **MongoDB** como banco de dados (MongoDB Atlas)
- **JWT** para autenticação e autorização
- **bcryptjs** para hash de senhas
- **Zod** para validação de dados
- **CORS** e **Helmet** para segurança

### Frontend
- **React 18** com TypeScript
- **Vite** para build e desenvolvimento
- **Tailwind CSS** para estilização
- **Lucide React** para ícones
- **Hooks customizados** para gerenciamento de estado

## 📦 Instalação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/Ryukaii/Tellus-CRM
   cd TellureCrm
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o ambiente de desenvolvimento:**
   ```bash
   npm run dev
   ```

   Este comando iniciará:
   - Backend na porta 3001
   - Frontend na porta 3000
   - Conexão com MongoDB Atlas será estabelecida automaticamente

4. **Criar usuário admin (primeira execução):**
   ```bash
   npm run create-admin
   ```

5. **Acesse a aplicação:**
   - Frontend: http://localhost:3000
   - API: http://localhost:3001/api
   - Health Check: http://localhost:3001/api/health

6. **Faça login com:**
   - **Email:** admin@tellus.com
   - **Senha:** admin123

## 🏗️ Estrutura do Projeto

```
TellureCrm/
├── src/
│   ├── client/          # Frontend React
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── ...
│   │   └── public/
│   ├── server/          # Backend Express
│   │   ├── database/
│   │   ├── routes/
│   │   ├── services/
│   │   └── index.ts
│   └── shared/          # Tipos compartilhados
│       └── types/
├── data/                # (não usado com MongoDB)
└── dist/                # Build de produção
```

## 📋 Scripts Disponíveis

- `npm run dev` - Inicia desenvolvimento (frontend + backend)
- `npm run dev:server` - Inicia apenas o backend
- `npm run dev:client` - Inicia apenas o frontend
- `npm run build` - Build de produção
- `npm run preview` - Preview da build de produção
- `npm start` - Inicia servidor de produção
- `npm run create-admin` - Cria usuário admin no MongoDB

## 🎨 Design System

### Cores da Marca Tellure
- **Primary:** `#2563eb` (Azul principal)
- **Secondary:** `#1e40af` (Azul escuro)
- **Accent:** `#3b82f6` (Azul claro)
- **Dark:** `#1e293b` (Cinza escuro)
- **Light:** `#f8fafc` (Cinza claro)

### Componentes UI
- **Button:** Botões com variantes primary, secondary, danger
- **Input:** Campos de entrada com validação visual
- **Modal:** Modais para formulários
- **Card:** Cards para listagem de clientes
- **LoadingSpinner:** Indicador de carregamento

## 📊 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login do usuário
- `GET /api/auth/me` - Dados do usuário autenticado
- `POST /api/auth/verify` - Verificar token JWT

### Clientes (🔒 Protegidas)
- `GET /api/customers` - Listar clientes (com filtros e paginação)
- `GET /api/customers/:id` - Buscar cliente por ID
- `POST /api/customers` - Criar novo cliente
- `PUT /api/customers/:id` - Atualizar cliente
- `DELETE /api/customers/:id` - Deletar cliente

### Health Check
- `GET /api/health` - Status da API

## 🔒 Validações

### Cliente
- **Nome:** Mínimo 2 caracteres
- **Email:** Formato de email válido
- **Telefone:** Mínimo 10 dígitos
- **CPF:** Exatamente 11 dígitos
- **Data de nascimento:** Formato YYYY-MM-DD
- **Endereço:** Todos os campos obrigatórios exceto complemento
- **CEP:** Exatamente 8 dígitos
- **Estado:** Exatamente 2 caracteres
- **Senha gov:** Mínimo 6 caracteres

## 🚀 Deploy no Heroku

### Pré-requisitos
- Conta no [Heroku](https://heroku.com)
- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) instalado

### Passos para Deploy

1. **Login no Heroku:**
   ```bash
   heroku login
   ```

2. **Criar aplicação no Heroku:**
   ```bash
   heroku create tellus-crm-app
   ```

3. **Configurar variável de ambiente MongoDB:**
   ```bash
   heroku config:set MONGODB_URI="mongodb+srv://guilhermeryukaii:quebra2211cab@users.valzs.mongodb.net/telluscrm?retryWrites=true&w=majority&appName=users&authSource=admin&minPoolSize=0"
   ```

4. **Deploy da aplicação:**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

5. **Abrir aplicação:**
   ```bash
   heroku open
   ```

### Configuração Automática

O projeto já está configurado para Heroku com:
- ✅ **Procfile** - Define como iniciar a aplicação
- ✅ **heroku-postbuild** - Build automático no deploy
- ✅ **MongoDB Atlas** - Banco de dados na nuvem
- ✅ **Variáveis de ambiente** - PORT automática, MONGODB_URI configurável
- ✅ **Node.js version** - Especificada no package.json

### Variáveis de Ambiente
```bash
NODE_ENV=production    # Definido automaticamente pelo Heroku
PORT=<dynamic>        # Definido automaticamente pelo Heroku
MONGODB_URI=<mongo_connection_string> # Configurado manualmente
```

## 🔧 Produção Local

Para testar produção localmente:

1. **Build da aplicação:**
   ```bash
   npm run build
   ```

2. **Inicie o servidor:**
   ```bash
   npm start
   ```

## 📱 Responsividade

A aplicação é totalmente responsiva e funciona em:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)

## 🎯 Próximas Funcionalidades

- [ ] Autenticação de usuários
- [ ] Dashboard com estatísticas
- [ ] Exportação de dados
- [ ] Histórico de alterações
- [ ] Integração com APIs externas
- [ ] Backup automático

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas alterações
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

Desenvolvido com ❤️ para a marca **Tellure**
