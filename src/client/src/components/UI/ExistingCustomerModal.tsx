import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { ExistingCustomerData } from '../../services/cpfValidationService';

interface ExistingCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  onAddProcess: () => void;
  customerData: ExistingCustomerData;
  processType: string;
}

export function ExistingCustomerModal({
  isOpen,
  onClose,
  onContinue,
  onAddProcess,
  customerData,
  processType
}: ExistingCustomerModalProps) {
  const getProcessDisplayName = (process: string): string => {
    const processNames: Record<string, string> = {
      'agro': 'Agronegócio',
      'credito': 'Crédito',
      'consultoria': 'Consultoria',
      'credito_imobiliario': 'Crédito Imobiliário',
      'geral': 'Geral'
    };
    return processNames[process] || process;
  };

  const getCurrentProcessDisplayName = (): string => {
    return getProcessDisplayName(processType);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cliente já cadastrado">
      <div className="space-y-4">
        <div className="bg-tellus-gold-50 border border-tellus-gold-200 rounded-lg p-4">
          <h3 className="font-semibold text-tellus-charcoal-900 mb-2">
            CPF já cadastrado no sistema
          </h3>
          <p className="text-tellus-charcoal-800 text-sm">
            Encontramos um cadastro existente para este CPF. Você pode adicionar um novo processo ou continuar com o cadastro atual.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Dados do cliente:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-medium text-gray-600">Nome:</span>
              <p className="text-gray-900">{customerData.name}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Email:</span>
              <p className="text-gray-900">{customerData.email}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Telefone:</span>
              <p className="text-gray-900">{customerData.phone}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">CPF:</span>
              <p className="text-gray-900">{customerData.cpf}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">Processos existentes:</h4>
          <div className="flex flex-wrap gap-2">
            {customerData.processes.map((process, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
              >
                {getProcessDisplayName(process)}
              </span>
            ))}
          </div>
        </div>

        {customerData.missingDocuments && customerData.missingDocuments.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-semibold text-orange-900 mb-2">
              Documentos necessários para {getCurrentProcessDisplayName()}:
            </h4>
            <ul className="list-disc list-inside text-sm text-orange-800 space-y-1">
              {customerData.missingDocuments.map((doc, index) => (
                <li key={index}>{doc}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={onAddProcess}
            className="flex-1 bg-tellus-charcoal-900 hover:bg-tellus-charcoal-800 text-white"
          >
            Adicionar {getCurrentProcessDisplayName()}
          </Button>
          <Button
            onClick={onContinue}
            variant="outline"
            className="flex-1"
          >
            Continuar mesmo assim
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            Cancelar
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          <p>
            Ao adicionar um novo processo, você poderá complementar os dados existentes 
            com informações específicas para {getCurrentProcessDisplayName()}.
          </p>
        </div>
      </div>
    </Modal>
  );
}
