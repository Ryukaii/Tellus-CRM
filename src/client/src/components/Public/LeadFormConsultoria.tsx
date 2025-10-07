import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle, AlertCircle, User, Home, Briefcase, DollarSign, FileText, ArrowRight, ArrowLeft, Upload } from 'lucide-react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { DocumentUpload } from '../UI/DocumentUpload';
import { CPFService } from '../../services/cpfService';
import { CepService } from '../../services/cepService';
import { CNPJService } from '../../services/cnpjService';
import { StateSelect } from '../UI/StateSelect';
import { CPFValidationService, ExistingCustomerData } from '../../services/cpfValidationService';
import { ExistingCustomerModal } from '../UI/ExistingCustomerModal';

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
  monthlyIncome: number;
  personalCompanyName: string;
  
  
  // Cônjuge - Dados Pessoais
  hasSpouse: boolean;
  spouseName: string;
  spouseCpf: string;
  spouseRg: string;
  spouseBirthDate: string;
  spouseProfession: string;
  spouseEmploymentType: string;
  spouseMonthlyIncome: number | null;
  spouseCompanyName: string;
  hasSpouseIncome: boolean;
  
  // Documentos Pessoais
  hasRG: boolean;
  hasCPF: boolean;
  hasAddressProof: boolean;
  hasMaritalStatusProof: boolean;
  
  // Documentos Empresariais
  hasCompanyDocs: boolean;
  hasContractSocial: boolean;
  hasCNPJ: boolean;
  
  // Comprovação de Renda
  hasIncomeProof: boolean;
  hasTaxReturn: boolean;
  hasBankStatements: boolean;
  
  // Documentos do Cônjuge
  hasSpouseRG: boolean;
  hasSpouseCPF: boolean;
  hasSpouseAddressProof: boolean;
  hasSpouseMaritalStatusProof: boolean;
  hasSpouseIncomeProof: boolean;
  hasSpouseTaxReturn: boolean;
  hasSpouseBankStatements: boolean;
  
  // Documentos Enviados
  documents: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    documentType: string;
    uploadedAt: string;
    url: string;
  }>;
  
  // Dados da Pessoa Jurídica
  hasCompany: boolean;
  companyCnpj: string;
  companyName: string;
  companyAddress: {
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  
  // Observações
  notes: string;
}

