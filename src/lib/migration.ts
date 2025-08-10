// Migration utilities for moving from Supabase to SQLite
import { blogService, projectService, contactService } from './database';
import { blogPosts as mockBlogPosts } from '../data/blogPosts';

export interface MigrationResult {
  success: boolean;
  message: string;
  details?: any;
}

export const migrationService = {
  // Migrate mock blog posts to SQLite
  async migrateMockBlogPosts(): Promise<MigrationResult> {
    try {
      console.log('Starting blog posts migration...');
      
      for (const mockPost of mockBlogPosts) {
        const postData = {
          title: mockPost.title,
          slug: mockPost.slug,
          excerpt: mockPost.excerpt,
          content: mockPost.content,
          author: mockPost.author,
          published_at: mockPost.publishedAt,
          updated_at: mockPost.updatedAt,
          featured_image: mockPost.featuredImage,
          tags: mockPost.tags,
          category: mockPost.category,
          read_time: mockPost.readTime,
          featured: mockPost.featured
        };

        const { error } = await blogService.createPost(postData);
        if (error) {
          console.error(`Failed to migrate post: ${mockPost.title}`, error);
        } else {
          console.log(`Migrated post: ${mockPost.title}`);
        }
      }

      return {
        success: true,
        message: `Successfully migrated ${mockBlogPosts.length} blog posts`,
        details: { count: mockBlogPosts.length }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to migrate blog posts',
        details: error
      };
    }
  },

  // Create sample projects
  async createSampleProjects(): Promise<MigrationResult> {
    try {
      console.log('Creating sample projects...');
      
      const sampleProjects = [
        {
          title: 'FinTech Mobile Revolution',
          description: 'Application mobile révolutionnaire pour la gestion financière personnelle avec IA intégrée.',
          long_description: 'Une application mobile complète qui révolutionne la gestion financière personnelle grâce à l\'intelligence artificielle. L\'app analyse automatiquement les habitudes de dépenses, propose des conseils personnalisés et aide les utilisateurs à atteindre leurs objectifs financiers.',
          technologies: ['React Native', 'TypeScript', 'Node.js', 'PostgreSQL', 'TensorFlow'],
          category: 'mobile',
          status: 'completed' as const,
          start_date: '2023-06-01',
          end_date: '2023-12-15',
          client: 'FinTech Startup',
          budget: '30k-50k €',
          images: [
            'https://images.pexels.com/photos/4348401/pexels-photo-4348401.jpeg',
            'https://images.pexels.com/photos/3184298/pexels-photo-3184298.jpeg'
          ],
          featured: true,
          github_url: 'https://github.com/example/fintech-app',
          live_url: 'https://fintech-demo.com'
        },
        {
          title: 'E-commerce Platform Redesign',
          description: 'Refonte complète d\'une plateforme e-commerce avec focus sur l\'expérience utilisateur et les conversions.',
          long_description: 'Refonte complète d\'une plateforme e-commerce existante avec un focus particulier sur l\'amélioration de l\'expérience utilisateur et l\'optimisation des taux de conversion. Le projet incluait une recherche UX approfondie, des tests A/B et une implémentation progressive.',
          technologies: ['React', 'Next.js', 'Tailwind CSS', 'Stripe', 'Vercel'],
          category: 'web',
          status: 'completed' as const,
          start_date: '2023-03-01',
          end_date: '2023-08-30',
          client: 'E-commerce Company',
          budget: '15k-30k €',
          images: [
            'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg',
            'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg'
          ],
          featured: true,
          live_url: 'https://ecommerce-demo.com'
        },
        {
          title: 'Brand Identity & Logo Design',
          description: 'Création d\'une identité visuelle complète pour une startup tech, incluant logo, charte graphique et guidelines.',
          long_description: 'Développement d\'une identité visuelle complète pour une startup technologique émergente. Le projet comprenait la création du logo, de la charte graphique, des guidelines de marque, et l\'application sur tous les supports de communication.',
          technologies: ['Figma', 'Adobe Illustrator', 'Adobe Photoshop', 'Sketch'],
          category: 'branding',
          status: 'completed' as const,
          start_date: '2023-09-01',
          end_date: '2023-11-15',
          client: 'Tech Startup',
          budget: '5k-15k €',
          images: [
            'https://images.pexels.com/photos/4474052/pexels-photo-4474052.jpeg'
          ],
          featured: false
        },
        {
          title: 'Blockchain DApp Interface',
          description: 'Interface utilisateur pour une application décentralisée de trading de NFTs avec wallet integration.',
          long_description: 'Conception et développement de l\'interface utilisateur pour une application décentralisée (DApp) de trading de NFTs. Le projet incluait l\'intégration avec différents wallets crypto, la visualisation des collections NFT, et un système de trading sécurisé.',
          technologies: ['React', 'Web3.js', 'Ethereum', 'IPFS', 'MetaMask'],
          category: 'blockchain',
          status: 'in-progress' as const,
          start_date: '2024-01-01',
          client: 'Crypto Startup',
          budget: '50k+ €',
          images: [
            'https://images.pexels.com/photos/3778876/pexels-photo-3778876.jpeg'
          ],
          featured: true,
          github_url: 'https://github.com/example/nft-dapp'
        }
      ];

      for (const project of sampleProjects) {
        const { error } = await projectService.createProject(project);
        if (error) {
          console.error(`Failed to create project: ${project.title}`, error);
        } else {
          console.log(`Created project: ${project.title}`);
        }
      }

      return {
        success: true,
        message: `Successfully created ${sampleProjects.length} sample projects`,
        details: { count: sampleProjects.length }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create sample projects',
        details: error
      };
    }
  },

  // Run complete migration
  async runCompleteMigration(): Promise<MigrationResult> {
    try {
      console.log('Starting complete migration...');
      
      const results = [];
      
      // Migrate blog posts
      const blogResult = await this.migrateMockBlogPosts();
      results.push(blogResult);
      
      // Create sample projects
      const projectResult = await this.createSampleProjects();
      results.push(projectResult);
      
      const successCount = results.filter(r => r.success).length;
      const totalCount = results.length;
      
      return {
        success: successCount === totalCount,
        message: `Migration completed: ${successCount}/${totalCount} operations successful`,
        details: results
      };
    } catch (error) {
      return {
        success: false,
        message: 'Migration failed',
        details: error
      };
    }
  },

  // Check migration status
  async checkMigrationStatus() {
    try {
      const { data: posts } = await blogService.getAllPosts();
      const { data: projects } = await projectService.getAllProjects();
      const { data: messages } = await contactService.getAllMessages();
      
      return {
        success: true,
        message: 'Migration status retrieved',
        details: {
          blogPosts: posts?.length || 0,
          projects: projects?.length || 0,
          contactMessages: messages?.length || 0
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to check migration status',
        details: error
      };
    }
  }
};