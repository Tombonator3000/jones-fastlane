import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import {
  GameState,
  Player,
  GameGoals,
  Job,
  WeekendEvent,
  createInitialPlayer,
  createInitialGameState,
  WEEKEND_EVENTS,
  APARTMENTS,
  JOBS,
  DEGREES,
  STOCKS,
  WILD_WILLY,
  DOCTOR_VISIT,
  LOTTERY_PRIZES,
  FRESH_FOOD,
  APPLIANCES,
  calculatePrice,
  calculateWage,
  hasRequiredClothing,
  getCurrentClothingLevel,
  meetsJobRequirements,
  getAvailableDegrees,
  getLessonsRequired,
  getMaxFoodStorage,
  ClothingLevel,
} from '@/types/game';

type GameAction =
  | { type: 'START_GAME'; goals: GameGoals }
  | { type: 'ADD_PLAYER'; name: string; avatar: string }
  | { type: 'MOVE_TO_LOCATION'; locationId: string }
  | { type: 'WORK'; hours: number }
  | { type: 'STUDY'; degreeId: string; hours: number }
  | { type: 'BUY_FAST_FOOD'; itemId: string; cost: number; happiness: number }
  | { type: 'BUY_FRESH_FOOD'; units: number; cost: number }
  | { type: 'BUY_CLOTHES'; clothingType: 'casual' | 'dress' | 'business'; store: 'qt' | 'zmart'; cost: number; weeks: number; happiness: number }
  | { type: 'BUY_APPLIANCE'; itemId: string; cost: number; happiness: number; store: 'socket-city' | 'z-mart' }
  | { type: 'APPLY_FOR_JOB'; job: Job }
  | { type: 'ENROLL_DEGREE'; degreeId: string; cost: number }
  | { type: 'PAY_RENT' }
  | { type: 'DEPOSIT_MONEY'; amount: number }
  | { type: 'WITHDRAW_MONEY'; amount: number }
  | { type: 'BUY_STOCK'; stockId: string; quantity: number; price: number }
  | { type: 'SELL_STOCK'; stockId: string; quantity: number; price: number }
  | { type: 'BUY_LOTTERY_TICKETS'; cost: number }
  | { type: 'BUY_TICKET'; ticketType: 'baseball' | 'theatre' | 'concert'; cost: number; happiness: number }
  | { type: 'PAWN_ITEM'; itemId: string; pawnValue: number }
  | { type: 'REDEEM_ITEM'; itemId: string; cost: number }
  | { type: 'END_TURN' }
  | { type: 'CHANGE_APARTMENT'; apartmentType: 'low-cost' | 'security' }
  | { type: 'SET_WEEKEND_EVENT'; event: WeekendEvent | null }
  | { type: 'WILD_WILLY_STREET_ROBBERY' }
  | { type: 'WILD_WILLY_APARTMENT_ROBBERY'; stolenItems: string[] }
  | { type: 'DOCTOR_VISIT'; cost: number }
  | { type: 'PROCESS_LOTTERY' };

function calculateDistance(from: string, to: string): number {
  // Simplified distance calculation - each move costs 1 hour
  if (from === to) return 0;
  return 2;
}

function checkWinCondition(player: Player, goals: GameGoals): boolean {
  const wealthProgress = ((player.money + player.bankBalance) / goals.wealth) * 100;
  const happinessProgress = (player.happiness / goals.happiness) * 100;
  const educationProgress = (player.education / goals.education) * 100;
  const careerProgress = (player.career / goals.career) * 100;

  return wealthProgress >= 100 && happinessProgress >= 100 && educationProgress >= 100 && careerProgress >= 100;
}

