-- ==================================================
-- POLÍTICAS DE SEGURANÇA PARA SUPABASE STORAGE
-- Execute estes comandos no SQL Editor do Supabase
-- ==================================================

-- 1. HABILITAR RLS no bucket (se ainda não estiver)
-- (Normalmente já está habilitado por padrão)

-- 2. POLÍTICA DE UPLOAD (INSERT) - Permite upload público
CREATE POLICY "Allow public uploads to user-documents"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'user-documents');

-- 3. POLÍTICA DE LEITURA (SELECT) - Permite leitura pública
CREATE POLICY "Allow public read access to user-documents"
ON storage.objects
FOR SELECT
USING (bucket_id = 'user-documents');

-- 4. POLÍTICA DE ATUALIZAÇÃO (UPDATE) - Permite atualização pública
CREATE POLICY "Allow public updates to user-documents"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'user-documents')
WITH CHECK (bucket_id = 'user-documents');

-- 5. POLÍTICA DE EXCLUSÃO (DELETE) - Permite exclusão pública
CREATE POLICY "Allow public deletes from user-documents"
ON storage.objects
FOR DELETE
USING (bucket_id = 'user-documents');

-- ==================================================
-- ALTERNATIVA: POLÍTICA MAIS PERMISSIVA (PARA TESTES)
-- Se as políticas acima não funcionarem, use esta:
-- ==================================================

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Allow public uploads to user-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to user-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates to user-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes from user-documents" ON storage.objects;

-- Política única mais permissiva
CREATE POLICY "Allow all operations on user-documents"
ON storage.objects
FOR ALL
USING (bucket_id = 'user-documents')
WITH CHECK (bucket_id = 'user-documents');

-- ==================================================
-- VERIFICAÇÃO DAS POLÍTICAS
-- ==================================================

-- Para verificar se as políticas foram criadas:
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';

-- ==================================================
-- CONFIGURAÇÃO DO BUCKET
-- ==================================================

-- Verificar se o bucket existe e está configurado corretamente:
SELECT * FROM storage.buckets WHERE name = 'user-documents';

-- Se o bucket não existir, criar:
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'user-documents',
    'user-documents',
    true,  -- público
    10485760,  -- 10MB em bytes
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
);

-- ==================================================
-- NOTAS IMPORTANTES:
-- ==================================================

/*
1. Execute estes comandos no SQL Editor do Supabase Dashboard
2. Vá em: Project > SQL Editor > New Query
3. Cole e execute os comandos acima
4. Teste novamente o upload

5. Se ainda não funcionar, tente desabilitar temporariamente o RLS:
   ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
   (NÃO recomendado para produção!)

6. Para produção, considere políticas mais restritivas baseadas em:
   - Autenticação de usuários
   - Limites de tamanho por usuário
   - Validação de tipos de arquivo
*/
