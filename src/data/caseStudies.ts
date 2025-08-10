import { CaseStudy } from '../types/portfolio';

export const caseStudies: CaseStudy[] = [
  {
    id: 'fintech-banking-app',
    title: 'FinanceFlow - Mobile Banking Redesign',
    slug: 'fintech-banking-app-redesign',
    category: 'Mobile App',
    client: 'FinanceFlow Bank',
    year: 2024,
    duration: '4 months',
    role: 'Lead UX/UI Designer',
    team: ['Product Manager', 'iOS Developer', 'Android Developer', 'Backend Engineer'],
    
    subtitle: 'Transforming digital banking for the next generation',
    description: 'Complete redesign of a mobile banking app to improve user engagement and reduce customer support calls by 40%.',
    challenge: 'Users were abandoning the app during onboarding and struggling with complex transaction flows, leading to poor retention rates.',
    solution: 'Streamlined user flows, implemented progressive disclosure, and introduced a modern design system with accessibility at its core.',
    
    featuredImage: '/images/case-studies/fintech-hero.jpg',
    heroImage: '/images/case-studies/fintech-hero-large.jpg',
    images: [
      '/images/case-studies/fintech-1.jpg',
      '/images/case-studies/fintech-2.jpg',
      '/images/case-studies/fintech-3.jpg',
      '/images/case-studies/fintech-4.jpg'
    ],
    
    beforeAfterImages: [
      {
        before: '/images/case-studies/fintech-before-1.jpg',
        after: '/images/case-studies/fintech-after-1.jpg',
        description: 'Login and onboarding flow transformation'
      },
      {
        before: '/images/case-studies/fintech-before-2.jpg',
        after: '/images/case-studies/fintech-after-2.jpg',
        description: 'Transaction history and account overview redesign'
      }
    ],
    
    process: [
      {
        phase: 'Discovery',
        title: 'User Research & Analysis',
        description: 'Conducted user interviews and analyzed app analytics to identify pain points',
        deliverables: ['User Interview Reports', 'Analytics Analysis', 'Competitive Analysis'],
        duration: '3 weeks'
      },
      {
        phase: 'Define',
        title: 'Problem Definition',
        description: 'Synthesized research findings into actionable insights and user personas',
        deliverables: ['User Personas', 'Journey Maps', 'Problem Statements'],
        duration: '1 week'
      },
      {
        phase: 'Design',
        title: 'Solution Design',
        description: 'Created wireframes, prototypes, and high-fidelity designs',
        deliverables: ['Wireframes', 'Interactive Prototypes', 'Visual Designs'],
        duration: '6 weeks'
      },
      {
        phase: 'Test',
        title: 'User Testing',
        description: 'Validated designs through usability testing and iteration',
        deliverables: ['Test Reports', 'Design Iterations', 'Final Recommendations'],
        duration: '2 weeks'
      },
      {
        phase: 'Handoff',
        title: 'Development Support',
        description: 'Worked closely with developers to ensure pixel-perfect implementation',
        deliverables: ['Design Specs', 'Component Library', 'QA Support'],
        duration: '4 weeks'
      }
    ],
    
    userResearch: {
      methods: ['User Interviews', 'Usability Testing', 'Analytics Review', 'Heuristic Evaluation'],
      participants: 24,
      insights: [
        'Users felt overwhelmed by information density on key screens',
        'Security concerns were the primary barrier to feature adoption',
        'Mobile-first users expected gesture-based navigation',
        'Trust indicators were crucial for transaction confidence'
      ],
      personas: [
        {
          name: 'Sarah Chen',
          role: 'Young Professional',
          goals: ['Quick transactions', 'Budget tracking', 'Investment insights'],
          painPoints: ['Complex navigation', 'Slow loading times', 'Unclear fee structure']
        },
        {
          name: 'Robert Martinez',
          role: 'Small Business Owner',
          goals: ['Business account management', 'Bulk transactions', 'Financial reporting'],
          painPoints: ['Limited business features', 'Poor transaction categorization']
        }
      ]
    },
    
    designDecisions: [
      {
        title: 'Progressive Onboarding',
        description: 'Broke down the registration process into digestible steps',
        rationale: 'Reduced cognitive load and improved completion rates by 65%',
        image: '/images/case-studies/fintech-onboarding.jpg'
      },
      {
        title: 'Gesture-First Navigation',
        description: 'Implemented swipe gestures for common actions',
        rationale: 'Aligned with user mental models and reduced interaction time',
        image: '/images/case-studies/fintech-gestures.jpg'
      },
      {
        title: 'Trust-Building Elements',
        description: 'Added security indicators and transparent fee disclosure',
        rationale: 'Increased user confidence and reduced support inquiries',
        image: '/images/case-studies/fintech-trust.jpg'
      }
    ],
    
    results: [
      {
        metric: 'User Onboarding Completion',
        before: '32%',
        after: '78%',
        improvement: '+144%'
      },
      {
        metric: 'Customer Support Calls',
        before: '2,400/month',
        after: '1,440/month',
        improvement: '-40%'
      },
      {
        metric: 'App Store Rating',
        before: '3.2 stars',
        after: '4.6 stars',
        improvement: '+44%'
      },
      {
        metric: 'Transaction Success Rate',
        before: '87%',
        after: '96%',
        improvement: '+10%'
      }
    ],
    
    tools: {
      design: ['Figma', 'Adobe Creative Suite', 'Principle'],
      research: ['UserTesting', 'Hotjar', 'Amplitude'],
      prototyping: ['Figma', 'ProtoPie', 'Lottie'],
      collaboration: ['Slack', 'Notion', 'Zeplin']
    },
    
    links: [
      {
        type: 'prototype',
        url: 'https://www.figma.com/proto/fintech-demo',
        title: 'Interactive Prototype'
      }
    ],
    
    tags: ['Mobile App', 'Fintech', 'UX Research', 'Usability Testing', 'iOS', 'Android'],
    featured: true,
    status: 'completed'
  },
  
  {
    id: 'saas-dashboard-analytics',
    title: 'DataViz Pro - Analytics Dashboard',
    slug: 'saas-dashboard-analytics-redesign',
    category: 'SaaS Dashboard',
    client: 'DataViz Pro',
    year: 2024,
    duration: '6 months',
    role: 'Senior UX Designer',
    team: ['Product Manager', 'Data Scientist', 'Frontend Developer', 'Backend Developer'],
    
    subtitle: 'Making complex data accessible and actionable',
    description: 'Redesigned a complex analytics dashboard to improve data comprehension and reduce time-to-insight for business users.',
    challenge: 'Users struggled to extract meaningful insights from overwhelming data visualizations and complex filter systems.',
    solution: 'Implemented information hierarchy, progressive disclosure, and interactive data storytelling to guide users to insights.',
    
    featuredImage: '/images/case-studies/saas-hero.jpg',
    images: [
      '/images/case-studies/saas-1.jpg',
      '/images/case-studies/saas-2.jpg',
      '/images/case-studies/saas-3.jpg'
    ],
    
    process: [
      {
        phase: 'Research',
        title: 'User & Business Analysis',
        description: 'Analyzed user behavior and business requirements for data visualization',
        deliverables: ['User Research Report', 'Business Requirements', 'Technical Constraints'],
        duration: '4 weeks'
      },
      {
        phase: 'Information Architecture',
        title: 'Data Hierarchy Design',
        description: 'Structured complex data relationships and user mental models',
        deliverables: ['Information Architecture', 'User Flows', 'Data Models'],
        duration: '3 weeks'
      },
      {
        phase: 'Design System',
        title: 'Dashboard Components',
        description: 'Created reusable components for data visualization',
        deliverables: ['Component Library', 'Style Guide', 'Interaction Patterns'],
        duration: '5 weeks'
      },
      {
        phase: 'Prototyping',
        title: 'Interactive Dashboards',
        description: 'Built high-fidelity prototypes with real data',
        deliverables: ['Interactive Prototypes', 'Micro-interactions', 'Data Visualizations'],
        duration: '6 weeks'
      },
      {
        phase: 'Testing & Iteration',
        title: 'Validation & Refinement',
        description: 'Tested with business users and iterated based on feedback',
        deliverables: ['Usability Test Results', 'Design Iterations', 'Implementation Guide'],
        duration: '4 weeks'
      }
    ],
    
    designDecisions: [
      {
        title: 'Smart Data Hierarchy',
        description: 'Organized information by business impact and frequency of use',
        rationale: 'Reduced cognitive load and improved decision-making speed',
        image: '/images/case-studies/saas-hierarchy.jpg'
      },
      {
        title: 'Contextual Filters',
        description: 'Made filtering contextual to the current view and user goals',
        rationale: 'Decreased time spent configuring views by 60%',
        image: '/images/case-studies/saas-filters.jpg'
      },
      {
        title: 'Interactive Storytelling',
        description: 'Guided users through data narratives with annotations',
        rationale: 'Improved insight discovery and data comprehension',
        image: '/images/case-studies/saas-storytelling.jpg'
      }
    ],
    
    results: [
      {
        metric: 'Time to First Insight',
        before: '8.5 minutes',
        after: '3.2 minutes',
        improvement: '-62%'
      },
      {
        metric: 'User Task Success',
        before: '64%',
        after: '91%',
        improvement: '+42%'
      },
      {
        metric: 'Feature Adoption',
        before: '28%',
        after: '67%',
        improvement: '+139%'
      },
      {
        metric: 'User Satisfaction',
        before: '6.2/10',
        after: '8.7/10',
        improvement: '+40%'
      }
    ],
    
    tools: {
      design: ['Figma', 'Sketch', 'Adobe Creative Suite'],
      research: ['Maze', 'Lookback', 'Google Analytics'],
      prototyping: ['Figma', 'Framer', 'D3.js'],
      collaboration: ['Slack', 'Miro', 'Linear']
    },
    
    tags: ['SaaS', 'Dashboard', 'Data Visualization', 'Complex Systems', 'B2B'],
    featured: true,
    status: 'completed'
  },

  {
    id: 'ecommerce-checkout-optimization',
    title: 'ShopFlow - Checkout Optimization',
    slug: 'ecommerce-checkout-optimization',
    category: 'E-commerce',
    client: 'ShopFlow Retail',
    year: 2023,
    duration: '3 months',
    role: 'UX/UI Designer',
    team: ['Product Manager', 'Frontend Developer', 'QA Engineer'],
    
    subtitle: 'Streamlining the path to purchase',
    description: 'Optimized the checkout flow to reduce cart abandonment and increase conversion rates for a major e-commerce platform.',
    challenge: 'High cart abandonment rate (73%) due to complex checkout process and unexpected costs.',
    solution: 'Simplified checkout to 3 steps, improved cost transparency, and added guest checkout option.',
    
    featuredImage: '/images/case-studies/ecommerce-hero.jpg',
    images: [
      '/images/case-studies/ecommerce-1.jpg',
      '/images/case-studies/ecommerce-2.jpg'
    ],
    
    process: [
      {
        phase: 'Analysis',
        title: 'Conversion Funnel Analysis',
        description: 'Analyzed user behavior through the existing checkout flow',
        deliverables: ['Analytics Report', 'Heatmap Analysis', 'User Session Recordings'],
        duration: '2 weeks'
      },
      {
        phase: 'Research',
        title: 'User Pain Point Discovery',
        description: 'Conducted user interviews to understand abandonment reasons',
        deliverables: ['Interview Insights', 'Pain Point Analysis', 'Opportunity Map'],
        duration: '2 weeks'
      },
      {
        phase: 'Design',
        title: 'Checkout Flow Redesign',
        description: 'Created streamlined checkout experience with progressive disclosure',
        deliverables: ['New User Flows', 'Wireframes', 'Visual Designs'],
        duration: '4 weeks'
      },
      {
        phase: 'Testing',
        title: 'A/B Testing Setup',
        description: 'Prepared and launched A/B tests for the new checkout flow',
        deliverables: ['Test Designs', 'Success Metrics', 'Implementation Support'],
        duration: '4 weeks'
      }
    ],
    
    results: [
      {
        metric: 'Cart Abandonment Rate',
        before: '73%',
        after: '54%',
        improvement: '-26%'
      },
      {
        metric: 'Conversion Rate',
        before: '2.1%',
        after: '3.4%',
        improvement: '+62%'
      },
      {
        metric: 'Checkout Completion Time',
        before: '4.2 minutes',
        after: '2.8 minutes',
        improvement: '-33%'
      },
      {
        metric: 'Revenue Per Visitor',
        before: '$4.20',
        after: '$6.80',
        improvement: '+62%'
      }
    ],
    
    tools: {
      design: ['Figma', 'Adobe XD'],
      research: ['Hotjar', 'Google Analytics', 'Optimizely'],
      prototyping: ['InVision', 'Marvel'],
      collaboration: ['Slack', 'Trello']
    },
    
    tags: ['E-commerce', 'Conversion Optimization', 'A/B Testing', 'Checkout', 'Mobile'],
    featured: true,
    status: 'completed'
  },

  {
    id: 'design-system-creation',
    title: 'CloudTech Design System',
    slug: 'cloudtech-design-system',
    category: 'Design System',
    client: 'CloudTech Solutions',
    year: 2023,
    duration: '8 months',
    role: 'Design Systems Lead',
    team: ['UX Designer', 'UI Designer', 'Frontend Architect', 'Product Manager'],
    
    subtitle: 'Building the foundation for scalable design',
    description: 'Created a comprehensive design system from scratch to unify the experience across 12+ products and improve development velocity.',
    challenge: 'Inconsistent UI patterns across products leading to poor user experience and slow development cycles.',
    solution: 'Built atomic design system with comprehensive documentation, React components, and governance processes.',
    
    featuredImage: '/images/case-studies/design-system-hero.jpg',
    images: [
      '/images/case-studies/design-system-1.jpg',
      '/images/case-studies/design-system-2.jpg',
      '/images/case-studies/design-system-3.jpg'
    ],
    
    process: [
      {
        phase: 'Audit',
        title: 'Design Inventory & Analysis',
        description: 'Catalogued existing UI patterns and identified inconsistencies',
        deliverables: ['UI Audit Report', 'Pattern Inventory', 'Inconsistency Analysis'],
        duration: '3 weeks'
      },
      {
        phase: 'Foundation',
        title: 'Design Tokens & Principles',
        description: 'Established the foundational elements and design principles',
        deliverables: ['Design Tokens', 'Brand Guidelines', 'Design Principles'],
        duration: '4 weeks'
      },
      {
        phase: 'Components',
        title: 'Component Library Creation',
        description: 'Built reusable components following atomic design methodology',
        deliverables: ['Component Library', 'Usage Guidelines', 'Code Snippets'],
        duration: '12 weeks'
      },
      {
        phase: 'Documentation',
        title: 'Living Documentation',
        description: 'Created comprehensive documentation and adoption guidelines',
        deliverables: ['Design System Website', 'Adoption Guide', 'Training Materials'],
        duration: '6 weeks'
      },
      {
        phase: 'Implementation',
        title: 'Rollout & Support',
        description: 'Supported teams in adopting the design system across products',
        deliverables: ['Migration Plans', 'Team Training', 'Ongoing Support'],
        duration: '8 weeks'
      }
    ],
    
    results: [
      {
        metric: 'Development Velocity',
        before: '2.3 features/sprint',
        after: '4.1 features/sprint',
        improvement: '+78%'
      },
      {
        metric: 'Design Consistency Score',
        before: '34%',
        after: '89%',
        improvement: '+162%'
      },
      {
        metric: 'Time to Market',
        before: '8.5 weeks',
        after: '5.2 weeks',
        improvement: '-39%'
      },
      {
        metric: 'Cross-Product Usability',
        before: '6.1/10',
        after: '8.4/10',
        improvement: '+38%'
      }
    ],
    
    tools: {
      design: ['Figma', 'Storybook', 'Abstract'],
      research: ['UserTesting', 'Maze'],
      prototyping: ['Figma', 'CodeSandbox'],
      collaboration: ['Notion', 'Slack', 'GitHub']
    },
    
    tags: ['Design System', 'Component Library', 'Atomic Design', 'Scalability', 'Documentation'],
    featured: false,
    status: 'completed'
  },

  {
    id: 'healthcare-patient-portal',
    title: 'MedConnect Patient Portal',
    slug: 'healthcare-patient-portal',
    category: 'Healthcare',
    client: 'MedConnect Health',
    year: 2023,
    duration: '5 months',
    role: 'Senior UX Designer',
    team: ['Product Manager', 'Healthcare Consultant', 'iOS Developer', 'Web Developer'],
    
    subtitle: 'Empowering patients through accessible design',
    description: 'Designed an inclusive patient portal prioritizing accessibility and health literacy for diverse user groups.',
    challenge: 'Complex medical information and poor accessibility created barriers for patients managing their health.',
    solution: 'Implemented inclusive design principles with clear information hierarchy and multi-modal accessibility features.',
    
    featuredImage: '/images/case-studies/healthcare-hero.jpg',
    images: [
      '/images/case-studies/healthcare-1.jpg',
      '/images/case-studies/healthcare-2.jpg'
    ],
    
    process: [
      {
        phase: 'Research',
        title: 'Accessibility & Health Literacy Study',
        description: 'Studied diverse user needs including accessibility requirements',
        deliverables: ['Accessibility Audit', 'Health Literacy Research', 'User Personas'],
        duration: '4 weeks'
      },
      {
        phase: 'Co-design',
        title: 'Participatory Design Sessions',
        description: 'Conducted co-design sessions with patients and healthcare providers',
        deliverables: ['Co-design Insights', 'User Requirements', 'Feature Priorities'],
        duration: '3 weeks'
      },
      {
        phase: 'Design',
        title: 'Inclusive Interface Design',
        description: 'Created WCAG 2.1 AA compliant designs with clear information hierarchy',
        deliverables: ['Accessible Designs', 'Information Architecture', 'Interaction Patterns'],
        duration: '8 weeks'
      },
      {
        phase: 'Testing',
        title: 'Accessibility Testing',
        description: 'Tested with users of varying abilities and health literacy levels',
        deliverables: ['Accessibility Test Report', 'Usability Findings', 'Design Improvements'],
        duration: '4 weeks'
      },
      {
        phase: 'Implementation',
        title: 'Development Support',
        description: 'Worked with developers to ensure accessibility standards',
        deliverables: ['Development Guidelines', 'QA Checklist', 'Training Materials'],
        duration: '3 weeks'
      }
    ],
    
    results: [
      {
        metric: 'Accessibility Score',
        before: '68%',
        after: '96%',
        improvement: '+41%'
      },
      {
        metric: 'Task Success Rate',
        before: '52%',
        after: '84%',
        improvement: '+62%'
      },
      {
        metric: 'User Satisfaction',
        before: '5.8/10',
        after: '8.9/10',
        improvement: '+53%'
      },
      {
        metric: 'Support Ticket Reduction',
        before: '890/month',
        after: '340/month',
        improvement: '-62%'
      }
    ],
    
    tools: {
      design: ['Figma', 'Adobe Creative Suite'],
      research: ['UserTesting', 'aXe', 'WAVE'],
      prototyping: ['Figma', 'InVision'],
      collaboration: ['Slack', 'Miro', 'Jira']
    },
    
    tags: ['Healthcare', 'Accessibility', 'Inclusive Design', 'WCAG', 'Health Literacy'],
    featured: false,
    status: 'completed'
  },

  {
    id: 'travel-app-audit',
    title: 'WanderGuide App Optimization',
    slug: 'travel-app-audit-optimization',
    category: 'Audit & Optimization',
    client: 'WanderGuide Travel',
    year: 2024,
    duration: '2 months',
    role: 'UX Consultant',
    team: ['Product Manager', 'Data Analyst'],
    
    subtitle: 'Data-driven optimization for better user experience',
    description: 'Conducted comprehensive UX audit and optimization to improve user engagement and booking conversion rates.',
    challenge: 'Declining user engagement and poor booking conversion rates despite high app downloads.',
    solution: 'Systematic UX audit identifying 23 critical issues with prioritized recommendations for improvement.',
    
    featuredImage: '/images/case-studies/travel-hero.jpg',
    images: [
      '/images/case-studies/travel-1.jpg',
      '/images/case-studies/travel-2.jpg'
    ],
    
    process: [
      {
        phase: 'Analytics',
        title: 'Data Analysis & User Behavior Study',
        description: 'Analyzed user behavior patterns and identified drop-off points',
        deliverables: ['Analytics Report', 'User Behavior Analysis', 'Conversion Funnel Study'],
        duration: '2 weeks'
      },
      {
        phase: 'Heuristic Evaluation',
        title: 'Expert UX Review',
        description: 'Systematic evaluation against usability heuristics and best practices',
        deliverables: ['Heuristic Evaluation Report', 'Issue Inventory', 'Severity Assessment'],
        duration: '2 weeks'
      },
      {
        phase: 'User Testing',
        title: 'Usability Testing Sessions',
        description: 'Conducted moderated testing sessions with target users',
        deliverables: ['Usability Test Report', 'User Pain Points', 'Task Performance Analysis'],
        duration: '2 weeks'
      },
      {
        phase: 'Recommendations',
        title: 'Optimization Strategy',
        description: 'Prioritized recommendations with implementation roadmap',
        deliverables: ['Optimization Strategy', 'Priority Matrix', 'Implementation Roadmap'],
        duration: '2 weeks'
      }
    ],
    
    results: [
      {
        metric: 'Session Duration',
        before: '2.3 minutes',
        after: '4.7 minutes',
        improvement: '+104%'
      },
      {
        metric: 'Booking Conversion',
        before: '1.8%',
        after: '3.2%',
        improvement: '+78%'
      },
      {
        metric: 'User Retention (30-day)',
        before: '23%',
        after: '41%',
        improvement: '+78%'
      },
      {
        metric: 'App Store Rating',
        before: '3.4 stars',
        after: '4.2 stars',
        improvement: '+24%'
      }
    ],
    
    tools: {
      design: ['Figma'],
      research: ['Google Analytics', 'Hotjar', 'UserTesting', 'Maze'],
      prototyping: ['Figma'],
      collaboration: ['Slack', 'Notion']
    },
    
    tags: ['UX Audit', 'Optimization', 'Analytics', 'Travel', 'Conversion'],
    featured: false,
    status: 'completed'
  }
];

// Helper functions
export const getFeaturedCaseStudies = (): CaseStudy[] => {
  return caseStudies.filter(study => study.featured);
};

export const getCaseStudyBySlug = (slug: string): CaseStudy | undefined => {
  return caseStudies.find(study => study.slug === slug);
};

export const getCaseStudiesByCategory = (category: string): CaseStudy[] => {
  return caseStudies.filter(study => study.category === category);
};

export const getAllCategories = (): string[] => {
  return [...new Set(caseStudies.map(study => study.category))];
};

export const getRecentCaseStudies = (limit: number = 3): CaseStudy[] => {
  return caseStudies
    .sort((a, b) => b.year - a.year)
    .slice(0, limit);
};