import React from 'react';
import { Users, Activity, LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Header() {
  const { user, logout } = useAuth();
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-tellus-primary rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-tellus-dark">Tellus</h1>
                <p className="text-xs text-gray-500">CRM</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <nav className="flex items-center space-x-6">
              <a
                href="#"
                className="flex items-center space-x-2 text-tellus-primary font-medium"
              >
                <Users className="w-4 h-4" />
                <span>Clientes</span>
              </a>
            </nav>

            {/* User Info */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-700">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">{user?.name}</span>
                <span className="text-xs bg-tellus-primary text-white px-2 py-1 rounded-full">
                  {user?.role}
                </span>
              </div>
              
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-500 hover:text-red-600 transition-colors"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
