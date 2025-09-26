import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { database } from '../database/database';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

interface CustomerUploadLink {
  id: string;
  customerId: string;
  customerName: string;
  customerCpf: string;
  createdBy: string;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
  accessCount: number;
  maxAccess?: number;
  allowedDocumentTypes: string[];
  maxFileSize: number; // em MB
  maxFiles: number;
}

// Criar link de upload para cliente
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { 
      customerId, 
      expiresInHours = 72, // 3 dias por padrão
      maxAccess,
      allowedDocumentTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      maxFileSize = 10, // 10MB por padrão
      maxFiles = 20 // 20 arquivos por padrão
    } = req.body;
    
    const userId = (req as any).user.id;

    if (!customerId) {
      return res.status(400).json({ 
        success: false, 
        error: 'ID do cliente é obrigatório' 
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

    // Calcular data de expiração
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    // Criar link de upload
    const uploadLink: CustomerUploadLink = {
      id: uuidv4(),
      customerId: customer._id.toString(),
      customerName: customer.name,
      customerCpf: customer.cpf,
      createdBy: userId,
      createdAt: new Date(),
      expiresAt,
      isActive: true,
      accessCount: 0,
      maxAccess,
      allowedDocumentTypes,
      maxFileSize,
      maxFiles
    };

    // Salvar no banco
    await database.createCustomerUploadLink(uploadLink);

    res.json({
      success: true,
      data: uploadLink,
      message: 'Link de upload criado com sucesso!'
    });
  } catch (error) {
    console.error('Error creating customer upload link:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    });
  }
});

// Buscar link de upload (público - sem autenticação)
router.get('/:linkId', async (req, res) => {
  try {
    const { linkId } = req.params;
    const uploadLink = await database.getCustomerUploadLinkById(linkId);
    
    if (!uploadLink) {
      return res.status(404).json({ 
        success: false, 
        error: 'Link não encontrado' 
      });
    }

    // Verificar se o link ainda é válido
    const now = new Date();
    if (!uploadLink.isActive || now > uploadLink.expiresAt) {
      return res.status(410).json({ 
        success: false, 
        error: 'Link expirado ou desativado' 
      });
    }

    // Verificar limite de acessos
    if (uploadLink.maxAccess && uploadLink.accessCount >= uploadLink.maxAccess) {
      return res.status(429).json({ 
        success: false, 
        error: 'Limite de acessos excedido' 
      });
    }

    // Incrementar contador de acessos
    await database.incrementCustomerUploadLinkAccess(linkId);

    res.json({
      success: true,
      data: {
        ...uploadLink,
        timeRemaining: Math.max(0, uploadLink.expiresAt.getTime() - now.getTime())
      }
    });
  } catch (error) {
    console.error('Error getting customer upload link:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    });
  }
});

// Upload de documento via link
router.post('/:linkId/upload', async (req, res) => {
  try {
    const { linkId } = req.params;
    const uploadLink = await database.getCustomerUploadLinkById(linkId);
    
    if (!uploadLink) {
      return res.status(404).json({ 
        success: false, 
        error: 'Link não encontrado' 
      });
    }

    // Verificar se o link ainda é válido
    const now = new Date();
    if (!uploadLink.isActive || now > uploadLink.expiresAt) {
      return res.status(410).json({ 
        success: false, 
        error: 'Link expirado ou desativado' 
      });
    }

    // Verificar limite de acessos
    if (uploadLink.maxAccess && uploadLink.accessCount >= uploadLink.maxAccess) {
      return res.status(429).json({ 
        success: false, 
        error: 'Limite de acessos excedido' 
      });
    }

    // Aqui você implementaria a lógica de upload
    // Por enquanto, retornar sucesso
    res.json({
      success: true,
      message: 'Upload realizado com sucesso!'
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    });
  }
});

// Listar links de upload do usuário
router.get('/my-links', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { page = 1, limit = 10 } = req.query;

    const links = await database.getCustomerUploadLinksByUser(
      userId, 
      Number(page), 
      Number(limit)
    );

    res.json({
      success: true,
      data: links
    });
  } catch (error) {
    console.error('Error getting user upload links:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    });
  }
});

// Desativar link de upload
router.post('/:linkId/deactivate', authenticateToken, async (req, res) => {
  try {
    const { linkId } = req.params;
    const userId = (req as any).user.id;

    // Verificar se o link pertence ao usuário
    const link = await database.getCustomerUploadLinkById(linkId);
    if (!link || link.createdBy !== userId) {
      return res.status(404).json({ 
        success: false, 
        error: 'Link não encontrado' 
      });
    }

    await database.deactivateCustomerUploadLink(linkId);

    res.json({
      success: true,
      message: 'Link desativado com sucesso'
    });
  } catch (error) {
    console.error('Error deactivating upload link:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    });
  }
});

export default router;
