import { Router } from 'express';
import { PreRegistrationService } from '../services/preRegistrationService.js';
import { authenticateToken } from '../middleware/auth.js';
import { database } from '../database/database.js';
import { leadService } from '../services/leadService.js';

const router = Router();

// ========== ROTAS PÚBLICAS (sem autenticação) ==========

// Criar ou buscar pré-cadastro por sessão
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'ID da sessão é obrigatório' });
    }

    const preRegistration = await PreRegistrationService.getOrCreatePreRegistration(sessionId);
    
    res.json({
      success: true,
      data: preRegistration
    });
  } catch (error) {
    console.error('Error getting pre-registration:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    });
  }
});

// Atualizar pré-cadastro
router.put('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const updateData = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'ID da sessão é obrigatório' });
    }

    const preRegistration = await PreRegistrationService.updatePreRegistration(sessionId, updateData);
    
    res.json({
      success: true,
      data: preRegistration
    });
  } catch (error) {
    console.error('Error updating pre-registration:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    });
  }
});

// Avançar para próxima etapa
router.post('/session/:sessionId/next', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const stepData = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'ID da sessão é obrigatório' });
    }

    const preRegistration = await PreRegistrationService.nextStep(sessionId, stepData);
    
    res.json({
      success: true,
      data: preRegistration
    });
  } catch (error) {
    console.error('Error advancing step:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    });
  }
});

// Voltar para etapa anterior
router.post('/session/:sessionId/previous', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'ID da sessão é obrigatório' });
    }

    const preRegistration = await PreRegistrationService.previousStep(sessionId);
    
    res.json({
      success: true,
      data: preRegistration
    });
  } catch (error) {
    console.error('Error going to previous step:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    });
  }
});

// Finalizar pré-cadastro (converter para lead)
router.post('/session/:sessionId/complete', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { source } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'ID da sessão é obrigatório' });
    }

    const lead = await PreRegistrationService.completePreRegistration(sessionId, source);
    
    res.json({
      success: true,
      data: lead,
      message: 'Pré-cadastro finalizado com sucesso!'
    });
  } catch (error) {
    console.error('Error completing pre-registration:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    });
  }
});

// Salvar documentos upados no pré-cadastro
router.post('/session/:sessionId/documents', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { documents } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'ID da sessão é obrigatório' });
    }

    if (!documents || !Array.isArray(documents)) {
      return res.status(400).json({ error: 'Lista de documentos é obrigatória' });
    }

    // Buscar pré-cadastro existente
    let preRegistration = await database.findPreRegistrationBySessionId(sessionId);
    
    if (!preRegistration) {
      return res.status(404).json({ 
        success: false, 
        error: 'Pré-cadastro não encontrado' 
      });
    }

    // Atualizar com os documentos upados
    const updateData = {
      uploadedDocuments: documents,
      updatedAt: new Date(),
      lastAccessedAt: new Date()
    };

    const updatedPreRegistration = await database.updatePreRegistration(sessionId, updateData);
    
    res.json({
      success: true,
      data: updatedPreRegistration,
      message: 'Documentos salvos com sucesso!'
    });
  } catch (error) {
    console.error('Error saving documents:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    });
  }
});

// Gerar novo ID de sessão
router.post('/session/new', async (_req, res) => {
  try {
    const sessionId = PreRegistrationService.generateSessionId();
    
    // Criar o pré-cadastro automaticamente
    const preRegistration = await PreRegistrationService.getOrCreatePreRegistration(sessionId);
    
    res.json({
      success: true,
      data: preRegistration
    });
  } catch (error) {
    console.error('Error generating session ID:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    });
  }
});

// ========== ROTAS ADMINISTRATIVAS (requerem autenticação) ==========

// Buscar todos os leads finalizados (para admin)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    
    // Construir filtros para buscar apenas leads que vieram do formulário público
    const filters: any = {
      source: { 
        $in: [
          'formulario_publico',
          'lead_credito',
          'lead_consultoria', 
          'lead_agro',
          'lead_geral',
          'lead_credito_imobiliario'
        ]
      }
    };
    
    if (status === 'approved') {
      filters.status = 'ativo';
    } else if (status === 'pending') {
      filters.status = 'novo';
    }
    
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { cpf: { $regex: search, $options: 'i' } }
      ];
    }
    
    
    // Buscar leads ao invés de pré-cadastros usando LeadService
    const leadFilters = {
      search: search as string,
      status: status as string,
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    };
    
    const result = await leadService.getLeads(leadFilters);
    
    // Filtrar apenas leads do formulário público (todas as sources de lead)
    const leadSources = [
      'formulario_publico',
      'lead_credito',
      'lead_consultoria', 
      'lead_agro',
      'lead_geral',
      'lead_credito_imobiliario'
    ];
    const filteredLeads = result.leads.filter(lead => leadSources.includes(lead.source));
    
    res.json({
      success: true,
      data: filteredLeads,
      total: filteredLeads.length,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(filteredLeads.length / result.limit)
    });
  } catch (error) {
    console.error('Error getting leads:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    });
  }
});

