import type { TranslationDictionary } from './types';

/**
 * English translations
 */
const en: TranslationDictionary = {
  nav: {
    home: 'Home',
    about: 'About',
    projects: 'Projects',
    blog: 'Blog',
    contact: 'Contact',
    back: 'Back',
    collaborate: 'Let\'s work together',
  },
  hero: {
    availability: 'FOULON Maxence • UI/UX Designer',
    title: 'Creator of exceptional',
    subtitle: 'digital experiences',
    description: 'Passionate fullstack developer, I transform your ideas into innovative digital solutions with a focus on user experience and performance.',
    cta_projects: 'View my projects',
    cta_contact: 'Let\'s talk',
    stats: {
      projects: 'Projects completed',
      clients: 'Happy clients',
      experience: 'Years of experience',
    },
    metrics: {
      experience_years: 'Years of experience',
      projects_delivered: 'Projects delivered',
      success_rate: 'Success rate',
      client_satisfaction: 'Client satisfaction',
    },
    value_props: {
      user_centered: 'User-centered design',
      experience: '5+ years of experience',
      roi: 'Measurable ROI',
    },
  },
  about: {
    title: 'About',
    subtitle: 'Passionate about innovation',
    description: 'I design and develop digital solutions that combine modern aesthetics with technical performance.',
    discover_universe: 'Discover my world',
    about_me: 'About me',
    passionate_designer: 'Passionate developer creating innovative digital experiences',
    age_role: '22 years old • Full-Stack Developer',
    intro_text: 'Hello! I\'m Maxence FOULON, a full-stack developer passionate about technological innovation and creating modern web applications.',
    process_text: 'With solid experience in frontend and backend development, I specialize in creating efficient and user-friendly digital solutions.',
    skills: {
      title: 'My areas of expertise',
      react: 'React / Next.js',
      design: 'UI/UX Design', 
      node: 'Node.js / Express',
      database: 'Databases'
    },
    philosophy: {
      title: 'My philosophy',
      innovation: '💡 Innovation and creativity in every project',
      user_focus: '🎯 Focus on user experience',
      performance: '⚡ Performance and code quality',
      collaboration: '🤝 Collaboration and communication'
    },
    cta: {
      projects: 'View my projects',
      contact: 'Contact me'
    },
    values: {
      precision: {
        title: 'Precision',
        description: 'Meticulous attention to detail and visual consistency'
      },
      innovation: {
        title: 'Innovation', 
        description: 'Constant search for creative and original solutions'
      },
      passion: {
        title: 'Passion',
        description: 'Deep love for design and user experience'
      },
      perseverance: {
        title: 'Perseverance',
        description: 'Total commitment to every project until perfection'
      }
    },
    competency_matrix: {
      title: 'Skills Matrix',
      subtitle: 'Expertise validated by certifications and delivered projects',
      categories: {
        product_research: 'Product / Research',
        ui_design: 'UI / Design',
        ux_methods: 'UX / Methods',
        frontend_tech: 'Frontend / Tech'
      },
      expertise_levels: {
        title: 'Expertise levels',
        expert: 'Expert (4-5/5)',
        expert_desc: 'Complete mastery + team training',
        advanced: 'Advanced (3/5)',
        advanced_desc: 'Autonomy on complex projects',
        operational: 'Operational (1-2/5)',
        operational_desc: 'Able to execute with supervision'
      }
    },
    process: {
      title: '5-step process',
      subtitle: 'My proven methodology for creating exceptional user experiences',
      steps: {
        discover: {
          title: 'Discover',
          description: 'User research and needs analysis'
        },
        define: {
          title: 'Define',
          description: 'Problem and objectives definition'
        },
        design: {
          title: 'Design',
          description: 'Solutions design and prototyping'
        },
        validate: {
          title: 'Validate',
          description: 'User testing and iterations'
        },
        ship: {
          title: 'Ship',
          description: 'Delivery and performance monitoring'
        }
      },
      why_title: 'Why this approach?',
      benefits: {
        user_centered: {
          title: 'User-centered',
          description: 'Decisions based on real data and user insights'
        },
        iterative: {
          title: 'Iterative',
          description: 'Continuous testing and improvements based on feedback'
        },
        results_oriented: {
          title: 'Results-oriented',
          description: 'Focus on business impact and user satisfaction'
        }
      }
    },
    timeline: {
      title: 'Professional Journey',
      subtitle: 'My evolution from 2019 to today'
    }
  },
  projects: {
    title: 'Projects',
    subtitle: 'Recent work',
    view_all: 'View all projects',
    featured: 'Featured',
    case_study: 'Case study',
    demo: 'Live demo',
    source: 'Source code',
    all_projects: 'All projects',
    filter_by: 'Filter by',
    see_project: 'See project',
    ready_to_create: 'Ready to create something extraordinary?',
    collaborate_vision: 'Let\'s collaborate to bring your vision to life',
    start_project: 'Start a project',
    categories: {
      all: 'All projects',
      web: 'Web',
      mobile: 'Mobile',
      branding: 'Branding',
      blockchain: 'Blockchain',
      iot: 'IoT'
    },
    section: {
      creative_portfolio: 'Creative portfolio',
      my_title: 'My',
      my_subtitle: 'Creations',
      description: 'Discover a selection of my most innovative projects, combining creativity, technology and user impact',
      loading: 'Loading projects...',
      error: 'Error loading projects',
      retry: 'Retry',
    },
  },
  blog: {
    title: 'Articles',
    subtitle: 'Insights and perspectives',
    insights: 'Insights',
    featured: 'Featured',
    read_more: 'Read more',
    view_all: 'View all articles',
    min_read: 'min read',
    back_to_blog: 'Back to articles',
    section: {
      latest: 'Latest articles',
      blog_and: 'Blog &',
      description: 'Discover my thoughts on design, UX/UI trends and best practices in digital design',
      cta_title: 'Want to read more articles?',
      cta_description: 'Discover all my articles on design, UX and digital trends',
    },
  },
  contact: {
    title: 'Contact',
    subtitle: 'Let\'s discuss your project',
    discuss_project: 'Let\'s talk about your project',
    ambitious_project: 'Do you have an ambitious project? Let\'s discuss together how we can create something extraordinary',
    stay_connected: 'Stay connected',
    choose_communication: 'Choose the communication method that suits you best. I\'m always happy to discuss new creative challenges.',
    start_project: 'Start your project',
    form_description: 'Fill out this form and I\'ll get back to you as soon as possible',
    form: {
      name: 'Full name',
      email: 'Email address',
      message: 'Your message',
      send: 'Send message',
      sending: 'Sending...',
      subject: 'Project subject',
      describe_project: 'Describe your project',
      budget: 'Estimated budget',
      timeline: 'Desired timeline',
      brief_title: 'Project brief (optional)',
      brief_link: 'Link to your brief (Notion, Google Doc, etc.)',
      file_upload: 'Upload a file',
      choose_file: 'Choose a file (PDF, DOC, TXT - max 10MB)',
      schedule_call: 'Would you prefer a call?',
      schedule_description: 'Schedule a time that suits you',
      schedule: 'Schedule',
      privacy_consent: 'I agree that my personal data may be used to contact me regarding my request.',
      privacy_link: 'Learn more about data protection',
      response_time: 'Response within 24h',
      working_hours: 'Mon-Fri 9am-6pm',
      location: 'France',
      remote_missions: 'Remote missions',
      statistics: 'Statistics',
      satisfaction: 'Client satisfaction',
      response_time_stat: 'Response time'
    }
  },
  footer: {
    rights: 'All rights reserved',
    design_by: 'Designed and developed with ❤️',
    social: {
      follow: 'Follow me',
    },
    description: 'Designer passionate about creating exceptional digital experiences. I transform your ideas into modern and intuitive interfaces that leave a lasting impression.',
    navigation: 'Navigation',
    services: 'Services',
    legal: 'Legal notice',
    privacy: 'Privacy',
    created_with: 'Created with',
    and_coffee: 'and lots of coffee',
    back_to_top: 'Back to top',
  },
  theme: {
    toggle_theme: 'Toggle theme',
    light_mode: 'Light mode',
    dark_mode: 'Dark mode',
  },
  language: {
    toggle_language: 'Change language',
    french: 'Français',
    english: 'English',
  },
  common: {
    loading: 'Loading...',
    error: 'An error occurred',
    retry: 'Retry',
    close: 'Close',
    open: 'Open',
    featured: 'Featured',
    read_more: 'Read more',
  },
  switches: {
    theme_light: 'Light mode',
    theme_dark: 'Dark mode',
    language_to_en: 'Switch to English',
    language_to_fr: 'Passer en français',
    toggle_language: 'Change language',
    toggle_theme: 'Toggle theme',
  },
};

export default en;