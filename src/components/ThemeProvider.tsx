import React from 'react';
import { ThemeProvider as NextThemeProvider } from 'next-themes';

// Wrap next-themes to keep props centralized
const ThemeProvider: React.FC<{ children: React.ReactNode } & { attribute?: 'class' | 'data-theme'; defaultTheme?: string }>
  = ({ children, attribute = 'class', defaultTheme = 'light' }) => {
  return (
    <NextThemeProvider attribute={attribute} defaultTheme={defaultTheme} enableSystem>
      {children}
    </NextThemeProvider>
  );
};

export default ThemeProvider;
