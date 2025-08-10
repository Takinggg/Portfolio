// TypeScript types for Liquid Glass UI/UX Portfolio

export interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  category: 'Mobile App' | 'SaaS Dashboard' | 'E-commerce' | 'Design System' | 'Healthcare' | 'Audit & Optimization';
  client: string;
  year: number;
  duration: string;
  role: string;
  team: string[];
  
  // Brief overview
  subtitle: string;
  description: string;
  challenge: string;
  solution: string;
  
  // Visual assets
  featuredImage: string;
  heroImage?: string;
  images: string[];
  beforeAfterImages?: {
    before: string;
    after: string;
    description: string;
  }[];
  
  // Process and methodology
  process: {
    phase: string;
    title: string;
    description: string;
    deliverables: string[];
    duration: string;
  }[];
  
  // User research
  userResearch?: {
    methods: string[];
    participants: number;
    insights: string[];
    personas?: {
      name: string;
      role: string;
      goals: string[];
      painPoints: string[];
      image?: string;
    }[];
  };
  
  // Design decisions
  designDecisions: {
    title: string;
    description: string;
    rationale: string;
    image?: string;
  }[];
  
  // Results and impact
  results: {
    metric: string;
    before: string;
    after: string;
    improvement: string;
  }[];
  
  // Tools and technologies
  tools: {
    design: string[];
    research: string[];
    prototyping: string[];
    collaboration: string[];
  };
  
  // Links and resources
  links?: {
    type: 'prototype' | 'live' | 'case-study' | 'presentation';
    url: string;
    title: string;
  }[];
  
  // Tags for filtering
  tags: string[];
  featured: boolean;
  status: 'completed' | 'in-progress' | 'concept';
}

export interface Skill {
  category: 'Product & Research' | 'UI Design' | 'UX Methods' | 'Frontend & Tech';
  name: string;
  level: 'Expert' | 'Advanced' | 'Operational';
  description: string;
  evidence: {
    type: 'certification' | 'project' | 'experience' | 'training';
    title: string;
    description: string;
    icon?: string;
  }[];
  yearsOfExperience: number;
}

export interface ProcessStep {
  step: number;
  title: string;
  description: string;
  icon: string;
  details: string[];
  tools: string[];
  deliverables: string[];
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  process: string[];
  timeline: string;
  pricing?: {
    type: 'hourly' | 'project' | 'retainer';
    range: string;
  };
  examples: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  companyLogo?: string;
  testimonial: string;
  rating: number;
  projectType: string;
  image?: string;
  linkedinUrl?: string;
}

export interface SocialProof {
  type: 'award' | 'certification' | 'publication' | 'speaking';
  title: string;
  organization: string;
  date: string;
  description?: string;
  link?: string;
  icon?: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  companyUrl?: string;
  location: string;
  type: 'Full-time' | 'Freelance' | 'Contract' | 'Part-time';
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  achievements: string[];
  technologies: string[];
  projects?: {
    name: string;
    description: string;
    impact: string;
  }[];
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  description?: string;
  achievements?: string[];
  relevantCourses?: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
  skills: string[];
}

export interface ContactInfo {
  email: string;
  phone?: string;
  location: string;
  timezone: string;
  availability: {
    status: 'available' | 'busy' | 'limited';
    nextAvailable?: string;
    responseTime: string;
  };
  socialLinks: {
    platform: 'LinkedIn' | 'Behance' | 'Dribbble' | 'GitHub' | 'Twitter' | 'Instagram';
    url: string;
    username?: string;
  }[];
  calendlyUrl?: string;
}

export interface Statistics {
  projectsCompleted: number;
  yearsOfExperience: number;
  clientSatisfactionRate: number;
  averageResponseTime: string;
  countriesWorkedWith: number;
  designSystemsCreated: number;
  userTestsConducted: number;
  prototypesBuilt: number;
}

// Component-specific types
export interface AnimationConfig {
  duration: number;
  delay?: number;
  easing?: string;
  repeat?: number | 'infinite';
}

export interface MagneticConfig {
  strength: number;
  radius: number;
  lerp: number;
}

export interface GlassCardProps {
  variant?: 'light' | 'medium' | 'heavy';
  className?: string;
  children: React.ReactNode;
  animate?: boolean;
  magnetic?: boolean;
  shine?: boolean;
}

export interface LiquidButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  magnetic?: boolean;
  ripple?: boolean;
  href?: string;
  external?: boolean;
}

export interface TypingTextProps {
  texts: string[];
  speed?: number;
  deleteSpeed?: number;
  delayBetweenTexts?: number;
  className?: string;
  cursor?: boolean;
  loop?: boolean;
}

export interface ScrollAnimationProps {
  children: React.ReactNode;
  animation?: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale' | 'liquid-morph';
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
}

// Portfolio data structure
export interface PortfolioData {
  personal: {
    name: string;
    roles: string[];
    tagline: string;
    bio: string;
    avatar: string;
    location: string;
    yearsOfExperience: number;
  };
  
  caseStudies: CaseStudy[];
  skills: Skill[];
  services: Service[];
  process: ProcessStep[];
  testimonials: Testimonial[];
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
  socialProof: SocialProof[];
  contact: ContactInfo;
  statistics: Statistics;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  budget?: string;
  timeline?: string;
  subject: string;
  message: string;
  projectBrief?: string;
  attachments?: File[];
  preferredContactMethod?: 'email' | 'phone' | 'calendar';
  marketingConsent: boolean;
}

// Navigation and routing
export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  external?: boolean;
  subItems?: NavigationItem[];
}

export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
}

// Theme and configuration
export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    glass: {
      light: string;
      medium: string;
      heavy: string;
    };
  };
  animations: {
    enableLiquidEffects: boolean;
    enableParticles: boolean;
    enableMagneticCursor: boolean;
    respectReducedMotion: boolean;
  };
  layout: {
    maxWidth: string;
    containerPadding: string;
    sectionSpacing: string;
  };
}

export default PortfolioData;