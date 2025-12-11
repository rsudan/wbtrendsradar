import { Search, Grid3x3, Target } from 'lucide-react';
import { Quadrant, Ring, Impact, ViewMode, FilterState } from '../types';

interface FilterControlsProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  trendCount: number;
}

export function FilterControls({
  filters,
  onFilterChange,
  viewMode,
  onViewModeChange,
  trendCount,
}: FilterControlsProps) {
  const toggleQuadrant = (quadrant: Quadrant) => {
    const newQuadrants = filters.quadrants.includes(quadrant)
      ? filters.quadrants.filter((q) => q !== quadrant)
      : [...filters.quadrants, quadrant];
    onFilterChange({ ...filters, quadrants: newQuadrants });
  };

  const toggleRing = (ring: Ring) => {
    const newRings = filters.rings.includes(ring)
      ? filters.rings.filter((r) => r !== ring)
      : [...filters.rings, ring];
    onFilterChange({ ...filters, rings: newRings });
  };

  const toggleImpact = (impact: Impact) => {
    const newImpacts = filters.impacts.includes(impact)
      ? filters.impacts.filter((i) => i !== impact)
      : [...filters.impacts, impact];
    onFilterChange({ ...filters, impacts: newImpacts });
  };

  const quadrantButtons: { quadrant: Quadrant; label: string; color: string }[] = [
    { quadrant: 'Technology', label: 'Technology', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    { quadrant: 'Society', label: 'Society', color: 'bg-purple-100 text-purple-800 border-purple-300' },
    { quadrant: 'Economy', label: 'Economy', color: 'bg-green-100 text-green-800 border-green-300' },
    { quadrant: 'Environment', label: 'Environment', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  ];

  const ringButtons: { ring: Ring; label: string }[] = [
    { ring: '0-2 Years', label: '0-2 Years' },
    { ring: '2-5 Years', label: '2-5 Years' },
    { ring: '5-10 Years', label: '5-10 Years' },
  ];

  const impactButtons: { impact: Impact; label: string; color: string }[] = [
    { impact: 'High', label: 'High', color: 'bg-red-100 text-red-800 border-red-300' },
    { impact: 'Medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    { impact: 'Low', label: 'Low', color: 'bg-green-100 text-green-800 border-green-300' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Target size={20} />
          Filters
        </h3>
        <span className="text-sm text-gray-600">
          {trendCount} trend{trendCount !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
          placeholder="Search trends..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Quadrant</label>
        <div className="flex flex-wrap gap-2">
          {quadrantButtons.map(({ quadrant, label, color }) => (
            <button
              key={quadrant}
              onClick={() => toggleQuadrant(quadrant)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium border-2 transition-all ${
                filters.quadrants.includes(quadrant)
                  ? color
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Timeline</label>
        <div className="flex flex-wrap gap-2">
          {ringButtons.map(({ ring, label }) => (
            <button
              key={ring}
              onClick={() => toggleRing(ring)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium border-2 transition-all ${
                filters.rings.includes(ring)
                  ? 'bg-gray-800 text-white border-gray-800'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Impact Level</label>
        <div className="flex flex-wrap gap-2">
          {impactButtons.map(({ impact, label, color }) => (
            <button
              key={impact}
              onClick={() => toggleImpact(impact)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium border-2 transition-all ${
                filters.impacts.includes(impact)
                  ? color
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">View Mode</label>
        <div className="flex gap-2">
          <button
            onClick={() => onViewModeChange('radar')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium border-2 transition-all flex items-center justify-center gap-2 ${
              viewMode === 'radar'
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Target size={16} />
            Radar
          </button>
          <button
            onClick={() => onViewModeChange('grid')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium border-2 transition-all flex items-center justify-center gap-2 ${
              viewMode === 'grid'
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Grid3x3 size={16} />
            Grid
          </button>
        </div>
      </div>
    </div>
  );
}
