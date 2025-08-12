# Portfolio - FOULON Maxence

Portfolio professionnel de Maxence FOULON, Designer UI/UX spécialisé dans la création d'interfaces SaaS modernes et accessibles.

## 🎨 Accessibilité & Design System

Ce portfolio a été conçu selon les standards WCAG 2.1 AA pour garantir une expérience utilisateur inclusive.

### 🎯 Standards d'Accessibilité

- **Contraste de couleurs** : 
  - Texte normal : ≥ 4.5:1 
  - Texte large (≥24px ou 18px bold) : ≥ 3:1
  - Texte principal utilise `text-strong` (#0F172A) pour un ratio de contraste de 21:1

- **Tokens de couleurs** :
  ```css
  text-strong: #0F172A    /* Titres principaux - 21:1 ratio */
  text-default: #1E293B   /* Texte standard - 16.7:1 ratio */
  text-soft: #334155      /* Texte secondaire - 9.8:1 ratio */
  text-muted: #64748B     /* Texte discret - 4.6:1 ratio */
  ```

- **États de focus** : Anneaux visibles avec `focus-visible:ring-primary-300`
- **Navigation clavier** : Tous les éléments interactifs sont accessibles au clavier
- **Hiérarchie sémantique** : HTML5 sémantique avec landmarks et headings appropriés

### 🧪 Tests d'Accessibilité

```bash
# Audit manuel avec Lighthouse
npm run audit:accessibility

# Construction et validation
npm run build
```

**Objectif Lighthouse** : Score ≥ 95 en accessibilité

## 🚀 Installation

```bash
# Installation des dépendances
npm install

# Développement
npm run dev

# Construction
npm run build
```

## 🎨 Design System

Le portfolio utilise un design system unifié basé sur des tokens d'accessibilité :

- **Couleurs** : Palette complète WCAG-compliant
- **Typographie** : Hiérarchie claire avec contraste optimal
- **Composants** : Cards, Badges, Buttons avec états focus appropriés
- **Animations** : Respectueuses des préférences utilisateur (prefers-reduced-motion)

## 📱 Technologies

- **Frontend** : React 18 + TypeScript + Vite
- **Styling** : Tailwind CSS avec design tokens personnalisés
- **Animations** : Framer Motion
- **Accessibilité** : WCAG 2.1 AA compliant
- **Backend** : Node.js + Express + SQLite
- **Email** : Multi-provider notification system (SMTP, Resend, Postmark)

## 📧 Email Notification System

Le système de notification email intégré prend en charge la gestion complète du cycle de vie des réservations.

### 🔧 Configuration

Copiez `.env.example` vers `.env` et configurez :

```bash
# Provider email (smtp|resend|postmark)
EMAIL_PROVIDER=smtp
ENABLE_NOTIFICATIONS=true
ENABLE_REMINDERS=true
REMINDER_OFFSETS=24h,2h

# Configuration émetteur
FROM_EMAIL=noreply@maxence.design
FROM_NAME=Maxence FOULON

# SMTP (si EMAIL_PROVIDER=smtp)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Notifications propriétaire
OWNER_NOTIFY=true
OWNER_EMAIL=contact@maxence.design
```

### ✉️ Types de Notifications

- **Confirmation** : Email automatique à la création d'une réservation
- **Reprogrammation** : Notification avec ancienne et nouvelle heure
- **Annulation** : Email d'annulation avec raison optionnelle
- **Rappels** : Notifications automatiques configurables (défaut: 24h et 2h avant)

### 🎛️ Interface Admin

Accédez à l'interface d'administration via `/admin` :

- **Tableau de bord** : Statistiques des notifications envoyées/échouées
- **Test d'email** : Envoi de test avec limitation de débit
- **Traitement manuel** : Déclenchement des rappels en attente
- **Configuration** : Vue d'ensemble des paramètres actuels

### 🔄 Providers Supportés

1. **SMTP** : Compatible avec Gmail, Outlook, SendGrid SMTP
2. **Resend** : Service moderne avec API REST
3. **Postmark** : Spécialisé dans les emails transactionnels
4. **Log-only** : Mode développement (journalisation console)

### 📅 Pièces Jointes ICS

Tous les emails de réservation incluent automatiquement :
- Fichier `.ics` pour import dans calendriers
- Liens "Ajouter à Google Calendar" et Outlook
- Format RFC 5545 compliant

---

© 2024 FOULON Maxence - Conçu avec ♥ et beaucoup de café
