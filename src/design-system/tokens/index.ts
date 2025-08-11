/**
 * Design Tokens
 * Centralized design system tokens for consistent styling
 */

// Color Palette
export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6', // Main brand color
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
    950: '#2e1065'
  },

  // Secondary Colors
  secondary: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
    950: '#500724'
  },

  // Accent Colors
  accent: {
    blue: {
      50: '#eff6ff',
      500: '#3b82f6',
      600: '#2563eb'
    },
    green: {
      50: '#f0fdf4',
      500: '#22c55e',
      600: '#16a34a'
    },
    yellow: {
      50: '#fefce8',
      500: '#eab308',
      600: '#ca8a04'
    },
    red: {
      50: '#fef2f2',
      500: '#ef4444',
      600: '#dc2626'
    }
  },

  // Neutral Colors
  neutral: {
    white: '#ffffff',
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    black: '#000000'
  },

  // Semantic Colors
  semantic: {
    success: '#22c55e',
    warning: '#eab308',
    error: '#ef4444',
    info: '#3b82f6'
  }
} as const;

// Typography Scale
export const typography = {
  fontFamily: {
    sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    mono: ['Fira Code', 'Monaco', 'Consolas', 'monospace']
  },

  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
    '7xl': '4.5rem',   // 72px
    '8xl': '6rem',     // 96px
    '9xl': '8rem'      // 128px
  },

  fontWeight: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900
  },

  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2
  },

  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em'
  }
} as const;

// Spacing Scale (based on 8px grid)
export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
  36: '9rem',       // 144px
  40: '10rem',      // 160px
  44: '11rem',      // 176px
  48: '12rem',      // 192px
  52: '13rem',      // 208px
  56: '14rem',      // 224px
  60: '15rem',      // 240px
  64: '16rem',      // 256px
  72: '18rem',      // 288px
  80: '20rem',      // 320px
  96: '24rem'       // 384px
} as const;

// Border Radius
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px'
} as const;

// Shadows
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  
  // Custom shadows
  glow: '0 0 20px rgb(139 92 246 / 0.3)',
  glowLg: '0 0 40px rgb(139 92 246 / 0.4)',
  colored: {
    purple: '0 10px 25px -5px rgb(139 92 246 / 0.3)',
    pink: '0 10px 25px -5px rgb(236 72 153 / 0.3)',
    blue: '0 10px 25px -5px rgb(59 130 246 / 0.3)'
  }
} as const;

// Transitions and Animations
export const transitions = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '1000ms'
  },
  
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  }
} as const;

// Breakpoints for responsive design
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const;

// Z-index scale
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800
} as const;

// Layout utilities
export const layout = {
  maxWidth: {
    xs: '20rem',      // 320px
    sm: '24rem',      // 384px
    md: '28rem',      // 448px
    lg: '32rem',      // 512px
    xl: '36rem',      // 576px
    '2xl': '42rem',   // 672px
    '3xl': '48rem',   // 768px
    '4xl': '56rem',   // 896px
    '5xl': '64rem',   // 1024px
    '6xl': '72rem',   // 1152px
    '7xl': '80rem',   // 1280px
    full: '100%',
    min: 'min-content',
    max: 'max-content'
  },

  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  }
} as const;

// Dark Mode Surface Elevation System (Class-Level Implementation)
export const surfaceTokens = {
  // Base surfaces
  base: 'bg-gray-950', // Deep space sections, page backgrounds
  subtle: 'bg-gray-900/70 border-gray-800', // Secondary panels, low emphasis
  card: 'bg-gray-900 border-gray-700', // Primary cards
  elevated: 'bg-gray-800/70 backdrop-blur border-gray-700 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)]', // Glass surfaces
  
  // Interactive surfaces
  accentChip: 'bg-gray-800/60 border-gray-700', // Neutral chip state
  inset: 'bg-gray-900/60 border-gray-700 focus:ring-indigo-500/40', // Form inputs
  
  // Light mode equivalents
  light: {
    base: 'bg-white',
    subtle: 'bg-gray-50/70 border-gray-200',
    card: 'bg-white border-gray-200',
    elevated: 'bg-white/70 backdrop-blur border-gray-200 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.1)]',
    accentChip: 'bg-gray-100/60 border-gray-300',
    inset: 'bg-gray-50/60 border-gray-300 focus:ring-indigo-500/40'
  }
} as const;

// WCAG AA Compliant Text Scale (Dark Mode)
export const textTokens = {
  // High contrast text (21:1+ ratio)
  high: 'text-gray-100',
  
  // Body default (16.7:1+ ratio) 
  body: 'text-gray-200',
  
  // Secondary text (9.8:1+ ratio)
  secondary: 'text-gray-400', // minimum 14px only
  
  // Interactive text states
  interactive: {
    default: 'text-gray-200 hover:text-gray-100',
    active: 'text-gray-100',
    disabled: 'text-gray-500'
  },
  
  // Light mode equivalents  
  light: {
    high: 'text-gray-900',
    body: 'text-gray-800', 
    secondary: 'text-gray-600',
    interactive: {
      default: 'text-gray-800 hover:text-gray-900',
      active: 'text-gray-900',
      disabled: 'text-gray-400'
    }
  }
} as const;

// Interactive State Tokens for Components
export const interactiveTokens = {
  // Chip/Badge states
  chip: {
    inactive: 'bg-gray-800/60 border-gray-700 text-gray-300 hover:bg-gray-800/80 hover:border-gray-600 hover:text-gray-200',
    active: 'bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/25',
    focus: 'focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900'
  },
  
  // Button states
  button: {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 hover:border-indigo-700',
    secondary: 'bg-gray-800/60 hover:bg-gray-800/80 text-gray-200 border-gray-700 hover:border-gray-600',
    ghost: 'bg-transparent hover:bg-gray-800/40 text-gray-300 hover:text-gray-200 border-transparent hover:border-gray-700'
  },
  
  // Light mode equivalents
  light: {
    chip: {
      inactive: 'bg-gray-100/60 border-gray-300 text-gray-700 hover:bg-gray-200/80 hover:border-gray-400 hover:text-gray-800',
      active: 'bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/25',
      focus: 'focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white'
    },
    button: {
      primary: 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 hover:border-indigo-700',
      secondary: 'bg-gray-100/60 hover:bg-gray-200/80 text-gray-800 border-gray-300 hover:border-gray-400',
      ghost: 'bg-transparent hover:bg-gray-100/40 text-gray-700 hover:text-gray-800 border-transparent hover:border-gray-300'
    }
  }
} as const;

// Export all tokens as a single object
export const designTokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  breakpoints,
  zIndex,
  layout,
  // New dark mode tokens
  surface: surfaceTokens,
  text: textTokens,
  interactive: interactiveTokens
} as const;

export default designTokens;