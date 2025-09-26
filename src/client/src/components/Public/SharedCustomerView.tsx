import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  User, MapPin, DollarSign, MessageSquare, FileText, 
  Clock, Eye, AlertCircle, CheckCircle, Loader2, Download 
} from 'lucide-react';
import { SharingService, ShareableLink } from '../../services/documentViewerService';
import { DocumentViewer } from '../UI/DocumentViewer';
import { LoadingSpinner } from '../UI/LoadingSpinner';

export const SharedCustomerView: React.FC = () => {
  const { linkId } = useParams<{ linkId: string }>();
  const [shareData, setShareData] = useState<ShareableLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (linkId) {
      loadSharedData(linkId);
    }
  }, [linkId]);

  const loadSharedData = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const data = await SharingService.getShareableLink(id);
      setShareData(data);

      // Registrar acesso
      await SharingService.recordAccess(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAll = async () => {
    if (!linkId || !shareData) return;

    try {
      setDownloading(true);
      setError(null);

      const downloadData = await SharingService.downloadAllDocuments(linkId);
      
      // Criar um arquivo ZIP com todos os documentos
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      // Baixar cada documento e adicionar ao ZIP
      for (const doc of downloadData.documents) {
        try {
          const response = await fetch(doc.signedUrl);
          if (response.ok) {
            const blob = await response.blob();
            zip.file(doc.fileName, blob);
          }
        } catch (err) {
          console.error(`Erro ao baixar ${doc.fileName}:`, err);
        }
      }

      // Gerar e baixar o ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `documentos_${downloadData.customerName.replace(/\s+/g, '_')}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao baixar documentos');
    } finally {
      setDownloading(false);
    }
  };

  // Atualizar tempo restante
  useEffect(() => {
    if (!shareData) return;

    const updateTimeRemaining = () => {
      const now = new Date();
      const expiresAt = new Date(shareData.expiresAt);
      const diff = expiresAt.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Expirado');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}min restantes`);
      } else {
        setTimeRemaining(`${minutes}min restantes`);
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000);

    return () => clearInterval(interval);
  }, [shareData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Carregando dados compartilhados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Não foi possível carregar os dados
          </h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!shareData) return null;

  const customer = (shareData as any).customer;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dados Compartilhados
              </h1>
              <p className="text-gray-600">
                Cliente: {customer.name}
              </p>
            </div>
            
            <div className="text-right">
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="text-blue-600 font-medium">
                  {timeRemaining}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Acessos: {shareData.accessCount}
                {shareData.maxAccess && ` / ${shareData.maxAccess}`}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Dados Pessoais */}
          {shareData.permissions.viewPersonalData && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-500" />
                Dados Pessoais
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome</label>
                  <p className="text-gray-900">{customer.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">CPF</label>
                  <p className="text-gray-900">{customer.cpf}</p>
                </div>
                {customer.email && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{customer.email}</p>
                  </div>
                )}
                {customer.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Telefone</label>
                    <p className="text-gray-900">{customer.phone}</p>
                  </div>
                )}
                {customer.birthDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
                    <p className="text-gray-900">
                      {new Date(customer.birthDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}
                {customer.maritalStatus && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estado Civil</label>
                    <p className="text-gray-900 capitalize">{customer.maritalStatus}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Endereço */}
          {shareData.permissions.viewAddress && customer.address && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-green-500" />
                Endereço
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Logradouro</label>
                  <p className="text-gray-900">
                    {customer.address.street}, {customer.address.number}
                  </p>
                </div>
                {customer.address.complement && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Complemento</label>
                    <p className="text-gray-900">{customer.address.complement}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bairro</label>
                  <p className="text-gray-900">{customer.address.neighborhood}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cidade/Estado</label>
                  <p className="text-gray-900">
                    {customer.address.city} - {customer.address.state}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">CEP</label>
                  <p className="text-gray-900">{customer.address.zipCode}</p>
                </div>
              </div>
            </div>
          )}

          {/* Dados Financeiros */}
          {shareData.permissions.viewFinancialData && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-yellow-500" />
                Dados Financeiros
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customer.profession && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Profissão</label>
                    <p className="text-gray-900">{customer.profession}</p>
                  </div>
                )}
                {customer.employmentType && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Emprego</label>
                    <p className="text-gray-900 capitalize">{customer.employmentType}</p>
                  </div>
                )}
                {customer.monthlyIncome && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Renda Mensal</label>
                    <p className="text-gray-900">
                      {new Intl.NumberFormat('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      }).format(customer.monthlyIncome)}
                    </p>
                  </div>
                )}
                {customer.companyName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Empresa</label>
                    <p className="text-gray-900">{customer.companyName}</p>
                  </div>
                )}
                {customer.propertyValue && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Valor do Imóvel</label>
                    <p className="text-gray-900">
                      {new Intl.NumberFormat('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      }).format(customer.propertyValue)}
                    </p>
                  </div>
                )}
                {customer.propertyType && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo do Imóvel</label>
                    <p className="text-gray-900 capitalize">{customer.propertyType}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Documentos */}
          {shareData.permissions.viewDocuments && shareData.documents.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-purple-500" />
                  Documentos ({shareData.documents.length})
                </h2>
                <button
                  onClick={handleDownloadAll}
                  disabled={downloading}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {downloading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>{downloading ? 'Baixando...' : 'Baixar Todos'}</span>
                </button>
              </div>
              
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-start space-x-2">
                  <Download className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-green-800 font-medium">
                      Download disponível
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Você pode baixar todos os documentos em um arquivo ZIP ou visualizar individualmente.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                {shareData.documents.map((doc) => (
                  <DocumentViewer
                    key={doc.id}
                    filePath={doc.id}
                    fileName={doc.fileName}
                    fileType="application/pdf" // Assumir PDF por padrão
                    shareExpiresAt={new Date(shareData.expiresAt)}
                    shareLinkId={linkId}
                    showDownload={true} // Habilitar download em links compartilhados
                  />
                ))}
              </div>
            </div>
          )}

          {/* Observações */}
          {shareData.permissions.viewNotes && customer.notes && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-gray-500" />
                Observações
              </h2>
              
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{customer.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Link seguro e temporário</span>
          </div>
          <p>
            Este link expira automaticamente e os dados são protegidos.
          </p>
        </div>
      </div>
    </div>
  );
};
