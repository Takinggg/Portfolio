/*
  # Création du système de blog complet

  1. Nouvelles Tables
    - `blog_posts`
      - `id` (uuid, clé primaire)
      - `title` (text, titre de l'article)
      - `slug` (text, URL slug unique)
      - `excerpt` (text, extrait)
      - `content` (text, contenu HTML)
      - `author` (text, auteur)
      - `published_at` (timestamptz, date de publication)
      - `updated_at` (timestamptz, date de mise à jour)
      - `featured_image` (text, URL de l'image)
      - `tags` (text[], tags)
      - `category` (text, catégorie)
      - `read_time` (integer, temps de lecture en minutes)
      - `featured` (boolean, article mis en avant)
      - `created_at` (timestamptz, date de création)

  2. Sécurité
    - Activer RLS sur `blog_posts`
    - Politique de lecture publique pour tous les articles

  3. Index
    - Index sur slug (unique)
    - Index sur published_at pour le tri
    - Index sur category pour le filtrage
    - Index sur featured pour les articles mis en avant
    - Index GIN sur tags pour la recherche

  4. Données de démonstration
    - 5 articles d'exemple avec contenu complet
*/

-- Créer la table blog_posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text NOT NULL,
  author text NOT NULL DEFAULT 'FOULON Maxence',
  published_at timestamptz DEFAULT now(),
  updated_at timestamptz,
  featured_image text,
  tags text[] DEFAULT '{}',
  category text NOT NULL,
  read_time integer DEFAULT 5,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Créer les index
CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_slug_key ON blog_posts (slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts (category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts (featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON blog_posts USING gin (tags);

-- Créer la politique de lecture publique
CREATE POLICY "Blog posts are publicly readable"
  ON blog_posts
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Insérer les données de démonstration
INSERT INTO blog_posts (
  title, 
  slug, 
  excerpt, 
  content, 
  author, 
  published_at, 
  featured_image, 
  tags, 
  category, 
  read_time, 
  featured
) VALUES 
(
  'L''avenir du Design UI/UX : Tendances 2024',
  'avenir-design-ui-ux-tendances-2024',
  'Découvrez les tendances qui façonnent l''avenir du design d''interface et d''expérience utilisateur en 2024. De l''IA générative aux interfaces immersives.',
  '<p>Le monde du design UI/UX évolue à une vitesse fulgurante. En 2024, nous assistons à une révolution silencieuse qui redéfinit notre approche de la création d''interfaces digitales.</p>

<h2>L''Intelligence Artificielle au Service du Design</h2>
<p>L''IA générative transforme radicalement notre processus créatif. Des outils comme Midjourney et DALL-E permettent aux designers de générer des concepts visuels en quelques secondes, libérant ainsi du temps pour se concentrer sur la stratégie et l''expérience utilisateur.</p>

<h2>Le Minimalisme Fonctionnel</h2>
<p>Le design minimaliste évolue vers un "minimalisme fonctionnel" où chaque élément a une raison d''être. Cette approche privilégie la clarté et l''efficacité sans sacrifier l''esthétique.</p>

<h2>Les Interfaces Immersives</h2>
<p>Avec l''essor de la réalité augmentée et virtuelle, les designers doivent repenser leurs approches. Les interfaces 3D et les interactions spatiales deviennent la norme pour les expériences premium.</p>

<h2>Accessibilité et Inclusion</h2>
<p>L''accessibilité n''est plus une option mais une nécessité. Les designs inclusifs qui prennent en compte tous les utilisateurs, quelles que soient leurs capacités, deviennent un standard de l''industrie.</p>

<p>Ces tendances ne sont que le début d''une transformation plus profonde du design digital. En tant que designers, nous devons rester curieux et adaptables pour créer les expériences de demain.</p>',
  'FOULON Maxence',
  '2024-01-15 10:00:00+00',
  'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg',
  ARRAY['UI/UX', 'Tendances', 'IA', 'Design'],
  'Design',
  5,
  true
),
(
  'Design System : Créer une Cohérence Visuelle',
  'design-system-coherence-visuelle',
  'Comment construire un design system robuste qui garantit la cohérence visuelle et améliore l''efficacité des équipes de développement.',
  '<p>Un design system bien conçu est la colonne vertébrale de tout produit digital réussi. Il garantit la cohérence, améliore l''efficacité et facilite la collaboration entre designers et développeurs.</p>

<h2>Les Fondations d''un Design System</h2>
<p>Tout commence par les tokens de design : couleurs, typographie, espacements, et ombres. Ces éléments atomiques forment la base sur laquelle tout le système repose.</p>

<h2>Composants Réutilisables</h2>
<p>La création de composants modulaires permet de construire des interfaces complexes rapidement tout en maintenant la cohérence. Chaque composant doit être documenté avec ses variantes et états.</p>

<h2>Documentation Vivante</h2>
<p>Un design system n''est utile que s''il est bien documenté. Storybook, Figma, ou des outils similaires permettent de créer une documentation interactive et toujours à jour.</p>

<h2>Gouvernance et Évolution</h2>
<p>Un design system doit évoluer avec le produit. Mettre en place une gouvernance claire avec des responsables et des processus de mise à jour est essentiel pour sa pérennité.</p>

<p>Investir dans un design system solide, c''est investir dans l''avenir de votre produit et de votre équipe.</p>',
  'FOULON Maxence',
  '2024-01-08 14:30:00+00',
  'https://images.pexels.com/photos/3184298/pexels-photo-3184298.jpeg',
  ARRAY['Design System', 'Composants', 'Documentation'],
  'Méthodologie',
  4,
  false
),
(
  'UX Research : Comprendre ses Utilisateurs',
  'ux-research-comprendre-utilisateurs',
  'Les méthodes essentielles de recherche utilisateur pour créer des produits qui répondent vraiment aux besoins de votre audience.',
  '<p>La recherche utilisateur est le fondement de tout bon design UX. Sans comprendre ses utilisateurs, on ne peut créer des expériences véritablement utiles et engageantes.</p>

<h2>Méthodes Qualitatives</h2>
<p>Les entretiens utilisateurs, observations et tests d''usabilité permettent de comprendre les motivations profondes et les comportements réels des utilisateurs.</p>

<h2>Méthodes Quantitatives</h2>
<p>Les analytics, A/B tests et enquêtes fournissent des données mesurables pour valider ou invalider nos hypothèses de design.</p>

<h2>Personas et Journey Maps</h2>
<p>Ces outils de synthèse permettent de partager les insights avec toute l''équipe et de maintenir l''utilisateur au centre des décisions.</p>

<h2>Tests Continus</h2>
<p>La recherche ne s''arrête jamais. Mettre en place des processus de test continus permet d''améliorer constamment l''expérience utilisateur.</p>

<p>Investir dans la recherche utilisateur, c''est s''assurer que chaque décision de design est basée sur des faits, pas sur des suppositions.</p>',
  'FOULON Maxence',
  '2024-01-01 09:15:00+00',
  'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg',
  ARRAY['UX Research', 'Utilisateurs', 'Tests'],
  'Research',
  6,
  true
),
(
  'Mobile First : Concevoir pour l''Écran Tactile',
  'mobile-first-ecran-tactile',
  'Pourquoi adopter une approche mobile-first et comment optimiser les interfaces pour les interactions tactiles et les petits écrans.',
  '<p>Avec plus de 60% du trafic web provenant des mobiles, concevoir d''abord pour mobile n''est plus une option mais une nécessité absolue.</p>

<h2>Contraintes et Opportunités</h2>
<p>Les contraintes du mobile (écran réduit, interactions tactiles) nous forcent à nous concentrer sur l''essentiel et à créer des expériences plus focalisées.</p>

<h2>Interactions Tactiles</h2>
<p>Les gestes tactiles offrent de nouvelles possibilités d''interaction : swipe, pinch, long press. Il faut les intégrer naturellement dans l''expérience.</p>

<h2>Performance et Accessibilité</h2>
<p>Sur mobile, chaque milliseconde compte. Optimiser les performances et l''accessibilité devient critique pour l''expérience utilisateur.</p>

<h2>Progressive Enhancement</h2>
<p>Partir du mobile et enrichir progressivement pour les écrans plus grands garantit une expérience optimale sur tous les appareils.</p>

<p>Le mobile-first n''est pas qu''une contrainte technique, c''est une philosophie de design qui nous rend meilleurs.</p>',
  'FOULON Maxence',
  '2023-12-25 16:45:00+00',
  'https://images.pexels.com/photos/4348401/pexels-photo-4348401.jpeg',
  ARRAY['Mobile', 'Responsive', 'Tactile'],
  'Design',
  4,
  false
),
(
  'Couleur et Psychologie : L''Impact Émotionnel',
  'couleur-psychologie-impact-emotionnel',
  'Comment utiliser la psychologie des couleurs pour créer des interfaces qui évoquent les bonnes émotions et guident l''utilisateur.',
  '<p>La couleur est l''un des outils les plus puissants du designer. Elle influence les émotions, guide l''attention et peut faire la différence entre un produit qui convertit et un qui échoue.</p>

<h2>Psychologie des Couleurs</h2>
<p>Chaque couleur évoque des émotions spécifiques : le bleu inspire confiance, le rouge crée l''urgence, le vert rassure. Comprendre ces associations est crucial.</p>

<h2>Contraste et Accessibilité</h2>
<p>Un bon contraste n''est pas qu''une question d''accessibilité, c''est aussi un outil de hiérarchisation visuelle qui guide naturellement l''œil de l''utilisateur.</p>

<h2>Palettes Harmonieuses</h2>
<p>Créer des palettes cohérentes qui fonctionnent ensemble demande de comprendre la théorie des couleurs : complémentaires, analogues, triadiques.</p>

<h2>Couleur et Marque</h2>
<p>La couleur est un élément clé de l''identité de marque. Elle doit refléter les valeurs et la personnalité de l''entreprise tout en servant l''expérience utilisateur.</p>

<p>Maîtriser la couleur, c''est maîtriser un langage universel qui parle directement aux émotions de vos utilisateurs.</p>',
  'FOULON Maxence',
  '2023-12-18 11:20:00+00',
  'https://images.pexels.com/photos/4474052/pexels-photo-4474052.jpeg',
  ARRAY['Couleur', 'Psychologie', 'Branding'],
  'Design',
  5,
  true
)
ON CONFLICT (slug) DO NOTHING;