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
        brand: {
          DEFAULT: '#10b981',
          dark:    '#059669',
          light:   '#34d399',
          muted:   'rgba(16,185,129,0.12)',
        },
        surface: {
          bg:     '#0c0c0d',
          card:   '#141415',
          hover:  '#1a1a1c',
          border: '#242427',
          input:  '#1e1e21',
        },
        ink: {
          primary:   '#f0f0f1',
          secondary: '#8b8b96',
          muted:     '#52525e',
          disabled:  '#3a3a44',
        },
        status: {
          orange: '#f97316',
          red:    '#ef4444',
          blue:   '#3b82f6',
          purple: '#8b5cf6',
          yellow: '#eab308',
        },
      },
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
      borderRadius: {
        none:    '0',
        sm:      '0.1875rem',
        DEFAULT: '0.375rem',
        md:      '0.5rem',
        lg:      '0.75rem',
        xl:      '1rem',
        full:    '9999rem',
      },
      animation: {
        'fade-in':      'fadeIn 0.2s ease-out',
        'slide-up':     'slideUp 0.25s ease-out',
        'pulse-subtle': 'pulseSubtle 2s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn:      { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:     { from: { opacity: '0', transform: 'translateY(0.5rem)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseSubtle: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
      },
    },
  },
  plugins: [],
};

export default config;
