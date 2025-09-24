import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './components/Dashboard/Dashboard';
import { CustomerList } from './components/Customer/CustomerList';
import { CustomerDetailsPage } from './components/Customer/CustomerDetailsPage';
import { CustomerEditPage } from './components/Customer/CustomerEditPage';
import { PreRegistrationManager } from './components/PreRegistration/PreRegistrationManager';
import { SharedCustomerView } from './components/Public/SharedCustomerView';

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        {/* Página inicial - Dashboard real */}
        <Route path="/" element={<Dashboard />} />
        
        {/* Rotas principais */}
        <Route path="/customers" element={<CustomerList />} />
        <Route path="/customers/:customerId" element={<CustomerDetailsPage />} />
        <Route path="/customers/:customerId/edit" element={<CustomerEditPage />} />
        <Route path="/pre-registrations" element={<PreRegistrationManager />} />
        
        {/* Rota 404 */}
        <Route path="/*" element={
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-tellus-charcoal-900 mb-4">404</h1>
              <p className="text-tellus-charcoal-600 mb-4">Página não encontrada</p>
              <a 
                href="/" 
                className="text-tellus-primary hover:text-tellus-gold-600 font-medium transition-colors"
              >
                Voltar ao Início
              </a>
            </div>
          </div>
        } />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rota pública para links compartilhados */}
          <Route path="/shared/:linkId" element={<SharedCustomerView />} />
          
          {/* Rotas protegidas */}
          <Route path="/*" element={
            <ProtectedRoute>
              <AppRoutes />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;