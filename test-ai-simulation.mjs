/**
 * AI Gameplay Simulation Test - v2
 * Simulerer et helt spill mellom to spillere for å verifisere Jones AI
 *
 * Kjør med: node test-ai-simulation.mjs
 */

// ========== GAME DATA ==========

const DEGREES = [
  { id: 'trade-school', name: 'Trade School', enrollmentFee: 50, lessonsRequired: 10, prerequisites: [], educationPoints: 9 },
  { id: 'junior-college', name: 'Junior College', enrollmentFee: 50, lessonsRequired: 10, prerequisites: [], educationPoints: 9 },
  { id: 'electronics', name: 'Electronics', enrollmentFee: 50, lessonsRequired: 10, prerequisites: ['junior-college'], educationPoints: 9 },
  { id: 'pre-engineering', name: 'Pre-Engineering', enrollmentFee: 50, lessonsRequired: 10, prerequisites: ['junior-college'], educationPoints: 9 },
  { id: 'business-admin', name: 'Business Administration', enrollmentFee: 50, lessonsRequired: 10, prerequisites: ['junior-college'], educationPoints: 9 },
  { id: 'academic', name: 'Academic', enrollmentFee: 50, lessonsRequired: 10, prerequisites: ['junior-college'], educationPoints: 9 },
  { id: 'engineering', name: 'Engineering', enrollmentFee: 50, lessonsRequired: 10, prerequisites: ['pre-engineering'], educationPoints: 9 },
  { id: 'graduate-school', name: 'Graduate School', enrollmentFee: 50, lessonsRequired: 10, prerequisites: ['academic'], educationPoints: 9 },
  { id: 'research', name: 'Research', enrollmentFee: 50, lessonsRequired: 10, prerequisites: ['graduate-school'], educationPoints: 9 },
  { id: 'accounting', name: 'Accounting', enrollmentFee: 50, lessonsRequired: 10, prerequisites: ['business-admin'], educationPoints: 9 },
  { id: 'advanced-electronics', name: 'Advanced Electronics', enrollmentFee: 50, lessonsRequired: 10, prerequisites: ['electronics'], educationPoints: 9 },
];