function selectWeekendEvent(player: Player): WeekendEvent {
  // Check for item-specific weekends
  const itemEvents: { item: string; events: WeekendEvent[] }[] = [
    { item: 'microwave', events: WEEKEND_EVENTS.filter(e => e.text.toLowerCase().includes('microwave')) },
    { item: 'vcr', events: WEEKEND_EVENTS.filter(e => e.text.toLowerCase().includes('vcr')) },
    { item: 'stereo', events: WEEKEND_EVENTS.filter(e => e.text.toLowerCase().includes('stereo')) },
    { item: 'television', events: WEEKEND_EVENTS.filter(e => e.text.toLowerCase().includes('tv') || e.text.toLowerCase().includes('television')) },
    { item: 'computer', events: WEEKEND_EVENTS.filter(e => e.text.toLowerCase().includes('computer')) },
  ];

  // 20% chance for item-specific weekend if player owns the item
  for (const { item, events } of itemEvents) {
    if (player.items.includes(item) && events.length > 0 && Math.random() < 0.2) {
      return events[Math.floor(Math.random() * events.length)];
    }
  }

  // Otherwise random event
  return WEEKEND_EVENTS[Math.floor(Math.random() * WEEKEND_EVENTS.length)];
}

function processLottery(tickets: number): number {
  if (tickets === 0) return 0;

  // Find the appropriate prize tier
  const tiers = LOTTERY_PRIZES.sort((a, b) => b.tickets - a.tickets);

  for (const tier of tiers) {
    if (tickets >= tier.tickets) {
      for (const prize of tier.prizes) {
        if (Math.random() < prize.chance) {
          return prize.amount;
        }
      }
      break;
    }
  }

  return 0;
}

