import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { usePageInfo } from '../../hooks/usePageInfo';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { title, breadcrumb } = usePageInfo();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-background flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-dark-textMuted dark:hover:text-dark-text transition-colors lg:hidden"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              {/* Breadcrumb and page info */}
              <div className="flex-1 flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-dark-textMuted">
                  {breadcrumb.map((item, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span className={index === breadcrumb.length - 1 ? 'text-gray-900 dark:text-dark-text font-medium' : ''}>
                        {item}
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
              
              {/* Right side actions */}
              <div className="flex items-center space-x-4">
                {/* Theme Toggle Button */}
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
                  title="Alternar tema"
                >
                  🌙 Tema
                </button>
                
                <div className="hidden sm:block">
                  <span className="text-sm text-gray-500 dark:text-dark-textMuted">
                    {new Date().toLocaleDateString('pt-BR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-dark-background">
          {children}
        </main>
      </div>
    </div>
  );
}
