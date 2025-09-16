# 🧪 Teste de Upload de Documentos

Este arquivo HTML permite testar o sistema de upload de documentos do Tellus CRM de forma independente.

## 🚀 Como usar

### 1. Iniciar o servidor de teste

**Opção A - Node.js:**
```bash
node test-server.js
```

**Opção B - Python (alternativa):**
```bash
python3 test-server.py
# ou
./test-server.py
```

### 2. Acessar no navegador
```
http://localhost:8080
```

### 3. Configurar Supabase
- Cole a URL do seu projeto Supabase
- Cole a chave anônima (anon key)
- Clique em "Conectar ao Supabase"

### 4. Testar upload
- Arraste arquivos ou clique para selecionar
- Clique em "Testar Upload"
- Acompanhe os logs em tempo real

## 📋 O que o teste verifica

### ✅ Funcionalidades testadas:
- ✅ Conexão com Supabase
- ✅ Validação de tipos de arquivo
- ✅ Validação de tamanho (máx. 10MB)
- ✅ Upload real para Storage
- ✅ Geração de URLs públicas
- ✅ Estrutura de pastas correta
- ✅ Logs detalhados do processo

### 📁 Estrutura criada no Storage:
```
pre-registration-documents/
└── test_session_[timestamp]_[random]/
    └── test/
        ├── [timestamp]_arquivo1.pdf
        ├── [timestamp]_arquivo2.jpg
        └── ...
```

## 🔧 Configuração necessária

### No Supabase:
1. **Bucket criado**: `pre-registration-documents`
2. **Políticas ativas**:
   - Upload (INSERT)
   - Leitura pública (SELECT)
3. **Tipos permitidos**: PDF, JPG, PNG, WEBP
4. **Tamanho máximo**: 10MB

### Variáveis necessárias:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

## 🐛 Troubleshooting

### Erro de CORS
```
Access to fetch at 'https://supabase...' from origin 'http://localhost:8080' has been blocked by CORS policy
```
**Solução**: Configure o domínio `http://localhost:8080` nas configurações CORS do Supabase.

### Erro de Política
```
new row violates row-level security policy
```
**Solução**: Verifique se as políticas RLS estão configuradas corretamente no Storage.

### Erro de Bucket
```
The resource was not found
```
**Solução**: Certifique-se de que o bucket `pre-registration-documents` existe.

### Erro de Tamanho
```
Payload too large
```
**Solução**: Arquivo maior que 10MB. Reduza o tamanho ou ajuste o limite.

## 📊 Interpretando os logs

### ✅ Sucesso:
```
[14:30:15] Supabase inicializado com sucesso
[14:30:20] Arquivo adicionado: documento.pdf (2.5 MB)
[14:30:25] Fazendo upload: documento.pdf
[14:30:28] ✅ Upload concluído: documento.pdf
[14:30:28]    URL: https://...supabase.co/storage/v1/object/public/...
```

### ❌ Erro:
```
[14:30:15] ERRO: Tipo não suportado - arquivo.txt (text/plain)
[14:30:20] ERRO: Arquivo muito grande - video.mp4 (50.2 MB)
[14:30:25] ERRO: Erro no upload de foto.jpg: Invalid bucket
```

## 🔍 Verificação manual

Após o teste, verifique:

1. **No Supabase Dashboard**:
   - Storage > Objects
   - Bucket: `pre-registration-documents`
   - Pasta: `test_session_[timestamp]_[random]/test/`

2. **URLs funcionando**:
   - Clique nas URLs geradas nos logs
   - Arquivos devem abrir no navegador

3. **Estrutura correta**:
   - Nomes com timestamp
   - Organização por sessão e tipo
   - Metadados preservados

## 🎯 Próximos passos

Após confirmar que o teste funciona:

1. ✅ Upload funciona → Testar no formulário real
2. ❌ Upload falha → Verificar configuração Supabase
3. 🔧 Ajustar políticas se necessário
4. 🚀 Deploy em produção

---

**💡 Dica**: Mantenha o DevTools aberto (F12) para ver logs adicionais do navegador durante os testes.
