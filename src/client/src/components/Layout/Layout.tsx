import React from 'react';
import { Header } from './Header';
import { EnvDebug } from '../Debug/EnvDebug';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <EnvDebug />
        {children}
      </main>
    </div>
  );
}
