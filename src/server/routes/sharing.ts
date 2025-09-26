import express from 'express';
import { database } from '../database/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';
import { createMultipleSignedUrls } from '../services/supabaseService.js';

const router = express.Router();

interface ShareableLink {
  id: string;
  customerId: string;
  customerName: string;
  customerCpf: string;
  createdBy: string;
  createdAt: Date;
  expiresAt: Date;
  accessCount: number;
  maxAccess?: number;
  isActive: boolean;
  
  permissions: {
    viewPersonalData: boolean;
    viewAddress: boolean;
    viewFinancialData: boolean;
    viewDocuments: boolean;
    viewNotes: boolean;
  };
  
  documents: Array<{
    id: string;
    fileName: string;
    documentType: string;
    signedUrl?: string;
  }>;
}

// Criar link de compartilhamento
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { customerId, expiresInHours, maxAccess, permissions, documentIds } = req.body;
    const userId = (req as any).user.id;

    if (!customerId || !expiresInHours || !permissions) {
      return res.status(400).json({ 
        success: false, 
        error: 'Dados obrigatórios não fornecidos' 
      });
    }

    // Buscar dados do cliente
    const customer = await database.findCustomerById(customerId);
    if (!customer) {
      return res.status(404).json({ 
        success: false, 
        error: 'Cliente não encontrado' 
      });
    }

    // Buscar documentos selecionados
    const selectedDocuments = customer.uploadedDocuments?.filter((doc: any) => 
      documentIds.includes(doc.id)
    ) || [];

    // Calcular data de expiração
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    // Criar link de compartilhamento
    const shareableLink: ShareableLink = {
      id: uuidv4(),
      customerId: customer._id.toString(),
      customerName: customer.name,
      customerCpf: customer.cpf,
      createdBy: userId,
      createdAt: new Date(),
      expiresAt,
      accessCount: 0,
      maxAccess,
      isActive: true,
      permissions,
      documents: selectedDocuments.map((doc: any) => ({
        id: doc.id,
        fileName: doc.fileName,
        documentType: doc.documentType
      }))
    };

    // Salvar no banco
    await database.createShareableLink(shareableLink);

    res.json({
      success: true,
      data: shareableLink,
      message: 'Link de compartilhamento criado com sucesso!'
    });
  } catch (error) {
    console.error('Error creating shareable link:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    });
  }
});

// Buscar link de compartilhamento (público)
router.get('/:linkId', async (req, res) => {
  try {
    const { linkId } = req.params;
    const shareableLink = await database.getShareableLinkById(linkId);
    
    if (!shareableLink) {
      return res.status(404).json({ 
        success: false, 
        error: 'Link não encontrado' 
      });
    }

    // Verificar se o link ainda é válido
    const now = new Date();
    if (!shareableLink.isActive || now > shareableLink.expiresAt) {
      return res.status(410).json({ 
        success: false, 
        error: 'Link expirado ou desativado' 
      });
    }

    // Verificar limite de acessos
    if (shareableLink.maxAccess && shareableLink.accessCount >= shareableLink.maxAccess) {
      return res.status(429).json({ 
        success: false, 
        error: 'Limite de acessos excedido' 
      });
    }

    // Buscar dados completos do cliente
    const customer = await database.findCustomerById(shareableLink.customerId);
    if (!customer) {
      return res.status(404).json({ 
        success: false, 
        error: 'Cliente não encontrado' 
      });
    }

    // Filtrar dados baseado nas permissões
    const filteredCustomer: any = {
      id: customer.id,
      name: shareableLink.permissions.viewPersonalData ? customer.name : '[Oculto]',
      cpf: shareableLink.permissions.viewPersonalData ? customer.cpf : '[Oculto]',
    };

    if (shareableLink.permissions.viewPersonalData) {
      filteredCustomer.email = customer.email;
      filteredCustomer.phone = customer.phone;
      filteredCustomer.birthDate = customer.birthDate;
      filteredCustomer.maritalStatus = customer.maritalStatus;
    }

    if (shareableLink.permissions.viewAddress) {
      filteredCustomer.address = customer.address;
    }

    if (shareableLink.permissions.viewFinancialData) {
      filteredCustomer.profession = customer.profession;
      filteredCustomer.employmentType = customer.employmentType;
      filteredCustomer.monthlyIncome = customer.monthlyIncome;
      filteredCustomer.companyName = customer.companyName;
      filteredCustomer.propertyValue = customer.propertyValue;
      filteredCustomer.propertyType = customer.propertyType;
    }

    if (shareableLink.permissions.viewDocuments) {
      filteredCustomer.uploadedDocuments = shareableLink.documents;
    }

    if (shareableLink.permissions.viewNotes) {
      filteredCustomer.notes = customer.notes;
    }

    const response = {
      ...shareableLink,
      customer: filteredCustomer,
      timeRemaining: Math.max(0, shareableLink.expiresAt.getTime() - now.getTime())
    };

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error getting shareable link:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    });
  }
});

// Registrar acesso ao link
router.post('/:linkId/access', async (req, res) => {
  try {
    const { linkId } = req.params;

    await database.incrementShareableLinkAccess(linkId);

    res.json({
      success: true,
      message: 'Acesso registrado'
    });
  } catch (error) {
    console.error('Error recording access:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    });
  }
});

// Listar links do usuário
router.get('/my-links', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { page = 1, limit = 10 } = req.query;

    const links = await database.getShareableLinksByUser(
      userId, 
      Number(page), 
      Number(limit)
    );

    res.json({
      success: true,
      data: links
    });
  } catch (error) {
    console.error('Error getting user shared links:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    });
  }
});

