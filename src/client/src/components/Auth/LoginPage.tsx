import React, { useState } from 'react';
import { Activity, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { LoginCredentials } from '../../../../shared/types/auth';

export function LoginPage() {
  const { login } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const success = await login(credentials);
      
      if (!success) {
        setError('Email ou senha incorretos');
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-tellus-primary via-tellus-gold-500 to-tellus-bronze-600 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-md">
        {/* Logo e Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-xl sm:rounded-2xl shadow-lg mb-3 sm:mb-4">
            <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-tellus-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Tellure</h1>
          <p className="text-tellus-gold-100 text-sm sm:text-base">Faça login para acessar o sistema</p>
        </div>

        {/* Formulário de Login */}
        <div className="bg-white dark:bg-dark-surface rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 border dark:border-dark-border">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Campo Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-dark-textSecondary flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </label>
              <input
                type="email"
                value={credentials.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full h-10 sm:h-12 px-3 sm:px-4 border border-tellus-charcoal-300 dark:border-dark-border dark:bg-dark-surfaceLight dark:text-dark-text rounded-lg focus:ring-2 focus:ring-tellus-primary focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                placeholder="seu@email.com"
                required
              />
            </div>

            {/* Campo Senha */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-dark-textSecondary flex items-center space-x-2">
                <Lock className="w-4 h-4" />
                <span>Senha</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="w-full h-10 sm:h-12 px-3 sm:px-4 pr-10 sm:pr-12 border border-tellus-charcoal-300 dark:border-dark-border dark:bg-dark-surfaceLight dark:text-dark-text rounded-lg focus:ring-2 focus:ring-tellus-primary focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-dark-textMuted dark:hover:text-dark-text transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Botão de Login */}
            <Button
              type="submit"
              disabled={loading || !credentials.email || !credentials.password}
              className="w-full h-10 sm:h-12 text-sm sm:text-base font-medium"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <LoadingSpinner size="sm" />
                  <span>Entrando...</span>
                </div>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

        </div>

        {/* Footer */}
        <div className="text-center mt-6 sm:mt-8">
          <p className="text-tellus-gold-100 text-xs sm:text-sm">
            © 2024 Tellure. Sistema de gerenciamento de clientes.
          </p>
        </div>
      </div>
    </div>
  );
}