const JOBS = [
  { id: 'janitor-qt', title: 'Janitor', location: 'qt-clothing', baseWage: 5, hoursPerShift: 6, requiredDegrees: [], requiredClothes: 'none', requiredExperience: 0, requiredDependability: 0, careerPoints: 5 },
  { id: 'janitor-factory', title: 'Janitor', location: 'factory', baseWage: 5, hoursPerShift: 6, requiredDegrees: [], requiredClothes: 'none', requiredExperience: 0, requiredDependability: 0, careerPoints: 5 },
  { id: 'fry-cook', title: 'Fry Cook', location: 'monolith-burger', baseWage: 6, hoursPerShift: 6, requiredDegrees: [], requiredClothes: 'casual', requiredExperience: 0, requiredDependability: 0, careerPoints: 8 },
  { id: 'dishwasher', title: 'Dishwasher', location: 'monolith-burger', baseWage: 5, hoursPerShift: 6, requiredDegrees: [], requiredClothes: 'none', requiredExperience: 0, requiredDependability: 0, careerPoints: 5 },
  { id: 'stock-clerk', title: 'Stock Clerk', location: 'z-mart', baseWage: 6, hoursPerShift: 6, requiredDegrees: [], requiredClothes: 'casual', requiredExperience: 0, requiredDependability: 0, careerPoints: 8 },
  { id: 'stock-clerk-bm', title: 'Stock Clerk', location: 'blacks-market', baseWage: 7, hoursPerShift: 6, requiredDegrees: [], requiredClothes: 'casual', requiredExperience: 0, requiredDependability: 0, careerPoints: 10 },
  { id: 'sales-clerk-qt', title: 'Sales Clerk', location: 'qt-clothing', baseWage: 7, hoursPerShift: 6, requiredDegrees: [], requiredClothes: 'casual', requiredExperience: 10, requiredDependability: 10, careerPoints: 12 },
  { id: 'clerk-socket', title: 'Clerk', location: 'socket-city', baseWage: 7, hoursPerShift: 6, requiredDegrees: [], requiredClothes: 'casual', requiredExperience: 10, requiredDependability: 10, careerPoints: 12 },
  { id: 'rent-clerk', title: 'Rent Clerk', location: 'rent-office', baseWage: 8, hoursPerShift: 6, requiredDegrees: [], requiredClothes: 'none', requiredExperience: 10, requiredDependability: 10, careerPoints: 12 },
  { id: 'butcher', title: 'Butcher', location: 'blacks-market', baseWage: 11, hoursPerShift: 6, requiredDegrees: ['trade-school'], requiredClothes: 'casual', requiredExperience: 20, requiredDependability: 20, careerPoints: 20 },
  { id: 'assembly-worker', title: 'Assembly Worker', location: 'factory', baseWage: 10, hoursPerShift: 6, requiredDegrees: ['trade-school'], requiredClothes: 'casual', requiredExperience: 20, requiredDependability: 20, careerPoints: 18 },
  { id: 'machinists-helper', title: "Machinist's Helper", location: 'factory', baseWage: 12, hoursPerShift: 6, requiredDegrees: ['trade-school'], requiredClothes: 'casual', requiredExperience: 30, requiredDependability: 30, careerPoints: 22 },
  { id: 'secretary', title: 'Secretary', location: 'factory', baseWage: 9, hoursPerShift: 6, requiredDegrees: ['junior-college'], requiredClothes: 'dress', requiredExperience: 40, requiredDependability: 40, careerPoints: 25 },
  { id: 'teller', title: 'Teller', location: 'bank', baseWage: 12, hoursPerShift: 6, requiredDegrees: ['junior-college'], requiredClothes: 'dress', requiredExperience: 30, requiredDependability: 30, careerPoints: 25 },
  { id: 'apartment-manager', title: 'Apartment Manager', location: 'rent-office', baseWage: 13, hoursPerShift: 6, requiredDegrees: ['junior-college'], requiredClothes: 'casual', requiredExperience: 30, requiredDependability: 30, careerPoints: 28 },
  { id: 'technician', title: 'Technician', location: 'socket-city', baseWage: 14, hoursPerShift: 6, requiredDegrees: ['electronics'], requiredClothes: 'casual', requiredExperience: 40, requiredDependability: 40, careerPoints: 30 },
  { id: 'repair-tech', title: 'Repair Technician', location: 'socket-city', baseWage: 15, hoursPerShift: 6, requiredDegrees: ['electronics', 'junior-college'], requiredClothes: 'dress', requiredExperience: 50, requiredDependability: 50, careerPoints: 35 },
  { id: 'assistant-manager-bm', title: 'Assistant Manager', location: 'blacks-market', baseWage: 15, hoursPerShift: 6, requiredDegrees: ['business-admin'], requiredClothes: 'dress', requiredExperience: 40, requiredDependability: 40, careerPoints: 35 },
  { id: 'general-manager', title: 'General Manager', location: 'factory', baseWage: 25, hoursPerShift: 6, requiredDegrees: ['engineering', 'business-admin'], requiredClothes: 'business', requiredExperience: 70, requiredDependability: 70, careerPoints: 100 },
];

const APPLIANCES = [
  { id: 'refrigerator', name: 'Refrigerator', socketCityPrice: 876, happiness: 1, canBeStolen: false },
  { id: 'freezer', name: 'Freezer', socketCityPrice: 500, happiness: 1, canBeStolen: true },
  { id: 'computer', name: 'Computer', socketCityPrice: 1599, happiness: 3, canBeStolen: false },
  { id: 'television', name: 'Television', socketCityPrice: 650, happiness: 2, canBeStolen: true },
  { id: 'stereo', name: 'Stereo', socketCityPrice: 400, happiness: 2, canBeStolen: true },
  { id: 'vcr', name: 'VCR', socketCityPrice: 550, happiness: 2, canBeStolen: true },
  { id: 'microwave', name: 'Microwave', socketCityPrice: 350, happiness: 1, canBeStolen: true },
];

const CLOTHING = {
  casual: { qtPrice: 80, qtDuration: 13, happiness: 0 },
  dress: { qtPrice: 150, qtDuration: 13, happiness: 2 },
  business: { qtPrice: 300, qtDuration: 13, happiness: 3 },
};

