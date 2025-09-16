import React, { useState } from 'react';
import { Customer } from '../../../../shared/types/customer';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { StateSelect } from '../UI/StateSelect';
import { Eye, EyeOff } from 'lucide-react';

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
}

export function CustomerForm({ customer, onSubmit, onCancel, loading = false }: CustomerFormProps) {
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    cpf: customer?.cpf || '',
    rg: customer?.rg || '',
    birthDate: customer?.birthDate || '',
    maritalStatus: customer?.maritalStatus || '',
    address: {
      street: customer?.address?.street || '',
      number: customer?.address?.number || '',
      complement: customer?.address?.complement || '',
      neighborhood: customer?.address?.neighborhood || '',
      city: customer?.address?.city || '',
      state: customer?.address?.state || '',
      zipCode: customer?.address?.zipCode || ''
    },
    profession: customer?.profession || '',
    employmentType: customer?.employmentType || '',
    monthlyIncome: customer?.monthlyIncome || 0,
    companyName: customer?.companyName || '',
    propertyValue: customer?.propertyValue || 0,
    propertyType: customer?.propertyType || '',
    propertyCity: customer?.propertyCity || '',
    propertyState: customer?.propertyState || '',
    status: customer?.status || 'ativo',
    source: customer?.source || '',
    govPassword: customer?.govPassword || '',
    notes: customer?.notes || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showGovPassword, setShowGovPassword] = useState(false);

  const handleChange = (field: string, value: string | number) => {
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

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.email.trim()) newErrors.email = 'Email é obrigatório';
    if (!formData.phone.trim()) newErrors.phone = 'Telefone é obrigatório';
    if (!formData.cpf.trim()) newErrors.cpf = 'CPF é obrigatório';
    if (!formData.birthDate) newErrors.birthDate = 'Data de nascimento é obrigatória';
    if (!formData.address.street.trim()) newErrors['address.street'] = 'Rua é obrigatória';
    if (!formData.address.number.trim()) newErrors['address.number'] = 'Número é obrigatório';
    if (!formData.address.neighborhood.trim()) newErrors['address.neighborhood'] = 'Bairro é obrigatório';
    if (!formData.address.city.trim()) newErrors['address.city'] = 'Cidade é obrigatória';
    if (!formData.address.state.trim()) newErrors['address.state'] = 'Estado é obrigatório';
    if (!formData.address.zipCode.trim()) newErrors['address.zipCode'] = 'CEP é obrigatório';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // CPF validation (basic)
    if (formData.cpf && !/^\d{11}$/.test(formData.cpf.replace(/\D/g, ''))) {
      newErrors.cpf = 'CPF deve ter 11 dígitos';
    }

    // CEP validation
    if (formData.address.zipCode && !/^\d{8}$/.test(formData.address.zipCode.replace(/\D/g, ''))) {
      newErrors['address.zipCode'] = 'CEP deve ter 8 dígitos';
    }

    // RG validation (basic)
    if (formData.rg && formData.rg.length < 5) {
      newErrors.rg = 'RG deve ter pelo menos 5 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const customerData = {
      ...formData,
      cpf: formData.cpf.replace(/\D/g, ''),
      phone: formData.phone.replace(/\D/g, ''),
      address: {
        ...formData.address,
        zipCode: formData.address.zipCode.replace(/\D/g, '')
      },
      monthlyIncome: formData.monthlyIncome || undefined,
      propertyValue: formData.propertyValue || undefined
    };

    const success = await onSubmit(customerData);
    if (success) {
      onCancel();
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

  const formatCurrency = (value: number) => {
    if (!value) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const parseCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers ? parseInt(numbers) : 0;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="sm:col-span-2">
          <Input
            label="Nome completo *"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors.name}
            placeholder="Digite o nome completo"
          />
        </div>

        <Input
          label="Email *"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors.email}
          placeholder="email@exemplo.com"
        />

        <Input
          label="Telefone *"
          value={formatPhone(formData.phone)}
          onChange={(e) => handleChange('phone', e.target.value)}
          error={errors.phone}
          placeholder="(11) 99999-9999"
        />

        <Input
          label="CPF *"
          value={formatCPF(formData.cpf)}
          onChange={(e) => handleChange('cpf', e.target.value)}
          error={errors.cpf}
          placeholder="000.000.000-00"
        />

        <Input
          label="Data de nascimento *"
          type="date"
          value={formData.birthDate}
          onChange={(e) => handleChange('birthDate', e.target.value)}
          error={errors.birthDate}
        />

        <Input
          label="RG"
          value={formData.rg}
          onChange={(e) => handleChange('rg', e.target.value)}
          error={errors.rg}
          placeholder="00.000.000-0"
        />

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Estado Civil
          </label>
          <select
            value={formData.maritalStatus}
            onChange={(e) => handleChange('maritalStatus', e.target.value)}
            className="input"
          >
            <option value="">Selecione o estado civil</option>
            <option value="solteiro">Solteiro(a)</option>
            <option value="casado">Casado(a)</option>
            <option value="divorciado">Divorciado(a)</option>
            <option value="viuvo">Viúvo(a)</option>
            <option value="uniao_estavel">União Estável</option>
          </select>
        </div>
      </div>

      <div className="border-t pt-4 sm:pt-6">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Endereço</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Rua *"
              value={formData.address.street}
              onChange={(e) => handleChange('address.street', e.target.value)}
              error={errors['address.street']}
              placeholder="Nome da rua"
            />
          </div>

          <Input
            label="Número *"
            value={formData.address.number}
            onChange={(e) => handleChange('address.number', e.target.value)}
            error={errors['address.number']}
            placeholder="123"
          />

          <Input
            label="Complemento"
            value={formData.address.complement}
            onChange={(e) => handleChange('address.complement', e.target.value)}
            placeholder="Apto, casa, etc."
          />

          <Input
            label="Bairro *"
            value={formData.address.neighborhood}
            onChange={(e) => handleChange('address.neighborhood', e.target.value)}
            error={errors['address.neighborhood']}
            placeholder="Nome do bairro"
          />

          <Input
            label="Cidade *"
            value={formData.address.city}
            onChange={(e) => handleChange('address.city', e.target.value)}
            error={errors['address.city']}
            placeholder="Nome da cidade"
          />

          <StateSelect
            label="Estado *"
            value={formData.address.state}
            onChange={(value) => handleChange('address.state', value)}
            error={errors['address.state']}
            required
          />

          <Input
            label="CEP *"
            value={formatCEP(formData.address.zipCode)}
            onChange={(e) => handleChange('address.zipCode', e.target.value)}
            error={errors['address.zipCode']}
            placeholder="00000-000"
          />
        </div>
      </div>

      <div className="border-t pt-4 sm:pt-6">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Dados Profissionais</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Profissão"
            value={formData.profession}
            onChange={(e) => handleChange('profession', e.target.value)}
            placeholder="Ex: Engenheiro, Médico, etc."
          />

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Tipo de Emprego
            </label>
            <select
              value={formData.employmentType}
              onChange={(e) => handleChange('employmentType', e.target.value)}
              className="input"
            >
              <option value="">Selecione o tipo de emprego</option>
              <option value="clt">CLT</option>
              <option value="autonomo">Autônomo</option>
              <option value="empresario">Empresário</option>
              <option value="aposentado">Aposentado</option>
              <option value="desempregado">Desempregado</option>
            </select>
          </div>

          <Input
            label="Renda Mensal"
            type="text"
            value={formatCurrency(formData.monthlyIncome)}
            onChange={(e) => handleChange('monthlyIncome', parseCurrency(e.target.value))}
            placeholder="R$ 0,00"
          />

          <Input
            label="Empresa"
            value={formData.companyName}
            onChange={(e) => handleChange('companyName', e.target.value)}
            placeholder="Nome da empresa"
          />
        </div>
      </div>

      <div className="border-t pt-4 sm:pt-6">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Dados do Imóvel</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Valor do Imóvel"
            type="text"
            value={formatCurrency(formData.propertyValue)}
            onChange={(e) => handleChange('propertyValue', parseCurrency(e.target.value))}
            placeholder="R$ 0,00"
          />

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Tipo do Imóvel
            </label>
            <select
              value={formData.propertyType}
              onChange={(e) => handleChange('propertyType', e.target.value)}
              className="input"
            >
              <option value="">Selecione o tipo do imóvel</option>
              <option value="casa">Casa</option>
              <option value="apartamento">Apartamento</option>
              <option value="terreno">Terreno</option>
              <option value="comercial">Comercial</option>
              <option value="rural">Rural</option>
            </select>
          </div>

          <Input
            label="Cidade do Imóvel"
            value={formData.propertyCity}
            onChange={(e) => handleChange('propertyCity', e.target.value)}
            placeholder="Cidade onde está o imóvel"
          />

          <StateSelect
            label="Estado do Imóvel"
            value={formData.propertyState}
            onChange={(value) => handleChange('propertyState', value)}
            placeholder="Selecione o estado do imóvel"
          />
        </div>
      </div>

      <div className="border-t pt-4 sm:pt-6">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Informações Adicionais</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="input"
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
              <option value="pendente">Pendente</option>
              <option value="suspenso">Suspenso</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Origem
            </label>
            <select
              value={formData.source}
              onChange={(e) => handleChange('source', e.target.value)}
              className="input"
            >
              <option value="">Selecione a origem</option>
              <option value="indicacao">Indicação</option>
              <option value="site">Site</option>
              <option value="redes_sociais">Redes Sociais</option>
              <option value="anuncio">Anúncio</option>
              <option value="outros">Outros</option>
            </select>
          </div>
        </div>
      </div>

      <div className="border-t pt-4 sm:pt-6">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Senha gov *
          </label>
          <div className="relative">
            <input
              type={showGovPassword ? 'text' : 'password'}
              value={formData.govPassword}
              onChange={(e) => handleChange('govPassword', e.target.value)}
              className={`input pr-12 ${errors.govPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              placeholder="Digite a senha do gov.br"
            />
            <button
              type="button"
              onClick={() => setShowGovPassword(!showGovPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showGovPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.govPassword && (
            <p className="text-sm text-red-600">{errors.govPassword}</p>
          )}
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Observações
          </label>
          <textarea
            className="input min-h-[80px] resize-y w-full"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Observações adicionais sobre o cliente..."
            rows={3}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6 border-t">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto min-w-[120px]"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <LoadingSpinner size="sm" />
              <span>Salvando...</span>
            </div>
          ) : (
            customer ? 'Atualizar' : 'Criar Cliente'
          )}
        </Button>
      </div>
    </form>
  );
}
