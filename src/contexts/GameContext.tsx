import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import {
  GameState,
  Player,
  GameGoals,
  Job,
  createInitialPlayer,
  createInitialGameState,
  WEEKEND_EVENTS,
  RENT_PRICES,
  JOBS,
} from '@/types/game';
import { toast } from '@/hooks/use-toast';

type GameAction =
  | { type: 'START_GAME'; goals: GameGoals }
  | { type: 'ADD_PLAYER'; name: string; avatar: string }
  | { type: 'MOVE_TO_LOCATION'; locationId: string }
  | { type: 'WORK'; hours: number }
  | { type: 'STUDY'; degreeId: string; hours: number }
  | { type: 'BUY_FOOD'; amount: number; cost: number }
  | { type: 'BUY_CLOTHES'; level: string; cost: number }
  | { type: 'BUY_ITEM'; itemId: string; cost: number; happiness: number }
  | { type: 'APPLY_FOR_JOB'; job: Job }
  | { type: 'ENROLL_DEGREE'; degreeId: string; cost: number }
  | { type: 'PAY_RENT' }
  | { type: 'DEPOSIT_MONEY'; amount: number }
  | { type: 'WITHDRAW_MONEY'; amount: number }
  | { type: 'END_TURN' }
  | { type: 'CHANGE_APARTMENT'; apartmentType: 'low-cost' | 'security' }
  | { type: 'SET_WEEKEND_EVENT'; event: string | null };

function calculateDistance(from: string, to: string): number {
  // Simplified distance calculation - each move costs 1 hour
  if (from === to) return 0;
  return 2;
}

