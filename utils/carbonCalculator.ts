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

export function calculateCarbonImpact(activityDescription: string): { 
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
          details: `${mode} travel: ${distance} km`
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
          details: `${food}: ${quantity} ${food === 'meal' ? 'meal' : 'kg'}`
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
          details: `${type}: ${hours} hours`
        };
      }
    }
  }
  
  // If no specific pattern matched, make an educated guess
  if (description.includes('bought') || description.includes('purchased') || description.includes('shopping')) {
    return { 
      carbonImpact: 8, // default shopping impact
      category: 'shopping' 
    };
  }
  
  // Default fallback
  return { 
    carbonImpact: 2, // default impact when we can't determine
    category: 'other' 
  };
}