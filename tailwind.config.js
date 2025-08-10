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
        // Unified Light Theme Color Palette
        surface: {
          DEFAULT: '#ffffff',     // Pure white for main surfaces
          subtle: '#f8fafc',      // Very light gray for subtle backgrounds
          border: '#e2e8f0',      // Light gray for borders
        },
        text: {
          DEFAULT: '#111827',     // Dark gray for primary text
          soft: '#374151',        // Medium gray for secondary text
          muted: '#6b7280',       // Light gray for muted text
        },
        // Keep existing primary for compatibility and accent
        primary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#6366f1', // Main accent color
          600: '#5b21b6',
          700: '#4c1d95',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
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
          green: '#10b981', // Keep for status indicators
          orange: '#f59e0b', // Keep for highlights
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
        // Standard card shadow for unified design
        'card': '0 4px 12px rgba(0, 0, 0, 0.06)',
        // Enhanced hover shadow
        'lg': '0 10px 25px rgba(0, 0, 0, 0.1)',
        // Remove glow, neon, and glass shadows
      },
    },
  },
  plugins: [],
};