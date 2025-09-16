# Configuração do Supabase Storage

Este documento explica como configurar o Supabase Storage para o sistema de upload de documentos.

## 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Clique em "New Project"
4. Escolha sua organização
5. Preencha os dados do projeto:
   - **Name**: `tellus-crm`
   - **Database Password**: (escolha uma senha forte)
   - **Region**: escolha a região mais próxima (ex: South America - São Paulo)

## 2. Configurar Storage

### 2.1 Criar Bucket

1. No painel do Supabase, vá para **Storage** no menu lateral
2. Clique em **Create a new bucket**
3. Configure o bucket:
   - **Name**: `user-documents`
   - **Public**: ✅ (OBRIGATÓRIO - permite URLs públicas diretas)
   - **File size limit**: `10 MB`
   - **Allowed MIME types**: `application/pdf,image/jpeg,image/png,image/webp`

### 2.2 Configurar Políticas de Segurança (RLS)

**⚠️ IMPORTANTE**: Este é o passo mais crítico para o funcionamento do upload!

#### Opção A - Interface Gráfica:
1. Vá para **Storage** > **Policies**
2. Clique em **New Policy** para o bucket `user-documents`
3. Selecione **"Allow all operations"** para facilitar os testes
4. Configure como público (sem autenticação necessária)

#### Opção B - SQL (Recomendado):
1. Vá para **SQL Editor** no Supabase Dashboard
2. Execute o arquivo `SUPABASE_POLICIES.sql` (criado no projeto)
3. Ou execute manualmente:

```sql
-- Política permissiva para testes
CREATE POLICY "Allow all operations on user-documents"
ON storage.objects
FOR ALL
USING (bucket_id = 'user-documents')
WITH CHECK (bucket_id = 'user-documents');
```

#### Verificar Políticas:
```sql
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';
```

## 3. Configurar Variáveis de Ambiente

1. No painel do Supabase, vá para **Settings** > **API**
2. Copie as seguintes informações:
   - **Project URL**
   - **anon public key**

3. Crie um arquivo `.env` na raiz do projeto:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

## 4. Estrutura de Pastas no Storage

O sistema organiza os arquivos da seguinte forma:
```
user-documents/
├── {cpf_usuario}/
│   ├── documento_identidade.pdf
│   ├── comprovante_residencia.jpg
│   ├── declaracao_ir.pdf
│   ├── contrato_social.pdf
│   └── ...
└── {outro_cpf}/
    ├── rg_frente.jpg
    ├── rg_verso.jpg
    └── ...
```

**Nova organização:**
- **Pasta por CPF**: Cada usuário tem uma pasta com seu CPF (apenas números)
- **Nome original**: Arquivos mantêm o nome original do upload
- **Sem timestamp**: Simplifica a organização e visualização

## 5. Tipos de Arquivo Suportados

- **PDF**: `application/pdf`
- **JPEG**: `image/jpeg`
- **PNG**: `image/png`
- **WEBP**: `image/webp`

## 6. Limites Configurados

- **Tamanho máximo por arquivo**: 10MB
- **Arquivos por categoria**:
  - Documentos Pessoais: 4 arquivos
  - Documentos Financeiros: 5 arquivos
  - Documentos da Empresa: 3 arquivos

## 7. Testando a Configuração

1. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

2. Acesse `http://localhost:3000/cadastro`
3. Complete o formulário até a etapa de upload de documentos
4. Teste o upload de um arquivo PDF ou imagem

## 8. Monitoramento

No painel do Supabase, você pode monitorar:
- **Storage** > **Objects**: ver todos os arquivos enviados
- **Logs**: acompanhar erros e atividades
- **Usage**: verificar uso de storage e bandwidth

## 9. Backup e Segurança

- Os arquivos são armazenados de forma segura no Supabase
- Backup automático incluído
- Criptografia em trânsito e em repouso
- Conformidade com LGPD/GDPR

## 10. Troubleshooting

### ❌ Erro: "new row violates row-level security policy"
**Causa**: Políticas RLS não configuradas corretamente.

**Soluções**:
1. Execute o arquivo `SUPABASE_POLICIES.sql`
2. Ou vá em Storage > Policies e crie uma política "Allow all operations"
3. Certifique-se que o bucket está marcado como **Public**
4. **Solução temporária**: Desabilite RLS para testes:
   ```sql
   ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
   ```

### ❌ Erro de CORS
**Causa**: Domínio não autorizado.

**Solução**: 
1. Vá em Settings > API > CORS
2. Adicione `http://localhost:8080` nas origens permitidas

### ❌ Erro de Política
**Causa**: Políticas RLS muito restritivas.

**Solução**: Use a política permissiva para testes:
```sql
CREATE POLICY "Allow all operations on pre-registration-documents"
ON storage.objects FOR ALL
USING (bucket_id = 'pre-registration-documents')
WITH CHECK (bucket_id = 'pre-registration-documents');
```

### ❌ Erro de Tamanho
**Causa**: Arquivo maior que o limite.

**Solução**: 
1. Verifique se o arquivo é menor que 10MB
2. Ajuste o limite no bucket se necessário

### ❌ Bucket não encontrado
**Causa**: Bucket não existe ou nome incorreto.

**Solução**:
1. Verifique se o bucket `user-documents` existe
2. **IMPORTANTE**: Certifique-se que está marcado como **Public** ✅
3. Recrie o bucket se necessário

### ❌ URLs não funcionam (404/403)
**Causa**: Bucket não está público.

**Solução**:
```sql
-- Tornar bucket público
UPDATE storage.buckets 
SET public = true 
WHERE id = 'user-documents';
```
