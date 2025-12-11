import { X, Download } from 'lucide-react';
import { Trend } from '../types';

interface TrendCardProps {
  trend: Trend | null;
  onClose: () => void;
  onExport: (trend: Trend) => void;
}

export function TrendCard({ trend, onClose, onExport }: TrendCardProps) {
  if (!trend) return null;

  const impactColors = {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
          <div className="flex-1 pr-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{trend.label}</h2>
            <div className="flex gap-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${impactColors[trend.impact]}`}>
                {trend.impact.toUpperCase()} IMPACT
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${quadrantColors[trend.quadrant]}`}>
                {trend.quadrant}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium border bg-gray-100 text-gray-800 border-gray-200">
                {trend.ring}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Summary</h3>
            <p className="text-gray-700 leading-relaxed">{trend.summary}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Quadrant</h4>
              <p className="text-sm font-medium text-gray-900">{trend.quadrant}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Timeline</h4>
              <p className="text-sm font-medium text-gray-900">{trend.ring}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Impact Level</h4>
              <p className="text-sm font-medium text-gray-900">{trend.impact}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Created</h4>
              <p className="text-sm font-medium text-gray-900">{new Date(trend.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex justify-end gap-3">
          <button
            onClick={() => onExport(trend)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Download size={16} />
            Export to PDF
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
