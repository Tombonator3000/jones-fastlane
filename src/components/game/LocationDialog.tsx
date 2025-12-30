import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import { Location, JOBS, DEGREES, CLOTHING_PRICES, ITEMS, RENT_PRICES } from '@/types/game';
import { toast } from 'sonner';

interface LocationDialogProps {
  location: Location | null;
  open: boolean;
  onClose: () => void;
}

export function LocationDialog({ location, open, onClose }: LocationDialogProps) {
  const { state, dispatch, getCurrentPlayer, getAvailableJobs } = useGame();
  const player = getCurrentPlayer();
  const [selectedTab, setSelectedTab] = useState('main');

  if (!location || !player) return null;

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
    dispatch({ type: 'WORK', hours });
    const earnings = Math.floor((player.job.wage * hours / 8) * state.economyMultiplier);
    toast.success(`Worked ${hours} hours and earned $${earnings}!`);
  };

  const handleBuyFood = (weeks: number) => {
    const cost = weeks * 25;
    if (player.money < cost) {
      toast.error("Not enough money!");
      return;
    }
    dispatch({ type: 'BUY_FOOD', amount: weeks, cost });
    toast.success(`Bought ${weeks} weeks of food for $${cost}`);
  };

  const handleBuyClothes = (level: string) => {
    const cost = CLOTHING_PRICES[level as keyof typeof CLOTHING_PRICES];
    if (player.money < cost) {
      toast.error("Not enough money!");
      return;
    }
    dispatch({ type: 'BUY_CLOTHES', level, cost });
    toast.success(`Bought ${level} clothes for $${cost}`);
  };

  const handleApplyForJob = (jobId: string) => {
    const job = JOBS.find(j => j.id === jobId);
    if (!job) return;

    const hasRequiredDegrees = job.requiredDegrees.every(d => player.degrees.includes(d));
    if (!hasRequiredDegrees) {
      toast.error(`You need degrees in: ${job.requiredDegrees.join(', ')}`);
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

    if (player.money < degree.cost) {
      toast.error("Not enough money for enrollment!");
      return;
    }

    dispatch({ type: 'ENROLL_DEGREE', degreeId, cost: degree.cost });
    toast.success(`Enrolled in ${degree.name}! Study to complete.`);
  };

  const handleStudy = (degreeId: string, hours: number) => {
    if (player.hoursRemaining < hours) {
      toast.error("Not enough time!");
      return;
    }
    dispatch({ type: 'STUDY', degreeId, hours });
    const newProgress = (player.studyProgress[degreeId] || 0) + hours;
    if (newProgress >= 10) {
      toast.success(`Degree completed! 🎓`);
    } else {
      toast.success(`Studied for ${hours} hours. Progress: ${newProgress}/10`);
    }
  };

  const handleBuyItem = (itemId: string) => {
    const item = ITEMS[itemId as keyof typeof ITEMS];
    if (!item) return;

    if (player.money < item.price) {
      toast.error("Not enough money!");
      return;
    }

    dispatch({ type: 'BUY_ITEM', itemId, cost: item.price, happiness: item.happiness });
    toast.success(`Bought ${item.name} for $${item.price}! +${item.happiness} happiness`);
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

  const handlePayRent = () => {
    const rentAmount = Math.floor(RENT_PRICES[player.apartment] * state.economyMultiplier);
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
      case 'blacks-market':
        return (
          <div className="space-y-4">
            <p className="game-text text-muted-foreground">{location.description}</p>
            
            <div className="space-y-2">
              <h4 className="font-pixel text-xs text-primary">Buy Food</h4>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map(weeks => (
                  <Button
                    key={weeks}
                    variant="outline"
                    className="pixel-button"
                    onClick={() => handleBuyFood(weeks)}
                    disabled={player.money < weeks * 25}
                  >
                    {weeks} week(s) - ${weeks * 25}
                  </Button>
                ))}
              </div>
            </div>

            {player.job?.location === location.id && (
              <div className="space-y-2 pt-4 border-t border-border">
                <h4 className="font-pixel text-xs text-primary">Work Here</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[4, 8].map(hours => (
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
              "Welcome to QT Clothing. The only place where you can buy just one pant!"
            </p>
            
            <div className="space-y-2">
              <h4 className="font-pixel text-xs text-primary">Buy Clothes</h4>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(CLOTHING_PRICES).filter(([k]) => k !== 'rags').map(([level, price]) => (
                  <Button
                    key={level}
                    variant="outline"
                    className="pixel-button justify-between"
                    onClick={() => handleBuyClothes(level)}
                    disabled={player.money < price || player.clothes === level}
                  >
                    <span className="capitalize">{level}</span>
                    <span>${price}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'employment-office':
        return (
          <div className="space-y-4">
            <p className="game-text text-muted-foreground">{location.description}</p>
            
            <div className="space-y-2">
              <h4 className="font-pixel text-xs text-primary">Available Jobs</h4>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {getAvailableJobs().map(job => (
                  <Button
                    key={job.id}
                    variant="outline"
                    className="pixel-button w-full justify-between"
                    onClick={() => handleApplyForJob(job.id)}
                    disabled={player.job?.id === job.id}
                  >
                    <div className="text-left">
                      <div>{job.title}</div>
                      <div className="text-[8px] text-muted-foreground">${job.wage}/shift</div>
                    </div>
                    {player.job?.id === job.id && <span className="text-primary">✓</span>}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'hi-tech-u':
        return (
          <div className="space-y-4">
            <p className="game-text text-muted-foreground">{location.description}</p>
            
            <div className="space-y-2">
              <h4 className="font-pixel text-xs text-primary">Degrees</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {DEGREES.map(degree => {
                  const hasStarted = player.studyProgress[degree.id] !== undefined;
                  const progress = player.studyProgress[degree.id] || 0;
                  const completed = player.degrees.includes(degree.id);

                  return (
                    <div key={degree.id} className="bg-muted rounded p-2 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-pixel text-xs">{degree.name}</span>
                        {completed ? (
                          <span className="text-primary">✓ Complete</span>
                        ) : hasStarted ? (
                          <span className="text-muted-foreground text-xs">{progress}/10h</span>
                        ) : (
                          <span className="text-muted-foreground text-xs">${degree.cost}</span>
                        )}
                      </div>
                      
                      {!completed && (
                        hasStarted ? (
                          <div className="grid grid-cols-2 gap-2">
                            {[2, 4].map(hours => (
                              <Button
                                key={hours}
                                size="sm"
                                variant="secondary"
                                className="pixel-button text-[8px]"
                                onClick={() => handleStudy(degree.id, hours)}
                                disabled={player.hoursRemaining < hours}
                              >
                                Study {hours}h
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="pixel-button w-full text-[8px]"
                            onClick={() => handleEnrollDegree(degree.id)}
                            disabled={player.money < degree.cost}
                          >
                            Enroll
                          </Button>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 'socket-city':
      case 'z-mart':
        return (
          <div className="space-y-4">
            <p className="game-text text-muted-foreground">{location.description}</p>
            
            <div className="space-y-2">
              <h4 className="font-pixel text-xs text-primary">Items for Sale</h4>
              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                {Object.entries(ITEMS).map(([id, item]) => (
                  <Button
                    key={id}
                    variant="outline"
                    className="pixel-button justify-between"
                    onClick={() => handleBuyItem(id)}
                    disabled={player.money < item.price || player.items.includes(id)}
                  >
                    <span>{item.name} (+{item.happiness} 😊)</span>
                    <span>${item.price}</span>
                  </Button>
                ))}
              </div>
            </div>

            {player.job?.location === location.id && (
              <div className="space-y-2 pt-4 border-t border-border">
                <h4 className="font-pixel text-xs text-primary">Work Here</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[4, 8].map(hours => (
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

            {player.job?.location === location.id && (
              <div className="space-y-2 pt-4 border-t border-border">
                <h4 className="font-pixel text-xs text-primary">Work Here</h4>
                <Button
                  variant="secondary"
                  className="pixel-button w-full"
                  onClick={() => handleWork(8)}
                  disabled={player.hoursRemaining < 8}
                >
                  Work 8h
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
                <div className="grid grid-cols-2 gap-2">
                  {[4, 8, 10].map(hours => (
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
                You don&apos;t work here. Visit the Employment Office to find a job.
              </p>
            )}
          </div>
        );

      case 'rent-office':
        const rentAmount = Math.floor(RENT_PRICES[player.apartment] * state.economyMultiplier);
        return (
          <div className="space-y-4">
            <p className="game-text text-muted-foreground">{location.description}</p>
            
            <div className="bg-muted rounded p-3 space-y-2">
              <div className="flex justify-between">
                <span>Current Apartment:</span>
                <span className="capitalize">{player.apartment === 'low-cost' ? 'Low-Cost' : 'Security'}</span>
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
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="pixel-button"
                  onClick={() => handleChangeApartment('low-cost')}
                  disabled={player.apartment === 'low-cost'}
                >
                  Low-Cost ($80)
                </Button>
                <Button
                  variant="outline"
                  className="pixel-button"
                  onClick={() => handleChangeApartment('security')}
                  disabled={player.apartment === 'security'}
                >
                  Security ($200)
                </Button>
              </div>
            </div>
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
                    {player.items.map(item => (
                      <span key={item} className="bg-card px-2 py-1 rounded text-xs">
                        {ITEMS[item as keyof typeof ITEMS]?.name || item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'pawn-shop':
        return (
          <div className="space-y-4">
            <p className="game-text text-muted-foreground">{location.description}</p>
            
            {player.items.length > 0 ? (
              <div className="space-y-2">
                <h4 className="font-pixel text-xs text-primary">Sell Items</h4>
                <p className="text-muted-foreground text-sm">
                  Items can be pawned for 50% of original value.
                </p>
              </div>
            ) : (
              <p className="game-text text-muted-foreground">
                You have no items to pawn.
              </p>
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
      <DialogContent className="bg-card border-border pixel-border max-w-md">
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
