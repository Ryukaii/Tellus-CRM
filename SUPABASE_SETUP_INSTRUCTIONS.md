# Configuração do Supabase para Upload de Documentos

## Problema Identificado
Os erros de upload de documentos estão ocorrendo porque as variáveis de ambiente do Supabase não estão configuradas.

## Solução

### 1. Criar conta no Supabase
1. Acesse [https://supabase.com](https://supabase.com)
2. Crie uma conta gratuita
3. Crie um novo projeto

### 2. Configurar Storage
1. No painel do Supabase, vá para "Storage"
2. Crie um bucket chamado `user-documents`
3. Configure as políticas de acesso (veja abaixo)

### 3. Obter credenciais
1. No painel do Supabase, vá para "Settings" > "API"
2. Copie a "Project URL" e "anon public" key

### 4. Configurar variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto com:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/tellus-crm

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-secret-key-here
```

### 5. Políticas de Storage (SQL)
Execute este SQL no editor SQL do Supabase:

```sql
-- Habilitar RLS no bucket
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Política para permitir upload de arquivos
CREATE POLICY "Permitir upload de documentos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'user-documents');

-- Política para permitir leitura de arquivos
CREATE POLICY "Permitir leitura de documentos" ON storage.objects
FOR SELECT USING (bucket_id = 'user-documents');

-- Política para permitir exclusão de arquivos
CREATE POLICY "Permitir exclusão de documentos" ON storage.objects
FOR DELETE USING (bucket_id = 'user-documents');
```

### 6. Reiniciar o servidor
Após configurar as variáveis de ambiente:

```bash
npm run dev
```

## Modo de Fallback
Se o Supabase não estiver configurado, o sistema usará armazenamento local temporário. Os arquivos serão armazenados apenas na memória do navegador e serão perdidos ao recarregar a página.

## Verificação
Após a configuração, você deve ver:
- ✅ Upload de documentos funcionando
- ✅ Documentos sendo salvos no Supabase Storage
- ✅ URLs públicas dos documentos funcionando
- ✅ Sem erros no console do navegador

## Troubleshooting
- Verifique se as variáveis de ambiente estão corretas
- Verifique se o bucket `user-documents` existe
- Verifique se as políticas de RLS estão configuradas
- Verifique o console do navegador para erros específicos
