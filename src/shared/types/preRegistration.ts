import { z } from 'zod';

// Schema para pré-cadastro com etapas
export const PreRegistrationSchema = z.object({
  sessionId: z.string().min(1, 'ID da sessão é obrigatório'),
  currentStep: z.number().min(1).max(7, 'Etapa deve estar entre 1 e 7'),
  isCompleted: z.boolean().default(false),
  
  // Etapa 1: Dados Pessoais Básicos
  personalData: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    cpf: z.string().optional(),
    rg: z.string().optional(),
    birthDate: z.string().optional()
  }).optional(),
  
  // Etapa 2: Endereço
  address: z.object({
    street: z.string().optional(),
    number: z.string().optional(),
    complement: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional()
  }).optional(),
  
  // Etapa 3: Dados Profissionais
  professionalData: z.object({
    profession: z.string().optional(),
    employmentType: z.enum(['clt', 'servidor_publico', 'autonomo', 'empresario', 'aposentado']).optional(),
    monthlyIncome: z.number().optional(),
    companyName: z.string().optional()
  }).optional(),
  
  // Etapa 4: Dados do Imóvel
  propertyData: z.object({
    propertyValue: z.number().optional(),
    propertyType: z.enum(['apartamento', 'casa', 'terreno', 'comercial']).optional(),
    propertyCity: z.string().optional(),
    propertyState: z.string().optional()
  }).optional(),
  
  // Etapa 5: Gov.br
  govCredentials: z.object({
    govPassword: z.string().optional(),
    hasTwoFactorDisabled: z.boolean().optional()
  }).optional(),
  
  // Etapa 6: Documentos e Finalização
  documents: z.object({
    // Documentos Pessoais
    hasRG: z.boolean().optional(),
    hasCPF: z.boolean().optional(),
    hasAddressProof: z.boolean().optional(),
    hasMaritalStatusProof: z.boolean().optional(),
    
    // Documentos Empresariais (se aplicável)
    hasCompanyDocs: z.boolean().optional(),
    hasContractSocial: z.boolean().optional(),
    hasCNPJ: z.boolean().optional(),
    
    // Comprovação de Renda
    hasIncomeProof: z.boolean().optional(),
    hasTaxReturn: z.boolean().optional(),
    hasBankStatements: z.boolean().optional(),
    
    // Documentos do Cônjuge (se aplicável)
    hasSpouseRG: z.boolean().optional(),
    hasSpouseCPF: z.boolean().optional(),
    hasSpouseAddressProof: z.boolean().optional(),
    hasSpouseMaritalStatusProof: z.boolean().optional(),
    hasSpouseIncomeProof: z.boolean().optional(),
    hasSpouseTaxReturn: z.boolean().optional(),
    hasSpouseBankStatements: z.boolean().optional()
  }).optional(),

  // Lista de documentos upados
  uploadedDocuments: z.array(z.object({
    id: z.string(),
    fileName: z.string(),
    fileSize: z.number(),
    fileType: z.string(),
    documentType: z.string(),
    uploadedAt: z.string(),
    url: z.string()
  })).optional(),
  
  // Dados do Cônjuge
  spouseData: z.object({
    hasSpouse: z.boolean().optional(),
    spouseName: z.string().optional(),
    spouseCpf: z.string().optional(),
    spouseRg: z.string().optional(),
    spouseBirthDate: z.string().optional(),
    spouseProfession: z.string().optional(),
    spouseEmploymentType: z.enum(['clt', 'servidor_publico', 'autonomo', 'empresario', 'aposentado']).optional(),
    spouseMonthlyIncome: z.number().optional(),
    spouseCompanyName: z.string().optional()
  }).optional(),
  
  // Dados da Pessoa Jurídica
  companyData: z.object({
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
    }).optional()
  }).optional(),
  
  // Dados adicionais
  maritalStatus: z.enum(['solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel']).optional(),
  notes: z.string().optional(),
  
  // Metadados
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  lastAccessedAt: z.string().optional()
});

export type PreRegistration = z.infer<typeof PreRegistrationSchema>;

export interface PreRegistrationStep {
  step: number;
  title: string;
  description: string;
  isCompleted: boolean;
  isAccessible: boolean;
}
