import React, { useState, useEffect } from 'react';
import { Plus, AlertCircle, Trash2, Loader2 } from 'lucide-react';
import { Button } from '../UI/Button';
import { Modal } from '../UI/Modal';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { CustomerForm } from './CustomerForm';
import { CustomerListView } from './CustomerListView';
import { useCustomers } from '../../hooks/useCustomers';

export function CustomerList() {
  const {
    customers,
    loading,
    error,
    total,
    page,
    limit,
    refetch: fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer
  } = useCustomers();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  const handleCreateCustomer = async (customerData: any) => {
    try {
      await createCustomer(customerData);
      setShowCreateModal(false);
      fetchCustomers();
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      alert('Erro ao criar cliente');
    }
  };

  const handleUpdateCustomer = async (customerData: any) => {
    if (!editingCustomer) return;
    
    try {
      await updateCustomer(editingCustomer.id, customerData);
      setEditingCustomer(null);
      fetchCustomers();
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      alert('Erro ao atualizar cliente');
    }
  };

  const handleDeleteCustomer = (customer: any) => {
    setCustomerToDelete(customer);
    setShowDeleteModal(true);
  };

  const confirmDeleteCustomer = async () => {
    if (!customerToDelete) return;

    try {
      setDeleting(true);
      await deleteCustomer(customerToDelete.id);
      fetchCustomers();
      setShowDeleteModal(false);
      setCustomerToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      alert('Erro ao excluir cliente');
    } finally {
      setDeleting(false);
    }
  };

  const cancelDeleteCustomer = () => {
    setShowDeleteModal(false);
    setCustomerToDelete(null);
  };


  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar clientes</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchCustomers}>Tentar novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header com botão de adicionar */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="mt-2 text-gray-600">
            Gerencie todos os seus clientes em um só lugar
          </p>
        </div>
        
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Cliente</span>
        </Button>
      </div>

      {/* Lista de Clientes */}
      <CustomerListView
        customers={customers}
        loading={loading}
        onRefresh={fetchCustomers}
        onDelete={handleDeleteCustomer}
      />

        {/* Modal de Criação */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Novo Cliente"
          size="lg"
        >
          <CustomerForm
            onSubmit={handleCreateCustomer}
            onCancel={() => setShowCreateModal(false)}
            loading={loading}
          />
        </Modal>

        {/* Modal de Edição */}
        <Modal
          isOpen={!!editingCustomer}
          onClose={() => setEditingCustomer(null)}
          title="Editar Cliente"
          size="lg"
        >
          {editingCustomer && (
            <CustomerForm
              customer={editingCustomer}
              onSubmit={handleUpdateCustomer}
              onCancel={() => setEditingCustomer(null)}
              loading={loading}
            />
          )}
        </Modal>

        {/* Modal de Confirmação de Exclusão */}
        <Modal
          isOpen={showDeleteModal}
          onClose={cancelDeleteCustomer}
          title="Confirmar Exclusão"
          size="md"
        >
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  Excluir cliente
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Tem certeza que deseja excluir o cliente{' '}
                  <span className="font-medium text-gray-900">
                    "{customerToDelete?.name}"
                  </span>?
                </p>
                <p className="text-xs text-red-600 mt-2">
                  ⚠️ Esta ação não pode ser desfeita. Todos os dados do cliente, incluindo documentos, serão removidos permanentemente.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={cancelDeleteCustomer}
                disabled={deleting}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteCustomer}
                disabled={deleting}
                className="flex items-center space-x-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Excluir</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </Modal>
    </div>
  );
}