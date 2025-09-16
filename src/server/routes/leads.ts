import { Router } from 'express';
import { leadService } from '../services/leadService.js';
import { LeadSchema } from '../../shared/types/lead.js';
import { ApiResponse } from '../../shared/types/api.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// POST /api/leads/public - Rota pública para criar lead (formulário público)
router.post('/public', async (req, res) => {
  try {
    const validationResult = LeadSchema.omit({ 
      id: true, 
      createdAt: true, 
      updatedAt: true 
    }).safeParse(req.body);
    
    if (!validationResult.success) {
      const response: ApiResponse = {
        success: false,
        error: 'Dados inválidos',
        data: validationResult.error.errors
      };
      return res.status(400).json(response);
    }
    
    const lead = await leadService.createLead(validationResult.data);
    
    const response: ApiResponse = {
      success: true,
      data: { 
        id: lead.id,
        message: 'Cadastro realizado com sucesso! Entraremos em contato em breve.'
      },
      message: 'Lead criado com sucesso'
    };
    
    res.status(201).json(response);
  } catch (error: any) {
    console.error('Error creating lead:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Erro ao processar cadastro. Tente novamente.'
    };
    res.status(500).json(response);
  }
});

// Rotas protegidas (apenas para usuários autenticados)
router.use(authenticateToken);

// GET /api/leads - Listar leads
router.get('/', async (req, res) => {
  try {
    const { search, status, city, state, employmentType, page, limit } = req.query;
    
    const filters = {
      search: search as string,
      status: status as string,
      city: city as string,
      state: state as string,
      employmentType: employmentType as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined
    };

    const result = await leadService.getLeads(filters);
    
    const response: ApiResponse = {
      success: true,
      data: result
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching leads:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Erro ao buscar leads'
    };
    res.status(500).json(response);
  }
});

// GET /api/leads/:id - Buscar lead por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await leadService.getLeadById(id);
    
    if (!lead) {
      const response: ApiResponse = {
        success: false,
        error: 'Lead não encontrado'
      };
      return res.status(404).json(response);
    }
    
    const response: ApiResponse = {
      success: true,
      data: lead
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching lead:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Erro ao buscar lead'
    };
    res.status(500).json(response);
  }
});

// PUT /api/leads/:id - Atualizar lead
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const validationResult = LeadSchema.partial().safeParse(req.body);
    
    if (!validationResult.success) {
      const response: ApiResponse = {
        success: false,
        error: 'Dados inválidos',
        data: validationResult.error.errors
      };
      return res.status(400).json(response);
    }
    
    const lead = await leadService.updateLead(id, validationResult.data);
    
    if (!lead) {
      const response: ApiResponse = {
        success: false,
        error: 'Lead não encontrado'
      };
      return res.status(404).json(response);
    }
    
    const response: ApiResponse = {
      success: true,
      data: lead,
      message: 'Lead atualizado com sucesso'
    };
    
    res.json(response);
  } catch (error: any) {
    console.error('Error updating lead:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Erro ao atualizar lead'
    };
    res.status(500).json(response);
  }
});

// POST /api/leads/:id/convert - Converter lead em cliente
router.post('/:id/convert', async (req, res) => {
  try {
    const { id } = req.params;
    
    const success = await leadService.convertLeadToCustomer(id);
    
    if (!success) {
      const response: ApiResponse = {
        success: false,
        error: 'Lead não encontrado ou erro na conversão'
      };
      return res.status(404).json(response);
    }
    
    const response: ApiResponse = {
      success: true,
      message: 'Lead convertido em cliente com sucesso'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error converting lead:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Erro ao converter lead'
    };
    res.status(500).json(response);
  }
});

// DELETE /api/leads/:id - Deletar lead
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await leadService.deleteLead(id);
    
    if (!deleted) {
      const response: ApiResponse = {
        success: false,
        error: 'Lead não encontrado'
      };
      return res.status(404).json(response);
    }
    
    const response: ApiResponse = {
      success: true,
      message: 'Lead deletado com sucesso'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error deleting lead:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Erro ao deletar lead'
    };
    res.status(500).json(response);
  }
});

export default router;
