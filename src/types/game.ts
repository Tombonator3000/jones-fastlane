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
  clothes: ClothingInventory;
  food: number; // Fresh food units
  hasFastFood: boolean;
  hoursRemaining: number;
  items: string[];
  apartment: 'low-cost' | 'security';
  studyProgress: Record<string, number>;
  enrolledCourses: string[];
  // Stats from wiki
  experience: number;
  dependability: number;
  relaxation: number;
  // Stock market
  stocks: Record<string, number>;
  // Lottery
  lotteryTickets: number;
  // Pawn shop
  pawnedItems: PawnedItem[];
}

export interface PawnedItem {
  itemId: string;
  redeemPrice: number;
  weeksRemaining: number;
}

export interface ClothingInventory {
  casual: number; // weeks remaining
  dress: number;
  business: number;
}

export interface Job {
  id: string;
  title: string;
  location: string;
  baseWage: number; // Per hour
  hoursPerShift: number;
  requiredDegrees: string[];
  requiredClothes: ClothingLevel;
  requiredExperience: number;
  requiredDependability: number;
  careerPoints: number;
}

export type ClothingLevel = 'none' | 'casual' | 'dress' | 'business';

export interface Degree {
  id: string;
  name: string;
  enrollmentFee: number;
  lessonsRequired: number;
  prerequisites: string[];
  educationPoints: number;
}

export interface Location {
  id: string;
  name: string;
  type: 'apartment' | 'store' | 'workplace' | 'service' | 'food';
  description: string;
  position: { x: number; y: number };
  color: string;
  icon: string;
}

export interface Appliance {
  id: string;
  name: string;
  socketCityPrice: number;
  zMartPrice: number | null; // null if not available at Z-Mart
  happiness: number;
  canBreak: boolean;
  canBeStolen: boolean;
  special?: string;
}

export interface FastFoodItem {
  id: string;
  name: string;
  basePrice: number;
  preventsStarvation: boolean;
  happinessBonus: number;
}

export interface Stock {
  id: string;
  name: string;
  basePrice: number;
  currentPrice: number;
  isSafe: boolean; // T-Bills are safe from crashes
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
  economyIndex: number; // -30 to 90, affects prices
  rentDue: boolean;
  weekendEvent: WeekendEvent | null;
  stockPrices: Record<string, number>;
  pawnShopItems: PawnShopItem[];
  newspaper: string | null;
}

export interface PawnShopItem {
  itemId: string;
  price: number;
  originalOwner: string;
  weeksUntilSale: number;
}

export interface WeekendEvent {
  text: string;
  cost: number;
  happinessChange: number;
}

export interface GameGoals {
  wealth: number;
  happiness: number;
  education: number;
  career: number;
}

