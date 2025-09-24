import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, TrendingUp, Calendar, DollarSign, CheckCircle, Clock, AlertCircle, XCircle, Plus } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import { Modal } from '../UI/Modal';
import { CustomerForm } from '../Customer/CustomerForm';
import { useCustomers } from '../../hooks/useCustomers';

export function Dashboard() {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useDashboard();
  const { createCustomer } = useCustomers();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const stats = data?.stats || {
    totalCustomers: 0,
    totalPreRegistrations: 0,
    totalPropertyValue: 0,
    averageMonthlyIncome: 0,
    customerGrowth: 0,
    preRegistrationGrowth: 0
  };

  const recentActivities = data?.recentActivities || [];

  // Função para formatar moeda
  const formatCurrency = (value: number): string => {
    if (!value || value === 0) return 'R$ 0';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

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
      name: 'Valor Total dos Imóveis',
      value: formatCurrency(stats.totalPropertyValue),
      icon: DollarSign,
      color: 'bg-emerald-500',
      change: `${stats.totalCustomers > 0 ? Math.round(stats.totalPropertyValue / stats.totalCustomers / 1000) : 0}k por cliente`,
      changeType: 'neutral'
    },
    {
      name: 'Renda Média Mensal',
      value: formatCurrency(stats.averageMonthlyIncome),
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: `${stats.totalCustomers > 0 ? Math.round((stats.averageMonthlyIncome * stats.totalCustomers) / 1000) : 0}k renda total`,
      changeType: 'neutral'
    }
  ];

  const handleCreateCustomer = async (customerData: any) => {
    try {
      await createCustomer(customerData);
      setShowCreateModal(false);
      // Recarregar dados do dashboard após criar cliente
      refetch();
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      alert('Erro ao criar cliente');
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'new-customer':
        setShowCreateModal(true);
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

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Carregando dados...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Visão geral do seu CRM Tellures</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Erro ao carregar dashboard</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button
                onClick={refetch}
                className="mt-3 text-sm text-red-600 hover:text-red-500 underline"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-tellus-primary to-blue-600 rounded-lg shadow-sm p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Bem-vindo ao Tellures CRM</h1>
            <p className="text-blue-100 mt-1">
              Gerencie seus clientes e leads de forma eficiente
            </p>
          </div>
          <div className="hidden sm:block">
            <Calendar className="w-12 h-12 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
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
                {stat.changeType === 'neutral' ? '' : 'vs mês anterior'}
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
                disabled
                className="w-full flex items-center space-x-3 p-3 text-left rounded-lg bg-gray-50 cursor-not-allowed opacity-60"
                title="Funcionalidade em desenvolvimento"
              >
                <div className="bg-gray-400 rounded-lg p-2">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Relatórios</p>
                  <p className="text-xs text-gray-400">🚧 Em desenvolvimento</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* Modal de Criação de Cliente */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Novo Cliente"
        size="lg"
      >
        <CustomerForm
          onSubmit={handleCreateCustomer}
          onCancel={() => setShowCreateModal(false)}
          loading={loading}
        />
      </Modal>
    </div>
  );
}
