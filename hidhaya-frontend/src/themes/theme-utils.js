import { THEMES } from './themes';

export function getAvailableThemes(user) {
  if (user?.plan === 'premium') {
    return THEMES;
  }

  if (user) {
    return THEMES.filter(
      (theme) =>
        theme.tier === 'free' ||
        theme.tier === 'logged_in'
    );
  }

  return THEMES.filter(
    (theme) => theme.tier === 'free'
  );
}

export function applyTheme(themeId) {
  if (typeof window === 'undefined') return;

  localStorage.setItem('hidhaya_theme', themeId);

  const root = document.documentElement;

  root.classList.remove(
    'dark',
    'theme-ocean',
    'theme-royal',
    'theme-rose'
  );

  if (themeId === 'dark') {
    root.classList.add('dark');
  } else if (themeId !== 'light') {
    root.classList.add('dark');
    root.classList.add(`theme-${themeId}`);
  }
}

export function getSavedTheme() {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return localStorage.getItem('hidhaya_theme') || 'light';
}