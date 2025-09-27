import { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Home, 
  FileText, 
  CheckCircle,
  XCircle,
  Clock,
  Heart,
  Eye
} from 'lucide-react';
import { Lead } from '../../../../shared/types/lead';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { DocumentViewerService } from '../../services/documentViewerService';

interface PreRegistrationDetailsModalProps {
  preRegistration: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (leadId: string) => Promise<void>;
  onReject: (leadId: string, reason?: string) => Promise<void>;
  onDelete: (leadId: string) => Promise<void>;
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
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  // Gerar URLs assinadas quando o modal abrir e houver documentos
  useEffect(() => {
    const generateSignedUrls = async () => {
      if (preRegistration?.uploadedDocuments && preRegistration.uploadedDocuments.length > 0) {
        const urls: Record<string, string> = {};
        
        for (const doc of preRegistration.uploadedDocuments) {
          try {
            // Extrair o caminho do arquivo da URL do Supabase
            let filePath = '';
            
            if (doc.url.includes('/storage/v1/object/sign/')) {
              // URL assinada: https://xxx.supabase.co/storage/v1/object/sign/user-documents/path/file.pdf?token=...
              const urlParts = doc.url.split('/storage/v1/object/sign/');
              if (urlParts.length > 1) {
                const pathWithQuery = urlParts[1];
                // Remover query parameters (token)
                const pathOnly = pathWithQuery.split('?')[0];
                // Remover o bucket name do início
                const pathParts = pathOnly.split('/');
                if (pathParts.length > 1) {
                  filePath = pathParts.slice(1).join('/');
                }
              }
            } else if (doc.url.includes('/storage/v1/object/public/')) {
              // URL pública: https://xxx.supabase.co/storage/v1/object/public/user-documents/path/file.pdf
              const urlParts = doc.url.split('/storage/v1/object/public/');
              if (urlParts.length > 1) {
                const pathWithBucket = urlParts[1];
                const pathParts = pathWithBucket.split('/');
                if (pathParts.length > 1) {
                  filePath = pathParts.slice(1).join('/');
                }
              }
            } else if (doc.id && typeof doc.id === 'string' && !doc.id.startsWith('http')) {
              // Se doc.id já é o caminho do arquivo (não uma URL)
              filePath = doc.id;
            }
            
            if (filePath) {
              console.log('Gerando URL assinada para:', filePath);
              
              const result = await DocumentViewerService.getSignedDocumentUrl(filePath);
              if (result.signedUrl) {
                urls[doc.id] = result.signedUrl;
                console.log('URL assinada gerada:', result.signedUrl);
              } else {
                console.error('Falha ao gerar URL assinada:', result.error);
                // Usar a URL original como fallback
                urls[doc.id] = doc.url;
              }
            } else {
              console.warn('Não foi possível extrair o caminho do arquivo da URL:', doc.url);
              // Usar a URL original como fallback
              urls[doc.id] = doc.url;
            }
          } catch (error) {
            console.error('Erro ao gerar URL assinada para documento:', doc.fileName, error);
            // Usar a URL original como fallback
            urls[doc.id] = doc.url;
          }
        }
        
        setSignedUrls(urls);
      }
    };

    if (isOpen) {
      generateSignedUrls().catch(error => {
        console.error('Erro ao gerar URLs assinadas:', error);
      });
    }
  }, [isOpen, preRegistration?.uploadedDocuments]);

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

  const getLeadType = (source: string) => {
    const typeMap: Record<string, string> = {
      'lead_credito': 'Crédito Pessoal',
      'lead_consultoria': 'Consultoria Financeira',
      'lead_agro': 'Crédito Rural',
      'lead_geral': 'Crédito Geral',
      'lead_credito_imobiliario': 'Crédito Imobiliário',
      'formulario_publico': 'Formulário Público'
    };
    return typeMap[source] || 'Tipo não identificado';
  };

  const shouldShowPropertySection = () => {
    return preRegistration.source === 'lead_credito_imobiliario' || 
           preRegistration.source === 'lead_geral' ||
           (preRegistration.propertyValue && preRegistration.propertyValue > 0);
  };

  const shouldShowCompanySection = () => {
    return preRegistration.hasCompany || 
           preRegistration.employmentType === 'empresario' ||
           preRegistration.companyCnpj ||
           preRegistration.companyName;
  };

  const shouldShowSpouseSection = () => {
    return preRegistration.hasSpouse || 
           preRegistration.spouseName ||
           preRegistration.spouseCpf;
  };

  const shouldShowGovSection = () => {
    return preRegistration.govPassword || 
           preRegistration.hasTwoFactorDisabled !== undefined;
  };

