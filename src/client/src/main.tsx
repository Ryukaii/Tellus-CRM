import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import PublicApp from './PublicApp.tsx'
import { ThemeProviderWrapper } from './contexts/ThemeContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import './index.css'

// Função para detectar se estamos na rota de cadastro público
function isPublicRoute(): boolean {
  try {
    const pathname = window.location.pathname;
    const search = window.location.search;
    
    // Verificar pathname
    if (pathname.startsWith('/cadastro') || pathname === '/public-form.html') {
      return true;
    }
    
    // Verificar parâmetros de query
    const urlParams = new URLSearchParams(search);
    const formParam = urlParams.get('form');
    if (formParam && ['agro', 'credito', 'consultoria', 'creditoimobiliario'].includes(formParam)) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error detecting public route:', error);
    return false;
  }
}

// Detectar se estamos na rota de cadastro público
const isPublic = isPublicRoute();

// Atualizar título da página para rota pública
if (isPublic) {
  document.title = 'Tellure CRM - Pré-Cadastro Crédito Imobiliário';
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProviderWrapper>
        {isPublic ? <PublicApp /> : <App />}
      </ThemeProviderWrapper>
    </ErrorBoundary>
  </React.StrictMode>,
)
