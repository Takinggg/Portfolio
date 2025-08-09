import React, { useState, useEffect, useRef } from 'react';
import { memo, useCallback } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, Calendar, Sparkles } from 'lucide-react';
import { contactService } from '../lib/supabase';

const Contact = memo(() => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    budget: '',
    timeline: ''
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const sectionRef = useRef<HTMLElement>(null);

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
    
    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.subject || !formData.message) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Veuillez entrer une adresse email valide');
      }

      // Submit the message
      const { data, error } = await contactService.submitMessage({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        budget: formData.budget || undefined,
        timeline: formData.timeline || undefined,
      });

      if (error) {
        throw error;
      }

      setSubmitStatus('success');
      
      // Reset form after successful submission
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        budget: '',
        timeline: ''
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }, [formData]);

  const contactMethods = [
    {
      icon: Mail,
      title: "Email",
      value: "maxencefoulon17@gmail.com",
      description: "Réponse sous 24h",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50"
    },
    {
      icon: Phone,
      title: "Téléphone",
      value: "06 19 32 62 26",
      description: "Lun-Ven 9h-18h",
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50"
    },
    {
      icon: MapPin,
      title: "Localisation",
      value: "France",
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
    <section ref={sectionRef} id="contact" className="py-32 bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-80 h-80 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-sm font-medium mb-6">
            <MessageCircle className="text-purple-600" size={16} />
            <span className="text-gray-700">Parlons de votre projet</span>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-black mb-8">
            <span className="bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
              Contactez
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              moi
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Vous avez un projet ambitieux ? Discutons ensemble de la façon 
            dont nous pouvons créer quelque chose d'extraordinaire
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Contact Methods */}
          <div className={`lg:col-span-2 space-y-6 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Restons connectés</h3>
              <p className="text-gray-600 leading-relaxed">
                Choisissez le moyen de communication qui vous convient le mieux. 
                Je suis toujours ravi d'échanger sur de nouveaux défis créatifs.
              </p>
            </div>

            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <div 
                  key={index}
                  className={`group relative bg-gradient-to-br ${method.bgGradient} p-6 rounded-3xl border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative flex items-start gap-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${method.gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <Icon className="text-white" size={24} />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 mb-1">{method.title}</h4>
                      <p className="text-gray-800 font-medium mb-1">{method.value}</p>
                      <p className="text-sm text-gray-600">{method.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-gray-900 to-purple-900 rounded-3xl p-8 text-white mt-8">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="text-yellow-400" size={20} />
                <span className="font-semibold">Statistiques</span>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-1">98%</div>
                  <div className="text-sm text-gray-300">Satisfaction client</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-1">24h</div>
                  <div className="text-sm text-gray-300">Temps de réponse</div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className={`lg:col-span-3 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-100">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Démarrons votre projet</h3>
                <p className="text-gray-600">Remplissez ce formulaire et je vous recontacte dans les plus brefs délais</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Success Message */}
                {submitStatus === 'success' && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
                    <p className="font-medium">Message envoyé avec succès !</p>
                    <p className="text-sm">Je vous répondrai dans les plus brefs délais.</p>
                  </div>
                )}

                {/* Error Message */}
                {submitStatus === 'error' && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                    <p className="font-medium">Erreur lors de l'envoi</p>
                    <p className="text-sm">{errorMessage}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm group-hover:border-gray-300"
                      placeholder="Votre nom"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="group">
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm group-hover:border-gray-300"
                      placeholder="votre@email.com"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label htmlFor="budget" className="block text-sm font-semibold text-gray-700 mb-2">
                      Budget estimé
                    </label>
                    <select
                      id="budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm group-hover:border-gray-300"
                      disabled={isSubmitting}
                    >
                      <option value="">Sélectionnez un budget</option>
                      {budgetRanges.map((range) => (
                        <option key={range} value={range}>{range}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="group">
                    <label htmlFor="timeline" className="block text-sm font-semibold text-gray-700 mb-2">
                      Timeline souhaitée
                    </label>
                    <select
                      id="timeline"
                      name="timeline"
                      value={formData.timeline}
                      onChange={handleChange}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm group-hover:border-gray-300"
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
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                    Sujet du projet *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm group-hover:border-gray-300"
                    placeholder="Ex: Refonte d'application mobile"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="group">
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Décrivez votre projet *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none bg-white/50 backdrop-blur-sm group-hover:border-gray-300"
                    placeholder="Parlez-moi de votre vision, vos objectifs, votre audience cible..."
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-5 px-8 rounded-2xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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