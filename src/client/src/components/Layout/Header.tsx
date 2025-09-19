import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Users, Activity, LogOut, User, UserPlus, FileText, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

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
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 bg-tellus-primary rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-tellus-dark">Tellures</h1>
                <p className="text-xs text-gray-500 hidden sm:block">CRM</p>
              </div>
            </div>
          </div>
          
          {/* Desktop Navigation and User Info */}
          <div className="hidden sm:flex items-center space-x-4 lg:space-x-6">
            {/* Navigation */}
            <nav className="flex items-center space-x-4 lg:space-x-6">
              <button
                onClick={() => handleNavigation('/dashboard/customers')}
                className={`flex items-center space-x-2 font-medium transition-colors ${
                  isActive('/dashboard/customers')
                    ? 'text-tellus-primary'
                    : 'text-gray-600 hover:text-tellus-primary'
                }`}
              >
                <Users className="w-4 h-4" />
                <span className="hidden lg:inline">Clientes</span>
              </button>

              <button
                onClick={() => handleNavigation('/dashboard/pre-registrations')}
                className={`flex items-center space-x-2 font-medium transition-colors ${
                  isActive('/dashboard/pre-registrations')
                    ? 'text-tellus-primary'
                    : 'text-gray-600 hover:text-tellus-primary'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span className="hidden lg:inline">Pré-Cadastros</span>
              </button>
            </nav>

            {/* User Info */}
            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className="flex items-center space-x-2 text-gray-700">
                <User className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium truncate max-w-32">
                  {user?.name}
                </span>
                <span className="text-xs bg-tellus-primary text-white px-2 py-1 rounded-full hidden lg:inline">
                  {user?.role}
                </span>
              </div>
              
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-500 hover:text-red-600 transition-colors"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm hidden lg:inline">Sair</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center space-x-2">
            <div className="flex items-center space-x-2 text-gray-700">
              <User className="w-4 h-4" />
              <span className="text-sm font-medium truncate max-w-20">
                {user?.name}
              </span>
            </div>
            
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
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
          <div className="sm:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Mobile Navigation */}
              <button
                onClick={() => handleNavigation('/dashboard/customers')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/dashboard/customers')
                    ? 'bg-tellus-primary text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-tellus-primary'
                }`}
              >
                <Users className="w-5 h-5" />
                <span>Clientes</span>
              </button>

              <button
                onClick={() => handleNavigation('/dashboard/pre-registrations')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/dashboard/pre-registrations')
                    ? 'bg-tellus-primary text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-tellus-primary'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>Pré-Cadastros</span>
              </button>

              {/* Mobile User Info */}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex items-center space-x-3 px-3 py-2">
                  <User className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                    <div className="text-xs text-gray-500">{user?.role}</div>
                  </div>
                </div>
                
                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-colors"
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
