import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      colors: {
        // ─── ADSGATOR BRAND ───────────────────────────────────────────────
        ads: {
          50:  '#FFF8E6',
          100: '#FFF0CD',
          200: '#FFE5A6',
          300: '#FFD67F',
          400: '#FFC857',
          500: '#FFA500',
          600: '#E69500',
          700: '#CC8800',
          800: '#B37B00',
          900: '#8C6200',
        },
        // ─── SURFACE (CSS variables — dark/light aware) ───────────────
        surface: {
          base:   'rgb(var(--surface-base) / <alpha-value>)',
          card:   'rgb(var(--surface-card) / <alpha-value>)',
          hover:  'rgb(var(--surface-hover) / <alpha-value>)',
          border: 'rgb(var(--surface-border) / <alpha-value>)',
          // legacy tokens (keep for existing pages)
          bg:     '#0c0c0d',
          input:  '#1e1e21',
        },
        // ─── INK (CSS variables) ──────────────────────────────────────
        ink: {
          primary:   'rgb(var(--ink-primary) / <alpha-value>)',
          secondary: 'rgb(var(--ink-secondary) / <alpha-value>)',
          muted:     'rgb(var(--ink-muted) / <alpha-value>)',
          // legacy
          disabled:  '#3a3a44',
        },
        // ─── BRAND (legacy — existing pages use this) ─────────────────
        brand: {
          DEFAULT: '#10b981',
          dark:    '#059669',
          light:   '#34d399',
          muted:   'rgba(16,185,129,0.12)',
        },
        // ─── STATUS ───────────────────────────────────────────────────
        status: {
          green:  '#10B981',
          orange: '#F59E0B',
          red:    '#EF4444',
          blue:   '#3B82F6',
          purple: '#8b5cf6',
          yellow: '#eab308',
        },
      },

      // ─── TIPOGRAFIA ───────────────────────────────────────────────────
      fontSize: {
        '2xs': ['0.625rem',  { lineHeight: '0.875rem' }],
        xs:    ['0.75rem',   { lineHeight: '1rem'     }],
        sm:    ['0.875rem',  { lineHeight: '1.25rem'  }],
        base:  ['1rem',      { lineHeight: '1.5rem'   }],
        lg:    ['1.125rem',  { lineHeight: '1.75rem'  }],
        xl:    ['1.25rem',   { lineHeight: '1.75rem'  }],
        '2xl': ['1.5rem',    { lineHeight: '2rem'     }],
        '3xl': ['1.875rem',  { lineHeight: '2.25rem'  }],
        '4xl': ['2.25rem',   { lineHeight: '2.5rem'   }],
      },

      // ─── BORDER RADIUS ────────────────────────────────────────────────
      borderRadius: {
        none:    '0',
        sm:      '0.25rem',
        DEFAULT: '0.375rem',
        md:      '0.375rem',
        lg:      '0.5rem',
        xl:      '0.75rem',
        '2xl':   '1rem',
        '3xl':   '1.5rem',
        full:    '9999px',
      },

      // ─── SIDEBAR WIDTH ────────────────────────────────────────────────
      width: {
        sidebar:            '15rem',
        'sidebar-collapsed': '3.5rem',
      },

      // ─── MARGIN / PADDING SHORTHAND FOR SIDEBAR ───────────────────────
      margin: {
        sidebar: '15rem',
      },

      // ─── ANIMAÇÕES ────────────────────────────────────────────────────
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(0.25rem)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          from: { opacity: '0', transform: 'translateX(-0.5rem)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0.4' },
        },
        fadeIn:      { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:     { from: { opacity: '0', transform: 'translateY(0.5rem)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseSubtle: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
      },
      animation: {
        'fade-in':      'fade-in 0.2s ease-out',
        'slide-in-left':'slide-in-left 0.2s ease-out',
        'pulse-slow':   'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        // legacy
        'fade-in-legacy': 'fadeIn 0.2s ease-out',
        'slide-up':       'slideUp 0.25s ease-out',
        'pulse-subtle':   'pulseSubtle 2s cubic-bezier(0.4,0,0.6,1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
