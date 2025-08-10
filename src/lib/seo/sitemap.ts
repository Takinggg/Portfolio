/**
 * Sitemap Generator
 * Generates XML sitemap for SEO optimization
 */

import { APP_METADATA } from '../../config';

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export class SitemapGenerator {
  private urls: SitemapUrl[] = [];
  private baseUrl: string;

  constructor(baseUrl: string = APP_METADATA.url) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  /**
   * Add a URL to the sitemap
   */
  addUrl(url: SitemapUrl): void {
    // Ensure URL is absolute
    if (!url.loc.startsWith('http')) {
      url.loc = `${this.baseUrl}${url.loc.startsWith('/') ? '' : '/'}${url.loc}`;
    }
    
    this.urls.push(url);
  }

  /**
   * Add multiple URLs to the sitemap
   */
  addUrls(urls: SitemapUrl[]): void {
    urls.forEach(url => this.addUrl(url));
  }

  /**
   * Generate static routes for the portfolio
   */
  generateStaticRoutes(): void {
    const staticRoutes: SitemapUrl[] = [
      {
        loc: '/',
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 1.0
      },
      {
        loc: '/blog',
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.9
      },
      {
        loc: '/projects',
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.9
      }
    ];

    this.addUrls(staticRoutes);
  }

  /**
   * Add blog posts to sitemap
   */
  addBlogPosts(posts: Array<{ slug: string; updatedAt?: string; publishedAt?: string }>): void {
    const blogUrls: SitemapUrl[] = posts.map(post => ({
      loc: `/blog/${post.slug}`,
      lastmod: post.updatedAt || post.publishedAt || new Date().toISOString(),
      changefreq: 'monthly' as const,
      priority: 0.7
    }));

    this.addUrls(blogUrls);
  }

  /**
   * Add projects to sitemap
   */
  addProjects(projects: Array<{ id: string; updatedAt?: string; createdAt?: string }>): void {
    const projectUrls: SitemapUrl[] = projects.map(project => ({
      loc: `/project/${project.id}`,
      lastmod: project.updatedAt || project.createdAt || new Date().toISOString(),
      changefreq: 'monthly' as const,
      priority: 0.8
    }));

    this.addUrls(projectUrls);
  }

  /**
   * Generate XML sitemap
   */
  generateXML(): string {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
    const sitemapOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    const sitemapClose = '</urlset>';

    const urlsXML = this.urls.map(url => {
      let urlXML = `  <url>\n    <loc>${this.escapeXML(url.loc)}</loc>`;
      
      if (url.lastmod) {
        urlXML += `\n    <lastmod>${url.lastmod}</lastmod>`;
      }
      
      if (url.changefreq) {
        urlXML += `\n    <changefreq>${url.changefreq}</changefreq>`;
      }
      
      if (url.priority !== undefined) {
        urlXML += `\n    <priority>${url.priority.toFixed(1)}</priority>`;
      }
      
      urlXML += '\n  </url>';
      return urlXML;
    }).join('\n');

    return `${xmlHeader}\n${sitemapOpen}\n${urlsXML}\n${sitemapClose}`;
  }

  /**
   * Escape XML special characters
   */
  private escapeXML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Clear all URLs
   */
  clear(): void {
    this.urls = [];
  }

  /**
   * Get all URLs
   */
  getUrls(): SitemapUrl[] {
    return [...this.urls];
  }
}

/**
 * Generate a complete sitemap for the portfolio
 */
export const generatePortfolioSitemap = async (): Promise<string> => {
  const sitemap = new SitemapGenerator();
  
  // Add static routes
  sitemap.generateStaticRoutes();
  
  // In a real application, you would fetch these from your API/database
  // For now, we'll add some example entries
  
  // Example blog posts (replace with actual data)
  sitemap.addBlogPosts([
    {
      slug: 'react-performance-tips',
      publishedAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T15:30:00Z'
    },
    {
      slug: 'typescript-best-practices',
      publishedAt: '2024-01-10T09:00:00Z'
    }
  ]);
  
  // Example projects (replace with actual data)
  sitemap.addProjects([
    {
      id: 'ecommerce-platform',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T12:00:00Z'
    },
    {
      id: 'mobile-app-design',
      createdAt: '2023-12-15T00:00:00Z'
    }
  ]);
  
  return sitemap.generateXML();
};

export default SitemapGenerator;