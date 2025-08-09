/*
  # Create contact messages table

  1. New Tables
    - `contact_messages`
      - `id` (uuid, primary key)
      - `name` (text, sender name)
      - `email` (text, sender email)
      - `subject` (text, message subject)
      - `message` (text, message content)
      - `budget` (text, optional budget range)
      - `timeline` (text, optional timeline)
      - `is_read` (boolean, read status)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `contact_messages` table
    - Add policy for public to insert messages
    - Add policy for authenticated users to read/update messages

  3. Indexes
    - Index on created_at for sorting
    - Index on is_read for filtering
*/

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  budget text,
  timeline text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow public to insert messages
CREATE POLICY "Anyone can submit contact messages"
  ON contact_messages
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow authenticated users (admin) to read all messages
CREATE POLICY "Authenticated users can read all messages"
  ON contact_messages
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users (admin) to update messages
CREATE POLICY "Authenticated users can update messages"
  ON contact_messages
  FOR UPDATE
  TO authenticated
  USING (true);

-- Allow authenticated users (admin) to delete messages
CREATE POLICY "Authenticated users can delete messages"
  ON contact_messages
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at 
  ON contact_messages (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_messages_is_read 
  ON contact_messages (is_read);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_contact_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contact_messages_updated_at
  BEFORE UPDATE ON contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_messages_updated_at();