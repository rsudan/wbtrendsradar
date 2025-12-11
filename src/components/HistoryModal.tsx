import { useState, useEffect } from 'react';
import { X, History, Trash2, Edit2, Check, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSearch: (searchId: string, title: string) => void;
}

interface SearchHistory {
  id: string;
  title: string;
  domain: string;
  created_at: string;
  status: string;
  trend_count: number;
}

export function HistoryModal({ isOpen, onClose, onLoadSearch }: HistoryModalProps) {
  const [searches, setSearches] = useState<SearchHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const { data: searchesData, error: searchesError } = await supabase
        .from('searches')
        .select('id, title, domain, created_at, status')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(50);

      if (searchesError) throw searchesError;

      const searchesWithCounts = await Promise.all(
        (searchesData || []).map(async (search) => {
          const { count } = await supabase
            .from('trends')
            .select('*', { count: 'exact', head: true })
            .eq('search_id', search.id);

          return {
            ...search,
            trend_count: count || 0,
          };
        })
      );

      setSearches(searchesWithCounts);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (search: SearchHistory) => {
    setEditingId(search.id);
    setEditTitle(search.title);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editTitle.trim()) return;

    try {
      const { error } = await supabase
        .from('searches')
        .update({ title: editTitle.trim() })
        .eq('id', id);

      if (error) throw error;

      setSearches(searches.map(s =>
        s.id === id ? { ...s, title: editTitle.trim() } : s
      ));
      setEditingId(null);
      setEditTitle('');
    } catch (error) {
      console.error('Error updating title:', error);
      alert('Failed to update title. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this search and all its trends?')) {
      return;
    }

    setDeletingId(id);
    try {
      const { error: trendsError } = await supabase
        .from('trends')
        .delete()
        .eq('search_id', id);

      if (trendsError) throw trendsError;

      const { error: searchError } = await supabase
        .from('searches')
        .delete()
        .eq('id', id);

      if (searchError) throw searchError;

      setSearches(searches.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting search:', error);
      alert('Failed to delete search. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleLoad = async (search: SearchHistory) => {
    onLoadSearch(search.id, search.title);
    onClose();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-xl flex flex-col">
        <div className="bg-white border-b border-gray-200 p-6 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <History size={24} className="text-gray-700" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Search History</h2>
              <p className="text-sm text-gray-600 mt-1">
                {searches.length} saved search{searches.length !== 1 ? 'es' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : searches.length === 0 ? (
            <div className="text-center py-12">
              <History size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">No search history yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Your completed searches will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {searches.map((search) => (
                <div
                  key={search.id}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      {editingId === search.id ? (
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(search.id);
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                            className="flex-1 px-3 py-1.5 border border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit(search.id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Save"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Cancel"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-base font-semibold text-gray-900 truncate">
                            {search.title}
                          </h3>
                          <button
                            onClick={() => handleEdit(search)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-primary transition-all"
                            title="Edit title"
                          >
                            <Edit2 size={14} />
                          </button>
                        </div>
                      )}

                      {search.title !== search.domain && (
                        <p className="text-sm text-gray-600 mb-2">
                          Domain: {search.domain}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{formatDate(search.created_at)}</span>
                        <span className="flex items-center gap-1">
                          <span className="font-medium text-gray-700">
                            {search.trend_count}
                          </span>
                          trend{search.trend_count !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleLoad(search)}
                        className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-600 transition-colors"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => handleDelete(search.id)}
                        disabled={deletingId === search.id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        {deletingId === search.id ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-50 border-t border-gray-200 p-4 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