const FAST_FOOD = [
  { id: 'burger', name: 'Burger', basePrice: 8, happinessBonus: 0 },
];

const APARTMENTS = {
  'low-cost': { name: 'Low-Cost Housing', baseRent: 125 },
  'security': { name: 'LeSecurity Apartments', baseRent: 350 },
};

const WEEKEND_EVENTS = [
  { text: "You had a quiet weekend at home reading.", cost: 5, happinessChange: 1 },
  { text: "You stayed home and watched TV.", cost: 10, happinessChange: 1 },
  { text: "You went to a great party!", cost: 40, happinessChange: 3 },
  { text: "You took a day trip to the beach.", cost: 45, happinessChange: 3 },
  { text: "You went to a concert. It was amazing!", cost: 100, happinessChange: 5 },
  { text: "Medical emergency! Doctor's visit required.", cost: 150, happinessChange: -4 },
];

const WILD_WILLY = {
  apartmentRobbery: { chancePerItem: 0.25, happinessLoss: 4 },
};

const DOCTOR_VISIT = { minCost: 30, maxCost: 200, hoursLost: 10, happinessLoss: 4 };

// ========== HELPER FUNCTIONS ==========

function calculatePrice(basePrice, economyIndex) {
  const multiplier = 1 + (economyIndex / 100);
  return Math.round(basePrice * Math.max(0.5, Math.min(2.5, multiplier)));
}

function calculateWage(baseWage, economyIndex, experience = 0) {
  const economyMultiplier = 1 + (economyIndex / 100);
  const experienceBonus = 1 + (experience / 200);
  return Math.round(baseWage * Math.max(0.5, Math.min(2.5, economyMultiplier)) * experienceBonus);
}

function hasRequiredClothing(player, required) {
  if (required === 'none') return true;
  if (required === 'casual') return player.clothes.casual > 0 || player.clothes.dress > 0 || player.clothes.business > 0;
  if (required === 'dress') return player.clothes.dress > 0 || player.clothes.business > 0;
  if (required === 'business') return player.clothes.business > 0;
  return false;
}

function meetsJobRequirements(player, job) {
  for (const degree of job.requiredDegrees) {
    if (!player.degrees.includes(degree)) {
      return { eligible: false, reason: `Requires ${degree}` };
    }
  }
  if (!hasRequiredClothing(player, job.requiredClothes)) {
    return { eligible: false, reason: `Requires ${job.requiredClothes} clothes` };
  }
  if (player.experience < job.requiredExperience) {
    return { eligible: false, reason: `Requires ${job.requiredExperience} experience` };
  }
  if (player.dependability < job.requiredDependability) {
    return { eligible: false, reason: `Requires ${job.requiredDependability} dependability` };
  }
  return { eligible: true };
}

function getAvailableDegrees(player) {
  return DEGREES.filter(degree => {
    if (player.degrees.includes(degree.id)) return false;
    if (player.enrolledCourses.includes(degree.id)) return false;
    return degree.prerequisites.every(prereq => player.degrees.includes(prereq));
  });
}

function getLessonsRequired(player, degree) {
  let lessons = degree.lessonsRequired;
  if (player.items.includes('computer')) lessons -= 1;
  return Math.max(1, lessons);
}

function getMaxFoodStorage(player) {
  if (!player.items.includes('refrigerator')) return 0;
  if (player.items.includes('freezer')) return 12;
  return 6;
}

function createInitialPlayer(id, name) {
  return {
    id, name,
    money: 50, bankBalance: 0, happiness: 10,
    education: 1, career: 0,
    currentLocation: 'low-cost-housing',
    job: null, degrees: [],
    clothes: { casual: 6, dress: 0, business: 0 },
    food: 2, hasFastFood: false, hoursRemaining: 60,
    items: [], apartment: 'low-cost',
    studyProgress: {}, enrolledCourses: [],
    experience: 0, dependability: 10, relaxation: 25,
    lotteryTickets: 0, pawnedItems: [],
  };
}

// ========== AI LOGIC ==========

function getAIAvailableJobs(player) {
  return JOBS.filter(job => meetsJobRequirements(player, job).eligible);
}

