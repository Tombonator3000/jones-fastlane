import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGame } from '@/contexts/GameContext';
import {
  Location,
  JOBS,
  DEGREES,
  CLOTHING,
  APPLIANCES,
  APARTMENTS,
  FAST_FOOD,
  FRESH_FOOD,
  STOCKS,
  calculatePrice,
  calculateWage,
  getMaxFoodStorage,
  meetsJobRequirements,
  getLessonsRequired,
} from '@/types/game';
import { toast } from 'sonner';

interface LocationMenuProps {
  location: Location | null;
  onClose: () => void;
}

export function LocationMenu({ location, onClose }: LocationMenuProps) {
  const { state, dispatch, getCurrentPlayer, getAvailableJobs, getPlayerAvailableDegrees } = useGame();
  const player = getCurrentPlayer();

  if (!location || !player) {
    // Default center panel content
    return (
      <div className="location-menu-panel">
        <div className="location-menu-header">
          <h2 className="font-pixel text-xs md:text-sm text-[#1a1a2e]">
            JONES IN THE FAST LANE
          </h2>
        </div>
        <div className="location-menu-content">
          <p className="game-text text-[#1a1a2e] text-center">Week {state.week} • Month {state.month}</p>
          {getCurrentPlayer() && (
            <>
              <p className="text-[#1a1a2e] mt-2 text-lg font-bold text-center">
                {getCurrentPlayer()?.avatar} {getCurrentPlayer()?.name}'s Turn
              </p>
              <p className="text-[#4a4a5a] text-sm text-center mt-1">
                {getCurrentPlayer()?.hoursRemaining} hours left
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  const economyIndex = state.economyIndex;

  const handleWork = (hours: number) => {
    if (!player.job) {
      toast.error("You need a job first! Visit the Employment Office.");
      return;
    }
    if (player.job.location !== location.id) {
      toast.error(`You don't work here! Your job is at ${player.job.location}`);
      return;
    }
    if (player.hoursRemaining < hours) {
      toast.error("Not enough time!");
      return;
    }
    const earnings = calculateWage(player.job.baseWage, economyIndex) * hours;
    dispatch({ type: 'WORK', hours });
    toast.success(`Worked ${hours} hours and earned $${earnings}!`);
  };

  const handleBuyFastFood = (itemId: string) => {
    const item = FAST_FOOD.find(f => f.id === itemId);
    if (!item) return;

    const cost = calculatePrice(item.basePrice, economyIndex);
    if (player.money < cost) {
      toast.error("Not enough money!");
      return;
    }
    dispatch({ type: 'BUY_FAST_FOOD', itemId, cost, happiness: item.happinessBonus });
    toast.success(`Bought ${item.name} for $${cost}!`);
  };

  const handleBuyFreshFood = (units: number) => {
    const maxStorage = getMaxFoodStorage(player);
    if (maxStorage === 0) {
      toast.error("You need a refrigerator to store fresh food!");
      return;
    }
    const cost = units * calculatePrice(FRESH_FOOD.pricePerUnit, economyIndex);
    if (player.money < cost) {
      toast.error("Not enough money!");
      return;
    }
    dispatch({ type: 'BUY_FRESH_FOOD', units, cost });
    toast.success(`Bought ${units} units of fresh food for $${cost}`);
  };

  const handleBuyClothes = (clothingType: 'casual' | 'dress' | 'business', store: 'qt' | 'zmart') => {
    const clothingInfo = CLOTHING[clothingType];
    const price = store === 'qt' ? clothingInfo.qtPrice : clothingInfo.zMartPrice;
    const weeks = store === 'qt' ? clothingInfo.qtDuration : clothingInfo.zMartDuration;
    const happiness = store === 'qt' ? clothingInfo.happiness : 0;

    if (!price) {
      toast.error("Not available at this store!");
      return;
    }

    const cost = calculatePrice(price, economyIndex);
    if (player.money < cost) {
      toast.error("Not enough money!");
      return;
    }
    dispatch({ type: 'BUY_CLOTHES', clothingType, store, cost, weeks, happiness });
    toast.success(`Bought ${clothingType} clothes for $${cost}! (+${weeks} weeks)`);
  };

  const handleApplyForJob = (jobId: string) => {
    const job = JOBS.find(j => j.id === jobId);
    if (!job) return;

    const { eligible, reason } = meetsJobRequirements(player, job);
    if (!eligible) {
      toast.error(reason || "You don't meet the requirements");
      return;
    }

    dispatch({ type: 'APPLY_FOR_JOB', job });
    toast.success(`Congratulations! You're now a ${job.title}!`);
  };

  const handleEnrollDegree = (degreeId: string) => {
    const degree = DEGREES.find(d => d.id === degreeId);
    if (!degree) return;

    if (player.degrees.includes(degreeId)) {
      toast.error("You already have this degree!");
      return;
    }

    if (player.enrolledCourses.includes(degreeId)) {
      toast.error("Already enrolled in this course!");
      return;
    }

    if (player.enrolledCourses.length >= 4) {
      toast.error("You can only be enrolled in 4 courses at once!");
      return;
    }

    const cost = calculatePrice(degree.enrollmentFee, economyIndex);
    if (player.money < cost) {
      toast.error("Not enough money for enrollment!");
      return;
    }

    dispatch({ type: 'ENROLL_DEGREE', degreeId, cost });
    toast.success(`Enrolled in ${degree.name}! Study to complete.`);
  };

  const handleStudy = (degreeId: string, hours: number) => {
    if (player.hoursRemaining < hours) {
      toast.error("Not enough time!");
      return;
    }
    const degree = DEGREES.find(d => d.id === degreeId);
    if (!degree) return;

    dispatch({ type: 'STUDY', degreeId, hours });
    const newProgress = (player.studyProgress[degreeId] || 0) + hours;
    const lessonsRequired = getLessonsRequired(player, degree);
    if (newProgress >= lessonsRequired) {
      toast.success(`Degree completed! 🎓`);
    } else {
      toast.success(`Studied for ${hours} hours. Progress: ${newProgress}/${lessonsRequired}`);
    }
  };

  const handleBuyAppliance = (itemId: string, store: 'socket-city' | 'z-mart') => {
    const item = APPLIANCES.find(a => a.id === itemId);
    if (!item) return;

    const price = store === 'socket-city' ? item.socketCityPrice : item.zMartPrice;
    if (!price) {
      toast.error("Not available at this store!");
      return;
    }

    const cost = calculatePrice(price, economyIndex);
    if (player.money < cost) {
      toast.error("Not enough money!");
      return;
    }

    dispatch({ type: 'BUY_APPLIANCE', itemId, cost, happiness: item.happiness, store });
    toast.success(`Bought ${item.name} for $${cost}! +${item.happiness} happiness`);
  };

  const handleDeposit = (amount: number) => {
    if (player.money < amount) {
      toast.error("Not enough cash!");
      return;
    }
    dispatch({ type: 'DEPOSIT_MONEY', amount });
    toast.success(`Deposited $${amount}`);
  };

  const handleWithdraw = (amount: number) => {
    if (player.bankBalance < amount) {
      toast.error("Not enough in bank!");
      return;
    }
    dispatch({ type: 'WITHDRAW_MONEY', amount });
    toast.success(`Withdrew $${amount}`);
  };

  const handleBuyStock = (stockId: string, quantity: number) => {
    const price = state.stockPrices[stockId] || 100;
    const totalCost = price * quantity;
    if (player.money < totalCost) {
      toast.error("Not enough money!");
      return;
    }
    dispatch({ type: 'BUY_STOCK', stockId, quantity, price });
    const stock = STOCKS.find(s => s.id === stockId);
    toast.success(`Bought ${quantity} shares of ${stock?.name} for $${totalCost}`);
  };

  const handleSellStock = (stockId: string, quantity: number) => {
    const owned = player.stocks[stockId] || 0;
    if (owned < quantity) {
      toast.error("You don't own that many shares!");
      return;
    }
    const price = state.stockPrices[stockId] || 100;
    dispatch({ type: 'SELL_STOCK', stockId, quantity, price });
    const stock = STOCKS.find(s => s.id === stockId);
    toast.success(`Sold ${quantity} shares of ${stock?.name} for $${price * quantity}`);
  };

  const handleBuyLottery = () => {
    if (player.money < 10) {
      toast.error("Not enough money! Lottery tickets cost $10");
      return;
    }
    dispatch({ type: 'BUY_LOTTERY_TICKETS', cost: 10 });
    toast.success("Bought 10 lottery tickets for $10!");
  };

  const handlePayRent = () => {
    const apartment = APARTMENTS[player.apartment];
    const rentAmount = calculatePrice(apartment.baseRent, economyIndex);
    dispatch({ type: 'PAY_RENT' });
    toast.success(`Paid $${rentAmount} rent`);
    onClose();
  };

  const handleChangeApartment = (apartmentType: 'low-cost' | 'security') => {
    dispatch({ type: 'CHANGE_APARTMENT', apartmentType });
    toast.success(`Moved to ${apartmentType === 'low-cost' ? 'Low-Cost Housing' : 'Security Apartments'}`);
  };

  // Work section component for locations where player works
  const WorkSection = () => {
    if (player.job?.location !== location.id) return null;
    return (
      <div className="location-menu-section">
        <h4 className="location-menu-section-title">WORK HERE</h4>
        <p className="text-[#4a4a5a] text-sm mb-2">
          {player.job.title} - ${calculateWage(player.job.baseWage, economyIndex)}/hr
        </p>
        <div className="flex gap-2">
          {[4, 6, 8].map(hours => (
            <Button
              key={hours}
              className="location-menu-button"
              onClick={() => handleWork(hours)}
              disabled={player.hoursRemaining < hours}
            >
              {hours}h
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (location.id) {
      case 'monolith-burger':
        return (
          <div className="space-y-3">
            <p className="text-[#4a4a5a] text-sm italic">
              "Welcome to Monolith Burgers! Try our Astro Chicken!"
            </p>
            <div className="location-menu-section">
              <h4 className="location-menu-section-title">FAST FOOD MENU</h4>
              <ScrollArea className="h-32">
                <div className="space-y-1">
                  {FAST_FOOD.map(item => {
                    const cost = calculatePrice(item.basePrice, economyIndex);
                    return (
                      <button
                        key={item.id}
                        className="location-menu-item"
                        onClick={() => handleBuyFastFood(item.id)}
                        disabled={player.money < cost}
                      >
                        <span>{item.name}</span>
                        <span>${cost}</span>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
            <WorkSection />
          </div>
        );

      case 'blacks-market':
        const maxStorage = getMaxFoodStorage(player);
        return (
          <div className="space-y-3">
            <p className="text-[#4a4a5a] text-sm italic">
              "Welcome to Black's Market! Fresh groceries and more!"
            </p>
            <div className="location-menu-section">
              <h4 className="location-menu-section-title">FRESH FOOD</h4>
              {maxStorage === 0 ? (
                <p className="text-[#8a4a4a] text-sm">You need a refrigerator!</p>
              ) : (
                <>
                  <div className="flex gap-2">
                    {[1, 2, 4].map(units => {
                      const cost = units * calculatePrice(FRESH_FOOD.pricePerUnit, economyIndex);
                      return (
                        <Button
                          key={units}
                          className="location-menu-button"
                          onClick={() => handleBuyFreshFood(units)}
                          disabled={player.money < cost || player.food + units > maxStorage}
                        >
                          {units}u ${cost}
                        </Button>
                      );
                    })}
                  </div>
                  <p className="text-[#4a4a5a] text-xs mt-1">
                    Storage: {player.food}/{maxStorage}
                  </p>
                </>
              )}
            </div>
            <div className="location-menu-section">
              <h4 className="location-menu-section-title">LOTTERY</h4>
              <Button
                className="location-menu-button w-full"
                onClick={handleBuyLottery}
                disabled={player.money < 10}
              >
                10 Tickets - $10 {player.lotteryTickets > 0 && `(${player.lotteryTickets})`}
              </Button>
            </div>
            <WorkSection />
          </div>
        );

      case 'qt-clothing':
        return (
          <div className="space-y-3">
            <p className="text-[#4a4a5a] text-sm italic">
              "Quality clothes that last!"
            </p>
            <div className="location-menu-section">
              <h4 className="location-menu-section-title">BUY CLOTHES (QT)</h4>
              <div className="space-y-1">
                {(['casual', 'dress', 'business'] as const).map(type => {
                  const info = CLOTHING[type];
                  const cost = calculatePrice(info.qtPrice, economyIndex);
                  return (
                    <button
                      key={type}
                      className="location-menu-item"
                      onClick={() => handleBuyClothes(type, 'qt')}
                      disabled={player.money < cost}
                    >
                      <span className="capitalize">{type} ({info.qtDuration}w)</span>
                      <span>${cost}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[#4a4a5a] text-xs mt-2">
                You have: C:{player.clothes.casual}w D:{player.clothes.dress}w B:{player.clothes.business}w
              </p>
            </div>
            <WorkSection />
          </div>
        );

      case 'z-mart':
        return (
          <div className="space-y-3">
            <p className="text-[#4a4a5a] text-sm italic">
              "Z-Mart: Where savings meet quality... sort of!"
            </p>
            <div className="location-menu-section">
              <h4 className="location-menu-section-title">DISCOUNT CLOTHES</h4>
              <div className="space-y-1">
                {(['casual', 'dress'] as const).map(type => {
                  const info = CLOTHING[type];
                  if (!info.zMartPrice) return null;
                  const cost = calculatePrice(info.zMartPrice, economyIndex);
                  return (
                    <button
                      key={type}
                      className="location-menu-item"
                      onClick={() => handleBuyClothes(type, 'zmart')}
                      disabled={player.money < cost}
                    >
                      <span className="capitalize">{type} ({info.zMartDuration}w)</span>
                      <span>${cost}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="location-menu-section">
              <h4 className="location-menu-section-title">ELECTRONICS</h4>
              <ScrollArea className="h-24">
                <div className="space-y-1">
                  {APPLIANCES.filter(a => a.zMartPrice !== null).map(item => {
                    const cost = calculatePrice(item.zMartPrice!, economyIndex);
                    const owned = player.items.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        className="location-menu-item"
                        onClick={() => handleBuyAppliance(item.id, 'z-mart')}
                        disabled={player.money < cost || owned}
                      >
                        <span>{item.name} {owned && '✓'}</span>
                        <span>${cost}</span>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
            <WorkSection />
          </div>
        );

      case 'socket-city':
        return (
          <div className="space-y-3">
            <p className="text-[#4a4a5a] text-sm italic">
              "Socket City: Quality electronics with warranty!"
            </p>
            <div className="location-menu-section">
              <h4 className="location-menu-section-title">APPLIANCE STORE</h4>
              <ScrollArea className="h-40">
                <div className="space-y-1">
                  {APPLIANCES.filter(a => a.socketCityPrice > 0).map(item => {
                    const cost = calculatePrice(item.socketCityPrice, economyIndex);
                    const owned = player.items.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        className="location-menu-item"
                        onClick={() => handleBuyAppliance(item.id, 'socket-city')}
                        disabled={player.money < cost || owned}
                      >
                        <span>{item.name} {owned && '✓'}</span>
                        <span>${cost}</span>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
            <WorkSection />
          </div>
        );

      case 'employment-office':
        return (
          <div className="space-y-3">
            <p className="text-[#4a4a5a] text-sm italic">
              "Find your dream job here!"
            </p>
            {player.job && (
              <div className="bg-[#e8e0d0] p-2 rounded">
                <p className="text-[#1a1a2e] text-sm">
                  Current: <span className="font-bold">{player.job.title}</span>
                </p>
                <p className="text-[#4a4a5a] text-xs">
                  ${calculateWage(player.job.baseWage, economyIndex)}/hr
                </p>
              </div>
            )}
            <div className="location-menu-section">
              <h4 className="location-menu-section-title">AVAILABLE JOBS</h4>
              <ScrollArea className="h-32">
                <div className="space-y-1">
                  {getAvailableJobs().map(job => {
                    const wage = calculateWage(job.baseWage, economyIndex);
                    return (
                      <button
                        key={job.id}
                        className="location-menu-item"
                        onClick={() => handleApplyForJob(job.id)}
                        disabled={player.job?.id === job.id}
                      >
                        <div className="text-left">
                          <div>{job.title}</div>
                          <div className="text-[10px] text-[#6a6a7a]">${wage}/hr</div>
                        </div>
                        {player.job?.id === job.id && <span>✓</span>}
                      </button>
                    );
                  })}
                  {getAvailableJobs().length === 0 && (
                    <p className="text-[#8a4a4a] text-sm">No jobs available</p>
                  )}
                </div>
              </ScrollArea>
            </div>
            <p className="text-[#4a4a5a] text-xs">
              Exp: {player.experience} | Dep: {player.dependability}
            </p>
          </div>
        );

      case 'hi-tech-u':
        const availableDegrees = getPlayerAvailableDegrees();
        return (
          <div className="space-y-3">
            <p className="text-[#4a4a5a] text-sm italic">
              "Hi-Tech University - Knowledge is Power!"
            </p>
            {player.enrolledCourses.length > 0 && (
              <div className="location-menu-section">
                <h4 className="location-menu-section-title">YOUR COURSES ({player.enrolledCourses.length}/4)</h4>
                <ScrollArea className="h-24">
                  <div className="space-y-2">
                    {player.enrolledCourses.map(courseId => {
                      const degree = DEGREES.find(d => d.id === courseId);
                      if (!degree) return null;
                      const progress = player.studyProgress[courseId] || 0;
                      const lessonsRequired = getLessonsRequired(player, degree);
                      return (
                        <div key={courseId} className="bg-[#e8e0d0] p-2 rounded">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-[#1a1a2e]">{degree.name}</span>
                            <span className="text-[#4a4a5a]">{progress}/{lessonsRequired}h</span>
                          </div>
                          <div className="flex gap-1">
                            {[2, 4, 6].map(hours => (
                              <Button
                                key={hours}
                                size="sm"
                                className="location-menu-button text-[8px] px-2 py-1 h-6"
                                onClick={() => handleStudy(courseId, hours)}
                                disabled={player.hoursRemaining < hours}
                              >
                                {hours}h
                              </Button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            )}
            <div className="location-menu-section">
              <h4 className="location-menu-section-title">ENROLL IN DEGREE</h4>
              <ScrollArea className="h-24">
                <div className="space-y-1">
                  {availableDegrees.map(degree => {
                    const cost = calculatePrice(degree.enrollmentFee, economyIndex);
                    return (
                      <button
                        key={degree.id}
                        className="location-menu-item"
                        onClick={() => handleEnrollDegree(degree.id)}
                        disabled={player.money < cost || player.enrolledCourses.length >= 4}
                      >
                        <span>{degree.name}</span>
                        <span>${cost}</span>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
            <p className="text-[#4a4a5a] text-xs">
              Degrees: {player.degrees.length}/11 | Education: {player.education}
            </p>
            <WorkSection />
          </div>
        );

      case 'bank':
        return (
          <div className="space-y-3">
            <p className="text-[#4a4a5a] text-sm italic">
              "Your money is safe with us!"
            </p>
            <div className="bg-[#e8e0d0] p-2 rounded">
              <div className="flex justify-between text-sm">
                <span>Cash:</span>
                <span className="text-[#4a8a4a] font-bold">${player.money}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Bank:</span>
                <span className="text-[#4a8a4a] font-bold">${player.bankBalance}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="location-menu-section">
                <h4 className="location-menu-section-title text-[10px]">DEPOSIT</h4>
                {[50, 100, 250].map(amount => (
                  <Button
                    key={amount}
                    size="sm"
                    className="location-menu-button w-full mb-1 text-[10px]"
                    onClick={() => handleDeposit(amount)}
                    disabled={player.money < amount}
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
              <div className="location-menu-section">
                <h4 className="location-menu-section-title text-[10px]">WITHDRAW</h4>
                {[50, 100, 250].map(amount => (
                  <Button
                    key={amount}
                    size="sm"
                    className="location-menu-button w-full mb-1 text-[10px]"
                    onClick={() => handleWithdraw(amount)}
                    disabled={player.bankBalance < amount}
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
            </div>
            <div className="location-menu-section">
              <h4 className="location-menu-section-title">STOCKS</h4>
              <ScrollArea className="h-20">
                <div className="space-y-1">
                  {STOCKS.map(stock => {
                    const price = state.stockPrices[stock.id] || stock.basePrice;
                    const owned = player.stocks[stock.id] || 0;
                    return (
                      <div key={stock.id} className="flex justify-between items-center text-xs bg-[#e8e0d0] p-1 rounded">
                        <span>{stock.name} ${price} ({owned})</span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            className="location-menu-button text-[8px] px-1 py-0 h-5"
                            onClick={() => handleBuyStock(stock.id, 1)}
                            disabled={player.money < price}
                          >
                            Buy
                          </Button>
                          <Button
                            size="sm"
                            className="location-menu-button text-[8px] px-1 py-0 h-5"
                            onClick={() => handleSellStock(stock.id, 1)}
                            disabled={owned < 1}
                          >
                            Sell
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
            <WorkSection />
          </div>
        );

      case 'factory':
        return (
          <div className="space-y-3">
            <p className="text-[#4a4a5a] text-sm italic">
              "Factory - Best paying jobs in town!"
            </p>
            {player.job?.location === location.id ? (
              <div className="location-menu-section">
                <h4 className="location-menu-section-title">WORK AT FACTORY</h4>
                <p className="text-[#1a1a2e] text-sm mb-2">
                  {player.job.title} - ${calculateWage(player.job.baseWage, economyIndex)}/hr
                </p>
                <div className="flex gap-2">
                  {[4, 6, 8].map(hours => (
                    <Button
                      key={hours}
                      className="location-menu-button"
                      onClick={() => handleWork(hours)}
                      disabled={player.hoursRemaining < hours}
                    >
                      {hours}h
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-[#4a4a5a] text-sm">
                You don't work here. Visit the Employment Office.
              </p>
            )}
          </div>
        );

      case 'rent-office':
        const apartment = APARTMENTS[player.apartment];
        const rentAmount = calculatePrice(apartment.baseRent, economyIndex);
        return (
          <div className="space-y-3">
            <p className="text-[#4a4a5a] text-sm italic">
              "Rent Office - Pay rent and change apartments"
            </p>
            <div className="bg-[#e8e0d0] p-2 rounded">
              <div className="flex justify-between text-sm">
                <span>Current:</span>
                <span className="capitalize">{apartment.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Rent:</span>
                <span>${rentAmount}/month</span>
              </div>
            </div>
            {state.rentDue && (
              <Button
                className="location-menu-button w-full bg-[#8a4a4a] hover:bg-[#9a5a5a]"
                onClick={handlePayRent}
              >
                PAY RENT (${rentAmount})
              </Button>
            )}
            <div className="location-menu-section">
              <h4 className="location-menu-section-title">CHANGE APARTMENT</h4>
              <div className="space-y-1">
                {Object.entries(APARTMENTS).map(([key, apt]) => {
                  const rent = calculatePrice(apt.baseRent, economyIndex);
                  return (
                    <button
                      key={key}
                      className="location-menu-item"
                      onClick={() => handleChangeApartment(key as 'low-cost' | 'security')}
                      disabled={player.apartment === key}
                    >
                      <div className="text-left">
                        <div>{apt.name}</div>
                        <div className="text-[10px] text-[#6a6a7a]">{apt.description}</div>
                      </div>
                      <span>${rent}/mo</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <WorkSection />
          </div>
        );

      case 'low-cost-housing':
      case 'security-apartments':
        return (
          <div className="space-y-3">
            <p className="text-[#4a4a5a] text-sm italic">
              {location.description}
            </p>
            <div className="bg-[#e8e0d0] p-2 rounded">
              <p className="text-[#1a1a2e] text-sm">Your apartment. You start each week here.</p>
              {player.items.length > 0 && (
                <div className="mt-2">
                  <p className="text-[#4a4a5a] text-xs">Your items:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {player.items.map(itemId => {
                      const item = APPLIANCES.find(a => a.id === itemId);
                      return (
                        <span key={itemId} className="bg-[#d8d0c0] px-1 py-0.5 rounded text-xs text-[#1a1a2e]">
                          {item?.name || itemId}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <p className="text-[#4a4a5a] text-xs">
              Food: {player.food} weeks | Relaxation: {player.relaxation}
            </p>
          </div>
        );

      case 'pawn-shop':
        return (
          <div className="space-y-3">
            <p className="text-[#4a4a5a] text-sm italic">
              "Pawn Shop - We buy your stuff!"
            </p>
            {player.items.length > 0 ? (
              <div className="location-menu-section">
                <h4 className="location-menu-section-title">PAWN (40% VALUE)</h4>
                <ScrollArea className="h-24">
                  <div className="space-y-1">
                    {player.items.map(itemId => {
                      const item = APPLIANCES.find(a => a.id === itemId);
                      if (!item) return null;
                      const pawnValue = Math.round(item.socketCityPrice * 0.4);
                      return (
                        <button
                          key={itemId}
                          className="location-menu-item"
                          onClick={() => dispatch({ type: 'PAWN_ITEM', itemId, pawnValue })}
                        >
                          <span>{item.name}</span>
                          <span>${pawnValue}</span>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <p className="text-[#4a4a5a] text-sm">You have no items to pawn.</p>
            )}
            {player.pawnedItems.length > 0 && (
              <div className="location-menu-section">
                <h4 className="location-menu-section-title">REDEEM ITEMS</h4>
                <div className="space-y-1">
                  {player.pawnedItems.map(pawnedItem => {
                    const item = APPLIANCES.find(a => a.id === pawnedItem.itemId);
                    return (
                      <button
                        key={pawnedItem.itemId}
                        className="location-menu-item"
                        onClick={() => dispatch({ type: 'REDEEM_ITEM', itemId: pawnedItem.itemId, cost: pawnedItem.redeemPrice })}
                        disabled={player.money < pawnedItem.redeemPrice}
                      >
                        <span>{item?.name} ({pawnedItem.weeksRemaining}w)</span>
                        <span>${pawnedItem.redeemPrice}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="space-y-3">
            <p className="text-[#4a4a5a] text-sm italic">{location.description}</p>
          </div>
        );
    }
  };

  return (
    <div className="location-menu-panel">
      <div className="location-menu-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{location.icon}</span>
            <h2 className="font-pixel text-[10px] md:text-xs text-[#1a1a2e] uppercase">
              {location.name}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="location-menu-close"
            onClick={onClose}
          >
            DONE
          </Button>
        </div>
      </div>
      <div className="location-menu-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