// Desativar link
router.post('/:linkId/deactivate', authenticateToken, async (req, res) => {
  try {
    const { linkId } = req.params;
    const userId = (req as any).user.id;

    // Verificar se o link pertence ao usuário
    const link = await database.getShareableLinkById(linkId);
    if (!link || link.createdBy !== userId) {
      return res.status(404).json({ 
        success: false, 
        error: 'Link não encontrado' 
      });
    }

    await database.deactivateShareableLink(linkId);

    res.json({
      success: true,
      message: 'Link desativado com sucesso'
    });
  } catch (error) {
    console.error('Error deactivating link:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    });
  }
});

// Gerar URLs assinadas para documentos
router.post('/:linkId/signed-urls', async (req, res) => {
  try {
    const { linkId } = req.params;
    const { documentIds } = req.body;

    const shareableLink = await database.getShareableLinkById(linkId);
    
    if (!shareableLink || !shareableLink.isActive || new Date() > shareableLink.expiresAt) {
      return res.status(404).json({ 
        success: false, 
        error: 'Link não encontrado ou expirado' 
      });
    }

    // Verificar se os documentos fazem parte do compartilhamento
    const allowedDocuments = shareableLink.documents.filter((doc: any) => 
      documentIds.includes(doc.id)
    );

    // Calcular tempo restante do compartilhamento
    const now = new Date();
    const expiresAt = new Date(shareableLink.expiresAt);
    const timeRemaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
    
    // Se o compartilhamento já expirou, retornar erro
    if (timeRemaining <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Compartilhamento expirado' 
      });
    }

    // Usar o tempo restante do compartilhamento, mas com um mínimo de 5 minutos
    const expiresInSeconds = Math.max(300, timeRemaining);

    // Gerar URLs assinadas reais usando o Supabase
    const filePaths = allowedDocuments.map((doc: any) => doc.id);
    const { urls: signedUrls, errors } = await createMultipleSignedUrls(filePaths, expiresInSeconds);
    
    // Se houver erros, logar mas continuar com as URLs que funcionaram
    if (Object.keys(errors).length > 0) {
      console.warn('Alguns arquivos não puderam gerar URLs assinadas:', errors);
    }

    res.json({
      success: true,
      data: signedUrls,
      expiresInSeconds,
      timeRemaining
    });
  } catch (error) {
    console.error('Error generating signed URLs:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    });
  }
});

// Gerar URL assinada para um documento específico (para visualização)
router.post('/document/signed-url', authenticateToken, async (req, res) => {
  try {
    const { filePath, expiresIn = 3600 } = req.body;
    // const userId = (req as any).user.id; // Para futuras validações de permissão

    if (!filePath) {
      return res.status(400).json({ 
        success: false, 
        error: 'Caminho do arquivo é obrigatório' 
      });
    }

    // Verificar se o usuário tem permissão para acessar este arquivo
    // (implementar validação baseada no CPF do usuário ou outras regras)
    
    const { createSignedUrl } = await import('../services/supabaseService.js');
    const result = await createSignedUrl(filePath, expiresIn);
    
    if (result.error) {
      return res.status(500).json({ 
        success: false, 
        error: result.error 
      });
    }

    res.json({
      success: true,
      data: {
        signedUrl: result.url,
        expiresIn
      }
    });
  } catch (error) {
    console.error('Error generating document signed URL:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    });
  }
});

// Download em lote de documentos compartilhados
router.get('/:linkId/download-all', async (req, res) => {
  try {
    const { linkId } = req.params;
    const shareableLink = await database.getShareableLinkById(linkId);
    
    if (!shareableLink) {
      return res.status(404).json({ 
        success: false, 
        error: 'Link não encontrado' 
      });
    }

    // Verificar se o link ainda é válido
    const now = new Date();
    if (!shareableLink.isActive || now > shareableLink.expiresAt) {
      return res.status(410).json({ 
        success: false, 
        error: 'Link expirado ou desativado' 
      });
    }

    // Verificar se tem permissão para visualizar documentos
    if (!shareableLink.permissions.viewDocuments) {
      return res.status(403).json({ 
        success: false, 
        error: 'Sem permissão para baixar documentos' 
      });
    }

    // Verificar limite de acessos
    if (shareableLink.maxAccess && shareableLink.accessCount >= shareableLink.maxAccess) {
      return res.status(429).json({ 
        success: false, 
        error: 'Limite de acessos excedido' 
      });
    }

    // Buscar dados completos do cliente
    const customer = await database.findCustomerById(shareableLink.customerId);
    if (!customer) {
      return res.status(404).json({ 
        success: false, 
        error: 'Cliente não encontrado' 
      });
    }

    // Filtrar documentos que estão no compartilhamento
    const sharedDocuments = customer.uploadedDocuments?.filter((doc: any) => 
      shareableLink.documents.some((sharedDoc: any) => sharedDoc.id === doc.id)
    ) || [];

    if (sharedDocuments.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Nenhum documento encontrado' 
      });
    }

    // Gerar URLs assinadas para todos os documentos
    const { createSignedUrl } = await import('../services/supabaseService.js');
    const documentUrls = [];
    for (const doc of sharedDocuments) {
      const expiresIn = Math.max(3600, Math.floor((shareableLink.expiresAt.getTime() - now.getTime()) / 1000));
      const result = await createSignedUrl(doc.id, expiresIn);
      
      if (result.url) {
        documentUrls.push({
          id: doc.id,
          fileName: doc.fileName,
          documentType: doc.documentType,
          signedUrl: result.url,
          expiresIn
        });
      }
    }

    res.json({
      success: true,
      data: {
        customerName: shareableLink.customerName,
        documents: documentUrls,
        totalDocuments: documentUrls.length
      }
    });
  } catch (error) {
    console.error('Error generating bulk download:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    });
  }
});

export default router;
