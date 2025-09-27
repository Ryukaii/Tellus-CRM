import React, { useState } from 'react';
import { Copy, Check, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { Modal } from './Modal';

interface RegistrationLink {
  name: string;
  url: string;
  description: string;
  type: string;
}

interface CopyRegistrationLinksProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CopyRegistrationLinks({ isOpen, onClose }: CopyRegistrationLinksProps) {
  const [copiedLinks, setCopiedLinks] = useState<Set<string>>(new Set());

  // Obter a URL base do ambiente atual
  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  };

  const baseUrl = getBaseUrl();

  const registrationLinks: RegistrationLink[] = [
    {
      name: 'Agronegócio',
      url: `${baseUrl}/cadastro/agro`,
      description: 'Formulário para cadastro de leads do agronegócio',
      type: 'agro'
    },
    {
      name: 'Crédito Pessoal',
      url: `${baseUrl}/cadastro/credito`,
      description: 'Formulário para cadastro de leads de crédito pessoal',
      type: 'credito'
    },
    {
      name: 'Consultoria',
      url: `${baseUrl}/cadastro/consultoria`,
      description: 'Formulário para cadastro de leads de consultoria',
      type: 'consultoria'
    },
    {
      name: 'Crédito Imobiliário',
      url: `${baseUrl}/cadastro/creditoimobiliario`,
      description: 'Formulário para cadastro de leads de crédito imobiliário',
      type: 'creditoimobiliario'
    }
  ];

  const copyToClipboard = async (url: string, type: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLinks(prev => new Set([...prev, type]));
      
      // Remove o indicador de copiado após 2 segundos
      setTimeout(() => {
        setCopiedLinks(prev => {
          const newSet = new Set(prev);
          newSet.delete(type);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error('Erro ao copiar link:', err);
      // Fallback para navegadores mais antigos
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setCopiedLinks(prev => new Set([...prev, type]));
      setTimeout(() => {
        setCopiedLinks(prev => {
          const newSet = new Set(prev);
          newSet.delete(type);
          return newSet;
        });
      }, 2000);
    }
  };

  const copyAllLinks = async () => {
    const allLinksText = registrationLinks
      .map(link => `${link.name}: ${link.url}`)
      .join('\n');
    
    try {
      await navigator.clipboard.writeText(allLinksText);
      // Mostrar todos como copiados
      setCopiedLinks(new Set(registrationLinks.map(link => link.type)));
      setTimeout(() => setCopiedLinks(new Set()), 2000);
    } catch (err) {
      console.error('Erro ao copiar todos os links:', err);
    }
  };

  const openLink = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Links de Cadastro"
      size="lg"
    >
      <div className="space-y-4">
        <div className="bg-tellus-gold-50 border border-tellus-gold-200 rounded-lg p-4 dark:bg-dark-surfaceLight dark:border-dark-border">
          <div className="flex items-start space-x-3">
            <LinkIcon className="w-5 h-5 text-tellus-gold-600 mt-0.5 dark:text-dark-accent" />
            <div>
              <h4 className="text-sm font-medium text-tellus-charcoal-900 dark:text-dark-text">
                Links Públicos de Cadastro
              </h4>
              <p className="text-sm text-tellus-charcoal-600 dark:text-dark-textSecondary mt-1">
                Use estes links para compartilhar formulários de cadastro com seus clientes. 
                Cada link direciona para um formulário específico.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {registrationLinks.map((link) => (
            <div
              key={link.type}
              className="bg-white border border-tellus-gold-200 rounded-lg p-4 hover:shadow-md transition-shadow dark:bg-dark-card dark:border-dark-border"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-medium text-tellus-charcoal-900 dark:text-dark-text">
                    {link.name}
                  </h5>
                  <p className="text-sm text-tellus-charcoal-600 dark:text-dark-textSecondary mt-1">
                    {link.description}
                  </p>
                  <div className="mt-2">
                    <code className="text-xs bg-tellus-charcoal-50 text-tellus-charcoal-700 px-2 py-1 rounded dark:bg-dark-surfaceLight dark:text-dark-textMuted break-all">
                      {link.url}
                    </code>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => openLink(link.url)}
                    className="p-2 text-tellus-charcoal-400 hover:text-tellus-primary transition-colors dark:text-dark-textMuted dark:hover:text-dark-accent"
                    title="Abrir link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => copyToClipboard(link.url, link.type)}
                    className={`p-2 rounded-lg transition-colors ${
                      copiedLinks.has(link.type)
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-tellus-gold-100 text-tellus-gold-600 hover:bg-tellus-gold-200 dark:bg-dark-surfaceLight dark:text-dark-accent dark:hover:bg-dark-surfaceLight'
                    }`}
                    title={copiedLinks.has(link.type) ? 'Copiado!' : 'Copiar link'}
                  >
                    {copiedLinks.has(link.type) ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-tellus-gold-200 dark:border-dark-border">
          <button
            onClick={copyAllLinks}
            className="flex items-center space-x-2 px-4 py-2 bg-tellus-primary text-white rounded-lg hover:bg-tellus-primary/90 transition-colors"
          >
            <Copy className="w-4 h-4" />
            <span>Copiar Todos os Links</span>
          </button>
          
          <button
            onClick={onClose}
            className="px-4 py-2 text-tellus-charcoal-600 hover:text-tellus-charcoal-800 transition-colors dark:text-dark-textSecondary dark:hover:text-dark-text"
          >
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  );
}
