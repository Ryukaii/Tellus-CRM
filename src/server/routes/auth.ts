import { Router } from 'express';
import { authService } from '../services/authService.js';
import { LoginSchema, CreateUserSchema } from '../../shared/types/auth.js';
import { ApiResponse } from '../../shared/types/api.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateAdminSecret } from '../middleware/adminAuth.js';

const router = Router();

// POST /api/auth/login - Login do usuário
router.post('/login', async (req, res) => {
  try {
    const validationResult = LoginSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      const response: ApiResponse = {
        success: false,
        error: 'Dados de login inválidos',
        data: validationResult.error.errors
      };
      return res.status(400).json(response);
    }

    const authResponse = await authService.login(validationResult.data);
    
    if (!authResponse) {
      const response: ApiResponse = {
        success: false,
        error: 'Email ou senha incorretos'
      };
      return res.status(401).json(response);
    }

    const response: ApiResponse = {
      success: true,
      data: authResponse,
      message: 'Login realizado com sucesso'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Erro interno do servidor'
    };
    res.status(500).json(response);
  }
});

// GET /api/auth/me - Obter dados do usuário autenticado
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const response: ApiResponse = {
      success: true,
      data: req.user
    };
    
    res.json(response);
  } catch (error) {
    console.error('Get user error:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Erro ao obter dados do usuário'
    };
    res.status(500).json(response);
  }
});

// POST /api/auth/verify - Verificar token
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      const response: ApiResponse = {
        success: false,
        error: 'Token não fornecido'
      };
      return res.status(400).json(response);
    }

    const user = await authService.verifyToken(token);
    
    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: 'Token inválido ou expirado'
      };
      return res.status(401).json(response);
    }

    const response: ApiResponse = {
      success: true,
      data: { user, valid: true }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Token verification error:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Erro na verificação do token'
    };
    res.status(500).json(response);
  }
});

// POST /api/auth/create-user - Criar novo usuário (requer senha administrativa)
router.post('/create-user', validateAdminSecret, async (req, res) => {
  try {
    const validationResult = CreateUserSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      const response: ApiResponse = {
        success: false,
        error: 'Dados de criação de usuário inválidos',
        data: validationResult.error.errors
      };
      return res.status(400).json(response);
    }

    const { name, email, password, role } = validationResult.data;
    
    // Criar usuário
    const newUser = await authService.createUser({
      name,
      email,
      password,
      role
    });
    
    const response: ApiResponse = {
      success: true,
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt
      },
      message: 'Usuário criado com sucesso'
    };
    
    res.status(201).json(response);
  } catch (error: any) {
    console.error('Create user error:', error);
    
    let errorMessage = 'Erro interno do servidor';
    if (error.message === 'Email já está em uso') {
      errorMessage = 'Email já está em uso';
    }
    
    const response: ApiResponse = {
      success: false,
      error: errorMessage
    };
    res.status(500).json(response);
  }
});

export default router;
