import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  // Carrega as variáveis de ambiente do diretório raiz
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    root: 'src/client',
  build: {
    outDir: '../../dist/client',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/client/index.html'),
        public: resolve(__dirname, 'src/client/public-form.html')
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@client': resolve(__dirname, './src/client/src'),
      '@data': resolve(__dirname, './src/client/src/data')
    }
  },
  server: {
    port: 3000,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  // Define as variáveis de ambiente para o cliente
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
    'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL)
  }
  }
})
  