import { createContext, useContext, useState } from 'react';

export const THEMES = [
  {
    name: 'Forest Green',
    primary: '#1B5E20',
    secondary: '#2E7D32',
    light: '#F1F8E9',
    accent: '#A5D6A7',
    card: '#fff',
    text: '#1a1a1a',
    subtext: '#888',
  },
  {
    name: 'Ocean Blue',
    primary: '#0D47A1',
    secondary: '#1565C0',
    light: '#E3F2FD',
    accent: '#90CAF9',
    card: '#fff',
    text: '#1a1a1a',
    subtext: '#888',
  },
  {
    name: 'Sunset Orange',
    primary: '#E65100',
    secondary: '#F57200',
    light: '#FFF3E0',
    accent: '#FFCC80',
    card: '#fff',
    text: '#1a1a1a',
    subtext: '#888',
  },
  {
    name: 'Purple Health',
    primary: '#4A148C',
    secondary: '#6A1B9A',
    light: '#F3E5F5',
    accent: '#CE93D8',
    card: '#fff',
    text: '#1a1a1a',
    subtext: '#888',
  },
  {
    name: 'Ruby Red',
    primary: '#B71C1C',
    secondary: '#C62828',
    light: '#FFEBEE',
    accent: '#EF9A9A',
    card: '#fff',
    text: '#1a1a1a',
    subtext: '#888',
  },
];

export const ThemeContext = createContext(THEMES[0]);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(THEMES[0]);
  return (
    <ThemeContext.Provider value={{ theme, setTheme, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) return { theme: THEMES[0], setTheme: () => {}, THEMES };
  return context;
}