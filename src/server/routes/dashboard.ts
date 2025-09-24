import { Router } from 'express';
import { dashboardService } from '../services/dashboardService.js';
import { ApiResponse } from '../../shared/types/api.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/dashboard - Obter dados do dashboard
router.get('/', async (_req, res) => {
  try {
    console.log('🔄 [DASHBOARD API] Recebendo requisição para dados do dashboard');

    const dashboardData = await dashboardService.getDashboardData();
    
    console.log('✅ [DASHBOARD API] Dados do dashboard calculados:', {
      totalCustomers: dashboardData.stats.totalCustomers,
      totalPreRegistrations: dashboardData.stats.totalPreRegistrations,
      recentActivities: dashboardData.recentActivities.length
    });
    
    const response: ApiResponse = {
      success: true,
      data: dashboardData
    };
    
    res.json(response);
  } catch (error) {
    console.error('❌ [DASHBOARD API] Erro ao obter dados do dashboard:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Erro ao obter dados do dashboard'
    };
    
    res.status(500).json(response);
  }
});

export default router;
