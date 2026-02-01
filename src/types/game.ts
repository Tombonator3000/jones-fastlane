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
  // Turn tracking for wiki mechanics
  hasRelaxedThisTurn: boolean;
  // Rent debt for garnishment system
  rentDebt: number;
  // Current wage (can be affected by pay cuts)
  currentWage: number | null;
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

// Wild Willy event types
export interface WildWillyEvent {
  type: 'street' | 'apartment';
  amountStolen?: number; // For street robbery (all cash)
  itemsStolen?: string[]; // For apartment robbery
  happinessLoss: number;
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
  // Wiki Economy System:
  // - economicIndex: -3 to +3 (market trend indicator, affects crash/boom probability)
  // - economyReading: -30 to +90 (actual price multiplier, CD-ROM version)
  economicIndex: number; // -3 to +3, trend indicator
  economyReading: number; // -30 to +90, price multiplier (replaces old economyIndex)
  rentDue: boolean;
  weekendEvent: WeekendEvent | null;
  wildWillyEvent: WildWillyEvent | null; // For showing Wild Willy robbery dialog
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

// JOBS - Based on wiki: https://jonesinthefastlane.fandom.com/wiki/List_of_Jobs
// (*) CD-ROM only jobs - included for completeness
// (**) Cook - Anyone can get this job, no matter their stats
export const JOBS: Job[] = [
  // ========== Z-MART ==========
  { id: 'clerk-zmart', title: 'Clerk', location: 'z-mart', baseWage: 5, hoursPerShift: 6, requiredDegrees: [], requiredClothes: 'casual', requiredExperience: 10, requiredDependability: 10, careerPoints: 5 },
  { id: 'assistant-manager-zmart', title: 'Assistant Manager', location: 'z-mart', baseWage: 7, hoursPerShift: 6, requiredDegrees: [], requiredClothes: 'dress', requiredExperience: 20, requiredDependability: 20, careerPoints: 10 },
  { id: 'manager-zmart', title: 'Manager', location: 'z-mart', baseWage: 8, hoursPerShift: 6, requiredDegrees: ['junior-college'], requiredClothes: 'business', requiredExperience: 30, requiredDependability: 30, careerPoints: 15 },

  // ========== MONOLITH BURGERS ==========
  // (**) Cook - Anyone can get this job, 0 experience required
  { id: 'cook-monolith', title: 'Cook', location: 'monolith-burger', baseWage: 5, hoursPerShift: 6, requiredDegrees: [], requiredClothes: 'casual', requiredExperience: 0, requiredDependability: 10, careerPoints: 3 },
  { id: 'clerk-monolith', title: 'Clerk', location: 'monolith-burger', baseWage: 6, hoursPerShift: 6, requiredDegrees: [], requiredClothes: 'casual', requiredExperience: 10, requiredDependability: 20, careerPoints: 7 },
  { id: 'assistant-manager-monolith', title: 'Assistant Manager', location: 'monolith-burger', baseWage: 7, hoursPerShift: 6, requiredDegrees: [], requiredClothes: 'casual', requiredExperience: 20, requiredDependability: 30, careerPoints: 12 },
  { id: 'manager-monolith', title: 'Manager', location: 'monolith-burger', baseWage: 8, hoursPerShift: 6, requiredDegrees: ['junior-college'], requiredClothes: 'dress', requiredExperience: 30, requiredDependability: 40, careerPoints: 18 },

  // ========== QT CLOTHING ==========
  // (*) Janitor - CD-ROM only
  { id: 'janitor-qt', title: 'Janitor', location: 'qt-clothing', baseWage: 6, hoursPerShift: 6, requiredDegrees: [], requiredClothes: 'casual', requiredExperience: 10, requiredDependability: 20, careerPoints: 6 },
  { id: 'salesperson-qt', title: 'Salesperson', location: 'qt-clothing', baseWage: 8, hoursPerShift: 6, requiredDegrees: [], requiredClothes: 'dress', requiredExperience: 30, requiredDependability: 30, careerPoints: 15 },
  { id: 'assistant-manager-qt', title: 'Assistant Manager', location: 'qt-clothing', baseWage: 9, hoursPerShift: 6, requiredDegrees: ['junior-college'], requiredClothes: 'business', requiredExperience: 40, requiredDependability: 40, careerPoints: 22 },
  { id: 'manager-qt', title: 'Manager', location: 'qt-clothing', baseWage: 12, hoursPerShift: 6, requiredDegrees: ['business-admin'], requiredClothes: 'business', requiredExperience: 50, requiredDependability: 50, careerPoints: 35 },

  // ========== SOCKET CITY ==========
  // (*) Clerk - CD-ROM only
  { id: 'clerk-socket', title: 'Clerk', location: 'socket-city', baseWage: 6, hoursPerShift: 6, requiredDegrees: [], requiredClothes: 'casual', requiredExperience: 10, requiredDependability: 20, careerPoints: 6 },
  { id: 'salesperson-socket', title: 'Salesperson', location: 'socket-city', baseWage: 7, hoursPerShift: 6, requiredDegrees: [], requiredClothes: 'dress', requiredExperience: 30, requiredDependability: 30, careerPoints: 12 },
  { id: 'electronics-repairman', title: 'Electronics Repairman', location: 'socket-city', baseWage: 11, hoursPerShift: 6, requiredDegrees: ['electronics'], requiredClothes: 'casual', requiredExperience: 40, requiredDependability: 40, careerPoints: 30 },
  { id: 'manager-socket', title: 'Manager', location: 'socket-city', baseWage: 14, hoursPerShift: 6, requiredDegrees: ['electronics', 'junior-college'], requiredClothes: 'business', requiredExperience: 40, requiredDependability: 40, careerPoints: 42 },

  // ========== HI-TECH U ==========
  { id: 'janitor-hitechu', title: 'Janitor', location: 'hi-tech-u', baseWage: 5, hoursPerShift: 6, requiredDegrees: [], requiredClothes: 'casual', requiredExperience: 10, requiredDependability: 10, careerPoints: 4 },
  { id: 'teacher-hitechu', title: 'Teacher', location: 'hi-tech-u', baseWage: 11, hoursPerShift: 6, requiredDegrees: ['academic'], requiredClothes: 'dress', requiredExperience: 40, requiredDependability: 50, careerPoints: 32 },
  { id: 'professor-hitechu', title: 'Professor', location: 'hi-tech-u', baseWage: 20, hoursPerShift: 6, requiredDegrees: ['research'], requiredClothes: 'dress', requiredExperience: 50, requiredDependability: 60, careerPoints: 65 },

  // ========== FACTORY ==========
  { id: 'janitor-factory', title: 'Janitor', location: 'factory', baseWage: 7, hoursPerShift: 6, requiredDegrees: [], requiredClothes: 'casual', requiredExperience: 10, requiredDependability: 20, careerPoints: 8 },
  { id: 'assembly-worker', title: 'Assembly Worker', location: 'factory', baseWage: 8, hoursPerShift: 6, requiredDegrees: ['trade-school'], requiredClothes: 'casual', requiredExperience: 30, requiredDependability: 30, careerPoints: 18 },
  { id: 'secretary-factory', title: 'Secretary', location: 'factory', baseWage: 9, hoursPerShift: 6, requiredDegrees: ['junior-college'], requiredClothes: 'dress', requiredExperience: 40, requiredDependability: 40, careerPoints: 24 },
  { id: 'machinists-helper', title: "Machinist's Helper", location: 'factory', baseWage: 10, hoursPerShift: 6, requiredDegrees: ['pre-engineering'], requiredClothes: 'casual', requiredExperience: 40, requiredDependability: 40, careerPoints: 28 },
  { id: 'executive-secretary', title: 'Executive Secretary', location: 'factory', baseWage: 18, hoursPerShift: 6, requiredDegrees: ['business-admin'], requiredClothes: 'business', requiredExperience: 50, requiredDependability: 50, careerPoints: 55 },
  { id: 'machinist', title: 'Machinist', location: 'factory', baseWage: 19, hoursPerShift: 6, requiredDegrees: ['engineering'], requiredClothes: 'casual', requiredExperience: 50, requiredDependability: 50, careerPoints: 58 },
  { id: 'department-manager', title: 'Department Manager', location: 'factory', baseWage: 22, hoursPerShift: 6, requiredDegrees: ['junior-college', 'engineering'], requiredClothes: 'business', requiredExperience: 60, requiredDependability: 60, careerPoints: 72 },
  { id: 'engineer', title: 'Engineer', location: 'factory', baseWage: 23, hoursPerShift: 6, requiredDegrees: ['junior-college', 'engineering'], requiredClothes: 'business', requiredExperience: 60, requiredDependability: 60, careerPoints: 78 },
  { id: 'general-manager', title: 'General Manager', location: 'factory', baseWage: 25, hoursPerShift: 6, requiredDegrees: ['business-admin', 'engineering'], requiredClothes: 'business', requiredExperience: 70, requiredDependability: 70, careerPoints: 100 },

  // ========== BANK ==========
  { id: 'janitor-bank', title: 'Janitor', location: 'bank', baseWage: 6, hoursPerShift: 6, requiredDegrees: [], requiredClothes: 'casual', requiredExperience: 10, requiredDependability: 20, careerPoints: 6 },
  { id: 'teller-bank', title: 'Teller', location: 'bank', baseWage: 10, hoursPerShift: 6, requiredDegrees: ['junior-college'], requiredClothes: 'dress', requiredExperience: 40, requiredDependability: 40, careerPoints: 28 },
  { id: 'assistant-manager-bank', title: 'Assistant Manager', location: 'bank', baseWage: 14, hoursPerShift: 6, requiredDegrees: ['business-admin'], requiredClothes: 'business', requiredExperience: 50, requiredDependability: 50, careerPoints: 42 },
  { id: 'manager-bank', title: 'Manager', location: 'bank', baseWage: 19, hoursPerShift: 6, requiredDegrees: ['business-admin'], requiredClothes: 'business', requiredExperience: 60, requiredDependability: 60, careerPoints: 60 },
  { id: 'broker-bank', title: 'Broker', location: 'bank', baseWage: 22, hoursPerShift: 6, requiredDegrees: ['business-admin', 'academic'], requiredClothes: 'business', requiredExperience: 70, requiredDependability: 70, careerPoints: 85 },

  // ========== BLACK'S MARKET ==========
  { id: 'janitor-blacks', title: 'Janitor', location: 'blacks-market', baseWage: 6, hoursPerShift: 6, requiredDegrees: [], requiredClothes: 'casual', requiredExperience: 10, requiredDependability: 10, careerPoints: 5 },
  { id: 'checker-blacks', title: 'Checker', location: 'blacks-market', baseWage: 8, hoursPerShift: 6, requiredDegrees: [], requiredClothes: 'casual', requiredExperience: 20, requiredDependability: 20, careerPoints: 12 },
  { id: 'butcher-blacks', title: 'Butcher', location: 'blacks-market', baseWage: 12, hoursPerShift: 6, requiredDegrees: ['trade-school'], requiredClothes: 'casual', requiredExperience: 30, requiredDependability: 30, careerPoints: 32 },
  { id: 'assistant-manager-blacks', title: 'Assistant Manager', location: 'blacks-market', baseWage: 15, hoursPerShift: 6, requiredDegrees: ['junior-college'], requiredClothes: 'dress', requiredExperience: 40, requiredDependability: 40, careerPoints: 45 },
  { id: 'manager-blacks', title: 'Manager', location: 'blacks-market', baseWage: 18, hoursPerShift: 6, requiredDegrees: ['business-admin'], requiredClothes: 'business', requiredExperience: 50, requiredDependability: 50, careerPoints: 58 },

  // ========== RENT OFFICE ==========
  { id: 'groundskeeper-rent', title: 'Groundskeeper', location: 'rent-office', baseWage: 7, hoursPerShift: 6, requiredDegrees: [], requiredClothes: 'casual', requiredExperience: 10, requiredDependability: 20, careerPoints: 8 },
  { id: 'apartment-manager-rent', title: 'Apartment Manager', location: 'rent-office', baseWage: 9, hoursPerShift: 6, requiredDegrees: ['junior-college'], requiredClothes: 'casual', requiredExperience: 30, requiredDependability: 30, careerPoints: 22 },
];

// APPLIANCES - Based on wiki prices
// Wiki: Some items can NEVER be stolen by Wild Willy: Refrigerator, Freezer, Stove, Computer, Encyclopedia, Dictionary, Atlas
export const APPLIANCES: Appliance[] = [
  { id: 'refrigerator', name: 'Refrigerator', socketCityPrice: 876, zMartPrice: 650, happiness: 1, canBreak: true, canBeStolen: false, special: 'Stores up to 6 weeks of fresh food' },
  { id: 'freezer', name: 'Freezer', socketCityPrice: 500, zMartPrice: 375, happiness: 1, canBreak: true, canBeStolen: false, special: 'With refrigerator, stores up to 12 weeks of food' },
  { id: 'computer', name: 'Computer', socketCityPrice: 1599, zMartPrice: null, happiness: 3, canBreak: true, canBeStolen: false, special: 'Reduces lessons needed by 1. Cannot be stolen.' },
  { id: 'television', name: 'Television', socketCityPrice: 650, zMartPrice: 450, happiness: 2, canBreak: true, canBeStolen: true, special: 'Triggers TV weekend events' },
  { id: 'bw-tv', name: 'Black & White TV', socketCityPrice: 0, zMartPrice: 200, happiness: 1, canBreak: true, canBeStolen: true, special: 'Only at Z-Mart' },
  { id: 'stereo', name: 'Stereo', socketCityPrice: 400, zMartPrice: 450, happiness: 2, canBreak: true, canBeStolen: true, special: 'Cheaper at Socket City' },
  { id: 'vcr', name: 'VCR', socketCityPrice: 550, zMartPrice: 400, happiness: 2, canBreak: true, canBeStolen: true, special: 'Triggers VCR weekend events' },
  { id: 'microwave', name: 'Microwave', socketCityPrice: 350, zMartPrice: 250, happiness: 1, canBreak: true, canBeStolen: true, special: 'Triggers microwave weekend events' },
  { id: 'stove', name: 'Stove', socketCityPrice: 600, zMartPrice: 450, happiness: 1, canBreak: true, canBeStolen: false, special: 'Alternative to microwave for cooking bonus' },
  { id: 'encyclopedia', name: 'Encyclopedia', socketCityPrice: 300, zMartPrice: 200, happiness: 1, canBreak: false, canBeStolen: false, special: 'With dictionary+atlas: -1 lesson per degree' },
  { id: 'dictionary', name: 'Dictionary', socketCityPrice: 150, zMartPrice: 100, happiness: 1, canBreak: false, canBeStolen: false, special: 'With encyclopedia+atlas: -1 lesson per degree' },
  { id: 'atlas', name: 'Atlas', socketCityPrice: 150, zMartPrice: 100, happiness: 1, canBreak: false, canBeStolen: false, special: 'With encyclopedia+dictionary: -1 lesson per degree' },
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
    minWeek: 4, // Wiki: Only on or after Week #4
    happinessLoss: 3, // Wiki: -3 Happiness
    description: 'Wild Willy robbed you on the street! All cash stolen!',
    // Wiki: Different chances based on location
    chances: {
      'bank': 1 / 31, // ~3.2% chance when leaving bank
      'blacks-market': 1 / 51, // ~1.95% chance when leaving market
    } as Record<string, number>,
  },
  apartmentRobbery: {
    location: 'low-cost-housing',
    chancePerItemType: 0.25, // Wiki: 25% chance per item TYPE (not per item)
    happinessLoss: 4, // Wiki: -4 Happiness
    description: 'Wild Willy broke into your apartment!',
  },
  // Items that can NEVER be stolen (per wiki)
  unStealableItems: [
    'refrigerator',
    'freezer',
    'stove',
    'computer',
    'encyclopedia',
    'dictionary',
    'atlas',
  ],
};

