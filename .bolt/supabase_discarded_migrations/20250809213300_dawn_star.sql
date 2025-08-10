/*
  # Création de la table blog_posts

  1. Nouvelle table
    - `blog_posts`
      - `id` (uuid, clé primaire)
      - `title` (text, titre de l'article)
      - `slug` (text, unique, URL-friendly)
      - `excerpt` (text, résumé)
      - `content` (text, contenu complet)
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
    - Activer RLS sur la table `blog_posts`
    - Ajouter des politiques pour la lecture publique
    - Ajouter des politiques pour la gestion admin

  3. Index
    - Index sur slug pour les recherches rapides
    - Index sur published_at pour l'ordre chronologique
    - Index sur category pour le filtrage
    - Index sur featured pour les articles mis en avant
    - Index sur tags pour la recherche par tags
*/

-- Créer la table blog_posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text NOT NULL,
  author text NOT NULL DEFAULT 'FOULON Maxence',
  published_at timestamptz NOT NULL DEFAULT now(),
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

-- Politique pour la lecture publique
CREATE POLICY "Blog posts are publicly readable"
  ON blog_posts
  FOR SELECT
  TO public
  USING (true);

-- Politique pour toutes les opérations (pour l'admin)
CREATE POLICY "Allow all operations on blog posts"
  ON blog_posts
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Créer les index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts (slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts (category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts (featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON blog_posts USING gin (tags);

-- Insérer quelques articles de démonstration
INSERT INTO blog_posts (title, slug, excerpt, content, category, tags, featured_image, featured, read_time) VALUES
(
  'L''avenir du Design UI/UX : Tendances 2024',
  'avenir-design-ui-ux-tendances-2024',
  'Découvrez les tendances qui façonnent l''avenir du design d''interface et d''expérience utilisateur en 2024. De l''IA générative aux interfaces immersives.',
  '<p>Le monde du design UI/UX évolue à une vitesse fulgurante. En 2024, nous assistons à une révolution silencieuse qui redéfinit notre approche de la création d''interfaces digitales.</p><h2>L''Intelligence Artificielle au Service du Design</h2><p>L''IA générative transforme radicalement notre processus créatif. Des outils comme Midjourney et DALL-E permettent aux designers de générer des concepts visuels en quelques secondes, libérant ainsi du temps pour se concentrer sur la stratégie et l''expérience utilisateur.</p><h2>Le Minimalisme Fonctionnel</h2><p>Le design minimaliste évolue vers un "minimalisme fonctionnel" où chaque élément a une raison d''être. Cette approche privilégie la clarté et l''efficacité sans sacrifier l''esthétique.</p>',
  'Design',
  ARRAY['UI/UX', 'Tendances', 'IA', 'Design'],
  'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg',
  true,
  5
),
(
  'Design System : Créer une Cohérence Visuelle',
  'design-system-coherence-visuelle',
  'Comment construire un design system robuste qui garantit la cohérence visuelle et améliore l''efficacité des équipes de développement.',
  '<p>Un design system bien conçu est la colonne vertébrale de tout produit digital réussi. Il garantit la cohérence, améliore l''efficacité et facilite la collaboration entre designers et développeurs.</p><h2>Les Fondations d''un Design System</h2><p>Tout commence par les tokens de design : couleurs, typographie, espacements, et ombres. Ces éléments atomiques forment la base sur laquelle tout le système repose.</p>',
  'Méthodologie',
  ARRAY['Design System', 'Composants', 'Documentation'],
  'https://images.pexels.com/photos/3184298/pexels-photo-3184298.jpeg',
  false,
  4
),
(
  'UX Research : Comprendre ses Utilisateurs',
  'ux-research-comprendre-utilisateurs',
  'Les méthodes essentielles de recherche utilisateur pour créer des produits qui répondent vraiment aux besoins de votre audience.',
  '<p>La recherche utilisateur est le fondement de tout bon design UX. Sans comprendre ses utilisateurs, on ne peut créer des expériences véritablement utiles et engageantes.</p><h2>Méthodes Qualitatives</h2><p>Les entretiens utilisateurs, observations et tests d''usabilité permettent de comprendre les motivations profondes et les comportements réels des utilisateurs.</p>',
  'Research',
  ARRAY['UX Research', 'Utilisateurs', 'Tests'],
  'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg',
  true,
  6
);