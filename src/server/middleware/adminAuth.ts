import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../../shared/types/api.js';

const ADMIN_API_SECRET = process.env.ADMIN_API_SECRET || 'super-secret-admin-key-2024';

export const validateAdminSecret = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { adminSecret } = req.body;
    
    if (!adminSecret) {
      const response: ApiResponse = {
        success: false,
        error: 'Senha administrativa é obrigatória'
      };
      return res.status(400).json(response);
    }
    
    if (adminSecret !== ADMIN_API_SECRET) {
      const response: ApiResponse = {
        success: false,
        error: 'Senha administrativa inválida'
      };
      return res.status(401).json(response);
    }
    
    next();
  } catch (error) {
    console.error('Admin secret validation error:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Erro na validação da senha administrativa'
    };
    res.status(500).json(response);
  }
};
