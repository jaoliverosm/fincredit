import React from 'react';
import useThemeStore from '../store/themeStore';
import Button from './ui/Button';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggle } = useThemeStore();
  return (
    React.createElement(Button, { variant: 'ghost', onClick: toggle, 'aria-label': 'Cambiar tema' },
      theme === 'dark' ? React.createElement(Sun, { size: 16 }) : React.createElement(Moon, { size: 16 })
    )
  );
}
