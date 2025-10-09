import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle, AlertCircle, Building2, FileText, ArrowRight, ArrowLeft, Upload, MapPin, Users, DollarSign, Shield } from 'lucide-react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { DocumentUpload } from '../UI/DocumentUpload';
import { CustomDocumentUpload } from '../UI/CustomDocumentUpload';
import { incorporadorasDocumentCategories } from '../../data/documentCategories.ts';
import { CepService } from '../../services/cepService';
import { StateSelect } from '../UI/StateSelect';
import { CNPJService } from '../../services/cnpjService';

interface FormData {
  // Dados da Incorporadora
  cnpj: string;
  companyName: string;
  fantasyName: string;
  foundationDate: string;
  email: string;
  phone: string;
  
  // Endereço da Incorporadora
  address: {
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };

  // Dados do Projeto
  projectName: string;
  projectType: string;
  projectAddress: {
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  totalUnits: number | null;
  constructionArea: number | null;
  projectValue: number | null;
  constructionStartDate: string;
  estimatedCompletion: string;
  
  // Informações Financeiras
  monthlyRevenue: number | null;
  unitsSold: number | null;
  creditRequested: number | null;
  
  // Documentos Enviados
  documents: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    documentType: string;
    uploadedAt: string;
    url: string;
    customTitle?: string;
  }>;
  
  // Observações
  notes: string;
}

