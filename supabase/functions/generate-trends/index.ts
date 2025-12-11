import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

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

function cleanAndParseJSON(text: string): any {
  console.log('=== Parsing Response ===');
  console.log('Text length:', text.length);

  let cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');

  if (firstBracket === -1 || lastBracket === -1) {
    console.error('No brackets found in response');
    throw new Error('Response does not contain a valid JSON array');
  }

  let jsonString = cleaned.substring(firstBracket, lastBracket + 1);

  try {
    const parsed = JSON.parse(jsonString);
    console.log('Parsed successfully, items:', Array.isArray(parsed) ? parsed.length : 'not array');
    return parsed;
  } catch (e) {
    console.error('Parse error:', e.message);
    console.error('JSON preview (first 500):', jsonString.substring(0, 500));
    console.error('JSON preview (last 500):', jsonString.substring(Math.max(0, jsonString.length - 500)));
    throw new Error('Failed to parse API response. The response format was invalid.');
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    console.log('=== Request Received ===');
    const requestBody = await req.json().catch(() => ({}));
    const { domain, apiKey, systemPrompt, userPrompt } = requestBody;

    if (!domain || !apiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: domain and apiKey' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Domain:', domain);

    const finalSystemPrompt = systemPrompt || DEFAULT_SYSTEM_PROMPT;
    const finalUserPrompt = (userPrompt || DEFAULT_USER_PROMPT).replace('{domain}', domain);

    console.log('Calling Perplexity API...');

    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          { role: 'system', content: finalSystemPrompt },
          { role: 'user', content: finalUserPrompt },
        ],
        temperature: 0.2,
        max_tokens: 8000,
      }),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('API error:', errorText);

      let errorMessage = 'Failed to generate trends';
      if (response.status === 401) {
        errorMessage = 'Invalid API key. Please check your Perplexity API key in settings.';
      } else if (response.status === 429) {
        errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
      } else if (response.status === 403) {
        errorMessage = 'Access forbidden. Please verify your API key has proper permissions.';
      } else if (response.status >= 500) {
        errorMessage = 'Perplexity API is experiencing issues. Please try again in a few moments.';
      }

      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json().catch((e) => {
      console.error('Failed to parse Perplexity response:', e);
      return null;
    });

    if (!data) {
      return new Response(
        JSON.stringify({ error: 'Invalid response from Perplexity API' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in response:', JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: 'No content received from Perplexity API. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let trends;
    try {
      trends = cleanAndParseJSON(content);
    } catch (parseError) {
      console.error('Parse failed:', parseError.message);
      console.error('Full content:', content);
      console.error('Content length:', content.length);
      console.error('First 500 chars:', content.substring(0, 500));
      console.error('Last 500 chars:', content.substring(Math.max(0, content.length - 500)));
      return new Response(
        JSON.stringify({
          error: 'Failed to parse API response. The AI may have included extra text. Please try again.',
          debug: content.substring(0, 200)
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!Array.isArray(trends)) {
      console.error('Trends is not an array:', typeof trends);
      return new Response(
        JSON.stringify({ error: 'Invalid response format. Expected an array of trends.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (trends.length === 0) {
      console.error('Empty trends array');
      return new Response(
        JSON.stringify({ error: 'No trends found. Please try a different domain or search query.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validQuadrants = ['Technology', 'Society', 'Economy', 'Environment'];
    const validRings = ['0-2 Years', '2-5 Years', '5-10 Years'];
    const validImpacts = ['High', 'Medium', 'Low'];

    const processed = trends.map((t: any, index: number) => {
      try {
        const label = t.label || t.name || `Trend ${index + 1}`;
        const summary = t.summary || t.description || 'No summary available';

        let quadrant = t.quadrant;
        if (!validQuadrants.includes(quadrant)) {
          quadrant = 'Technology';
        }

        let ring = t.ring || t.timeline;
        if (ring === 'short' || ring === 'short-term') ring = '0-2 Years';
        if (ring === 'medium' || ring === 'medium-term') ring = '2-5 Years';
        if (ring === 'long' || ring === 'long-term') ring = '5-10 Years';
        if (!validRings.includes(ring)) {
          ring = '0-2 Years';
        }

        let impact = t.impact || t.impact_level;
        if (impact === 'high') impact = 'High';
        if (impact === 'medium') impact = 'Medium';
        if (impact === 'low') impact = 'Low';
        if (!validImpacts.includes(impact)) {
          impact = 'Medium';
        }

        return {
          label: label.substring(0, 50),
          quadrant,
          ring,
          impact,
          summary: summary.substring(0, 150),
        };
      } catch (e) {
        console.error(`Error processing trend ${index}:`, e);
        return null;
      }
    }).filter((t: any) => t !== null);

    if (processed.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Failed to process trends data. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Success! Processed', processed.length, 'trends');

    return new Response(
      JSON.stringify({ trends: processed }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Function error:', error.message);
    console.error('Error stack:', error.stack);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});