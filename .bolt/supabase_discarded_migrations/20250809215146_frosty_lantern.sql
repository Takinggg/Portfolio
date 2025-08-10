@@ .. @@
 ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-CREATE POLICY "Blog posts are publicly readable"
-  ON blog_posts
-  FOR SELECT
-  TO public
-  USING (true);
-
-CREATE POLICY "Allow all operations on blog posts"
-  ON blog_posts
-  FOR ALL
-  TO public
-  USING (true)
-  WITH CHECK (true);
+DO $$
+BEGIN
+  IF NOT EXISTS (
+    SELECT 1 FROM pg_policies 
+    WHERE tablename = 'blog_posts' 
+    AND policyname = 'Blog posts are publicly readable'
+  ) THEN
+    CREATE POLICY "Blog posts are publicly readable"
+      ON blog_posts
+      FOR SELECT
+      TO public
+      USING (true);
+  END IF;
+  
+  IF NOT EXISTS (
+    SELECT 1 FROM pg_policies 
+    WHERE tablename = 'blog_posts' 
+    AND policyname = 'Allow all operations on blog posts'
+  ) THEN
+    CREATE POLICY "Allow all operations on blog posts"
+      ON blog_posts
+      FOR ALL
+      TO public
+      USING (true)
+      WITH CHECK (true);
+  END IF;
+END $$;