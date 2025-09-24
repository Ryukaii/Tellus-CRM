/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/client/index.html",
    "./src/client/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        tellus: {
          // Cores douradas baseadas na paleta da imagem
          primary: '#9e8123',     // Dourado principal
          secondary: '#563a17',   // Marrom rico
          accent: '#2f2921',      // Marrom escuro
          dark: '#19171b',        // Charcoal escuro
          light: '#f8fafc',       // Branco suave
          gold: {
            50: '#fdf9e7',
            100: '#faf2c7',
            200: '#f5e395',
            300: '#efd260',
            400: '#e9c23b',
            500: '#9e8123',       // Cor principal dourada
            600: '#8a6f1f',
            700: '#755e1a',
            800: '#614d15',
            900: '#4d3c10'
          },
          charcoal: {
            50: '#f5f5f5',
            100: '#e7e7e7',
            200: '#d1d1d1',
            300: '#b0b0b0',
            400: '#888888',
            500: '#6d6d6d',
            600: '#5d5d5d',
            700: '#4f4f4f',
            800: '#454545',
            900: '#19171b'        // Charcoal escuro da paleta
          },
          bronze: {
            50: '#faf8f5',
            100: '#f2ede6',
            200: '#e4d9c7',
            300: '#d4c2a3',
            400: '#c5a77f',
            500: '#563a17',       // Marrom rico da paleta
            600: '#4d3314',
            700: '#442c11',
            800: '#3b250e',
            900: '#321e0b'
          }
        },
        // Cores escuras baseadas na paleta dourada
        dark: {
          background: '#0a0a0a',    // Preto mais profundo
          surface: '#1a1a1a',       // Superfície principal mais suave
          surfaceLight: '#2a2a2a',  // Superfície clara mais harmoniosa
          surfaceLighter: '#3a3a3a', // Superfície mais clara
          card: '#1e1e1e',          // Cor específica para cards
          cardHover: '#252525',     // Hover dos cards
          text: '#f5f5f5',          // Texto principal mais suave
          textSecondary: '#d1d5db', // Texto secundário
          textMuted: '#9ca3af',     // Texto desbotado
          border: '#374151',        // Bordas mais suaves
          borderLight: '#4b5563',   // Bordas mais claras
          accent: '#9e8123',        // Dourado para acentos
          accentLight: '#b8941f',   // Dourado mais claro
          accentDark: '#755e1a',    // Dourado mais escuro
          input: '#1f2937',         // Background de inputs
          inputBorder: '#4b5563'    // Bordas de inputs
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
