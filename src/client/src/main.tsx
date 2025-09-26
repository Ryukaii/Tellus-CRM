import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import PublicApp from './PublicApp.tsx'
import { ThemeProvider } from './contexts/ThemeContext'
import './index.css'

// Detectar se estamos na rota de cadastro público
const isPublicRoute = window.location.pathname.startsWith('/cadastro') || window.location.pathname === '/public-form.html';

// Atualizar título da página para rota pública
if (isPublicRoute) {
  document.title = 'Tellure CRM - Pré-Cadastro Crédito Imobiliário';
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      {isPublicRoute ? <PublicApp /> : <App />}
    </ThemeProvider>
  </React.StrictMode>,
)
