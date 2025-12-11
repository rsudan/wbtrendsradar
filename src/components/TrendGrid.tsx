import { Trend } from '../types';

interface TrendGridProps {
  trends: Trend[];
  onTrendClick: (trend: Trend) => void;
}

export function TrendGrid({ trends, onTrendClick }: TrendGridProps) {
  const impactColors = {
    High: 'border-l-red-500 bg-red-50',
    Medium: 'border-l-yellow-500 bg-yellow-50',
    Low: 'border-l-green-500 bg-green-50',
  };

  const impactBadgeColors = {
    High: 'bg-red-100 text-red-800 border-red-200',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Low: 'bg-green-100 text-green-800 border-green-200',
  };

  const quadrantColors = {
    Technology: 'bg-blue-100 text-blue-800 border-blue-200',
    Society: 'bg-purple-100 text-purple-800 border-purple-200',
    Economy: 'bg-green-100 text-green-800 border-green-200',
    Environment: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };

  if (trends.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <p className="text-gray-500">No trends match your current filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Trend Grid</h3>
        <p className="text-sm text-gray-600 mt-1">
          Click any trend card to view full details and sources.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trends.map((trend) => (
          <div
            key={trend.id}
            onClick={() => onTrendClick(trend)}
            className={`cursor-pointer border-l-4 ${impactColors[trend.impact]} border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all`}
          >
            <div className="mb-2">
              <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                {trend.label}
              </h4>
            </div>

            <p className="text-xs text-gray-600 mb-3 line-clamp-2">
              {trend.summary}
            </p>

            <div className="flex flex-wrap gap-1.5">
              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${impactBadgeColors[trend.impact]}`}>
                {trend.impact}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${quadrantColors[trend.quadrant]}`}>
                {trend.quadrant}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-medium border bg-gray-100 text-gray-800 border-gray-200">
                {trend.ring}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
