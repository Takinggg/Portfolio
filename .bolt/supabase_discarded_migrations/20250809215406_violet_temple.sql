/*
  # Création de la table blog_posts

  1. Nouvelles Tables
    - `blog_posts`
      - `id` (uuid, clé primaire)
      - `title` (text, titre de l'article)
      - `slug` (text, URL slug unique)
      - `excerpt` (text, extrait)
      - `content` (text, contenu complet)
      - `author` (text, auteur)
      - `published_at` (timestamptz, date de publication)
      - `updated_at` (timestamptz, date de mise à jour)
      - `featured_image` (text, URL de l'image)
      - `tags` (text[], tags)
      - `category` (text, catégorie)
      - `read_time` (integer, temps de lecture)
      - `featured` (boolean, article mis en avant)
      - `created_at` (timestamptz, date de création)

  2. Sécurité
    - Activer RLS sur la table `blog_posts`
    - Ajouter des politiques pour la lecture publique et la gestion complète

  3. Index
    - Index sur slug pour les recherches rapides
    - Index sur published_at pour le tri par date
    - Index sur category et featured pour les filtres
    - Index GIN sur tags pour les recherches de tags
*/

-- Créer la table si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.blog_posts (
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
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Créer les index s'ils n'existent pas
DO $$
BEGIN
  -- Index sur slug
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'blog_posts' AND indexname = 'idx_blog_posts_slug') THEN
    CREATE INDEX idx_blog_posts_slug ON public.blog_posts (slug);
  END IF;

  -- Index sur published_at
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'blog_posts' AND indexname = 'idx_blog_posts_published_at') THEN
    CREATE INDEX idx_blog_posts_published_at ON public.blog_posts (published_at DESC);
  END IF;

  -- Index sur category
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'blog_posts' AND indexname = 'idx_blog_posts_category') THEN
    CREATE INDEX idx_blog_posts_category ON public.blog_posts (category);
  END IF;

  -- Index sur featured
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'blog_posts' AND indexname = 'idx_blog_posts_featured') THEN
    CREATE INDEX idx_blog_posts_featured ON public.blog_posts (featured);
  END IF;

  -- Index GIN sur tags
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'blog_posts' AND indexname = 'idx_blog_posts_tags') THEN
    CREATE INDEX idx_blog_posts_tags ON public.blog_posts USING gin (tags);
  END IF;
END $$;

-- Créer les politiques de manière idempotente
DO $$
BEGIN
  -- Politique pour la lecture publique
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'blog_posts'
      AND policyname = 'Blog posts are publicly readable'
  ) THEN
    CREATE POLICY "Blog posts are publicly readable"
      ON public.blog_posts
      FOR SELECT
      TO public
      USING (true);
  END IF;

  -- Politique pour toutes les opérations (admin)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'blog_posts'
      AND policyname = 'Allow all operations on blog posts'
  ) THEN
    CREATE POLICY "Allow all operations on blog posts"
      ON public.blog_posts
      FOR ALL
      TO public
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Insérer des données de démonstration si la table est vide
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.blog_posts LIMIT 1) THEN
    INSERT INTO public.blog_posts (
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
      '<p>Le monde du design UI/UX évolue à une vitesse fulgurante. En 2024, nous assistons à une révolution silencieuse qui redéfinit notre approche de la création d''interfaces digitales.</p><h2>L''Intelligence Artificielle au Service du Design</h2><p>L''IA générative transforme radicalement notre processus créatif. Des outils comme Midjourney et DALL-E permettent aux designers de générer des concepts visuels en quelques secondes, libérant ainsi du temps pour se concentrer sur la stratégie et l''expérience utilisateur.</p><h2>Le Minimalisme Fonctionnel</h2><p>Le design minimaliste évolue vers un "minimalisme fonctionnel" où chaque élément a une raison d''être. Cette approche privilégie la clarté et l''efficacité sans sacrifier l''esthétique.</p>',
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
      '<p>Un design system bien conçu est la colonne vertébrale de tout produit digital réussi. Il garantit la cohérence, améliore l''efficacité et facilite la collaboration entre designers et développeurs.</p><h2>Les Fondations d''un Design System</h2><p>Tout commence par les tokens de design : couleurs, typographie, espacements, et ombres. Ces éléments atomiques forment la base sur laquelle tout le système repose.</p>',
      'FOULON Maxence',
      '2024-01-08 10:00:00+00',
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
      '<p>La recherche utilisateur est le fondement de tout bon design UX. Sans comprendre ses utilisateurs, on ne peut créer des expériences véritablement utiles et engageantes.</p><h2>Méthodes Qualitatives</h2><p>Les entretiens utilisateurs, observations et tests d''usabilité permettent de comprendre les motivations profondes et les comportements réels des utilisateurs.</p>',
      'FOULON Maxence',
      '2024-01-01 10:00:00+00',
      'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg',
      ARRAY['UX Research', 'Utilisateurs', 'Tests'],
      'Research',
      6,
      true
    );
  END IF;
END $$;