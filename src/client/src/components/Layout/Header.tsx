import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Users, Activity, LogOut, User, UserPlus, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
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
          
          {/* Navigation and User Info */}
          <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6">
            {/* Navigation - Hidden on mobile */}
            <nav className="hidden sm:flex items-center space-x-4 lg:space-x-6">
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
            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
              {/* User name and role - Responsive */}
              <div className="flex items-center space-x-1 sm:space-x-2 text-gray-700">
                <User className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium truncate max-w-20 sm:max-w-32">
                  {user?.name}
                </span>
                <span className="text-xs bg-tellus-primary text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full hidden sm:inline">
                  {user?.role}
                </span>
              </div>
              
              {/* Logout button */}
              <button
                onClick={logout}
                className="flex items-center space-x-1 sm:space-x-2 text-gray-500 hover:text-red-600 transition-colors p-1 sm:p-0"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-xs sm:text-sm hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
