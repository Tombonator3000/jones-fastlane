import { useCallback } from 'react';
import { Player, Job, JOBS, DEGREES, CLOTHING_PRICES, ITEMS, RENT_PRICES, ClothingLevel } from '@/types/game';

interface AIDecision {
  action: string;
  params?: Record<string, unknown>;
  delay: number;
  message: string;
}

export function useJonesAI() {
  const getAvailableJobs = (player: Player): Job[] => {
    return JOBS.filter(job => {
      const hasRequiredDegrees = job.requiredDegrees.every(d => player.degrees.includes(d));
      const clothesOrder: ClothingLevel[] = ['rags', 'casual', 'business', 'executive'];
      const hasRequiredClothes = clothesOrder.indexOf(player.clothes) >= clothesOrder.indexOf(job.requiredClothes);
      return hasRequiredDegrees && hasRequiredClothes;
    });
  };

  const getBestAvailableJob = (player: Player): Job | null => {
    const availableJobs = getAvailableJobs(player);
    if (availableJobs.length === 0) return null;
    return availableJobs.reduce((best, job) => 
      job.wage > best.wage ? job : best
    );
  };

  const getNextClothesLevel = (current: ClothingLevel): ClothingLevel | null => {
    const order: ClothingLevel[] = ['rags', 'casual', 'business', 'executive'];
    const currentIndex = order.indexOf(current);
    if (currentIndex < order.length - 1) {
      return order[currentIndex + 1];
    }
    return null;
  };

  const calculatePriority = (player: Player, goals: { wealth: number; happiness: number; education: number; career: number }) => {
    const totalWealth = player.money + player.bankBalance;
    const wealthProgress = (totalWealth / goals.wealth) * 100;
    const happinessProgress = (player.happiness / goals.happiness) * 100;
    const educationProgress = (player.degrees.length / (goals.education / 25)) * 100;
    const careerProgress = ((player.job?.careerLevel || 0) / (goals.career / 20)) * 100;

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

  const decideNextAction = useCallback((player: Player, goals: { wealth: number; happiness: number; education: number; career: number }, rentDue: boolean): AIDecision[] => {
    const decisions: AIDecision[] = [];
    const priority = calculatePriority(player, goals);
    
    // Emergency: Pay rent if due
    if (rentDue) {
      decisions.push({
        action: 'MOVE_TO_LOCATION',
        params: { locationId: 'rent-office' },
        delay: 800,
        message: 'Jones går til Rent Office for å betale husleie...',
      });
      decisions.push({
        action: 'PAY_RENT',
        delay: 600,
        message: 'Jones betaler husleie.',
      });
      return decisions;
    }

    // Emergency: Buy food if starving
    if (player.food <= 1) {
      decisions.push({
        action: 'MOVE_TO_LOCATION',
        params: { locationId: 'blacks-market' },
        delay: 800,
        message: 'Jones trenger mat og går til Black\'s Market...',
      });
      const foodAmount = Math.min(3, player.hasRefrigerator ? 8 - player.food : 4 - player.food);
      const foodCost = foodAmount * 15;
      if (player.money >= foodCost) {
        decisions.push({
          action: 'BUY_FOOD',
          params: { amount: foodAmount, cost: foodCost },
          delay: 600,
          message: `Jones kjøper ${foodAmount} uker med mat.`,
        });
      }
      return decisions;
    }

    // Strategy based on priorities
    const hoursNeeded = 10; // Minimum hours for meaningful action

    if (player.hoursRemaining < hoursNeeded) {
      // Not enough time, end turn
      decisions.push({
        action: 'END_TURN',
        delay: 1000,
        message: 'Jones har ikke nok tid igjen og avslutter uken.',
      });
      return decisions;
    }

    // Priority 1: Get a job if none
    if (!player.job) {
      const bestJob = getBestAvailableJob(player);
      if (bestJob) {
        decisions.push({
          action: 'MOVE_TO_LOCATION',
          params: { locationId: 'employment-office' },
          delay: 800,
          message: 'Jones leter etter jobb på Employment Office...',
        });
        decisions.push({
          action: 'APPLY_FOR_JOB',
          params: { job: bestJob },
          delay: 600,
          message: `Jones søker på jobb som ${bestJob.title}!`,
        });
        return decisions;
      }

      // Need better clothes for jobs
      if (player.clothes === 'rags' && player.money >= CLOTHING_PRICES.casual) {
        decisions.push({
          action: 'MOVE_TO_LOCATION',
          params: { locationId: 'qt-clothing' },
          delay: 800,
          message: 'Jones trenger bedre klær for å få jobb...',
        });
        decisions.push({
          action: 'BUY_CLOTHES',
          params: { level: 'casual', cost: CLOTHING_PRICES.casual },
          delay: 600,
          message: 'Jones kjøper casual klær!',
        });
        return decisions;
      }
    }

    // Priority 2: Work if has job and needs money
    if (player.job && priority.needsWealth && priority.wealthProgress <= priority.educationProgress) {
      decisions.push({
        action: 'MOVE_TO_LOCATION',
        params: { locationId: player.job.location },
        delay: 800,
        message: `Jones går til jobb på ${player.job.location}...`,
      });
      const workHours = Math.min(player.hoursRemaining - 4, player.job.hoursPerShift * 2);
      decisions.push({
        action: 'WORK',
        params: { hours: workHours },
        delay: 600,
        message: `Jones jobber ${workHours} timer som ${player.job.title}.`,
      });
      return decisions;
    }

    // Priority 3: Study for better career
    if (priority.needsEducation || (priority.needsCareer && player.degrees.length < 2)) {
      // Find a degree to study
      const availableDegrees = DEGREES.filter(d => !player.degrees.includes(d.id));
      const enrolledDegrees = Object.keys(player.studyProgress);
      
      if (enrolledDegrees.length > 0) {
        // Continue studying enrolled degree
        const degreeId = enrolledDegrees[0];
        decisions.push({
          action: 'MOVE_TO_LOCATION',
          params: { locationId: 'hi-tech-u' },
          delay: 800,
          message: 'Jones fortsetter å studere på Hi-Tech U...',
        });
        const studyHours = Math.min(player.hoursRemaining - 4, 10 - (player.studyProgress[degreeId] || 0));
        decisions.push({
          action: 'STUDY',
          params: { degreeId, hours: studyHours },
          delay: 600,
          message: `Jones studerer ${DEGREES.find(d => d.id === degreeId)?.name} i ${studyHours} timer.`,
        });
        return decisions;
      } else if (availableDegrees.length > 0 && player.money >= availableDegrees[0].cost) {
        // Enroll in new degree
        const degree = availableDegrees[0];
        decisions.push({
          action: 'MOVE_TO_LOCATION',
          params: { locationId: 'hi-tech-u' },
          delay: 800,
          message: 'Jones melder seg på et nytt kurs på Hi-Tech U...',
        });
        decisions.push({
          action: 'ENROLL_DEGREE',
          params: { degreeId: degree.id, cost: degree.cost },
          delay: 600,
          message: `Jones melder seg på ${degree.name}-kurset!`,
        });
        return decisions;
      }
    }

    // Priority 4: Upgrade clothes for better jobs
    if (priority.needsCareer && player.job) {
      const nextClothes = getNextClothesLevel(player.clothes);
      if (nextClothes && player.money >= CLOTHING_PRICES[nextClothes]) {
        decisions.push({
          action: 'MOVE_TO_LOCATION',
          params: { locationId: 'qt-clothing' },
          delay: 800,
          message: 'Jones oppgraderer garderoben...',
        });
        decisions.push({
          action: 'BUY_CLOTHES',
          params: { level: nextClothes, cost: CLOTHING_PRICES[nextClothes] },
          delay: 600,
          message: `Jones kjøper ${nextClothes} klær!`,
        });
        return decisions;
      }
    }

    // Priority 5: Buy items for happiness
    if (priority.needsHappiness && player.money >= 200) {
      const unpurchasedItems = Object.entries(ITEMS).filter(
        ([id]) => !player.items.includes(id)
      );
      if (unpurchasedItems.length > 0) {
        const [itemId, item] = unpurchasedItems[0];
        if (player.money >= item.price) {
          decisions.push({
            action: 'MOVE_TO_LOCATION',
            params: { locationId: 'socket-city' },
            delay: 800,
            message: 'Jones drar til Socket City for shopping...',
          });
          decisions.push({
            action: 'BUY_ITEM',
            params: { itemId, cost: item.price, happiness: item.happiness },
            delay: 600,
            message: `Jones kjøper en ${item.name}!`,
          });
          return decisions;
        }
      }
    }

    // Default: Work if has job
    if (player.job) {
      decisions.push({
        action: 'MOVE_TO_LOCATION',
        params: { locationId: player.job.location },
        delay: 800,
        message: `Jones går til jobb...`,
      });
      const workHours = Math.min(player.hoursRemaining - 4, player.job.hoursPerShift);
      decisions.push({
        action: 'WORK',
        params: { hours: workHours },
        delay: 600,
        message: `Jones jobber ${workHours} timer.`,
      });
      return decisions;
    }

    // Nothing productive to do, save money at bank
    if (player.money > 100) {
      decisions.push({
        action: 'MOVE_TO_LOCATION',
        params: { locationId: 'bank' },
        delay: 800,
        message: 'Jones setter inn penger i banken...',
      });
      decisions.push({
        action: 'DEPOSIT_MONEY',
        params: { amount: player.money - 50 },
        delay: 600,
        message: `Jones setter inn $${player.money - 50} i banken.`,
      });
      return decisions;
    }

    // End turn if nothing else to do
    decisions.push({
      action: 'END_TURN',
      delay: 1000,
      message: 'Jones avslutter uken.',
    });

    return decisions;
  }, []);

  return { decideNextAction };
}