// Positions match the game board image (percentage based)
export const LOCATIONS: Location[] = [
  // Top row (left to right)
  { id: 'security-apartments', name: 'LeSecurity Apts', type: 'apartment', description: 'Expensive but safe from thieves', position: { x: 12, y: 18 }, color: 'location-apartment', icon: '🏢' },
  { id: 'rent-office', name: 'Rent Office', type: 'service', description: 'Pay rent and change apartments', position: { x: 28, y: 15 }, color: 'location-service', icon: '🔑' },
  { id: 'low-cost-housing', name: 'Low-Cost Housing', type: 'apartment', description: 'Cheap but Wild Willy may rob you!', position: { x: 44, y: 15 }, color: 'location-apartment', icon: '🏚️' },
  { id: 'pawn-shop', name: 'Pawn Shop', type: 'service', description: 'Pawn items for cash or buy pawned goods', position: { x: 60, y: 15 }, color: 'location-service', icon: '💎' },
  { id: 'z-mart', name: 'Z-Mart', type: 'store', description: 'Discount store - cheaper but items may break', position: { x: 88, y: 18 }, color: 'location-store', icon: '🛒' },

  // Right side (top to bottom)
  { id: 'monolith-burger', name: 'Monolith Burgers', type: 'food', description: 'Fast food and soft drinks', position: { x: 88, y: 38 }, color: 'location-food', icon: '🍔' },
  { id: 'qt-clothing', name: 'QT Clothing', type: 'store', description: 'Quality clothes that last longer', position: { x: 88, y: 55 }, color: 'location-store', icon: '👔' },
  { id: 'socket-city', name: 'Socket City', type: 'store', description: 'Full-price electronics with warranty', position: { x: 88, y: 75 }, color: 'location-store', icon: '📺' },

  // Bottom row (right to left)
  { id: 'hi-tech-u', name: 'Hi-Tech U', type: 'service', description: 'Enroll in courses and study for degrees', position: { x: 70, y: 85 }, color: 'location-service', icon: '🎓' },
  { id: 'employment-office', name: 'Employment Office', type: 'service', description: 'Find jobs and ask for raises', position: { x: 50, y: 85 }, color: 'location-service', icon: '💼' },
  { id: 'factory', name: 'Factory', type: 'workplace', description: 'Best paying jobs in town', position: { x: 30, y: 85 }, color: 'location-work', icon: '🏭' },

  // Left side (bottom to top)
  { id: 'bank', name: 'Bank', type: 'service', description: 'Deposits, loans, and stock market', position: { x: 12, y: 65 }, color: 'location-service', icon: '🏦' },
  { id: 'blacks-market', name: "Black's Market", type: 'food', description: 'Fresh groceries, lottery, and newspaper', position: { x: 12, y: 42 }, color: 'location-food', icon: '🥬' },
];

// DEGREES - Based on wiki: 11 total, each gives 9 education points (1 + 11*9 = 100 max)
export const DEGREES: Degree[] = [
  // Starting degrees
  { id: 'trade-school', name: 'Trade School', enrollmentFee: 50, lessonsRequired: 10, prerequisites: [], educationPoints: 9 },
  { id: 'junior-college', name: 'Junior College', enrollmentFee: 50, lessonsRequired: 10, prerequisites: [], educationPoints: 9 },

  // Requires Junior College
  { id: 'electronics', name: 'Electronics', enrollmentFee: 50, lessonsRequired: 10, prerequisites: ['junior-college'], educationPoints: 9 },
  { id: 'pre-engineering', name: 'Pre-Engineering', enrollmentFee: 50, lessonsRequired: 10, prerequisites: ['junior-college'], educationPoints: 9 },
  { id: 'business-admin', name: 'Business Administration', enrollmentFee: 50, lessonsRequired: 10, prerequisites: ['junior-college'], educationPoints: 9 },
  { id: 'academic', name: 'Academic', enrollmentFee: 50, lessonsRequired: 10, prerequisites: ['junior-college'], educationPoints: 9 },

  // Advanced degrees
  { id: 'engineering', name: 'Engineering', enrollmentFee: 50, lessonsRequired: 10, prerequisites: ['pre-engineering'], educationPoints: 9 },
  { id: 'graduate-school', name: 'Graduate School', enrollmentFee: 50, lessonsRequired: 10, prerequisites: ['academic'], educationPoints: 9 },
  { id: 'research', name: 'Research', enrollmentFee: 50, lessonsRequired: 10, prerequisites: ['graduate-school'], educationPoints: 9 },
  { id: 'accounting', name: 'Accounting', enrollmentFee: 50, lessonsRequired: 10, prerequisites: ['business-admin'], educationPoints: 9 },
  { id: 'advanced-electronics', name: 'Advanced Electronics', enrollmentFee: 50, lessonsRequired: 10, prerequisites: ['electronics'], educationPoints: 9 },
];

