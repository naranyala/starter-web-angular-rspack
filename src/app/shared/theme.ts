export const THEME = {
  colors: {
    primary: '#7c83fd',
    primaryDark: '#5b5ff7',
    primaryLight: '#9ea5ff',
    accent: '#22d3ee',
    accentDark: '#06b6d4',
    accentLight: '#67e8f9',
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
    info: '#60a5fa',
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },

  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },

  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.4)',
    md: '0 4px 8px -2px rgba(0, 0, 0, 0.5)',
    lg: '0 12px 24px -4px rgba(0, 0, 0, 0.6)',
    xl: '0 20px 40px -8px rgba(0, 0, 0, 0.7)',
    glowPrimary: '0 0 20px rgba(124, 131, 253, 0.4)',
    glowAccent: '0 0 20px rgba(34, 211, 238, 0.3)',
  },
} as const;

export type ThemeMode = 'light' | 'dark';

export function getThemeMode(): ThemeMode {
  const stored = localStorage.getItem('theme-mode') as ThemeMode | null;
  if (stored) return stored;

  // Default to dark theme
  return 'dark';
}

export function setThemeMode(mode: ThemeMode): void {
  // Always set the attribute, default to dark
  document.documentElement.setAttribute('data-theme', mode);
  document.documentElement.setAttribute('data-color-scheme', mode);
  localStorage.setItem('theme-mode', mode);
}

export function toggleTheme(): ThemeMode {
  const current = getThemeMode();
  const next: ThemeMode = current === 'light' ? 'dark' : 'light';
  setThemeMode(next);
  return next;
}

export function getCssVariable(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function initTheme(): void {
  setThemeMode(getThemeMode());
}
