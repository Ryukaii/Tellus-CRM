import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '../UI/Button';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { CustomerForm } from './CustomerForm';
import { CustomerDocumentManager } from './CustomerDocumentManager';
import { Customer } from '../../../../shared/types/customer';
import { apiService } from '../../services/api';

export const CustomerEditPage: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Array<{
    id: string;
    fileName: string;
    fileType: string;
    documentType: string;
    uploadedAt: string;
    url: string;
  }>>([]);

  useEffect(() => {
    if (customerId) {
      loadCustomer(customerId);
    }
  }, [customerId]);

  const loadCustomer = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const customerData = await apiService.getCustomer(id);
      setCustomer(customerData);
      
      // Carregar documentos se existirem
      if (customerData.uploadedDocuments) {
        setDocuments(customerData.uploadedDocuments);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!customerId) {
      console.error('❌ [CUSTOMER EDIT] customerId não encontrado');
      return false;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      console.log('🔄 [CUSTOMER EDIT] Iniciando atualização:', {
        customerId,
        customerData: Object.keys(customerData)
      });
      
      const updatedCustomer = await apiService.updateCustomer(customerId, customerData);
      
      console.log('✅ [CUSTOMER EDIT] Cliente atualizado:', updatedCustomer.id);
      
      // Atualizar o estado local com os dados atualizados
      setCustomer(updatedCustomer);
      
      return true;
    } catch (err) {
      console.error('❌ [CUSTOMER EDIT] Erro ao atualizar:', {
        customerId,
        error: err instanceof Error ? err.message : err
      });
      setError(err instanceof Error ? err.message : 'Erro ao atualizar cliente');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/customers/${customerId}`);
  };

  const handleDocumentsChange = (newDocuments: Array<{
    id: string;
    fileName: string;
    fileType: string;
    documentType: string;
    uploadedAt: string;
    url: string;
  }>) => {
    setDocuments(newDocuments);
  };

  const handleGoBack = () => {
    navigate('/customers');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Carregando dados do cliente...</p>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Cliente não encontrado
          </h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleGoBack}>
            Voltar para lista
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleGoBack}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </Button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Editar Cliente
                </h1>
                <p className="text-gray-600">
                  {customer.name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col xl:flex-row gap-6 xl:gap-8">
          {/* Formulário Principal */}
          <div className="flex-1 xl:flex-[2]">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  Dados do Cliente
                </h2>
              </div>
              <div className="p-6">
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex">
                      <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
                      <div>
                        <h3 className="text-sm font-medium text-red-800">
                          Erro ao salvar
                        </h3>
                        <p className="mt-1 text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <CustomerForm
                  customer={customer}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  loading={saving}
                  showDocuments={false}
                />
              </div>
            </div>
          </div>

          {/* Sidebar com Documentos */}
          <div className="w-full xl:w-96 xl:flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border sticky top-6">
              <div className="p-4 sm:p-6">
                <CustomerDocumentManager
                  customerId={customerId || ''}
                  customerCpf={customer?.cpf || ''}
                  documents={documents}
                  onDocumentsChange={handleDocumentsChange}
                  readOnly={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
