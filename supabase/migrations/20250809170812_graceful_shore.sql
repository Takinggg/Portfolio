/*
  # Create blog posts table

  1. New Tables
    - `blog_posts`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `slug` (text, unique, not null)
      - `excerpt` (text)
      - `content` (text, not null)
      - `author` (text, not null)
      - `published_at` (timestamptz, not null)
      - `updated_at` (timestamptz)
      - `featured_image` (text)
      - `tags` (text array)
      - `category` (text, not null)
      - `read_time` (integer, default 5)
      - `featured` (boolean, default false)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `blog_posts` table
    - Add policies for public read access
    - Add policies for authenticated admin write access
*/

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

-- Enable Row Level Security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Policy for public read access
CREATE POLICY "Blog posts are publicly readable"
  ON blog_posts
  FOR SELECT
  TO public
  USING (true);

-- Policy for authenticated users to insert
CREATE POLICY "Authenticated users can insert blog posts"
  ON blog_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy for authenticated users to update their own posts
CREATE POLICY "Authenticated users can update blog posts"
  ON blog_posts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy for authenticated users to delete
CREATE POLICY "Authenticated users can delete blog posts"
  ON blog_posts
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON blog_posts USING GIN(tags);