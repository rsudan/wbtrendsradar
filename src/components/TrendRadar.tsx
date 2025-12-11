import { useMemo } from 'react';
import { Trend } from '../types';

interface TrendRadarProps {
  trends: Trend[];
  onTrendClick: (trend: Trend) => void;
}

export function TrendRadar({ trends, onTrendClick }: TrendRadarProps) {
  const { dimensions, positionedTrends } = useMemo(() => {
    const size = 800;
    const center = size / 2;
    const padding = 100;
    const maxRadius = center - padding;

    const quadrantAngles: Record<string, { start: number; end: number }> = {
      'Technology': { start: 0, end: 90 },
      'Society': { start: 90, end: 180 },
      'Economy': { start: 180, end: 270 },
      'Environment': { start: 270, end: 360 },
    };

    const ringRadii: Record<string, { inner: number; outer: number }> = {
      '0-2 Years': { inner: 0, outer: maxRadius / 3 },
      '2-5 Years': { inner: maxRadius / 3, outer: (2 * maxRadius) / 3 },
      '5-10 Years': { inner: (2 * maxRadius) / 3, outer: maxRadius },
    };

    const positioned = trends.map((trend) => {
      const angleRange = quadrantAngles[trend.quadrant];
      const angle = (angleRange.start + Math.random() * (angleRange.end - angleRange.start)) * (Math.PI / 180);

      const ringRange = ringRadii[trend.ring];
      const radiusSpread = ringRange.outer - ringRange.inner;
      const radius = ringRange.inner + radiusSpread * 0.3 + Math.random() * radiusSpread * 0.6;

      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);

      return {
        ...trend,
        x,
        y,
      };
    });

    return { dimensions: { size, center, padding, maxRadius }, positionedTrends: positioned };
  }, [trends]);

  const { size, center, maxRadius } = dimensions;

  const impactColors = {
    High: '#EF4444',
    Medium: '#F59E0B',
    Low: '#10B981',
  };

  const quadrantColors = {
    Technology: '#3B82F6',
    Society: '#8B5CF6',
    Economy: '#10B981',
    Environment: '#059669',
  };

  const rings = [
    { label: '0-2 Years', radius: maxRadius / 3 },
    { label: '2-5 Years', radius: (2 * maxRadius) / 3 },
    { label: '5-10 Years', radius: maxRadius },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Trend Radar</h3>
        <p className="text-sm text-gray-600 mt-1">
          Click any trend to view details. Quadrants represent categories, rings show timeline.
        </p>
      </div>

      <div className="overflow-x-auto">
        <svg width={size} height={size} className="mx-auto">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E5E7EB" strokeWidth="0.5" />
            </pattern>
          </defs>

          {rings.map((ring, index) => (
            <circle
              key={index}
              cx={center}
              cy={center}
              r={ring.radius}
              fill="none"
              stroke="#D1D5DB"
              strokeWidth="1"
            />
          ))}

          <line x1={center} y1={center - maxRadius} x2={center} y2={center + maxRadius} stroke="#9CA3AF" strokeWidth="2" />
          <line x1={center - maxRadius} y1={center} x2={center + maxRadius} y2={center} stroke="#9CA3AF" strokeWidth="2" />

          <text x={center} y={center - maxRadius - 15} textAnchor="middle" className="text-sm fill-blue-600 font-semibold">
            Technology
          </text>
          <text x={center - maxRadius - 15} y={center + 5} textAnchor="end" className="text-sm fill-purple-600 font-semibold">
            Society
          </text>
          <text x={center} y={center + maxRadius + 25} textAnchor="middle" className="text-sm fill-green-600 font-semibold">
            Economy
          </text>
          <text x={center + maxRadius + 15} y={center + 5} textAnchor="start" className="text-sm fill-emerald-600 font-semibold">
            Environment
          </text>

          {rings.map((ring, index) => (
            <text
              key={index}
              x={center + ring.radius * 0.7}
              y={center - ring.radius * 0.7}
              textAnchor="middle"
              className="text-xs fill-gray-500 font-medium"
            >
              {ring.label}
            </text>
          ))}

          {positionedTrends.map((trend) => (
            <g key={trend.id}>
              <circle
                cx={trend.x}
                cy={trend.y}
                r="8"
                fill={impactColors[trend.impact]}
                stroke="#fff"
                strokeWidth="2"
                className="cursor-pointer transition-all hover:r-10"
                onClick={() => onTrendClick(trend)}
                style={{ transition: 'all 0.2s' }}
              />
              <circle
                cx={trend.x}
                cy={trend.y}
                r="16"
                fill="transparent"
                className="cursor-pointer"
                onClick={() => onTrendClick(trend)}
              />
              <title>{trend.label}</title>
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Impact Levels</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-600">High Impact</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-gray-600">Medium Impact</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">Low Impact</span>
            </div>
          </div>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Quadrants</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-gray-600">Technology</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-sm text-gray-600">Society</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">Economy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-sm text-gray-600">Environment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