export function LeadFormConsultoria() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [completedTabs, setCompletedTabs] = useState<number[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [consultingCPF, setConsultingCPF] = useState(false);
  const [cpfConsulted, setCpfConsulted] = useState(false);
  const [cpfValid, setCpfValid] = useState(false);
  const [cpfNotFound, setCpfNotFound] = useState(false);
  const [consultingCEP, setConsultingCEP] = useState(false);
  const [cepConsulted, setCepConsulted] = useState(false);
  const [cepValid, setCepValid] = useState(false);
  const [cepNotFound, setCepNotFound] = useState(false);
  const [consultingCNPJ, setConsultingCNPJ] = useState(false);
  const [cnpjConsulted, setCnpjConsulted] = useState(false);
  const [cnpjValid, setCnpjValid] = useState(false);
  const [cnpjNotFound, setCnpjNotFound] = useState(false);
  
  // Estados para validação de CPF existente
  const [existingCustomerModal, setExistingCustomerModal] = useState(false);
  const [existingCustomerData, setExistingCustomerData] = useState<ExistingCustomerData | null>(null);

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
    monthlyIncome: 0,
    personalCompanyName: '',
    hasSpouse: false,
    spouseName: '',
    spouseCpf: '',
    spouseRg: '',
    spouseBirthDate: '',
    spouseProfession: '',
    spouseEmploymentType: 'clt',
    spouseMonthlyIncome: null,
    spouseCompanyName: '',
    hasSpouseIncome: false,
    hasRG: true,
    hasCPF: true,
    hasAddressProof: false,
    hasMaritalStatusProof: false,
    hasCompanyDocs: false,
    hasContractSocial: false,
    hasCNPJ: false,
    hasIncomeProof: false,
    hasTaxReturn: false,
    hasBankStatements: false,
    hasSpouseRG: false,
    hasSpouseCPF: false,
    hasSpouseAddressProof: false,
    hasSpouseMaritalStatusProof: false,
    hasSpouseIncomeProof: false,
    hasSpouseTaxReturn: false,
    hasSpouseBankStatements: false,
    documents: [],
    hasCompany: false,
    companyCnpj: '',
    companyName: '',
    companyAddress: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: ''
    },
    notes: ''
  });

  const totalSteps = 6; // 1-Dados Pessoais, 2-Endereço, 3-Profissional, 4-Cônjuge, 5-Empresa, 6-Documentos

  // Determinar qual é realmente a última etapa (documentos)
  const isLastStep = React.useMemo(() => {
    // A última etapa é sempre documentos (etapa 6)
    return currentStep === 6;
  }, [currentStep]);

  // Corrigir etapa inválida
  useEffect(() => {
    if (currentStep > totalSteps) {
      console.log('Current step is beyond total steps, correcting...');
      setCurrentStep(totalSteps);
    }
  }, [currentStep, totalSteps]);

  // Inicialização simples - sempre começa do zero
  useEffect(() => {
    setCurrentStep(1);
  }, []);

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
    setError(null);

    // Se for o campo CPF, verificar validação e consultar
    if (field === 'cpf') {
      const cpfLimpo = value.replace(/\D/g, '');
      const isValid = cpfLimpo.length === 11 && validateCPF(value);
      setCpfValid(isValid);
      
      if (isValid) {
        consultarCPF(value);
      } else {
        setCpfConsulted(false);
        setCpfNotFound(false);
      }
    }

    // Se for o campo CEP, verificar validação e consultar
    if (field === 'address.zipCode') {
      const cepLimpo = value.replace(/\D/g, '');
      const isValid = cepLimpo.length === 8 && CepService.validarFormatoCep(value);
      setCepValid(isValid);
      
      if (isValid) {
        consultarCEP(value);
      } else {
        setCepConsulted(false);
        setCepNotFound(false);
      }
    }

    // Se for o campo CNPJ, verificar validação e consultar
    if (field === 'companyCnpj') {
      const cnpjLimpo = value.replace(/\D/g, '');
      const isValid = cnpjLimpo.length === 14 && validateCNPJ(value);
      setCnpjValid(isValid);
      
      if (isValid) {
        consultarCNPJ(value);
      } else {
        setCnpjConsulted(false);
        setCnpjNotFound(false);
      }
    }
  };

  const consultarCPF = async (cpf: string) => {
    const cpfLimpo = cpf.replace(/\D/g, '');
    
    // Só consultar se tiver 11 dígitos e for válido
    if (cpfLimpo.length === 11 && validateCPF(cpf)) {
      setConsultingCPF(true);
      setError(null);
      setCpfNotFound(false);
      
      try {
        const dadosCPF = await CPFService.consultarCPF(cpf);
        
        if (dadosCPF) {
          setFormData(prev => ({
            ...prev,
            name: dadosCPF.nome,
            birthDate: CPFService.formatarDataNascimento(dadosCPF.data_nascimento)
          }));
          setCpfConsulted(true);
          setCpfNotFound(false);
        } else {
          setCpfNotFound(true);
          setError('CPF válido mas não encontrado na base de dados. Preencha os dados manualmente.');
        }
      } catch (error) {
        console.error('Erro ao consultar CPF:', error);
        setCpfNotFound(true);
        setError('Erro ao consultar CPF. Preencha os dados manualmente.');
      } finally {
        setConsultingCPF(false);
      }
    }
  };

  const consultarCPFConjuge = async (cpf: string) => {
    const cpfLimpo = cpf.replace(/\D/g, '');
    const cpfTitularLimpo = formData.cpf.replace(/\D/g, '');
    
    // Verificar se é o mesmo CPF do titular
    if (cpfLimpo === cpfTitularLimpo) {
      setError('O CPF do cônjuge não pode ser igual ao CPF do titular');
      return;
    }
    
    // Só consultar se tiver 11 dígitos
    if (cpfLimpo.length === 11) {
      setConsultingCPF(true);
      setError(null);
      
      try {
        const dadosCPF = await CPFService.consultarCPF(cpf);
        
        if (dadosCPF) {
          setFormData(prev => ({
            ...prev,
            spouseName: dadosCPF.nome,
            spouseBirthDate: CPFService.formatarDataNascimento(dadosCPF.data_nascimento)
          }));
        } else {
          setError('CPF do cônjuge não encontrado na base de dados');
        }
      } catch (error) {
        console.error('Erro ao consultar CPF do cônjuge:', error);
        setError('Erro ao consultar CPF do cônjuge. Tente novamente.');
      } finally {
        setConsultingCPF(false);
      }
    }
  };

  const consultarCEP = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '');
    
    // Só consultar se tiver 8 dígitos
    if (cepLimpo.length === 8) {
      setConsultingCEP(true);
      setError(null);
      setCepNotFound(false);
      
      try {
        const dadosCEP = await CepService.buscarCep(cep);
        
        if (dadosCEP) {
          setFormData(prev => ({
            ...prev,
            address: {
              ...prev.address,
              street: dadosCEP.logradouro,
              neighborhood: dadosCEP.bairro,
              city: dadosCEP.localidade,
              state: dadosCEP.uf, // Já vem como sigla da API
              zipCode: CepService.formatarCep(cepLimpo)
            }
          }));
          setCepConsulted(true);
          setCepNotFound(false);
        } else {
          setCepNotFound(true);
          setError('CEP não encontrado. Preencha os dados manualmente.');
        }
      } catch (error) {
        console.error('Erro ao consultar CEP:', error);
        setCepNotFound(true);
        setError('Erro ao consultar CEP. Preencha os dados manualmente.');
      } finally {
        setConsultingCEP(false);
      }
    }
  };

  const consultarCNPJ = async (cnpj: string) => {
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    
    // Só consultar se tiver 14 dígitos
    if (cnpjLimpo.length === 14) {
      setConsultingCNPJ(true);
      setError(null);
      setCnpjNotFound(false);
      
      try {
        const dadosCNPJ = await CNPJService.consultarCNPJ(cnpj);
        
        if (dadosCNPJ) {
          setFormData(prev => ({
            ...prev,
            companyName: dadosCNPJ.razaoSocial,
            companyAddress: {
              ...prev.companyAddress,
              street: dadosCNPJ.endereco.logradouro || '',
              neighborhood: dadosCNPJ.endereco.bairro || '',
              city: dadosCNPJ.endereco.municipio || '',
              state: dadosCNPJ.endereco.uf || '',
              zipCode: dadosCNPJ.endereco.cep || ''
            }
          }));
          setCnpjConsulted(true);
          setCnpjNotFound(false);
        } else {
          setCnpjNotFound(true);
          setError('CNPJ não encontrado. Preencha os dados manualmente.');
        }
      } catch (error) {
        console.error('Erro ao consultar CNPJ:', error);
        setCnpjNotFound(true);
        setError('Erro ao consultar CNPJ. Preencha os dados manualmente.');
      } finally {
        setConsultingCNPJ(false);
      }
    }
  };

  // Validações
  const validateCPF = (cpf: string): boolean => {
    const numbers = cpf.replace(/\D/g, '');
    if (numbers.length !== 11) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(numbers)) return false;
    
    // Validar dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numbers[i]) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers[9])) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numbers[i]) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers[10])) return false;
    
    return true;
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const numbers = phone.replace(/\D/g, '');
    return numbers.length === 10 || numbers.length === 11;
  };

  const validateCNPJ = (cnpj: string): boolean => {
    return CNPJService.validarCNPJ(cnpj);
  };


  // RG não tem validação específica pois cada estado tem formato diferente

  const validateAge = (birthDate: string): boolean => {
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1 >= 18;
    }
    return age >= 18;
  };

  // Formatações
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return value.slice(0, 14); // Limitar a 14 caracteres
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (numbers.length <= 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value.slice(0, 15); // Limitar a 15 caracteres
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 8) {
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
    }
    return value.slice(0, 9); // Limitar a 9 caracteres
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 14) {
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return value.slice(0, 18); // Limitar a 18 caracteres
  };

  // RG não tem formatação específica pois cada estado tem formato diferente

  // Validar CPF e verificar se já existe no sistema
  const validateCPFAndCheckExisting = async () => {
    const cleanCPF = formData.cpf.replace(/\D/g, '');
    
    if (!validateCPF(cleanCPF)) {
      return {
        exists: false,
        canProceed: false,
        message: 'CPF inválido'
      };
    }

    try {
      const result = await CPFValidationService.validateCPF(cleanCPF, 'consultoria');
      return result;
    } catch (error) {
      console.error('Error validating CPF:', error);
      return {
        exists: false,
        canProceed: true,
        message: 'Erro ao verificar CPF. Tente novamente.'
      };
    }
  };

  // Funções para lidar com o modal de cliente existente
  const handleAddProcess = async () => {
    if (!existingCustomerData) return;
    
    try {
      setLoading(true);
      const cleanCPF = formData.cpf.replace(/\D/g, '');
      
      // Adicionar processo ao cliente existente
      await CPFValidationService.addProcessToExistingCustomer(cleanCPF, 'consultoria');
      
      // Preencher dados do cliente existente
      setFormData(prev => ({
        ...prev,
        name: existingCustomerData.name,
        email: existingCustomerData.email,
        phone: existingCustomerData.phone
      }));
      
      setExistingCustomerModal(false);
      setExistingCustomerData(null);
      
      // Continuar para próxima etapa
      setCurrentStep(currentStep + 1);
      setError(null);
    } catch (error) {
      console.error('Error adding process:', error);
      setError('Erro ao adicionar processo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueAnyway = async () => {
    try {
      setLoading(true);
      setExistingCustomerModal(false);
      setExistingCustomerData(null);
      
      // Continuar normalmente
      setCurrentStep(currentStep + 1);
      setError(null);
    } catch (error) {
      console.error('Error continuing:', error);
      setError('Erro ao continuar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (!isLastStep) {
      // Validação básica antes de avançar
        if (currentStep === 1) {
        // Validar dados pessoais
        if (!formData.name || !formData.email || !formData.phone || !formData.cpf || !validateCPF(formData.cpf)) {
          setError('Por favor, preencha todos os campos obrigatórios corretamente');
            return;
          }
        }
        
        setCurrentStep(currentStep + 1);
        setError(null);
    } else {
      // Se está na última etapa (documentos), finalizar
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
        setCurrentStep(currentStep - 1);
        setError(null);
    }
  };


  const handleStartForm = () => {
    setShowInstructions(false);
    setCurrentStep(1);
  };

  const handleTabChange = async (tabId: number) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    // Animação de transição
    await new Promise(resolve => setTimeout(resolve, 200));
    setActiveTab(tabId);
    
    // Marcar aba como visitada
    if (!completedTabs.includes(tabId)) {
      setCompletedTabs(prev => [...prev, tabId]);
    }
    
    setIsAnimating(false);
  };


  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return cpfValid &&
               formData.name.trim().length >= 2 && 
               validateEmail(formData.email) && 
               validatePhone(formData.phone) && 
               formData.rg.trim().length >= 1 && 
               formData.birthDate && 
               validateAge(formData.birthDate) &&
               formData.maritalStatus;
      case 2:
        return cepValid &&
               formData.address.street.trim().length >= 3 && 
               formData.address.number.trim().length >= 1 && 
               formData.address.neighborhood.trim().length >= 2 && 
               formData.address.city.trim().length >= 2 && 
               formData.address.state.trim().length === 2 && 
               CepService.validarFormatoCep(formData.address.zipCode);
      case 3:
        return formData.profession.trim().length >= 2 && 
               formData.monthlyIncome && formData.monthlyIncome > 0 && 
               formData.monthlyIncome >= 1000; // Renda mínima de R$ 1.000
      case 4:
        // Etapa 4: Dados do Cônjuge
        if (formData.hasSpouse) {
          return formData.spouseName.trim().length >= 2 && 
                 validateCPF(formData.spouseCpf) && 
                 formData.spouseRg.trim().length >= 1 && 
                 formData.spouseBirthDate && 
                 validateAge(formData.spouseBirthDate) &&
                 formData.spouseProfession.trim().length >= 2 && 
                 formData.spouseMonthlyIncome > 0 &&
                 formData.spouseMonthlyIncome >= 1000;
        }
        return true; // Se não tem cônjuge, etapa é válida
      case 5:
        // Etapa 5: Dados da Empresa
        if (formData.hasCompany) {
          return formData.companyCnpj.trim().length >= 14 && 
                 formData.companyName.trim().length >= 2 && 
                 formData.companyAddress.street.trim().length >= 3 && 
                 formData.companyAddress.number.trim().length >= 1 && 
                 formData.companyAddress.neighborhood.trim().length >= 2 && 
                 formData.companyAddress.city.trim().length >= 2 && 
                 formData.companyAddress.state.trim().length === 2 && 
                 formData.companyAddress.zipCode.trim().length >= 8;
        }
        return true; // Se não tem empresa, etapa é válida
      case 6:
        // Etapa 6: Documentos - sempre válida pois são opcionais
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validação final de todos os campos obrigatórios
      if (!validateCurrentStep()) {
        setError('Por favor, preencha todos os campos obrigatórios');
        setLoading(false);
        return;
      }

      // Debug: verificar documentos antes do envio
      console.log('🔍 [DEBUG] Documentos no formData:', formData.documents);
      console.log('🔍 [DEBUG] Quantidade de documentos:', formData.documents?.length || 0);
      console.log('🔍 [DEBUG] Estrutura dos documentos:', JSON.stringify(formData.documents, null, 2));

      // Calcular flags de documentos baseado nos documentos enviados
      const documentFlags = {
        hasRG: formData.documents.some(doc => doc.documentType === 'identity') || formData.hasRG,
        hasCPF: formData.documents.some(doc => doc.documentType === 'identity') || formData.hasCPF,
        hasAddressProof: formData.documents.some(doc => doc.documentType === 'address_proof'),
        hasMaritalStatusProof: formData.documents.some(doc => doc.documentType === 'marital_status'),
        hasIncomeProof: formData.documents.some(doc => doc.documentType === 'income_proof'),
        hasCompanyDocs: formData.documents.some(doc => ['contract_social', 'cnpj'].includes(doc.documentType)),
        hasContractSocial: formData.documents.some(doc => doc.documentType === 'contract_social'),
        hasCNPJ: formData.documents.some(doc => doc.documentType === 'cnpj'),
        hasTaxReturn: formData.documents.some(doc => doc.documentType === 'tax_return'),
        hasBankStatements: formData.documents.some(doc => doc.documentType === 'bank_statements'),
        hasSpouseRG: formData.documents.some(doc => doc.documentType === 'spouse_identity'),
        hasSpouseCPF: formData.documents.some(doc => doc.documentType === 'spouse_identity'),
        hasSpouseAddressProof: formData.documents.some(doc => doc.documentType === 'spouse_address_proof'),
        hasSpouseMaritalStatusProof: formData.documents.some(doc => doc.documentType === 'spouse_marital_status'),
        hasSpouseIncomeProof: formData.documents.some(doc => doc.documentType === 'spouse_income_proof'),
        hasSpouseTaxReturn: formData.documents.some(doc => doc.documentType === 'spouse_tax_return'),
        hasSpouseBankStatements: formData.documents.some(doc => doc.documentType === 'spouse_bank_statements'),
      };

      // Preparar dados do lead
      const leadData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        cpf: formData.cpf,
        rg: formData.rg,
        birthDate: formData.birthDate,
        maritalStatus: formData.maritalStatus,
        address: formData.address,
        profession: formData.profession,
        employmentType: formData.employmentType,
        monthlyIncome: formData.monthlyIncome,
        companyName: formData.personalCompanyName,
        hasCompany: formData.hasCompany,
        companyCnpj: formData.companyCnpj,
        companyAddress: formData.companyAddress,
        hasSpouse: formData.hasSpouse,
        spouseName: formData.spouseName,
        spouseCpf: formData.spouseCpf,
        spouseRg: formData.spouseRg,
        spouseBirthDate: formData.spouseBirthDate,
        spouseProfession: formData.spouseProfession,
        spouseEmploymentType: formData.spouseEmploymentType,
        spouseMonthlyIncome: formData.spouseMonthlyIncome,
        spouseCompanyName: formData.spouseCompanyName,
        // Documentos pessoais
        hasRG: documentFlags.hasRG,
        hasCPF: documentFlags.hasCPF,
        hasAddressProof: documentFlags.hasAddressProof,
        hasMaritalStatusProof: documentFlags.hasMaritalStatusProof,
        // Documentos empresariais
        hasCompanyDocs: documentFlags.hasCompanyDocs,
        hasContractSocial: documentFlags.hasContractSocial,
        hasCNPJ: documentFlags.hasCNPJ,
        // Comprovação de renda
        hasIncomeProof: documentFlags.hasIncomeProof,
        hasTaxReturn: documentFlags.hasTaxReturn,
        hasBankStatements: documentFlags.hasBankStatements,
        // Documentos do cônjuge
        hasSpouseRG: documentFlags.hasSpouseRG,
        hasSpouseCPF: documentFlags.hasSpouseCPF,
        hasSpouseAddressProof: documentFlags.hasSpouseAddressProof,
        hasSpouseMaritalStatusProof: documentFlags.hasSpouseMaritalStatusProof,
        hasSpouseIncomeProof: documentFlags.hasSpouseIncomeProof,
        hasSpouseTaxReturn: documentFlags.hasSpouseTaxReturn,
        hasSpouseBankStatements: documentFlags.hasSpouseBankStatements,
        uploadedDocuments: formData.documents,
        notes: formData.notes,
        type: 'consultoria',
        source: 'lead_consultoria'
      };

      // Debug: verificar leadData antes do envio
      console.log('🔍 [DEBUG] leadData completo:', leadData);
      console.log('🔍 [DEBUG] uploadedDocuments no leadData:', leadData.uploadedDocuments);
      console.log('🔍 [DEBUG] Quantidade de documentos no leadData:', leadData.uploadedDocuments?.length || 0);

      // Enviar pré-cadastro
      const response = await fetch('/api/pre-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar formulário');
      }
      
      setSuccess(true);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Erro ao finalizar cadastro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };


  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <div className="card-content">
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
      </div>
    );
  }

  if (showInstructions) {
    const steps = [
      {
        id: 0,
        title: 'Bem-vindo',
        icon: <Activity className="w-6 h-6" />,
        content: (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Activity className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Bem-vindo ao Pré-Cadastro</h2>
            <p className="text-tellus-gold-100 text-lg leading-relaxed mb-8">
              Processo rápido e seguro para consultoria financeira
            </p>
            

            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-white/90">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span>Processo 100% seguro e confidencial</span>
              </div>
              <div className="flex items-center space-x-3 text-white/90">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span>Progresso salvo automaticamente</span>
              </div>
              <div className="flex items-center space-x-3 text-white/90">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span className="font-semibold">Análise Rápida: <span className="text-green-300 font-bold">1-3 dias úteis</span></span>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 1,
        title: 'Documentos',
        icon: <FileText className="w-6 h-6" />,
        content: (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Documentos Necessários</h2>
            <p className="text-tellus-gold-100 text-lg leading-relaxed mb-8">
              Prepare os documentos listados abaixo para agilizar o processo
            </p>
            
            <div className="space-y-6 text-left lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <User className="w-5 h-5 mr-3" />
                  Documentos Pessoais
                </h3>
                <div className="space-y-3">
                  {[
                    'RG (Registro Geral)',
                    'CPF',
                    'Comprovante de Residência (últimos 3 meses)',
                    'Comprovante de Estado Civil',
                    'E-mail válido'
                  ].map((doc, index) => (
                    <div key={index} className="flex items-center space-x-3 text-white/90">
                      <CheckCircle className="w-4 h-4 text-green-300 flex-shrink-0" />
                      <span className="text-sm">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-3" />
                  Documentos Financeiros
                </h3>
                <div className="space-y-3">
                  {[
                    'Comprovante de Renda',
                    'Extratos bancários (3 meses)',
                    'Declaração de Imposto de Renda',
                    'Documentos da Empresa (se aplicável)'
                  ].map((doc, index) => (
                    <div key={index} className="flex items-center space-x-3 text-white/90">
                      <CheckCircle className="w-4 h-4 text-green-300 flex-shrink-0" />
                      <span className="text-sm">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )
      },
      {
        id: 2,
        title: 'Importante',
        icon: <AlertCircle className="w-6 h-6" />,
        content: (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Informações Importantes</h2>
            <p className="text-tellus-gold-100 text-lg leading-relaxed mb-8">
              Leia atentamente antes de prosseguir
            </p>
            
            <div className="space-y-4 text-left lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-3" />
                  Requisitos dos Documentos
                </h3>
                <div className="space-y-2 text-white/90 text-sm">
                  <div>• Documentos legíveis e dentro da validade</div>
                  <div>• Para casados, ambos devem apresentar</div>
                  <div>• PDF preferível para envio digital</div>
                  <div>• Mantenha cópias dos documentos</div>
                  <div>• Certidões com prazo de validade</div>
                  <div>• Extratos bancários completos (todas as páginas)</div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-3" />
                  Processo em Duas Etapas
                </h3>
                <div className="space-y-2 text-white/90 text-sm">
                  <div>• 1ª Etapa: Documentação pessoal e renda</div>
                  <div>• 2ª Etapa: Análise e aprovação</div>
                  <div>• Análise Rápida: 1-3 dias úteis</div>
                  <div>• Progresso salvo automaticamente</div>
                  <div>• Atualizações por email</div>
                </div>
                </div>
              </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mt-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-3" />
                Cartilha de Documentação
                </h3>
              <p className="text-white/90 text-sm leading-relaxed mb-4">
                Este formulário segue a cartilha oficial de documentação para crédito imobiliário. 
                Todos os campos são baseados nos requisitos documentais necessários para análise de crédito.
              </p>
              <div className="space-y-2 text-white/90 text-sm">
                <div>• Documentos pessoais e comprovação de renda</div>
                <div>• Documentos empresariais (se aplicável)</div>
                <div>• Documentação do cônjuge (se casado)</div>
              </div>
            </div>
          </div>
        )
      }
    ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-tellus-charcoal-900 via-tellus-charcoal-800 to-tellus-charcoal-700">
        {/* Header Mobile */}
        <div className="bg-white/10 backdrop-blur-sm">
          <div className="max-w-md mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Tellure</h1>
                  <p className="text-xs text-tellus-gold-100">Consultoria Financeira</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card Central Responsivo */}
        <div className="max-w-md lg:max-w-4xl xl:max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
            {/* Progress Indicator */}
            <div className="px-6 py-4 border-b border-white/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-tellus-gold-100">Passo {activeTab + 1} de {steps.length}</span>
                <span className="text-sm text-white font-semibold">{steps[activeTab].title}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((activeTab + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Content */}
            <div className="p-8 min-h-[500px] flex flex-col justify-center">
              <div className="w-full lg:max-w-4xl mx-auto">
                {steps[activeTab].content}
              </div>
            </div>

            {/* Navigation */}
            <div className="px-6 py-6 border-t border-white/20">
              <div className="flex items-center justify-between mb-6 max-w-2xl mx-auto">
                <button
                  onClick={() => activeTab > 0 && handleTabChange(activeTab - 1)}
                  disabled={activeTab === 0}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeTab === 0 
                      ? 'text-white/30 cursor-not-allowed' 
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  Voltar
                </button>
                
                <div className="flex space-x-2">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === activeTab 
                          ? 'bg-white' 
                          : index < activeTab 
                          ? 'bg-white/60' 
                          : 'bg-white/20'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => activeTab < steps.length - 1 ? handleTabChange(activeTab + 1) : null}
                  disabled={activeTab === steps.length - 1}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeTab === steps.length - 1 
                      ? 'text-white/30 cursor-not-allowed' 
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  Próximo
                </button>
              </div>

              {/* Terms and Start Button */}
              {activeTab === steps.length - 1 && (
                <div className="space-y-4 max-w-2xl mx-auto">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-tellus-primary border-white/30 rounded mt-1"
                    />
                    <label htmlFor="acceptTerms" className="text-xs text-white/90 leading-relaxed">
                      <span className="font-semibold text-white">Concordo com os termos de uso</span> e confirmo que tenho todos os documentos necessários para prosseguir com o pré-cadastro.
                    </label>
                  </div>
                  
                  <button
                    onClick={handleStartForm}
                    disabled={!acceptedTerms}
                    className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-200 ${
                      acceptedTerms
                        ? 'bg-white text-blue-600 hover:bg-white/90 shadow-lg transform hover:scale-105'
                        : 'bg-white/20 text-white/50 cursor-not-allowed'
                    }`}
                  >
                    Iniciar Pré-Cadastro
                    <ArrowRight className="w-5 h-5 ml-2 inline" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Moderno */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-tellus-primary to-tellus-charcoal-900 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Tellure</h1>
                <p className="text-xs text-gray-500 font-medium">Consultoria Financeira</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 py-8">
        {/* Progress Mobile-First */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-lg mb-6 overflow-hidden">
          <div className="p-4">
            {/* Header Compacto */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-gray-900 truncate">Pré-Cadastro para Consultoria Financeira</h2>
                <p className="text-sm text-gray-600">Etapa {currentStep} de {totalSteps}</p>
                  </div>
              <div className="flex items-center space-x-2 ml-3">
                <div className="w-10 h-10 bg-gradient-to-r from-tellus-primary to-tellus-charcoal-900 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {Math.round((currentStep / totalSteps) * 100)}%
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div 
                className="bg-gradient-to-r from-tellus-primary to-tellus-charcoal-900 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
            
            {/* Status Info */}
          </div>
        </div>

        {/* Form Mobile-First */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-lg overflow-hidden">
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Step 1: Dados Pessoais */}
            {currentStep === 1 && (
              <div className="space-y-8 animate-fadeIn">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-tellus-primary to-tellus-charcoal-900 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Dados Pessoais</h3>
                  <p className="text-sm text-gray-600">Informe seus dados básicos para identificação</p>
                </div>

                <div className="space-y-4">
                  {/* CPF - Primeiro campo */}
                  <div className="animate-slideInUp" style={{ animationDelay: '0.3s' }}>
                    <div className="relative">
                      <Input
                        label="CPF *"
                        value={formatCPF(formData.cpf)}
                        onChange={(e) => handleChange('cpf', e.target.value)}
                        placeholder="000.000.000-00"
                        maxLength={14}
                      />
                      {consultingCPF && (
                        <div className="absolute right-3 top-8">
                          <LoadingSpinner size="sm" />
                        </div>
                      )}
                    </div>
                    {formData.cpf && !validateCPF(formData.cpf) && (
                      <p className="text-red-500 text-xs mt-1">CPF inválido</p>
                    )}
                    {cpfConsulted && (
                      <p className="text-green-600 text-xs mt-1">✓ Dados preenchidos automaticamente</p>
                    )}
                    {cpfNotFound && (
                      <p className="text-yellow-600 text-xs mt-1">⚠️ CPF válido mas não encontrado. Preencha os dados manualmente.</p>
                    )}
                    {!cpfValid && formData.cpf && (
                      <p className="text-gray-500 text-xs mt-1">Digite um CPF válido para continuar</p>
                    )}
                  </div>

                  {/* Campos bloqueados até CPF válido */}
                  {!cpfValid && (
                    <div className="bg-tellus-gold-50 border border-tellus-gold-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-5 h-5 text-blue-600" />
                        <p className="text-sm text-tellus-charcoal-800">
                          Digite um CPF válido para desbloquear os demais campos
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${!cpfValid ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="sm:col-span-2 animate-slideInUp" style={{ animationDelay: '0.4s' }}>
                      <Input
                        label="Nome Completo *"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Digite seu nome completo"
                        maxLength={100}
                        disabled={!cpfValid}
                      />
                      {formData.name && formData.name.trim().length < 2 && (
                        <p className="text-red-500 text-xs mt-1">Nome deve ter pelo menos 2 caracteres</p>
                      )}
                    </div>

                    <div className="animate-slideInUp" style={{ animationDelay: '0.5s' }}>
                      <Input
                        label="Email *"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="seu@email.com"
                        maxLength={100}
                        disabled={!cpfValid}
                      />
                      {formData.email && !validateEmail(formData.email) && (
                        <p className="text-red-500 text-xs mt-1">Email inválido</p>
                      )}
                    </div>

                    <div className="animate-slideInUp" style={{ animationDelay: '0.6s' }}>
                      <Input
                        label="Telefone *"
                        value={formatPhone(formData.phone)}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="(11) 99999-9999"
                        maxLength={15}
                        disabled={!cpfValid}
                      />
                      {formData.phone && !validatePhone(formData.phone) && (
                        <p className="text-red-500 text-xs mt-1">Telefone deve ter 10 ou 11 dígitos</p>
                      )}
                    </div>
                  </div>

                  <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${!cpfValid ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="animate-slideInUp" style={{ animationDelay: '0.7s' }}>
                      <Input
                        label="RG *"
                        value={formData.rg}
                        onChange={(e) => handleChange('rg', e.target.value)}
                        placeholder="Digite seu RG conforme emitido"
                        disabled={!cpfValid}
                      />
                      {formData.rg && formData.rg.trim().length < 1 && (
                        <p className="text-red-500 text-xs mt-1">RG é obrigatório</p>
                      )}
                    </div>

                    <div className="animate-slideInUp" style={{ animationDelay: '0.8s' }}>
                      <Input
                        label="Data de Nascimento *"
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => handleChange('birthDate', e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        disabled={!cpfValid}
                      />
                      {formData.birthDate && !validateAge(formData.birthDate) && (
                        <p className="text-red-500 text-xs mt-1">Idade mínima de 18 anos</p>
                      )}
                    </div>

                    <div className="sm:col-span-2 space-y-1 animate-slideInUp" style={{ animationDelay: '0.9s' }}>
                      <label className="text-sm font-medium text-gray-700">Estado Civil *</label>
                      <select
                        value={formData.maritalStatus}
                        onChange={(e) => handleChange('maritalStatus', e.target.value)}
                        className="input"
                        disabled={!cpfValid}
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
              </div>
            )}

            {/* Step 2: Endereço */}
            {currentStep === 2 && (
              <div className="space-y-8">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-tellus-primary to-tellus-charcoal-900 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Home className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Endereço Residencial</h3>
                  <p className="text-sm text-gray-600">Digite o CEP para preenchimento automático</p>
                </div>

                <div className="space-y-4">
                  {/* CEP - Primeiro campo */}
                  <div className="animate-slideInUp" style={{ animationDelay: '0.3s' }}>
                    <div className="relative">
                      <Input
                        label="CEP *"
                        value={formatCEP(formData.address.zipCode)}
                        onChange={(e) => handleChange('address.zipCode', e.target.value)}
                        placeholder="00000-000"
                        maxLength={9}
                      />
                      {consultingCEP && (
                        <div className="absolute right-3 top-8">
                          <LoadingSpinner size="sm" />
                        </div>
                      )}
                    </div>
                    {formData.address.zipCode && !CepService.validarFormatoCep(formData.address.zipCode) && (
                      <p className="text-red-500 text-xs mt-1">CEP inválido</p>
                    )}
                    {cepConsulted && (
                      <p className="text-green-600 text-xs mt-1">✓ Endereço preenchido automaticamente</p>
                    )}
                    {cepNotFound && (
                      <p className="text-yellow-600 text-xs mt-1">⚠️ CEP não encontrado. Preencha os dados manualmente.</p>
                    )}
                    {!cepValid && formData.address.zipCode && (
                      <p className="text-gray-500 text-xs mt-1">Digite um CEP válido para continuar</p>
                    )}
                  </div>

                  {/* Campos bloqueados até CEP válido */}
                  {!cepValid && (
                    <div className="bg-tellus-gold-50 border border-tellus-gold-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-5 h-5 text-blue-600" />
                        <p className="text-sm text-tellus-charcoal-800">
                          Digite um CEP válido para desbloquear os demais campos
                        </p>
                      </div>
                    </div>
                  )}

                  <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${!cepValid ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="sm:col-span-2 animate-slideInUp" style={{ animationDelay: '0.4s' }}>
                      <Input
                        label="Rua *"
                        value={formData.address.street}
                        onChange={(e) => handleChange('address.street', e.target.value)}
                        placeholder="Nome da rua"
                        maxLength={100}
                        disabled={!cepValid}
                      />
                      {formData.address.street && formData.address.street.trim().length < 3 && (
                        <p className="text-red-500 text-xs mt-1">Nome da rua deve ter pelo menos 3 caracteres</p>
                      )}
                    </div>

                    <div className="animate-slideInUp" style={{ animationDelay: '0.5s' }}>
                      <Input
                        label="Número *"
                        value={formData.address.number}
                        onChange={(e) => handleChange('address.number', e.target.value)}
                        placeholder="123"
                        maxLength={10}
                        disabled={!cepValid}
                      />
                      {formData.address.number && formData.address.number.trim().length < 1 && (
                        <p className="text-red-500 text-xs mt-1">Número é obrigatório</p>
                      )}
                    </div>

                    <div className="animate-slideInUp" style={{ animationDelay: '0.6s' }}>
                      <Input
                        label="Complemento"
                        value={formData.address.complement}
                        onChange={(e) => handleChange('address.complement', e.target.value)}
                        placeholder="Apto, casa, etc."
                        maxLength={50}
                        disabled={!cepValid}
                      />
                    </div>

                    <div className="animate-slideInUp" style={{ animationDelay: '0.7s' }}>
                      <Input
                        label="Bairro *"
                        value={formData.address.neighborhood}
                        onChange={(e) => handleChange('address.neighborhood', e.target.value)}
                        placeholder="Nome do bairro"
                        maxLength={50}
                        disabled={!cepValid}
                      />
                      {formData.address.neighborhood && formData.address.neighborhood.trim().length < 2 && (
                        <p className="text-red-500 text-xs mt-1">Nome do bairro deve ter pelo menos 2 caracteres</p>
                      )}
                    </div>

                    <div className="animate-slideInUp" style={{ animationDelay: '0.8s' }}>
                      <Input
                        label="Cidade *"
                        value={formData.address.city}
                        onChange={(e) => handleChange('address.city', e.target.value)}
                        placeholder="Nome da cidade"
                        maxLength={50}
                        disabled={!cepValid}
                      />
                      {formData.address.city && formData.address.city.trim().length < 2 && (
                        <p className="text-red-500 text-xs mt-1">Nome da cidade deve ter pelo menos 2 caracteres</p>
                      )}
                    </div>

                    <div className="animate-slideInUp" style={{ animationDelay: '0.9s' }}>
                      <StateSelect
                        label="Estado *"
                        value={formData.address.state}
                        onChange={(value) => handleChange('address.state', value)}
                        placeholder="Selecione o estado"
                        disabled={!cepValid}
                        required
                        error={formData.address.state && formData.address.state.trim().length !== 2 ? "Selecione um estado" : undefined}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Dados Profissionais */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-tellus-primary to-tellus-charcoal-900 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Dados Profissionais</h3>
                  <p className="text-sm text-gray-600">Informe sua situação profissional e renda</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                  <Input
                    label="Profissão *"
                    value={formData.profession}
                    onChange={(e) => handleChange('profession', e.target.value)}
                    placeholder="Ex: Engenheiro, Professor, etc."
                      maxLength={50}
                  />
                    {formData.profession && formData.profession.trim().length < 2 && (
                      <p className="text-red-500 text-xs mt-1">Profissão deve ter pelo menos 2 caracteres</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Tipo de Emprego *</label>
                    <select
                      value={formData.employmentType}
                      onChange={(e) => handleChange('employmentType', e.target.value)}
                      className="input"
                    >
                      <option value="clt">CLT</option>
                      <option value="servidor_publico">Servidor Público</option>
                      <option value="autonomo">Autônomo</option>
                      <option value="empresario">Empresário</option>
                      <option value="aposentado">Aposentado</option>
                    </select>
                  </div>

                  <div>
                  <Input
                    label="Renda Mensal *"
                    type="text"
                    value={formData.monthlyIncome && formData.monthlyIncome > 0 ? new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format(formData.monthlyIncome) : ''}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/[^\d]/g, '');
                      const numericValue = rawValue ? parseFloat(rawValue) / 100 : null;
                      handleChange('monthlyIncome', numericValue);
                    }}
                    placeholder="R$ 5.000,00"
                      maxLength={15}
                  />
                    {formData.monthlyIncome && formData.monthlyIncome < 1000 && (
                      <p className="text-red-500 text-xs mt-1">Renda mínima de R$ 1.000,00</p>
                    )}
                  </div>

                  <Input
                    label="Empresa (se aplicável)"
                    value={formData.personalCompanyName}
                    onChange={(e) => handleChange('personalCompanyName', e.target.value)}
                    placeholder="Nome da empresa"
                    maxLength={100}
                  />
                </div>
              </div>
            )}


            {/* Step 4: Dados do Cônjuge */}
            {currentStep === 4 && (
              <div className="space-y-8">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-tellus-primary to-tellus-charcoal-900 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Dados do Cônjuge</h3>
                  <p className="text-sm text-gray-600">Informe os dados do seu cônjuge (se aplicável)</p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="hasSpouse"
                      checked={formData.hasSpouse}
                      onChange={(e) => handleChange('hasSpouse', e.target.checked)}
                      className="h-4 w-4 text-tellus-primary focus:ring-tellus-primary border-gray-300 rounded"
                    />
                    <label htmlFor="hasSpouse" className="text-sm font-medium text-gray-700">
                      Possuo cônjuge/companheiro(a)
                    </label>
                  </div>

                  {formData.hasSpouse && (
                    <div className="space-y-6 animate-fadeIn">
                      <div className="bg-tellus-gold-50 border border-tellus-gold-200 rounded-lg p-4">
                        <p className="text-sm text-tellus-charcoal-800">
                          <strong>Importante:</strong> Para casados, ambos devem apresentar todos os documentos pessoais e de renda.
                        </p>
                      </div>

                      {/* CPF primeiro - para puxar dados automaticamente */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <div className="relative">
                            <Input
                              label="CPF do Cônjuge *"
                              value={formatCPF(formData.spouseCpf)}
                              onChange={(e) => {
                                handleChange('spouseCpf', e.target.value);
                                // Consultar CPF quando tiver 11 dígitos
                                const cpfLimpo = e.target.value.replace(/\D/g, '');
                                if (cpfLimpo.length === 11) {
                                  consultarCPFConjuge(e.target.value);
                                }
                              }}
                              placeholder="000.000.000-00"
                              maxLength={14}
                            />
                            {consultingCPF && (
                              <div className="absolute right-3 top-8">
                                <LoadingSpinner size="sm" />
                              </div>
                            )}
                          </div>
                          {formData.spouseCpf && !validateCPF(formData.spouseCpf) && (
                            <p className="text-red-500 text-xs mt-1">CPF inválido</p>
                          )}
                          {formData.spouseCpf && formData.cpf && formData.spouseCpf.replace(/\D/g, '') === formData.cpf.replace(/\D/g, '') && (
                            <p className="text-red-500 text-xs mt-1">O CPF do cônjuge não pode ser igual ao CPF do titular</p>
                          )}
                          {cpfConsulted && (
                            <p className="text-green-600 text-xs mt-1">✓ Dados preenchidos automaticamente</p>
                          )}
                        </div>
                      </div>

                      {/* Campos bloqueados até CPF válido */}
                      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${!cpfValid ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="sm:col-span-2">
                          <Input
                            label="Nome Completo do Cônjuge *"
                            value={formData.spouseName}
                            onChange={(e) => handleChange('spouseName', e.target.value)}
                            placeholder="Digite o nome completo do cônjuge"
                            maxLength={100}
                          />
                          {formData.spouseName && formData.spouseName.trim().length < 2 && (
                            <p className="text-red-500 text-xs mt-1">Nome deve ter pelo menos 2 caracteres</p>
                          )}
                        </div>

                        <div>
                          <Input
                            label="RG do Cônjuge *"
                            value={formData.spouseRg}
                            onChange={(e) => handleChange('spouseRg', e.target.value)}
                            placeholder="Digite o RG conforme emitido"
                          />
                          {formData.spouseRg && formData.spouseRg.trim().length < 1 && (
                            <p className="text-red-500 text-xs mt-1">RG é obrigatório</p>
                          )}
                        </div>

                        <div>
                          <Input
                            label="Data de Nascimento do Cônjuge *"
                            type="date"
                            value={formData.spouseBirthDate}
                            onChange={(e) => handleChange('spouseBirthDate', e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                          />
                          {formData.spouseBirthDate && !validateAge(formData.spouseBirthDate) && (
                            <p className="text-red-500 text-xs mt-1">Idade mínima de 18 anos</p>
                          )}
                        </div>

                        <div>
                          <Input
                            label="Profissão do Cônjuge *"
                            value={formData.spouseProfession}
                            onChange={(e) => handleChange('spouseProfession', e.target.value)}
                            placeholder="Ex: Engenheiro, Professor, etc."
                            maxLength={50}
                          />
                          {formData.spouseProfession && formData.spouseProfession.trim().length < 2 && (
                            <p className="text-red-500 text-xs mt-1">Profissão deve ter pelo menos 2 caracteres</p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">Tipo de Emprego do Cônjuge *</label>
                          <select
                            value={formData.spouseEmploymentType}
                            onChange={(e) => handleChange('spouseEmploymentType', e.target.value)}
                            className="input"
                          >
                            <option value="clt">CLT</option>
                            <option value="servidor_publico">Servidor Público</option>
                            <option value="autonomo">Autônomo</option>
                            <option value="empresario">Empresário</option>
                            <option value="aposentado">Aposentado</option>
                          </select>
                        </div>

                        <div>
                              <Input
                                label="Renda Mensal do Cônjuge *"
                                type="text"
                                value={formData.spouseMonthlyIncome && formData.spouseMonthlyIncome > 0 ? new Intl.NumberFormat('pt-BR', { 
                                  style: 'currency', 
                                  currency: 'BRL' 
                                }).format(formData.spouseMonthlyIncome) : ''}
                                onChange={(e) => {
                                  const rawValue = e.target.value.replace(/[^\d]/g, '');
                                  const numericValue = rawValue ? parseFloat(rawValue) / 100 : null;
                                  handleChange('spouseMonthlyIncome', numericValue);
                                }}
                                placeholder="R$ 5.000,00"
                                maxLength={15}
                              />
                          {formData.spouseMonthlyIncome && formData.spouseMonthlyIncome < 1000 && (
                            <p className="text-red-500 text-xs mt-1">Renda mínima de R$ 1.000</p>
                          )}
                        </div>

                        <Input
                          label="Empresa do Cônjuge (se aplicável)"
                          value={formData.spouseCompanyName}
                          onChange={(e) => handleChange('spouseCompanyName', e.target.value)}
                          placeholder="Nome da empresa"
                          maxLength={100}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 5: Dados da Empresa */}
            {currentStep === 5 && (
              <div className="space-y-8">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-tellus-primary to-tellus-charcoal-900 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Dados da Empresa</h3>
                  <p className="text-sm text-gray-600">Informe se possui empresa e seus dados</p>
                </div>

                <div className="space-y-6">
                  {/* Checkbox para Empresa */}
                  <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <input
                      type="checkbox"
                      id="hasCompany"
                      checked={formData.hasCompany}
                      onChange={(e) => handleChange('hasCompany', e.target.checked)}
                      className="h-5 w-5 text-tellus-primary focus:ring-tellus-primary border-gray-300 rounded mt-1"
                    />
                    <div className="flex-1">
                      <label htmlFor="hasCompany" className="text-sm font-medium text-gray-900 cursor-pointer">
                        Possuo uma empresa (Pessoa Jurídica)
                      </label>
                      <p className="text-xs text-gray-600 mt-1">
                        Marque se você tem uma empresa registrada (CNPJ)
                      </p>
                    </div>
                  </div>

                  {/* Formulário da Empresa - Condicional */}
                  {formData.hasCompany && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Informações da Empresa</h4>
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-green-800">
                          <strong>Importante:</strong> Para empresas, é necessário apresentar todos os documentos empresariais obrigatórios.
                        </p>
                      </div>

                      <div className="space-y-6 animate-fadeIn">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="sm:col-span-2">
                            <div className="relative">
                              <Input
                                label="CNPJ da Empresa *"
                                value={formatCNPJ(formData.companyCnpj)}
                                onChange={(e) => handleChange('companyCnpj', e.target.value)}
                                placeholder="00.000.000/0000-00"
                                maxLength={18}
                              />
                              {consultingCNPJ && (
                                <div className="absolute right-3 top-8">
                                  <LoadingSpinner size="sm" />
                                </div>
                              )}
                            </div>
                            {formData.companyCnpj && !validateCNPJ(formData.companyCnpj) && (
                              <p className="text-red-500 text-xs mt-1">CNPJ inválido</p>
                            )}
                            {cnpjConsulted && (
                              <p className="text-green-600 text-xs mt-1">✓ Dados preenchidos automaticamente</p>
                            )}
                            {cnpjNotFound && (
                              <p className="text-yellow-600 text-xs mt-1">⚠️ CNPJ válido mas não encontrado. Preencha os dados manualmente.</p>
                            )}
                          </div>

                          <div className="sm:col-span-2">
                            <Input
                              label="Razão Social da Empresa *"
                              value={formData.companyName}
                              onChange={(e) => handleChange('companyName', e.target.value)}
                              placeholder="Nome completo da empresa"
                              maxLength={200}
                            />
                            {formData.companyName && formData.companyName.trim().length < 2 && (
                              <p className="text-red-500 text-xs mt-1">Razão social deve ter pelo menos 2 caracteres</p>
                            )}
                          </div>
                        </div>

                        <div className="border-t pt-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Endereço da Empresa</h4>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="sm:col-span-2">
                              <Input
                                label="Rua *"
                                value={formData.companyAddress.street}
                                onChange={(e) => handleChange('companyAddress.street', e.target.value)}
                                placeholder="Nome da rua"
                                maxLength={100}
                              />
                              {formData.companyAddress.street && formData.companyAddress.street.trim().length < 3 && (
                                <p className="text-red-500 text-xs mt-1">Nome da rua deve ter pelo menos 3 caracteres</p>
                              )}
                            </div>

                            <div>
                              <Input
                                label="Número *"
                                value={formData.companyAddress.number}
                                onChange={(e) => handleChange('companyAddress.number', e.target.value)}
                                placeholder="123"
                                maxLength={10}
                              />
                              {formData.companyAddress.number && formData.companyAddress.number.trim().length < 1 && (
                                <p className="text-red-500 text-xs mt-1">Número é obrigatório</p>
                              )}
                            </div>

                            <div>
                              <Input
                                label="Complemento"
                                value={formData.companyAddress.complement}
                                onChange={(e) => handleChange('companyAddress.complement', e.target.value)}
                                placeholder="Sala, andar, etc."
                                maxLength={50}
                              />
                            </div>

                            <div>
                              <Input
                                label="Bairro *"
                                value={formData.companyAddress.neighborhood}
                                onChange={(e) => handleChange('companyAddress.neighborhood', e.target.value)}
                                placeholder="Nome do bairro"
                                maxLength={50}
                              />
                              {formData.companyAddress.neighborhood && formData.companyAddress.neighborhood.trim().length < 2 && (
                                <p className="text-red-500 text-xs mt-1">Nome do bairro deve ter pelo menos 2 caracteres</p>
                              )}
                            </div>

                            <div>
                              <Input
                                label="Cidade *"
                                value={formData.companyAddress.city}
                                onChange={(e) => handleChange('companyAddress.city', e.target.value)}
                                placeholder="Nome da cidade"
                                maxLength={50}
                              />
                              {formData.companyAddress.city && formData.companyAddress.city.trim().length < 2 && (
                                <p className="text-red-500 text-xs mt-1">Nome da cidade deve ter pelo menos 2 caracteres</p>
                              )}
                            </div>

                            <div>
                              <StateSelect
                                label="Estado *"
                                value={formData.companyAddress.state}
                                onChange={(value) => handleChange('companyAddress.state', value)}
                                placeholder="Selecione o estado"
                                required
                                error={formData.companyAddress.state && formData.companyAddress.state.trim().length !== 2 ? "Selecione um estado" : undefined}
                              />
                            </div>

                            <div>
                              <Input
                                label="CEP *"
                                value={formatCEP(formData.companyAddress.zipCode)}
                                onChange={(e) => handleChange('companyAddress.zipCode', e.target.value)}
                                placeholder="00000-000"
                                maxLength={9}
                              />
                              {formData.companyAddress.zipCode && !CepService.validarFormatoCep(formData.companyAddress.zipCode) && (
                                <p className="text-red-500 text-xs mt-1">CEP inválido</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 6: Upload de Documentos */}
            {currentStep === 6 && (
              <div className="space-y-8">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-tellus-primary to-tellus-charcoal-900 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Upload de Documentos</h3>
                  <p className="text-sm text-gray-600">Envie os documentos necessários conforme a cartilha de documentação</p>
                </div>

                <div className="space-y-6">
                  {/* Documentos para Comprador e Cônjuge */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2 text-tellus-primary" />
                      Para Comprador e Cônjuge (se houver)
                    </h4>
                    
                    <div className="space-y-6">
                      {/* 1. Documento de Identidade */}
                      <div>
                        <h5 className="text-base font-medium text-gray-800 mb-2">1. Documento de Identidade (RG ou CNH)</h5>
                        <p className="text-sm text-gray-600 mb-3">Pode anexar mais de 1 documento</p>
                        <DocumentUpload
                          sessionId=""
                          documentType="identity"
                          label="Documentos de Identidade"
                          description="RG, CNH ou outros documentos de identificação"
                          onUploadComplete={(documents) => {
                            setFormData(prev => ({
                              ...prev,
                              documents: [...prev.documents, ...documents]
                            }));
                          }}
                          onUploadError={(error) => setError(error)}
                          maxFiles={3}
                          userCpf={formData.cpf}
                        />
                      </div>

                      {/* 2. Comprovante de Estado Civil */}
                      <div>
                        <h5 className="text-base font-medium text-gray-800 mb-2">2. Comprovante de Estado Civil</h5>
                        <p className="text-sm text-gray-600 mb-3">Certidão de nascimento, óbito, casamento ou pacto antenupcial (se houver). Pode anexar mais de 1 documento</p>
                        <DocumentUpload
                          sessionId=""
                          documentType="marital_status"
                          label="Comprovante de Estado Civil"
                          description="Certidão de nascimento, óbito, casamento ou pacto antenupcial"
                          onUploadComplete={(documents) => {
                            setFormData(prev => ({
                              ...prev,
                              documents: [...prev.documents, ...documents]
                            }));
                          }}
                          onUploadError={(error) => setError(error)}
                          maxFiles={3}
                          userCpf={formData.cpf}
                        />
                      </div>

                      {/* 3. Comprovante de Residência */}
                      <div>
                        <h5 className="text-base font-medium text-gray-800 mb-2">3. Comprovante de Residência</h5>
                        <p className="text-sm text-gray-600 mb-3">Atualizado (últimos 3 meses)</p>
                        <DocumentUpload
                          sessionId=""
                          documentType="address_proof"
                          label="Comprovante de Residência"
                          description="Conta de luz, água, telefone, etc. (últimos 3 meses)"
                          onUploadComplete={(documents) => {
                            setFormData(prev => ({
                              ...prev,
                              documents: [...prev.documents, ...documents]
                            }));
                          }}
                          onUploadError={(error) => setError(error)}
                          maxFiles={2}
                          userCpf={formData.cpf}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Documentação para Pessoa Jurídica */}
                  {formData.employmentType === 'empresario' && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Briefcase className="w-5 h-5 mr-2 text-tellus-primary" />
                        Documentação para Pessoa Jurídica
                      </h4>
                      
                      <div className="space-y-6">
                        {/* 1. Contrato Social */}
                        <div>
                          <h5 className="text-base font-medium text-gray-800 mb-2">1. Contrato Social Completo</h5>
                          <DocumentUpload
                            sessionId=""
                            documentType="contract_social"
                            label="Contrato Social"
                            description="Contrato social completo da empresa"
                            onUploadComplete={(documents) => {
                              setFormData(prev => ({
                                ...prev,
                                documents: [...prev.documents, ...documents]
                              }));
                            }}
                            onUploadError={(error) => setError(error)}
                            maxFiles={1}
                            userCpf={formData.cpf}
                          />
                        </div>

                        {/* 2. Última Alteração Contratual */}
                        <div>
                          <h5 className="text-base font-medium text-gray-800 mb-2">2. Última Alteração Contratual</h5>
                          <p className="text-sm text-gray-600 mb-3">Se houver (não é obrigatório)</p>
                          <DocumentUpload
                            sessionId=""
                            documentType="contract_amendment"
                            label="Alteração Contratual"
                            description="Última alteração contratual (opcional)"
                            onUploadComplete={(documents) => {
                              setFormData(prev => ({
                                ...prev,
                                documents: [...prev.documents, ...documents]
                              }));
                            }}
                            onUploadError={(error) => setError(error)}
                            maxFiles={1}
                            userCpf={formData.cpf}
                          />
                        </div>

                        {/* 3. Cartão CNPJ */}
                        <div>
                          <h5 className="text-base font-medium text-gray-800 mb-2">3. Cartão CNPJ Atualizado</h5>
                          <DocumentUpload
                            sessionId=""
                            documentType="cnpj"
                            label="Cartão CNPJ"
                            description="Cartão CNPJ atualizado da empresa"
                            onUploadComplete={(documents) => {
                              setFormData(prev => ({
                                ...prev,
                                documents: [...prev.documents, ...documents]
                              }));
                            }}
                            onUploadError={(error) => setError(error)}
                            maxFiles={1}
                            userCpf={formData.cpf}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Para Empresários e Autônomos */}
                  {(formData.employmentType === 'empresario' || formData.employmentType === 'autonomo') && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <DollarSign className="w-5 h-5 mr-2 text-tellus-primary" />
                        Para Empresários e Autônomos
                      </h4>
                      
                      <div className="space-y-6">
                        {/* 1 e 2. Declaração de IR */}
                        <div>
                          <h5 className="text-base font-medium text-gray-800 mb-2">1 e 2. Declaração de Imposto de Renda</h5>
                          <p className="text-sm text-gray-600 mb-3">Completa do último exercício + Recibo de entrega</p>
                          <DocumentUpload
                            sessionId=""
                            documentType="tax_return"
                            label="Declaração de IR"
                            description="Declaração completa + Recibo de entrega"
                            onUploadComplete={(documents) => {
                              setFormData(prev => ({
                                ...prev,
                                documents: [...prev.documents, ...documents]
                              }));
                            }}
                            onUploadError={(error) => setError(error)}
                            maxFiles={2}
                            userCpf={formData.cpf}
                          />
                        </div>

                        {/* 3. Extratos Bancários */}
                        <div>
                          <h5 className="text-base font-medium text-gray-800 mb-2">3. Extratos Bancários</h5>
                          <DocumentUpload
                            sessionId=""
                            documentType="bank_statements"
                            label="Extratos Bancários"
                            description="Extratos bancários dos últimos 3 meses"
                            onUploadComplete={(documents) => {
                              setFormData(prev => ({
                                ...prev,
                                documents: [...prev.documents, ...documents]
                              }));
                            }}
                            onUploadError={(error) => setError(error)}
                            maxFiles={5}
                            userCpf={formData.cpf}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Documentos do Cônjuge */}
                  {formData.hasSpouse && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <User className="w-5 h-5 mr-2 text-tellus-primary" />
                        Documentos do Cônjuge
                      </h4>
                      <p className="text-sm text-gray-600 mb-4">Os mesmos documentos listados acima para o cônjuge</p>
                      
                      <div className="space-y-6">
                        <DocumentUpload
                          sessionId=""
                          documentType="spouse_identity"
                          label="Documentos de Identidade do Cônjuge"
                          description="RG, CNH do cônjuge"
                          onUploadComplete={(documents) => {
                            setFormData(prev => ({
                              ...prev,
                              documents: [...prev.documents, ...documents]
                            }));
                          }}
                          onUploadError={(error) => setError(error)}
                          maxFiles={3}
                          userCpf={formData.cpf}
                        />

                        <DocumentUpload
                          sessionId=""
                          documentType="spouse_marital_status"
                          label="Comprovante de Estado Civil do Cônjuge"
                          description="Certidões do cônjuge"
                          onUploadComplete={(documents) => {
                            setFormData(prev => ({
                              ...prev,
                              documents: [...prev.documents, ...documents]
                            }));
                          }}
                          onUploadError={(error) => setError(error)}
                          maxFiles={3}
                        />

                        <DocumentUpload
                          sessionId=""
                          documentType="spouse_address_proof"
                          label="Comprovante de Residência do Cônjuge"
                          description="Comprovante de residência do cônjuge"
                          onUploadComplete={(documents) => {
                            setFormData(prev => ({
                              ...prev,
                              documents: [...prev.documents, ...documents]
                            }));
                          }}
                          onUploadError={(error) => setError(error)}
                          maxFiles={2}
                          userCpf={formData.cpf}
                        />
                      </div>
                    </div>
                  )}

                  {/* Outros Documentos */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-tellus-primary" />
                      Outros Documentos
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Envie outros documentos que considere relevantes para a análise (máximo 15 documentos)
                    </p>
                    <DocumentUpload
                      sessionId=""
                      documentType="other_documents"
                      label="Outros Documentos"
                      description="Documentos adicionais relevantes para análise"
                      onUploadComplete={(documents) => {
                        setFormData(prev => ({
                          ...prev,
                          documents: [...prev.documents, ...documents]
                        }));
                      }}
                      onUploadError={(error) => setError(error)}
                      maxFiles={15}
                      userCpf={formData.cpf}
                    />
                  </div>

                  {/* Resumo dos Documentos Enviados */}
                  <div className="bg-tellus-gold-50 border border-tellus-gold-200 rounded-lg p-6">
                    <h4 className="font-semibold text-tellus-charcoal-900 mb-3 flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Documentos Enviados
                    </h4>
                    <p className="text-sm text-tellus-charcoal-800 mb-3">
                      Total: {formData.documents.length} documento(s) enviado(s)
                    </p>
                    {formData.documents.length > 0 && (
                      <div className="space-y-2">
                        {formData.documents.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-tellus-primary" />
                              <span className="text-sm text-tellus-charcoal-800">{doc.fileName}</span>
                            </div>
                            <span className="text-xs text-tellus-primary bg-tellus-gold-100 px-2 py-1 rounded">
                              {doc.documentType}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Observações Finais */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-tellus-primary" />
                      Observações Adicionais
                    </h4>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleChange('notes', e.target.value)}
                      rows={4}
                      className="input min-h-[100px] resize-y w-full"
                      placeholder="Informações adicionais que considere importantes para a análise de crédito..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Etapa 8 - Caso especial para quando o usuário está além do limite */}
            {currentStep > totalSteps && (
              <div className="space-y-8">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Erro de Navegação</h3>
                  <p className="text-sm text-gray-600">Você está em uma etapa inválida. Redirecionando para a última etapa válida...</p>
                </div>
                <div className="text-center">
                  <Button 
                    onClick={() => setCurrentStep(totalSteps)}
                    className="px-6 py-3 font-medium text-sm bg-gradient-to-r from-tellus-primary to-tellus-charcoal-900 hover:from-tellus-primary/90 hover:to-blue-600/90 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    Ir para Etapa {totalSteps}
                  </Button>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Navigation Mobile-First */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mt-8 gap-3 pt-6 border-t border-gray-200">
              <Button
                variant="secondary"
                onClick={prevStep}
                disabled={currentStep === 1 || loading}
                className={`px-6 py-3 font-medium text-sm transition-all duration-200 ${
                  currentStep === 1 ? 'invisible' : 'hover:scale-105'
                }`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>

              {currentStep < totalSteps ? (
                <Button 
                  onClick={nextStep} 
                  disabled={!validateCurrentStep() || loading}
                  className="px-6 py-3 font-medium text-sm bg-gradient-to-r from-tellus-primary to-tellus-charcoal-900 hover:from-tellus-primary/90 hover:to-blue-600/90 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={!validateCurrentStep() || loading} 
                  className="px-8 py-3 font-medium text-sm bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
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

      {/* Modal para cliente existente */}
      {existingCustomerData && (
        <ExistingCustomerModal
          isOpen={existingCustomerModal}
          onClose={() => {
            setExistingCustomerModal(false);
            setExistingCustomerData(null);
          }}
          onContinue={handleContinueAnyway}
          onAddProcess={handleAddProcess}
          customerData={existingCustomerData}
          processType="consultoria"
        />
      )}
    </div>
  );
}

