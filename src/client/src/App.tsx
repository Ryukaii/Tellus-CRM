import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { Layout } from './components/Layout/Layout';
import { CustomerList } from './components/Customer/CustomerList';
import { CustomerForm } from './components/Customer/CustomerForm';
import { Modal } from './components/UI/Modal';
import { useCustomers } from './hooks/useCustomers';
import { Customer, CustomerFilters } from '../../shared/types/customer';

function CrmApp() {
  const [filters, setFilters] = useState<CustomerFilters>({
    page: 1,
    limit: 20
  });
  
  const {
    customers,
    total,
    page,
    limit,
    loading,
    error,
    createCustomer,
    updateCustomer,
    deleteCustomer
  } = useCustomers(filters);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    customer?: Customer;
    loading: boolean;
  }>({
    isOpen: false,
    loading: false
  });

  const handleAddCustomer = () => {
    setModalState({
      isOpen: true,
      customer: undefined,
      loading: false
    });
  };

  const handleEditCustomer = (customer: Customer) => {
    setModalState({
      isOpen: true,
      customer,
      loading: false
    });
  };

  const handleSubmitCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    setModalState(prev => ({ ...prev, loading: true }));
    
    let success = false;
    if (modalState.customer) {
      // Update existing customer
      success = await updateCustomer(modalState.customer.id!, customerData);
    } else {
      // Create new customer
      success = await createCustomer(customerData);
    }
    
    setModalState(prev => ({ ...prev, loading: false }));
    
    if (success) {
      setModalState({ isOpen: false, loading: false });
    }
    
    return success;
  };

  const handleDeleteCustomer = async (id: string) => {
    await deleteCustomer(id);
  };

  const handleSearch = (search: string) => {
    setFilters(prev => ({
      ...prev,
      search: search || undefined,
      page: 1
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, loading: false });
  };

  return (
    <Layout>
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <CustomerList
          customers={customers}
          loading={loading}
          onEdit={handleEditCustomer}
          onDelete={handleDeleteCustomer}
          onAdd={handleAddCustomer}
          onSearch={handleSearch}
          total={total}
          page={page}
          limit={limit}
          onPageChange={handlePageChange}
        />

        <Modal
          isOpen={modalState.isOpen}
          onClose={handleCloseModal}
          title={modalState.customer ? 'Editar Cliente' : 'Novo Cliente'}
        >
          <CustomerForm
            customer={modalState.customer}
            onSubmit={handleSubmitCustomer}
            onCancel={handleCloseModal}
            loading={modalState.loading}
          />
        </Modal>
      </div>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <CrmApp />
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;
