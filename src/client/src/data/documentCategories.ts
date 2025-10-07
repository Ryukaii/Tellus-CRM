// Categorias de documentos para diferentes tipos de formulários

export const agroDocumentCategories = [
  // Documentos da Propriedade Rural
  { value: 'rural_property_deed', label: '🌱 Certidão de Matrícula' },
  { value: 'rural_car', label: '🌱 CAR - Cadastro Ambiental Rural' },
  { value: 'rural_itr', label: '🌱 ITR - Imposto Territorial Rural' },
  { value: 'rural_cir', label: '🌱 CIR - Certificado de Inscrição Rural' },
  { value: 'rural_health_certificate', label: '🌱 Ficha Sanitária' },
  { value: 'rural_property_contract', label: '🌱 Contrato de Arrendamento/Comodato' },
  
  // Comprovação de Renda Rural
  { value: 'rural_invoices', label: '💰 Notas Fiscais de Produtor' },
  { value: 'tax_return', label: '💰 Declaração de IR' },
  { value: 'bank_statements', label: '💰 Extratos Bancários' },
  { value: 'accountant_declaration', label: '💰 Declaração de Contador' },
  
  // Documentos Específicos por Linha
  { value: 'pronaf_dap', label: '🚜 DAP - Pronaf' },
  { value: 'moderfrota_budget', label: '🚜 Orçamento MODERFROTA' },
  
  // Documentos por Finalidade
  { value: 'custeio_budget', label: '📄 Orçamento de Custeio' },
  { value: 'harvest_planning', label: '📄 Planejamento da Safra' },
  { value: 'investment_project', label: '📄 Projeto de Investimento' },
  { value: 'investment_budgets', label: '📄 Orçamentos de Investimento (3 mínimo)' },
  { value: 'licenses_authorizations', label: '📄 Licenças e Autorizações' },
  { value: 'production_proof', label: '📄 Comprovação de Produção' },
  { value: 'sale_contracts', label: '📄 Contratos de Venda' },
  { value: 'industrial_project', label: '📄 Projeto Industrial' },
  { value: 'specific_licenses', label: '📄 Licenças Específicas' },
  
  // Documentos Pessoais
  { value: 'identity', label: '👤 RG/CPF' },
  { value: 'address_proof', label: '👤 Comprovante de Residência' },
  { value: 'marital_status', label: '👤 Comprovante de Estado Civil' },
  
  // Documentos de Pessoa Jurídica
  { value: 'contract_social', label: '🏢 Contrato Social' },
  { value: 'contract_amendment', label: '🏢 Última Alteração Contratual' },
  { value: 'cnpj', label: '🏢 Cartão CNPJ' },
  { value: 'company_tax_return', label: '🏢 IR Pessoa Jurídica' },
  { value: 'balance_sheet', label: '🏢 Balanço Patrimonial' },
  { value: 'dre', label: '🏢 DRE - Demonstrativo de Resultados' },
  
  // Outros
  { value: 'other', label: '📎 Outros Documentos' }
];

export const creditoDocumentCategories = [
  // Documentos Pessoais
  { value: 'identity', label: '👤 RG/CPF/CNH' },
  { value: 'address_proof', label: '👤 Comprovante de Residência' },
  { value: 'marital_status', label: '👤 Comprovante de Estado Civil' },
  
  // Comprovação de Renda
  { value: 'income_proof', label: '💰 Comprovante de Renda' },
  { value: 'tax_return', label: '💰 Declaração de IR' },
  { value: 'bank_statements', label: '💰 Extratos Bancários' },
  
  // Documentos de Pessoa Jurídica
  { value: 'contract_social', label: '🏢 Contrato Social' },
  { value: 'cnpj', label: '🏢 Cartão CNPJ' },
  { value: 'company_tax_return', label: '🏢 IR Pessoa Jurídica' },
  { value: 'balance_sheet', label: '🏢 Balanço Patrimonial' },
  
  // Outros
  { value: 'other', label: '📎 Outros Documentos' }
];

export const imobiliarioDocumentCategories = [
  // Documentos Pessoais
  { value: 'identity', label: '👤 RG/CPF/CNH' },
  { value: 'address_proof', label: '👤 Comprovante de Residência' },
  { value: 'marital_status', label: '👤 Comprovante de Estado Civil' },
  
  // Comprovação de Renda
  { value: 'income_proof', label: '💰 Comprovante de Renda' },
  { value: 'tax_return', label: '💰 Declaração de IR' },
  { value: 'bank_statements', label: '💰 Extratos Bancários (3 meses)' },
  
  // Documentos do Imóvel
  { value: 'property_registration', label: '🏠 Matrícula do Imóvel' },
  { value: 'property_evaluation', label: '🏠 Avaliação do Imóvel' },
  { value: 'property_iptu', label: '🏠 IPTU' },
  
  // Documentos de Pessoa Jurídica
  { value: 'contract_social', label: '🏢 Contrato Social' },
  { value: 'cnpj', label: '🏢 Cartão CNPJ' },
  { value: 'company_tax_return', label: '🏢 IR Pessoa Jurídica' },
  
  // Outros
  { value: 'other', label: '📎 Outros Documentos' }
];

export const consultoriaDocumentCategories = [
  // Documentos Pessoais
  { value: 'identity', label: '👤 RG/CPF/CNH' },
  { value: 'address_proof', label: '👤 Comprovante de Residência' },
  { value: 'marital_status', label: '👤 Comprovante de Estado Civil' },
  
  // Documentos Financeiros
  { value: 'income_proof', label: '💰 Comprovante de Renda' },
  { value: 'tax_return', label: '💰 Declaração de IR' },
  { value: 'bank_statements', label: '💰 Extratos Bancários' },
  { value: 'debts_list', label: '💳 Relação de Dívidas' },
  { value: 'credit_card_statements', label: '💳 Faturas de Cartão' },
  
  // Documentos de Pessoa Jurídica
  { value: 'contract_social', label: '🏢 Contrato Social' },
  { value: 'cnpj', label: '🏢 Cartão CNPJ' },
  { value: 'company_tax_return', label: '🏢 IR Pessoa Jurídica' },
  
  // Outros
  { value: 'financial_goals', label: '📊 Objetivos Financeiros' },
  { value: 'other', label: '📎 Outros Documentos' }
];


