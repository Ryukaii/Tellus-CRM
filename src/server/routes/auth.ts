import { Router } from 'express';
import { authService } from '../services/authService.js';
import { LoginSchema } from '../../shared/types/auth.js';
import { ApiResponse } from '../../shared/types/api.js';
import { authenticateToken } from '../middleware/auth.js';

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

export default router;