function checkWinCondition(player: Player, goals: GameGoals): boolean {
  const wealthProgress = ((player.money + player.bankBalance) / goals.wealth) * 100;
  const happinessProgress = (player.happiness / goals.happiness) * 100;
  const educationProgress = (player.degrees.length / (goals.education / 25)) * 100;
  const careerProgress = ((player.job?.careerLevel || 0) / (goals.career / 20)) * 100;
  
  return wealthProgress >= 100 && happinessProgress >= 100 && educationProgress >= 100 && careerProgress >= 100;
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
        hoursRemaining: currentPlayer.hoursRemaining - moveCost - 2, // 2 hours to enter building
      };

      return { ...state, players: updatedPlayers };
    }

    case 'WORK': {
      const currentPlayer = state.players[state.currentPlayerIndex];
      if (!currentPlayer.job || currentPlayer.hoursRemaining < action.hours) {
        return state;
      }

      const earnings = Math.floor((currentPlayer.job.wage * action.hours / 8) * state.economyMultiplier);
      const updatedPlayers = [...state.players];
      updatedPlayers[state.currentPlayerIndex] = {
        ...currentPlayer,
        money: currentPlayer.money + earnings,
        hoursRemaining: currentPlayer.hoursRemaining - action.hours,
        career: Math.min(100, currentPlayer.career + 2),
      };

      return { ...state, players: updatedPlayers };
    }

    case 'STUDY': {
      const currentPlayer = state.players[state.currentPlayerIndex];
      if (currentPlayer.hoursRemaining < action.hours) {
        return state;
      }

      const currentProgress = currentPlayer.studyProgress[action.degreeId] || 0;
      const newProgress = currentProgress + action.hours;
      const completed = newProgress >= 10;

      const updatedPlayers = [...state.players];
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
        education: completed ? currentPlayer.education + 25 : currentPlayer.education,
      };

      return { ...state, players: updatedPlayers };
    }

    case 'BUY_FOOD': {
      const currentPlayer = state.players[state.currentPlayerIndex];
      if (currentPlayer.money < action.cost) {
        return state;
      }

      const maxFood = currentPlayer.hasRefrigerator ? 8 : 4;
      const updatedPlayers = [...state.players];
      updatedPlayers[state.currentPlayerIndex] = {
        ...currentPlayer,
        money: currentPlayer.money - action.cost,
        food: Math.min(maxFood, currentPlayer.food + action.amount),
      };

      return { ...state, players: updatedPlayers };
    }

    case 'BUY_CLOTHES': {
      const currentPlayer = state.players[state.currentPlayerIndex];
      if (currentPlayer.money < action.cost) {
        return state;
      }

      const updatedPlayers = [...state.players];
      updatedPlayers[state.currentPlayerIndex] = {
        ...currentPlayer,
        money: currentPlayer.money - action.cost,
        clothes: action.level as Player['clothes'],
        clothesWeeksRemaining: 8,
        happiness: currentPlayer.happiness + 5,
      };

      return { ...state, players: updatedPlayers };
    }

    case 'BUY_ITEM': {
      const currentPlayer = state.players[state.currentPlayerIndex];
      if (currentPlayer.money < action.cost) {
        return state;
      }

      const updatedPlayers = [...state.players];
      updatedPlayers[state.currentPlayerIndex] = {
        ...currentPlayer,
        money: currentPlayer.money - action.cost,
        items: [...currentPlayer.items, action.itemId],
        happiness: currentPlayer.happiness + action.happiness,
        hasRefrigerator: action.itemId === 'refrigerator' ? true : currentPlayer.hasRefrigerator,
        hasComputer: action.itemId === 'computer' ? true : currentPlayer.hasComputer,
        hasTV: action.itemId === 'tv' ? true : currentPlayer.hasTV,
      };

      return { ...state, players: updatedPlayers };
    }

    case 'APPLY_FOR_JOB': {
      const currentPlayer = state.players[state.currentPlayerIndex];
      
      // Check requirements
      const hasRequiredDegrees = action.job.requiredDegrees.every(d => 
        currentPlayer.degrees.includes(d)
      );
      
      const clothesOrder: Player['clothes'][] = ['rags', 'casual', 'business', 'executive'];
      const hasRequiredClothes = clothesOrder.indexOf(currentPlayer.clothes) >= 
        clothesOrder.indexOf(action.job.requiredClothes);

      if (!hasRequiredDegrees || !hasRequiredClothes) {
        return state;
      }

      const updatedPlayers = [...state.players];
      updatedPlayers[state.currentPlayerIndex] = {
        ...currentPlayer,
        job: action.job,
        career: Math.max(currentPlayer.career, action.job.careerLevel * 15),
        hoursRemaining: currentPlayer.hoursRemaining - 2,
      };

      return { ...state, players: updatedPlayers };
    }

    case 'ENROLL_DEGREE': {
      const currentPlayer = state.players[state.currentPlayerIndex];
      if (currentPlayer.money < action.cost || currentPlayer.degrees.includes(action.degreeId)) {
        return state;
      }

      const updatedPlayers = [...state.players];
      updatedPlayers[state.currentPlayerIndex] = {
        ...currentPlayer,
        money: currentPlayer.money - action.cost,
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
      const rentAmount = Math.floor(RENT_PRICES[currentPlayer.apartment] * state.economyMultiplier);
      
      if (currentPlayer.money + currentPlayer.bankBalance < rentAmount) {
        // Relative bails you out
        const updatedPlayers = [...state.players];
        updatedPlayers[state.currentPlayerIndex] = {
          ...currentPlayer,
          money: 50,
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
      if (currentPlayer.money < action.amount) {
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
      if (currentPlayer.bankBalance < action.amount) {
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

      // Weekend event
      const event = WEEKEND_EVENTS[Math.floor(Math.random() * WEEKEND_EVENTS.length)];
      const costMatch = event.match(/Cost: \$(\d+)/);
      const eventCost = costMatch ? parseInt(costMatch[1]) : 0;

      // Decrease food and clothes
      const newFood = Math.max(0, currentPlayer.food - 1);
      const newClothesWeeks = currentPlayer.clothesWeeksRemaining - 1;
      
      // Hunger penalty
      const hungerPenalty = newFood === 0 ? 10 : 0;

      // Update current player
      const updatedPlayers = [...state.players];
      updatedPlayers[state.currentPlayerIndex] = {
        ...currentPlayer,
        money: Math.max(0, currentPlayer.money - eventCost),
        food: newFood,
        clothesWeeksRemaining: newClothesWeeks,
        clothes: newClothesWeeks <= 0 ? 'rags' : currentPlayer.clothes,
        hoursRemaining: 60 - hungerPenalty,
        happiness: Math.max(0, currentPlayer.happiness - (newFood === 0 ? 5 : 0)),
        currentLocation: currentPlayer.apartment === 'low-cost' ? 'low-cost-housing' : 'security-apartments',
      };

      // Move to next player
      const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
      const nextWeek = nextPlayerIndex === 0 ? state.week + 1 : state.week;
      const nextMonth = nextWeek > 4 && state.week <= 4 ? state.month + 1 : state.month;
      const rentDue = nextWeek % 4 === 0;

      return {
        ...state,
        players: updatedPlayers,
        currentPlayerIndex: nextPlayerIndex,
        week: nextWeek,
        month: nextMonth,
        rentDue: rentDue && !state.rentDue,
        weekendEvent: event,
        economyMultiplier: Math.random() > 0.9 
          ? state.economyMultiplier * (Math.random() > 0.5 ? 1.1 : 0.9)
          : state.economyMultiplier,
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
      const hasRequiredDegrees = job.requiredDegrees.every(d => player.degrees.includes(d));
      const clothesOrder: Player['clothes'][] = ['rags', 'casual', 'business', 'executive'];
      const hasRequiredClothes = clothesOrder.indexOf(player.clothes) >= clothesOrder.indexOf(job.requiredClothes);
      return hasRequiredDegrees && hasRequiredClothes;
    });
  };

  return (
    <GameContext.Provider value={{ state, dispatch, getCurrentPlayer, getAvailableJobs }}>
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
