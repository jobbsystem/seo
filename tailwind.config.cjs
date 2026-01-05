module.exports = {
  content: ['./index.html', './**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Cinzel', 'serif']
      },
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        text: 'rgb(var(--text) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        success: 'rgb(var(--success) / <alpha-value>)',
        warning: 'rgb(var(--warning) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
        borderSubtle: 'rgb(var(--border) / var(--border-subtle-alpha))',
        brand: {
          DEFAULT: '#5570F1',
          dark: '#3248a8',
          light: '#eef2ff',
          bg: '#E4E9FD'
        }
      },
      borderRadius: {
        xl: '28px',
        lg: '22px',
        md: '16px'
      },
      boxShadow: {
        glassLg: '0 20px 40px rgba(0,0,0,0.05)',
        glassMd: '0 10px 24px rgba(0,0,0,0.05)',
        glassSm: '0 6px 14px rgba(0,0,0,0.04)',
        appleCard: '0 8px 30px rgba(0,0,0,0.35)',
        appleFloat: '0 14px 50px rgba(0,0,0,0.45)',
        bento: '0px 4px 20px rgba(0, 0, 0, 0.03)',
        'bento-hover': '0px 10px 30px rgba(85, 112, 241, 0.15)',
        float: '0px 20px 40px rgba(0, 0, 0, 0.04)'
      },
      backdropBlur: {
        glass: '18px'
      },
      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-soft': 'pulseSoft 2.4s ease-in-out infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.55', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.08)' }
        }
      }
    }
  },
  plugins: []
};