// JOBS - Based on wiki with proper requirements
export const JOBS: Job[] = [
  // Entry level - No degrees, casual or no uniform
  { id: 'janitor-qt', title: 'Janitor', location: 'qt-clothing', baseWage: 5, hoursPerShift: 6, requiredDegrees: [], requiredClothes: 'none', requiredExperience: 0, requiredDependability: 0, careerPoints: 5 },
  { id: 'janitor-factory', title: 'Janitor', location: 'factory', baseWage: 5, hoursPerShift: 6, requiredDegrees: [], requiredClothes: 'none', requiredExperience: 0, requiredDependability: 0, careerPoints: 5 },
  { id: 'fry-cook', title: 'Fry Cook', location: 'monolith-burger', baseWage: 6, hoursPerShift: 6, requiredDegrees: [], requiredClothes: 'casual', requiredExperience: 0, requiredDependability: 0, careerPoints: 8 },
  { id: 'dishwasher', title: 'Dishwasher', location: 'monolith-burger', baseWage: 5, hoursPerShift: 6, requiredDegrees: [], requiredClothes: 'none', requiredExperience: 0, requiredDependability: 0, careerPoints: 5 },
  { id: 'stock-clerk', title: 'Stock Clerk', location: 'z-mart', baseWage: 6, hoursPerShift: 6, requiredDegrees: [], requiredClothes: 'casual', requiredExperience: 0, requiredDependability: 0, careerPoints: 8 },
  { id: 'stock-clerk-bm', title: 'Stock Clerk', location: 'blacks-market', baseWage: 7, hoursPerShift: 6, requiredDegrees: [], requiredClothes: 'casual', requiredExperience: 0, requiredDependability: 0, careerPoints: 10 },
  { id: 'sales-clerk-qt', title: 'Sales Clerk', location: 'qt-clothing', baseWage: 7, hoursPerShift: 6, requiredDegrees: [], requiredClothes: 'casual', requiredExperience: 10, requiredDependability: 10, careerPoints: 12 },
  { id: 'clerk-socket', title: 'Clerk', location: 'socket-city', baseWage: 7, hoursPerShift: 6, requiredDegrees: [], requiredClothes: 'casual', requiredExperience: 10, requiredDependability: 10, careerPoints: 12 },
  { id: 'rent-clerk', title: 'Rent Clerk', location: 'rent-office', baseWage: 8, hoursPerShift: 6, requiredDegrees: [], requiredClothes: 'none', requiredExperience: 10, requiredDependability: 10, careerPoints: 12 },

  // Requires Trade School
  { id: 'butcher', title: 'Butcher', location: 'blacks-market', baseWage: 11, hoursPerShift: 6, requiredDegrees: ['trade-school'], requiredClothes: 'casual', requiredExperience: 20, requiredDependability: 20, careerPoints: 20 },
  { id: 'assembly-worker', title: 'Assembly Worker', location: 'factory', baseWage: 10, hoursPerShift: 6, requiredDegrees: ['trade-school'], requiredClothes: 'casual', requiredExperience: 20, requiredDependability: 20, careerPoints: 18 },
  { id: 'machinists-helper', title: "Machinist's Helper", location: 'factory', baseWage: 12, hoursPerShift: 6, requiredDegrees: ['trade-school'], requiredClothes: 'casual', requiredExperience: 30, requiredDependability: 30, careerPoints: 22 },

  // Requires Junior College
  { id: 'secretary', title: 'Secretary', location: 'factory', baseWage: 9, hoursPerShift: 6, requiredDegrees: ['junior-college'], requiredClothes: 'dress', requiredExperience: 40, requiredDependability: 40, careerPoints: 25 },
  { id: 'teller', title: 'Teller', location: 'bank', baseWage: 12, hoursPerShift: 6, requiredDegrees: ['junior-college'], requiredClothes: 'dress', requiredExperience: 30, requiredDependability: 30, careerPoints: 25 },
  { id: 'apartment-manager', title: 'Apartment Manager', location: 'rent-office', baseWage: 13, hoursPerShift: 6, requiredDegrees: ['junior-college'], requiredClothes: 'casual', requiredExperience: 30, requiredDependability: 30, careerPoints: 28 },

  // Requires Electronics
  { id: 'technician', title: 'Technician', location: 'socket-city', baseWage: 14, hoursPerShift: 6, requiredDegrees: ['electronics'], requiredClothes: 'casual', requiredExperience: 40, requiredDependability: 40, careerPoints: 30 },
  { id: 'repair-tech', title: 'Repair Technician', location: 'socket-city', baseWage: 15, hoursPerShift: 6, requiredDegrees: ['electronics', 'junior-college'], requiredClothes: 'dress', requiredExperience: 50, requiredDependability: 50, careerPoints: 35 },

  // Requires Business Administration
  { id: 'assistant-manager-bm', title: 'Assistant Manager', location: 'blacks-market', baseWage: 15, hoursPerShift: 6, requiredDegrees: ['business-admin'], requiredClothes: 'dress', requiredExperience: 40, requiredDependability: 40, careerPoints: 35 },
  { id: 'assistant-manager-qt', title: 'Assistant Manager', location: 'qt-clothing', baseWage: 14, hoursPerShift: 6, requiredDegrees: ['business-admin'], requiredClothes: 'dress', requiredExperience: 40, requiredDependability: 40, careerPoints: 33 },
  { id: 'assistant-manager-zmart', title: 'Assistant Manager', location: 'z-mart', baseWage: 15, hoursPerShift: 6, requiredDegrees: ['business-admin'], requiredClothes: 'dress', requiredExperience: 45, requiredDependability: 45, careerPoints: 36 },

  // Requires Trade School + Junior College
  { id: 'machinist', title: 'Machinist', location: 'factory', baseWage: 16, hoursPerShift: 6, requiredDegrees: ['trade-school', 'junior-college'], requiredClothes: 'dress', requiredExperience: 50, requiredDependability: 50, careerPoints: 40 },
  { id: 'executive-secretary', title: 'Executive Secretary', location: 'factory', baseWage: 14, hoursPerShift: 6, requiredDegrees: ['junior-college', 'business-admin'], requiredClothes: 'dress', requiredExperience: 50, requiredDependability: 50, careerPoints: 38 },

  // Manager positions - Require Business Admin + experience
  { id: 'manager-bm', title: 'Manager', location: 'blacks-market', baseWage: 18, hoursPerShift: 6, requiredDegrees: ['business-admin', 'junior-college'], requiredClothes: 'business', requiredExperience: 55, requiredDependability: 55, careerPoints: 50 },
  { id: 'manager-monolith', title: 'Manager', location: 'monolith-burger', baseWage: 17, hoursPerShift: 6, requiredDegrees: ['business-admin'], requiredClothes: 'business', requiredExperience: 50, requiredDependability: 50, careerPoints: 45 },
  { id: 'manager-zmart', title: 'Manager', location: 'z-mart', baseWage: 19, hoursPerShift: 6, requiredDegrees: ['business-admin', 'junior-college'], requiredClothes: 'business', requiredExperience: 55, requiredDependability: 55, careerPoints: 52 },

  // Top tier jobs
  { id: 'department-manager', title: 'Department Manager', location: 'factory', baseWage: 22, hoursPerShift: 6, requiredDegrees: ['junior-college', 'engineering'], requiredClothes: 'business', requiredExperience: 60, requiredDependability: 60, careerPoints: 70 },
  { id: 'engineer', title: 'Engineer', location: 'factory', baseWage: 23, hoursPerShift: 6, requiredDegrees: ['junior-college', 'engineering'], requiredClothes: 'business', requiredExperience: 60, requiredDependability: 60, careerPoints: 75 },
  { id: 'broker', title: 'Broker', location: 'bank', baseWage: 22, hoursPerShift: 6, requiredDegrees: ['academic', 'business-admin'], requiredClothes: 'business', requiredExperience: 60, requiredDependability: 60, careerPoints: 70 },
  { id: 'professor', title: 'Professor', location: 'hi-tech-u', baseWage: 20, hoursPerShift: 6, requiredDegrees: ['research'], requiredClothes: 'business', requiredExperience: 65, requiredDependability: 65, careerPoints: 65 },
  { id: 'general-manager', title: 'General Manager', location: 'factory', baseWage: 25, hoursPerShift: 6, requiredDegrees: ['engineering', 'business-admin'], requiredClothes: 'business', requiredExperience: 70, requiredDependability: 70, careerPoints: 100 },
];

