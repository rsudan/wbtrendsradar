import { Trend, Quadrant, Ring, Impact } from '../types';

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-trends`;

export async function generateTrends(domain: string, apiKey: string): Promise<Trend[]> {
  const systemPrompt = localStorage.getItem('system_prompt') || undefined;
  const userPrompt = localStorage.getItem('user_prompt') || undefined;

  console.log('Generating trends for domain:', domain);
  console.log('Edge function URL:', EDGE_FUNCTION_URL);

  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        domain,
        apiKey,
        systemPrompt,
        userPrompt,
      }),
    });

    console.log('Edge function response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('Response text (first 500 chars):', responseText.substring(0, 500));

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { error: `HTTP ${response.status}: ${responseText}` };
      }
      console.error('Error response:', errorData);
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      console.error('Full response text:', responseText);
      throw new Error('Server returned invalid JSON. Please try again.');
    }

    console.log('Parsed response data:', data);

    if (data.error) {
      throw new Error(data.error);
    }

    if (!data.trends) {
      console.error('No trends property in response:', data);
      throw new Error('Invalid response format: missing trends data');
    }

    if (!Array.isArray(data.trends)) {
      console.error('Trends is not an array:', typeof data.trends);
      throw new Error('Invalid response format: trends must be an array');
    }

    if (data.trends.length === 0) {
      throw new Error('No trends returned. Please try a different search.');
    }

    console.log('Successfully received', data.trends.length, 'trends');

    return data.trends.map((trend: any) => ({
      id: crypto.randomUUID(),
      search_id: '',
      label: trend.label,
      quadrant: trend.quadrant as Quadrant,
      ring: trend.ring as Ring,
      impact: trend.impact as Impact,
      summary: trend.summary,
      created_at: new Date().toISOString(),
    }));
  } catch (error: any) {
    console.error('Generate trends error:', error);
    console.error('Error stack:', error.stack);

    if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
      throw new Error('Network error. Please check your connection and try again.');
    }

    throw error;
  }
}

export function getApiKey(): string | null {
  return localStorage.getItem('perplexity_api_key');
}

export function setApiKey(key: string): void {
  localStorage.setItem('perplexity_api_key', key);
}

export function clearApiKey(): void {
  localStorage.removeItem('perplexity_api_key');
}
