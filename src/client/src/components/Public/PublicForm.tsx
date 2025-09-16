import React, { useState } from 'react';
import { Activity, CheckCircle, AlertCircle, Eye, EyeOff, User, Home, Briefcase, DollarSign, Shield, FileText } from 'lucide-react';
import { Button } from '../UI/Button';
import { LoadingSpinner } from '../UI/LoadingSpinner';

interface FormData {
  // Dados Pessoais
  name: string;
  email: string;
  phone: string;
  cpf: string;
  rg: string;
  birthDate: string;
  maritalStatus: string;
  
  // Endereço
  address: {
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };

  // Dados Profissionais
  profession: string;
  employmentType: string;
  monthlyIncome: string;
  companyName: string;
  
  // Dados do Imóvel
  propertyValue: string;
  propertyType: string;
  propertyCity: string;
  propertyState: string;
  
  // Gov.br
  govPassword: string;
  hasTwoFactorDisabled: boolean;
  
  // Cônjuge
  hasSpouse: boolean;
  spouseName: string;
  spouseCpf: string;
  
  // Documentos
  hasRG: boolean;
  hasCPF: boolean;
  hasAddressProof: boolean;
  hasIncomeProof: boolean;
  hasMaritalStatusProof: boolean;
  hasCompanyDocs: boolean;
  hasTaxReturn: boolean;
  hasBankStatements: boolean;
  
  // Observações
  notes: string;
}

export function PublicForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGovPassword, setShowGovPassword] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    rg: '',
    birthDate: '',
    maritalStatus: 'solteiro',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: ''
    },
    profession: '',
    employmentType: 'clt',
    monthlyIncome: '',
    companyName: '',
    propertyValue: '',
    propertyType: 'apartamento',
    propertyCity: '',
    propertyState: '',
    govPassword: '',
    hasTwoFactorDisabled: false,
    hasSpouse: false,
    spouseName: '',
    spouseCpf: '',
    hasRG: false,
    hasCPF: false,
    hasAddressProof: false,
    hasIncomeProof: false,
    hasMaritalStatusProof: false,
    hasCompanyDocs: false,
    hasTaxReturn: false,
    hasBankStatements: false,
    notes: ''
  });

  const handleChange = (field: string, value: any) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const amount = parseInt(numbers) / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const submitData = {
        ...formData,
        monthlyIncome: parseFloat(formData.monthlyIncome.replace(/[^\d,]/g, '').replace(',', '.')) || 0,
        propertyValue: parseFloat(formData.propertyValue.replace(/[^\d,]/g, '').replace(',', '.')) || 0,
        cpf: formData.cpf.replace(/\D/g, ''),
        phone: formData.phone.replace(/\D/g, ''),
        spouseCpf: formData.spouseCpf.replace(/\D/g, ''),
        address: {
          ...formData.address,
          zipCode: formData.address.zipCode.replace(/\D/g, '')
        }
      };

      const response = await fetch('/api/leads/public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Erro ao enviar formulário');
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-tellus-primary via-tellus-secondary to-tellus-accent flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Cadastro Realizado!</h2>
          <p className="text-gray-600 mb-6">
            Obrigado pelo seu interesse! Nossa equipe entrará em contato em breve para dar continuidade ao seu processo de crédito imobiliário.
          </p>
          <Button onClick={() => window.location.reload()} className="w-full">
            Fazer Novo Cadastro
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-tellus-primary via-tellus-secondary to-tellus-accent">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-tellus-primary rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-tellus-dark">Tellures CRM</h1>
              <p className="text-xs text-gray-500">Crédito Imobiliário</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 py-8">
        {/* Progress */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Pré-Cadastro para Crédito Imobiliário</h2>
            <span className="text-sm text-gray-500">Etapa {currentStep} de 5</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-tellus-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <User className="w-6 h-6 text-tellus-primary" />
                <h3 className="text-lg font-semibold">Dados Pessoais</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tellus-primary focus:border-transparent"
                    placeholder="Digite seu nome completo"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tellus-primary focus:border-transparent"
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                  <input
                    type="text"
                    value={formatPhone(formData.phone)}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tellus-primary focus:border-transparent"
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
                  <input
                    type="text"
                    value={formatCPF(formData.cpf)}
                    onChange={(e) => handleChange('cpf', e.target.value)}
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tellus-primary focus:border-transparent"
                    placeholder="000.000.000-00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RG *</label>
                  <input
                    type="text"
                    value={formData.rg}
                    onChange={(e) => handleChange('rg', e.target.value)}
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tellus-primary focus:border-transparent"
                    placeholder="12.345.678-9"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento *</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleChange('birthDate', e.target.value)}
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tellus-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado Civil *</label>
                  <select
                    value={formData.maritalStatus}
                    onChange={(e) => handleChange('maritalStatus', e.target.value)}
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tellus-primary focus:border-transparent"
                    required
                  >
                    <option value="solteiro">Solteiro(a)</option>
                    <option value="casado">Casado(a)</option>
                    <option value="divorciado">Divorciado(a)</option>
                    <option value="viuvo">Viúvo(a)</option>
                    <option value="uniao_estavel">União Estável</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Continue com os outros steps... */}
          
          {error && (
            <div className="mt-6 flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <Button
              variant="secondary"
              onClick={prevStep}
              disabled={currentStep === 1 || loading}
              className={currentStep === 1 ? 'invisible' : ''}
            >
              Voltar
            </Button>

            {currentStep < 5 ? (
              <Button onClick={nextStep} disabled={loading}>
                Próximo
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading} className="min-w-[120px]">
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <LoadingSpinner size="sm" />
                    <span>Enviando...</span>
                  </div>
                ) : (
                  'Finalizar Cadastro'
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
