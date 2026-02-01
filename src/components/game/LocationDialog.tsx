import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
  TICKETS,
  calculatePrice,
  calculateWage,
  getCurrentClothingLevel,
  getMaxFoodStorage,
  meetsJobRequirements,
  getLessonsRequired,
} from '@/types/game';
import { toast } from 'sonner';

interface LocationDialogProps {
  location: Location | null;
  open: boolean;
  onClose: () => void;
}

export function LocationDialog({ location, open, onClose }: LocationDialogProps) {
  const { state, dispatch, getCurrentPlayer, getAvailableJobs, getPlayerAvailableDegrees } = useGame();
  const player = getCurrentPlayer();

  if (!location || !player) return null;

  const economyReading = state.economyReading;

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
    const earnings = calculateWage(player.job.baseWage, economyReading) * hours;
    dispatch({ type: 'WORK', hours });
    toast.success(`Worked ${hours} hours and earned $${earnings}!`);
  };

  const handleBuyFastFood = (itemId: string) => {
    const item = FAST_FOOD.find(f => f.id === itemId);
    if (!item) return;

    const cost = calculatePrice(item.basePrice, economyReading);
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
    const cost = units * calculatePrice(FRESH_FOOD.pricePerUnit, economyReading);
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

    const cost = calculatePrice(price, economyReading);
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

    const cost = calculatePrice(degree.enrollmentFee, economyReading);
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

    const cost = calculatePrice(price, economyReading);
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
    const rentAmount = calculatePrice(apartment.baseRent, economyReading);
    dispatch({ type: 'PAY_RENT' });
    toast.success(`Paid $${rentAmount} rent`);
    onClose();
  };

  const handleChangeApartment = (apartmentType: 'low-cost' | 'security') => {
    dispatch({ type: 'CHANGE_APARTMENT', apartmentType });
    toast.success(`Moved to ${apartmentType === 'low-cost' ? 'Low-Cost Housing' : 'Security Apartments'}`);
  };

  const renderContent = () => {
    switch (location.id) {
      case 'monolith-burger':
        return (
          <div className="space-y-4">
            <p className="game-text text-muted-foreground">
              "Welcome to Monolith Burgers! Try our Astro Chicken!"
            </p>

            <div className="space-y-2">
              <h4 className="font-pixel text-xs text-primary">Fast Food Menu</h4>
              <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                {FAST_FOOD.map(item => {
                  const cost = calculatePrice(item.basePrice, economyReading);
                  return (
                    <Button
                      key={item.id}
                      variant="outline"
                      className="pixel-button justify-between"
                      onClick={() => handleBuyFastFood(item.id)}
                      disabled={player.money < cost}
                    >
                      <span>{item.name} {item.happinessBonus > 0 && `(+${item.happinessBonus}😊)`}</span>
                      <span>${cost}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {player.job?.location === location.id && (
              <div className="space-y-2 pt-4 border-t border-border">
                <h4 className="font-pixel text-xs text-primary">Work Here</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[4, 6].map(hours => (
                    <Button
                      key={hours}
                      variant="secondary"
                      className="pixel-button"
                      onClick={() => handleWork(hours)}
                      disabled={player.hoursRemaining < hours}
                    >
                      Work {hours}h
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'blacks-market':
        const maxStorage = getMaxFoodStorage(player);
        return (
          <div className="space-y-4">
            <p className="game-text text-muted-foreground">
              "Welcome to Black's Market! Fresh groceries and more!"
            </p>

            <div className="space-y-2">
              <h4 className="font-pixel text-xs text-primary">Fresh Food</h4>
              {maxStorage === 0 ? (
                <p className="text-muted-foreground text-sm">You need a refrigerator to store fresh food!</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 4].map(units => {
                    const cost = units * calculatePrice(FRESH_FOOD.pricePerUnit, economyReading);
                    return (
                      <Button
                        key={units}
                        variant="outline"
                        className="pixel-button"
                        onClick={() => handleBuyFreshFood(units)}
                        disabled={player.money < cost || player.food + units > maxStorage}
                      >
                        {units} unit(s) ${cost}
                      </Button>
                    );
                  })}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Food storage: {player.food}/{maxStorage} | +{FRESH_FOOD.happinessPerUnit}😊 per unit
              </p>
            </div>

            <div className="space-y-2 pt-4 border-t border-border">
              <h4 className="font-pixel text-xs text-primary">Lottery</h4>
              <Button
                variant="outline"
                className="pixel-button w-full"
                onClick={handleBuyLottery}
                disabled={player.money < 10}
              >
                Buy 10 Lottery Tickets - $10 {player.lotteryTickets > 0 && `(${player.lotteryTickets} owned)`}
              </Button>
            </div>

            {player.job?.location === location.id && (
              <div className="space-y-2 pt-4 border-t border-border">
                <h4 className="font-pixel text-xs text-primary">Work Here</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[4, 6].map(hours => (
                    <Button
                      key={hours}
                      variant="secondary"
                      className="pixel-button"
                      onClick={() => handleWork(hours)}
                      disabled={player.hoursRemaining < hours}
                    >
                      Work {hours}h
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'qt-clothing':
        return (
          <div className="space-y-4">
            <p className="game-text text-muted-foreground">
              "Welcome to QT Clothing! Quality clothes that last!"
            </p>

            <div className="space-y-2">
              <h4 className="font-pixel text-xs text-primary">Buy Clothes (QT Quality)</h4>
              <div className="grid grid-cols-1 gap-2">
                {(['casual', 'dress', 'business'] as const).map(type => {
                  const info = CLOTHING[type];
                  const cost = calculatePrice(info.qtPrice, economyReading);
                  return (
                    <Button
                      key={type}
                      variant="outline"
                      className="pixel-button justify-between"
                      onClick={() => handleBuyClothes(type, 'qt')}
                      disabled={player.money < cost}
                    >
                      <span className="capitalize">{type} ({info.qtDuration} weeks) {info.happiness > 0 && `+${info.happiness}😊`}</span>
                      <span>${cost}</span>
                    </Button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Current: Casual {player.clothes.casual}w | Dress {player.clothes.dress}w | Business {player.clothes.business}w
              </p>
            </div>

            {player.job?.location === location.id && (
              <div className="space-y-2 pt-4 border-t border-border">
                <h4 className="font-pixel text-xs text-primary">Work Here</h4>
                <Button
                  variant="secondary"
                  className="pixel-button w-full"
                  onClick={() => handleWork(6)}
                  disabled={player.hoursRemaining < 6}
                >
                  Work 6h
                </Button>
              </div>
            )}
          </div>
        );

      case 'z-mart':
        return (
          <div className="space-y-4">
            <p className="game-text text-muted-foreground">
              "Z-Mart: Where savings meet quality... sort of!"
            </p>

            <div className="space-y-2">
              <h4 className="font-pixel text-xs text-primary">Discount Clothes</h4>
              <div className="grid grid-cols-1 gap-2">
                {(['casual', 'dress'] as const).map(type => {
                  const info = CLOTHING[type];
                  if (!info.zMartPrice) return null;
                  const cost = calculatePrice(info.zMartPrice, economyReading);
                  return (
                    <Button
                      key={type}
                      variant="outline"
                      className="pixel-button justify-between"
                      onClick={() => handleBuyClothes(type, 'zmart')}
                      disabled={player.money < cost}
                    >
                      <span className="capitalize">{type} ({info.zMartDuration} weeks)</span>
                      <span>${cost}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-border">
              <h4 className="font-pixel text-xs text-primary">Discount Electronics</h4>
              <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                {APPLIANCES.filter(a => a.zMartPrice !== null).map(item => {
                  const cost = calculatePrice(item.zMartPrice!, economyReading);
                  return (
                    <Button
                      key={item.id}
                      variant="outline"
                      className="pixel-button justify-between"
                      onClick={() => handleBuyAppliance(item.id, 'z-mart')}
                      disabled={player.money < cost || player.items.includes(item.id)}
                    >
                      <span>{item.name} (+{item.happiness}😊)</span>
                      <span>${cost}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {player.job?.location === location.id && (
              <div className="space-y-2 pt-4 border-t border-border">
                <h4 className="font-pixel text-xs text-primary">Work Here</h4>
                <Button
                  variant="secondary"
                  className="pixel-button w-full"
                  onClick={() => handleWork(6)}
                  disabled={player.hoursRemaining < 6}
                >
                  Work 6h
                </Button>
              </div>
            )}
          </div>
        );

      case 'socket-city':
        return (
          <div className="space-y-4">
            <p className="game-text text-muted-foreground">
              "Socket City: Quality electronics with warranty!"
            </p>

            <div className="space-y-2">
              <h4 className="font-pixel text-xs text-primary">Electronics</h4>
              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                {APPLIANCES.filter(a => a.socketCityPrice > 0).map(item => {
                  const cost = calculatePrice(item.socketCityPrice, economyReading);
                  const owned = player.items.includes(item.id);
                  return (
                    <Button
                      key={item.id}
                      variant="outline"
                      className="pixel-button justify-between"
                      onClick={() => handleBuyAppliance(item.id, 'socket-city')}
                      disabled={player.money < cost || owned}
                    >
                      <div className="text-left">
                        <div>{item.name} (+{item.happiness}😊) {owned && '✓'}</div>
                        {item.special && <div className="text-[8px] text-muted-foreground">{item.special}</div>}
                      </div>
                      <span>${cost}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {player.job?.location === location.id && (
              <div className="space-y-2 pt-4 border-t border-border">
                <h4 className="font-pixel text-xs text-primary">Work Here</h4>
                <Button
                  variant="secondary"
                  className="pixel-button w-full"
                  onClick={() => handleWork(6)}
                  disabled={player.hoursRemaining < 6}
                >
                  Work 6h
                </Button>
              </div>
            )}
          </div>
        );

      case 'employment-office':
        return (
          <div className="space-y-4">
            <p className="game-text text-muted-foreground">{location.description}</p>

            {player.job && (
              <div className="bg-muted rounded p-2">
                <p className="text-xs">Current Job: <span className="text-primary">{player.job.title}</span></p>
                <p className="text-xs">Wage: ${calculateWage(player.job.baseWage, economyReading)}/hr</p>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="font-pixel text-xs text-primary">Available Jobs</h4>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {getAvailableJobs().map(job => {
                  const wage = calculateWage(job.baseWage, economyReading);
                  return (
                    <Button
                      key={job.id}
                      variant="outline"
                      className="pixel-button w-full justify-between"
                      onClick={() => handleApplyForJob(job.id)}
                      disabled={player.job?.id === job.id}
                    >
                      <div className="text-left">
                        <div>{job.title}</div>
                        <div className="text-[8px] text-muted-foreground">
                          ${wage}/hr at {job.location}
                        </div>
                      </div>
                      {player.job?.id === job.id && <span className="text-primary">✓</span>}
                    </Button>
                  );
                })}
                {getAvailableJobs().length === 0 && (
                  <p className="text-muted-foreground text-sm">No jobs available with your current qualifications.</p>
                )}
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Experience: {player.experience} | Dependability: {player.dependability}
            </div>
          </div>
        );

      case 'hi-tech-u':
        const availableDegrees = getPlayerAvailableDegrees();
        return (
          <div className="space-y-4">
            <p className="game-text text-muted-foreground">{location.description}</p>

            <div className="space-y-2">
              <h4 className="font-pixel text-xs text-primary">Your Courses ({player.enrolledCourses.length}/4)</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {player.enrolledCourses.map(courseId => {
                  const degree = DEGREES.find(d => d.id === courseId);
                  if (!degree) return null;
                  const progress = player.studyProgress[courseId] || 0;
                  const lessonsRequired = getLessonsRequired(player, degree);
                  return (
                    <div key={courseId} className="bg-muted rounded p-2 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-pixel text-xs">{degree.name}</span>
                        <span className="text-muted-foreground text-xs">{progress}/{lessonsRequired}h</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {[2, 4, 6].map(hours => (
                          <Button
                            key={hours}
                            size="sm"
                            variant="secondary"
                            className="pixel-button text-[8px]"
                            onClick={() => handleStudy(courseId, hours)}
                            disabled={player.hoursRemaining < hours}
                          >
                            Study {hours}h
                          </Button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-border">
              <h4 className="font-pixel text-xs text-primary">Available Degrees</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {availableDegrees.map(degree => {
                  const cost = calculatePrice(degree.enrollmentFee, economyReading);
                  return (
                    <div key={degree.id} className="bg-muted rounded p-2">
                      <div className="flex justify-between items-center">
                        <span className="font-pixel text-xs">{degree.name}</span>
                        <span className="text-muted-foreground text-xs">${cost}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="pixel-button w-full mt-2 text-[8px]"
                        onClick={() => handleEnrollDegree(degree.id)}
                        disabled={player.money < cost || player.enrolledCourses.length >= 4}
                      >
                        Enroll
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Degrees: {player.degrees.length}/11 | Education: {player.education}
              {player.items.includes('computer') && ' | Computer: -1 lesson'}
            </div>

            {player.job?.location === location.id && (
              <div className="space-y-2 pt-4 border-t border-border">
                <h4 className="font-pixel text-xs text-primary">Work Here</h4>
                <Button
                  variant="secondary"
                  className="pixel-button w-full"
                  onClick={() => handleWork(6)}
                  disabled={player.hoursRemaining < 6}
                >
                  Work 6h
                </Button>
              </div>
            )}
          </div>
        );

      case 'bank':
        return (
          <div className="space-y-4">
            <p className="game-text text-muted-foreground">{location.description}</p>

            <div className="bg-muted rounded p-3 space-y-2">
              <div className="flex justify-between">
                <span>Cash:</span>
                <span className="text-wealth">${player.money}</span>
              </div>
              <div className="flex justify-between">
                <span>Bank Balance:</span>
                <span className="text-wealth">${player.bankBalance}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-pixel text-xs text-primary">Deposit</h4>
                {[50, 100, 250].map(amount => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    className="pixel-button w-full"
                    onClick={() => handleDeposit(amount)}
                    disabled={player.money < amount}
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
              <div className="space-y-2">
                <h4 className="font-pixel text-xs text-primary">Withdraw</h4>
                {[50, 100, 250].map(amount => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    className="pixel-button w-full"
                    onClick={() => handleWithdraw(amount)}
                    disabled={player.bankBalance < amount}
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-border">
              <h4 className="font-pixel text-xs text-primary">Stock Market</h4>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {STOCKS.map(stock => {
                  const price = state.stockPrices[stock.id] || stock.basePrice;
                  const owned = player.stocks[stock.id] || 0;
                  return (
                    <div key={stock.id} className="bg-muted rounded p-2 flex justify-between items-center">
                      <div>
                        <div className="text-xs">{stock.name} {stock.isSafe && '(Safe)'}</div>
                        <div className="text-[8px] text-muted-foreground">${price}/share | Owned: {owned}</div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="pixel-button text-[8px] px-2"
                          onClick={() => handleBuyStock(stock.id, 1)}
                          disabled={player.money < price}
                        >
                          Buy
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="pixel-button text-[8px] px-2"
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
            </div>

            {player.job?.location === location.id && (
              <div className="space-y-2 pt-4 border-t border-border">
                <h4 className="font-pixel text-xs text-primary">Work Here</h4>
                <Button
                  variant="secondary"
                  className="pixel-button w-full"
                  onClick={() => handleWork(6)}
                  disabled={player.hoursRemaining < 6}
                >
                  Work 6h
                </Button>
              </div>
            )}
          </div>
        );

      case 'factory':
        return (
          <div className="space-y-4">
            <p className="game-text text-muted-foreground">{location.description}</p>

            {player.job?.location === location.id ? (
              <div className="space-y-2">
                <h4 className="font-pixel text-xs text-primary">Work at Factory</h4>
                <p className="text-xs text-muted-foreground">
                  Job: {player.job.title} | Wage: ${calculateWage(player.job.baseWage, economyReading)}/hr
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[4, 6, 8].map(hours => (
                    <Button
                      key={hours}
                      variant="secondary"
                      className="pixel-button"
                      onClick={() => handleWork(hours)}
                      disabled={player.hoursRemaining < hours}
                    >
                      Work {hours}h
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="game-text text-muted-foreground">
                You don't work here. Visit the Employment Office to find a job.
              </p>
            )}
          </div>
        );

      case 'rent-office':
        const apartment = APARTMENTS[player.apartment];
        const rentAmount = calculatePrice(apartment.baseRent, economyReading);
        return (
          <div className="space-y-4">
            <p className="game-text text-muted-foreground">{location.description}</p>

            <div className="bg-muted rounded p-3 space-y-2">
              <div className="flex justify-between">
                <span>Current Apartment:</span>
                <span className="capitalize">{apartment.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Rent Due:</span>
                <span className="text-wealth">${rentAmount}/month</span>
              </div>
            </div>

            {state.rentDue && (
              <Button
                variant="default"
                className="pixel-button w-full"
                onClick={handlePayRent}
              >
                Pay Rent (${rentAmount})
              </Button>
            )}

            <div className="space-y-2 pt-4 border-t border-border">
              <h4 className="font-pixel text-xs text-primary">Change Apartment</h4>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(APARTMENTS).map(([key, apt]) => {
                  const rent = calculatePrice(apt.baseRent, economyReading);
                  return (
                    <Button
                      key={key}
                      variant="outline"
                      className="pixel-button justify-between"
                      onClick={() => handleChangeApartment(key as 'low-cost' | 'security')}
                      disabled={player.apartment === key}
                    >
                      <div className="text-left">
                        <div>{apt.name}</div>
                        <div className="text-[8px] text-muted-foreground">{apt.description}</div>
                      </div>
                      <span>${rent}/mo</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {player.job?.location === location.id && (
              <div className="space-y-2 pt-4 border-t border-border">
                <h4 className="font-pixel text-xs text-primary">Work Here</h4>
                <Button
                  variant="secondary"
                  className="pixel-button w-full"
                  onClick={() => handleWork(6)}
                  disabled={player.hoursRemaining < 6}
                >
                  Work 6h
                </Button>
              </div>
            )}
          </div>
        );

      case 'low-cost-housing':
      case 'security-apartments':
        return (
          <div className="space-y-4">
            <p className="game-text text-muted-foreground">{location.description}</p>

            <div className="bg-muted rounded p-3">
              <p className="game-text">Your apartment. You start each week here.</p>
              {player.items.length > 0 && (
                <div className="mt-2">
                  <p className="text-muted-foreground text-sm">Your items:</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {player.items.map(itemId => {
                      const item = APPLIANCES.find(a => a.id === itemId);
                      return (
                        <span key={itemId} className="bg-card px-2 py-1 rounded text-xs">
                          {item?.name || itemId}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="text-xs text-muted-foreground">
              Food: {player.food} weeks | Relaxation: {player.relaxation}
            </div>
          </div>
        );

      case 'pawn-shop':
        return (
          <div className="space-y-4">
            <p className="game-text text-muted-foreground">{location.description}</p>

            {player.items.length > 0 ? (
              <div className="space-y-2">
                <h4 className="font-pixel text-xs text-primary">Pawn Your Items (40% value)</h4>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {player.items.map(itemId => {
                    const item = APPLIANCES.find(a => a.id === itemId);
                    if (!item) return null;
                    const pawnValue = Math.round(item.socketCityPrice * 0.4);
                    return (
                      <Button
                        key={itemId}
                        variant="outline"
                        className="pixel-button w-full justify-between"
                        onClick={() => dispatch({ type: 'PAWN_ITEM', itemId, pawnValue })}
                      >
                        <span>{item.name}</span>
                        <span>${pawnValue}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="game-text text-muted-foreground">
                You have no items to pawn.
              </p>
            )}

            {player.pawnedItems.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-border">
                <h4 className="font-pixel text-xs text-primary">Redeem Your Items</h4>
                {player.pawnedItems.map(pawnedItem => {
                  const item = APPLIANCES.find(a => a.id === pawnedItem.itemId);
                  return (
                    <Button
                      key={pawnedItem.itemId}
                      variant="outline"
                      className="pixel-button w-full justify-between"
                      onClick={() => dispatch({ type: 'REDEEM_ITEM', itemId: pawnedItem.itemId, cost: pawnedItem.redeemPrice })}
                      disabled={player.money < pawnedItem.redeemPrice}
                    >
                      <span>{item?.name} ({pawnedItem.weeksRemaining} weeks left)</span>
                      <span>${pawnedItem.redeemPrice}</span>
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <p className="game-text text-muted-foreground">{location.description}</p>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border pixel-border max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-pixel text-sm text-primary flex items-center gap-2">
            <span className="text-2xl">{location.icon}</span>
            {location.name}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {location.description}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          <motion.div
            key={location.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
