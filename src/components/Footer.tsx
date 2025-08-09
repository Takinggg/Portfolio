import React from 'react';
import { Heart, Linkedin, Instagram, Dribbble, Github, Twitter, ArrowUp, Sparkles } from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const socialLinks = [
    { icon: Linkedin, href: "#", label: "LinkedIn", color: "hover:text-blue-600" },
    { icon: Instagram, href: "#", label: "Instagram", color: "hover:text-pink-600" },
    { icon: Dribbble, href: "#", label: "Dribbble", color: "hover:text-pink-500" },
    { icon: Github, href: "#", label: "GitHub", color: "hover:text-gray-900" },
    { icon: Twitter, href: "#", label: "Twitter", color: "hover:text-blue-400" }
  ];

  const quickLinks = [
    { label: "Accueil", href: "#hero" },
    { label: "À propos", href: "#about" },
    { label: "Projets", href: "#projects" },
    { label: "Contact", href: "#contact" }
  ];

  const services = [
    "UI/UX Design",
    "Design System",
    "Prototypage",
    "Recherche UX",
    "Design Mobile",
    "Branding"
  ];

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 text-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-pink-500/10 to-orange-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Sparkles className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black">FOULON Maxence</h3>
                  <p className="text-sm text-gray-300">UI/UX Designer</p>
                </div>
              </div>
              
              <p className="text-gray-300 leading-relaxed mb-8 max-w-md">
                Designer passionné par la création d'expériences digitales exceptionnelles. 
                Je transforme vos idées en interfaces modernes et intuitives qui marquent les esprits.
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400 mr-2">Suivez-moi :</span>
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a 
                      key={index}
                      href={social.href}
                      aria-label={social.label}
                      className={`w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:bg-white/20 ${social.color}`}
                    >
                      <Icon size={20} />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full" />
                Navigation
              </h4>
              <div className="space-y-3">
                {quickLinks.map((link, index) => (
                  <a 
                    key={index}
                    href={link.href}
                    className="block text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 transform"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full" />
                Services
              </h4>
              <div className="space-y-3">
                {services.map((service, index) => (
                  <div 
                    key={index}
                    className="text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer hover:translate-x-1 transform"
                  >
                    {service}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <p>© 2024 FOULON Maxence. Tous droits réservés.</p>
                <div className="hidden md:flex items-center gap-4">
                  <a href="#" className="hover:text-white transition-colors duration-200">Mentions légales</a>
                  <a href="#" className="hover:text-white transition-colors duration-200">Confidentialité</a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <p className="text-sm text-gray-400 flex items-center gap-2">
                  Créé avec <Heart size={16} className="text-red-500 animate-pulse" /> et beaucoup de café
                </p>
                
                <button
                  onClick={scrollToTop}
                  className="group w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl"
                  aria-label="Retour en haut"
                >
                  <ArrowUp size={20} className="group-hover:-translate-y-1 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;