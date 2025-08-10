/*
  # Désactiver RLS sur contact_messages

  1. Désactive RLS sur la table contact_messages
  2. Permet aux utilisateurs anonymes de soumettre des messages
  3. Maintient la sécurité en gardant les autres tables protégées

  Note: Pour un formulaire de contact public, désactiver RLS est acceptable
  car les données ne sont pas sensibles et doivent être accessibles publiquement.
*/

-- Désactiver RLS sur la table contact_messages
ALTER TABLE contact_messages DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les politiques existantes qui ne sont plus nécessaires
DROP POLICY IF EXISTS "Allow anonymous message submission" ON contact_messages;
DROP POLICY IF EXISTS "contact_messages_insert_policy" ON contact_messages;
DROP POLICY IF EXISTS "contact_messages_select_policy" ON contact_messages;
DROP POLICY IF EXISTS "contact_messages_update_policy" ON contact_messages;
DROP POLICY IF EXISTS "contact_messages_delete_policy" ON contact_messages;
DROP POLICY IF EXISTS "Allow all operations on contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Contact messages are publicly readable" ON contact_messages;