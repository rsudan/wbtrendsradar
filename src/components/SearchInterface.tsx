import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface SearchInterfaceProps {
  onSearch: (domain: string) => void;
  isLoading: boolean;
}

export function SearchInterface({ onSearch, isLoading }: SearchInterfaceProps) {
  const [domain, setDomain] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (domain.trim()) {
      onSearch(domain.trim());
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="Enter a domain or topic (e.g., 'digital health in Sub-Saharan Africa', 'climate finance')"
            disabled={isLoading}
            className="w-full px-4 py-4 pr-12 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
        </div>

        <button
          type="submit"
          disabled={isLoading || !domain.trim()}
          className="w-full py-4 bg-primary text-white text-lg font-medium rounded-lg hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Analyzing Trends...
            </>
          ) : (
            'Research Trends'
          )}
        </button>
      </form>

      {isLoading && (
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Analyzing emerging trends in: <strong>{domain}</strong>
          </p>
          <div className="bg-primary-50 rounded-lg p-6 max-w-md mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Loader2 className="animate-spin text-primary" size={24} />
              <span className="text-primary-800 font-medium">Processing...</span>
            </div>
            <p className="text-sm text-gray-600">
              This may take 1 to 3 minutes as we research and analyze emerging trends using advanced AI.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
