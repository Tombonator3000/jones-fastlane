export interface Player {
  id: string;
  name: string;
  avatar: string;
  money: number;
  bankBalance: number;
  happiness: number;
  education: number;
  career: number;
  currentLocation: string;
  job: Job | null;
  degrees: string[];
  clothes: ClothingLevel;
  clothesWeeksRemaining: number;
  food: number;
  hoursRemaining: number;
  items: string[];
  hasRefrigerator: boolean;
  hasComputer: boolean;
  hasTV: boolean;
  apartment: 'low-cost' | 'security';
  studyProgress: Record<string, number>;
}

export interface Job {
  id: string;
  title: string;
  location: string;
  wage: number;
  hoursPerShift: number;
  requiredDegrees: string[];
  requiredClothes: ClothingLevel;
  careerLevel: number;
}

export type ClothingLevel = 'rags' | 'casual' | 'business' | 'executive';

export interface Location {
  id: string;
  name: string;
  type: 'apartment' | 'store' | 'workplace' | 'service' | 'food';
  description: string;
  position: { x: number; y: number };
  color: string;
  icon: string;
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  week: number;
  month: number;
  isGameStarted: boolean;
  isGameOver: boolean;
  winner: Player | null;
  goals: GameGoals;
  economyMultiplier: number;
  rentDue: boolean;
  clothesDue: boolean;
  weekendEvent: string | null;
}

export interface GameGoals {
  wealth: number;
  happiness: number;
  education: number;
  career: number;
}

export const LOCATIONS: Location[] = [
  { id: 'low-cost-housing', name: 'Low-Cost Housing', type: 'apartment', description: 'Cheap but risky. May be robbed!', position: { x: 50, y: 5 }, color: 'location-apartment', icon: '🏚️' },
  { id: 'pawn-shop', name: 'Pawn Shop', type: 'service', description: 'Sell your items for quick cash', position: { x: 85, y: 15 }, color: 'location-service', icon: '💎' },
  { id: 'z-mart', name: 'Z-Mart', type: 'store', description: 'Discount store for everything', position: { x: 95, y: 35 }, color: 'location-store', icon: '🛒' },
  { id: 'monolith-burger', name: 'Monolith Burger', type: 'food', description: 'Fast food and drinks', position: { x: 95, y: 55 }, color: 'location-food', icon: '🍔' },
  { id: 'qt-clothing', name: 'QT Clothing', type: 'store', description: 'Buy clothes for better jobs', position: { x: 85, y: 75 }, color: 'location-store', icon: '👔' },
  { id: 'socket-city', name: 'Socket City', type: 'store', description: 'Electronics and appliances', position: { x: 65, y: 90 }, color: 'location-store', icon: '📺' },
  { id: 'hi-tech-u', name: 'Hi-Tech U', type: 'service', description: 'Enroll and study for degrees', position: { x: 35, y: 90 }, color: 'location-service', icon: '🎓' },
  { id: 'employment-office', name: 'Employment Office', type: 'service', description: 'Find jobs and ask for raises', position: { x: 15, y: 75 }, color: 'location-service', icon: '💼' },
  { id: 'factory', name: 'Factory', type: 'workplace', description: 'Work for wages', position: { x: 5, y: 55 }, color: 'location-work', icon: '🏭' },
  { id: 'bank', name: 'Bank', type: 'service', description: 'Deposit money, loans, stocks', position: { x: 5, y: 35 }, color: 'location-service', icon: '🏦' },
  { id: 'blacks-market', name: "Black's Market", type: 'food', description: 'Fresh groceries and lottery', position: { x: 15, y: 15 }, color: 'location-food', icon: '🥬' },
  { id: 'security-apartments', name: 'Security Apartments', type: 'apartment', description: 'Expensive but safe from thieves', position: { x: 35, y: 5 }, color: 'location-apartment', icon: '🏢' },
  { id: 'rent-office', name: 'Rent Office', type: 'service', description: 'Pay rent and change apartments', position: { x: 50, y: 50 }, color: 'location-service', icon: '🔑' },
];

