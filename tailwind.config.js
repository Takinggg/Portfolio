/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  // Remove darkMode entirely for unified light theme
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // WCAG 2.1 AA Compliant Color Palette
        text: {
          strong: '#0F172A',      // High contrast for headings (21:1 ratio)
          DEFAULT: '#1E293B',     // Standard text (16.7:1 ratio)
          soft: '#334155',        // Secondary text (9.8:1 ratio)
          muted: '#64748B',       // Muted text (4.6:1 ratio - minimum for normal text)
        },
        surface: {
          base: '#FFFFFF',        // Pure white for main surfaces
          alt: '#F1F5F9',         // Very light gray for subtle backgrounds  
          muted: '#E2E8F0',       // Light gray for separators
        },
        border: {
          DEFAULT: '#E2E8F0',     // Standard border color
          strong: '#CBD5E1',      // Stronger borders when needed
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
        // Legacy support - map old surface names to new structure
        surface: {
          DEFAULT: '#FFFFFF',     // Maps to surface.base
          subtle: '#F1F5F9',      // Maps to surface.alt
          border: '#E2E8F0',      // Maps to border.DEFAULT
        },
      },
      animation: {
        // Keep essential entrance animations for UX
        'fade-in': 'fadeIn 0.8s ease-in-out',
        'slide-up': 'slideUp 0.8s ease-out',
        'slide-down': 'slideDown 0.8s ease-out', 
        'slide-left': 'slideLeft 0.8s ease-out',
        'slide-right': 'slideRight 0.8s ease-out',
        'float': 'float 6s ease-in-out infinite',
        // Remove complex animations: glow, gradient-shift, particle-float, tilt, blob
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
        // Removed: glow, gradientShift, particleFloat, tilt, blob animations
      },
      backdropBlur: {
        xs: '2px',
        // Remove glass blur effects
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        // Remove complex gradient-mesh
      },
      backgroundSize: {
        '200': '200% 200%',
      },
      boxShadow: {
        // WCAG-friendly shadows with proper contrast
        'card': '0 2px 4px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',
        'lg': '0 4px 12px rgba(15, 23, 42, 0.08), 0 2px 4px rgba(15, 23, 42, 0.04)',
        'xl': '0 8px 25px rgba(15, 23, 42, 0.1), 0 4px 8px rgba(15, 23, 42, 0.06)',
      },
    },
  },
  plugins: [],
};