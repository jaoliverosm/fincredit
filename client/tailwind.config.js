/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{jsx,js,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        popover: 'var(--popover)',
        'popover-foreground': 'var(--popover-foreground)',
        primary: {
          DEFAULT: '#00236f',
          foreground: '#ffffff',
          container: '#1e3a8a',
          fixed: '#dce1ff',
          'fixed-dim': '#b6c4ff',
          'fixed-variant': '#264191'
        },
        secondary: {
          DEFAULT: '#006c49',
          foreground: '#ffffff',
          container: '#6cf8bb',
          fixed: '#6ffbbe',
          'fixed-dim': '#4edea3',
          'fixed-variant': '#005236'
        },
        destructive: { DEFAULT: '#ba1a1a' },
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
          'on-container': '#93000a'
        },
        muted: {
          DEFAULT: '#f4f5f7',
          foreground: '#64748b'
        },
        accent: {
          DEFAULT: '#10b981',
          foreground: '#ffffff'
        },
        tertiary: {
          DEFAULT: '#4b1c00',
          container: '#6e2c00',
          fixed: '#ffdbcb',
          'fixed-dim': '#ffb691',
          'fixed-variant': '#773205'
        },
        surface: {
          DEFAULT: '#faf8ff',
          bright: '#faf8ff',
          dim: '#dad9e1',
          'container-lowest': '#ffffff',
          'container-low': '#f4f3fa',
          container: '#eeedf4',
          'container-high': '#e9e7ef',
          'container-highest': '#e3e1e9',
          variant: '#e3e1e9',
          tint: '#4059aa'
        },
        'on-surface': {
          DEFAULT: '#1a1b21',
          variant: '#444651'
        },
        'on-primary': '#ffffff',
        'on-secondary': '#ffffff',
        'on-error': '#ffffff',
        'on-tertiary': '#ffffff',
        'on-primary-container': '#90a8ff',
        'on-secondary-container': '#00714d',
        'on-tertiary-container': '#f39461',
        'on-primary-fixed': '#00164e',
        'on-primary-fixed-variant': '#264191',
        'on-secondary-fixed': '#002113',
        'on-secondary-fixed-variant': '#005236',
        'on-tertiary-fixed': '#341100',
        'on-tertiary-fixed-variant': '#773205',
        'inverse-surface': '#2f3036',
        'inverse-on-surface': '#f1f0f7',
        'inverse-primary': '#b6c4ff',
        outline: '#757682',
        'outline-variant': '#c5c5d3',
        blue: {
          50:'#eff6ff',100:'#dbeafe',200:'#bfdbfe',300:'#93c5fd',400:'#60a5fa',500:'#3b82f6',600:'#2563eb',700:'#1d4ed8',800:'#1e40af',900:'#1e3a8a'
        },
        success: { 500: '#10b981' },
        danger:  { 500: '#ef4444' },
        warning: { 500: '#f59e0b' }
      }
    }
  },
  plugins: []
};
