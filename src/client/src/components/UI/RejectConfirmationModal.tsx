import React, { useState } from 'react';
import { XCircle } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';

interface RejectConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  leadName: string;
  isLoading?: boolean;
}

export function RejectConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  leadName,
  isLoading = false
}: RejectConfirmationModalProps) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    onConfirm(reason.trim() || undefined);
    setReason(''); // Limpar o campo após confirmação
  };

  const handleClose = () => {
    setReason(''); // Limpar o campo ao fechar
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full dark:bg-dark-card">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 dark:bg-dark-card">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10 dark:bg-red-900/20">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-dark-text">
                  Rejeitar Lead
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-dark-textSecondary">
                    Tem certeza que deseja rejeitar o lead <strong>"{leadName}"</strong>?
                  </p>
                  <p className="text-sm text-gray-500 mt-2 dark:text-dark-textSecondary">
                    Esta ação não pode ser desfeita.
                  </p>
                </div>
                <div className="mt-4">
                  <label htmlFor="reject-reason" className="block text-sm font-medium text-gray-700 dark:text-dark-text">
                    Motivo da rejeição (opcional)
                  </label>
                  <Input
                    id="reject-reason"
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Digite o motivo da rejeição..."
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse dark:bg-dark-surfaceLight">
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Rejeitando...
                </div>
              ) : (
                'Rejeitar'
              )}
            </Button>
            <Button
              onClick={handleClose}
              disabled={isLoading}
              variant="outline"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-dark-input dark:border-dark-inputBorder dark:text-dark-text dark:hover:bg-dark-surfaceLight"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
