/*
  # Fix INSERT policy for trends table

  1. Changes
    - Drop existing INSERT policy
    - Create new policy that explicitly allows anon and authenticated roles
    - This ensures the Supabase client with anon key can insert trends

  2. Security
    - Allows necessary inserts from the application
    - Maintains RLS protection for the table
*/

-- Drop existing policy
DROP POLICY IF EXISTS "Anyone can create trends" ON trends;

-- Create new policy with explicit role grants
CREATE POLICY "Anyone can create trends"
  ON trends
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);