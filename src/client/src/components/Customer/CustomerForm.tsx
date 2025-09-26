import React, { useState } from 'react';
import { Customer, CustomerUpdateSchema } from '../../../../shared/types/customer';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { StateSelect } from '../UI/StateSelect';
import { LocalDocumentUpload } from './LocalDocumentUpload';
import { DocumentUpload } from '../UI/DocumentUpload';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

interface LocalDocument {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  documentType: string;
  uploadedAt: Date;
  url: string;
}

// Função para verificar se o Supabase está configurado
const isSupabaseConfigured = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  return supabaseUrl && 
         supabaseUrl !== 'https://your-project.supabase.co' && 
         supabaseUrl.includes('supabase.co') &&
         supabaseKey && 
         supabaseKey !== 'your-anon-key' &&
         supabaseKey.length > 50;
};

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
  showDocuments?: boolean; // Nova prop para controlar se deve mostrar a seção de documentos
}

export function CustomerForm({ customer, onSubmit, onCancel, loading = false, showDocuments = true }: CustomerFormProps) {
  const renderId = Math.random().toString(36).substr(2, 9);
  console.log(`🔍 CustomerForm render [${renderId}] - showDocuments:`, showDocuments, 'type:', typeof showDocuments);
  
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
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>(customer?.uploadedDocuments || []);

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

    // Preparar dados para validação (mesmo processo do handleSubmit)
    let birthDate = formData.birthDate;
    if (birthDate && birthDate.includes('/')) {
      const [day, month, year] = birthDate.split('/');
      birthDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    const dataToValidate = {
      ...formData,
      cpf: formData.cpf.replace(/\D/g, ''),
      phone: formData.phone.replace(/\D/g, ''),
      birthDate: birthDate || undefined,
      address: {
        ...formData.address,
        zipCode: formData.address.zipCode.replace(/\D/g, '')
      },
      monthlyIncome: formData.monthlyIncome || undefined,
      propertyValue: formData.propertyValue || undefined,
      govPassword: formData.govPassword && formData.govPassword.trim() !== '' ? formData.govPassword : undefined
    };

    // Remover campos vazios
    Object.keys(dataToValidate).forEach(key => {
      if (dataToValidate[key] === undefined || dataToValidate[key] === '') {
        delete dataToValidate[key];
      }
    });

    // Validar usando o schema Zod
    const validationResult = CustomerUpdateSchema.safeParse(dataToValidate);

    if (!validationResult.success) {
      // Converter erros do Zod para o formato esperado
      validationResult.error.errors.forEach(error => {
        const fieldPath = error.path.join('.');
        newErrors[fieldPath] = error.message;
      });

      
      // Rolar até o primeiro campo com erro após um pequeno delay
      setTimeout(() => {
        const firstErrorField = document.querySelector('[data-error="true"]');
        if (firstErrorField) {
          firstErrorField.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 100);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Converter data para formato YYYY-MM-DD se necessário
    let birthDate = formData.birthDate;
    if (birthDate && birthDate.includes('/')) {
      // Converter DD/MM/YYYY para YYYY-MM-DD
      const [day, month, year] = birthDate.split('/');
      birthDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    const customerData = {
      ...formData,
      cpf: formData.cpf.replace(/\D/g, ''),
      phone: formData.phone.replace(/\D/g, ''),
      birthDate: birthDate || undefined,
      address: {
        ...formData.address,
        zipCode: formData.address.zipCode.replace(/\D/g, '')
      },
      monthlyIncome: formData.monthlyIncome || undefined,
      propertyValue: formData.propertyValue || undefined,
      uploadedDocuments: uploadedDocuments,
      // Remover govPassword se estiver vazio para evitar erro de validação
      govPassword: formData.govPassword && formData.govPassword.trim() !== '' ? formData.govPassword : undefined
    };

    // Remover campos undefined/vazios para evitar problemas de validação
    Object.keys(customerData).forEach(key => {
      if (customerData[key] === undefined || customerData[key] === '') {
        delete customerData[key];
      }
    });


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
      {/* Alerta de erros de validação */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-800">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800 mb-2 dark:text-red-200">
                Corrija os seguintes campos para continuar:
              </h3>
              <ul className="text-sm text-red-700 space-y-1 dark:text-red-300">
                {Object.entries(errors).map(([field, error]) => {
                  // Traduzir nomes de campos para português
                  const fieldNames: Record<string, string> = {
                    'name': 'Nome',
                    'email': 'Email',
                    'phone': 'Telefone',
                    'cpf': 'CPF',
                    'rg': 'RG',
                    'birthDate': 'Data de nascimento',
                    'address.street': 'Rua',
                    'address.number': 'Número',
                    'address.neighborhood': 'Bairro',
                    'address.city': 'Cidade',
                    'address.state': 'Estado',
                    'address.zipCode': 'CEP',
                    'govPassword': 'Senha Gov.br'
                  };
                  
                  const fieldName = fieldNames[field] || field;
                  
                  return (
                    <li key={field} className="flex">
                      <span className="font-medium">{fieldName}:</span>
                      <span className="ml-1">{error}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}

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
          <label className="text-sm font-medium text-gray-700 block mb-1 dark:text-dark-textSecondary">
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

      <div className="border-t pt-4 sm:pt-6 dark:border-dark-border">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4 dark:text-dark-text">Endereço</h3>
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

      <div className="border-t pt-4 sm:pt-6 dark:border-dark-border">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4 dark:text-dark-text">Dados Profissionais</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Profissão"
            value={formData.profession}
            onChange={(e) => handleChange('profession', e.target.value)}
            placeholder="Ex: Engenheiro, Médico, etc."
          />

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1 dark:text-dark-textSecondary">
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

      <div className="border-t pt-4 sm:pt-6 dark:border-dark-border">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4 dark:text-dark-text">Dados do Imóvel</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Valor do Imóvel"
            type="text"
            value={formatCurrency(formData.propertyValue)}
            onChange={(e) => handleChange('propertyValue', parseCurrency(e.target.value))}
            placeholder="R$ 0,00"
          />

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1 dark:text-dark-textSecondary">
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

      <div className="border-t pt-4 sm:pt-6 dark:border-dark-border">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4 dark:text-dark-text">Informações Adicionais</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1 dark:text-dark-textSecondary">
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
            <label className="text-sm font-medium text-gray-700 block mb-1 dark:text-dark-textSecondary">
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

      {showDocuments && (
        <div className="border-t pt-4 sm:pt-6 dark:border-dark-border">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4 dark:text-dark-text">Documentos</h3>
          {isSupabaseConfigured() ? (
            <DocumentUpload
              sessionId={customer?.id || 'new-customer'}
              documentType="customer_document"
              label="Documentos do Cliente"
              description="Adicione documentos relacionados ao cliente (RG, CPF, comprovantes, etc.)"
              onUploadComplete={setUploadedDocuments}
              onUploadError={(error) => console.error('Erro no upload:', error)}
              className="mb-6"
              userCpf={formData.cpf.replace(/\D/g, '')}
            />
          ) : (
            <LocalDocumentUpload
              onUploadComplete={setUploadedDocuments}
              onUploadError={(error) => console.error('Erro no upload:', error)}
              className="mb-6"
            />
          )}
        </div>
      )}

      <div className="border-t pt-4 sm:pt-6 dark:border-dark-border">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-dark-textSecondary">
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
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors dark:text-dark-textMuted dark:hover:text-dark-text"
            >
              {showGovPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.govPassword && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.govPassword}</p>
          )}
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium text-gray-700 block mb-1 dark:text-dark-textSecondary">
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

      <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6 border-t dark:border-dark-border">
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