// DOCTOR VISIT - Based on wiki
export const DOCTOR_VISIT = {
  minCost: 30,
  maxCost: 200,
  hoursLost: 10,
  happinessLoss: 4,
  triggers: ['starvation', 'spoiled-food', 'low-relaxation'],
};

// STARVATION - Based on wiki (separate from doctor visit)
export const STARVATION = {
  hoursLost: 20, // Wiki: "advances the clock by 20 Hours (1/3 of a turn!)"
  happinessLoss: 4,
  doctorChance: 0.5, // 50% chance of doctor visit when starving
};

// RELAXATION - Based on wiki
export const RELAXATION = {
  minValue: 10,
  maxValue: 50,
  hoursPerRelax: 6,
  relaxationGain: 3,
  happinessFirstRelax: 2, // Only first relax per turn gives happiness
  lowRelaxationThreshold: 10, // Doctor visit chance at this level
  doctorChanceAtMin: 0.25, // 25% chance of doctor visit when relaxation is at minimum
};

// MARKET EVENTS - Based on wiki
export const MARKET_EVENTS = {
  minWeekForCrash: 8, // Crashes only happen on week 8+
  minWeekForBoom: 4,
  crashTypes: {
    minor: { economyDrop: 15, payCutChance: 0, fireChance: 0, wipeBanks: false },
    moderate: { economyDrop: 25, payCutChance: 0.3, fireChance: 0, wipeBanks: false },
    major: { economyDrop: 40, payCutChance: 1.0, fireChance: 1.0, wipeBanks: true },
  },
  boomTypes: {
    minor: { economyBoost: 15 },
    moderate: { economyBoost: 25 },
    major: { economyBoost: 40 },
  },
  payCutMultiplier: 0.8, // Pay cut reduces wage to 80%
};

