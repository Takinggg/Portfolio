import React, { useState, useEffect, useRef } from 'react';
import { memo, useCallback } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, Sparkles, Calendar, Upload, Link as LinkIcon, X } from 'lucide-react';
import { contactService } from '../lib/api';
import { CONTACT_INFO } from '../config';
import { validateContactForm, contactFormRateLimiter } from '../lib/validation';
import { generateId, screenReader } from '../lib/accessibility';
import { useI18n } from '../hooks/useI18n';
import { SchedulingWidget } from './scheduling';
import { saveUserInfoToStorage } from '../utils/userInfoPrefill';

const Contact = memo(() => {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    budget: '',
    timeline: '',
    rgpdConsent: false,
    briefUrl: '',
    briefFile: null as File | null,
    wantAppointment: false // New field for appointment option
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [shouldOpenScheduling, setShouldOpenScheduling] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  
  // Generate unique IDs for accessibility
  const formId = useRef(generateId('contact-form'));
  const nameId = useRef(generateId('name'));
  const emailId = useRef(generateId('email'));
  const rgpdId = useRef(generateId('rgpd'));
  const briefUrlId = useRef(generateId('brief-url'));
  const briefFileId = useRef(generateId('brief-file'));

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');
    setValidationErrors({});
    
    try {
      // Rate limiting check
      const clientId = 'contact_form'; // In production, use IP or user ID
      if (!contactFormRateLimiter.isAllowed(clientId)) {
        const remaining = contactFormRateLimiter.getRemainingAttempts(clientId);
        throw new Error(`Trop de tentatives. Veuillez attendre avant de réessayer. Tentatives restantes: ${remaining}`);
      }

      // Validate and sanitize form data
      const validation = validateContactForm(formData);
      
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        setSubmitStatus('error');
        setErrorMessage(t('contact.form.validation_error'));
        return;
      }

      if (!validation.sanitizedData) {
        throw new Error(t('contact.form.validation_data_error'));
      }

      // Submit the sanitized message
      const { data: messageData, error } = await contactService.submitMessage(validation.sanitizedData);

      if (error) {
        throw error;
      }

      // If appointment is requested, trigger scheduling workflow
      if (formData.wantAppointment && messageData) {
        // Store message ID for later linking
        window.sessionStorage.setItem('pendingMessageId', messageData.id);
        
        // Save user info to localStorage for prefilling
        saveUserInfoToStorage({
          name: formData.name,
          email: formData.email
        });
        
        // Show success message for contact form
        setSubmitStatus('success');
        screenReader.announce(t('contact.form.success_message') + ' Le widget de planification va s\'ouvrir.', 'polite');
        
        // Reset form except for appointment preference
        setFormData(prev => ({
          name: '',
          email: '',
          subject: '',
          message: '',
          budget: '',
          timeline: '',
          rgpdConsent: false,
          briefUrl: '',
          briefFile: null,
          wantAppointment: prev.wantAppointment // Keep the appointment preference
        }));
        
        // Trigger scheduling widget programmatically after a short delay
        setTimeout(() => {
          setShouldOpenScheduling(true);
        }, 1000);
        
      } else {
        // Standard success flow for non-appointment messages
        // Save user info to localStorage for future use
        saveUserInfoToStorage({
          name: formData.name,
          email: formData.email
        });
        
        setSubmitStatus('success');
        
        // Announce success to screen readers
        screenReader.announce(t('contact.form.success_message') + ' Nous vous répondrons dans les plus brefs délais.', 'polite');
        
        // Reset form after successful submission
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          budget: '',
          timeline: '',
          rgpdConsent: false,
          briefUrl: '',
          briefFile: null,
          wantAppointment: false
        });
      }

    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : t('contact.form.general_error'));
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, t]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setSubmitStatus('idle');
    setErrorMessage('');
    setValidationErrors({});
    
    if (e.target.type === 'checkbox') {
      setFormData({
        ...formData,
        [e.target.name]: (e.target as HTMLInputElement).checked
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    }
  }, [formData]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage(t('contact.form.file_size_error'));
        return;
      }
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        setErrorMessage(t('contact.form.file_type_error'));
        return;
      }
    }
    
    setFormData({
      ...formData,
      briefFile: file || null
    });
  }, [formData, t]);

  // Scheduling handlers
  const handleBookingComplete = useCallback(async (booking: any) => {
    console.log('Booking completed:', booking);
    
    // Get the pending message ID and link the booking
    const pendingMessageId = window.sessionStorage.getItem('pendingMessageId');
    if (pendingMessageId && booking.uuid) {
      try {
        await contactService.updateMessage(pendingMessageId, { 
          booking_uuid: booking.uuid 
        });
        console.log('Successfully linked booking to contact message:', pendingMessageId, booking.uuid);
        
        // Clear the pending message ID
        window.sessionStorage.removeItem('pendingMessageId');
        
        // Show enhanced success message
        setSubmitStatus('success');
        setErrorMessage('');
        screenReader.announce(
          `Rendez-vous confirmé ! Votre créneau du ${new Date(booking.start_time).toLocaleDateString('fr-FR')} à ${new Date(booking.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} est réservé.`,
          'polite'
        );
        
      } catch (error) {
        console.error('Failed to link booking to contact message:', error);
        // Don't show this error to user as the booking was successful
      }
    }
    
    // Close the scheduling widget
    setShouldOpenScheduling(false);
  }, []);

  const handleSchedulingError = useCallback((error: string) => {
    console.error('Scheduling error:', error);
    
    // Convert technical errors to localized user-friendly messages
    let friendlyMessage = t('scheduling.errors.generic');
    
    if (error.includes('expected JSON but received')) {
      friendlyMessage = t('scheduling.errors.invalid_json');
    } else if (error.includes('Failed to fetch') || error.includes('Network')) {
      friendlyMessage = t('scheduling.errors.network');
    } else if (error.includes('HTTP 404')) {
      friendlyMessage = t('scheduling.errors.not_found');
    } else if (error.includes('HTTP 500')) {
      friendlyMessage = t('scheduling.errors.server_error');
    }
    
    setErrorMessage(friendlyMessage);
    setSubmitStatus('error');
    setShouldOpenScheduling(false); // Close the scheduling widget on error
  }, [t]);

  const contactMethods = [
    {
      icon: Mail,
      title: t('contact.form.email_title'),
      value: CONTACT_INFO.email,
      description: t('contact.form.response_time'),
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50"
    },
    {
      icon: Phone,
      title: t('contact.form.phone_title'),
      value: CONTACT_INFO.phone,
      description: t('contact.form.working_hours'),
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50"
    },
    {
      icon: MapPin,
      title: t('contact.form.location_title'),
      value: CONTACT_INFO.location,
      description: t('contact.form.remote_missions'),
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50"
    }
  ];

  const budgetRanges = [
    t('contact.form.budget_5k'),
    t('contact.form.budget_5_15k'),
    t('contact.form.budget_15_30k'),
    t('contact.form.budget_30_50k'),
    t('contact.form.budget_50k_plus')
  ];

  const timelineOptions = [
    t('contact.form.timeline_urgent'),
    t('contact.form.timeline_short'),
    t('contact.form.timeline_medium'),
    t('contact.form.timeline_long')
  ];

  return (
    <section 
      ref={sectionRef} 
      id="contact" 
      className="py-32 bg-white dark:bg-gray-950 relative overflow-hidden transition-colors"
      aria-labelledby="contact-title"
    >
      {/* WHITE Liquid Glass Background Elements */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute top-20 right-20 w-80 h-80 liquid-shape opacity-5 blur-3xl"
             style={{background: 'linear-gradient(135deg, rgba(118, 75, 162, 0.15), rgba(240, 147, 251, 0.15))'}} />
        <div className="absolute bottom-20 left-20 w-96 h-96 liquid-shape-alt opacity-5 blur-3xl"
             style={{background: 'linear-gradient(45deg, rgba(103, 126, 234, 0.12), rgba(79, 172, 254, 0.12))'}} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <header className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 glass-base rounded-full text-sm font-medium mb-6">
            <MessageCircle className="text-liquid-purple" size={16} aria-hidden="true" />
            <span className="text-text-strong">{t('contact.discuss_project')}</span>
          </div>
          
          <h2 id="contact-title" className="text-5xl md:text-7xl font-black mb-8">
            <span className="bg-gradient-to-r from-text-strong via-liquid-purple to-liquid-pink bg-clip-text text-transparent">
              {t('contact.title').split(' ')[0]}
            </span>
            <br />
            <span className="bg-gradient-to-r from-liquid-purple to-liquid-pink bg-clip-text text-transparent">
              {t('contact.title').split(' ').slice(1).join(' ')}
            </span>
          </h2>
          
          <p className="text-xl text-text-soft max-w-4xl mx-auto leading-relaxed">
            {t('contact.ambitious_project')}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Contact Methods */}
          <aside 
            className={`lg:col-span-2 space-y-6 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}
            aria-labelledby="contact-methods-title"
          >
            <div className="mb-8">
              <h3 id="contact-methods-title" className="text-2xl font-bold text-text-strong mb-4">{t('contact.stay_connected')}</h3>
              <p className="text-text-soft leading-relaxed">
                {t('contact.choose_communication')}
              </p>
            </div>

            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <div 
                  key={index}
                  className={`group relative glass-base p-6 rounded-3xl shadow-glass hover:shadow-glass-lg transition-all duration-500 transform hover:-translate-y-2 cursor-pointer focus-within:ring-2 focus-within:ring-liquid-purple focus-within:ring-offset-2 magnetic`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${t('contact.form.contact_by')} ${method.title.toLowerCase()}: ${method.value}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      // Handle contact method selection
                      if (method.title === t('contact.form.email_title')) {
                        window.open(`mailto:${method.value}`, '_blank');
                      } else if (method.title === t('contact.form.phone_title')) {
                        window.open(`tel:${method.value}`, '_blank');
                      }
                    }
                  }}
                >
                  <div className="absolute inset-0 glass-shine opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" />
                  
                  <div className="relative flex items-start gap-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${method.gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-liquid`}>
                      <Icon className="text-white" size={24} aria-hidden="true" />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-text-strong mb-1">{method.title}</h4>
                      <p className="text-text-strong font-medium mb-1">{method.value}</p>
                      <p className="text-sm text-text-soft">{method.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-gray-900 to-purple-900 rounded-3xl p-8 text-white mt-8" role="complementary" aria-labelledby="stats-title">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="text-yellow-400" size={20} aria-hidden="true" />
                <span id="stats-title" className="font-semibold">{t('contact.form.statistics')}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-1" aria-label="98 pourcent">98%</div>
                  <div className="text-sm text-gray-300">{t('contact.form.satisfaction')}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-1" aria-label="24 heures">24h</div>
                  <div className="text-sm text-gray-300">{t('contact.form.response_time_stat')}</div>
                </div>
              </div>
            </div>
          </aside>

          {/* Contact Form */}
          <div className={`lg:col-span-3 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-gray-700 transition-colors">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors">{t('contact.start_project')}</h3>
                <p className="text-gray-600 dark:text-gray-400 transition-colors">{t('contact.form_description')}</p>
              </div>

              <form 
                id={formId.current}
                onSubmit={handleSubmit} 
                className="space-y-6"
                noValidate
                aria-labelledby="contact-title"
              >
                {/* Success Message */}
                {submitStatus === 'success' && (
                  <div 
                    className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl transition-colors"
                    role="alert"
                    aria-live="polite"
                  >
                    <p className="font-medium">{t('contact.form.success_message')}</p>
                    <p className="text-sm">{t('contact.form.success_detail')}</p>
                  </div>
                )}

                {/* Error Message */}
                {submitStatus === 'error' && (
                  <div 
                    className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl transition-colors"
                    role="alert"
                    aria-live="assertive"
                  >
                    <p className="font-medium">{t('contact.form.error_title')}</p>
                    <p className="text-sm">{errorMessage}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label htmlFor={nameId.current} className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                      {t('contact.form.name')} *
                    </label>
                    <input
                      type="text"
                      id={nameId.current}
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-4 border-2 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50 dark:bg-gray-900/60 dark:text-gray-100 backdrop-blur-sm group-hover:border-gray-300 dark:group-hover:border-gray-600 ${
                        validationErrors.name ? 'border-red-300 dark:border-red-600' : 'border-gray-200 dark:border-gray-700 dark:border-gray-700'
                      }`}
                      placeholder={t('contact.form.name_placeholder')}
                      required
                      disabled={isSubmitting}
                      aria-invalid={!!validationErrors.name}
                      aria-describedby={validationErrors.name ? `${nameId.current}-error` : undefined}
                    />
                    {validationErrors.name && (
                      <p 
                        id={`${nameId.current}-error`}
                        className="mt-1 text-sm text-red-600"
                        role="alert"
                        aria-live="polite"
                      >
                        {validationErrors.name}
                      </p>
                    )}
                  </div>
                  
                  <div className="group">
                    <label htmlFor={emailId.current} className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                      Email *
                    </label>
                    <input
                      type="email"
                      id={emailId.current}
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-4 border-2 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50 dark:bg-gray-900/60 dark:text-gray-100 backdrop-blur-sm group-hover:border-gray-300 ${
                        validationErrors.email ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'
                      }`}
                      placeholder="votre@email.com"
                      required
                      disabled={isSubmitting}
                      aria-invalid={!!validationErrors.email}
                      aria-describedby={validationErrors.email ? `${emailId.current}-error` : undefined}
                    />
                    {validationErrors.email && (
                      <p 
                        id={`${emailId.current}-error`}
                        className="mt-1 text-sm text-red-600"
                        role="alert"
                        aria-live="polite"
                      >
                        {validationErrors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label htmlFor="budget" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                      {t('contact.form.budget')}
                    </label>
                    <select
                      id="budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50 dark:bg-gray-900/60 dark:text-gray-100 backdrop-blur-sm group-hover:border-gray-300"
                      disabled={isSubmitting}
                    >
                      <option value="">{t('contact.form.select_budget')}</option>
                      {budgetRanges.map((range) => (
                        <option key={range} value={range}>{range}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="group">
                    <label htmlFor="timeline" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                      {t('contact.form.timeline')}
                    </label>
                    <select
                      id="timeline"
                      name="timeline"
                      value={formData.timeline}
                      onChange={handleChange}
                      className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50 dark:bg-gray-900/60 dark:text-gray-100 backdrop-blur-sm group-hover:border-gray-300"
                      disabled={isSubmitting}
                    >
                      <option value="">{t('contact.form.select_timeline')}</option>
                      {timelineOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Appointment Option */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6 transition-colors">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="wantAppointment"
                      name="wantAppointment"
                      checked={formData.wantAppointment}
                      onChange={handleChange}
                      className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={isSubmitting}
                    />
                    <div className="flex-1">
                      <label htmlFor="wantAppointment" className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 transition-colors cursor-pointer">
                        {t('contact.form.want_appointment')}
                      </label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors">
                        {t('contact.form.schedule_description')}
                      </p>
                      {formData.wantAppointment && (
                        <div className="mt-3 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700 transition-colors">
                          <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                            ✓ {t('contact.form.scheduling_message')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="group">
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                    {t('contact.form.subject')} *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={`w-full px-4 py-4 border-2 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50 dark:bg-gray-900/60 dark:text-gray-100 backdrop-blur-sm group-hover:border-gray-300 ${
                      validationErrors.subject ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'
                    }`}
                    placeholder="Ex: Refonte d'application mobile"
                    required
                    disabled={isSubmitting}
                  />
                  {validationErrors.subject && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.subject}</p>
                  )}
                </div>

                <div className="group">
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                    {t('contact.form.describe_project')} *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className={`w-full px-4 py-4 border-2 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none bg-white/50 dark:bg-gray-900/60 dark:text-gray-100 backdrop-blur-sm group-hover:border-gray-300 ${
                      validationErrors.message ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'
                    }`}
                    placeholder={t('contact.form.project_placeholder')}
                    required
                    disabled={isSubmitting}
                  />
                  {validationErrors.message && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.message}</p>
                  )}
                </div>

                {/* Brief Upload/URL Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-700">{t('contact.form.brief_title')}</h4>
                  
                  {/* URL Input */}
                  <div className="group">
                    <label htmlFor={briefUrlId.current} className="block text-sm font-medium text-gray-600 mb-2">
                      {t('contact.form.brief_link')}
                    </label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="url"
                        id={briefUrlId.current}
                        name="briefUrl"
                        value={formData.briefUrl}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50 dark:bg-gray-900/60 dark:text-gray-100 backdrop-blur-sm"
                        placeholder="https://notion.so/mon-brief"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* File Upload */}
                  <div className="text-center text-sm text-gray-500 py-2">{t('contact.form.or')}</div>
                  
                  <div className="group">
                    <label htmlFor={briefFileId.current} className="block text-sm font-medium text-gray-600 mb-2">
                      {t('contact.form.file_upload')}
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        id={briefFileId.current}
                        name="briefFile"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.txt"
                        className="hidden"
                        disabled={isSubmitting}
                      />
                      <label
                        htmlFor={briefFileId.current}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all duration-300 cursor-pointer group-hover:border-purple-400"
                      >
                        <Upload size={18} className="text-gray-400" />
                        <span className="text-gray-600">
                          {formData.briefFile ? formData.briefFile.name : t('contact.form.choose_file')}
                        </span>
                      </label>
                      {formData.briefFile && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, briefFile: null })}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
                          aria-label={t('contact.form.file_remove')}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>



                {/* RGPD Consent */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id={rgpdId.current}
                      name="rgpdConsent"
                      checked={formData.rgpdConsent}
                      onChange={handleChange}
                      className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      required
                      disabled={isSubmitting}
                      aria-invalid={!!validationErrors.rgpdConsent}
                      aria-describedby={validationErrors.rgpdConsent ? `${rgpdId.current}-error` : undefined}
                    />
                    <label htmlFor={rgpdId.current} className="text-sm text-gray-600 leading-relaxed">
                      {t('contact.form.privacy_consent')}
                      <a href="/legal/mentions-legales" className="text-purple-600 hover:underline ml-1" target="_blank">
                        {t('contact.form.privacy_link')}
                      </a>
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                  </div>
                  {validationErrors.rgpdConsent && (
                    <p 
                      id={`${rgpdId.current}-error`}
                      className="text-sm text-red-600"
                      role="alert"
                      aria-live="polite"
                    >
                      {validationErrors.rgpdConsent}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !formData.rgpdConsent}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-5 px-8 rounded-2xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  data-track="contact-form-submit"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t('contact.form.sending')}
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      {t('contact.form.send')}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      {/* Automatic Scheduling Widget - Opens when appointment is requested */}
      {shouldOpenScheduling && (
        <SchedulingWidget
          autoOpen={true}
          onBookingComplete={handleBookingComplete}
          onError={handleSchedulingError}
        />
      )}
    </section>
  );
});

Contact.displayName = 'Contact';

export default Contact;