export const JOBS: Job[] = [
  { id: 'fry-cook', title: 'Fry Cook', location: 'monolith-burger', wage: 35, hoursPerShift: 8, requiredDegrees: [], requiredClothes: 'rags', careerLevel: 1 },
  { id: 'cashier', title: 'Cashier', location: 'z-mart', wage: 40, hoursPerShift: 8, requiredDegrees: [], requiredClothes: 'casual', careerLevel: 1 },
  { id: 'stock-clerk', title: 'Stock Clerk', location: 'blacks-market', wage: 38, hoursPerShift: 8, requiredDegrees: [], requiredClothes: 'casual', careerLevel: 1 },
  { id: 'sales-associate', title: 'Sales Associate', location: 'qt-clothing', wage: 45, hoursPerShift: 8, requiredDegrees: [], requiredClothes: 'casual', careerLevel: 2 },
  { id: 'tech-support', title: 'Tech Support', location: 'socket-city', wage: 55, hoursPerShift: 8, requiredDegrees: ['computers'], requiredClothes: 'casual', careerLevel: 2 },
  { id: 'factory-worker', title: 'Factory Worker', location: 'factory', wage: 50, hoursPerShift: 10, requiredDegrees: [], requiredClothes: 'casual', careerLevel: 2 },
  { id: 'bank-teller', title: 'Bank Teller', location: 'bank', wage: 60, hoursPerShift: 8, requiredDegrees: ['business'], requiredClothes: 'business', careerLevel: 3 },
  { id: 'teacher', title: 'Teacher', location: 'hi-tech-u', wage: 70, hoursPerShift: 8, requiredDegrees: ['education'], requiredClothes: 'business', careerLevel: 3 },
  { id: 'manager', title: 'Store Manager', location: 'z-mart', wage: 85, hoursPerShift: 10, requiredDegrees: ['business'], requiredClothes: 'business', careerLevel: 4 },
  { id: 'engineer', title: 'Engineer', location: 'factory', wage: 100, hoursPerShift: 8, requiredDegrees: ['computers', 'science'], requiredClothes: 'business', careerLevel: 5 },
  { id: 'executive', title: 'Executive', location: 'bank', wage: 150, hoursPerShift: 8, requiredDegrees: ['business', 'computers'], requiredClothes: 'executive', careerLevel: 6 },
];

export const DEGREES = [
  { id: 'business', name: 'Business', cost: 40, studyHours: 10 },
  { id: 'computers', name: 'Computers', cost: 45, studyHours: 10 },
  { id: 'education', name: 'Education', cost: 35, studyHours: 10 },
  { id: 'science', name: 'Science', cost: 50, studyHours: 10 },
  { id: 'arts', name: 'Arts', cost: 30, studyHours: 10 },
];

export const CLOTHING_PRICES: Record<ClothingLevel, number> = {
  rags: 0,
  casual: 50,
  business: 150,
  executive: 400,
};

export const ITEMS = {
  refrigerator: { name: 'Refrigerator', price: 200, happiness: 5 },
  tv: { name: 'Television', price: 300, happiness: 15 },
  computer: { name: 'Computer', price: 500, happiness: 10 },
  stereo: { name: 'Stereo', price: 250, happiness: 10 },
  vcr: { name: 'VCR', price: 200, happiness: 8 },
  concert: { name: 'Concert Ticket', price: 75, happiness: 20 },
  theater: { name: 'Theater Ticket', price: 50, happiness: 15 },
};

export const WEEKEND_EVENTS = [
  "You spent the weekend binge-watching TV. Cost: $25",
  "You went to a great party! Cost: $40",
  "You stayed home playing horseshoes. Cost: $15",
  "You took a day trip to the beach. Cost: $60",
  "You went to a fancy restaurant. Cost: $80",
  "You spent the weekend reading. Cost: $5",
  "You went to Las Vegas in a $20,000 car and came back in a $200,000 Greyhound bus. Cost: $200",
  "You had a quiet weekend at home. Cost: $10",
  "You went to a concert. It was amazing! Cost: $100",
  "You visited the local museum. Cost: $20",
  "Medical emergency! Doctor's visit required. Cost: $150",
];

export const RENT_PRICES = {
  'low-cost': 80,
  'security': 200,
};

export const AVATARS = [
  { id: 'jones', name: 'Jones', emoji: '🧔', description: 'The legendary competitor' },
  { id: 'player1', name: 'Alex', emoji: '👨', description: 'Ready to succeed' },
  { id: 'player2', name: 'Sam', emoji: '👩', description: 'Ambitious go-getter' },
  { id: 'player3', name: 'Jordan', emoji: '🧑', description: 'Street smart' },
  { id: 'player4', name: 'Casey', emoji: '👱', description: 'The optimist' },
];

export function createInitialPlayer(id: string, name: string, avatar: string): Player {
  return {
    id,
    name,
    avatar,
    money: 50,
    bankBalance: 0,
    happiness: 10,
    education: 0,
    career: 0,
    currentLocation: 'low-cost-housing',
    job: null,
    degrees: [],
    clothes: 'rags',
    clothesWeeksRemaining: 8,
    food: 2,
    hoursRemaining: 60,
    items: [],
    hasRefrigerator: false,
    hasComputer: false,
    hasTV: false,
    apartment: 'low-cost',
    studyProgress: {},
  };
}

export function createInitialGameState(goals: GameGoals): GameState {
  return {
    players: [],
    currentPlayerIndex: 0,
    week: 1,
    month: 1,
    isGameStarted: false,
    isGameOver: false,
    winner: null,
    goals,
    economyMultiplier: 1,
    rentDue: false,
    clothesDue: false,
    weekendEvent: null,
  };
}
