/*
  # Add title column to searches table
  
  1. Changes
    - Add `title` column to `searches` table
    - The title will be editable and defaults to the domain value
    - Add index on title for better search performance
  
  2. Notes
    - Existing searches will have title set to domain
    - Users can edit titles to customize their search history
*/

-- Add title column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'searches' AND column_name = 'title'
  ) THEN
    ALTER TABLE searches ADD COLUMN title text;
    
    -- Set existing searches' titles to their domain
    UPDATE searches SET title = domain WHERE title IS NULL;
    
    -- Make title required going forward
    ALTER TABLE searches ALTER COLUMN title SET NOT NULL;
  END IF;
END $$;

-- Add index for better search performance
CREATE INDEX IF NOT EXISTS idx_searches_title ON searches(title);
CREATE INDEX IF NOT EXISTS idx_searches_created_at ON searches(created_at DESC);