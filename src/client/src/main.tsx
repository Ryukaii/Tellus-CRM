import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import PublicApp from './PublicApp.tsx'
import './index.css'

// Detectar se estamos na rota de cadastro público
const isPublicRoute = window.location.pathname.startsWith('/cadastro') || window.location.pathname === '/public-form.html';

// Atualizar título da página para rota pública
if (isPublicRoute) {
  document.title = 'Tellures CRM - Pré-Cadastro Crédito Imobiliário';
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isPublicRoute ? <PublicApp /> : <App />}
  </React.StrictMode>,
)
