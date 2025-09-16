# 🔑 Configuração da Service Key do Supabase

## 📋 **PROBLEMA:**
O upload está funcionando, mas as URLs públicas retornam erro 404 "Bucket not found" porque as políticas RLS estão bloqueando o acesso público aos arquivos.

## ✅ **SOLUÇÃO:**
Usar a **Service Key** do Supabase para gerar URLs que funcionem sem autenticação, ignorando as políticas RLS.

## 🛠️ **COMO CONFIGURAR:**

### 1. **Obter a Service Key**
1. Acesse o painel do Supabase
2. Vá em **Settings** → **API**
3. Copie a **service_role** key (não a anon key)

### 2. **Adicionar ao arquivo .env**
Adicione esta linha ao arquivo `src/client/.env.local`:

```env
VITE_SUPABASE_SERVICE_KEY=sua_service_key_aqui
```

### 3. **Exemplo completo do .env.local:**
```env
VITE_SUPABASE_URL=https://jldhuxtbgadpxzkkdurv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🔒 **SEGURANÇA:**
- ⚠️ **NUNCA** compartilhe a service key publicamente
- ⚠️ **NUNCA** commite a service key no Git
- ✅ Use apenas em ambientes de desenvolvimento/confiança
- ✅ Para produção, considere usar um proxy/API própria

## 🧪 **TESTE:**
1. Adicione a service key ao `.env.local`
2. Reinicie o servidor (`npm run dev`)
3. Acesse a página de detalhes de um cliente
4. No componente de debug, verifique se aparece "SERVICE KEY ATIVA"
5. Teste o upload e verifique se a URL gerada funciona

## 📝 **O QUE A SERVICE KEY FAZ:**
- Ignora completamente as políticas RLS
- Permite acesso irrestrito a todas as APIs do Storage
- Gera URLs públicas que funcionam sem autenticação
- Resolve o problema do erro 404 "Bucket not found"