// RENT GARNISHMENT - Based on wiki
export const RENT_GARNISHMENT = {
  garnishmentRate: 0.25, // 25% of wages garnished until debt paid
  description: 'Your wages are being garnished to pay back rent!',
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
    hasRelaxedThisTurn: false,
    rentDebt: 0,
    currentWage: null,
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
    // Wiki: Economy starts neutral
    economicIndex: 0, // -3 to +3, neutral start
    economyReading: 0, // -30 to +90, neutral start
    rentDue: false,
    weekendEvent: null,
    wildWillyEvent: null,
    stockPrices: STOCKS.reduce((acc, stock) => ({ ...acc, [stock.id]: stock.basePrice }), {}),
    pawnShopItems: [],
    newspaper: null,
  };
}

// Calculate price based on economy (50% to 250% of base)
// Wiki formula: Item Price = Base Price + (Base Price × Reading / 60)
// Reading ranges from -30 to +90, giving 50% to 250% of base price
export function calculatePrice(basePrice: number, economyReading: number): number {
  // Wiki: Item Price = Base Price + (Base Price × Reading / 60)
  // At Reading -30: 1 + (-30/60) = 0.5 = 50%
  // At Reading 0: 1 + (0/60) = 1.0 = 100%
  // At Reading +90: 1 + (90/60) = 2.5 = 250%
  const multiplier = 1 + (economyReading / 60);
  return Math.round(basePrice * Math.max(0.5, Math.min(2.5, multiplier)));
}