  const getLeadTypeColor = (source: string) => {
    const colorMap: Record<string, string> = {
      'lead_credito': 'bg-blue-100 text-blue-800',
      'lead_consultoria': 'bg-purple-100 text-purple-800',
      'lead_agro': 'bg-green-100 text-green-800',
      'lead_geral': 'bg-gray-100 text-gray-800',
      'lead_credito_imobiliario': 'bg-indigo-100 text-indigo-800',
      'formulario_publico': 'bg-orange-100 text-orange-800'
    };
    return colorMap[source] || 'bg-gray-100 text-gray-800';
  };


  const handleApprove = async () => {
    setProcessing(true);
    try {
      await onApprove(preRegistration.id!);
      onClose();
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    setProcessing(true);
    try {
      await onReject(preRegistration.id!, rejectReason);
      setShowRejectForm(false);
      setRejectReason('');
      onClose();
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir este lead? Esta ação não pode ser desfeita.')) {
      setProcessing(true);
      try {
        await onDelete(preRegistration.id!);
        onClose();
      } finally {
        setProcessing(false);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalhes do Pré-Cadastro" size="lg">
      <div className="space-y-6">
        {/* Status e Informações do Lead */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-900">Informações do Lead</h3>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getLeadTypeColor(preRegistration.source)}`}>
                {getLeadType(preRegistration.source)}
              </span>
              {preRegistration.status === 'aprovado' || preRegistration.status === 'convertido' ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {preRegistration.status === 'convertido' ? 'Convertido' : 'Aprovado'}
                </span>
              ) : preRegistration.status === 'rejeitado' ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  <XCircle className="w-4 h-4 mr-1" />
                  Rejeitado
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  <Clock className="w-4 h-4 mr-1" />
                  {preRegistration.status === 'novo' ? 'Novo' : 'Em Análise'}
                </span>
              )}
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
              <span className="font-medium">ID:</span> {preRegistration.id || 'N/A'}
            </div>
          </div>

          {/* Resumo específico por tipo */}
          <div className="mt-4 p-3 bg-white rounded-lg border">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Resumo da Solicitação</h4>
            <div className="text-sm text-gray-600 space-y-1">
              {preRegistration.source === 'lead_credito' && (
                <>
                  <p><span className="font-medium">Tipo:</span> Crédito Pessoal</p>
                  <p><span className="font-medium">Renda:</span> {formatCurrency(preRegistration.monthlyIncome)}</p>
                  {preRegistration.hasSpouse && <p><span className="font-medium">Cônjuge:</span> Sim</p>}
                  {preRegistration.hasCompany && <p><span className="font-medium">Empresa:</span> Sim</p>}
                </>
              )}
              {preRegistration.source === 'lead_credito_imobiliario' && (
                <>
                  <p><span className="font-medium">Tipo:</span> Crédito Imobiliário</p>
                  <p><span className="font-medium">Valor do Imóvel:</span> {formatCurrency(preRegistration.propertyValue)}</p>
                  <p><span className="font-medium">Renda:</span> {formatCurrency(preRegistration.monthlyIncome)}</p>
                </>
              )}
              {preRegistration.source === 'lead_consultoria' && (
                <>
                  <p><span className="font-medium">Tipo:</span> Consultoria Financeira</p>
                  <p><span className="font-medium">Renda:</span> {formatCurrency(preRegistration.monthlyIncome)}</p>
                </>
              )}
              {preRegistration.source === 'lead_agro' && (
                <>
                  <p><span className="font-medium">Tipo:</span> Crédito Rural</p>
                  <p><span className="font-medium">Renda:</span> {formatCurrency(preRegistration.monthlyIncome)}</p>
                </>
              )}
              {preRegistration.source === 'lead_geral' && (
                <>
                  <p><span className="font-medium">Tipo:</span> Crédito Geral</p>
                  <p><span className="font-medium">Renda:</span> {formatCurrency(preRegistration.monthlyIncome)}</p>
                  {preRegistration.propertyValue && preRegistration.propertyValue > 0 && (
                    <p><span className="font-medium">Valor do Imóvel:</span> {formatCurrency(preRegistration.propertyValue)}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Dados Pessoais */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Dados Pessoais
          </h3>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <p className="mt-1 text-sm text-gray-900">{preRegistration.name || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">CPF</label>
                <p className="mt-1 text-sm text-gray-900">{preRegistration.cpf || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">RG</label>
                <p className="mt-1 text-sm text-gray-900">{preRegistration.rg || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
                <p className="mt-1 text-sm text-gray-900">
                  {preRegistration.birthDate ? 
                    new Date(preRegistration.birthDate).toLocaleDateString('pt-BR') : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900 flex items-center">
                  <Mail className="w-4 h-4 mr-1 text-gray-400" />
                  {preRegistration.email || 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Telefone</label>
                <p className="mt-1 text-sm text-gray-900 flex items-center">
                  <Phone className="w-4 h-4 mr-1 text-gray-400" />
                  {preRegistration.phone || 'N/A'}
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

        {/* Endereço */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Endereço
          </h3>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Logradouro</label>
                <p className="mt-1 text-sm text-gray-900">{preRegistration.address?.street || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Número</label>
                <p className="mt-1 text-sm text-gray-900">{preRegistration.address?.number || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Complemento</label>
                <p className="mt-1 text-sm text-gray-900">{preRegistration.address?.complement || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bairro</label>
                <p className="mt-1 text-sm text-gray-900">{preRegistration.address?.neighborhood || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cidade</label>
                <p className="mt-1 text-sm text-gray-900">{preRegistration.address?.city || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Estado</label>
                <p className="mt-1 text-sm text-gray-900">{preRegistration.address?.state || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">CEP</label>
                <p className="mt-1 text-sm text-gray-900">{preRegistration.address?.zipCode || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dados Profissionais */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
            <Briefcase className="w-5 h-5 mr-2" />
            Dados Profissionais
          </h3>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Profissão</label>
                <p className="mt-1 text-sm text-gray-900">{preRegistration.profession || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de Emprego</label>
                <p className="mt-1 text-sm text-gray-900">{getEmploymentTypeLabel(preRegistration.employmentType)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Renda Mensal</label>
                <p className="mt-1 text-sm text-gray-900">{formatCurrency(preRegistration.monthlyIncome)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Empresa</label>
                <p className="mt-1 text-sm text-gray-900">{preRegistration.companyName || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dados do Imóvel - apenas para crédito imobiliário e geral */}
        {shouldShowPropertySection() && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <Home className="w-5 h-5 mr-2" />
              Dados do Imóvel
            </h3>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Valor do Imóvel</label>
                  <p className="mt-1 text-sm text-gray-900">{formatCurrency(preRegistration.propertyValue)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo do Imóvel</label>
                  <p className="mt-1 text-sm text-gray-900">{getPropertyTypeLabel(preRegistration.propertyType)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cidade do Imóvel</label>
                  <p className="mt-1 text-sm text-gray-900">{preRegistration.propertyCity || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado do Imóvel</label>
                  <p className="mt-1 text-sm text-gray-900">{preRegistration.propertyState || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dados do Cônjuge */}
        {shouldShowSpouseSection() && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <Heart className="w-5 h-5 mr-2" />
              Dados do Cônjuge
            </h3>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome</label>
                  <p className="mt-1 text-sm text-gray-900">{preRegistration.spouseName || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">CPF</label>
                  <p className="mt-1 text-sm text-gray-900">{preRegistration.spouseCpf || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">RG</label>
                  <p className="mt-1 text-sm text-gray-900">{preRegistration.spouseRg || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {preRegistration.spouseBirthDate ? 
                      new Date(preRegistration.spouseBirthDate).toLocaleDateString('pt-BR') : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Profissão</label>
                  <p className="mt-1 text-sm text-gray-900">{preRegistration.spouseProfession || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de Emprego</label>
                  <p className="mt-1 text-sm text-gray-900">{getEmploymentTypeLabel(preRegistration.spouseEmploymentType)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Renda Mensal</label>
                  <p className="mt-1 text-sm text-gray-900">{formatCurrency(preRegistration.spouseMonthlyIncome)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Empresa</label>
                  <p className="mt-1 text-sm text-gray-900">{preRegistration.spouseCompanyName || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dados da Empresa */}
        {shouldShowCompanySection() && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <Briefcase className="w-5 h-5 mr-2" />
              Dados da Empresa
            </h3>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">CNPJ</label>
                  <p className="mt-1 text-sm text-gray-900">{preRegistration.companyCnpj || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Razão Social</label>
                  <p className="mt-1 text-sm text-gray-900">{preRegistration.companyName || 'N/A'}</p>
                </div>
                {preRegistration.companyAddress && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Logradouro</label>
                      <p className="mt-1 text-sm text-gray-900">{preRegistration.companyAddress.street || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Número</label>
                      <p className="mt-1 text-sm text-gray-900">{preRegistration.companyAddress.number || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Complemento</label>
                      <p className="mt-1 text-sm text-gray-900">{preRegistration.companyAddress.complement || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bairro</label>
                      <p className="mt-1 text-sm text-gray-900">{preRegistration.companyAddress.neighborhood || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Cidade</label>
                      <p className="mt-1 text-sm text-gray-900">{preRegistration.companyAddress.city || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Estado</label>
                      <p className="mt-1 text-sm text-gray-900">{preRegistration.companyAddress.state || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">CEP</label>
                      <p className="mt-1 text-sm text-gray-900">{preRegistration.companyAddress.zipCode || 'N/A'}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Dados Gov.br */}
        {shouldShowGovSection() && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Dados Gov.br
            </h3>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Senha Gov.br</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {preRegistration.govPassword ? '••••••••' : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">2FA Desabilitado</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {preRegistration.hasTwoFactorDisabled ? 'Sim' : 'Não'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Documentos Anexados */}
        {preRegistration.uploadedDocuments && preRegistration.uploadedDocuments.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Documentos Anexados ({preRegistration.uploadedDocuments.length})
            </h3>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="space-y-4">
                {preRegistration.uploadedDocuments.map((doc, index) => (
                  <div key={doc.id || index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-tellus-primary rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {doc.fileName}
                          </h4>
                          <div className="mt-1 space-y-1">
                            <p className="text-xs text-gray-500">
                              <span className="font-medium">Tipo:</span> {doc.documentType}
                            </p>
                            <p className="text-xs text-gray-500">
                              <span className="font-medium">Tamanho:</span> {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <p className="text-xs text-gray-500">
                              <span className="font-medium">Enviado em:</span> {new Date(doc.uploadedAt).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={async () => {
                            try {
                              // Usar a mesma abordagem do CustomerDocumentManager
                              const { DocumentViewerService } = await import('../../services/documentViewerService');
                              
                              // Se já temos uma URL assinada, usar ela
                              if (signedUrls[doc.id]) {
                                window.open(signedUrls[doc.id], '_blank');
                                return;
                              }
                              
                              // Se não, gerar uma nova URL assinada
                              let filePath = '';
                              
                              // Extrair o caminho do arquivo da URL
                              if (doc.url.includes('/storage/v1/object/sign/')) {
                                const urlParts = doc.url.split('/storage/v1/object/sign/');
                                if (urlParts.length > 1) {
                                  const pathWithQuery = urlParts[1];
                                  const pathOnly = pathWithQuery.split('?')[0];
                                  const pathParts = pathOnly.split('/');
                                  if (pathParts.length > 1) {
                                    filePath = pathParts.slice(1).join('/');
                                  }
                                }
                              } else if (doc.url.includes('/storage/v1/object/public/')) {
                                const urlParts = doc.url.split('/storage/v1/object/public/');
                                if (urlParts.length > 1) {
                                  const pathWithBucket = urlParts[1];
                                  const pathParts = pathWithBucket.split('/');
                                  if (pathParts.length > 1) {
                                    filePath = pathParts.slice(1).join('/');
                                  }
                                }
                              } else if (doc.id && typeof doc.id === 'string' && !doc.id.startsWith('http')) {
                                filePath = doc.id;
                              }
                              
                              if (filePath) {
                                const result = await DocumentViewerService.getSignedDocumentUrl(filePath);
                                if (result.signedUrl) {
                                  window.open(result.signedUrl, '_blank');
                                } else {
                                  console.error('Falha ao gerar URL assinada:', result.error);
                                  // Fallback: usar URL original
                                  window.open(doc.url, '_blank');
                                }
                              } else {
                                // Fallback: usar URL original
                                window.open(doc.url, '_blank');
                              }
                            } catch (error) {
                              console.error('Erro ao abrir documento:', error);
                              // Fallback: usar URL original
                              window.open(doc.url, '_blank');
                            }
                          }}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tellus-primary"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Visualizar
                        </button>
                        <a
                          href={signedUrls[doc.id] || doc.url}
                          download={doc.fileName}
                          className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-tellus-primary hover:bg-tellus-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tellus-primary"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Baixar
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
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
                  variant="secondary"
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
          {preRegistration.status === 'novo' || preRegistration.status === 'em_analise' ? (
            <>
              <Button
                onClick={handleApprove}
                disabled={processing}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Aprovar Lead
              </Button>
              
              <Button
                onClick={() => setShowRejectForm(!showRejectForm)}
                disabled={processing}
                variant="secondary"
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Rejeitar
              </Button>
            </>
          ) : preRegistration.status === 'aprovado' ? (
            <Button
              onClick={handleApprove}
              disabled={processing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Converter para Cliente
            </Button>
          ) : null}
          
          <Button
            onClick={handleDelete}
            disabled={processing}
            variant="secondary"
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <X className="w-4 h-4 mr-2" />
            Excluir
          </Button>
          
          <Button onClick={onClose} variant="secondary">
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
