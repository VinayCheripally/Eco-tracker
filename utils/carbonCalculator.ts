import { ActivityCategory } from '../types';

// Approximate CO2 values for different activities in kg
const CARBON_VALUES = {
  transportation: {
    car: 0.192, // per km
    bus: 0.105, // per km
    train: 0.041, // per km
    plane: 0.255, // per km
    bike: 0, // per km
    walk: 0, // per km
  },
  food: {
    beef: 27, // per kg
    lamb: 39.2, // per kg
    pork: 12.1, // per kg
    chicken: 6.9, // per kg
    fish: 6.1, // per kg
    dairy: 1.9, // per liter of milk
    vegetables: 2, // per kg
    fruits: 1.1, // per kg
    grains: 1.4, // per kg
    meal: 3.5, // average meal
  },
  energy: {
    electricity: 0.309, // per kWh (US average)
    naturalGas: 0.18, // per kWh
    heating: 0.25, // per hour
    airConditioning: 0.35, // per hour
  },
  shopping: {
    clothing: 10, // per item (average)
    electronics: 45, // per item (average)
    plastics: 6, // per kg
  },
  other: {
    streaming: 0.004, // per hour
    email: 0.0001, // per email
    webBrowsing: 0.001, // per hour
  },
};

// Rules for pattern matching
const PATTERNS = {
  transportation: {
    car: [/drove\s+(\d+)\s*km/, /driving\s+(\d+)\s*km/, /car\s+(\d+)\s*km/],
    bus: [/bus\s+(\d+)\s*km/, /took\s+(?:a|the)\s+bus\s+(?:for)?\s*(\d+)\s*km/],
    train: [/train\s+(\d+)\s*km/, /took\s+(?:a|the)\s+train\s+(?:for)?\s*(\d+)\s*km/],
    plane: [/flew\s+(\d+)\s*km/, /flight\s+(\d+)\s*km/, /plane\s+(\d+)\s*km/],
    bike: [/biked\s+(\d+)\s*km/, /cycled\s+(\d+)\s*km/, /bicycle\s+(\d+)\s*km/],
    walk: [/walked\s+(\d+)\s*km/, /walking\s+(\d+)\s*km/],
  },
  food: {
    meal: [/(?:ate|had|consumed)\s+(?:a|an)\s+meal/],
    beef: [/beef/, /steak/, /hamburger/],
    chicken: [/chicken/, /poultry/],
    pork: [/pork/, /ham/, /bacon/],
    fish: [/fish/, /seafood/, /salmon/, /tuna/],
    vegetables: [/vegetables?/, /salad/, /plant-based/],
    fruits: [/fruits?/, /apple/, /banana/, /berries/],
  },
  energy: {
    electricity: [/used\s+electricity\s+(?:for)?\s*(\d+)\s*(?:hour|hr|h)/, /power\s+(\d+)\s*(?:hour|hr|h)/],
    heating: [/heating\s+(?:for)?\s*(\d+)\s*(?:hour|hr|h)/, /heated\s+(?:for)?\s*(\d+)\s*(?:hour|hr|h)/],
    airConditioning: [/air\s*conditioning\s+(?:for)?\s*(\d+)\s*(?:hour|hr|h)/, /a\/c\s+(?:for)?\s*(\d+)\s*(?:hour|hr|h)/],
  },
};

// Default values when quantities aren't specified
const DEFAULT_VALUES = {
  transportation: {
    car: 10, // km
    bus: 10, // km
    train: 20, // km
    plane: 500, // km
    bike: 5, // km
    walk: 2, // km
  },
  food: {
    meal: 1, // meal
    beef: 0.2, // kg
    chicken: 0.2, // kg
    pork: 0.2, // kg
    fish: 0.2, // kg
    vegetables: 0.3, // kg
    fruits: 0.2, // kg
  },
  energy: {
    electricity: 5, // hours
    heating: 3, // hours
    airConditioning: 4, // hours
  },
};

