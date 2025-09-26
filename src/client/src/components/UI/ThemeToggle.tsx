import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeSafe } from '../../contexts/ThemeContext';

interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'text' | 'both';
  className?: string;
}

export function ThemeToggle({ 
  size = 'md', 
  variant = 'icon',
  className = '' 
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useThemeSafe();

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const getIcon = () => {
    if (theme === 'dark') {
      return <Sun className={iconSizes[size]} />;
    }
    return <Moon className={iconSizes[size]} />;
  };

  const getText = () => {
    return theme === 'dark' ? 'Claro' : 'Escuro';
  };

  const baseClasses = `
    inline-flex items-center justify-center rounded-lg
    bg-tellus-charcoal-100 hover:bg-tellus-charcoal-200
    text-tellus-charcoal-700 hover:text-tellus-charcoal-900
    dark:bg-dark-surfaceLight dark:hover:bg-dark-surfaceLighter
    dark:text-dark-textSecondary dark:hover:text-dark-text
    border border-tellus-charcoal-200 dark:border-dark-border
    transition-all duration-200 ease-in-out
    shadow-sm hover:shadow-md
    focus:outline-none focus:ring-2 focus:ring-tellus-primary focus:ring-offset-2
    dark:focus:ring-offset-dark-surface
  `;

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        className={`${baseClasses} ${sizeClasses[size]} ${className}`}
        title={`Alternar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
        aria-label={`Alternar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
      >
        {getIcon()}
      </button>
    );
  }

  if (variant === 'text') {
    return (
      <button
        onClick={toggleTheme}
        className={`${baseClasses} px-3 py-2 ${textSizes[size]} ${className}`}
        title={`Alternar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
        aria-label={`Alternar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
      >
        {getText()}
      </button>
    );
  }

  // variant === 'both'
  return (
    <button
      onClick={toggleTheme}
      className={`${baseClasses} px-3 py-2 space-x-2 ${textSizes[size]} ${className}`}
      title={`Alternar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
      aria-label={`Alternar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
    >
      {getIcon()}
      <span>{getText()}</span>
    </button>
  );
}