function getBestAvailableJob(player) {
  const availableJobs = getAIAvailableJobs(player);
  if (availableJobs.length === 0) return null;
  return availableJobs.reduce((best, job) => job.baseWage > best.baseWage ? job : best);
}

function getCurrentClothingLevel(player) {
  if (player.clothes.business > 0) return 'business';
  if (player.clothes.dress > 0) return 'dress';
  if (player.clothes.casual > 0) return 'casual';
  return 'none';
}

function calculatePriority(player, goals) {
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
    wealthProgress, happinessProgress, educationProgress, careerProgress,
    lowestProgress: Math.min(wealthProgress, happinessProgress, educationProgress, careerProgress),
  };
}

// Simulerer en hel tur for en spiller - returnerer alle handlinger som gjøres
function simulateFullTurn(player, goals, rentDue, economyIndex) {
  const actions = [];
  let simulatedPlayer = JSON.parse(JSON.stringify(player)); // Deep copy

  // Max 20 handlinger per tur for å unngå uendelige løkker
  for (let i = 0; i < 20 && simulatedPlayer.hoursRemaining > 0; i++) {
    const priority = calculatePriority(simulatedPlayer, goals);

    // Emergency: Pay rent if due
    if (rentDue && !actions.some(a => a.action === 'PAY_RENT')) {
      actions.push({ action: 'MOVE_TO_LOCATION', params: { locationId: 'rent-office' }, message: 'Goes to pay rent' });
      actions.push({ action: 'PAY_RENT', message: 'Pays rent' });
      simulatedPlayer.hoursRemaining -= 4;
      continue;
    }

    // Emergency: Buy food if starving
    const maxStorage = getMaxFoodStorage(simulatedPlayer);
    if (simulatedPlayer.food <= 1 && !simulatedPlayer.hasFastFood) {
      if (maxStorage === 0) {
        const burger = FAST_FOOD.find(f => f.id === 'burger');
        const cost = calculatePrice(burger.basePrice, economyIndex);
        if (simulatedPlayer.money >= cost) {
          actions.push({ action: 'MOVE_TO_LOCATION', params: { locationId: 'monolith-burger' }, message: 'Needs food' });
          actions.push({ action: 'BUY_FAST_FOOD', params: { itemId: 'burger', cost }, message: 'Buys a burger' });
          simulatedPlayer.money -= cost;
          simulatedPlayer.hasFastFood = true;
          simulatedPlayer.hoursRemaining -= 4;
        }
        continue;
      }
    }

    // Not enough hours left? End turn
    if (simulatedPlayer.hoursRemaining < 8) {
      break;
    }

    // Priority 1: Get a job if none
    if (!simulatedPlayer.job) {
      const bestJob = getBestAvailableJob(simulatedPlayer);
      if (bestJob) {
        actions.push({ action: 'MOVE_TO_LOCATION', params: { locationId: 'employment-office' }, message: 'Looking for a job' });
        actions.push({ action: 'APPLY_FOR_JOB', params: { job: bestJob }, message: `Applies for ${bestJob.title}` });
        simulatedPlayer.job = bestJob;
        simulatedPlayer.hoursRemaining -= 6;
        continue;
      }

      // Need clothes for jobs?
      const currentClothing = getCurrentClothingLevel(simulatedPlayer);
      if (currentClothing === 'none') {
        const cost = calculatePrice(CLOTHING.casual.qtPrice, economyIndex);
        if (simulatedPlayer.money >= cost) {
          actions.push({ action: 'MOVE_TO_LOCATION', params: { locationId: 'qt-clothing' }, message: 'Needs clothes for a job' });
          actions.push({ action: 'BUY_CLOTHES', params: { clothingType: 'casual', cost, weeks: CLOTHING.casual.qtDuration }, message: 'Buys casual clothes' });
          simulatedPlayer.clothes.casual += CLOTHING.casual.qtDuration;
          simulatedPlayer.money -= cost;
          simulatedPlayer.hoursRemaining -= 4;
          continue;
        }
      }
    }

    // Priority 2: Work if has job and needs money
    if (simulatedPlayer.job && priority.needsWealth) {
      actions.push({ action: 'MOVE_TO_LOCATION', params: { locationId: simulatedPlayer.job.location }, message: `Goes to work` });
      const workHours = Math.min(simulatedPlayer.hoursRemaining - 4, simulatedPlayer.job.hoursPerShift);
      actions.push({ action: 'WORK', params: { hours: workHours }, message: `Works ${workHours} hours as ${simulatedPlayer.job.title}` });
      const earnings = calculateWage(simulatedPlayer.job.baseWage, economyIndex, simulatedPlayer.experience) * workHours;
      simulatedPlayer.money += earnings;
      simulatedPlayer.experience = Math.min(100, simulatedPlayer.experience + Math.floor(workHours / 2));
      simulatedPlayer.dependability = Math.min(100, simulatedPlayer.dependability + 1);
      simulatedPlayer.hoursRemaining -= workHours + 4;
      continue;
    }

    // Priority 3: Study
    if (priority.needsEducation || (priority.needsCareer && simulatedPlayer.degrees.length < 2)) {
      const availableDegrees = getAvailableDegrees(simulatedPlayer);

      if (simulatedPlayer.enrolledCourses.length > 0) {
        const degreeId = simulatedPlayer.enrolledCourses[0];
        const degree = DEGREES.find(d => d.id === degreeId);
        if (degree) {
          const lessonsRequired = getLessonsRequired(simulatedPlayer, degree);
          const currentProgress = simulatedPlayer.studyProgress[degreeId] || 0;
          const studyHours = Math.min(simulatedPlayer.hoursRemaining - 4, lessonsRequired - currentProgress);

          if (studyHours > 0) {
            actions.push({ action: 'MOVE_TO_LOCATION', params: { locationId: 'hi-tech-u' }, message: 'Continues studying' });
            actions.push({ action: 'STUDY', params: { degreeId, hours: studyHours }, message: `Studies ${degree.name} for ${studyHours} hours` });

            const newProgress = currentProgress + studyHours;
            if (newProgress >= lessonsRequired) {
              simulatedPlayer.degrees.push(degreeId);
              simulatedPlayer.enrolledCourses = simulatedPlayer.enrolledCourses.filter(c => c !== degreeId);
              simulatedPlayer.education += degree.educationPoints;
              simulatedPlayer.studyProgress[degreeId] = 0;
            } else {
              simulatedPlayer.studyProgress[degreeId] = newProgress;
            }
            simulatedPlayer.hoursRemaining -= studyHours + 4;
            continue;
          }
        }
      } else if (availableDegrees.length > 0) {
        const degree = availableDegrees[0];
        const cost = calculatePrice(degree.enrollmentFee, economyIndex);
        if (simulatedPlayer.money >= cost) {
          actions.push({ action: 'MOVE_TO_LOCATION', params: { locationId: 'hi-tech-u' }, message: 'Enrolls in a course' });
          actions.push({ action: 'ENROLL_DEGREE', params: { degreeId: degree.id, cost }, message: `Enrolls in ${degree.name}` });
          simulatedPlayer.enrolledCourses.push(degree.id);
          simulatedPlayer.studyProgress[degree.id] = 0;
          simulatedPlayer.money -= cost;
          simulatedPlayer.hoursRemaining -= 6;
          continue;
        }
      }
    }

    // Priority 4: Buy appliances for happiness
    if (priority.needsHappiness && simulatedPlayer.money >= 400) {
      const unpurchasedItems = APPLIANCES.filter(item => !simulatedPlayer.items.includes(item.id) && item.socketCityPrice > 0);
      if (unpurchasedItems.length > 0) {
        const item = unpurchasedItems[0];
        const cost = calculatePrice(item.socketCityPrice, economyIndex);
        if (simulatedPlayer.money >= cost) {
          actions.push({ action: 'MOVE_TO_LOCATION', params: { locationId: 'socket-city' }, message: 'Goes shopping' });
          actions.push({ action: 'BUY_APPLIANCE', params: { itemId: item.id, cost, happiness: item.happiness }, message: `Buys a ${item.name}` });
          simulatedPlayer.items.push(item.id);
          simulatedPlayer.happiness = Math.min(100, simulatedPlayer.happiness + item.happiness);
          simulatedPlayer.money -= cost;
          simulatedPlayer.hoursRemaining -= 4;
          continue;
        }
      }
    }

    // Default: Work more if possible
    if (simulatedPlayer.job && simulatedPlayer.hoursRemaining >= 10) {
      actions.push({ action: 'MOVE_TO_LOCATION', params: { locationId: simulatedPlayer.job.location }, message: 'Goes to work' });
      const workHours = Math.min(simulatedPlayer.hoursRemaining - 4, simulatedPlayer.job.hoursPerShift);
      actions.push({ action: 'WORK', params: { hours: workHours }, message: `Works ${workHours} hours` });
      const earnings = calculateWage(simulatedPlayer.job.baseWage, economyIndex, simulatedPlayer.experience) * workHours;
      simulatedPlayer.money += earnings;
      simulatedPlayer.experience = Math.min(100, simulatedPlayer.experience + Math.floor(workHours / 2));
      simulatedPlayer.hoursRemaining -= workHours + 4;
      continue;
    }

    // Nothing more to do
    break;
  }

  // End the turn
  actions.push({ action: 'END_TURN', message: 'Ends week' });
  return actions;
}