// APPLIANCES - Based on wiki prices
export const APPLIANCES: Appliance[] = [
  { id: 'refrigerator', name: 'Refrigerator', socketCityPrice: 876, zMartPrice: 650, happiness: 1, canBreak: true, canBeStolen: false, special: 'Stores up to 6 weeks of fresh food' },
  { id: 'freezer', name: 'Freezer', socketCityPrice: 500, zMartPrice: 375, happiness: 1, canBreak: true, canBeStolen: true, special: 'With refrigerator, stores up to 12 weeks of food' },
  { id: 'computer', name: 'Computer', socketCityPrice: 1599, zMartPrice: null, happiness: 3, canBreak: true, canBeStolen: false, special: 'Reduces lessons needed by 1. Cannot be stolen.' },
  { id: 'television', name: 'Television', socketCityPrice: 650, zMartPrice: 450, happiness: 2, canBreak: true, canBeStolen: true, special: 'Triggers TV weekend events' },
  { id: 'bw-tv', name: 'Black & White TV', socketCityPrice: 0, zMartPrice: 200, happiness: 1, canBreak: true, canBeStolen: true, special: 'Only at Z-Mart' },
  { id: 'stereo', name: 'Stereo', socketCityPrice: 400, zMartPrice: 450, happiness: 2, canBreak: true, canBeStolen: true, special: 'Cheaper at Socket City' },
  { id: 'vcr', name: 'VCR', socketCityPrice: 550, zMartPrice: 400, happiness: 2, canBreak: true, canBeStolen: true, special: 'Triggers VCR weekend events' },
  { id: 'microwave', name: 'Microwave', socketCityPrice: 350, zMartPrice: 250, happiness: 1, canBreak: true, canBeStolen: true, special: 'Triggers microwave weekend events' },
  { id: 'stove', name: 'Stove', socketCityPrice: 600, zMartPrice: 450, happiness: 1, canBreak: true, canBeStolen: true, special: 'Alternative to microwave for cooking bonus' },
  { id: 'encyclopedia', name: 'Encyclopedia', socketCityPrice: 300, zMartPrice: 200, happiness: 1, canBreak: false, canBeStolen: true, special: 'With dictionary+atlas: -1 lesson per degree' },
  { id: 'dictionary', name: 'Dictionary', socketCityPrice: 150, zMartPrice: 100, happiness: 1, canBreak: false, canBeStolen: true, special: 'With encyclopedia+atlas: -1 lesson per degree' },
  { id: 'atlas', name: 'Atlas', socketCityPrice: 150, zMartPrice: 100, happiness: 1, canBreak: false, canBeStolen: true, special: 'With encyclopedia+dictionary: -1 lesson per degree' },
];

