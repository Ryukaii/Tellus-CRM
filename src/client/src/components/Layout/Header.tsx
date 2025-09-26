import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Users, Activity, LogOut, User, UserPlus, FileText, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeToggle } from '../UI/ThemeToggle';

export function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };
  return (
    <header className="bg-white border-b border-tellus-gold-200 shadow-sm bg-gradient-to-r from-white to-tellus-gold-50 dark:bg-dark-surface dark:border-dark-border dark:from-dark-surface dark:to-dark-surfaceLight">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-tellus-primary to-tellus-gold-600 rounded-lg flex items-center justify-center shadow-md">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-tellus-charcoal-900 dark:text-dark-text">Tellure</h1>
                <p className="text-xs text-tellus-gold-600 dark:text-dark-accent hidden sm:block font-medium">CRM</p>
              </div>
            </div>
          </div>
          
          {/* Desktop Navigation and User Info */}
          <div className="hidden sm:flex items-center space-x-4 lg:space-x-6">
            {/* Navigation */}
            <nav className="flex items-center space-x-4 lg:space-x-6">
              <button
                onClick={() => handleNavigation('/customers')}
                className={`flex items-center space-x-2 font-medium transition-colors px-3 py-2 rounded-lg ${
                  isActive('/customers')
                    ? 'text-tellus-primary bg-tellus-gold-100 dark:text-dark-accent dark:bg-dark-surfaceLight'
                    : 'text-tellus-charcoal-600 hover:text-tellus-primary hover:bg-tellus-gold-50 dark:text-dark-textSecondary dark:hover:text-dark-accent dark:hover:bg-dark-surfaceLight'
                }`}
              >
                <Users className="w-4 h-4" />
                <span className="hidden lg:inline">Clientes</span>
              </button>

              <button
                onClick={() => handleNavigation('/pre-registrations')}
                className={`flex items-center space-x-2 font-medium transition-colors px-3 py-2 rounded-lg ${
                  isActive('/pre-registrations')
                    ? 'text-tellus-primary bg-tellus-gold-100 dark:text-dark-accent dark:bg-dark-surfaceLight'
                    : 'text-tellus-charcoal-600 hover:text-tellus-primary hover:bg-tellus-gold-50 dark:text-dark-textSecondary dark:hover:text-dark-accent dark:hover:bg-dark-surfaceLight'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span className="hidden lg:inline">Pré-Cadastros</span>
              </button>
            </nav>

            {/* User Info */}
            <div className="flex items-center space-x-3 lg:space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={() => {
                  const root = document.documentElement;
                  if (root.classList.contains('dark')) {
                    root.classList.remove('dark');
                    localStorage.setItem('tellus-theme', 'light');
                  } else {
                    root.classList.add('dark');
                    localStorage.setItem('tellus-theme', 'dark');
                  }
                }}
                className="bg-tellus-primary text-white px-3 py-1 rounded text-sm hover:bg-tellus-gold-600 transition-colors"
              >
                🌙 Tema
              </button>
              
              <div className="flex items-center space-x-2 text-tellus-charcoal-700 dark:text-dark-textSecondary">
                <User className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium truncate max-w-32">
                  {user?.name}
                </span>
                <span className="text-xs bg-gradient-to-r from-tellus-primary to-tellus-gold-600 text-white px-2 py-1 rounded-full hidden lg:inline shadow-sm">
                  {user?.role}
                </span>
              </div>
              
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-tellus-charcoal-500 hover:text-red-600 transition-colors dark:text-dark-textMuted dark:hover:text-red-400"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm hidden lg:inline">Sair</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center space-x-2">
            <div className="flex items-center space-x-2 text-tellus-charcoal-700 dark:text-dark-textSecondary">
              <User className="w-4 h-4" />
              <span className="text-sm font-medium truncate max-w-20">
                {user?.name}
              </span>
            </div>
            
            <ThemeToggle size="sm" variant="icon" />
            
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-tellus-charcoal-500 hover:text-tellus-charcoal-700 transition-colors dark:text-dark-textMuted dark:hover:text-dark-text"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-tellus-gold-200 bg-white bg-gradient-to-b from-white to-tellus-gold-50 dark:border-dark-border dark:bg-dark-surface dark:from-dark-surface dark:to-dark-surfaceLight">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Mobile Navigation */}
              <button
                onClick={() => handleNavigation('/customers')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/customers')
                    ? 'bg-tellus-primary text-white shadow-md dark:bg-dark-accent'
                    : 'text-tellus-charcoal-600 hover:bg-tellus-gold-50 hover:text-tellus-primary dark:text-dark-textSecondary dark:hover:bg-dark-surfaceLight dark:hover:text-dark-accent'
                }`}
              >
                <Users className="w-5 h-5" />
                <span>Clientes</span>
              </button>

              <button
                onClick={() => handleNavigation('/pre-registrations')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/pre-registrations')
                    ? 'bg-tellus-primary text-white shadow-md dark:bg-dark-accent'
                    : 'text-tellus-charcoal-600 hover:bg-tellus-gold-50 hover:text-tellus-primary dark:text-dark-textSecondary dark:hover:bg-dark-surfaceLight dark:hover:text-dark-accent'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>Pré-Cadastros</span>
              </button>

              {/* Mobile User Info */}
              <div className="border-t border-tellus-gold-200 pt-3 mt-3 dark:border-dark-border">
                <div className="flex items-center space-x-3 px-3 py-2">
                  <User className="w-5 h-5 text-tellus-charcoal-400 dark:text-dark-textMuted" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-tellus-charcoal-900 dark:text-dark-text">{user?.name}</div>
                    <div className="text-xs text-tellus-gold-600 font-medium dark:text-dark-accent">{user?.role}</div>
                  </div>
                </div>
                
                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-tellus-charcoal-600 hover:bg-tellus-gold-50 hover:text-red-600 transition-colors dark:text-dark-textSecondary dark:hover:bg-dark-surfaceLight dark:hover:text-red-400"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sair</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
