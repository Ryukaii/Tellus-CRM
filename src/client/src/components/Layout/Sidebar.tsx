import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Users, Activity, LogOut, User, FileText, X, Home } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 dark:bg-black dark:bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-dark-surface shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-tellus-gold-200 dark:border-dark-border bg-gradient-to-r from-tellus-gold-50 to-white dark:from-dark-surfaceLight dark:to-dark-surface">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-tellus-primary to-tellus-gold-600 rounded-lg flex items-center justify-center shadow-md">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-tellus-charcoal-900 dark:text-dark-text">Tellures</h1>
                <p className="text-xs text-tellus-gold-600 dark:text-dark-accent font-medium">CRM</p>
              </div>
            </div>
            
            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="p-2 text-tellus-charcoal-500 hover:text-tellus-charcoal-700 dark:text-dark-textMuted dark:hover:text-dark-text transition-colors lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <button
              onClick={() => handleNavigation('/')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm ${
                isActive('/')
                  ? 'bg-gradient-to-r from-tellus-primary to-tellus-gold-600 text-white shadow-md'
                  : 'text-tellus-charcoal-600 dark:text-dark-textSecondary hover:bg-tellus-gold-50 dark:hover:bg-dark-surfaceLight hover:text-tellus-primary dark:hover:text-dark-accent'
              }`}
            >
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => handleNavigation('/customers')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm ${
                isActive('/customers')
                  ? 'bg-gradient-to-r from-tellus-primary to-tellus-gold-600 text-white shadow-md'
                  : 'text-tellus-charcoal-600 dark:text-dark-textSecondary hover:bg-tellus-gold-50 dark:hover:bg-dark-surfaceLight hover:text-tellus-primary dark:hover:text-dark-accent'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Clientes</span>
            </button>

            <button
              onClick={() => handleNavigation('/pre-registrations')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm ${
                isActive('/pre-registrations')
                  ? 'bg-gradient-to-r from-tellus-primary to-tellus-gold-600 text-white shadow-md'
                  : 'text-tellus-charcoal-600 dark:text-dark-textSecondary hover:bg-tellus-gold-50 dark:hover:bg-dark-surfaceLight hover:text-tellus-primary dark:hover:text-dark-accent'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>Pré-Cadastros</span>
            </button>
          </nav>

          {/* User Info */}
          <div className="border-t border-tellus-gold-200 dark:border-dark-border p-4 bg-gradient-to-r from-tellus-gold-50 to-white dark:from-dark-surfaceLight dark:to-dark-surface">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-tellus-charcoal-200 to-tellus-charcoal-300 dark:from-dark-surfaceLighter dark:to-dark-border rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-tellus-charcoal-600 dark:text-dark-text" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-tellus-charcoal-900 dark:text-dark-text truncate">
                  {user?.name}
                </div>
                <div className="text-xs text-tellus-gold-600 dark:text-dark-accent font-medium truncate">
                  {user?.role}
                </div>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-tellus-charcoal-600 dark:text-dark-textSecondary hover:bg-tellus-gold-100 dark:hover:bg-dark-surfaceLighter hover:text-red-600 dark:hover:text-red-400 transition-colors shadow-sm"
            >
              <LogOut className="w-5 h-5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