// Calculate wage based on economy and experience
// Wiki: Wages use same formula as prices
// Experience bonus: up to 50% more wage at 100 experience
export function calculateWage(baseWage: number, economyReading: number, experience: number = 0): number {
  // Wiki: Same formula as prices - Reading / 60
  const economyMultiplier = 1 + (economyReading / 60);
  const experienceBonus = 1 + (experience / 200); // 0 exp = 1x, 100 exp = 1.5x
  return Math.round(baseWage * Math.max(0.5, Math.min(2.5, economyMultiplier)) * experienceBonus);
}

// ===== WIKI ECONOMY SYSTEM =====
// The game calculates Economy at the start of every Turn using complex formula
// Results: Index (-3 to +3) and Reading (-30 to +90)

export interface EconomyCalculation {
  newIndex: number;      // -3 to +3
  newReading: number;    // -30 to +90
  crashOccurred: boolean;
  boomOccurred: boolean;
  crashType?: 'minor' | 'moderate' | 'major';
  boomType?: 'minor' | 'moderate' | 'major';
}

// Wiki: Calculate new economy state at start of each turn
// Strong economy more likely to crash, weak economy more likely to boom
export function calculateEconomy(
  currentIndex: number,
  currentReading: number,
  week: number
): EconomyCalculation {
  let newIndex = currentIndex;
  let newReading = currentReading;
  let crashOccurred = false;
  let boomOccurred = false;
  let crashType: 'minor' | 'moderate' | 'major' | undefined;
  let boomType: 'minor' | 'moderate' | 'major' | undefined;

  // Wiki: "The formula is quite complex, involving multiple random factors"
  // Step 1: Index naturally drifts based on current state
  // Higher index tends to pull reading up, but increases crash chance
  const indexInfluence = currentIndex * 3; // Index affects reading by ±9 at extremes
  const randomFactor = (Math.random() - 0.5) * 10; // Random ±5

  // Step 2: Calculate new reading based on index influence
  const readingChange = indexInfluence + randomFactor;
  newReading = Math.max(-30, Math.min(90, currentReading + readingChange));

  // Step 3: Adjust index based on reading momentum
  // If reading is high, index tends to stay high (but crash chance increases)
  // If reading is low, index tends to stay low (but boom chance increases)
  const readingMomentum = currentReading / 30; // -1 to +3
  const indexRandomness = (Math.random() - 0.5) * 2; // Random ±1
  newIndex = Math.max(-3, Math.min(3, currentIndex + (readingMomentum * 0.3) + indexRandomness));
  newIndex = Math.round(newIndex); // Keep as integer

  // Wiki: "At the start of each Turn (except on the first 3 Weeks of the game)"
  // Market events can only happen from week 4 onwards
  if (week >= 4) {
    // Wiki: "A stronger economy is liable to Crash, while a weaker one is liable to Boom"

    // Crash probability increases with high reading (strong economy)
    // Base 5% chance, +1% per reading point above 30
    const crashChance = Math.max(0, 0.05 + (currentReading - 30) * 0.01);

    // Boom probability increases with low reading (weak economy)
    // Base 5% chance, +1% per reading point below 0
    const boomChance = Math.max(0, 0.05 + (0 - currentReading) * 0.01);

    if (Math.random() < crashChance) {
      crashOccurred = true;
      // Determine crash severity
      const severityRoll = Math.random();
      if (severityRoll < 0.1) {
        crashType = 'major';
        // Major crash: Banks wiped, players fired
        newReading = Math.max(-30, newReading - 40);
        newIndex = Math.max(-3, newIndex - 2);
      } else if (severityRoll < 0.4) {
        crashType = 'moderate';
        // Moderate crash: Pay cuts possible
        newReading = Math.max(-30, newReading - 25);
        newIndex = Math.max(-3, newIndex - 1);
      } else {
        crashType = 'minor';
        // Minor crash: Small economy drop
        newReading = Math.max(-30, newReading - 15);
      }
    } else if (Math.random() < boomChance) {
      boomOccurred = true;
      // Determine boom severity
      const severityRoll = Math.random();
      if (severityRoll < 0.1) {
        boomType = 'major';
        newReading = Math.min(90, newReading + 40);
        newIndex = Math.min(3, newIndex + 2);
      } else if (severityRoll < 0.4) {
        boomType = 'moderate';
        newReading = Math.min(90, newReading + 25);
        newIndex = Math.min(3, newIndex + 1);
      } else {
        boomType = 'minor';
        newReading = Math.min(90, newReading + 15);
      }
    }
  }

  // Clamp final values
  newIndex = Math.max(-3, Math.min(3, Math.round(newIndex)));
  newReading = Math.max(-30, Math.min(90, Math.round(newReading)));

  return {
    newIndex,
    newReading,
    crashOccurred,
    boomOccurred,
    crashType,
    boomType,
  };
}

// Wiki: Each stock fluctuates independently around economy baseline
export function calculateStockPrice(
  basePrice: number,
  currentPrice: number,
  economyReading: number,
  isSafe: boolean
): number {
  if (isSafe) {
    // T-Bills are safe, only minor fluctuation (±2.5%)
    const change = (Math.random() - 0.5) * 0.05;
    return Math.round(currentPrice * (1 + change));
  }

  // Wiki: Stock prices fluctuate independently around economy baseline
  // The baseline is what price "should" be based on economy
  const economyBaseline = basePrice * (1 + economyReading / 60);

  // Stock can deviate from baseline by ±30%
  const currentDeviation = (currentPrice - economyBaseline) / economyBaseline;

  // Tendency to revert to baseline, plus random walk
  const reversionStrength = 0.1; // 10% reversion per turn
  const randomWalk = (Math.random() - 0.5) * 0.3; // ±15% random change

  const newDeviation = currentDeviation * (1 - reversionStrength) + randomWalk;
  let newPrice = Math.round(economyBaseline * (1 + newDeviation));

  // Wiki: Clamp to 50%-250% of base price
  newPrice = Math.max(Math.round(basePrice * 0.5), Math.min(Math.round(basePrice * 2.5), newPrice));

  return newPrice;
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
