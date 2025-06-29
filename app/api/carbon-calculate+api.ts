export async function POST(request: Request) {
  try {
    const { activityDescription } = await request.json();

    if (!activityDescription || typeof activityDescription !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Activity description is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY environment variable is not set');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const prompt = `
Analyze the following activity and calculate its carbon footprint. Return ONLY a JSON object with the following structure:
{
  "carbonImpact": number (in kg CO2),
  "category": "transportation" | "food" | "energy" | "shopping" | "other",
  "details": "brief explanation of the calculation"
}

Activity: "${activityDescription}"

Guidelines:
- For transportation: Consider distance, vehicle type, fuel efficiency
- For food: Consider type of food, production methods, transportation
- For energy: Consider energy source, duration, efficiency
- For shopping: Consider manufacturing, materials, lifecycle
- Use realistic carbon emission factors
- If unclear, make reasonable assumptions and explain in details
- Return values in kg CO2 equivalent
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 1,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error('Gemini API error:', response.status, response.statusText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Invalid Gemini API response structure:', data);
      throw new Error('Invalid response from Gemini API');
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in Gemini response:', generatedText);
      throw new Error('Invalid JSON response from Gemini');
    }

    const result = JSON.parse(jsonMatch[0]);
    
    // Validate the response structure
    if (
      typeof result.carbonImpact !== 'number' ||
      !['transportation', 'food', 'energy', 'shopping', 'other'].includes(result.category) ||
      typeof result.details !== 'string'
    ) {
      console.error('Invalid result structure:', result);
      throw new Error('Invalid result structure from Gemini');
    }

    // Ensure carbonImpact is reasonable (between 0 and 1000 kg CO2)
    if (result.carbonImpact < 0 || result.carbonImpact > 1000) {
      result.carbonImpact = Math.max(0, Math.min(1000, result.carbonImpact));
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in carbon calculation API:', error);
    
    // Fallback to basic calculation if Gemini fails
    const fallbackResult = getFallbackCalculation(
      (await request.json()).activityDescription
    );
    
    return new Response(JSON.stringify(fallbackResult), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Fallback calculation function
function getFallbackCalculation(description: string): {
  carbonImpact: number;
  category: 'transportation' | 'food' | 'energy' | 'shopping' | 'other';
  details: string;
} {
  const desc = description.toLowerCase();
  
  // Simple pattern matching for fallback
  if (desc.includes('drove') || desc.includes('car') || desc.includes('drive')) {
    return {
      carbonImpact: 5.0,
      category: 'transportation',
      details: 'Estimated car travel (fallback calculation)'
    };
  }
  
  if (desc.includes('ate') || desc.includes('food') || desc.includes('meal')) {
    return {
      carbonImpact: 3.0,
      category: 'food',
      details: 'Estimated meal impact (fallback calculation)'
    };
  }
  
  if (desc.includes('electricity') || desc.includes('energy') || desc.includes('power')) {
    return {
      carbonImpact: 2.0,
      category: 'energy',
      details: 'Estimated energy usage (fallback calculation)'
    };
  }
  
  if (desc.includes('bought') || desc.includes('shopping') || desc.includes('purchased')) {
    return {
      carbonImpact: 8.0,
      category: 'shopping',
      details: 'Estimated shopping impact (fallback calculation)'
    };
  }
  
  return {
    carbonImpact: 2.5,
    category: 'other',
    details: 'General activity estimate (fallback calculation)'
  };
}