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
    about_me: 'My Journey',
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
      want_appointment: 'I would like to schedule an appointment',
      appointment_option: 'Appointment option',
      with_appointment: 'With appointment',
      without_appointment: 'Simple message',
      book_meeting: 'Book a slot',
      privacy_consent: 'I agree that my personal data may be used to contact me regarding my request.',
      privacy_link: 'Learn more about data protection',
      response_time: 'Response within 24h',
      working_hours: 'Mon-Fri 9am-6pm',
      location: 'France',
      remote_missions: 'Remote missions',
      statistics: 'Statistics',
      satisfaction: 'Client satisfaction',
      response_time_stat: 'Response time',
      // Contact method titles
      email_title: 'Email',
      phone_title: 'Phone',
      location_title: 'Location',
      // Form placeholders and labels
      name_placeholder: 'Your name',
      project_placeholder: 'Tell me about your vision, your objectives, your target audience...',
      select_budget: 'Select a budget',
      select_timeline: 'Select a timeline',
      // Success/Error messages
      success_message: 'Message sent successfully!',
      success_detail: 'I will get back to you as soon as possible.',
      error_title: 'Error sending',
      scheduling_message: 'Your message will be sent then the scheduling widget will open automatically to choose your slot.',
      // Validation messages
      validation_error: 'Please correct the errors in the form',
      validation_data_error: 'Data validation error',
      general_error: 'An error occurred',
      // File upload
      file_size_error: 'File must not exceed 10MB',
      file_type_error: 'Unsupported file format. Use PDF, DOC, DOCX or TXT',
      file_remove: 'Remove file',
      // Contact method actions
      contact_by: 'Contact by',
      or: 'or',
      // Budget ranges
      budget_5k: '< $5k',
      budget_5_15k: '$5k - $15k',
      budget_15_30k: '$15k - $30k',
      budget_30_50k: '$30k - $50k',
      budget_50k_plus: '$50k+',
      // Timeline options
      timeline_urgent: 'Urgent (< 1 month)',
      timeline_short: 'Short term (1-3 months)',
      timeline_medium: 'Medium term (3-6 months)',
      timeline_long: 'Long term (6+ months)'
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
  scheduling: {
    form: {
      title: 'Enter your details',
      name: 'Full Name',
      email: 'Email Address',
      notes_optional: 'Additional Notes (Optional)',
      consent_label: 'I agree to receive booking confirmations and updates via email. You can unsubscribe at any time.',
      submit: 'Schedule Meeting',
      booking: 'Booking...',
      clear_prefilled: 'Clear',
    },
    common: {
      back: 'Back',
      continue: 'Continue',
      close: 'Close',
    },
    validation: {
      name_required: 'Name is required',
      email_required: 'Email is required',
      email_invalid: 'Please enter a valid email address',
      consent_required: 'Please agree to the terms to proceed',
    },
    steps: {
      event_type: 'Select Meeting Type',
      slots: 'Choose Time',
      form: 'Your Information',
      confirmation: 'Confirmed!',
    },
    messages: {
      booking_created: 'Your booking has been created successfully',
      no_event_types: 'No meeting types available at the moment.',
      no_slots_available: 'No available times for this date.',
      select_time: 'Select a time',
      times_shown_in: 'Times shown in',
    },
    errors: {
      network: 'Connection error to scheduling service. Please check your internet connection.',
      not_found: 'Scheduling service not found. Please contact technical support.',
      server_error: 'Scheduling service server error. Please try again later.',
      invalid_json: 'Scheduling service is unavailable (non-JSON response) — check configuration.',
      generic: 'Scheduling service is temporarily unavailable',
      invalid_request: 'Invalid booking data. Please check the information you entered.',
      invalid_event_type: 'Invalid event type. Please select a valid event type.',
      invalid_email: 'Invalid email address. Please enter a valid email address.',
      invalid_time: 'Invalid time slot. Please select a new time slot.',
      invalid_start_time: 'Invalid start time. Please select a valid start time.',
      invalid_end_time: 'Invalid end time. Please select a valid end time.',
      end_before_start: 'End time must be after start time. Please check your selection.',
    },
    time: {
      minutes: 'minutes',
      duration_minutes: 'minutes',
    },
    calendar: {
      previous_week: 'Previous week',
      next_week: 'Next week',
      today: 'Today',
      slots_available: 'slots available',
      slot_available: 'slot available',
    },
    trigger: {
      schedule_meeting: 'Schedule a Meeting',
    },
    confirmation: {
      title: 'You\'re all set!',
      subtitle: 'Your meeting has been successfully scheduled. You\'ll receive a confirmation email shortly.',
      add_to_calendar: 'Add to your calendar:',
      google_calendar: 'Google Calendar',
      download_ics: 'Download .ics',
      whats_next: 'What\'s next?',
      next_steps: [
        'You\'ll receive a confirmation email with all the details',
        'Meeting details and access information will be provided',
        'You can reschedule or cancel using the links in your email'
      ],
      booking_reference: 'Booking reference',
      notes_label: 'Notes:',
    },
  },
};

export default en;