// CLOTHING - Based on wiki
export const CLOTHING = {
  casual: {
    qtPrice: 80, // Lasts 13 weeks at QT
    zMartPrice: 50, // Lasts 8 weeks at Z-Mart
    qtDuration: 13,
    zMartDuration: 8,
    happiness: 0,
  },
  dress: {
    qtPrice: 150,
    zMartPrice: 100,
    qtDuration: 13,
    zMartDuration: 8,
    happiness: 2, // Only at QT
  },
  business: {
    qtPrice: 300,
    zMartPrice: null, // Only at QT Clothing
    qtDuration: 13,
    zMartDuration: 0,
    happiness: 3,
  },
};

// FAST FOOD - Monolith Burgers menu based on wiki
export const FAST_FOOD: FastFoodItem[] = [
  { id: 'burger', name: 'Burger', basePrice: 8, preventsStarvation: true, happinessBonus: 0 },
  { id: 'cheeseburger', name: 'Cheeseburger', basePrice: 12, preventsStarvation: true, happinessBonus: 1 },
  { id: 'astro-chicken', name: 'Astro Chicken', basePrice: 15, preventsStarvation: true, happinessBonus: 2 },
  { id: 'soft-drink', name: 'Soft Drink', basePrice: 5, preventsStarvation: false, happinessBonus: 1 },
  { id: 'deluxe-meal', name: 'Deluxe Meal', basePrice: 25, preventsStarvation: true, happinessBonus: 3 },
];

