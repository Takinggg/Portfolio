import React from 'react';
import { ContactForm } from '../../components/ContactForm';
import { BookingWidget } from '../../components/BookingWidget';

export const WidgetsDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Widgets de Contact et Réservation</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez nos nouveaux widgets intégrés : formulaire de contact avec anti-spam et système de réservation avec intégration Google Calendar.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form Widget */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Formulaire de Contact</h2>
            <p className="text-gray-600 mb-6">
              Formulaire sécurisé avec honeypot anti-spam, captcha arithmétique et envoi d'emails de confirmation.
            </p>
            <ContactForm />
          </div>

          {/* Booking Widget */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Réservation de Rendez-vous</h2>
            <p className="text-gray-600 mb-6">
              Système de réservation avec intégration Google Calendar, gestion des créneaux et confirmation automatique.
            </p>
            <BookingWidget />
          </div>
        </div>

        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Fonctionnalités</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Form</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Protection anti-spam avec honeypot</li>
                <li>• Captcha arithmétique simple</li>
                <li>• Rate limiting par IP</li>
                <li>• Validation des champs</li>
                <li>• Email de confirmation automatique</li>
                <li>• Stockage sécurisé des messages</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Widget</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Intégration Google Calendar</li>
                <li>• Détection automatique des conflits</li>
                <li>• Heures d'ouverture configurables</li>
                <li>• Gestion des exceptions</li>
                <li>• Génération ICS automatique</li>
                <li>• Interface progressive en 3 étapes</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/admin"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Accéder à l'interface d'administration
          </a>
        </div>
      </div>
    </div>
  );
};