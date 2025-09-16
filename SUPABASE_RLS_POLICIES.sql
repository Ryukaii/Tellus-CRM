-- =====================================================
-- POLÍTICAS RLS PARA SUPABASE STORAGE
-- =====================================================
-- Execute este SQL no Editor SQL do Supabase para configurar
-- as políticas de acesso ao bucket 'user-documents'

-- 1. POLÍTICA PARA UPLOAD (INSERT)
-- Permite que usuários autenticados façam upload de arquivos
CREATE POLICY "Allow authenticated uploads to user-documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-documents'
);

-- 2. POLÍTICA PARA DOWNLOAD/VIEW (SELECT)
-- Permite que usuários autenticados visualizem arquivos
CREATE POLICY "Allow authenticated downloads from user-documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-documents'
);

-- 3. POLÍTICA PARA UPDATE
-- Permite que usuários autenticados atualizem arquivos
CREATE POLICY "Allow authenticated updates to user-documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-documents'
)
WITH CHECK (
  bucket_id = 'user-documents'
);

-- 4. POLÍTICA PARA DELETE
-- Permite que usuários autenticados deletem arquivos
CREATE POLICY "Allow authenticated deletes from user-documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-documents'
);

-- =====================================================
-- POLÍTICAS ALTERNATIVAS (MAIS RESTRITIVAS)
-- =====================================================
-- Se quiser políticas mais restritivas, use estas em vez das acima:

-- POLÍTICA RESTRITIVA: Apenas o proprietário do arquivo pode acessar
-- CREATE POLICY "User can only access their own files"
-- ON storage.objects
-- FOR ALL
-- TO authenticated
-- USING (
--   bucket_id = 'user-documents' AND
--   owner_id = auth.uid()
-- );

-- POLÍTICA RESTRITIVA: Apenas arquivos em pastas específicas
-- CREATE POLICY "Allow access to specific folders"
-- ON storage.objects
-- FOR ALL
-- TO authenticated
-- USING (
--   bucket_id = 'user-documents' AND
--   (storage.foldername(name))[1] IN ('documents', 'uploads', 'temp')
-- );

-- =====================================================
-- VERIFICAÇÃO DAS POLÍTICAS
-- =====================================================
-- Execute esta query para verificar se as políticas foram criadas:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE tablename = 'objects' AND schemaname = 'storage';