// FRESH FOOD - Black's Market
export const FRESH_FOOD = {
  pricePerUnit: 20, // Base price per unit
  maxWithoutFridge: 0, // Spoils without refrigerator
  maxWithFridge: 6,
  maxWithFreezer: 12,
  happinessPerUnit: 1,
};

// TICKETS - for special weekend events
export const TICKETS = {
  lottery: { price: 10, quantity: 10, happiness: 2 }, // $10 for 10 tickets
  baseball: { basePrice: 30, happiness: 5 },
  theatre: { basePrice: 40, happiness: 4 },
  concert: { basePrice: 50, happiness: 6 },
};

// STOCKS - Based on wiki (6 stocks, T-Bills are safest)
export const STOCKS: Stock[] = [
  { id: 'tbills', name: 'T-Bills', basePrice: 100, currentPrice: 100, isSafe: true },
  { id: 'amalgamated', name: 'Amalgamated', basePrice: 50, currentPrice: 50, isSafe: false },
  { id: 'consolidated', name: 'Consolidated', basePrice: 75, currentPrice: 75, isSafe: false },
  { id: 'diversified', name: 'Diversified', basePrice: 60, currentPrice: 60, isSafe: false },
  { id: 'incorporated', name: 'Incorporated', basePrice: 80, currentPrice: 80, isSafe: false },
  { id: 'unlimited', name: 'Unlimited', basePrice: 40, currentPrice: 40, isSafe: false },
];

// APARTMENTS - Based on wiki
export const APARTMENTS = {
  'low-cost': {
    name: 'Low-Cost Housing',
    baseRent: 125,
    canBeRobbed: true,
    description: 'Cheap rent but Wild Willy may steal your belongings',
  },
  'security': {
    name: 'LeSecurity Apartments',
    baseRent: 350,
    canBeRobbed: false,
    description: 'Safe and secure, but expensive',
  },
};

// WEEKEND EVENTS - Based on wiki (42+ events)
export const WEEKEND_EVENTS: WeekendEvent[] = [
  // Cheap weekends
  { text: "You had a quiet weekend at home reading.", cost: 5, happinessChange: 1 },
  { text: "You stayed home and watched TV.", cost: 10, happinessChange: 1 },
  { text: "You played horseshoes in the backyard.", cost: 15, happinessChange: 2 },
  { text: "You had friends over for a potluck dinner.", cost: 20, happinessChange: 2 },
  { text: "You visited the local museum.", cost: 20, happinessChange: 2 },
  { text: "You went for a hike in the mountains.", cost: 15, happinessChange: 3 },
  { text: "You spent the weekend gardening.", cost: 10, happinessChange: 2 },
  { text: "You watched old movies on TV.", cost: 10, happinessChange: 1 },

  // Medium weekends
  { text: "You went to a great party!", cost: 40, happinessChange: 3 },
  { text: "You took a day trip to the beach.", cost: 45, happinessChange: 3 },
  { text: "You went bowling with friends.", cost: 35, happinessChange: 2 },
  { text: "You tried a new restaurant in town.", cost: 50, happinessChange: 3 },
  { text: "You went to the movies.", cost: 30, happinessChange: 2 },
  { text: "You had a barbecue with neighbors.", cost: 40, happinessChange: 3 },
  { text: "You spent the day at an amusement park.", cost: 55, happinessChange: 4 },
  { text: "You went shopping at the mall.", cost: 45, happinessChange: 2 },

  // Expensive weekends
  { text: "You went to a fancy restaurant.", cost: 80, happinessChange: 4 },
  { text: "You went to a concert. It was amazing!", cost: 100, happinessChange: 5 },
  { text: "You took a weekend getaway.", cost: 95, happinessChange: 5 },
  { text: "You went to a spa for relaxation.", cost: 85, happinessChange: 4 },
  { text: "You threw a big party at your place.", cost: 90, happinessChange: 4 },

  // Special/rare events
  { text: "You went to Las Vegas and hit the jackpot! Just kidding, you lost.", cost: 200, happinessChange: -2 },
  { text: "You splurged on a shopping spree.", cost: 150, happinessChange: 3 },
  { text: "Your car broke down. Repairs needed.", cost: 175, happinessChange: -3 },

  // Microwave specific
  { text: "You spent the weekend trying microwave recipes.", cost: 25, happinessChange: 2 },

  // VCR specific
  { text: "You binge-watched movies on your VCR all weekend.", cost: 20, happinessChange: 3 },

  // Stereo specific
  { text: "You hosted a dance party with your stereo!", cost: 35, happinessChange: 4 },

  // TV specific
  { text: "You spent the weekend binge-watching TV.", cost: 15, happinessChange: 2 },

  // Computer specific
  { text: "You spent the weekend playing computer games.", cost: 10, happinessChange: 3 },

  // Negative events
  { text: "Medical emergency! Doctor's visit required.", cost: 150, happinessChange: -4 },
  { text: "You got a parking ticket.", cost: 50, happinessChange: -1 },
  { text: "Your pipes burst. Plumber called.", cost: 100, happinessChange: -2 },
  { text: "You had to bail a friend out of jail.", cost: 200, happinessChange: -3 },
];

