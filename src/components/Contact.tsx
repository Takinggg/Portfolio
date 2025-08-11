import React, { useState, useEffect, useRef } from 'react';
import { memo, useCallback } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, Sparkles, Calendar, Upload, Link as LinkIcon, X } from 'lucide-react';
import { contactService } from '../lib/api';
import { CONTACT_INFO } from '../config';
import { validateContactForm, contactFormRateLimiter } from '../lib/validation';
import { generateId, screenReader } from '../lib/accessibility';
import { useI18n } from '../hooks/useI18n';
import { SchedulingWidget } from './scheduling';

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
    briefFile: null as File | null
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
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
        setErrorMessage('Veuillez corriger les erreurs dans le formulaire');
        return;
      }

      if (!validation.sanitizedData) {
        throw new Error('Erreur de validation des données');
      }

      // Submit the sanitized message
      const { error } = await contactService.submitMessage(validation.sanitizedData);

      if (error) {
        throw error;
      }

      setSubmitStatus('success');
      
      // Announce success to screen readers
      screenReader.announce('Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.', 'polite');
      
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
        briefFile: null
      });

    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

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
        setErrorMessage('Le fichier ne doit pas dépasser 10MB');
        return;
      }
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        setErrorMessage('Format de fichier non supporté. Utilisez PDF, DOC, DOCX ou TXT');
        return;
      }
    }
    
    setFormData({
      ...formData,
      briefFile: file || null
    });
  }, [formData]);

  // Scheduling handlers
  const handleBookingComplete = useCallback((booking: any) => {
    console.log('Booking completed:', booking);
    // You could show a success message or track analytics here
  }, []);

  const handleSchedulingError = useCallback((error: string) => {
    console.error('Scheduling error:', error);
    setErrorMessage(`Scheduling error: ${error}`);
    setSubmitStatus('error');
  }, []);

  const contactMethods = [
    {
      icon: Mail,
      title: "Email",
      value: CONTACT_INFO.email,
      description: "Réponse sous 24h",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50"
    },
    {
      icon: Phone,
      title: "Téléphone",
      value: CONTACT_INFO.phone,
      description: "Lun-Ven 9h-18h",
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50"
    },
    {
      icon: MapPin,
      title: "Localisation",
      value: CONTACT_INFO.location,
      description: "Missions à distance",
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50"
    }
  ];

  const budgetRanges = [
    "< 5k €",
    "5k - 15k €",
    "15k - 30k €",
    "30k - 50k €",
    "50k+ €"
  ];

  const timelineOptions = [
    "Urgent (< 1 mois)",
    "Court terme (1-3 mois)",
    "Moyen terme (3-6 mois)",
    "Long terme (6+ mois)"
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
            dont nous pouvons créer quelque chose d'extraordinaire
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
                  aria-label={`Contacter par ${method.title.toLowerCase()}: ${method.value}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      // Handle contact method selection
                      if (method.title === 'Email') {
                        window.open(`mailto:${method.value}`, '_blank');
                      } else if (method.title === 'Téléphone') {
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
                <span id="stats-title" className="font-semibold">Statistiques</span>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-1" aria-label="98 pourcent">98%</div>
                  <div className="text-sm text-gray-300">Satisfaction client</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-1" aria-label="24 heures">24h</div>
                  <div className="text-sm text-gray-300">Temps de réponse</div>
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
                    <p className="font-medium">Message envoyé avec succès !</p>
                    <p className="text-sm">Je vous répondrai dans les plus brefs délais.</p>
                  </div>
                )}

                {/* Error Message */}
                {submitStatus === 'error' && (
                  <div 
                    className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl transition-colors"
                    role="alert"
                    aria-live="assertive"
                  >
                    <p className="font-medium">Erreur lors de l'envoi</p>
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
                      placeholder="Votre nom"
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
                      <option value="">Sélectionnez un budget</option>
                      {budgetRanges.map((range) => (
                        <option key={range} value={range}>{range}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="group">
                    <label htmlFor="timeline" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                      Timeline souhaitée
                    </label>
                    <select
                      id="timeline"
                      name="timeline"
                      value={formData.timeline}
                      onChange={handleChange}
                      className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50 dark:bg-gray-900/60 dark:text-gray-100 backdrop-blur-sm group-hover:border-gray-300"
                      disabled={isSubmitting}
                    >
                      <option value="">Sélectionnez une timeline</option>
                      {timelineOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="group">
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                    Sujet du projet *
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
                    Décrivez votre projet *
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
                    placeholder="Parlez-moi de votre vision, vos objectifs, votre audience cible..."
                    required
                    disabled={isSubmitting}
                  />
                  {validationErrors.message && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.message}</p>
                  )}
                </div>

                {/* Brief Upload/URL Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-700">Brief du projet (optionnel)</h4>
                  
                  {/* URL Input */}
                  <div className="group">
                    <label htmlFor={briefUrlId.current} className="block text-sm font-medium text-gray-600 mb-2">
                      Lien vers votre brief (Notion, Google Doc, etc.)
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
                  <div className="text-center text-sm text-gray-500 py-2">ou</div>
                  
                  <div className="group">
                    <label htmlFor={briefFileId.current} className="block text-sm font-medium text-gray-600 mb-2">
                      Télécharger un fichier
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
                          {formData.briefFile ? formData.briefFile.name : 'Choisir un fichier (PDF, DOC, TXT - max 10MB)'}
                        </span>
                      </label>
                      {formData.briefFile && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, briefFile: null })}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
                          aria-label="Supprimer le fichier"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Scheduling CTA */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Préférez-vous un appel ?</h4>
                      <p className="text-sm text-gray-600">Planifiez un créneau qui vous convient</p>
                    </div>
                    <SchedulingWidget
                      triggerText="Planifier"
                      triggerClassName="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                      onBookingComplete={handleBookingComplete}
                      onError={handleSchedulingError}
                    />
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
                      J'accepte que mes données personnelles soient utilisées pour me recontacter concernant ma demande. 
                      <a href="/legal/mentions-legales" className="text-purple-600 hover:underline ml-1" target="_blank">
                        En savoir plus sur la protection des données
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
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Envoyer le message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

Contact.displayName = 'Contact';

export default Contact;