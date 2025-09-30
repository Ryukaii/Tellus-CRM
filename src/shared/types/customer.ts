import { z } from 'zod';

// Schema de validação para cliente
export const CustomerSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos'),
  rg: z.string().optional(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD').optional(),
  maritalStatus: z.string().optional(),
  address: z.object({
    street: z.string().min(1, 'Rua é obrigatória'),
    number: z.string().min(1, 'Número é obrigatório'),
    complement: z.string().optional(),
    neighborhood: z.string().min(1, 'Bairro é obrigatório'),
    city: z.string().min(1, 'Cidade é obrigatória'),
    state: z.string().length(2, 'Estado deve ter 2 caracteres'),
    zipCode: z.string().regex(/^\d{8}$/, 'CEP deve ter 8 dígitos')
  }),
  profession: z.string().optional(),
  employmentType: z.string().optional(),
  monthlyIncome: z.number().optional(),
  personalCompanyName: z.string().optional(),
  propertyValue: z.number().optional(),
  propertyType: z.string().optional(),
  propertyCity: z.string().optional(),
  propertyState: z.string().optional(),
  uploadedDocuments: z.array(z.object({
    id: z.string(),
    fileName: z.string(),
    fileType: z.string(),
    documentType: z.string(),
    uploadedAt: z.string(),
    url: z.string()
  })).optional(),
  notes: z.string().optional(),
  status: z.string().default('ativo'),
  source: z.string().optional(),
  govPassword: z.string().min(6, 'Senha gov deve ter pelo menos 6 caracteres').optional(),
  processes: z.array(z.enum(['agro', 'credito', 'consultoria', 'credito_imobiliario', 'geral'])).optional(),
  
  // Campos do negócio
  valorNegocio: z.number().optional(),
  comentarios: z.array(z.object({
    id: z.string(),
    comentario: z.string(),
    data: z.string(),
    autor: z.string().optional()
  })).optional(),
  
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
  
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

// Schema mais flexível para atualizações
export const CustomerUpdateSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos').optional(),
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos').optional(),
  rg: z.string().optional(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD').optional(),
  maritalStatus: z.string().optional(),
  address: z.object({
    street: z.string().min(1, 'Rua é obrigatória').optional(),
    number: z.string().min(1, 'Número é obrigatório').optional(),
    complement: z.string().optional(),
    neighborhood: z.string().min(1, 'Bairro é obrigatório').optional(),
    city: z.string().min(1, 'Cidade é obrigatória').optional(),
    state: z.string().length(2, 'Estado deve ter 2 caracteres').optional(),
    zipCode: z.string().regex(/^\d{8}$/, 'CEP deve ter 8 dígitos').optional()
  }).partial().optional(),
  profession: z.string().optional(),
  employmentType: z.string().optional(),
  monthlyIncome: z.number().optional(),
  personalCompanyName: z.string().optional(),
  propertyValue: z.number().optional(),
  propertyType: z.string().optional(),
  propertyCity: z.string().optional(),
  propertyState: z.string().optional(),
  uploadedDocuments: z.array(z.object({
    id: z.string(),
    fileName: z.string(),
    fileType: z.string(),
    documentType: z.string(),
    uploadedAt: z.string(),
    url: z.string()
  })).optional(),
  notes: z.string().optional(),
  status: z.string().optional(),
  source: z.string().optional(),
  govPassword: z.union([
    z.string().min(6, 'Senha gov deve ter pelo menos 6 caracteres'),
    z.literal('')
  ]).optional(),
  processes: z.array(z.enum(['agro', 'credito', 'consultoria', 'credito_imobiliario', 'geral'])).optional(),
  
  // Campos do negócio
  valorNegocio: z.number().optional(),
  comentarios: z.array(z.object({
    id: z.string(),
    comentario: z.string(),
    data: z.string(),
    autor: z.string().optional()
  })).optional()
}).partial();

export type Customer = z.infer<typeof CustomerSchema>;
export type CustomerUpdate = z.infer<typeof CustomerUpdateSchema>;

export interface CustomerFilters {
  search?: string;
  city?: string;
  state?: string;
  page?: number;
  limit?: number;
}

export interface CustomerResponse {
  customers: Customer[];
  total: number;
  page: number;
  limit: number;
}

export interface Comentario {
  id: string;
  comentario: string;
  data: string;
  autor?: string;
}

export interface NovoComentario {
  comentario: string;
  autor?: string;
}
