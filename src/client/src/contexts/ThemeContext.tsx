import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

// Contexto padrão que sempre estará disponível
const defaultThemeContext: ThemeContextType = {
  theme: 'light',
  toggleTheme: () => {
    console.warn('ThemeProvider not available, using fallback theme toggle');
    // Aplicar tema diretamente no DOM como fallback
    const root = document.documentElement;
    if (root.classList.contains('dark')) {
      root.classList.remove('dark');
      localStorage.setItem('tellus-theme', 'light');
    } else {
      root.classList.add('dark');
      localStorage.setItem('tellus-theme', 'dark');
    }
  },
  setTheme: (newTheme: Theme) => {
    console.warn('ThemeProvider not available, using fallback theme setter');
    // Aplicar tema diretamente no DOM como fallback
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('tellus-theme', newTheme);
  }
};

const ThemeContext = createContext<ThemeContextType>(defaultThemeContext);

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
  // Agora sempre retorna um contexto válido (padrão ou do provider)
  return context;
}

// Hook alternativo que sempre funciona, mesmo sem ThemeProvider
export function useThemeSafe() {
  const context = useContext(ThemeContext);
  
  // Se o contexto for o padrão, significa que não há ThemeProvider
  if (context === defaultThemeContext) {
    // Tentar carregar tema do localStorage
    try {
      const savedTheme = localStorage.getItem('tellus-theme') as Theme;
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        return {
          ...context,
          theme: savedTheme
        };
      }
    } catch (error) {
      console.warn('Error loading theme from localStorage:', error);
    }
  }
  
  return context;
}

// Componente que garante que sempre há um ThemeProvider disponível
export function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}

// Hook que funciona em qualquer lugar, com ou sem ThemeProvider
export function useThemeAnywhere() {
  try {
    return useThemeSafe();
  } catch (error) {
    console.warn('Theme context error, using fallback:', error);
    return defaultThemeContext;
  }
}
