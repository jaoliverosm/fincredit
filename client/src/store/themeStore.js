import { create } from 'zustand';

function applyTheme(theme) {
  if (typeof document === 'undefined') return;
  if (theme === 'dark') document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
}

function saveTheme(theme) {
  try { localStorage.setItem('theme', theme); } catch (e) { console.warn('localStorage error', e); }
}

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('theme');
  const theme = stored || 'light';
  applyTheme(theme);
  return theme;
}

const useThemeStore = create((set) => ({
  theme: getInitialTheme(),
  setTheme: (t) => {
    set({ theme: t });
    saveTheme(t);
    applyTheme(t);
  },
  toggle: () => set((state) => {
    const next = state.theme === 'dark' ? 'light' : 'dark';
    saveTheme(next);
    applyTheme(next);
    return { theme: next };
  })
}));

export default useThemeStore;
