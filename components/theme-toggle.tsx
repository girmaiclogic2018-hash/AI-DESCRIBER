'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

export type ThemeMode = 'light' | 'dark' | 'system';

function applyTheme(mode: ThemeMode) {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (mode === 'dark' || (mode === 'system' && systemPrefersDark)) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  const saved = localStorage.getItem('theme-preference') as ThemeMode | null;
  if (saved === 'light' || saved === 'dark' || saved === 'system') {
    return saved;
  }
  return 'system';
}

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      applyTheme('system');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    localStorage.setItem('theme-preference', newTheme);
    applyTheme(newTheme);
  };

  if (!isClient) {
    return (
      <div className="w-[88px] h-7 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
    );
  }

  return (
    <div 
      role="group" 
      aria-label="Theme Mode Selection" 
      className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700/80"
    >
      <button
        type="button"
        onClick={() => handleThemeChange('light')}
        title="Light theme"
        className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
          theme === 'light'
            ? 'bg-white dark:bg-slate-700 text-amber-600 shadow-xs'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
      >
        <Sun className="w-3.5 h-3.5" />
        <span className="sr-only">Light</span>
      </button>

      <button
        type="button"
        onClick={() => handleThemeChange('dark')}
        title="Dark theme"
        className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
          theme === 'dark'
            ? 'bg-white dark:bg-slate-700 text-indigo-400 shadow-xs'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
      >
        <Moon className="w-3.5 h-3.5" />
        <span className="sr-only">Dark</span>
      </button>

      <button
        type="button"
        onClick={() => handleThemeChange('system')}
        title="System default theme"
        className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
          theme === 'system'
            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
      >
        <Monitor className="w-3.5 h-3.5" />
        <span className="sr-only">System default</span>
      </button>
    </div>
  );
}