// LOTTERY PRIZES - Based on wiki
export const LOTTERY_PRIZES = [
  { tickets: 10, prizes: [{ amount: 200, chance: 0.01 }, { amount: 50, chance: 0.05 }] },
  { tickets: 50, prizes: [{ amount: 500, chance: 0.05 }, { amount: 200, chance: 0.1 }] },
  { tickets: 100, prizes: [{ amount: 1000, chance: 0.05 }, { amount: 500, chance: 0.1 }, { amount: 200, chance: 0.2 }] },
  { tickets: 500, prizes: [{ amount: 5000, chance: 0.05 }, { amount: 500, chance: 0.2 }, { amount: 200, chance: 1.0 }] }, // Guaranteed $200 at 500 tickets
];

// WILD WILLY events - Based on wiki
export const WILD_WILLY = {
  streetRobbery: {
    locations: ['bank', 'blacks-market'],
    minWeek: 4,
    happinessLoss: 3,
    description: 'Wild Willy robbed you on the street! All cash stolen!',
  },
  apartmentRobbery: {
    location: 'low-cost-housing',
    chancePerItem: 0.25, // 25% per item type
    happinessLoss: 4,
    description: 'Wild Willy broke into your apartment!',
  },
};

// DOCTOR VISIT - Based on wiki
export const DOCTOR_VISIT = {
  minCost: 30,
  maxCost: 200,
  hoursLost: 10,
  happinessLoss: 4,
  triggers: ['starvation', 'spoiled-food', 'low-relaxation'],
};

export const AVATARS = [
  { id: 'jones', name: 'Jones', emoji: '🧔', description: 'The legendary competitor' },
  { id: 'player1', name: 'Alex', emoji: '👨', description: 'Ready to succeed' },
  { id: 'player2', name: 'Sam', emoji: '👩', description: 'Ambitious go-getter' },
  { id: 'player3', name: 'Jordan', emoji: '🧑', description: 'Street smart' },
  { id: 'player4', name: 'Casey', emoji: '👱', description: 'The optimist' },
];

// Helper functions
export function createInitialPlayer(id: string, name: string, avatar: string): Player {
  return {
    id,
    name,
    avatar,
    money: 50,
    bankBalance: 0,
    happiness: 10,
    education: 1, // Starting education
    career: 0,
    currentLocation: 'low-cost-housing',
    job: null,
    degrees: [],
    clothes: {
      casual: 6, // Start with 6 weeks of casual clothes
      dress: 0,
      business: 0,
    },
    food: 2, // 2 weeks of food
    hasFastFood: false,
    hoursRemaining: 60,
    items: [],
    apartment: 'low-cost',
    studyProgress: {},
    enrolledCourses: [],
    experience: 0,
    dependability: 10,
    relaxation: 25, // Starting relaxation (range 10-50)
    stocks: {},
    lotteryTickets: 0,
    pawnedItems: [],
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
    economyIndex: 0, // Neutral economy
    rentDue: false,
    weekendEvent: null,
    stockPrices: STOCKS.reduce((acc, stock) => ({ ...acc, [stock.id]: stock.basePrice }), {}),
    pawnShopItems: [],
    newspaper: null,
  };
}