// ========== GAME STATE MANAGEMENT ==========

function checkWinCondition(player, goals) {
  const wealthProgress = ((player.money + player.bankBalance) / goals.wealth) * 100;
  const happinessProgress = (player.happiness / goals.happiness) * 100;
  const educationProgress = (player.education / goals.education) * 100;
  const careerProgress = (player.career / goals.career) * 100;
  return wealthProgress >= 100 && happinessProgress >= 100 && educationProgress >= 100 && careerProgress >= 100;
}

function processEndTurn(state, playerIndex) {
  const player = state.players[playerIndex];

  // Weekend event
  const event = WEEKEND_EVENTS[Math.floor(Math.random() * WEEKEND_EVENTS.length)];
  const eventCost = Math.min(player.money, event.cost);
  player.money -= eventCost;
  player.happiness = Math.max(0, Math.min(100, player.happiness + event.happinessChange));

  // Food consumption
  if (player.hasFastFood || player.food > 0) {
    if (player.food > 0) player.food--;
  } else {
    // Starvation
    const doctorCost = Math.floor(Math.random() * (DOCTOR_VISIT.maxCost - DOCTOR_VISIT.minCost + 1)) + DOCTOR_VISIT.minCost;
    player.money = Math.max(0, player.money - doctorCost);
    player.happiness = Math.max(0, player.happiness - DOCTOR_VISIT.happinessLoss);
  }

  // Clothes wear
  player.clothes.casual = Math.max(0, player.clothes.casual - 1);
  player.clothes.dress = Math.max(0, player.clothes.dress - 1);
  player.clothes.business = Math.max(0, player.clothes.business - 1);

  // Dependability decrease
  player.dependability = Math.max(0, player.dependability - 3);

  // Job loss check
  if (player.dependability < 10 && player.job) {
    player.job = null;
  }

  // Wild Willy check
  if (player.apartment === 'low-cost' && state.week >= 4) {
    const stealableItems = player.items.filter(item => {
      const appliance = APPLIANCES.find(a => a.id === item);
      return appliance?.canBeStolen !== false;
    });
    for (const item of stealableItems) {
      if (Math.random() < WILD_WILLY.apartmentRobbery.chancePerItem) {
        player.items = player.items.filter(i => i !== item);
        player.happiness = Math.max(0, player.happiness - WILD_WILLY.apartmentRobbery.happinessLoss);
      }
    }
  }

  // Reset for next turn
  player.hasFastFood = false;
  player.hoursRemaining = 60;
  player.currentLocation = player.apartment === 'low-cost' ? 'low-cost-housing' : 'security-apartments';
}

