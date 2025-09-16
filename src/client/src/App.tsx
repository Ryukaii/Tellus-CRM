import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { Layout } from './components/Layout/Layout';
import { CustomerList } from './components/Customer/CustomerList';
import { CustomerDetailsPage } from './components/Customer/CustomerDetailsPage';
import { CustomerEditPage } from './components/Customer/CustomerEditPage';
import { PreRegistrationManager } from './components/PreRegistration/PreRegistrationManager';
import { SharedCustomerView } from './components/Public/SharedCustomerView';

function DashboardRoutes() {
  return (
    <Layout>
      <Routes>
        {/* Redirecionar / para /dashboard/customers */}
        <Route path="/" element={<Navigate to="/dashboard/customers" replace />} />
        
        {/* Rotas do Dashboard */}
        <Route path="/dashboard/customers" element={<CustomerList />} />
        <Route path="/dashboard/customers/:customerId" element={<CustomerDetailsPage />} />
        <Route path="/dashboard/customers/:customerId/edit" element={<CustomerEditPage />} />
        <Route path="/dashboard/pre-registrations" element={<PreRegistrationManager />} />
        
        {/* Rota 404 para dashboard */}
        <Route path="/dashboard/*" element={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-gray-600 mb-4">Página não encontrada</p>
              <a 
                href="/dashboard/customers" 
                className="text-blue-600 hover:text-blue-700"
              >
                Voltar ao Dashboard
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
          
          {/* Rotas protegidas do dashboard */}
          <Route path="/*" element={
            <ProtectedRoute>
              <DashboardRoutes />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;