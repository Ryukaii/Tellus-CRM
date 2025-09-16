import React, { useState } from 'react';
import { Customer } from '../../../../shared/types/customer';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { Eye, EyeOff, User, Mail, Phone, Calendar, MapPin, Shield, FileText, Edit, Trash2 } from 'lucide-react';

interface CustomerDetailsModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
}

export function CustomerDetailsModal({ 
  customer, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete 
}: CustomerDetailsModalProps) {
  const [showGovPassword, setShowGovPassword] = useState(false);

  if (!customer) return null;

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (phone: string) => {
    if (phone.length <= 10) {
      return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCEP = (cep: string) => {
    return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const handleEdit = () => {
    onEdit(customer);
    onClose();
  };

  const handleDelete = () => {
    onDelete(customer.id!);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalhes do Cliente">
      <div className="space-y-6">
        {/* Header com ações */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate" title={customer.name}>
              {customer.name}
            </h2>
            <p className="text-sm sm:text-base text-gray-600">CPF: {formatCPF(customer.cpf)}</p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleEdit}
              className="flex items-center justify-center space-x-1 w-full sm:w-auto"
            >
              <Edit className="w-4 h-4" />
              <span>Editar</span>
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              className="flex items-center justify-center space-x-1 w-full sm:w-auto"
            >
              <Trash2 className="w-4 h-4" />
              <span>Excluir</span>
            </Button>
          </div>
        </div>

        {/* Informações Pessoais */}
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
            <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Informações Pessoais
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="flex items-start space-x-3">
              <Mail className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600">Email</p>
                <p className="font-medium text-sm sm:text-base truncate" title={customer.email}>{customer.email}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Phone className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600">Telefone</p>
                <p className="font-medium text-sm sm:text-base">{formatPhone(customer.phone)}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 sm:col-span-2">
              <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600">Data de Nascimento</p>
                <p className="font-medium text-sm sm:text-base">{formatDate(customer.birthDate)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Endereço
          </h3>
          <div className="space-y-2">
            <p className="font-medium text-sm sm:text-base">
              {customer.address.street}, {customer.address.number}
              {customer.address.complement && `, ${customer.address.complement}`}
            </p>
            <p className="text-gray-600 text-sm sm:text-base">
              {customer.address.neighborhood} - {customer.address.city}/{customer.address.state}
            </p>
            <p className="text-gray-600 text-sm sm:text-base">CEP: {formatCEP(customer.address.zipCode)}</p>
          </div>
        </div>

        {/* Senha Gov */}
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Senha Gov.br
          </h3>
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-gray-600">Senha</p>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm sm:text-lg break-all">
                  {showGovPassword ? customer.govPassword : '••••••••'}
                </span>
                <button
                  onClick={() => setShowGovPassword(!showGovPassword)}
                  className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                >
                  {showGovPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Observações */}
        {customer.notes && (
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Observações
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap text-sm sm:text-base">{customer.notes}</p>
          </div>
        )}

        {/* Informações do Sistema */}
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
            Informações do Sistema
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div>
              <p className="text-gray-600">Criado em</p>
              <p className="font-medium">{formatDate(customer.createdAt!)}</p>
            </div>
            <div>
              <p className="text-gray-600">Última atualização</p>
              <p className="font-medium">{formatDate(customer.updatedAt!)}</p>
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t">
          <Button variant="secondary" onClick={onClose} className="w-full sm:w-auto">
            Fechar
          </Button>
          <Button onClick={handleEdit} className="w-full sm:w-auto">
            Editar Cliente
          </Button>
        </div>
      </div>
    </Modal>
  );
}