// Calculate price based on economy (50% to 250% of base)
export function calculatePrice(basePrice: number, economyIndex: number): number {
  // Economy index ranges from -30 to 90
  // This maps to 50% to 250% price
  const multiplier = 1 + (economyIndex / 100);
  return Math.round(basePrice * Math.max(0.5, Math.min(2.5, multiplier)));
}

// Calculate wage based on economy and experience
// Experience bonus: up to 50% more wage at 100 experience
export function calculateWage(baseWage: number, economyIndex: number, experience: number = 0): number {
  const economyMultiplier = 1 + (economyIndex / 100);
  const experienceBonus = 1 + (experience / 200); // 0 exp = 1x, 100 exp = 1.5x
  return Math.round(baseWage * Math.max(0.5, Math.min(2.5, economyMultiplier)) * experienceBonus);
}

// Check if player has required clothing level
export function hasRequiredClothing(player: Player, required: ClothingLevel): boolean {
  if (required === 'none') return true;
  if (required === 'casual') return player.clothes.casual > 0 || player.clothes.dress > 0 || player.clothes.business > 0;
  if (required === 'dress') return player.clothes.dress > 0 || player.clothes.business > 0;
  if (required === 'business') return player.clothes.business > 0;
  return false;
}

// Get current clothing level
export function getCurrentClothingLevel(player: Player): ClothingLevel {
  if (player.clothes.business > 0) return 'business';
  if (player.clothes.dress > 0) return 'dress';
  if (player.clothes.casual > 0) return 'casual';
  return 'none';
}

// Check if player meets job requirements
export function meetsJobRequirements(player: Player, job: Job): { eligible: boolean; reason?: string } {
  // Check degrees
  for (const degree of job.requiredDegrees) {
    if (!player.degrees.includes(degree)) {
      const degreeInfo = DEGREES.find(d => d.id === degree);
      return { eligible: false, reason: `Requires ${degreeInfo?.name || degree} degree` };
    }
  }

  // Check clothing
  if (!hasRequiredClothing(player, job.requiredClothes)) {
    return { eligible: false, reason: `Requires ${job.requiredClothes} clothes` };
  }

  // Check experience
  if (player.experience < job.requiredExperience) {
    return { eligible: false, reason: `Requires ${job.requiredExperience} experience (you have ${player.experience})` };
  }

  // Check dependability
  if (player.dependability < job.requiredDependability) {
    return { eligible: false, reason: `Requires ${job.requiredDependability} dependability (you have ${player.dependability})` };
  }

  return { eligible: true };
}

// Get available degrees for a player
export function getAvailableDegrees(player: Player): Degree[] {
  return DEGREES.filter(degree => {
    // Already have it
    if (player.degrees.includes(degree.id)) return false;
    // Already enrolled
    if (player.enrolledCourses.includes(degree.id)) return false;
    // Check prerequisites
    return degree.prerequisites.every(prereq => player.degrees.includes(prereq));
  });
}

// Calculate lessons required (affected by books and computer)
export function getLessonsRequired(player: Player, degree: Degree): number {
  let lessons = degree.lessonsRequired;

  // Computer gives +1 extra credit (reduces lessons by 1)
  if (player.items.includes('computer')) {
    lessons -= 1;
  }

  // All three books reduce lessons by 2
  if (player.items.includes('encyclopedia') &&
      player.items.includes('dictionary') &&
      player.items.includes('atlas')) {
    lessons -= 2;
  }

  return Math.max(1, lessons);
}

// Calculate max food storage
export function getMaxFoodStorage(player: Player): number {
  if (!player.items.includes('refrigerator')) return 0;
  if (player.items.includes('freezer')) return FRESH_FOOD.maxWithFreezer;
  return FRESH_FOOD.maxWithFridge;
}

// For backwards compatibility - old clothing level type
export type OldClothingLevel = 'rags' | 'casual' | 'business' | 'executive';

// Legacy rent prices for compatibility
export const RENT_PRICES = {
  'low-cost': 125,
  'security': 350,
};
