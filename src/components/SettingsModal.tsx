import { useState } from 'react';
import { X, Key, FileText, Zap } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentApiKey: string | null;
  onSaveApiKey: (key: string) => void;
  onTestApiKey: () => Promise<void>;
}

const DEFAULT_SYSTEM_PROMPT = `You are a JSON generator. Output ONLY valid JSON. Your response must be parseable by JSON.parse().

FORMAT REQUIREMENTS:
- Start with [ character
- End with ] character
- NO markdown code blocks
- NO explanatory text before or after
- NO extra fields beyond the 5 required

REQUIRED FIELDS (use these EXACT field names):
1. "label" - string, max 5 words, title case
2. "quadrant" - MUST be one of: "Technology", "Society", "Economy", "Environment"
3. "ring" - MUST be one of: "0-2 Years", "2-5 Years", "5-10 Years"
4. "impact" - MUST be one of: "High", "Medium", "Low"
5. "summary" - string, max 15 words, descriptive

CORRECT EXAMPLES:
[{"label":"AI Tutoring Systems","quadrant":"Technology","ring":"0-2 Years","impact":"High","summary":"Schools deploy AI for personalized student learning"}]

[{"label":"Remote Work Culture","quadrant":"Society","ring":"2-5 Years","impact":"Medium","summary":"Hybrid work becomes standard practice globally"}]

WRONG - DO NOT USE THESE FIELD NAMES:
- "name" (use "label")
- "description" (use "summary")
- "impact_level" (use "impact")
- "timeline" (use "ring")
- "sources" (do not include)

Return the JSON array now.`;

const DEFAULT_USER_PROMPT = `Generate 48 emerging trends for: {domain}

REQUIREMENTS:
- Distribute evenly across all 4 quadrants (Technology, Society, Economy, Environment)
- Distribute evenly across all 3 time rings (0-2 Years, 2-5 Years, 5-10 Years)
- Use exactly these field names: label, quadrant, ring, impact, summary
- No additional fields

Return only the JSON array starting with [ and ending with ].`;

export function SettingsModal({ isOpen, onClose, currentApiKey, onSaveApiKey, onTestApiKey }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState(currentApiKey || '');
  const [systemPrompt, setSystemPrompt] = useState(
    localStorage.getItem('system_prompt') || DEFAULT_SYSTEM_PROMPT
  );
  const [userPrompt, setUserPrompt] = useState(
    localStorage.getItem('user_prompt') || DEFAULT_USER_PROMPT
  );
  const [showPrompts, setShowPrompts] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiKey(apiKey);
    localStorage.setItem('system_prompt', systemPrompt);
    localStorage.setItem('user_prompt', userPrompt);
    onClose();
  };

  const handleReset = () => {
    setSystemPrompt(DEFAULT_SYSTEM_PROMPT);
    setUserPrompt(DEFAULT_USER_PROMPT);
  };

  const handleTest = async () => {
    if (!apiKey.trim()) {
      setTestStatus('error');
      setTestMessage('Please enter an API key first');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Testing API connection...');

    try {
      const tempKey = apiKey;
      localStorage.setItem('perplexity_api_key', tempKey);

      await onTestApiKey();

      setTestStatus('success');
      setTestMessage('API key is valid and working!');

      setTimeout(() => {
        setTestStatus('idle');
        setTestMessage('');
      }, 3000);
    } catch (error: any) {
      setTestStatus('error');
      setTestMessage(error.message || 'API test failed. Please check your key.');

      setTimeout(() => {
        setTestStatus('idle');
        setTestMessage('');
      }, 5000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Key size={16} />
                Perplexity API Key
              </div>
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Perplexity API key"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <button
              type="button"
              onClick={handleTest}
              disabled={testStatus === 'testing' || !apiKey.trim()}
              className="mt-3 w-full px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-md hover:bg-primary-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {testStatus === 'testing' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-600 border-t-transparent" />
                  Testing...
                </>
              ) : (
                <>
                  <Zap size={16} />
                  Test API Key
                </>
              )}
            </button>

            {testMessage && (
              <div className={`mt-3 p-3 rounded-md text-sm ${
                testStatus === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : testStatus === 'error'
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
              }`}>
                {testMessage}
              </div>
            )}

            <p className="mt-2 text-xs text-gray-500">
              Your API key is stored locally in your browser and never sent to our servers.
            </p>
          </div>

          <div className="bg-primary-50 p-3 rounded-md">
            <p className="text-sm text-gray-700">
              <strong>How to get your API key:</strong>
            </p>
            <ol className="text-xs text-gray-600 mt-2 space-y-1 list-decimal list-inside">
              <li>Visit <a href="https://www.perplexity.ai" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">perplexity.ai</a></li>
              <li>Sign in or create an account</li>
              <li>Navigate to API settings</li>
              <li>Generate a new API key</li>
            </ol>
          </div>

          <div className="border-t pt-6">
            <button
              onClick={() => setShowPrompts(!showPrompts)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              <FileText size={16} />
              {showPrompts ? 'Hide' : 'Show'} AI Prompts (Advanced)
            </button>

            {showPrompts && (
              <div className="mt-4 space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                  <p className="text-xs text-amber-800">
                    <strong>Note:</strong> These prompts control how the AI generates trends.
                    Use {'{domain}'} as a placeholder for the search domain.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    System Prompt
                  </label>
                  <textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User Prompt Template
                  </label>
                  <textarea
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-xs"
                  />
                </div>

                <button
                  onClick={handleReset}
                  className="text-sm text-primary-600 hover:text-primary-700 underline"
                >
                  Reset to default prompts
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-600 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
