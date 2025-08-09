import { BlogPost as SupabaseBlogPost } from '../lib/supabase';

// Legacy interface for backward compatibility
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  featuredImage: string;
  tags: string[];
  category: string;
  readTime: number;
  featured: boolean;
}

// Convert Supabase blog post to legacy format
export const convertSupabaseBlogPost = (post: SupabaseBlogPost): BlogPost => ({
  id: post.id,
  title: post.title,
  slug: post.slug,
  excerpt: post.excerpt || '',
  content: post.content,
  author: post.author,
  publishedAt: post.published_at,
  updatedAt: post.updated_at || undefined,
  featuredImage: post.featured_image || '',
  tags: post.tags || [],
  category: post.category,
  readTime: post.read_time || 5,
  featured: post.featured || false
});

// Legacy mock data - kept for fallback
export const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'L\'avenir du Design UI/UX : Tendances 2024',
    slug: 'avenir-design-ui-ux-tendances-2024',
    excerpt: 'Découvrez les tendances qui façonnent l\'avenir du design d\'interface et d\'expérience utilisateur en 2024. De l\'IA générative aux interfaces immersives.',
    content: `
      <p>Le monde du design UI/UX évolue à une vitesse fulgurante. En 2024, nous assistons à une révolution silencieuse qui redéfinit notre approche de la création d'interfaces digitales.</p>
      
      <h2>L'Intelligence Artificielle au Service du Design</h2>
      <p>L'IA générative transforme radicalement notre processus créatif. Des outils comme Midjourney et DALL-E permettent aux designers de générer des concepts visuels en quelques secondes, libérant ainsi du temps pour se concentrer sur la stratégie et l'expérience utilisateur.</p>
      
      <h2>Le Minimalisme Fonctionnel</h2>
      <p>Le design minimaliste évolue vers un "minimalisme fonctionnel" où chaque élément a une raison d'être. Cette approche privilégie la clarté et l'efficacité sans sacrifier l'esthétique.</p>
      
      <h2>Les Interfaces Immersives</h2>
      <p>Avec l'essor de la réalité augmentée et virtuelle, les designers doivent repenser leurs approches. Les interfaces 3D et les interactions spatiales deviennent la norme pour les expériences premium.</p>
      
      <h2>Accessibilité et Inclusion</h2>
      <p>L'accessibilité n'est plus une option mais une nécessité. Les designs inclusifs qui prennent en compte tous les utilisateurs, quelles que soient leurs capacités, deviennent un standard de l'industrie.</p>
      
      <p>Ces tendances ne sont que le début d'une transformation plus profonde du design digital. En tant que designers, nous devons rester curieux et adaptables pour créer les expériences de demain.</p>
    `,
    author: 'FOULON Maxence',
    publishedAt: '2024-01-15',
    featuredImage: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg',
    tags: ['UI/UX', 'Tendances', 'IA', 'Design'],
    category: 'Design',
    readTime: 5,
    featured: true
  },
  {
    id: '2',
    title: 'Design System : Créer une Cohérence Visuelle',
    slug: 'design-system-coherence-visuelle',
    excerpt: 'Comment construire un design system robuste qui garantit la cohérence visuelle et améliore l\'efficacité des équipes de développement.',
    content: `
      <p>Un design system bien conçu est la colonne vertébrale de tout produit digital réussi. Il garantit la cohérence, améliore l'efficacité et facilite la collaboration entre designers et développeurs.</p>
      
      <h2>Les Fondations d'un Design System</h2>
      <p>Tout commence par les tokens de design : couleurs, typographie, espacements, et ombres. Ces éléments atomiques forment la base sur laquelle tout le système repose.</p>
      
      <h2>Composants Réutilisables</h2>
      <p>La création de composants modulaires permet de construire des interfaces complexes rapidement tout en maintenant la cohérence. Chaque composant doit être documenté avec ses variantes et états.</p>
      
      <h2>Documentation Vivante</h2>
      <p>Un design system n'est utile que s'il est bien documenté. Storybook, Figma, ou des outils similaires permettent de créer une documentation interactive et toujours à jour.</p>
      
      <h2>Gouvernance et Évolution</h2>
      <p>Un design system doit évoluer avec le produit. Mettre en place une gouvernance claire avec des responsables et des processus de mise à jour est essentiel pour sa pérennité.</p>
      
      <p>Investir dans un design system solide, c'est investir dans l'avenir de votre produit et de votre équipe.</p>
    `,
    author: 'FOULON Maxence',
    publishedAt: '2024-01-08',
    featuredImage: 'https://images.pexels.com/photos/3184298/pexels-photo-3184298.jpeg',
    tags: ['Design System', 'Composants', 'Documentation'],
    category: 'Méthodologie',
    readTime: 4,
    featured: false
  },
  {
    id: '3',
    title: 'UX Research : Comprendre ses Utilisateurs',
    slug: 'ux-research-comprendre-utilisateurs',
    excerpt: 'Les méthodes essentielles de recherche utilisateur pour créer des produits qui répondent vraiment aux besoins de votre audience.',
    content: `
      <p>La recherche utilisateur est le fondement de tout bon design UX. Sans comprendre ses utilisateurs, on ne peut créer des expériences véritablement utiles et engageantes.</p>
      
      <h2>Méthodes Qualitatives</h2>
      <p>Les entretiens utilisateurs, observations et tests d'usabilité permettent de comprendre les motivations profondes et les comportements réels des utilisateurs.</p>
      
      <h2>Méthodes Quantitatives</h2>
      <p>Les analytics, A/B tests et enquêtes fournissent des données mesurables pour valider ou invalider nos hypothèses de design.</p>
      
      <h2>Personas et Journey Maps</h2>
      <p>Ces outils de synthèse permettent de partager les insights avec toute l'équipe et de maintenir l'utilisateur au centre des décisions.</p>
      
      <h2>Tests Continus</h2>
      <p>La recherche ne s'arrête jamais. Mettre en place des processus de test continus permet d'améliorer constamment l'expérience utilisateur.</p>
      
      <p>Investir dans la recherche utilisateur, c'est s'assurer que chaque décision de design est basée sur des faits, pas sur des suppositions.</p>
    `,
    author: 'FOULON Maxence',
    publishedAt: '2024-01-01',
    featuredImage: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg',
    tags: ['UX Research', 'Utilisateurs', 'Tests'],
    category: 'Research',
    readTime: 6,
    featured: true
  },
  {
    id: '4',
    title: 'Mobile First : Concevoir pour l\'Écran Tactile',
    slug: 'mobile-first-ecran-tactile',
    excerpt: 'Pourquoi adopter une approche mobile-first et comment optimiser les interfaces pour les interactions tactiles et les petits écrans.',
    content: `
      <p>Avec plus de 60% du trafic web provenant des mobiles, concevoir d'abord pour mobile n'est plus une option mais une nécessité absolue.</p>
      
      <h2>Contraintes et Opportunités</h2>
      <p>Les contraintes du mobile (écran réduit, interactions tactiles) nous forcent à nous concentrer sur l'essentiel et à créer des expériences plus focalisées.</p>
      
      <h2>Interactions Tactiles</h2>
      <p>Les gestes tactiles offrent de nouvelles possibilités d'interaction : swipe, pinch, long press. Il faut les intégrer naturellement dans l'expérience.</p>
      
      <h2>Performance et Accessibilité</h2>
      <p>Sur mobile, chaque milliseconde compte. Optimiser les performances et l'accessibilité devient critique pour l'expérience utilisateur.</p>
      
      <h2>Progressive Enhancement</h2>
      <p>Partir du mobile et enrichir progressivement pour les écrans plus grands garantit une expérience optimale sur tous les appareils.</p>
      
      <p>Le mobile-first n'est pas qu'une contrainte technique, c'est une philosophie de design qui nous rend meilleurs.</p>
    `,
    author: 'FOULON Maxence',
    publishedAt: '2023-12-25',
    featuredImage: 'https://images.pexels.com/photos/4348401/pexels-photo-4348401.jpeg',
    tags: ['Mobile', 'Responsive', 'Tactile'],
    category: 'Design',
    readTime: 4,
    featured: false
  },
  {
    id: '5',
    title: 'Couleur et Psychologie : L\'Impact Émotionnel',
    slug: 'couleur-psychologie-impact-emotionnel',
    excerpt: 'Comment utiliser la psychologie des couleurs pour créer des interfaces qui évoquent les bonnes émotions et guident l\'utilisateur.',
    content: `
      <p>La couleur est l'un des outils les plus puissants du designer. Elle influence les émotions, guide l'attention et peut faire la différence entre un produit qui convertit et un qui échoue.</p>
      
      <h2>Psychologie des Couleurs</h2>
      <p>Chaque couleur évoque des émotions spécifiques : le bleu inspire confiance, le rouge crée l'urgence, le vert rassure. Comprendre ces associations est crucial.</p>
      
      <h2>Contraste et Accessibilité</h2>
      <p>Un bon contraste n'est pas qu'une question d'accessibilité, c'est aussi un outil de hiérarchisation visuelle qui guide naturellement l'œil de l'utilisateur.</p>
      
      <h2>Palettes Harmonieuses</h2>
      <p>Créer des palettes cohérentes qui fonctionnent ensemble demande de comprendre la théorie des couleurs : complémentaires, analogues, triadiques.</p>
      
      <h2>Couleur et Marque</h2>
      <p>La couleur est un élément clé de l'identité de marque. Elle doit refléter les valeurs et la personnalité de l'entreprise tout en servant l'expérience utilisateur.</p>
      
      <p>Maîtriser la couleur, c'est maîtriser un langage universel qui parle directement aux émotions de vos utilisateurs.</p>
    `,
    author: 'FOULON Maxence',
    publishedAt: '2023-12-18',
    featuredImage: 'https://images.pexels.com/photos/4474052/pexels-photo-4474052.jpeg',
    tags: ['Couleur', 'Psychologie', 'Branding'],
    category: 'Design',
    readTime: 5,
    featured: false
  }
];

export const getPostBySlug = (slug: string): BlogPost | undefined => {
  return blogPosts.find(post => post.slug === slug);
};

export const getFeaturedPosts = (): BlogPost[] => {
  return blogPosts.filter(post => post.featured).slice(0, 3);
};

export const getPostsByCategory = (category: string): BlogPost[] => {
  return blogPosts.filter(post => post.category === category);
};

export const getAllCategories = (): string[] => {
  return [...new Set(blogPosts.map(post => post.category))];
};

export const getAllTags = (): string[] => {
  return [...new Set(blogPosts.flatMap(post => post.tags))];
};

export const searchPosts = (query: string): BlogPost[] => {
  const lowercaseQuery = query.toLowerCase();
  return blogPosts.filter(post => 
    post.title.toLowerCase().includes(lowercaseQuery) ||
    post.excerpt.toLowerCase().includes(lowercaseQuery) ||
    post.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};