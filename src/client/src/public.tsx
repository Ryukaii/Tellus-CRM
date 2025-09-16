import React from 'react'
import ReactDOM from 'react-dom/client'
import PublicApp from './PublicApp.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PublicApp />
  </React.StrictMode>,
)
