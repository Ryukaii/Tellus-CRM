import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, TrendingUp, Calendar, DollarSign, CheckCircle, Clock, AlertCircle, XCircle, Plus } from 'lucide-react';
import { useDashboardStats } from '../../hooks/useDashboardStats';

export function Dashboard() {
  const navigate = useNavigate();
  const { stats, recentActivities, loading } = useDashboardStats();

  const statsCards = [
    {
      name: 'Total de Clientes',
      value: stats.totalCustomers,
      icon: Users,
      color: 'bg-blue-500',
      change: `+${stats.customerGrowth}%`,
      changeType: 'positive'
    },
    {
      name: 'Pré-Cadastros',
      value: stats.totalPreRegistrations,
      icon: FileText,
      color: 'bg-green-500',
      change: `+${stats.preRegistrationGrowth}%`,
      changeType: 'positive'
    },
    {
      name: 'Aprovados',
      value: stats.approvedPreRegistrations,
      icon: CheckCircle,
      color: 'bg-emerald-500',
      change: `${stats.conversionRate}%`,
      changeType: 'neutral'
    },
    {
      name: 'Pendentes',
      value: stats.pendingPreRegistrations,
      icon: Clock,
      color: 'bg-yellow-500',
      change: stats.rejectedPreRegistrations > 0 ? `-${stats.rejectedPreRegistrations}` : '0',
      changeType: stats.rejectedPreRegistrations > 0 ? 'negative' : 'neutral'
    }
  ];

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'new-customer':
        // Aqui você pode abrir um modal ou navegar para uma página de criação
        console.log('Abrir modal de novo cliente');
        break;
      case 'pre-registrations':
        navigate('/pre-registrations');
        break;
      case 'customers':
        navigate('/customers');
        break;
      case 'reports':
        console.log('Abrir relatórios');
        break;
    }
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'CheckCircle':
        return CheckCircle;
      case 'XCircle':
        return XCircle;
      case 'FileText':
        return FileText;
      default:
        return FileText;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Visão geral do seu CRM Tellures
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className={`${stat.color} rounded-lg p-3`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loading ? '...' : stat.value}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className={`text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-green-600' : 
                stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-2">
                {stat.changeType === 'neutral' ? 'taxa de conversão' : 'vs mês anterior'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Atividades Recentes</h3>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tellus-primary"></div>
              </div>
            ) : recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const IconComponent = getIconComponent(activity.icon);
                  return (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`${activity.color} rounded-full p-2`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-500">{activity.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma atividade recente</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Ações Rápidas</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <button 
                onClick={() => handleQuickAction('new-customer')}
                className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="bg-blue-500 rounded-lg p-2">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Novo Cliente</p>
                  <p className="text-xs text-gray-500">Cadastrar um novo cliente</p>
                </div>
              </button>
              
              <button 
                onClick={() => handleQuickAction('customers')}
                className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="bg-blue-500 rounded-lg p-2">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Ver Clientes</p>
                  <p className="text-xs text-gray-500">Gerenciar todos os clientes</p>
                </div>
              </button>
              
              <button 
                onClick={() => handleQuickAction('pre-registrations')}
                className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="bg-green-500 rounded-lg p-2">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Ver Pré-Cadastros</p>
                  <p className="text-xs text-gray-500">Gerenciar leads pendentes</p>
                </div>
              </button>
              
              <button 
                onClick={() => handleQuickAction('reports')}
                className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="bg-purple-500 rounded-lg p-2">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Relatórios</p>
                  <p className="text-xs text-gray-500">Visualizar métricas e dados</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="bg-gradient-to-r from-tellus-primary to-blue-600 rounded-lg shadow-sm p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Bem-vindo ao Tellures CRM</h3>
            <p className="text-blue-100 mt-1">
              Gerencie seus clientes e leads de forma eficiente
            </p>
          </div>
          <div className="hidden sm:block">
            <Calendar className="w-12 h-12 text-blue-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
