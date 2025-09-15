import React, { useState } from 'react';
import { Customer } from '../../../../shared/types/customer';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { LoadingSpinner } from '../UI/LoadingSpinner';

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
    birthDate: customer?.birthDate || '',
    address: {
      street: customer?.address?.street || '',
      number: customer?.address?.number || '',
      complement: customer?.address?.complement || '',
      neighborhood: customer?.address?.neighborhood || '',
      city: customer?.address?.city || '',
      state: customer?.address?.state || '',
      zipCode: customer?.address?.zipCode || ''
    },
    govPassword: customer?.govPassword || '',
    notes: customer?.notes || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
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
    if (!formData.govPassword.trim()) newErrors.govPassword = 'Senha gov é obrigatória';

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
      }
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
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
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Endereço</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="md:col-span-2">
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

          <Input
            label="Estado *"
            value={formData.address.state}
            onChange={(e) => handleChange('address.state', e.target.value.toUpperCase())}
            error={errors['address.state']}
            placeholder="SP"
            maxLength={2}
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

      <div className="border-t pt-6">
        <Input
          label="Senha gov *"
          type="password"
          value={formData.govPassword}
          onChange={(e) => handleChange('govPassword', e.target.value)}
          error={errors.govPassword}
          placeholder="Digite a senha do gov.br"
        />

        <div className="mt-4">
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Observações
          </label>
          <textarea
            className="input min-h-[80px] resize-y"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Observações adicionais sobre o cliente..."
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="min-w-[120px]"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
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