function processAction(state, action, playerIndex) {
  const player = state.players[playerIndex];

  switch (action.action) {
    case 'MOVE_TO_LOCATION':
      player.currentLocation = action.params.locationId;
      break;

    case 'WORK':
      if (player.job) {
        const earnings = calculateWage(player.job.baseWage, state.economyIndex, player.experience) * action.params.hours;
        player.money += earnings;
        player.hoursRemaining -= action.params.hours;
        player.career = Math.max(player.career, player.job.careerPoints);
        player.experience = Math.min(100, player.experience + Math.floor(action.params.hours / 2));
        player.dependability = Math.min(100, player.dependability + 1);
      }
      break;

    case 'STUDY':
      const degree = DEGREES.find(d => d.id === action.params.degreeId);
      if (degree) {
        const lessonsRequired = getLessonsRequired(player, degree);
        const currentProgress = player.studyProgress[action.params.degreeId] || 0;
        const newProgress = currentProgress + action.params.hours;
        const completed = newProgress >= lessonsRequired;

        player.hoursRemaining -= action.params.hours;
        player.studyProgress[action.params.degreeId] = completed ? 0 : newProgress;

        if (completed && !player.degrees.includes(action.params.degreeId)) {
          player.degrees.push(action.params.degreeId);
          player.enrolledCourses = player.enrolledCourses.filter(c => c !== action.params.degreeId);
          player.education += degree.educationPoints;
          player.dependability = Math.min(100, player.dependability + 5);
        }
      }
      break;

    case 'BUY_FAST_FOOD':
      player.money -= action.params.cost;
      player.hasFastFood = true;
      break;

    case 'BUY_FRESH_FOOD':
      player.money -= action.params.cost;
      player.food += action.params.units;
      break;

    case 'BUY_CLOTHES':
      player.money -= action.params.cost;
      player.clothes[action.params.clothingType] += action.params.weeks;
      break;

    case 'BUY_APPLIANCE':
      player.money -= action.params.cost;
      if (!player.items.includes(action.params.itemId)) {
        player.items.push(action.params.itemId);
        player.happiness = Math.min(100, player.happiness + action.params.happiness);
      }
      break;

    case 'APPLY_FOR_JOB':
      player.job = action.params.job;
      player.career = Math.max(player.career, action.params.job.careerPoints);
      player.hoursRemaining -= 2;
      break;

    case 'ENROLL_DEGREE':
      player.money -= action.params.cost;
      player.enrolledCourses.push(action.params.degreeId);
      player.studyProgress[action.params.degreeId] = 0;
      player.hoursRemaining -= 2;
      break;

    case 'PAY_RENT':
      const apartment = APARTMENTS[player.apartment];
      const rentAmount = calculatePrice(apartment.baseRent, state.economyIndex);
      player.money -= rentAmount;
      if (player.money < 0) {
        player.bankBalance += player.money;
        player.money = 0;
      }
      state.rentDue = false;
      break;

    case 'END_TURN':
      processEndTurn(state, playerIndex);

      // Advance game state
      state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
      if (state.currentPlayerIndex === 0) {
        state.week++;
        if (state.week % 4 === 0) {
          state.rentDue = true;
        }
        // Economy fluctuation
        state.economyIndex += (Math.random() - 0.5) * 10;
        state.economyIndex = Math.max(-30, Math.min(90, state.economyIndex));
      }
      break;
  }
}

