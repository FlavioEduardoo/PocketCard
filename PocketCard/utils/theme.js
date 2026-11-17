import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';

export const darkPalette = {
  bg: '#0D1311',          // Preto-esverdeado profundo (#0D1311)
  bgSecondary: '#111A17', // Camada secundária escura sutil
  surface: '#15211D',     // Superfície dos cards
  glass: 'rgba(20, 184, 166, 0.05)',
  glassHover: 'rgba(20, 184, 166, 0.1)',
  glassCard: 'rgba(17, 26, 23, 0.78)',
  border: 'rgba(20, 184, 166, 0.14)',
  borderSubtle: 'rgba(255, 255, 255, 0.06)',
  borderHighlight: 'rgba(20, 184, 166, 0.45)',
  ink: '#FFFFFF',         // Branco puro alto contraste
  muted: '#94A3B8',       // Cinza ardósia limpo
  subtle: '#64748B',
  primary: '#14B8A6',     // Verde-água / Teal futurista (#14B8A6)
  primaryGlow: 'rgba(20, 184, 166, 0.35)',
  secondary: '#2DD4BF',   // Turquesa / Emerald brilhante
  secondaryGlow: 'rgba(45, 212, 191, 0.25)',
  ok: '#10B981',
  warn: '#F59E0B',
  danger: '#EF4444',
  dangerGlow: 'rgba(239, 68, 68, 0.25)',
};

export const lightPalette = {
  bg: '#F2F6F5',
  bgSecondary: '#E5ECE9',
  surface: '#FFFFFF',
  glass: 'rgba(255, 255, 255, 0.85)',
  glassHover: 'rgba(255, 255, 255, 0.95)',
  glassCard: 'rgba(255, 255, 255, 0.9)',
  border: 'rgba(20, 184, 166, 0.15)',
  borderSubtle: 'rgba(0, 0, 0, 0.05)',
  borderHighlight: 'rgba(20, 184, 166, 0.4)',
  ink: '#0D1311',
  muted: '#52605B',
  subtle: '#788883',
  primary: '#0D9488',
  primaryGlow: 'rgba(13, 148, 136, 0.2)',
  secondary: '#14B8A6',
  secondaryGlow: 'rgba(20, 184, 166, 0.2)',
  ok: '#10B981',
  warn: '#D97706',
  danger: '#DC2626',
  dangerGlow: 'rgba(220, 38, 38, 0.2)',
};

// Paleta dos cartões físicos/virtuais
export const cardColors = [
  '#134E4A', // Deep Emerald Teal
  '#0F766E', // Dark Cyan
  '#1E293B', // Midnight Slate
  '#14B8A6', // Bright Teal
  '#334155', // Obsidian Charcoal
  '#065F46', // Forest Green
  '#0F172A', // Jet Black
];

export const colors = darkPalette;

const ThemeContext = createContext({
  themeMode: 'dark',
  isDark: true,
  colors: darkPalette,
  setThemeMode: () => {},
});

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('dark');

  const isDark = themeMode === 'system' ? systemScheme !== 'light' : themeMode === 'dark';
  const activeColors = isDark ? darkPalette : lightPalette;

  return (
    <ThemeContext.Provider value={{ themeMode, isDark, colors: activeColors, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
