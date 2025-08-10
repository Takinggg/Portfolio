/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // WCAG 2.1 AA Compliant Color Palette with Liquid Glass enhancements
        text: {
          strong: '#0F172A',      // High contrast for headings (21:1 ratio)
          DEFAULT: '#1E293B',     // Standard text (16.7:1 ratio)
          soft: '#334155',        // Secondary text (9.8:1 ratio)
          muted: '#64748B',       // Muted text (4.6:1 ratio - minimum for normal text)
          glass: '#FFFFFF',       // White text for glass overlays
        },
        surface: {
          base: '#FFFFFF',        // Pure white for main surfaces
          alt: '#F1F5F9',         // Very light gray for subtle backgrounds  
          muted: '#E2E8F0',       // Light gray for separators
          glass: 'rgba(255, 255, 255, 0.25)',     // Glass surface
          'glass-dark': 'rgba(255, 255, 255, 0.10)', // Darker glass
        },
        border: {
          DEFAULT: '#E2E8F0',     // Standard border color
          strong: '#CBD5E1',      // Stronger borders when needed
          glass: 'rgba(255, 255, 255, 0.2)',      // Glass borders
          iridescent: 'rgba(139, 92, 246, 0.3)',  // Iridescent borders
        },
        // Liquid Glass color palette
        liquid: {
          blue: '#667eea',
          purple: '#764ba2',
          pink: '#f093fb',
          cyan: '#4facfe',
          violet: '#8b5cf6',
          indigo: '#6366f1',
        },
        // Updated primary palette for better accessibility
        primary: {
          50: '#EEF2FF',          // Very light for badge backgrounds
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',         // Main interactive color (4.5:1 on white)
          600: '#4F46E5',         // Stronger for hovers/accents (5.9:1 on white)
          700: '#4338CA',         // Dark variant
          800: '#3730A3',
          900: '#312E81',
          950: '#1E1B4B',
        },
        // Keep secondary for compatibility  
        secondary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        accent: {
          green: '#10b981',       // Keep for status indicators
          orange: '#f59e0b',      // Keep for highlights
        },
      },
      animation: {
        // Liquid Glass animations
        'fade-in': 'fadeIn 0.8s ease-in-out',
        'slide-up': 'slideUp 0.8s ease-out',
        'slide-down': 'slideDown 0.8s ease-out', 
        'slide-left': 'slideLeft 0.8s ease-out',
        'slide-right': 'slideRight 0.8s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'liquid-morph': 'liquidMorph 8s ease-in-out infinite',
        'glass-shine': 'glassShine 3s ease-in-out infinite',
        'ripple': 'ripple 0.6s ease-out',
        'magnetic': 'magnetic 0.3s ease-out',
        'gradient-flow': 'gradientFlow 6s ease-in-out infinite',
        'typing': 'typing 3.5s steps(30, end), blink-caret 0.75s step-end infinite',
        'iridescent': 'iridescent 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(100px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-100px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        liquidMorph: {
          '0%, 100%': { 
            borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
            transform: 'rotate(0deg) scale(1)'
          },
          '50%': { 
            borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%',
            transform: 'rotate(180deg) scale(1.05)'
          },
        },
        glassShine: {
          '0%, 100%': { 
            backgroundPosition: '-200% 0',
            opacity: '0.3'
          },
          '50%': { 
            backgroundPosition: '200% 0',
            opacity: '0.8'
          },
        },
        ripple: {
          '0%': {
            transform: 'scale(0)',
            opacity: '1',
          },
          '100%': {
            transform: 'scale(4)',
            opacity: '0',
          },
        },
        magnetic: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '100%': { transform: 'translate(var(--magnetic-x, 0px), var(--magnetic-y, 0px)) scale(1.05)' },
        },
        gradientFlow: {
          '0%, 100%': {
            backgroundPosition: '0% 50%',
          },
          '50%': {
            backgroundPosition: '100% 50%',
          },
        },
        typing: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        'blink-caret': {
          '0%, 50%': { borderColor: 'transparent' },
          '51%, 100%': { borderColor: 'currentColor' },
        },
        iridescent: {
          '0%, 100%': {
            backgroundPosition: '0% 50%',
            filter: 'hue-rotate(0deg)',
          },
          '25%': {
            backgroundPosition: '50% 0%',
            filter: 'hue-rotate(90deg)',
          },
          '50%': {
            backgroundPosition: '100% 50%',
            filter: 'hue-rotate(180deg)',
          },
          '75%': {
            backgroundPosition: '50% 100%',
            filter: 'hue-rotate(270deg)',
          },
        },
      },
      backdropBlur: {
        xs: '2px',
        'glass': '12px',
        'glass-lg': '20px',
        'glass-xl': '40px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'liquid-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #667eea 100%)',
        'glass-shine': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
        'iridescent': 'linear-gradient(45deg, #667eea, #764ba2, #f093fb, #4facfe, #00f2fe, #4facfe, #f093fb, #764ba2, #667eea)',
      },
      backgroundSize: {
        '200': '200% 200%',
        '400': '400% 400%',
      },
      boxShadow: {
        // WCAG-friendly shadows with proper contrast
        'card': '0 2px 4px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',
        'lg': '0 4px 12px rgba(15, 23, 42, 0.08), 0 2px 4px rgba(15, 23, 42, 0.04)',
        'xl': '0 8px 25px rgba(15, 23, 42, 0.1), 0 4px 8px rgba(15, 23, 42, 0.06)',
        // Liquid Glass shadows
        'glass': '0 8px 32px rgba(103, 126, 234, 0.15), 0 3px 12px rgba(103, 126, 234, 0.1)',
        'glass-lg': '0 25px 50px rgba(103, 126, 234, 0.25), 0 12px 24px rgba(103, 126, 234, 0.15)',
        'liquid': '0 8px 32px rgba(103, 126, 234, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
        'magnetic': '0 20px 40px rgba(103, 126, 234, 0.4), 0 8px 16px rgba(103, 126, 234, 0.2)',
      },
      scale: {
        '102': '1.02',
        '103': '1.03',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
      },
      // Custom utilities for liquid glass
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [],
};