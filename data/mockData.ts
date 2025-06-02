import { Activity, Suggestion, Achievement, DailyTip } from '../types';

// Mock activities data
export const mockActivities: Activity[] = [
  {
    id: '1',
    description: 'Drove to work today',
    date: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
    carbonImpact: 3.8,
    category: 'transportation',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    description: 'Had a beef burger for lunch',
    date: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
    carbonImpact: 7.2,
    category: 'food',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    description: 'Used air conditioning for 4 hours',
    date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    carbonImpact: 1.4,
    category: 'energy',
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    description: 'Bought new clothes',
    date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    carbonImpact: 10.5,
    category: 'shopping',
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    description: 'Took the train to visit friends',
    date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
    carbonImpact: 1.2,
    category: 'transportation',
    createdAt: new Date().toISOString(),
  },
  {
    id: '6',
    description: 'Ate a vegetarian meal',
    date: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString(),
    carbonImpact: 0.5,
    category: 'food',
    createdAt: new Date().toISOString(),
  },
];

// Mock suggestions data
export const mockSuggestions: Suggestion[] = [
  {
    id: '1',
    title: 'Switch to Public Transportation',
    description: 'Using public transport instead of driving alone can reduce your carbon footprint by up to 20%.',
    potentialSaving: 4.5,
    category: 'transportation',
    iconName: 'car',
  },
  {
    id: '2',
    title: 'Reduce Meat Consumption',
    description: 'Try having at least one meat-free day per week to reduce your carbon footprint from food.',
    potentialSaving: 6.0,
    category: 'food',
    iconName: 'coffee',
  },
  {
    id: '3',
    title: 'Optimize Home Energy Use',
    description: 'Turning down your thermostat by just 1°C can save up to 10% on your energy bill and reduce emissions.',
    potentialSaving: 2.8,
    category: 'energy',
    iconName: 'zap',
  },
  {
    id: '4',
    title: 'Shop Second-Hand',
    description: 'Buying second-hand clothes extends the lifecycle of items and prevents manufacturing emissions.',
    potentialSaving: 8.5,
    category: 'shopping',
    iconName: 'shopping-bag',
  },
  {
    id: '5',
    title: 'Carpool to Work',
    description: 'Share rides with colleagues who live nearby to cut your transportation emissions in half.',
    potentialSaving: 3.2,
    category: 'transportation',
    iconName: 'car',
  },
  {
    id: '6',
    title: 'Eat Local and Seasonal',
    description: 'Choose locally grown, seasonal produce to reduce the carbon footprint from food transportation.',
    potentialSaving: 1.5,
    category: 'food',
    iconName: 'coffee',
  },
  {
    id: '7',
    title: 'Use LED Light Bulbs',
    description: 'Replacing all traditional bulbs with LEDs can reduce lighting energy use by up to 80%.',
    potentialSaving: 0.8,
    category: 'energy',
    iconName: 'zap',
  },
];

// Mock achievements data
export const mockAchievements: Achievement[] = [
  {
    id: '1',
    title: 'Carbon Tracker',
    description: 'Log your first 5 activities',
    icon: 'pencil',
    isUnlocked: true,
    progress: 5,
    totalRequired: 5,
  },
  {
    id: '2',
    title: 'Eco Explorer',
    description: 'Try 3 different eco-friendly alternatives',
    icon: 'compass',
    isUnlocked: true,
    progress: 3,
    totalRequired: 3,
  },
  {
    id: '3',
    title: 'Low Carbon Week',
    description: 'Keep your weekly carbon footprint under 30kg',
    icon: 'award',
    isUnlocked: false,
    progress: 22,
    totalRequired: 30,
  },
  {
    id: '4',
    title: 'Transportation Guru',
    description: 'Use eco-friendly transportation 10 times',
    icon: 'truck',
    isUnlocked: false,
    progress: 6,
    totalRequired: 10,
  },
  {
    id: '5',
    title: 'Conscious Consumer',
    description: 'Make 5 sustainable shopping choices',
    icon: 'shopping-bag',
    isUnlocked: false,
    progress: 2,
    totalRequired: 5,
  },
];

// Mock daily tips data
export const mockTips: DailyTip[] = [
  {
    id: '1',
    title: 'Unplug Electronics',
    content: 'Even when turned off, many electronics use standby power. Unplug chargers and devices when not in use to save energy.',
    category: 'energy',
  },
  {
    id: '2',
    title: 'Reusable Water Bottle',
    content: 'A single reusable water bottle can replace hundreds of plastic bottles annually, reducing plastic waste and production emissions.',
    category: 'shopping',
  },
  {
    id: '3',
    title: 'Meatless Monday',
    content: 'Starting your week with plant-based meals can significantly reduce your carbon footprint from food consumption.',
    category: 'food',
  },
  {
    id: '4',
    title: 'Eco-Driving Techniques',
    content: 'Maintain steady speed, avoid rapid acceleration and braking, and keep your tires properly inflated to improve fuel efficiency.',
    category: 'transportation',
  },
  {
    id: '5',
    title: 'Air-Dry Laundry',
    content: 'Whenever possible, hang clothes to dry instead of using a dryer. This can save significant energy and reduce emissions.',
    category: 'energy',
  },
];