/*
  # Seed sample data for blog posts and projects

  This migration adds sample data to help you get started with your portfolio.
  You can modify or remove this data as needed.
*/

-- Insert sample blog posts
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
  '<p>Le monde du design UI/UX évolue à une vitesse fulgurante. En 2024, nous assistons à une révolution silencieuse qui redéfinit notre approche de la création d''interfaces digitales.</p><h2>L''Intelligence Artificielle au Service du Design</h2><p>L''IA générative transforme radicalement notre processus créatif. Des outils comme Midjourney et DALL-E permettent aux designers de générer des concepts visuels en quelques secondes, libérant ainsi du temps pour se concentrer sur la stratégie et l''expérience utilisateur.</p><h2>Le Minimalisme Fonctionnel</h2><p>Le design minimaliste évolue vers un "minimalisme fonctionnel" où chaque élément a une raison d''être. Cette approche privilégie la clarté et l''efficacité sans sacrifier l''esthétique.</p>',
  'FOULON Maxence',
  '2024-01-15T10:00:00Z',
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
  '2024-01-08T14:30:00Z',
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
  '2024-01-01T09:15:00Z',
  'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg',
  ARRAY['UX Research', 'Utilisateurs', 'Tests'],
  'Research',
  6,
  true
);

-- Insert sample projects
INSERT INTO projects (
  title,
  description,
  long_description,
  technologies,
  category,
  status,
  start_date,
  end_date,
  client,
  budget,
  images,
  featured,
  github_url,
  live_url
) VALUES 
(
  'FinTech Mobile Revolution',
  'Application bancaire mobile révolutionnaire avec IA intégrée',
  'Révolution complète de l''expérience bancaire mobile avec intelligence artificielle intégrée, interface ultra-intuitive et sécurité quantique. Cette application redéfinit les standards du secteur financier.',
  ARRAY['React Native', 'TypeScript', 'Node.js', 'MongoDB', 'AI/ML', 'Blockchain'],
  'mobile',
  'completed',
  '2023-06-01',
  '2024-01-15',
  'FinTech Corp',
  '50k-100k €',
  ARRAY['https://images.pexels.com/photos/4348401/pexels-photo-4348401.jpeg'],
  true,
  'https://github.com/example/fintech-app',
  'https://fintech-demo.example.com'
),
(
  'Neural Analytics Dashboard',
  'Dashboard d''analyse prédictive avec visualisations temps réel',
  'Plateforme d''analyse avancée utilisant l''intelligence artificielle pour fournir des insights prédictifs en temps réel. Interface moderne avec visualisations de données interactives et tableaux de bord personnalisables.',
  ARRAY['React', 'D3.js', 'Python', 'TensorFlow', 'PostgreSQL', 'Docker'],
  'web',
  'completed',
  '2023-09-01',
  '2024-02-28',
  'Analytics Inc',
  '30k-50k €',
  ARRAY['https://images.pexels.com/photos/590020/pexels-photo-590020.jpg'],
  false,
  'https://github.com/example/analytics-dashboard',
  'https://analytics-demo.example.com'
),
(
  'Quantum Banking Experience',
  'Néobanque avec cryptographie quantique et biométrie avancée',
  'Refonte complète d''une néobanque intégrant les dernières technologies de cryptographie quantique et de biométrie avancée. Sécurité maximale avec une expérience utilisateur exceptionnelle.',
  ARRAY['Vue.js', 'Nuxt.js', 'Quantum Cryptography', 'Biometric API', 'Microservices'],
  'mobile',
  'in-progress',
  '2024-01-01',
  NULL,
  'Quantum Bank',
  '100k+ €',
  ARRAY['https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg'],
  true,
  NULL,
  NULL
);