// Gemini API integration
async function calculateWithGemini(activityDescription: string): Promise<{
  carbonImpact: number;
  category: ActivityCategory;
  details: string;
} | null> {
  try {
    // Get Gemini API key from environment
    const geminiApiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      console.log('Gemini API key not found, using fallback calculation');
      return null;
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
- Be concise but informative in details
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
      return null;
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Invalid Gemini API response structure:', data);
      return null;
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in Gemini response:', generatedText);
      return null;
    }

    const result = JSON.parse(jsonMatch[0]);
    
    // Validate the response structure
    if (
      typeof result.carbonImpact !== 'number' ||
      !['transportation', 'food', 'energy', 'shopping', 'other'].includes(result.category) ||
      typeof result.details !== 'string'
    ) {
      console.error('Invalid result structure:', result);
      return null;
    }

    // Ensure carbonImpact is reasonable (between 0 and 1000 kg CO2)
    if (result.carbonImpact < 0 || result.carbonImpact > 1000) {
      result.carbonImpact = Math.max(0, Math.min(1000, result.carbonImpact));
    }

    return {
      carbonImpact: result.carbonImpact,
      category: result.category,
      details: `🤖 AI Analysis: ${result.details}`,
    };

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return null;
  }
}

// Rule-based fallback calculation
function calculateWithRules(activityDescription: string): { 
  carbonImpact: number; 
  category: ActivityCategory;
  details?: string;
} {
  const description = activityDescription.toLowerCase();
  
  // Check transportation patterns
  for (const [mode, patterns] of Object.entries(PATTERNS.transportation)) {
    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match) {
        const distance = match[1] ? parseFloat(match[1]) : DEFAULT_VALUES.transportation[mode as keyof typeof DEFAULT_VALUES.transportation];
        const impact = CARBON_VALUES.transportation[mode as keyof typeof CARBON_VALUES.transportation] * distance;
        return { 
          carbonImpact: parseFloat(impact.toFixed(2)), 
          category: 'transportation',
          details: `📊 Rule-based: ${mode} travel for ${distance} km`
        };
      }
    }
  }
  
  // Check food patterns
  for (const [food, patterns] of Object.entries(PATTERNS.food)) {
    for (const pattern of patterns) {
      if (pattern.test(description)) {
        const quantity = DEFAULT_VALUES.food[food as keyof typeof DEFAULT_VALUES.food];
        const impact = food === 'meal' 
          ? CARBON_VALUES.food.meal 
          : CARBON_VALUES.food[food as keyof typeof CARBON_VALUES.food] * quantity;
        
        return { 
          carbonImpact: parseFloat(impact.toFixed(2)), 
          category: 'food',
          details: `📊 Rule-based: ${food} consumption (${quantity} ${food === 'meal' ? 'meal' : 'kg'})`
        };
      }
    }
  }
  
  // Check energy patterns
  for (const [type, patterns] of Object.entries(PATTERNS.energy)) {
    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match) {
        const hours = match[1] ? parseFloat(match[1]) : DEFAULT_VALUES.energy[type as keyof typeof DEFAULT_VALUES.energy];
        const impact = CARBON_VALUES.energy[type as keyof typeof CARBON_VALUES.energy] * hours;
        return { 
          carbonImpact: parseFloat(impact.toFixed(2)), 
          category: 'energy',
          details: `📊 Rule-based: ${type} usage for ${hours} hours`
        };
      }
    }
  }
  
  // If no specific pattern matched, make an educated guess
  if (description.includes('bought') || description.includes('purchased') || description.includes('shopping')) {
    return { 
      carbonImpact: 8, 
      category: 'shopping',
      details: '📊 Rule-based: General shopping estimate'
    };
  }
  
  // Default fallback
  return { 
    carbonImpact: 2, 
    category: 'other',
    details: '📊 Rule-based: General activity estimate'
  };
}

// Main export function
export async function calculateCarbonImpact(activityDescription: string): Promise<{ 
  carbonImpact: number; 
  category: ActivityCategory;
  details?: string;
}> {
  try {
    // First, try Gemini AI calculation
    const geminiResult = await calculateWithGemini(activityDescription);
    
    if (geminiResult) {
      return geminiResult;
    }
    
    // If Gemini fails, fall back to rule-based calculation
    console.log('Falling back to rule-based calculation');
    return calculateWithRules(activityDescription);
    
  } catch (error) {
    console.error('Error in carbon calculation:', error);
    
    // Final fallback to rule-based calculation
    return calculateWithRules(activityDescription);
  }
}