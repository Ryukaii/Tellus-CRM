import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService.js';
import { ApiResponse } from '../../shared/types/api.js';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: 'admin' | 'user';
      };
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      const response: ApiResponse = {
        success: false,
        error: 'Token de acesso requerido'
      };
      return res.status(401).json(response);
    }

    const user = await authService.verifyToken(token);
    
    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: 'Token inválido ou expirado'
      };
      return res.status(401).json(response);
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Erro de autenticação'
    };
    res.status(401).json(response);
  }
};

export const requireRole = (roles: ('admin' | 'user')[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: 'Usuário não autenticado'
      };
      return res.status(401).json(response);
    }

    if (!roles.includes(req.user.role)) {
      const response: ApiResponse = {
        success: false,
        error: 'Acesso negado: permissões insuficientes'
      };
      return res.status(403).json(response);
    }

    next();
  };
};
