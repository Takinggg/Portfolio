/**
 * Accessibility Utilities
 * WCAG 2.1 AA compliance utilities and helpers
 */

/**
 * Generate unique IDs for ARIA relationships
 */
export const generateId = (() => {
  let counter = 0;
  return (prefix = 'id') => `${prefix}-${++counter}`;
})();

/**
 * Check color contrast ratio compliance
 * WCAG 2.1 AA requires 4.5:1 for normal text, 3:1 for large text
 */
export const checkColorContrast = (foreground: string, background: string): {
  ratio: number;
  isCompliant: boolean;
  isLargeTextCompliant: boolean;
} => {
  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Calculate relative luminance
  const getLuminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);

  if (!fg || !bg) {
    return { ratio: 0, isCompliant: false, isLargeTextCompliant: false };
  }

  const fgLuminance = getLuminance(fg.r, fg.g, fg.b);
  const bgLuminance = getLuminance(bg.r, bg.g, bg.b);

  const ratio = (Math.max(fgLuminance, bgLuminance) + 0.05) / 
                (Math.min(fgLuminance, bgLuminance) + 0.05);

  return {
    ratio: Math.round(ratio * 100) / 100,
    isCompliant: ratio >= 4.5,
    isLargeTextCompliant: ratio >= 3.0
  };
};

/**
 * Keyboard navigation utilities
 */
export const keyboardNavigation = {
  /**
   * Check if element should be focusable
   */
  isFocusable: (element: HTMLElement): boolean => {
    if (element.tabIndex < 0) return false;
    if (element.hasAttribute('disabled')) return false;
    if (element.getAttribute('aria-hidden') === 'true') return false;

    const focusableTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
    return focusableTags.includes(element.tagName) || element.tabIndex >= 0;
  },

  /**
   * Get all focusable elements within a container
   */
  getFocusableElements: (container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors))
      .filter(el => keyboardNavigation.isFocusable(el as HTMLElement)) as HTMLElement[];
  },

  /**
   * Trap focus within a container (for modals, dropdowns, etc.)
   */
  trapFocus: (container: HTMLElement) => {
    const focusableElements = keyboardNavigation.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Focus first element
    firstElement?.focus();

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }
};

/**
 * Screen reader utilities
 */
export const screenReader = {
  /**
   * Announce text to screen readers
   */
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.setAttribute('class', 'sr-only');
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },

  /**
   * Generate descriptive text for screen readers
   */
  generateDescription: (element: HTMLElement): string => {
    const ariaLabel = element.getAttribute('aria-label');
    const ariaLabelledBy = element.getAttribute('aria-labelledby');
    
    if (ariaLabel) return ariaLabel;
    
    if (ariaLabelledBy) {
      const labelElement = document.getElementById(ariaLabelledBy);
      if (labelElement) return labelElement.textContent || '';
    }

    // Fallback to element text content
    return element.textContent || element.alt || element.title || '';
  }
};

/**
 * ARIA utilities
 */
export const aria = {
  /**
   * Set ARIA attributes for better accessibility
   */
  setAttributes: (element: HTMLElement, attributes: Record<string, string | boolean | null>) => {
    Object.entries(attributes).forEach(([key, value]) => {
      if (value === null) {
        element.removeAttribute(key);
      } else {
        element.setAttribute(key, String(value));
      }
    });
  },

  /**
   * Manage expanded state for collapsible elements
   */
  setExpanded: (element: HTMLElement, expanded: boolean) => {
    element.setAttribute('aria-expanded', String(expanded));
    
    // Update associated elements
    const controls = element.getAttribute('aria-controls');
    if (controls) {
      const controlledElement = document.getElementById(controls);
      if (controlledElement) {
        controlledElement.setAttribute('aria-hidden', String(!expanded));
      }
    }
  },

  /**
   * Set up live region for dynamic content
   */
  setupLiveRegion: (element: HTMLElement, level: 'polite' | 'assertive' = 'polite') => {
    element.setAttribute('aria-live', level);
    element.setAttribute('aria-atomic', 'true');
  }
};

