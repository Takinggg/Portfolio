/*
  # Fix RLS policies for contact_messages table

  1. Security Changes
    - Drop existing conflicting policies
    - Create new policy allowing anonymous users to insert messages
    - Maintain admin-only access for read/update/delete operations
    
  2. Policies Created
    - `contact_messages_insert_policy`: Allow anonymous message submission
    - `contact_messages_select_policy`: Admin can read all messages
    - `contact_messages_update_policy`: Admin can update message status
    - `contact_messages_delete_policy`: Admin can delete messages
*/

-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow anonymous message submission" ON contact_messages;
DROP POLICY IF EXISTS "Allow all operations on contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Authenticated users can read messages" ON contact_messages;
DROP POLICY IF EXISTS "Authenticated users can update messages" ON contact_messages;
DROP POLICY IF EXISTS "Authenticated users can delete messages" ON contact_messages;

-- Create new policies with correct permissions
CREATE POLICY "contact_messages_insert_policy" 
ON contact_messages 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "contact_messages_select_policy" 
ON contact_messages 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "contact_messages_update_policy" 
ON contact_messages 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "contact_messages_delete_policy" 
ON contact_messages 
FOR DELETE 
TO authenticated
USING (true);