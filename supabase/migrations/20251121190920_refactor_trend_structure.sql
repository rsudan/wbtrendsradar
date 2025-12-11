/*
  # Refactor Trend Structure for Radar Visualization

  1. Changes to Tables
    - Drop old `trends` table and recreate with new structure
    - Update columns:
      - `name` → `label` (text, max 50 chars)
      - `description` → `summary` (text, max 150 chars)
      - `impact_level` → `impact` (text, values: 'High', 'Medium', 'Low')
      - `timeline` → `ring` (text, values: '0-2 Years', '2-5 Years', '5-10 Years')
      - Add `quadrant` (text, values: 'Technology', 'Society', 'Economy', 'Environment')
      - Remove `sources` column (no longer needed)
    - Add `title` column to `searches` table for storing search titles

  2. Security
    - Maintain RLS policies for both tables
    - Public read access for unauthenticated users

  3. Important Notes
    - This migration will drop existing trend data
    - New structure optimized for radar chart visualization
    - Simplified data model without external sources
*/

DROP TABLE IF EXISTS trends CASCADE;

CREATE TABLE trends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  search_id uuid NOT NULL REFERENCES searches(id) ON DELETE CASCADE,
  label text NOT NULL CHECK (char_length(label) <= 50),
  quadrant text NOT NULL CHECK (quadrant IN ('Technology', 'Society', 'Economy', 'Environment')),
  ring text NOT NULL CHECK (ring IN ('0-2 Years', '2-5 Years', '5-10 Years')),
  impact text NOT NULL CHECK (impact IN ('High', 'Medium', 'Low')),
  summary text NOT NULL CHECK (char_length(summary) <= 150),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view trends"
  ON trends FOR SELECT
  TO public
  USING (true);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'searches' AND column_name = 'title'
  ) THEN
    ALTER TABLE searches ADD COLUMN title text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_trends_search_id ON trends(search_id);
CREATE INDEX IF NOT EXISTS idx_trends_quadrant ON trends(quadrant);
CREATE INDEX IF NOT EXISTS idx_trends_ring ON trends(ring);
CREATE INDEX IF NOT EXISTS idx_trends_impact ON trends(impact);