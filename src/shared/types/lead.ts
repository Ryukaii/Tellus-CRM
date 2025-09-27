import { z } from 'zod';

// Schema de validação para lead de crédito imobiliário
export const LeadSchema = z.object({
  id: z.string().uuid().optional(),
  // Dados Pessoais
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos'),
  rg: z.string().min(1, 'RG é obrigatório'),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  
  // Estado Civil
  maritalStatus: z.enum(['solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel']),
  
  // Endereço
  address: z.object({
    street: z.string().min(1, 'Rua é obrigatória'),
    number: z.string().min(1, 'Número é obrigatório'),
    complement: z.string().optional(),
    neighborhood: z.string().min(1, 'Bairro é obrigatório'),
    city: z.string().min(1, 'Cidade é obrigatória'),
    state: z.string().length(2, 'Estado deve ter 2 caracteres'),
    zipCode: z.string().regex(/^\d{8}$/, 'CEP deve ter 8 dígitos')
  }),

  // Dados Profissionais
  profession: z.string().min(1, 'Profissão é obrigatória'),
  employmentType: z.enum(['clt', 'servidor_publico', 'autonomo', 'empresario', 'aposentado']),
  monthlyIncome: z.number().min(0, 'Renda deve ser positiva'),
  personalCompanyName: z.string().optional(),
  
  // Dados do Imóvel de Interesse
  propertyValue: z.number().min(0, 'Valor do imóvel deve ser positivo'),
  propertyType: z.enum(['casa', 'apartamento', 'terreno', 'comercial']),
  propertyCity: z.string().min(1, 'Cidade do imóvel é obrigatória'),
  propertyState: z.string().length(2, 'Estado do imóvel deve ter 2 caracteres'),
  
  // Dados Gov.br
  govPassword: z.string().min(6, 'Senha gov deve ter pelo menos 6 caracteres'),
  hasTwoFactorDisabled: z.boolean(),
  
  // Dados Adicionais
  hasSpouse: z.boolean(),
  spouseName: z.string().optional(),
  spouseCpf: z.string().optional(),
  spouseRg: z.string().optional(),
  spouseBirthDate: z.string().optional(),
  spouseProfession: z.string().optional(),
  spouseEmploymentType: z.enum(['clt', 'servidor_publico', 'autonomo', 'empresario', 'aposentado']).optional(),
  spouseMonthlyIncome: z.number().optional(),
  spouseCompanyName: z.string().optional(),
  
  // Documentos Disponíveis
  hasRG: z.boolean(),
  hasCPF: z.boolean(),
  hasAddressProof: z.boolean(),
  hasIncomeProof: z.boolean(),
  hasMaritalStatusProof: z.boolean(),
  
  // Para empresários
  hasCompanyDocs: z.boolean().optional(),
  hasContractSocial: z.boolean().optional(),
  hasCNPJ: z.boolean().optional(),
  hasTaxReturn: z.boolean().optional(),
  hasBankStatements: z.boolean().optional(),
  
  // Documentos do cônjuge
  hasSpouseRG: z.boolean().optional(),
  hasSpouseCPF: z.boolean().optional(),
  hasSpouseAddressProof: z.boolean().optional(),
  hasSpouseMaritalStatusProof: z.boolean().optional(),
  hasSpouseIncomeProof: z.boolean().optional(),
  hasSpouseTaxReturn: z.boolean().optional(),
  hasSpouseBankStatements: z.boolean().optional(),
  
  // Dados da Pessoa Jurídica
  hasCompany: z.boolean().optional(),
  companyCnpj: z.string().optional(),
  companyName: z.string().optional(),
  companyAddress: z.object({
    street: z.string().optional(),
    number: z.string().optional(),
    complement: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional()
  }).optional(),
  
  // Documentos Enviados
  uploadedDocuments: z.array(z.object({
    id: z.string(),
    fileName: z.string(),
    fileSize: z.number(),
    fileType: z.string(),
    documentType: z.string(),
    uploadedAt: z.string(),
    url: z.string()
  })).optional(),
  
  // Observações
  notes: z.string().optional(),
  
  // Status do Lead
  status: z.enum(['novo', 'em_analise', 'aprovado', 'rejeitado', 'convertido']).default('novo'),
  
  // Campos para rejeição
  rejectionReason: z.string().optional(),
  rejectedAt: z.string().optional(),
  
  // Metadados
  source: z.string().default('formulario_publico'),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export type Lead = z.infer<typeof LeadSchema>;

export interface LeadFilters {
  search?: string;
  status?: string;
  city?: string;
  state?: string;
  employmentType?: string;
  page?: number;
  limit?: number;
}

export interface LeadResponse {
  leads: Lead[];
  total: number;
  page: number;
  limit: number;
}
