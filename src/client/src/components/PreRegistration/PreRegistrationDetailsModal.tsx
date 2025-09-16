import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Home, 
  FileText, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Heart
} from 'lucide-react';
import { PreRegistration } from '../../../../shared/types/preRegistration';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';

interface PreRegistrationDetailsModalProps {
  preRegistration: PreRegistration | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (sessionId: string) => Promise<void>;
  onReject: (sessionId: string, reason?: string) => Promise<void>;
  onDelete: (sessionId: string) => Promise<void>;
}

export function PreRegistrationDetailsModal({
  preRegistration,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onDelete
}: PreRegistrationDetailsModalProps) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  if (!preRegistration) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value?: number) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getEmploymentTypeLabel = (type?: string) => {
    const types: Record<string, string> = {
      clt: 'CLT',
      servidor_publico: 'Servidor Público',
      autonomo: 'Autônomo',
      empresario: 'Empresário',
      aposentado: 'Aposentado'
    };
    return types[type || ''] || 'N/A';
  };

  const getPropertyTypeLabel = (type?: string) => {
    const types: Record<string, string> = {
      apartamento: 'Apartamento',
      casa: 'Casa',
      terreno: 'Terreno',
      comercial: 'Comercial'
    };
    return types[type || ''] || 'N/A';
  };

  const getMaritalStatusLabel = (status?: string) => {
    const statuses: Record<string, string> = {
      solteiro: 'Solteiro(a)',
      casado: 'Casado(a)',
      divorciado: 'Divorciado(a)',
      viuvo: 'Viúvo(a)',
      uniao_estavel: 'União Estável'
    };
    return statuses[status || ''] || 'N/A';
  };

  const getProgressPercentage = (currentStep: number) => {
    return Math.min((currentStep / 7) * 100, 100);
  };

  const handleApprove = async () => {
    setProcessing(true);
    try {
      await onApprove(preRegistration.sessionId);
      onClose();
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    setProcessing(true);
    try {
      await onReject(preRegistration.sessionId, rejectReason);
      setShowRejectForm(false);
      setRejectReason('');
      onClose();
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir este pré-cadastro? Esta ação não pode ser desfeita.')) {
      setProcessing(true);
      try {
        await onDelete(preRegistration.sessionId);
        onClose();
      } finally {
        setProcessing(false);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalhes do Pré-Cadastro" size="lg">
      <div className="space-y-6">
        {/* Status e Progresso */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-900">Status do Cadastro</h3>
            <div className="flex items-center space-x-2">
              {preRegistration.isCompleted ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Completo
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  <Clock className="w-4 h-4 mr-1" />
                  Em andamento
                </span>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Etapa {preRegistration.currentStep || 1} de 7</span>
              <span>{Math.round(getProgressPercentage(preRegistration.currentStep || 1))}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-tellus-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage(preRegistration.currentStep || 1)}%` }}
              />
            </div>
          </div>
          
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Criado:</span> {formatDate(preRegistration.createdAt)}
            </div>
            <div>
              <span className="font-medium">Atualizado:</span> {formatDate(preRegistration.updatedAt)}
            </div>
            <div>
              <span className="font-medium">Último acesso:</span> {formatDate(preRegistration.lastAccessedAt)}
            </div>
          </div>
        </div>

        {/* Dados Pessoais */}
        {preRegistration.personalData && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Dados Pessoais
            </h3>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome</label>
                  <p className="mt-1 text-sm text-gray-900">{preRegistration.personalData.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">CPF</label>
                  <p className="mt-1 text-sm text-gray-900">{preRegistration.personalData.cpf || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">RG</label>
                  <p className="mt-1 text-sm text-gray-900">{preRegistration.personalData.rg || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {preRegistration.personalData.birthDate ? 
                      new Date(preRegistration.personalData.birthDate).toLocaleDateString('pt-BR') : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900 flex items-center">
                    <Mail className="w-4 h-4 mr-1 text-gray-400" />
                    {preRegistration.personalData.email || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Telefone</label>
                  <p className="mt-1 text-sm text-gray-900 flex items-center">
                    <Phone className="w-4 h-4 mr-1 text-gray-400" />
                    {preRegistration.personalData.phone || 'N/A'}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Estado Civil</label>
                  <p className="mt-1 text-sm text-gray-900 flex items-center">
                    <Heart className="w-4 h-4 mr-1 text-gray-400" />
                    {getMaritalStatusLabel(preRegistration.maritalStatus)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Endereço */}
        {preRegistration.address && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Endereço
            </h3>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Logradouro</label>
                  <p className="mt-1 text-sm text-gray-900">{preRegistration.address.street || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Número</label>
                  <p className="mt-1 text-sm text-gray-900">{preRegistration.address.number || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Complemento</label>
                  <p className="mt-1 text-sm text-gray-900">{preRegistration.address.complement || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bairro</label>
                  <p className="mt-1 text-sm text-gray-900">{preRegistration.address.neighborhood || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cidade</label>
                  <p className="mt-1 text-sm text-gray-900">{preRegistration.address.city || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <p className="mt-1 text-sm text-gray-900">{preRegistration.address.state || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">CEP</label>
                  <p className="mt-1 text-sm text-gray-900">{preRegistration.address.zipCode || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dados Profissionais */}
        {preRegistration.professionalData && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <Briefcase className="w-5 h-5 mr-2" />
              Dados Profissionais
            </h3>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Profissão</label>
                  <p className="mt-1 text-sm text-gray-900">{preRegistration.professionalData.profession || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de Emprego</label>
                  <p className="mt-1 text-sm text-gray-900">{getEmploymentTypeLabel(preRegistration.professionalData.employmentType)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Renda Mensal</label>
                  <p className="mt-1 text-sm text-gray-900">{formatCurrency(preRegistration.professionalData.monthlyIncome)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Empresa</label>
                  <p className="mt-1 text-sm text-gray-900">{preRegistration.professionalData.companyName || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dados do Imóvel */}
        {preRegistration.propertyData && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <Home className="w-5 h-5 mr-2" />
              Dados do Imóvel
            </h3>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Valor do Imóvel</label>
                  <p className="mt-1 text-sm text-gray-900">{formatCurrency(preRegistration.propertyData.propertyValue)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo do Imóvel</label>
                  <p className="mt-1 text-sm text-gray-900">{getPropertyTypeLabel(preRegistration.propertyData.propertyType)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cidade do Imóvel</label>
                  <p className="mt-1 text-sm text-gray-900">{preRegistration.propertyData.propertyCity || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado do Imóvel</label>
                  <p className="mt-1 text-sm text-gray-900">{preRegistration.propertyData.propertyState || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dados do Cônjuge */}
        {preRegistration.spouseData?.hasSpouse && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <Heart className="w-5 h-5 mr-2" />
              Dados do Cônjuge
            </h3>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome</label>
                  <p className="mt-1 text-sm text-gray-900">{preRegistration.spouseData.spouseName || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">CPF</label>
                  <p className="mt-1 text-sm text-gray-900">{preRegistration.spouseData.spouseCpf || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">RG</label>
                  <p className="mt-1 text-sm text-gray-900">{preRegistration.spouseData.spouseRg || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {preRegistration.spouseData.spouseBirthDate ? 
                      new Date(preRegistration.spouseData.spouseBirthDate).toLocaleDateString('pt-BR') : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Profissão</label>
                  <p className="mt-1 text-sm text-gray-900">{preRegistration.spouseData.spouseProfession || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Renda Mensal</label>
                  <p className="mt-1 text-sm text-gray-900">{formatCurrency(preRegistration.spouseData.spouseMonthlyIncome)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Observações */}
        {preRegistration.notes && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Observações
            </h3>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-900 whitespace-pre-wrap">{preRegistration.notes}</p>
            </div>
          </div>
        )}

        {/* Formulário de Rejeição */}
        {showRejectForm && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="text-lg font-medium text-red-900 mb-3">Rejeitar Pré-Cadastro</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-red-700">Motivo da Rejeição</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Descreva o motivo da rejeição..."
                  className="mt-1 block w-full rounded-md border-red-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  rows={3}
                />
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={handleReject}
                  disabled={processing}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Confirmar Rejeição
                </Button>
                <Button
                  onClick={() => setShowRejectForm(false)}
                  variant="outline"
                  disabled={processing}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
          {preRegistration.isCompleted && (
            <>
              <Button
                onClick={handleApprove}
                disabled={processing}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Aprovar e Converter para Cliente
              </Button>
              
              <Button
                onClick={() => setShowRejectForm(!showRejectForm)}
                disabled={processing}
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Rejeitar
              </Button>
            </>
          )}
          
          <Button
            onClick={handleDelete}
            disabled={processing}
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <X className="w-4 h-4 mr-2" />
            Excluir
          </Button>
          
          <Button onClick={onClose} variant="outline">
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
