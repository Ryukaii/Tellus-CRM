import { Router } from 'express';
import { customerService } from '../services/customerService.js';
import { CustomerSchema, CustomerUpdateSchema } from '../../shared/types/customer.js';
import { ApiResponse } from '../../shared/types/api.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/customers - Listar clientes com filtros
router.get('/', async (req, res) => {
  try {
    const { search, city, state, page, limit } = req.query;
    
    const filters = {
      search: search as string,
      city: city as string,
      state: state as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined
    };

    console.log('🔄 [CUSTOMERS API] Buscando clientes com filtros:', filters);

    const result = await customerService.getCustomers(filters);
    
    console.log('✅ [CUSTOMERS API] Resultado:', {
      customers: result.customers?.length,
      total: result.total,
      page: result.page,
      limit: result.limit
    });
    
    const response: ApiResponse = {
      success: true,
      data: result
    };
    
    res.json(response);
  } catch (error) {
    console.error('❌ [CUSTOMERS API] Erro ao buscar clientes:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Erro ao buscar clientes'
    };
    res.status(500).json(response);
  }
});

// GET /api/customers/:id - Buscar cliente por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await customerService.getCustomerById(id);
    
    if (!customer) {
      const response: ApiResponse = {
        success: false,
        error: 'Cliente não encontrado'
      };
      return res.status(404).json(response);
    }
    
    const response: ApiResponse = {
      success: true,
      data: customer
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching customer:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Erro ao buscar cliente'
    };
    res.status(500).json(response);
  }
});

// POST /api/customers - Criar novo cliente
router.post('/', async (req, res) => {
  try {
    const validationResult = CustomerSchema.omit({ 
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
    
    const customer = await customerService.createCustomer(validationResult.data);
    
    const response: ApiResponse = {
      success: true,
      data: customer,
      message: 'Cliente criado com sucesso'
    };
    
    res.status(201).json(response);
  } catch (error: any) {
    console.error('Error creating customer:', error);
    
    let errorMessage = 'Erro ao criar cliente';
    if (error.message?.includes('UNIQUE constraint failed: customers.email')) {
      errorMessage = 'Email já está em uso';
    } else if (error.message?.includes('UNIQUE constraint failed: customers.cpf')) {
      errorMessage = 'CPF já está em uso';
    }
    
    const response: ApiResponse = {
      success: false,
      error: errorMessage
    };
    res.status(400).json(response);
  }
});

// PUT /api/customers/:id - Atualizar cliente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const validationResult = CustomerUpdateSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      console.error('❌ [UPDATE CUSTOMER] Dados inválidos:', {
        customerId: id,
        errors: validationResult.error.errors,
        receivedData: req.body
      });
      
      // Log detalhado de cada erro
      validationResult.error.errors.forEach((error, index) => {
        console.error(`❌ [UPDATE CUSTOMER] Erro ${index + 1}:`, {
          path: error.path,
          message: error.message,
          code: error.code,
          received: 'received' in error ? error.received : 'N/A'
        });
      });
      
      const response: ApiResponse = {
        success: false,
        error: 'Dados inválidos',
        data: validationResult.error.errors
      };
      return res.status(400).json(response);
    }
    
    const customer = await customerService.updateCustomer(id, validationResult.data as any);
    
    if (!customer) {
      console.error('❌ [UPDATE CUSTOMER] Cliente não encontrado:', { customerId: id });
      const response: ApiResponse = {
        success: false,
        error: 'Cliente não encontrado'
      };
      return res.status(404).json(response);
    }
    
    const response: ApiResponse = {
      success: true,
      data: customer,
      message: 'Cliente atualizado com sucesso'
    };
    
    res.json(response);
  } catch (error: any) {
    console.error('❌ [UPDATE CUSTOMER] Erro interno:', {
      customerId: req.params.id,
      error: error.message
    });
    
    let errorMessage = 'Erro ao atualizar cliente';
    if (error.message?.includes('UNIQUE constraint failed: customers.email')) {
      errorMessage = 'Email já está em uso';
    } else if (error.message?.includes('UNIQUE constraint failed: customers.cpf')) {
      errorMessage = 'CPF já está em uso';
    }
    
    const response: ApiResponse = {
      success: false,
      error: errorMessage
    };
    res.status(400).json(response);
  }
});

// DELETE /api/customers/:id - Deletar cliente
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await customerService.deleteCustomer(id);
    
    if (!deleted) {
      const response: ApiResponse = {
        success: false,
        error: 'Cliente não encontrado'
      };
      return res.status(404).json(response);
    }
    
    const response: ApiResponse = {
      success: true,
      message: 'Cliente deletado com sucesso'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error deleting customer:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Erro ao deletar cliente'
    };
    res.status(500).json(response);
  }
});

// PUT /api/customers/:id/documents - Atualizar documentos do cliente
router.put('/:id/documents', async (req, res) => {
  try {
    const { id } = req.params;
    const { documents } = req.body;
    
    if (!Array.isArray(documents)) {
      const response: ApiResponse = {
        success: false,
        error: 'Documentos devem ser um array'
      };
      return res.status(400).json(response);
    }
    
    const customer = await customerService.updateCustomerDocuments(id, documents);
    
    if (!customer) {
      const response: ApiResponse = {
        success: false,
        error: 'Cliente não encontrado'
      };
      return res.status(404).json(response);
    }
    
    const response: ApiResponse = {
      success: true,
      data: customer,
      message: 'Documentos atualizados com sucesso'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error updating customer documents:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Erro ao atualizar documentos'
    };
    res.status(500).json(response);
  }
});

export default router;