// Buscar lead por ID (para admin)
router.get('/admin/:leadId', authenticateToken, async (req, res) => {
  try {
    const { leadId } = req.params;
    
    if (!leadId) {
      return res.status(400).json({ error: 'ID do lead é obrigatório' });
    }

    const lead = await leadService.getLeadById(leadId);
    
    if (!lead) {
      return res.status(404).json({ 
        success: false, 
        error: 'Lead não encontrado' 
      });
    }
    
    res.json({
      success: true,
      data: lead
    });
  } catch (error) {
    console.error('Error getting lead:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    });
  }
});

// Aprovar lead e converter para cliente
router.post('/:leadId/approve', authenticateToken, async (req, res) => {
  try {
    const { leadId } = req.params;
    
    if (!leadId) {
      return res.status(400).json({ error: 'ID do lead é obrigatório' });
    }

    // Buscar o lead
    const lead = await leadService.getLeadById(leadId);
    
    if (!lead) {
      return res.status(404).json({ 
        success: false, 
        error: 'Lead não encontrado' 
      });
    }

    // Converter para cliente
    const customerData = {
      name: lead.name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      cpf: lead.cpf || '',
      rg: lead.rg || '',
      birthDate: lead.birthDate || '',
      maritalStatus: lead.maritalStatus || 'solteiro',
      address: lead.address || {},
      profession: lead.profession || '',
      employmentType: lead.employmentType || 'clt',
      monthlyIncome: lead.monthlyIncome || 0,
      companyName: lead.companyName || '',
      propertyValue: lead.propertyValue || 0,
      propertyType: lead.propertyType || 'apartamento',
      propertyCity: lead.propertyCity || '',
      propertyState: lead.propertyState || '',
      hasSpouse: lead.hasSpouse || false,
      spouseName: lead.spouseName || '',
      spouseCpf: lead.spouseCpf || '',
      notes: lead.notes || '',
      status: 'ativo',
      source: 'lead_aprovado'
    };

    // Criar o cliente
    const customer = await database.createCustomer(customerData);
    
    // Remover o lead após conversão
    await leadService.deleteLead(leadId);
    
    res.json({
      success: true,
      data: customer,
      message: 'Lead aprovado e convertido para cliente!'
    });
  } catch (error) {
    console.error('Error approving lead:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    });
  }
});

// Rejeitar lead
router.post('/:leadId/reject', authenticateToken, async (req, res) => {
  try {
    const { leadId } = req.params;
    const { reason } = req.body;
    
    if (!leadId) {
      return res.status(400).json({ error: 'ID do lead é obrigatório' });
    }

    // Atualizar o lead com status rejeitado
    const updateData = {
      status: 'rejeitado' as const,
      rejectionReason: reason || 'Não especificado',
      rejectedAt: new Date().toISOString()
    };

    const lead = await leadService.updateLead(leadId, updateData);
    
    if (!lead) {
      return res.status(404).json({ 
        success: false, 
        error: 'Lead não encontrado' 
      });
    }
    
    res.json({
      success: true,
      data: lead,
      message: 'Lead rejeitado!'
    });
  } catch (error) {
    console.error('Error rejecting lead:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    });
  }
});

// Excluir lead
router.delete('/:leadId', authenticateToken, async (req, res) => {
  try {
    const { leadId } = req.params;
    
    if (!leadId) {
      return res.status(400).json({ error: 'ID do lead é obrigatório' });
    }

    const deleted = await leadService.deleteLead(leadId);
    
    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        error: 'Lead não encontrado' 
      });
    }
    
    res.json({
      success: true,
      message: 'Lead excluído com sucesso!'
    });
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    });
  }
});

export default router;
