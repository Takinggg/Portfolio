/**
 * Input Validation and Sanitization Utilities
 * Security-focused validation for user inputs
 */

// Email validation regex - RFC 5322 compliant
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Phone validation regex - International format
const PHONE_REGEX = /^[+]?[1-9]\d{1,14}$/;

// Name validation - Letters, spaces, hyphens, and common accented characters
const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/;

// Subject validation - Alphanumeric, spaces, and common punctuation
const SUBJECT_REGEX = /^[a-zA-Z0-9À-ÿ\s\-.,!?()]{3,100}$/;

/**
 * Sanitize string by removing potentially dangerous characters
 */
export const sanitizeString = (input: string): string => {
  return input
    .trim()
    .replace(/[<>\"'&]/g, '') // Remove HTML/script injection characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .substring(0, 1000); // Limit length
};

/**
 * Sanitize HTML content by removing all HTML tags
 */
export const sanitizeHtml = (input: string): string => {
  return input
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/&[^;]+;/g, '') // Remove HTML entities
    .trim()
    .substring(0, 5000); // Limit length for messages
};

/**
 * Validate email address
 */
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeString(email);
  
  if (!sanitized) {
    return { isValid: false, error: 'L\'email est requis' };
  }
  
  if (sanitized.length > 254) {
    return { isValid: false, error: 'L\'email est trop long' };
  }
  
  if (!EMAIL_REGEX.test(sanitized)) {
    return { isValid: false, error: 'Format d\'email invalide' };
  }
  
  return { isValid: true };
};

/**
 * Validate phone number
 */
export const validatePhone = (phone: string): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeString(phone).replace(/\s|-|\(|\)/g, '');
  
  if (!sanitized) {
    return { isValid: false, error: 'Le numéro de téléphone est requis' };
  }
  
  if (!PHONE_REGEX.test(sanitized)) {
    return { isValid: false, error: 'Format de téléphone invalide' };
  }
  
  return { isValid: true };
};

/**
 * Validate name (first name, last name, etc.)
 */
export const validateName = (name: string): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeString(name);
  
  if (!sanitized) {
    return { isValid: false, error: 'Le nom est requis' };
  }
  
  if (sanitized.length < 2) {
    return { isValid: false, error: 'Le nom doit contenir au moins 2 caractères' };
  }
  
  if (sanitized.length > 50) {
    return { isValid: false, error: 'Le nom est trop long (maximum 50 caractères)' };
  }
  
  if (!NAME_REGEX.test(sanitized)) {
    return { isValid: false, error: 'Le nom contient des caractères non autorisés' };
  }
  
  return { isValid: true };
};

/**
 * Validate subject line
 */
export const validateSubject = (subject: string): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeString(subject);
  
  if (!sanitized) {
    return { isValid: false, error: 'Le sujet est requis' };
  }
  
  if (sanitized.length < 3) {
    return { isValid: false, error: 'Le sujet doit contenir au moins 3 caractères' };
  }
  
  if (sanitized.length > 100) {
    return { isValid: false, error: 'Le sujet est trop long (maximum 100 caractères)' };
  }
  
  if (!SUBJECT_REGEX.test(sanitized)) {
    return { isValid: false, error: 'Le sujet contient des caractères non autorisés' };
  }
  
  return { isValid: true };
};

/**
 * Validate message content
 */
export const validateMessage = (message: string): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeHtml(message);
  
  if (!sanitized) {
    return { isValid: false, error: 'Le message est requis' };
  }
  
  if (sanitized.length < 10) {
    return { isValid: false, error: 'Le message doit contenir au moins 10 caractères' };
  }
  
  if (sanitized.length > 5000) {
    return { isValid: false, error: 'Le message est trop long (maximum 5000 caractères)' };
  }
  
  return { isValid: true };
};

/**
 * Validate complete contact form
 */
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  budget?: string;
  timeline?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  sanitizedData?: ContactFormData;
}

export const validateContactForm = (data: ContactFormData): ValidationResult => {
  const errors: Record<string, string> = {};
  
  // Validate and sanitize each field
  const nameValidation = validateName(data.name);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.error!;
  }
  
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error!;
  }
  
  const subjectValidation = validateSubject(data.subject);
  if (!subjectValidation.isValid) {
    errors.subject = subjectValidation.error!;
  }
  
  const messageValidation = validateMessage(data.message);
  if (!messageValidation.isValid) {
    errors.message = messageValidation.error!;
  }
  
  // Create sanitized data if no errors
  const isValid = Object.keys(errors).length === 0;
  
  if (isValid) {
    const sanitizedData: ContactFormData = {
      name: sanitizeString(data.name),
      email: sanitizeString(data.email),
      subject: sanitizeString(data.subject),
      message: sanitizeHtml(data.message),
      budget: data.budget ? sanitizeString(data.budget) : undefined,
      timeline: data.timeline ? sanitizeString(data.timeline) : undefined,
    };
    
    return { isValid: true, errors: {}, sanitizedData };
  }
  
  return { isValid: false, errors };
};

/**
 * Rate limiting utility for form submissions
 */
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private readonly maxAttempts: number;
  private readonly timeWindow: number; // in milliseconds
  
  constructor(maxAttempts = 5, timeWindowMinutes = 15) {
    this.maxAttempts = maxAttempts;
    this.timeWindow = timeWindowMinutes * 60 * 1000;
  }
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    
    // Remove old attempts outside time window
    const recentAttempts = attempts.filter(time => now - time < this.timeWindow);
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    // Add current attempt
    recentAttempts.push(now);
    this.attempts.set(identifier, recentAttempts);
    
    return true;
  }
  
  getRemainingAttempts(identifier: string): number {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    const recentAttempts = attempts.filter(time => now - time < this.timeWindow);
    
    return Math.max(0, this.maxAttempts - recentAttempts.length);
  }
}

export const contactFormRateLimiter = new RateLimiter(5, 15); // 5 attempts per 15 minutes