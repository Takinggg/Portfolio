/*
  # Fix RLS policies for contact messages

  1. Security Updates
    - Update INSERT policy to allow anonymous users to submit messages
    - Ensure proper permissions for public message submission
    - Maintain security for admin operations

  2. Changes Made
    - Modified INSERT policy to work with anon role
    - Simplified policy conditions for message submission
    - Kept admin-only policies for management operations
*/

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Anyone can submit contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Authenticated users can read all messages" ON contact_messages;
DROP POLICY IF EXISTS "Authenticated users can update messages" ON contact_messages;
DROP POLICY IF EXISTS "Authenticated users can delete messages" ON contact_messages;

-- Allow anonymous users to insert contact messages
CREATE POLICY "Allow anonymous message submission"
  ON contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow authenticated users to read all messages (admin panel)
CREATE POLICY "Authenticated users can read messages"
  ON contact_messages
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to update message status (mark as read/unread)
CREATE POLICY "Authenticated users can update messages"
  ON contact_messages
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete messages (admin cleanup)
CREATE POLICY "Authenticated users can delete messages"
  ON contact_messages
  FOR DELETE
  TO authenticated
  USING (true);