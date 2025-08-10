/**
 * SEO Head Component
 * Provides comprehensive SEO optimization with meta tags, Open Graph, Twitter Cards, and Schema.org
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { APP_METADATA } from '../../config';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  noIndex?: boolean;
  canonical?: string;
}

const SEOHead: React.FC<SEOProps> = ({
  title,
  description = APP_METADATA.description,
  keywords = APP_METADATA.keywords,
  image = APP_METADATA.image,
  url = APP_METADATA.url,
  type = 'website',
  author = APP_METADATA.author,
  publishedTime,
  modifiedTime,
  section,
  tags,
  noIndex = false,
  canonical,
}) => {
  const fullTitle = title ? `${title} | ${APP_METADATA.title}` : APP_METADATA.title;
  const fullUrl = url.startsWith('http') ? url : `${APP_METADATA.url}${url}`;
  const fullImage = image.startsWith('http') ? image : `${APP_METADATA.url}${image}`;

  // Generate structured data for Schema.org
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type === 'article' ? 'Article' : type === 'profile' ? 'Person' : 'WebSite',
    name: fullTitle,
    description,
    url: fullUrl,
    image: fullImage,
    author: {
      '@type': 'Person',
      name: author,
    },
    ...(type === 'article' && {
      headline: title,
      datePublished: publishedTime,
      dateModified: modifiedTime || publishedTime,
      articleSection: section,
      keywords: tags?.join(', '),
    }),
    ...(type === 'website' && {
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${APP_METADATA.url}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    }),
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={author} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonical || fullUrl} />
      
      {/* Robots Meta */}
      <meta name="robots" content={noIndex ? 'noindex,nofollow' : 'index,follow'} />
      <meta name="googlebot" content={noIndex ? 'noindex,nofollow' : 'index,follow'} />
      
      {/* Language and Region */}
      <meta name="language" content="fr-FR" />
      <meta name="geo.region" content="FR" />
      <meta name="geo.country" content="France" />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:alt" content={`Image pour ${title || APP_METADATA.title}`} />
      <meta property="og:locale" content="fr_FR" />
      <meta property="og:site_name" content={APP_METADATA.title} />
      
      {/* Article specific Open Graph */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && section && (
        <meta property="article:section" content={section} />
      )}
      {type === 'article' && tags && tags.map(tag => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:image:alt" content={`Image pour ${title || APP_METADATA.title}`} />
      
      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#8B5CF6" />
      <meta name="msapplication-TileColor" content="#8B5CF6" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default SEOHead;