export function LeadFormIncorporadoras() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [completedTabs, setCompletedTabs] = useState<number[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [consultingCNPJ, setConsultingCNPJ] = useState(false);
  const [cnpjConsulted, setCnpjConsulted] = useState(false);
  const [cnpjValid, setCnpjValid] = useState(false);
  const [cnpjNotFound, setCnpjNotFound] = useState(false);
  const [consultingCEP, setConsultingCEP] = useState(false);
  const [cepConsulted, setCepConsulted] = useState(false);
  const [cepValid, setCepValid] = useState(false);
  const [cepNotFound, setCepNotFound] = useState(false);
  const [consultingProjectCEP, setConsultingProjectCEP] = useState(false);
  const [projectCepConsulted, setProjectCepConsulted] = useState(false);
  const [projectCepValid, setProjectCepValid] = useState(false);
  const [projectCepNotFound, setProjectCepNotFound] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    cnpj: '',
    companyName: '',
    fantasyName: '',
    foundationDate: '',
    email: '',
    phone: '',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: ''
    },
    projectName: '',
    projectType: 'residencial',
    projectAddress: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: ''
    },
    totalUnits: null,
    constructionArea: null,
    projectValue: null,
    constructionStartDate: '',
    estimatedCompletion: '',
    monthlyRevenue: null,
    unitsSold: null,
    creditRequested: null,
    documents: [],
    notes: ''
  });

  // Total de etapas
  const totalSteps = 5; // 1-Dados Incorporadora, 2-Endereço, 3-Dados Projeto, 4-Financeiro, 5-Documentos

  const isLastStep = React.useMemo(() => {
    return currentStep === 5;
  }, [currentStep]);

  useEffect(() => {
    if (currentStep > totalSteps) {
      setCurrentStep(totalSteps);
    }
  }, [currentStep, totalSteps]);

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
    } else if (field.startsWith('projectAddress.')) {
      const addressField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        projectAddress: {
          ...prev.projectAddress,
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

    // Validação e consulta de CNPJ
    if (field === 'cnpj') {
      const cnpjLimpo = value.replace(/\D/g, '');
      const isValid = cnpjLimpo.length === 14 && CNPJService.validarCNPJ(value);
      setCnpjValid(isValid);
      
      if (isValid) {
        consultarCNPJ(value);
      } else {
        setCnpjConsulted(false);
        setCnpjNotFound(false);
      }
    }

    // Validação e consulta de CEP da empresa
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

    // Validação e consulta de CEP do projeto
    if (field === 'projectAddress.zipCode') {
      const cepLimpo = value.replace(/\D/g, '');
      const isValid = cepLimpo.length === 8 && CepService.validarFormatoCep(value);
      setProjectCepValid(isValid);
      
      if (isValid) {
        consultarProjectCEP(value);
      } else {
        setProjectCepConsulted(false);
        setProjectCepNotFound(false);
      }
    }
  };

  const consultarCNPJ = async (cnpj: string) => {
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    
    if (cnpjLimpo.length === 14 && CNPJService.validarCNPJ(cnpj)) {
      setConsultingCNPJ(true);
      setError(null);
      setCnpjNotFound(false);
      
      try {
        const dadosCNPJ = await CNPJService.consultarCNPJ(cnpj);
        
        if (dadosCNPJ) {
          setFormData(prev => ({
            ...prev,
            companyName: dadosCNPJ.razao_social || prev.companyName,
            fantasyName: dadosCNPJ.nome_fantasia || prev.fantasyName
          }));
          setCnpjConsulted(true);
          setCnpjNotFound(false);
        } else {
          setCnpjNotFound(true);
          setError('CNPJ válido mas não encontrado na base de dados. Preencha os dados manualmente.');
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

  const consultarCEP = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '');
    
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
              state: dadosCEP.uf,
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

  const consultarProjectCEP = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '');
    
    if (cepLimpo.length === 8) {
      setConsultingProjectCEP(true);
      setError(null);
      setProjectCepNotFound(false);
      
      try {
        const dadosCEP = await CepService.buscarCep(cep);
        
        if (dadosCEP) {
          setFormData(prev => ({
            ...prev,
            projectAddress: {
              ...prev.projectAddress,
              street: dadosCEP.logradouro,
              neighborhood: dadosCEP.bairro,
              city: dadosCEP.localidade,
              state: dadosCEP.uf,
              zipCode: CepService.formatarCep(cepLimpo)
            }
          }));
          setProjectCepConsulted(true);
          setProjectCepNotFound(false);
        } else {
          setProjectCepNotFound(true);
          setError('CEP não encontrado. Preencha os dados manualmente.');
        }
      } catch (error) {
        console.error('Erro ao consultar CEP:', error);
        setProjectCepNotFound(true);
        setError('Erro ao consultar CEP. Preencha os dados manualmente.');
      } finally {
        setConsultingProjectCEP(false);
      }
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const numbers = phone.replace(/\D/g, '');
    return numbers.length === 10 || numbers.length === 11;
  };

  const formatCNPJ = (value: string) => {
    return CNPJService.formatarCNPJ(value);
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value.slice(0, 15);
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 8) {
      return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
    }
    return value.slice(0, 9);
  };

  const handleTabChange = async (tabId: number) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    await new Promise(resolve => setTimeout(resolve, 200));
    setActiveTab(tabId);
    
    if (!completedTabs.includes(tabId)) {
      setCompletedTabs(prev => [...prev, tabId]);
    }
    
    setIsAnimating(false);
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return cnpjValid &&
               formData.companyName.trim().length >= 2 &&
               validateEmail(formData.email) &&
               validatePhone(formData.phone) &&
               formData.foundationDate;
      case 2:
        return cepValid &&
               formData.address.street.trim().length >= 3 &&
               formData.address.number.trim().length >= 1 &&
               formData.address.neighborhood.trim().length >= 2 &&
               formData.address.city.trim().length >= 2 &&
               formData.address.state.trim().length === 2 &&
               CepService.validarFormatoCep(formData.address.zipCode);
      case 3:
        return formData.projectName.trim().length >= 3 &&
               projectCepValid &&
               formData.projectAddress.street.trim().length >= 3 &&
               formData.projectAddress.number.trim().length >= 1 &&
               formData.projectAddress.city.trim().length >= 2 &&
               formData.projectAddress.state.trim().length === 2 &&
               formData.totalUnits && formData.totalUnits > 0 &&
               formData.constructionArea && formData.constructionArea > 0 &&
               formData.projectValue && formData.projectValue > 0;
      case 4:
        return formData.monthlyRevenue && formData.monthlyRevenue > 0 &&
               formData.creditRequested && formData.creditRequested > 0;
      case 5:
        return true; // Documentos são validados na submissão
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (!isLastStep) {
      if (!validateCurrentStep()) {
        setError('Por favor, preencha todos os campos obrigatórios corretamente');
        return;
      }
      setCurrentStep(currentStep + 1);
      setError(null);
    } else {
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

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!validateCurrentStep()) {
        setError('Por favor, preencha todos os campos obrigatórios');
        setLoading(false);
        return;
      }

      const leadData = {
        cnpj: formData.cnpj.replace(/\D/g, ''),
        companyName: formData.companyName,
        fantasyName: formData.fantasyName,
        foundationDate: formData.foundationDate,
        email: formData.email,
        phone: formData.phone,
        address: {
          ...formData.address,
          zipCode: formData.address.zipCode.replace(/\D/g, '')
        },
        projectName: formData.projectName,
        projectType: formData.projectType,
        projectAddress: {
          ...formData.projectAddress,
          zipCode: formData.projectAddress.zipCode.replace(/\D/g, '')
        },
        totalUnits: formData.totalUnits,
        constructionArea: formData.constructionArea,
        projectValue: formData.projectValue,
        constructionStartDate: formData.constructionStartDate,
        estimatedCompletion: formData.estimatedCompletion,
        monthlyRevenue: formData.monthlyRevenue,
        unitsSold: formData.unitsSold,
        creditRequested: formData.creditRequested,
        uploadedDocuments: formData.documents,
        notes: formData.notes,
        type: 'incorporadora',
        source: 'lead_incorporadora'
      };

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
              Obrigado pelo seu interesse! Nossa equipe de crédito imobiliário para incorporadoras entrará em contato em breve para análise do projeto.
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
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Crédito para Incorporadoras</h2>
            <p className="text-tellus-gold-100 text-lg leading-relaxed mb-8">
              Financiamento especializado para projetos imobiliários
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-white/90">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span>Processo 100% seguro e confidencial</span>
              </div>
              <div className="flex items-center space-x-3 text-white/90">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span>Análise especializada para incorporações</span>
              </div>
              <div className="flex items-center space-x-3 text-white/90">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span className="font-semibold">Resposta: <span className="text-green-300 font-bold">3-7 dias úteis</span></span>
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
              Prepare a documentação completa do projeto e da incorporadora
            </p>
            
            <div className="space-y-6 text-left lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Building2 className="w-5 h-5 mr-3" />
                  Incorporadora
                </h3>
                <div className="space-y-3">
                  {[
                    'Contrato Social',
                    'CNPJ',
                    'Balanço Patrimonial',
                    'DRE',
                    'IR Pessoa Jurídica'
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
                  <MapPin className="w-5 h-5 mr-3" />
                  Projeto
                </h3>
                <div className="space-y-3">
                  {[
                    'Memorial Descritivo',
                    'Plantas do Projeto',
                    'Orçamento da Obra',
                    'Cronograma',
                    'Estudo de Viabilidade'
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
                  <Shield className="w-5 h-5 mr-3" />
                  Documentos Legais
                </h3>
                <div className="space-y-3">
                  {[
                    'Alvará de Construção',
                    'Licença Ambiental',
                    'RGI',
                    'Matrícula do Terreno',
                    'ART/RRT'
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
                  Análise do Projeto
                </h3>
                <div className="space-y-2 text-white/90 text-sm">
                  <div>• Análise técnica completa do empreendimento</div>
                  <div>• Avaliação de viabilidade econômica</div>
                  <div>• Verificação de documentação legal</div>
                  <div>• Análise de capacidade de pagamento</div>
                  <div>• Visita técnica ao terreno/projeto</div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-3" />
                  Processo de Aprovação
                </h3>
                <div className="space-y-2 text-white/90 text-sm">
                  <div>• Análise preliminar: 3-7 dias úteis</div>
                  <div>• Documentação completa obrigatória</div>
                  <div>• Possível vistoria no local</div>
                  <div>• Acompanhamento por especialista</div>
                  <div>• Resposta detalhada da análise</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mt-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-3" />
                Documentação Completa
              </h3>
              <p className="text-white/90 text-sm leading-relaxed mb-4">
                A documentação deve estar completa e atualizada. Projetos sem documentação adequada não poderão ser analisados.
              </p>
              <div className="space-y-2 text-white/90 text-sm">
                <div>• Todos os documentos legíveis e dentro da validade</div>
                <div>• Alvarás e licenças em vigor</div>
                <div>• Documentação financeira atualizada</div>
                <div>• Projeto aprovado pelos órgãos competentes</div>
              </div>
            </div>
          </div>
        )
      }
    ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-tellus-charcoal-900 via-tellus-charcoal-800 to-tellus-charcoal-700">
        <div className="bg-white/10 backdrop-blur-sm">
          <div className="max-w-md mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Tellure</h1>
                  <p className="text-xs text-tellus-gold-100">Crédito Incorporadoras</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-md lg:max-w-4xl xl:max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
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

            <div className="p-8 min-h-[500px] flex flex-col justify-center">
              <div className="w-full lg:max-w-4xl mx-auto">
                {steps[activeTab].content}
              </div>
            </div>

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
                      <span className="font-semibold text-white">Concordo com os termos de uso</span> e confirmo que tenho toda a documentação necessária para prosseguir.
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
                    Iniciar Cadastro
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
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-tellus-primary to-tellus-charcoal-900 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Tellure</h1>
                <p className="text-xs text-gray-500 font-medium">Crédito Incorporadoras</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 py-8">
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-lg mb-6 overflow-hidden">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-gray-900 truncate">Cadastro para Incorporadoras</h2>
                <p className="text-sm text-gray-600">Etapa {currentStep} de {totalSteps}</p>
              </div>
              <div className="flex items-center space-x-2 ml-3">
                <div className="w-10 h-10 bg-gradient-to-r from-tellus-primary to-tellus-charcoal-900 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {Math.round((currentStep / totalSteps) * 100)}%
                </div>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div 
                className="bg-gradient-to-r from-tellus-primary to-tellus-charcoal-900 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-lg overflow-hidden">
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Step 1: Dados da Incorporadora */}
            {currentStep === 1 && (
              <div className="space-y-8 animate-fadeIn">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-tellus-primary to-tellus-charcoal-900 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Dados da Incorporadora</h3>
                  <p className="text-sm text-gray-600">Informe os dados da empresa incorporadora</p>
                </div>

                <div className="space-y-4">
                  <div className="animate-slideInUp" style={{ animationDelay: '0.3s' }}>
                    <div className="relative">
                      <Input
                        label="CNPJ *"
                        value={formatCNPJ(formData.cnpj)}
                        onChange={(e) => handleChange('cnpj', e.target.value)}
                        placeholder="00.000.000/0000-00"
                        maxLength={18}
                      />
                      {consultingCNPJ && (
                        <div className="absolute right-3 top-8">
                          <LoadingSpinner size="sm" />
                        </div>
                      )}
                    </div>
                    {formData.cnpj && !CNPJService.validarCNPJ(formData.cnpj) && (
                      <p className="text-red-500 text-xs mt-1">CNPJ inválido</p>
                    )}
                    {cnpjConsulted && (
                      <p className="text-green-600 text-xs mt-1">✓ Dados preenchidos automaticamente</p>
                    )}
                    {cnpjNotFound && (
                      <p className="text-yellow-600 text-xs mt-1">⚠️ CNPJ válido mas não encontrado. Preencha os dados manualmente.</p>
                    )}
                    {!cnpjValid && formData.cnpj && (
                      <p className="text-gray-500 text-xs mt-1">Digite um CNPJ válido para continuar</p>
                    )}
                  </div>

                  {!cnpjValid && (
                    <div className="bg-tellus-gold-50 border border-tellus-gold-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-5 h-5 text-blue-600" />
                        <p className="text-sm text-tellus-charcoal-800">
                          Digite um CNPJ válido para desbloquear os demais campos
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${!cnpjValid ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="sm:col-span-2 animate-slideInUp" style={{ animationDelay: '0.4s' }}>
                      <Input
                        label="Razão Social *"
                        value={formData.companyName}
                        onChange={(e) => handleChange('companyName', e.target.value)}
                        placeholder="Digite a razão social"
                        maxLength={100}
                        disabled={!cnpjValid}
                      />
                      {formData.companyName && formData.companyName.trim().length < 2 && (
                        <p className="text-red-500 text-xs mt-1">Razão social deve ter pelo menos 2 caracteres</p>
                      )}
                    </div>

                    <div className="sm:col-span-2 animate-slideInUp" style={{ animationDelay: '0.5s' }}>
                      <Input
                        label="Nome Fantasia"
                        value={formData.fantasyName}
                        onChange={(e) => handleChange('fantasyName', e.target.value)}
                        placeholder="Nome fantasia (se houver)"
                        maxLength={100}
                        disabled={!cnpjValid}
                      />
                    </div>

                    <div className="animate-slideInUp" style={{ animationDelay: '0.6s' }}>
                      <Input
                        label="Email *"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="email@empresa.com"
                        maxLength={100}
                        disabled={!cnpjValid}
                      />
                      {formData.email && !validateEmail(formData.email) && (
                        <p className="text-red-500 text-xs mt-1">Email inválido</p>
                      )}
                    </div>

                    <div className="animate-slideInUp" style={{ animationDelay: '0.7s' }}>
                      <Input
                        label="Telefone *"
                        value={formatPhone(formData.phone)}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="(11) 99999-9999"
                        maxLength={15}
                        disabled={!cnpjValid}
                      />
                      {formData.phone && !validatePhone(formData.phone) && (
                        <p className="text-red-500 text-xs mt-1">Telefone deve ter 10 ou 11 dígitos</p>
                      )}
                    </div>

                    <div className="sm:col-span-2 animate-slideInUp" style={{ animationDelay: '0.8s' }}>
                      <Input
                        label="Data de Fundação *"
                        type="date"
                        value={formData.foundationDate}
                        onChange={(e) => handleChange('foundationDate', e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        disabled={!cnpjValid}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Endereço da Incorporadora */}
            {currentStep === 2 && (
              <div className="space-y-8">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-tellus-primary to-tellus-charcoal-900 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Endereço da Incorporadora</h3>
                  <p className="text-sm text-gray-600">Digite o CEP para preenchimento automático</p>
                </div>

                <div className="space-y-4">
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
                    </div>

                    <div className="animate-slideInUp" style={{ animationDelay: '0.6s' }}>
                      <Input
                        label="Complemento"
                        value={formData.address.complement}
                        onChange={(e) => handleChange('address.complement', e.target.value)}
                        placeholder="Sala, andar, etc."
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
                    </div>

                    <div className="animate-slideInUp" style={{ animationDelay: '0.9s' }}>
                      <StateSelect
                        label="Estado"
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

            {/* Step 3: Dados do Projeto */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-tellus-primary to-tellus-charcoal-900 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Dados do Projeto</h3>
                  <p className="text-sm text-gray-600">Informe os dados do empreendimento</p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Input
                        label="Nome do Projeto *"
                        value={formData.projectName}
                        onChange={(e) => handleChange('projectName', e.target.value)}
                        placeholder="Ex: Residencial Parque das Flores"
                        maxLength={100}
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-sm font-medium text-gray-700">Tipo de Projeto *</label>
                      <select
                        value={formData.projectType}
                        onChange={(e) => handleChange('projectType', e.target.value)}
                        className="input"
                      >
                        <option value="residencial">Residencial</option>
                        <option value="comercial">Comercial</option>
                        <option value="misto">Misto</option>
                        <option value="industrial">Industrial</option>
                      </select>
                    </div>
                  </div>

                  {/* Endereço do Projeto */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-base font-semibold text-gray-900 mb-4">Endereço do Projeto</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="relative">
                          <Input
                            label="CEP *"
                            value={formatCEP(formData.projectAddress.zipCode)}
                            onChange={(e) => handleChange('projectAddress.zipCode', e.target.value)}
                            placeholder="00000-000"
                            maxLength={9}
                          />
                          {consultingProjectCEP && (
                            <div className="absolute right-3 top-8">
                              <LoadingSpinner size="sm" />
                            </div>
                          )}
                        </div>
                        {projectCepConsulted && (
                          <p className="text-green-600 text-xs mt-1">✓ Endereço preenchido automaticamente</p>
                        )}
                      </div>

                      {!projectCepValid && (
                        <div className="bg-tellus-gold-50 border border-tellus-gold-200 rounded-lg p-4">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="w-5 h-5 text-blue-600" />
                            <p className="text-sm text-tellus-charcoal-800">
                              Digite um CEP válido para desbloquear os campos
                            </p>
                          </div>
                        </div>
                      )}

                      <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 ${!projectCepValid ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="sm:col-span-2">
                          <Input
                            label="Rua *"
                            value={formData.projectAddress.street}
                            onChange={(e) => handleChange('projectAddress.street', e.target.value)}
                            placeholder="Nome da rua"
                            maxLength={100}
                            disabled={!projectCepValid}
                          />
                        </div>

                        <div>
                          <Input
                            label="Número *"
                            value={formData.projectAddress.number}
                            onChange={(e) => handleChange('projectAddress.number', e.target.value)}
                            placeholder="123"
                            maxLength={10}
                            disabled={!projectCepValid}
                          />
                        </div>

                        <div>
                          <Input
                            label="Complemento"
                            value={formData.projectAddress.complement}
                            onChange={(e) => handleChange('projectAddress.complement', e.target.value)}
                            placeholder="Quadra, lote, etc."
                            maxLength={50}
                            disabled={!projectCepValid}
                          />
                        </div>

                        <div>
                          <Input
                            label="Bairro *"
                            value={formData.projectAddress.neighborhood}
                            onChange={(e) => handleChange('projectAddress.neighborhood', e.target.value)}
                            placeholder="Nome do bairro"
                            maxLength={50}
                            disabled={!projectCepValid}
                          />
                        </div>

                        <div>
                          <Input
                            label="Cidade *"
                            value={formData.projectAddress.city}
                            onChange={(e) => handleChange('projectAddress.city', e.target.value)}
                            placeholder="Nome da cidade"
                            maxLength={50}
                            disabled={!projectCepValid}
                          />
                        </div>

                        <div>
                          <StateSelect
                            label="Estado *"
                            value={formData.projectAddress.state}
                            onChange={(value) => handleChange('projectAddress.state', value)}
                            placeholder="Selecione"
                            disabled={!projectCepValid}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detalhes do Projeto */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Input
                        label="Total de Unidades *"
                        type="number"
                        value={formData.totalUnits || ''}
                        onChange={(e) => handleChange('totalUnits', e.target.value ? parseInt(e.target.value) : null)}
                        placeholder="Ex: 120"
                        min="1"
                      />
                    </div>

                    <div>
                      <Input
                        label="Área de Construção (m²) *"
                        type="number"
                        value={formData.constructionArea || ''}
                        onChange={(e) => handleChange('constructionArea', e.target.value ? parseFloat(e.target.value) : null)}
                        placeholder="Ex: 15000"
                        min="1"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <Input
                        label="Valor do Projeto *"
                        type="text"
                        value={formData.projectValue && formData.projectValue > 0 ? new Intl.NumberFormat('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        }).format(formData.projectValue) : ''}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/[^\d]/g, '');
                          const numericValue = rawValue ? parseFloat(rawValue) / 100 : null;
                          handleChange('projectValue', numericValue);
                        }}
                        placeholder="R$ 50.000.000,00"
                      />
                    </div>

                    <div>
                      <Input
                        label="Data de Início da Obra"
                        type="date"
                        value={formData.constructionStartDate}
                        onChange={(e) => handleChange('constructionStartDate', e.target.value)}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <Input
                        label="Previsão de Conclusão"
                        type="date"
                        value={formData.estimatedCompletion}
                        onChange={(e) => handleChange('estimatedCompletion', e.target.value)}
                        min={formData.constructionStartDate || undefined}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Informações Financeiras */}
            {currentStep === 4 && (
              <div className="space-y-8">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-tellus-primary to-tellus-charcoal-900 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Informações Financeiras</h3>
                  <p className="text-sm text-gray-600">Dados financeiros do projeto e da incorporadora</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="Faturamento Mensal Médio *"
                      type="text"
                      value={formData.monthlyRevenue && formData.monthlyRevenue > 0 ? new Intl.NumberFormat('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      }).format(formData.monthlyRevenue) : ''}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/[^\d]/g, '');
                        const numericValue = rawValue ? parseFloat(rawValue) / 100 : null;
                        handleChange('monthlyRevenue', numericValue);
                      }}
                      placeholder="R$ 500.000,00"
                    />
                  </div>

                  <div>
                    <Input
                      label="Unidades Já Vendidas"
                      type="number"
                      value={formData.unitsSold || ''}
                      onChange={(e) => handleChange('unitsSold', e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="Ex: 45"
                      min="0"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Input
                      label="Valor de Crédito Solicitado *"
                      type="text"
                      value={formData.creditRequested && formData.creditRequested > 0 ? new Intl.NumberFormat('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      }).format(formData.creditRequested) : ''}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/[^\d]/g, '');
                        const numericValue = rawValue ? parseFloat(rawValue) / 100 : null;
                        handleChange('creditRequested', numericValue);
                      }}
                      placeholder="R$ 10.000.000,00"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Upload de Documentos */}
            {currentStep === 5 && (
              <div className="space-y-8">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-tellus-primary to-tellus-charcoal-900 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Upload de Documentos</h3>
                  <p className="text-sm text-gray-600">Envie toda a documentação necessária</p>
                </div>

                <div className="space-y-6">
                  {/* Upload Personalizado */}
                  <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 shadow-xl">
                    <h4 className="font-bold text-white mb-2 text-xl">
                      📁 Adicionar Documento com Título Personalizado
                    </h4>
                    <p className="text-purple-100 text-sm mb-6">
                      Organize seus documentos com títulos descritivos
                    </p>
                    
                    <CustomDocumentUpload
                      cpf={formData.cnpj}
                      documentCategories={incorporadorasDocumentCategories}
                      onDocumentAdded={(doc) => {
                        const newDocuments = [...formData.documents, doc];
                        setFormData(prev => ({
                          ...prev,
                          documents: newDocuments
                        }));
                      }}
                      onError={(error) => setError(error)}
                    />
                  </div>

                  {/* Documentos da Incorporadora */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Building2 className="w-5 h-5 mr-2 text-tellus-primary" />
                      Documentos da Incorporadora
                    </h4>
                    
                    <div className="space-y-6">
                      <DocumentUpload
                        sessionId=""
                        documentType="contract_social"
                        label="Contrato Social Completo"
                        description="Contrato social completo e atualizado"
                        onUploadComplete={(documents) => {
                          setFormData(prev => ({
                            ...prev,
                            documents: [...prev.documents, ...documents]
                          }));
                        }}
                        onUploadError={(error) => setError(error)}
                        maxFiles={1}
                        userCpf={formData.cnpj}
                      />

                      <DocumentUpload
                        sessionId=""
                        documentType="cnpj"
                        label="Cartão CNPJ"
                        description="Cartão CNPJ atualizado"
                        onUploadComplete={(documents) => {
                          setFormData(prev => ({
                            ...prev,
                            documents: [...prev.documents, ...documents]
                          }));
                        }}
                        onUploadError={(error) => setError(error)}
                        maxFiles={1}
                        userCpf={formData.cnpj}
                      />

                      <DocumentUpload
                        sessionId=""
                        documentType="balance_sheet"
                        label="Balanço Patrimonial"
                        description="Balanço patrimonial dos últimos 2 exercícios"
                        onUploadComplete={(documents) => {
                          setFormData(prev => ({
                            ...prev,
                            documents: [...prev.documents, ...documents]
                          }));
                        }}
                        onUploadError={(error) => setError(error)}
                        maxFiles={2}
                        userCpf={formData.cnpj}
                      />

                      <DocumentUpload
                        sessionId=""
                        documentType="dre"
                        label="DRE - Demonstrativo de Resultados"
                        description="DRE dos últimos 2 exercícios"
                        onUploadComplete={(documents) => {
                          setFormData(prev => ({
                            ...prev,
                            documents: [...prev.documents, ...documents]
                          }));
                        }}
                        onUploadError={(error) => setError(error)}
                        maxFiles={2}
                        userCpf={formData.cnpj}
                      />
                    </div>
                  </div>

                  {/* Documentos do Projeto */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-tellus-primary" />
                      Documentos do Projeto
                    </h4>
                    
                    <div className="space-y-6">
                      <DocumentUpload
                        sessionId=""
                        documentType="project_memorial"
                        label="Memorial Descritivo"
                        description="Memorial descritivo completo do projeto"
                        onUploadComplete={(documents) => {
                          setFormData(prev => ({
                            ...prev,
                            documents: [...prev.documents, ...documents]
                          }));
                        }}
                        onUploadError={(error) => setError(error)}
                        maxFiles={1}
                        userCpf={formData.cnpj}
                      />

                      <DocumentUpload
                        sessionId=""
                        documentType="project_plans"
                        label="Plantas do Projeto"
                        description="Plantas e projetos arquitetônicos"
                        onUploadComplete={(documents) => {
                          setFormData(prev => ({
                            ...prev,
                            documents: [...prev.documents, ...documents]
                          }));
                        }}
                        onUploadError={(error) => setError(error)}
                        maxFiles={10}
                        userCpf={formData.cnpj}
                      />

                      <DocumentUpload
                        sessionId=""
                        documentType="project_budget"
                        label="Orçamento da Obra"
                        description="Orçamento detalhado da construção"
                        onUploadComplete={(documents) => {
                          setFormData(prev => ({
                            ...prev,
                            documents: [...prev.documents, ...documents]
                          }));
                        }}
                        onUploadError={(error) => setError(error)}
                        maxFiles={3}
                        userCpf={formData.cnpj}
                      />
                    </div>
                  </div>

                  {/* Documentos Legais */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-tellus-primary" />
                      Documentos Legais
                    </h4>
                    
                    <div className="space-y-6">
                      <DocumentUpload
                        sessionId=""
                        documentType="building_permit"
                        label="Alvará de Construção"
                        description="Alvará de construção aprovado"
                        onUploadComplete={(documents) => {
                          setFormData(prev => ({
                            ...prev,
                            documents: [...prev.documents, ...documents]
                          }));
                        }}
                        onUploadError={(error) => setError(error)}
                        maxFiles={1}
                        userCpf={formData.cnpj}
                      />

                      <DocumentUpload
                        sessionId=""
                        documentType="rgi"
                        label="RGI - Registro Geral de Incorporação"
                        description="RGI registrado em cartório"
                        onUploadComplete={(documents) => {
                          setFormData(prev => ({
                            ...prev,
                            documents: [...prev.documents, ...documents]
                          }));
                        }}
                        onUploadError={(error) => setError(error)}
                        maxFiles={1}
                        userCpf={formData.cnpj}
                      />

                      <DocumentUpload
                        sessionId=""
                        documentType="property_registration"
                        label="Matrícula do Terreno"
                        description="Matrícula atualizada do terreno"
                        onUploadComplete={(documents) => {
                          setFormData(prev => ({
                            ...prev,
                            documents: [...prev.documents, ...documents]
                          }));
                        }}
                        onUploadError={(error) => setError(error)}
                        maxFiles={1}
                        userCpf={formData.cnpj}
                      />
                    </div>
                  </div>

                  {/* Resumo dos Documentos */}
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
                              <FileText className="w-4 h-4 text-blue-600" />
                              <span className="text-sm text-tellus-charcoal-800">
                                {doc.customTitle || doc.fileName}
                              </span>
                            </div>
                            <span className="text-xs text-blue-600 bg-tellus-gold-100 px-2 py-1 rounded">
                              {doc.documentType}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Observações */}
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
                      placeholder="Informações adicionais sobre o projeto ou a incorporadora..."
                      maxLength={1000}
                    />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Navigation */}
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

              {!isLastStep ? (
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
    </div>
  );
}

