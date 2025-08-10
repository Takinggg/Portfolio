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

---

© 2024 FOULON Maxence - Conçu avec ♥ et beaucoup de café
