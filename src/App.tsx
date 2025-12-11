import { useState, useEffect } from 'react';
import { Settings, TrendingUp, AlertCircle, History } from 'lucide-react';
import { SearchInterface } from './components/SearchInterface';
import { TrendRadar } from './components/TrendRadar';
import { TrendGrid } from './components/TrendGrid';
import { TrendCard } from './components/TrendCard';
import { FilterControls } from './components/FilterControls';
import { SettingsModal } from './components/SettingsModal';
import { HistoryModal } from './components/HistoryModal';
import { Trend, ViewMode, FilterState } from './types';
import { generateTrends, getApiKey, setApiKey } from './lib/perplexity';
import { supabase } from './lib/supabase';
import { exportTrendToPDF } from './lib/export';

function App() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [filteredTrends, setFilteredTrends] = useState<Trend[]>([]);
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('radar');
  const [currentDomain, setCurrentDomain] = useState<string | null>(null);
  const [currentSearchId, setCurrentSearchId] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    quadrants: ['Technology', 'Society', 'Economy', 'Environment'],
    rings: ['0-2 Years', '2-5 Years', '5-10 Years'],
    impacts: ['High', 'Medium', 'Low'],
    searchQuery: '',
  });

  useEffect(() => {
    setApiKeyState(getApiKey());
  }, []);

  useEffect(() => {
    let filtered = trends;

    if (filters.quadrants.length > 0 && filters.quadrants.length < 4) {
      filtered = filtered.filter((trend) => filters.quadrants.includes(trend.quadrant));
    }

    if (filters.rings.length > 0 && filters.rings.length < 3) {
      filtered = filtered.filter((trend) => filters.rings.includes(trend.ring));
    }

    if (filters.impacts.length > 0 && filters.impacts.length < 3) {
      filtered = filtered.filter((trend) => filters.impacts.includes(trend.impact));
    }

    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (trend) =>
          trend.label.toLowerCase().includes(query) ||
          trend.summary.toLowerCase().includes(query)
      );
    }

    setFilteredTrends(filtered);
  }, [trends, filters]);

  const handleSearch = async (domain: string) => {
    if (!apiKey) {
      setShowSettings(true);
      setError('Please configure your Perplexity API key in settings.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentDomain(domain);

    try {
      const { data: searchData, error: searchError } = await supabase
        .from('searches')
        .insert([{ domain, title: domain, status: 'processing' }])
        .select()
        .single();

      if (searchError) throw searchError;

      setCurrentSearchId(searchData.id);

      const generatedTrends = await generateTrends(domain, apiKey);

      const trendsWithSearchId = generatedTrends.map((trend) => ({
        ...trend,
        search_id: searchData.id,
      }));

      const { error: trendsError } = await supabase
        .from('trends')
        .insert(trendsWithSearchId.map(({ id, created_at, ...rest }) => rest));

      if (trendsError) throw trendsError;

      await supabase
        .from('searches')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', searchData.id);

      setTrends(generatedTrends);
    } catch (err: any) {
      console.error('Error generating trends:', err);
      setError(err.message || 'Failed to generate trends. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSearch = async (searchId: string, title: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: searchData, error: searchError } = await supabase
        .from('searches')
        .select('domain')
        .eq('id', searchId)
        .single();

      if (searchError) throw searchError;

      const { data: trendsData, error: trendsError } = await supabase
        .from('trends')
        .select('*')
        .eq('search_id', searchId);

      if (trendsError) throw trendsError;

      const loadedTrends = (trendsData || []).map((trend: any) => ({
        id: crypto.randomUUID(),
        search_id: searchId,
        label: trend.label,
        quadrant: trend.quadrant,
        ring: trend.ring,
        impact: trend.impact,
        summary: trend.summary,
        created_at: trend.created_at,
      }));

      setTrends(loadedTrends);
      setCurrentDomain(title);
      setCurrentSearchId(searchId);
    } catch (err: any) {
      console.error('Error loading search:', err);
      setError('Failed to load search history.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    setApiKeyState(key);
    setError(null);
  };

  const handleTestApiKey = async () => {
    const testKey = getApiKey();
    if (!testKey) {
      throw new Error('No API key found');
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-trends`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          domain: 'test',
          apiKey: testKey,
          systemPrompt: `You are a JSON generator. Output ONLY valid JSON. Return a JSON array with exactly 1 object.`,
          userPrompt: `Generate 1 test trend with these exact fields: label, quadrant (must be "Technology"), ring (must be "0-2 Years"), impact (must be "High"), summary. Return only the JSON array starting with [ and ending with ].`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API test failed with status ${response.status}`);
      }

      const data = await response.json();
      if (!data.trends || !Array.isArray(data.trends) || data.trends.length === 0) {
        throw new Error('Invalid response from API');
      }

      const trend = data.trends[0];
      const requiredFields = ['label', 'quadrant', 'ring', 'impact', 'summary'];
      const missingFields = requiredFields.filter(field => !trend[field]);

      if (missingFields.length > 0) {
        throw new Error(`Response is missing required fields: ${missingFields.join(', ')}`);
      }

      const validQuadrants = ['Technology', 'Society', 'Economy', 'Environment'];
      const validRings = ['0-2 Years', '2-5 Years', '5-10 Years'];
      const validImpacts = ['High', 'Medium', 'Low'];

      if (!validQuadrants.includes(trend.quadrant)) {
        throw new Error(`Invalid quadrant value: ${trend.quadrant}`);
      }

      if (!validRings.includes(trend.ring)) {
        throw new Error(`Invalid ring value: ${trend.ring}`);
      }

      if (!validImpacts.includes(trend.impact)) {
        throw new Error(`Invalid impact value: ${trend.impact}`);
      }

    } catch (error: any) {
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        throw new Error('Network error. Please check your connection.');
      }
      throw new Error(error.message || 'API test failed');
    }
  };

  const handleExportTrend = (trend: Trend) => {
    exportTrendToPDF(trend);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-lg">
                <TrendingUp size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Trend Radar
                </h1>
                <p className="text-sm text-gray-600">
                  Strategic Planning Tool
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHistory(true)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="History"
              >
                <History size={24} />
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Settings"
              >
                <Settings size={24} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-900">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        )}

        {!apiKey && !showSettings && (
          <div className="mb-6 bg-primary-50 border border-primary-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-primary-900 mb-2">
              Welcome! Get Started
            </h3>
            <p className="text-sm text-primary-700 mb-3">
              To begin analyzing trends, you'll need to configure your Perplexity API key.
            </p>
            <button
              onClick={() => setShowSettings(true)}
              className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-600 transition-colors"
            >
              Configure API Key
            </button>
          </div>
        )}

        {trends.length === 0 ? (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Discover Emerging Trends
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Enter a domain or topic to identify and analyze approximately emerging trends
                using advanced AI-powered research.
              </p>
            </div>

            <SearchInterface onSearch={handleSearch} isLoading={isLoading} />

            <div className="bg-white rounded-lg shadow-md p-8 max-w-3xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Example Topics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'Digital health in Sub-Saharan Africa',
                  'Climate finance mechanisms',
                  'Artificial intelligence in education',
                  'Renewable energy storage solutions',
                  'Urban mobility innovations',
                  'Financial inclusion technologies',
                ].map((example) => (
                  <button
                    key={example}
                    onClick={() => !isLoading && handleSearch(example)}
                    disabled={isLoading}
                    className="text-left px-4 py-3 bg-gray-50 hover:bg-primary-50 border border-gray-200 hover:border-primary-300 rounded-lg text-sm text-gray-700 hover:text-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {currentDomain}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {trends.length} trends identified
                  </p>
                </div>
                <button
                  onClick={() => {
                    setTrends([]);
                    setCurrentDomain(null);
                    setFilters({
                      quadrants: ['Technology', 'Society', 'Economy', 'Environment'],
                      rings: ['0-2 Years', '2-5 Years', '5-10 Years'],
                      impacts: ['High', 'Medium', 'Low'],
                      searchQuery: '',
                    });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  New Search
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <FilterControls
                  filters={filters}
                  onFilterChange={setFilters}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  trendCount={filteredTrends.length}
                />
              </div>

              <div className="lg:col-span-3">
                {viewMode === 'radar' ? (
                  <TrendRadar trends={filteredTrends} onTrendClick={setSelectedTrend} />
                ) : (
                  <TrendGrid trends={filteredTrends} onTrendClick={setSelectedTrend} />
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        currentApiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        onTestApiKey={handleTestApiKey}
      />

      <HistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onLoadSearch={handleLoadSearch}
      />

      <TrendCard
        trend={selectedTrend}
        onClose={() => setSelectedTrend(null)}
        onExport={handleExportTrend}
      />
    </div>
  );
}

export default App;
