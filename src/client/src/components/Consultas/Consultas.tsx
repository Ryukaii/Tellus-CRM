import React from 'react';
import { Search, Construction } from 'lucide-react';

export function Consultas() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-tellus-charcoal-900 dark:text-dark-text">Consultas</h1>
        <p className="mt-2 text-tellus-charcoal-600 dark:text-dark-textSecondary">
          Sistema de consultas e pesquisas
        </p>
      </div>

      {/* Em Construção */}
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-md border border-tellus-gold-200 dark:border-dark-border">
        <div className="flex flex-col items-center justify-center py-16 px-6">
          {/* Ícone animado */}
          <div className="relative mb-8">
            <div className="bg-gradient-to-br from-tellus-gold-100 to-tellus-gold-200 dark:from-dark-surfaceLight dark:to-dark-border rounded-full p-8 shadow-lg">
              <Construction className="w-16 h-16 text-tellus-gold-600 dark:text-dark-accent animate-pulse" />
            </div>
            <div className="absolute -top-2 -right-2 bg-tellus-primary rounded-full p-2 shadow-md">
              <Search className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Mensagem */}
          <h2 className="text-2xl font-bold text-tellus-charcoal-900 dark:text-dark-text mb-3">
            Página em Construção
          </h2>
          <p className="text-tellus-charcoal-600 dark:text-dark-textSecondary text-center max-w-md mb-6">
            Estamos trabalhando para trazer uma experiência completa de consultas e pesquisas para você.
          </p>

          {/* Status Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-tellus-gold-50 dark:bg-dark-surfaceLight rounded-full border border-tellus-gold-200 dark:border-dark-border">
            <div className="w-2 h-2 bg-tellus-gold-600 dark:bg-dark-accent rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-tellus-gold-700 dark:text-dark-accent">
              Em desenvolvimento
            </span>
          </div>

          {/* Informações adicionais */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
            <div className="bg-tellus-gold-50 dark:bg-dark-surfaceLight rounded-lg p-6 border border-tellus-gold-200 dark:border-dark-border">
              <div className="text-3xl font-bold text-tellus-primary dark:text-dark-accent mb-2">🔍</div>
              <h3 className="text-sm font-semibold text-tellus-charcoal-900 dark:text-dark-text mb-1">
                Busca Avançada
              </h3>
              <p className="text-xs text-tellus-charcoal-600 dark:text-dark-textSecondary">
                Consultas personalizadas nos registros
              </p>
            </div>

            <div className="bg-tellus-gold-50 dark:bg-dark-surfaceLight rounded-lg p-6 border border-tellus-gold-200 dark:border-dark-border">
              <div className="text-3xl font-bold text-tellus-primary dark:text-dark-accent mb-2">📊</div>
              <h3 className="text-sm font-semibold text-tellus-charcoal-900 dark:text-dark-text mb-1">
                Relatórios
              </h3>
              <p className="text-xs text-tellus-charcoal-600 dark:text-dark-textSecondary">
                Análises detalhadas e exportação
              </p>
            </div>

            <div className="bg-tellus-gold-50 dark:bg-dark-surfaceLight rounded-lg p-6 border border-tellus-gold-200 dark:border-dark-border">
              <div className="text-3xl font-bold text-tellus-primary dark:text-dark-accent mb-2">⚡</div>
              <h3 className="text-sm font-semibold text-tellus-charcoal-900 dark:text-dark-text mb-1">
                Performance
              </h3>
              <p className="text-xs text-tellus-charcoal-600 dark:text-dark-textSecondary">
                Consultas rápidas e eficientes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