// ========== SIMULATION ==========

function runSimulation() {
  console.log('\n========================================');
  console.log('   JONES AI GAMEPLAY SIMULATION TEST');
  console.log('========================================\n');

  const goals = { wealth: 500, happiness: 50, education: 30, career: 30 };
  console.log('GOALS:', goals);

  const state = {
    players: [
      createInitialPlayer('player', 'Player'),
      createInitialPlayer('jones', 'Jones'),
    ],
    currentPlayerIndex: 0,
    week: 1,
    economyIndex: 0,
    rentDue: false,
    isGameOver: false,
    winner: null,
    goals,
  };

  const log = [];
  const maxWeeks = 100;

  console.log('\nStarting simulation...\n');

  while (!state.isGameOver && state.week <= maxWeeks) {
    const currentPlayer = state.players[state.currentPlayerIndex];

    // Simuler hele turen for denne spilleren
    const turnActions = simulateFullTurn(currentPlayer, goals, state.rentDue, state.economyIndex);

    for (const action of turnActions) {
      const logEntry = `[Week ${state.week}] ${currentPlayer.name}: ${action.message}`;
      log.push(logEntry);

      // Log viktige hendelser
      if (action.action === 'APPLY_FOR_JOB' ||
          action.action === 'ENROLL_DEGREE' ||
          (action.action === 'STUDY' && action.message.includes('Studies')) ||
          action.action === 'BUY_APPLIANCE') {
        console.log(logEntry);
      }

      processAction(state, action, state.currentPlayerIndex);

      // Sjekk vinnervilkår
      if (checkWinCondition(currentPlayer, goals)) {
        state.isGameOver = true;
        state.winner = currentPlayer;
        break;
      }
    }

    // Rapporter status hver 10. uke
    if (state.week % 10 === 0 && state.currentPlayerIndex === 0) {
      console.log(`\n--- Week ${state.week} Status ---`);
      for (const p of state.players) {
        const pr = calculatePriority(p, goals);
        console.log(`  ${p.name}: $${p.money} | H:${p.happiness} | Job: ${p.job?.title || 'None'} | Progress: W:${pr.wealthProgress.toFixed(0)}% H:${pr.happinessProgress.toFixed(0)}% E:${pr.educationProgress.toFixed(0)}% C:${pr.careerProgress.toFixed(0)}%`);
      }
    }
  }

  console.log('\n========================================');
  console.log('           SIMULATION RESULTS');
  console.log('========================================\n');

  if (state.winner) {
    console.log(`WINNER: ${state.winner.name}!`);
  } else if (state.week > maxWeeks) {
    console.log('NO WINNER - Maximum weeks reached');
  }

  console.log(`\nTotal weeks: ${state.week}`);

  console.log('\n--- FINAL PLAYER STATS ---');
  for (const player of state.players) {
    const priority = calculatePriority(player, goals);
    console.log(`\n${player.name}:`);
    console.log(`  Money: $${player.money} | Bank: $${player.bankBalance}`);
    console.log(`  Happiness: ${player.happiness} | Education: ${player.education} | Career: ${player.career}`);
    console.log(`  Job: ${player.job ? player.job.title : 'None'}`);
    console.log(`  Degrees: ${player.degrees.length > 0 ? player.degrees.join(', ') : 'None'}`);
    console.log(`  Experience: ${player.experience} | Dependability: ${player.dependability}`);
    console.log(`  Items: ${player.items.length > 0 ? player.items.join(', ') : 'None'}`);
    console.log(`  Progress: W:${priority.wealthProgress.toFixed(0)}% H:${priority.happinessProgress.toFixed(0)}% E:${priority.educationProgress.toFixed(0)}% C:${priority.careerProgress.toFixed(0)}%`);
  }

  console.log('\n--- AI BEHAVIOR ANALYSIS ---');
  const jonesActions = log.filter(l => l.includes('Jones:'));
  const workActions = jonesActions.filter(l => l.includes('Works'));
  const studyActions = jonesActions.filter(l => l.includes('Studies') || l.includes('Enrolls'));
  const buyActions = jonesActions.filter(l => l.includes('Buys'));
  const jobActions = jonesActions.filter(l => l.includes('Applies'));

  console.log(`Jones total actions: ${jonesActions.length}`);
  console.log(`  - Work actions: ${workActions.length}`);
  console.log(`  - Study actions: ${studyActions.length}`);
  console.log(`  - Buy actions: ${buyActions.length}`);
  console.log(`  - Job applications: ${jobActions.length}`);

  // Issue detection
  console.log('\n--- ISSUE DETECTION ---');
  const issues = [];

  const jones = state.players.find(p => p.id === 'jones');
  if (!jones.job && state.week > 10) {
    issues.push('WARNING: Jones has no job after 10 weeks');
  }
  if (jones.degrees.length === 0 && state.week > 20) {
    issues.push('WARNING: Jones has no degrees after 20 weeks');
  }
  if (jones.happiness < 10) {
    issues.push('WARNING: Jones happiness is very low');
  }
  if (workActions.length === 0 && state.week > 5) {
    issues.push('ERROR: Jones never worked');
  }
  if (studyActions.length === 0 && state.week > 15) {
    issues.push('WARNING: Jones never studied');
  }

  if (issues.length === 0) {
    console.log('No issues detected! AI behaved as expected.');
  } else {
    for (const issue of issues) {
      console.log(issue);
    }
  }

  return { state, log, issues };
}

// Run simulation
console.log('Running AI gameplay simulation...\n');

const result = runSimulation();

console.log('\n========================================');
console.log('         TEST COMPLETE');
console.log('========================================\n');
