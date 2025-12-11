export type Quadrant = 'Technology' | 'Society' | 'Economy' | 'Environment';
export type Ring = '0-2 Years' | '2-5 Years' | '5-10 Years';
export type Impact = 'High' | 'Medium' | 'Low';

export interface Trend {
  id: string;
  search_id: string;
  label: string;
  quadrant: Quadrant;
  ring: Ring;
  impact: Impact;
  summary: string;
  created_at: string;
}

export interface Search {
  id: string;
  domain: string;
  title?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
}

export type ViewMode = 'radar' | 'grid';

export interface FilterState {
  quadrants: Quadrant[];
  rings: Ring[];
  impacts: Impact[];
  searchQuery: string;
}
