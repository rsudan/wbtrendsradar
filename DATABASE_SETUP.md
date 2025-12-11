# Database Setup Instructions

This application uses Supabase for data persistence. Follow these steps to set up the database:

## Setup Steps

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the following SQL code:

```sql
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
```

5. Click "Run" to execute the SQL
6. Verify that the tables were created by checking the Table Editor in Supabase

## Tables Created

### searches
Stores information about each trend analysis search:
- `id`: Unique identifier
- `domain`: The search topic/domain
- `status`: Current status (pending, processing, completed, failed)
- `created_at`: When the search was initiated
- `completed_at`: When the search was completed

### trends
Stores individual trends identified in each search:
- `id`: Unique identifier
- `search_id`: Reference to the parent search
- `name`: Trend name
- `description`: Detailed description
- `impact_level`: High, medium, or low
- `timeline`: Short (< 5 years) or medium (5-10 years)
- `sources`: JSON array of source objects with title and URL
- `created_at`: When the trend was created

## Security

Row Level Security (RLS) is enabled on both tables with public access policies for demonstration purposes. In a production environment, you should modify these policies to restrict access appropriately.