function updateStockPrices(currentPrices: Record<string, number>, economyIndex: number): Record<string, number> {
  const newPrices: Record<string, number> = {};

  for (const stock of STOCKS) {
    const currentPrice = currentPrices[stock.id] || stock.basePrice;

    if (stock.isSafe) {
      // T-Bills are stable, minor fluctuation
      const change = (Math.random() - 0.5) * 0.05;
      newPrices[stock.id] = Math.round(currentPrice * (1 + change));
    } else {
      // Other stocks fluctuate more, trending toward economy
      const economyTrend = economyIndex / 200;
      const randomChange = (Math.random() - 0.5) * 0.3;
      const totalChange = economyTrend + randomChange;

      let newPrice = Math.round(currentPrice * (1 + totalChange));
      // Clamp to 50% - 250% of base price
      newPrice = Math.max(Math.round(stock.basePrice * 0.5), Math.min(Math.round(stock.basePrice * 2.5), newPrice));
      newPrices[stock.id] = newPrice;
    }
  }

  return newPrices;
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...createInitialGameState(action.goals),
        players: state.players,
        isGameStarted: true,
      };

    case 'ADD_PLAYER': {
      const newPlayer = createInitialPlayer(
        `player-${state.players.length + 1}`,
        action.name,
        action.avatar
      );
      return {
        ...state,
        players: [...state.players, newPlayer],
      };
    }

    case 'MOVE_TO_LOCATION': {
      const currentPlayer = state.players[state.currentPlayerIndex];
      const moveCost = calculateDistance(currentPlayer.currentLocation, action.locationId);

      if (currentPlayer.hoursRemaining < moveCost + 2) {
        return state;
      }

      const updatedPlayers = [...state.players];
      updatedPlayers[state.currentPlayerIndex] = {
        ...currentPlayer,
        currentLocation: action.locationId,
        hoursRemaining: currentPlayer.hoursRemaining - moveCost - 2,
      };

      return { ...state, players: updatedPlayers };
    }

    case 'WORK': {
      const currentPlayer = state.players[state.currentPlayerIndex];
      if (!currentPlayer.job || currentPlayer.hoursRemaining < action.hours) {
        return state;
      }

      // Check clothing requirement
      if (!hasRequiredClothing(currentPlayer, currentPlayer.job.requiredClothes)) {
        return state;
      }

      // Calculate earnings with experience bonus
      const earnings = calculateWage(currentPlayer.job.baseWage, state.economyIndex, currentPlayer.experience) * action.hours;

      // Working increases experience and dependability
      const experienceGain = Math.floor(action.hours / 2);
      const dependabilityGain = 1;

      const updatedPlayers = [...state.players];
      updatedPlayers[state.currentPlayerIndex] = {
        ...currentPlayer,
        money: currentPlayer.money + earnings,
        hoursRemaining: currentPlayer.hoursRemaining - action.hours,
        career: Math.min(100, Math.max(currentPlayer.career, currentPlayer.job.careerPoints)),
        experience: Math.min(100, currentPlayer.experience + experienceGain),
        dependability: Math.min(100, currentPlayer.dependability + dependabilityGain),
      };

      return { ...state, players: updatedPlayers };
    }

    case 'STUDY': {
      const currentPlayer = state.players[state.currentPlayerIndex];
      if (currentPlayer.hoursRemaining < action.hours) {
        return state;
      }

      const degree = DEGREES.find(d => d.id === action.degreeId);
      if (!degree) return state;

      const lessonsRequired = getLessonsRequired(currentPlayer, degree);
      const currentProgress = currentPlayer.studyProgress[action.degreeId] || 0;
      const newProgress = currentProgress + action.hours;
      const completed = newProgress >= lessonsRequired;

      const updatedPlayers = [...state.players];

      // Graduation gives +5 dependability (temporary boost)
      const dependabilityBoost = completed ? 5 : 0;

      updatedPlayers[state.currentPlayerIndex] = {
        ...currentPlayer,
        hoursRemaining: currentPlayer.hoursRemaining - action.hours,
        studyProgress: {
          ...currentPlayer.studyProgress,
          [action.degreeId]: completed ? 0 : newProgress,
        },
        degrees: completed && !currentPlayer.degrees.includes(action.degreeId)
          ? [...currentPlayer.degrees, action.degreeId]
          : currentPlayer.degrees,
        enrolledCourses: completed
          ? currentPlayer.enrolledCourses.filter(c => c !== action.degreeId)
          : currentPlayer.enrolledCourses,
        education: completed ? currentPlayer.education + degree.educationPoints : currentPlayer.education,
        dependability: Math.min(100, currentPlayer.dependability + dependabilityBoost),
      };

      return { ...state, players: updatedPlayers };
    }

    case 'BUY_FAST_FOOD': {
      const currentPlayer = state.players[state.currentPlayerIndex];
      if (currentPlayer.money < action.cost) {
        return state;
      }

      // Only first fast food happiness bonus counts per turn
      const happinessGain = !currentPlayer.hasFastFood ? action.happiness : 0;

      const updatedPlayers = [...state.players];
      updatedPlayers[state.currentPlayerIndex] = {
        ...currentPlayer,
        money: currentPlayer.money - action.cost,
        hasFastFood: true,
        happiness: Math.min(100, currentPlayer.happiness + happinessGain),
      };

      return { ...state, players: updatedPlayers };
    }

    case 'BUY_FRESH_FOOD': {
      const currentPlayer = state.players[state.currentPlayerIndex];
      if (currentPlayer.money < action.cost) {
        return state;
      }

      const maxStorage = getMaxFoodStorage(currentPlayer);
      if (maxStorage === 0) {
        // No refrigerator - food will spoil
        return state;
      }

      const updatedPlayers = [...state.players];
      updatedPlayers[state.currentPlayerIndex] = {
        ...currentPlayer,
        money: currentPlayer.money - action.cost,
        food: Math.min(maxStorage, currentPlayer.food + action.units),
        happiness: Math.min(100, currentPlayer.happiness + action.units * FRESH_FOOD.happinessPerUnit),
      };

      return { ...state, players: updatedPlayers };
    }

    case 'BUY_CLOTHES': {
      const currentPlayer = state.players[state.currentPlayerIndex];
      if (currentPlayer.money < action.cost) {
        return state;
      }

      const updatedClothes = { ...currentPlayer.clothes };
      updatedClothes[action.clothingType] = (updatedClothes[action.clothingType] || 0) + action.weeks;

      const updatedPlayers = [...state.players];
      updatedPlayers[state.currentPlayerIndex] = {
        ...currentPlayer,
        money: currentPlayer.money - action.cost,
        clothes: updatedClothes,
        happiness: Math.min(100, currentPlayer.happiness + action.happiness),
      };

      return { ...state, players: updatedPlayers };
    }

    case 'BUY_APPLIANCE': {
      const currentPlayer = state.players[state.currentPlayerIndex];
      if (currentPlayer.money < action.cost) {
        return state;
      }

      // Only give happiness if player doesn't already own this item
      const happinessGain = !currentPlayer.items.includes(action.itemId) ? action.happiness : 0;

      const updatedPlayers = [...state.players];
      updatedPlayers[state.currentPlayerIndex] = {
        ...currentPlayer,
        money: currentPlayer.money - action.cost,
        items: currentPlayer.items.includes(action.itemId)
          ? currentPlayer.items
          : [...currentPlayer.items, action.itemId],
        happiness: Math.min(100, currentPlayer.happiness + happinessGain),
      };

      return { ...state, players: updatedPlayers };
    }

    case 'APPLY_FOR_JOB': {
      const currentPlayer = state.players[state.currentPlayerIndex];

      const { eligible } = meetsJobRequirements(currentPlayer, action.job);
      if (!eligible) {
        return state;
      }

      const updatedPlayers = [...state.players];
      updatedPlayers[state.currentPlayerIndex] = {
        ...currentPlayer,
        job: action.job,
        career: Math.max(currentPlayer.career, action.job.careerPoints),
        hoursRemaining: currentPlayer.hoursRemaining - 2,
      };

      return { ...state, players: updatedPlayers };
    }

    case 'ENROLL_DEGREE': {
      const currentPlayer = state.players[state.currentPlayerIndex];
      const degree = DEGREES.find(d => d.id === action.degreeId);

      if (!degree ||
          currentPlayer.money < action.cost ||
          currentPlayer.degrees.includes(action.degreeId) ||
          currentPlayer.enrolledCourses.includes(action.degreeId) ||
          currentPlayer.enrolledCourses.length >= 4) {
        return state;
      }

      // Check prerequisites
      const hasPrereqs = degree.prerequisites.every(p => currentPlayer.degrees.includes(p));
      if (!hasPrereqs) {
        return state;
      }

      const updatedPlayers = [...state.players];
      updatedPlayers[state.currentPlayerIndex] = {
        ...currentPlayer,
        money: currentPlayer.money - action.cost,
        enrolledCourses: [...currentPlayer.enrolledCourses, action.degreeId],
        studyProgress: {
          ...currentPlayer.studyProgress,
          [action.degreeId]: 0,
        },
        hoursRemaining: currentPlayer.hoursRemaining - 2,
      };

      return { ...state, players: updatedPlayers };
    }

    case 'PAY_RENT': {
      const currentPlayer = state.players[state.currentPlayerIndex];
      const apartment = APARTMENTS[currentPlayer.apartment];
      const rentAmount = calculatePrice(apartment.baseRent, state.economyIndex);

      if (currentPlayer.money + currentPlayer.bankBalance < rentAmount) {
        // Relative bails you out but you lose happiness
        const updatedPlayers = [...state.players];
        updatedPlayers[state.currentPlayerIndex] = {
          ...currentPlayer,
          money: 50,
          bankBalance: 0,
          happiness: Math.max(0, currentPlayer.happiness - 20),
        };
        return { ...state, players: updatedPlayers, rentDue: false };
      }

      let remainingRent = rentAmount;
      let newMoney = currentPlayer.money;
      let newBankBalance = currentPlayer.bankBalance;

      if (newMoney >= remainingRent) {
        newMoney -= remainingRent;
      } else {
        remainingRent -= newMoney;
        newMoney = 0;
        newBankBalance -= remainingRent;
      }

      const updatedPlayers = [...state.players];
      updatedPlayers[state.currentPlayerIndex] = {
        ...currentPlayer,
        money: newMoney,
        bankBalance: newBankBalance,
      };

      return { ...state, players: updatedPlayers, rentDue: false };
    }

    case 'DEPOSIT_MONEY': {
      const currentPlayer = state.players[state.currentPlayerIndex];
      if (currentPlayer.money < action.amount || currentPlayer.hoursRemaining < 2) {
        return state;
      }

      const updatedPlayers = [...state.players];
      updatedPlayers[state.currentPlayerIndex] = {
        ...currentPlayer,
        money: currentPlayer.money - action.amount,
        bankBalance: currentPlayer.bankBalance + action.amount,
        hoursRemaining: currentPlayer.hoursRemaining - 2,
      };

      return { ...state, players: updatedPlayers };
    }

    case 'WITHDRAW_MONEY': {
      const currentPlayer = state.players[state.currentPlayerIndex];
      if (currentPlayer.bankBalance < action.amount || currentPlayer.hoursRemaining < 2) {
        return state;
      }

      const updatedPlayers = [...state.players];
      updatedPlayers[state.currentPlayerIndex] = {
        ...currentPlayer,
        money: currentPlayer.money + action.amount,
        bankBalance: currentPlayer.bankBalance - action.amount,
        hoursRemaining: currentPlayer.hoursRemaining - 2,
      };

      return { ...state, players: updatedPlayers };
    }

    case 'BUY_STOCK': {
      const currentPlayer = state.players[state.currentPlayerIndex];
      const totalCost = action.price * action.quantity;

      if (currentPlayer.money < totalCost || currentPlayer.hoursRemaining < 2) {
        return state;
      }

      const updatedStocks = { ...currentPlayer.stocks };
      updatedStocks[action.stockId] = (updatedStocks[action.stockId] || 0) + action.quantity;

      const updatedPlayers = [...state.players];
      updatedPlayers[state.currentPlayerIndex] = {
        ...currentPlayer,
        money: currentPlayer.money - totalCost,
        stocks: updatedStocks,
        hoursRemaining: currentPlayer.hoursRemaining - 2,
      };

      return { ...state, players: updatedPlayers };
    }

    case 'SELL_STOCK': {
      const currentPlayer = state.players[state.currentPlayerIndex];
      const currentQuantity = currentPlayer.stocks[action.stockId] || 0;

      if (currentQuantity < action.quantity || currentPlayer.hoursRemaining < 2) {
        return state;
      }

      const updatedStocks = { ...currentPlayer.stocks };
      updatedStocks[action.stockId] = currentQuantity - action.quantity;
      if (updatedStocks[action.stockId] === 0) {
        delete updatedStocks[action.stockId];
      }

      const updatedPlayers = [...state.players];
      updatedPlayers[state.currentPlayerIndex] = {
        ...currentPlayer,
        money: currentPlayer.money + (action.price * action.quantity),
        stocks: updatedStocks,
        hoursRemaining: currentPlayer.hoursRemaining - 2,
      };

      return { ...state, players: updatedPlayers };
    }

    case 'BUY_LOTTERY_TICKETS': {
      const currentPlayer = state.players[state.currentPlayerIndex];

      if (currentPlayer.money < action.cost) {
        return state;
      }

      // First purchase per turn gives +2 happiness
      const happinessGain = currentPlayer.lotteryTickets === 0 ? 2 : 0;

      const updatedPlayers = [...state.players];
      updatedPlayers[state.currentPlayerIndex] = {
        ...currentPlayer,
        money: currentPlayer.money - action.cost,
        lotteryTickets: currentPlayer.lotteryTickets + 10, // $10 = 10 tickets
        happiness: Math.min(100, currentPlayer.happiness + happinessGain),
      };

      return { ...state, players: updatedPlayers };
    }

    case 'BUY_TICKET': {
      const currentPlayer = state.players[state.currentPlayerIndex];

      if (currentPlayer.money < action.cost) {
        return state;
      }

      const updatedPlayers = [...state.players];
      updatedPlayers[state.currentPlayerIndex] = {
        ...currentPlayer,
        money: currentPlayer.money - action.cost,
        items: [...currentPlayer.items, `${action.ticketType}-ticket`],
        happiness: Math.min(100, currentPlayer.happiness + action.happiness),
      };

      return { ...state, players: updatedPlayers };
    }

    case 'PAWN_ITEM': {
      const currentPlayer = state.players[state.currentPlayerIndex];

      if (!currentPlayer.items.includes(action.itemId)) {
        return state;
      }

      // Remove item from inventory
      const updatedItems = currentPlayer.items.filter(i => i !== action.itemId);

      // Add to pawned items
      const pawnedItem = {
        itemId: action.itemId,
        redeemPrice: Math.round(action.pawnValue * 1.25), // 25% markup to redeem
        weeksRemaining: 4, // 4 weeks to redeem
      };

      const updatedPlayers = [...state.players];
      updatedPlayers[state.currentPlayerIndex] = {
        ...currentPlayer,
        money: currentPlayer.money + action.pawnValue,
        items: updatedItems,
        pawnedItems: [...currentPlayer.pawnedItems, pawnedItem],
        happiness: Math.max(0, currentPlayer.happiness - 1), // Pawning costs -1 happiness
      };

      return { ...state, players: updatedPlayers };
    }

    case 'REDEEM_ITEM': {
      const currentPlayer = state.players[state.currentPlayerIndex];
      const pawnedItem = currentPlayer.pawnedItems.find(p => p.itemId === action.itemId);

      if (!pawnedItem || currentPlayer.money < action.cost) {
        return state;
      }

      const updatedPlayers = [...state.players];
      updatedPlayers[state.currentPlayerIndex] = {
        ...currentPlayer,
        money: currentPlayer.money - action.cost,
        items: [...currentPlayer.items, action.itemId],
        pawnedItems: currentPlayer.pawnedItems.filter(p => p.itemId !== action.itemId),
      };

      return { ...state, players: updatedPlayers };
    }

    case 'WILD_WILLY_STREET_ROBBERY': {
      const currentPlayer = state.players[state.currentPlayerIndex];

      const updatedPlayers = [...state.players];
      updatedPlayers[state.currentPlayerIndex] = {
        ...currentPlayer,
        money: 0,
        happiness: Math.max(0, currentPlayer.happiness - WILD_WILLY.streetRobbery.happinessLoss),
      };

      return {
        ...state,
        players: updatedPlayers,
        newspaper: WILD_WILLY.streetRobbery.description,
      };
    }

    case 'WILD_WILLY_APARTMENT_ROBBERY': {
      const currentPlayer = state.players[state.currentPlayerIndex];

      // Remove stolen items (except computer which can't be stolen)
      const updatedItems = currentPlayer.items.filter(item =>
        !action.stolenItems.includes(item) || item === 'computer'
      );

      const updatedPlayers = [...state.players];
      updatedPlayers[state.currentPlayerIndex] = {
        ...currentPlayer,
        items: updatedItems,
        happiness: Math.max(0, currentPlayer.happiness - WILD_WILLY.apartmentRobbery.happinessLoss),
      };

      return {
        ...state,
        players: updatedPlayers,
        newspaper: `${WILD_WILLY.apartmentRobbery.description} Items stolen: ${action.stolenItems.join(', ')}`,
      };
    }

    case 'DOCTOR_VISIT': {
      const currentPlayer = state.players[state.currentPlayerIndex];

      const actualCost = Math.min(currentPlayer.money, action.cost);

      const updatedPlayers = [...state.players];
      updatedPlayers[state.currentPlayerIndex] = {
        ...currentPlayer,
        money: currentPlayer.money - actualCost,
        hoursRemaining: Math.max(0, currentPlayer.hoursRemaining - DOCTOR_VISIT.hoursLost),
        happiness: Math.max(0, currentPlayer.happiness - DOCTOR_VISIT.happinessLoss),
      };

      return { ...state, players: updatedPlayers };
    }

    case 'CHANGE_APARTMENT': {
      const currentPlayer = state.players[state.currentPlayerIndex];
      const updatedPlayers = [...state.players];
      updatedPlayers[state.currentPlayerIndex] = {
        ...currentPlayer,
        apartment: action.apartmentType,
        currentLocation: action.apartmentType === 'low-cost' ? 'low-cost-housing' : 'security-apartments',
      };

      return { ...state, players: updatedPlayers };
    }

    case 'SET_WEEKEND_EVENT': {
      return { ...state, weekendEvent: action.event };
    }

    case 'END_TURN': {
      const currentPlayer = state.players[state.currentPlayerIndex];

      // Check for win
      if (checkWinCondition(currentPlayer, state.goals)) {
        return {
          ...state,
          isGameOver: true,
          winner: currentPlayer,
        };
      }

      // Process lottery
      const lotteryWinnings = processLottery(currentPlayer.lotteryTickets);

      // Weekend event
      const event = selectWeekendEvent(currentPlayer);
      const eventCost = Math.min(currentPlayer.money + lotteryWinnings, event.cost);

      // Wild Willy apartment robbery (only low-cost housing)
      let wildWillyRobbery = false;
      let stolenItems: string[] = [];
      if (currentPlayer.apartment === 'low-cost' && state.week >= 4) {
        // 25% chance per item that can be stolen
        const stealableItems = currentPlayer.items.filter(item => {
          const appliance = APPLIANCES.find(a => a.id === item);
          return appliance?.canBeStolen !== false;
        });

        for (const item of stealableItems) {
          if (Math.random() < WILD_WILLY.apartmentRobbery.chancePerItem) {
            stolenItems.push(item);
          }
        }

        if (stolenItems.length > 0) {
          wildWillyRobbery = true;
        }
      }

      // Decrease food (fresh food)
      let newFood = currentPlayer.food;
      let starvation = false;

      if (currentPlayer.hasFastFood || newFood > 0) {
        if (newFood > 0) newFood--;
      } else {
        starvation = true;
      }

      // Decrease clothes
      const newClothes = {
        casual: Math.max(0, currentPlayer.clothes.casual - 1),
        dress: Math.max(0, currentPlayer.clothes.dress - 1),
        business: Math.max(0, currentPlayer.clothes.business - 1),
      };

      // Dependability decreases by 3 per week
      const newDependability = Math.max(0, currentPlayer.dependability - 3);

      // Relaxation changes based on activities
      let newRelaxation = currentPlayer.relaxation;
      if (event.happinessChange > 0) {
        newRelaxation = Math.min(50, newRelaxation + 2);
      }

      // Update pawned items
      const updatedPawnedItems = currentPlayer.pawnedItems
        .map(p => ({ ...p, weeksRemaining: p.weeksRemaining - 1 }))
        .filter(p => p.weeksRemaining > 0);

      // Hours penalty for starvation
      const starvationPenalty = starvation ? DOCTOR_VISIT.hoursLost : 0;
      const starvationHappinessPenalty = starvation ? DOCTOR_VISIT.happinessLoss : 0;

      // Doctor cost for starvation (random between min and max)
      const doctorCost = starvation
        ? Math.floor(Math.random() * (DOCTOR_VISIT.maxCost - DOCTOR_VISIT.minCost + 1)) + DOCTOR_VISIT.minCost
        : 0;

      // Wild Willy happiness penalty
      const wildWillyHappinessPenalty = wildWillyRobbery ? WILD_WILLY.apartmentRobbery.happinessLoss : 0;

      // Remove stolen items from player's inventory
      const itemsAfterRobbery = wildWillyRobbery
        ? currentPlayer.items.filter(item => !stolenItems.includes(item))
        : currentPlayer.items;

      // Check for job loss due to low dependability (below 10)
      const loseJob = newDependability < 10 && currentPlayer.job !== null;
      const newJob = loseJob ? null : currentPlayer.job;

      // Update current player
      const updatedPlayers = [...state.players];
      updatedPlayers[state.currentPlayerIndex] = {
        ...currentPlayer,
        money: Math.max(0, currentPlayer.money + lotteryWinnings - eventCost - doctorCost),
        food: newFood,
        hasFastFood: false, // Reset for next turn
        clothes: newClothes,
        hoursRemaining: 60 - starvationPenalty,
        happiness: Math.max(0, Math.min(100, currentPlayer.happiness + event.happinessChange - starvationHappinessPenalty - wildWillyHappinessPenalty)),
        dependability: newDependability,
        relaxation: newRelaxation,
        lotteryTickets: 0, // Reset lottery tickets
        pawnedItems: updatedPawnedItems,
        currentLocation: currentPlayer.apartment === 'low-cost' ? 'low-cost-housing' : 'security-apartments',
        items: itemsAfterRobbery,
        job: newJob,
      };

      // Move to next player
      const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
      const nextWeek = nextPlayerIndex === 0 ? state.week + 1 : state.week;
      const nextMonth = nextWeek > state.month * 4 ? state.month + 1 : state.month;
      const rentDue = nextWeek % 4 === 0 && nextWeek !== state.week;

      // Update economy (random fluctuation)
      let newEconomyIndex = state.economyIndex;
      if (Math.random() < 0.1) {
        // Economic boom or crash
        if (Math.random() < 0.5) {
          newEconomyIndex = Math.min(90, state.economyIndex + 20);
        } else {
          newEconomyIndex = Math.max(-30, state.economyIndex - 20);
        }
      } else {
        // Small fluctuation
        newEconomyIndex = Math.max(-30, Math.min(90, state.economyIndex + (Math.random() - 0.5) * 10));
      }

      // Update stock prices
      const newStockPrices = updateStockPrices(state.stockPrices, newEconomyIndex);

      // Build newspaper message
      let newspaperMessages: string[] = [];
      if (lotteryWinnings > 0) {
        newspaperMessages.push(`Lottery winner! You won $${lotteryWinnings}!`);
      }
      if (wildWillyRobbery) {
        newspaperMessages.push(`${WILD_WILLY.apartmentRobbery.description} Items stolen: ${stolenItems.join(', ')}`);
      }
      if (starvation) {
        newspaperMessages.push(`You starved and had to visit the doctor! Cost: $${doctorCost}`);
      }
      if (loseJob) {
        newspaperMessages.push(`You were fired from your job due to low dependability!`);
      }

      return {
        ...state,
        players: updatedPlayers,
        currentPlayerIndex: nextPlayerIndex,
        week: nextWeek,
        month: nextMonth,
        rentDue: rentDue,
        weekendEvent: event,
        economyIndex: newEconomyIndex,
        stockPrices: newStockPrices,
        newspaper: newspaperMessages.length > 0 ? newspaperMessages.join(' | ') : null,
      };
    }

    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  getCurrentPlayer: () => Player | null;
  getAvailableJobs: () => Job[];
  getPlayerAvailableDegrees: () => typeof DEGREES;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, createInitialGameState({
    wealth: 1000,
    happiness: 100,
    education: 100,
    career: 100,
  }));

  const getCurrentPlayer = (): Player | null => {
    if (state.players.length === 0) return null;
    return state.players[state.currentPlayerIndex];
  };

  const getAvailableJobs = (): Job[] => {
    const player = getCurrentPlayer();
    if (!player) return [];

    return JOBS.filter(job => {
      const { eligible } = meetsJobRequirements(player, job);
      return eligible;
    });
  };

  const getPlayerAvailableDegrees = () => {
    const player = getCurrentPlayer();
    if (!player) return [];
    return getAvailableDegrees(player);
  };

  return (
    <GameContext.Provider value={{ state, dispatch, getCurrentPlayer, getAvailableJobs, getPlayerAvailableDegrees }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
