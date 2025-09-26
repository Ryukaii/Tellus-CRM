import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [isInitialized, setIsInitialized] = useState(false);

  // Carregar tema do localStorage na inicialização
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('tellus-theme') as Theme;
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        setThemeState(savedTheme);
      } else {
        // Detectar preferência do sistema se não houver tema salvo
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setThemeState(prefersDark ? 'dark' : 'light');
      }
    } catch (error) {
      console.error('Error loading theme from localStorage:', error);
      setThemeState('light');
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Aplicar tema no documento
  useEffect(() => {
    if (!isInitialized) return;
    
    try {
      const root = document.documentElement;
      
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      
      // Salvar preferência no localStorage
      localStorage.setItem('tellus-theme', theme);
    } catch (error) {
      console.error('Error applying theme:', error);
    }
  }, [theme, isInitialized]);

  const toggleTheme = () => {
    try {
      setThemeState(prev => prev === 'light' ? 'dark' : 'light');
    } catch (error) {
      console.error('Error toggling theme:', error);
    }
  };

  const setTheme = (newTheme: Theme) => {
    try {
      setThemeState(newTheme);
    } catch (error) {
      console.error('Error setting theme:', error);
    }
  };

  // Não renderizar até estar inicializado
  if (!isInitialized) {
    return (
      <ThemeContext.Provider value={{ theme: 'light', toggleTheme, setTheme }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    console.error('useTheme must be used within a ThemeProvider');
    // Retornar um contexto padrão em vez de lançar erro
    return {
      theme: 'light' as Theme,
      toggleTheme: () => {
        console.warn('ThemeProvider not available, using fallback theme toggle');
      },
      setTheme: () => {
        console.warn('ThemeProvider not available, using fallback theme setter');
      }
    };
  }
  return context;
}