/**
 * Form accessibility utilities
 */
export const formAccessibility = {
  /**
   * Associate label with form control
   */
  associateLabel: (input: HTMLElement, label: HTMLElement) => {
    const inputId = input.id || generateId('input');
    input.setAttribute('id', inputId);
    label.setAttribute('for', inputId);
  },

  /**
   * Set up error messages with ARIA
   */
  setupErrorMessage: (input: HTMLElement, errorElement: HTMLElement, hasError: boolean) => {
    const errorId = errorElement.id || generateId('error');
    errorElement.setAttribute('id', errorId);
    errorElement.setAttribute('role', 'alert');
    errorElement.setAttribute('aria-live', 'polite');
    
    if (hasError) {
      input.setAttribute('aria-describedby', errorId);
      input.setAttribute('aria-invalid', 'true');
      errorElement.removeAttribute('aria-hidden');
    } else {
      input.removeAttribute('aria-describedby');
      input.removeAttribute('aria-invalid');
      errorElement.setAttribute('aria-hidden', 'true');
    }
  },

  /**
   * Set up required field indicators
   */
  markRequired: (input: HTMLElement, required: boolean) => {
    if (required) {
      input.setAttribute('aria-required', 'true');
      input.setAttribute('required', '');
    } else {
      input.removeAttribute('aria-required');
      input.removeAttribute('required');
    }
  }
};

/**
 * Motion and animation utilities for accessibility
 */
export const motionAccessibility = {
  /**
   * Check if user prefers reduced motion
   */
  prefersReducedMotion: (): boolean => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  /**
   * Conditionally apply animation based on motion preferences
   */
  conditionalAnimation: (element: HTMLElement, animationClass: string) => {
    if (!motionAccessibility.prefersReducedMotion()) {
      element.classList.add(animationClass);
    }
  },

  /**
   * Set up animation controls
   */
  setupAnimationControls: (container: HTMLElement) => {
    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Pause animations';
    toggleButton.setAttribute('aria-label', 'Pause/Play animations');
    
    let animationsPaused = false;
    
    toggleButton.addEventListener('click', () => {
      animationsPaused = !animationsPaused;
      toggleButton.textContent = animationsPaused ? 'Play animations' : 'Pause animations';
      
      if (animationsPaused) {
        container.classList.add('motion-reduce');
      } else {
        container.classList.remove('motion-reduce');
      }
    });
    
    return toggleButton;
  }
};

/**
 * Validation utilities for accessibility compliance
 */
export const accessibilityValidation = {
  /**
   * Check if element has accessible name
   */
  hasAccessibleName: (element: HTMLElement): boolean => {
    const ariaLabel = element.getAttribute('aria-label');
    const ariaLabelledBy = element.getAttribute('aria-labelledby');
    const title = element.getAttribute('title');
    const altText = element.getAttribute('alt');
    
    return !!(ariaLabel || ariaLabelledBy || title || altText || element.textContent?.trim());
  },

  /**
   * Validate form accessibility
   */
  validateForm: (form: HTMLFormElement): string[] => {
    const errors: string[] = [];
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach((input, index) => {
      const element = input as HTMLElement;
      
      // Check for accessible name
      if (!accessibilityValidation.hasAccessibleName(element)) {
        errors.push(`Form control ${index + 1} lacks accessible name`);
      }
      
      // Check for error message association
      const hasError = element.getAttribute('aria-invalid') === 'true';
      const hasErrorMessage = element.getAttribute('aria-describedby');
      
      if (hasError && !hasErrorMessage) {
        errors.push(`Form control ${index + 1} has error state but no error message`);
      }
    });
    
    return errors;
  }
};

export default {
  generateId,
  checkColorContrast,
  keyboardNavigation,
  screenReader,
  aria,
  formAccessibility,
  motionAccessibility,
  accessibilityValidation
};