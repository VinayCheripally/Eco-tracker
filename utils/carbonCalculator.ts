import { ActivityCategory } from '../types';

export async function calculateCarbonImpact(activityDescription: string): Promise<{ 
  carbonImpact: number; 
  category: ActivityCategory;
  details?: string;
}> {
  try {
    const response = await fetch('/api/carbon-calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        activityDescription: activityDescription.trim(),
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error);
    }

    return {
      carbonImpact: parseFloat(result.carbonImpact.toFixed(2)),
      category: result.category,
      details: result.details,
    };

  } catch (error) {
    console.error('Error calculating carbon impact:', error);
    
    // Return a basic fallback calculation
    return getBasicFallback(activityDescription);
  }
}

// Basic fallback for when API is completely unavailable
function getBasicFallback(description: string): {
  carbonImpact: number;
  category: ActivityCategory;
  details?: string;
} {
  const desc = description.toLowerCase();
  
  if (desc.includes('drove') || desc.includes('car') || desc.includes('drive')) {
    return { carbonImpact: 5.0, category: 'transportation', details: 'Basic estimate for car travel' };
  }
  
  if (desc.includes('ate') || desc.includes('food') || desc.includes('meal')) {
    return { carbonImpact: 3.0, category: 'food', details: 'Basic estimate for meal' };
  }
  
  if (desc.includes('electricity') || desc.includes('energy')) {
    return { carbonImpact: 2.0, category: 'energy', details: 'Basic estimate for energy use' };
  }
  
  if (desc.includes('bought') || desc.includes('shopping')) {
    return { carbonImpact: 8.0, category: 'shopping', details: 'Basic estimate for shopping' };
  }
  
  return { carbonImpact: 2.5, category: 'other', details: 'Basic general estimate' };
}