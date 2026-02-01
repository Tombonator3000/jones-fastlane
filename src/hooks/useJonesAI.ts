import { useCallback } from 'react';
import {
  Player,
  Job,
  JOBS,
  DEGREES,
  CLOTHING,
  APPLIANCES,
  APARTMENTS,
  FAST_FOOD,
  ClothingLevel,
  hasRequiredClothing,
  meetsJobRequirements,
  getAvailableDegrees,
  getLessonsRequired,
  getMaxFoodStorage,
  calculatePrice,
  getCurrentClothingLevel as getClothingLevel,
} from '@/types/game';

interface AIDecision {
  action: string;
  params?: Record<string, unknown>;
  delay: number;
  message: string;
}

export function useJonesAI() {
  const getAIAvailableJobs = (player: Player): Job[] => {
    return JOBS.filter(job => {
      const { eligible } = meetsJobRequirements(player, job);
      return eligible;
    });
  };

  const getBestAvailableJob = (player: Player): Job | null => {
    const availableJobs = getAIAvailableJobs(player);
    if (availableJobs.length === 0) return null;
    return availableJobs.reduce((best, job) =>
      job.baseWage > best.baseWage ? job : best
    );
  };

  // Check if there's a better job available than current
  const getBetterJob = (player: Player): Job | null => {
    if (!player.job) return getBestAvailableJob(player);

    const availableJobs = getAIAvailableJobs(player);
    const betterJobs = availableJobs.filter(job =>
      job.baseWage > player.job!.baseWage || job.careerPoints > player.job!.careerPoints
    );

    if (betterJobs.length === 0) return null;

    // Prefer higher career points, then wage
    return betterJobs.reduce((best, job) => {
      if (job.careerPoints > best.careerPoints) return job;
      if (job.careerPoints === best.careerPoints && job.baseWage > best.baseWage) return job;
      return best;
    });
  };

  // Check what clothing level would unlock better jobs
  const getClothingForBetterJobs = (player: Player): 'dress' | 'business' | null => {
    const currentClothing = getCurrentClothingLevel(player);

    // Find jobs we could get with better clothes
    const potentialJobs = JOBS.filter(job => {
      // Check degrees
      const hasDegrees = job.requiredDegrees.every(d => player.degrees.includes(d));
      if (!hasDegrees) return false;

      // Check experience and dependability
      if (player.experience < job.requiredExperience) return false;
      if (player.dependability < job.requiredDependability) return false;

      // Check if this job would be better
      if (player.job && job.careerPoints <= player.job.careerPoints) return false;

      return true;
    });

    // Check if dress clothes would help
    if (currentClothing !== 'dress' && currentClothing !== 'business') {
      const dressJobs = potentialJobs.filter(j => j.requiredClothes === 'dress');
      if (dressJobs.length > 0) return 'dress';
    }

    // Check if business clothes would help
    if (currentClothing !== 'business') {
      const businessJobs = potentialJobs.filter(j => j.requiredClothes === 'business');
      if (businessJobs.length > 0) return 'business';
    }

    return null;
  };

  const getCurrentClothingLevel = (player: Player): ClothingLevel => {
    if (player.clothes.business > 0) return 'business';
    if (player.clothes.dress > 0) return 'dress';
    if (player.clothes.casual > 0) return 'casual';
    return 'none';
  };

  const getNextClothesLevel = (player: Player): 'casual' | 'dress' | 'business' | null => {
    const current = getCurrentClothingLevel(player);
    if (current === 'none') return 'casual';
    if (current === 'casual') return 'dress';
    if (current === 'dress') return 'business';
    return null;
  };

  const calculatePriority = (player: Player, goals: { wealth: number; happiness: number; education: number; career: number }) => {
    const totalWealth = player.money + player.bankBalance;
    const wealthProgress = (totalWealth / goals.wealth) * 100;
    const happinessProgress = (player.happiness / goals.happiness) * 100;
    const educationProgress = (player.education / goals.education) * 100;
    const careerProgress = (player.career / goals.career) * 100;

    return {
      needsWealth: wealthProgress < 100,
      needsHappiness: happinessProgress < 100,
      needsEducation: educationProgress < 100,
      needsCareer: careerProgress < 100,
      wealthProgress,
      happinessProgress,
      educationProgress,
      careerProgress,
      lowestProgress: Math.min(wealthProgress, happinessProgress, educationProgress, careerProgress),
    };
  };

  const decideNextAction = useCallback((player: Player, goals: { wealth: number; happiness: number; education: number; career: number }, rentDue: boolean, economyIndex: number = 0): AIDecision[] => {
    const decisions: AIDecision[] = [];
    const priority = calculatePriority(player, goals);

    // Emergency: Pay rent if due
    if (rentDue) {
      decisions.push({
        action: 'MOVE_TO_LOCATION',
        params: { locationId: 'rent-office' },
        delay: 800,
        message: 'Jones goes to Rent Office to pay rent...',
      });
      decisions.push({
        action: 'PAY_RENT',
        delay: 600,
        message: 'Jones pays rent.',
      });
      return decisions;
    }

    // Emergency: Buy food if starving
    const maxStorage = getMaxFoodStorage(player);
    if (player.food <= 1 && !player.hasFastFood) {
      // Try to buy fast food if no refrigerator
      if (maxStorage === 0) {
        decisions.push({
          action: 'MOVE_TO_LOCATION',
          params: { locationId: 'monolith-burger' },
          delay: 800,
          message: 'Jones needs food and goes to Monolith Burgers...',
        });
        const burger = FAST_FOOD.find(f => f.id === 'burger');
        if (burger && player.money >= calculatePrice(burger.basePrice, economyIndex)) {
          decisions.push({
            action: 'BUY_FAST_FOOD',
            params: { itemId: 'burger', cost: calculatePrice(burger.basePrice, economyIndex), happiness: burger.happinessBonus },
            delay: 600,
            message: 'Jones buys a burger.',
          });
        }
        return decisions;
      }

      // Buy fresh food
      decisions.push({
        action: 'MOVE_TO_LOCATION',
        params: { locationId: 'blacks-market' },
        delay: 800,
        message: 'Jones needs food and goes to Black\'s Market...',
      });
      const foodAmount = Math.min(4, maxStorage - player.food);
      const foodCost = foodAmount * calculatePrice(20, economyIndex);
      if (player.money >= foodCost) {
        decisions.push({
          action: 'BUY_FRESH_FOOD',
          params: { units: foodAmount, cost: foodCost },
          delay: 600,
          message: `Jones buys ${foodAmount} units of fresh food.`,
        });
      }
      return decisions;
    }

    // Strategy based on priorities
    const hoursNeeded = 8;

    if (player.hoursRemaining < hoursNeeded) {
      decisions.push({
        action: 'END_TURN',
        delay: 1000,
        message: 'Jones does not have enough time and ends the week.',
      });
      return decisions;
    }

    // CRITICAL: Buy happiness items when happiness is dangerously low (< 15)
    if (player.happiness < 15 && player.money >= 150) {
      // First priority: Buy appliances we don't have
      const happinessItems = APPLIANCES
        .filter(item => !player.items.includes(item.id) && item.happiness >= 2 && item.socketCityPrice > 0)
        .sort((a, b) => b.happiness - a.happiness);

      if (happinessItems.length > 0) {
        const item = happinessItems[0];
        const cost = calculatePrice(item.socketCityPrice, economyIndex);
        if (player.money >= cost) {
          decisions.push({
            action: 'MOVE_TO_LOCATION',
            params: { locationId: 'socket-city' },
            delay: 800,
            message: 'Jones urgently needs happiness and goes shopping...',
          });
          decisions.push({
            action: 'BUY_APPLIANCE',
            params: { itemId: item.id, cost, happiness: item.happiness, store: 'socket-city' },
            delay: 600,
            message: `Jones buys a ${item.name} to boost happiness!`,
          });
          return decisions;
        }
      }

      // If no appliances available, buy fast food for happiness
      const deluxeMeal = FAST_FOOD.find(f => f.id === 'deluxe-meal');
      if (deluxeMeal && player.money >= calculatePrice(deluxeMeal.basePrice, economyIndex)) {
        decisions.push({
          action: 'MOVE_TO_LOCATION',
          params: { locationId: 'monolith-burger' },
          delay: 800,
          message: 'Jones treats himself to feel better...',
        });
        decisions.push({
          action: 'BUY_FAST_FOOD',
          params: { itemId: 'deluxe-meal', cost: calculatePrice(deluxeMeal.basePrice, economyIndex), happiness: deluxeMeal.happinessBonus },
          delay: 600,
          message: 'Jones buys a deluxe meal for happiness!',
        });
        return decisions;
      }
    }

    // CRITICAL: Consider moving to security apartments if being robbed frequently
    if (player.apartment === 'low-cost' && player.happiness < 20 && player.items.length > 0) {
      const securityRent = calculatePrice(APARTMENTS.security.baseRent, economyIndex);
      // Move to security if we have items to protect and can afford it
      if (player.money + player.bankBalance >= securityRent * 2) {
        decisions.push({
          action: 'MOVE_TO_LOCATION',
          params: { locationId: 'rent-office' },
          delay: 800,
          message: 'Jones decides to move to a safer apartment...',
        });
        decisions.push({
          action: 'CHANGE_APARTMENT',
          params: { apartment: 'security' },
          delay: 600,
          message: 'Jones moves to LeSecurity Apartments!',
        });
        return decisions;
      }
    }

    // Priority 1: Get a job if none
    if (!player.job) {
      const bestJob = getBestAvailableJob(player);
      if (bestJob) {
        decisions.push({
          action: 'MOVE_TO_LOCATION',
          params: { locationId: 'employment-office' },
          delay: 800,
          message: 'Jones looks for a job at Employment Office...',
        });
        decisions.push({
          action: 'APPLY_FOR_JOB',
          params: { job: bestJob },
          delay: 600,
          message: `Jones applies for a job as ${bestJob.title}!`,
        });
        return decisions;
      }

      // Need clothes for jobs
      const currentClothing = getCurrentClothingLevel(player);
      if (currentClothing === 'none' && player.money >= calculatePrice(CLOTHING.casual.qtPrice, economyIndex)) {
        decisions.push({
          action: 'MOVE_TO_LOCATION',
          params: { locationId: 'qt-clothing' },
          delay: 800,
          message: 'Jones needs better clothes to get a job...',
        });
        decisions.push({
          action: 'BUY_CLOTHES',
          params: {
            clothingType: 'casual',
            store: 'qt',
            cost: calculatePrice(CLOTHING.casual.qtPrice, economyIndex),
            weeks: CLOTHING.casual.qtDuration,
            happiness: CLOTHING.casual.happiness
          },
          delay: 600,
          message: 'Jones buys casual clothes!',
        });
        return decisions;
      }
    }

    // Priority 1.5: Upgrade job if better one is available
    if (player.job && priority.needsCareer) {
      const betterJob = getBetterJob(player);
      if (betterJob && betterJob.id !== player.job.id) {
        decisions.push({
          action: 'MOVE_TO_LOCATION',
          params: { locationId: 'employment-office' },
          delay: 800,
          message: 'Jones looks for a better job at Employment Office...',
        });
        decisions.push({
          action: 'APPLY_FOR_JOB',
          params: { job: betterJob },
          delay: 600,
          message: `Jones gets promoted to ${betterJob.title}!`,
        });
        return decisions;
      }

      // Buy clothes if they would unlock better jobs
      const neededClothes = getClothingForBetterJobs(player);
      if (neededClothes) {
        const clothingInfo = CLOTHING[neededClothes];
        const cost = calculatePrice(clothingInfo.qtPrice, economyIndex);
        if (player.money >= cost) {
          decisions.push({
            action: 'MOVE_TO_LOCATION',
            params: { locationId: 'qt-clothing' },
            delay: 800,
            message: `Jones needs ${neededClothes} clothes for a better job...`,
          });
          decisions.push({
            action: 'BUY_CLOTHES',
            params: {
              clothingType: neededClothes,
              store: 'qt',
              cost,
              weeks: clothingInfo.qtDuration,
              happiness: clothingInfo.happiness
            },
            delay: 600,
            message: `Jones buys ${neededClothes} clothes!`,
          });
          return decisions;
        }
      }
    }

    // Priority 2: Work if has job and needs money
    if (player.job && priority.needsWealth && priority.wealthProgress <= priority.educationProgress) {
      decisions.push({
        action: 'MOVE_TO_LOCATION',
        params: { locationId: player.job.location },
        delay: 800,
        message: `Jones goes to work at ${player.job.location}...`,
      });
      const workHours = Math.min(player.hoursRemaining - 4, player.job.hoursPerShift);
      decisions.push({
        action: 'WORK',
        params: { hours: workHours },
        delay: 600,
        message: `Jones works ${workHours} hours as ${player.job.title}.`,
      });
      return decisions;
    }

    // Priority 3: Study for better career
    if (priority.needsEducation || (priority.needsCareer && player.degrees.length < 2)) {
      const availableDegrees = getAvailableDegrees(player);

      if (player.enrolledCourses.length > 0) {
        const degreeId = player.enrolledCourses[0];
        const degree = DEGREES.find(d => d.id === degreeId);
        if (degree) {
          decisions.push({
            action: 'MOVE_TO_LOCATION',
            params: { locationId: 'hi-tech-u' },
            delay: 800,
            message: 'Jones continues studying at Hi-Tech U...',
          });
          const lessonsRequired = getLessonsRequired(player, degree);
          const studyHours = Math.min(player.hoursRemaining - 4, lessonsRequired - (player.studyProgress[degreeId] || 0));
          decisions.push({
            action: 'STUDY',
            params: { degreeId, hours: studyHours },
            delay: 600,
            message: `Jones studies ${degree.name} for ${studyHours} hours.`,
          });
          return decisions;
        }
      } else if (availableDegrees.length > 0) {
        const degree = availableDegrees[0];
        const cost = calculatePrice(degree.enrollmentFee, economyIndex);
        if (player.money >= cost) {
          decisions.push({
            action: 'MOVE_TO_LOCATION',
            params: { locationId: 'hi-tech-u' },
            delay: 800,
            message: 'Jones enrolls in a new course at Hi-Tech U...',
          });
          decisions.push({
            action: 'ENROLL_DEGREE',
            params: { degreeId: degree.id, cost },
            delay: 600,
            message: `Jones enrolls in ${degree.name}!`,
          });
          return decisions;
        }
      }
    }

    // Priority 4: Upgrade clothes for better jobs
    if (priority.needsCareer && player.job) {
      const nextClothes = getNextClothesLevel(player);
      if (nextClothes) {
        const clothingInfo = CLOTHING[nextClothes];
        const cost = calculatePrice(clothingInfo.qtPrice, economyIndex);
        if (player.money >= cost) {
          decisions.push({
            action: 'MOVE_TO_LOCATION',
            params: { locationId: 'qt-clothing' },
            delay: 800,
            message: 'Jones upgrades wardrobe...',
          });
          decisions.push({
            action: 'BUY_CLOTHES',
            params: {
              clothingType: nextClothes,
              store: 'qt',
              cost,
              weeks: clothingInfo.qtDuration,
              happiness: clothingInfo.happiness
            },
            delay: 600,
            message: `Jones buys ${nextClothes} clothes!`,
          });
          return decisions;
        }
      }
    }

    // Priority 5: Buy items for happiness
    if (priority.needsHappiness && player.money >= 200) {
      const unpurchasedItems = APPLIANCES.filter(
        item => !player.items.includes(item.id) && item.socketCityPrice > 0
      );
      if (unpurchasedItems.length > 0) {
        const item = unpurchasedItems[0];
        const cost = calculatePrice(item.socketCityPrice, economyIndex);
        if (player.money >= cost) {
          decisions.push({
            action: 'MOVE_TO_LOCATION',
            params: { locationId: 'socket-city' },
            delay: 800,
            message: 'Jones goes to Socket City for shopping...',
          });
          decisions.push({
            action: 'BUY_APPLIANCE',
            params: { itemId: item.id, cost, happiness: item.happiness, store: 'socket-city' },
            delay: 600,
            message: `Jones buys a ${item.name}!`,
          });
          return decisions;
        }
      }
    }

    // Priority 6: Buy refrigerator if needed for food storage
    if (!player.items.includes('refrigerator') && player.money >= calculatePrice(APPLIANCES.find(a => a.id === 'refrigerator')?.socketCityPrice || 876, economyIndex)) {
      const fridge = APPLIANCES.find(a => a.id === 'refrigerator')!;
      const cost = calculatePrice(fridge.socketCityPrice, economyIndex);
      decisions.push({
        action: 'MOVE_TO_LOCATION',
        params: { locationId: 'socket-city' },
        delay: 800,
        message: 'Jones buys a refrigerator to store food...',
      });
      decisions.push({
        action: 'BUY_APPLIANCE',
        params: { itemId: 'refrigerator', cost, happiness: fridge.happiness, store: 'socket-city' },
        delay: 600,
        message: 'Jones buys a refrigerator!',
      });
      return decisions;
    }

    // Default: Work if has job
    if (player.job) {
      decisions.push({
        action: 'MOVE_TO_LOCATION',
        params: { locationId: player.job.location },
        delay: 800,
        message: 'Jones goes to work...',
      });
      const workHours = Math.min(player.hoursRemaining - 4, player.job.hoursPerShift);
      decisions.push({
        action: 'WORK',
        params: { hours: workHours },
        delay: 600,
        message: `Jones works ${workHours} hours.`,
      });
      return decisions;
    }

    // Nothing productive to do, save money at bank
    if (player.money > 100) {
      decisions.push({
        action: 'MOVE_TO_LOCATION',
        params: { locationId: 'bank' },
        delay: 800,
        message: 'Jones deposits money in the bank...',
      });
      decisions.push({
        action: 'DEPOSIT_MONEY',
        params: { amount: player.money - 50 },
        delay: 600,
        message: `Jones deposits $${player.money - 50} in the bank.`,
      });
      return decisions;
    }

    // End turn if nothing else to do
    decisions.push({
      action: 'END_TURN',
      delay: 1000,
      message: 'Jones ends the week.',
    });

    return decisions;
  }, []);

  return { decideNextAction };
}
