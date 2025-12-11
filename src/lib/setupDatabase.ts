import { supabase } from './supabase';

export async function setupDatabase() {
  try {
    const createTablesSQL = `
      -- Create searches table
      CREATE TABLE IF NOT EXISTS searches (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        domain text NOT NULL,
        status text NOT NULL DEFAULT 'pending',
        created_at timestamptz DEFAULT now(),
        completed_at timestamptz
      );

      -- Create trends table
      CREATE TABLE IF NOT EXISTS trends (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        search_id uuid NOT NULL REFERENCES searches(id) ON DELETE CASCADE,
        name text NOT NULL,
        description text NOT NULL,
        impact_level text NOT NULL,
        timeline text NOT NULL,
        sources jsonb DEFAULT '[]'::jsonb,
        created_at timestamptz DEFAULT now()
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_trends_search_id ON trends(search_id);
      CREATE INDEX IF NOT EXISTS idx_trends_impact ON trends(impact_level);
      CREATE INDEX IF NOT EXISTS idx_trends_timeline ON trends(timeline);

      -- Enable RLS
      ALTER TABLE searches ENABLE ROW LEVEL SECURITY;
      ALTER TABLE trends ENABLE ROW LEVEL SECURITY;

      -- Drop existing policies if they exist
      DROP POLICY IF EXISTS "Anyone can view searches" ON searches;
      DROP POLICY IF EXISTS "Anyone can create searches" ON searches;
      DROP POLICY IF EXISTS "Anyone can update searches" ON searches;
      DROP POLICY IF EXISTS "Anyone can view trends" ON trends;
      DROP POLICY IF EXISTS "Anyone can create trends" ON trends;
      DROP POLICY IF EXISTS "Anyone can update trends" ON trends;
      DROP POLICY IF EXISTS "Anyone can delete trends" ON trends;

      -- Public policies for demonstration
      CREATE POLICY "Anyone can view searches"
        ON searches FOR SELECT
        USING (true);

      CREATE POLICY "Anyone can create searches"
        ON searches FOR INSERT
        WITH CHECK (true);

      CREATE POLICY "Anyone can update searches"
        ON searches FOR UPDATE
        USING (true)
        WITH CHECK (true);

      CREATE POLICY "Anyone can view trends"
        ON trends FOR SELECT
        USING (true);

      CREATE POLICY "Anyone can create trends"
        ON trends FOR INSERT
        WITH CHECK (true);

      CREATE POLICY "Anyone can update trends"
        ON trends FOR UPDATE
        USING (true)
        WITH CHECK (true);

      CREATE POLICY "Anyone can delete trends"
        ON trends FOR DELETE
        USING (true);
    `;

    console.log('Setting up database...');
    console.log('Please run the following SQL in your Supabase SQL Editor:');
    console.log(createTablesSQL);

    return true;
  } catch (error) {
    console.error('Error setting up database:', error);
    return false;
  }
}
