import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { GameProvider, useGame } from '@/contexts/GameContext';
import { GameBoard } from '@/components/game/GameBoard';
import { PlayerStats } from '@/components/game/PlayerStats';
import { GameSetup } from '@/components/game/GameSetup';
import { WeekendEventDialog } from '@/components/game/WeekendEventDialog';
import { WildWillyDialog } from '@/components/game/WildWillyDialog';
import { GameOverDialog } from '@/components/game/GameOverDialog';
import { Location, LOCATIONS, Job } from '@/types/game';
import { toast } from 'sonner';
import { useJonesAI } from '@/hooks/useJonesAI';
import { useMovementAnimation } from '@/hooks/useMovementAnimation';
import { getHomeLocation } from '@/data/roadPaths';

function GameContent() {
  const { state, dispatch, getCurrentPlayer } = useGame();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showWeekendEvent, setShowWeekendEvent] = useState(false);
  const [showWildWilly, setShowWildWilly] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [isAiTurn, setIsAiTurn] = useState(false);
  const [pendingEndTurn, setPendingEndTurn] = useState(false);
  const aiActionQueue = useRef<Array<{ action: string; params?: Record<string, unknown>; delay: number; message: string }>>([]);
  const { decideNextAction } = useJonesAI();
  const {
    currentAnimation,
    isAnimating,
    startMovement,
    completeAnimation,
    queueAutoGoHome,
  } = useMovementAnimation();
  const player = getCurrentPlayer();

  // Check if current player is Jones (AI)
  const isJonesPlaying = player?.name === 'Jones';

  // Process AI actions
  const processNextAiAction = useCallback(() => {
    if (aiActionQueue.current.length === 0) {
      setIsAiTurn(false);
      setAiMessage(null);
      return;
    }

    const nextAction = aiActionQueue.current.shift();
    if (!nextAction) return;

    setAiMessage(nextAction.message);

    setTimeout(() => {
      const currentAiPlayer = getCurrentPlayer();

      switch (nextAction.action) {
        case 'MOVE_TO_LOCATION': {
          // Use animation for AI movement
          const targetLocationId = nextAction.params?.locationId as string;
          if (currentAiPlayer && currentAiPlayer.currentLocation !== targetLocationId) {
            startMovement(
              currentAiPlayer,
              currentAiPlayer.currentLocation,
              targetLocationId,
              () => {
                dispatch({ type: 'MOVE_TO_LOCATION', locationId: targetLocationId });
                // Continue with next action after animation
                setTimeout(processNextAiAction, 300);
              }
            );
            return; // Don't continue processing until animation is done
          } else {
            dispatch({ type: 'MOVE_TO_LOCATION', locationId: targetLocationId });
          }
          break;
        }
        case 'WORK':
          dispatch({ type: 'WORK', hours: nextAction.params?.hours as number });
          break;
        case 'STUDY':
          dispatch({ type: 'STUDY', degreeId: nextAction.params?.degreeId as string, hours: nextAction.params?.hours as number });
          break;
        case 'BUY_FOOD':
          dispatch({ type: 'BUY_FOOD', amount: nextAction.params?.amount as number, cost: nextAction.params?.cost as number });
          break;
        case 'BUY_CLOTHES':
          dispatch({ type: 'BUY_CLOTHES', level: nextAction.params?.level as string, cost: nextAction.params?.cost as number });
          break;
        case 'BUY_ITEM':
          dispatch({ type: 'BUY_ITEM', itemId: nextAction.params?.itemId as string, cost: nextAction.params?.cost as number, happiness: nextAction.params?.happiness as number });
          break;
        case 'APPLY_FOR_JOB':
          dispatch({ type: 'APPLY_FOR_JOB', job: nextAction.params?.job as Job });
          break;
        case 'ENROLL_DEGREE':
          dispatch({ type: 'ENROLL_DEGREE', degreeId: nextAction.params?.degreeId as string, cost: nextAction.params?.cost as number });
          break;
        case 'PAY_RENT':
          dispatch({ type: 'PAY_RENT' });
          break;
        case 'DEPOSIT_MONEY':
          dispatch({ type: 'DEPOSIT_MONEY', amount: nextAction.params?.amount as number });
          break;
        case 'END_TURN': {
          // AI should also go home before ending turn
          const homeLocation = getHomeLocation(currentAiPlayer?.apartment || 'low-cost');
          if (currentAiPlayer && currentAiPlayer.currentLocation !== homeLocation) {
            queueAutoGoHome(currentAiPlayer, () => {
              dispatch({ type: 'END_TURN' });
              setTimeout(processNextAiAction, 300);
            });
            return; // Don't continue until animation is done
          }
          dispatch({ type: 'END_TURN' });
          break;
        }
      }

      // Process next action after a short delay
      setTimeout(processNextAiAction, 500);
    }, nextAction.delay);
  }, [dispatch, getCurrentPlayer, startMovement, queueAutoGoHome]);

  // Trigger AI turn when it's Jones' turn
  useEffect(() => {
    if (isJonesPlaying && state.isGameStarted && !state.isGameOver && !isAiTurn && !showWeekendEvent && !showWildWilly) {
      // Small delay before AI starts thinking
      const timer = setTimeout(() => {
        setIsAiTurn(true);
        const decisions = decideNextAction(player!, state.goals, state.rentDue);
        aiActionQueue.current = decisions;
        processNextAiAction();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isJonesPlaying, state.isGameStarted, state.isGameOver, isAiTurn, showWeekendEvent, showWildWilly, state.currentPlayerIndex, decideNextAction, player, state.goals, state.rentDue, processNextAiAction]);

  useEffect(() => {
    if (state.weekendEvent && state.isGameStarted) {
      setShowWeekendEvent(true);
    }
  }, [state.weekendEvent, state.week]);

  // Wild Willy robbery event
  useEffect(() => {
    if (state.wildWillyEvent && state.isGameStarted) {
      setShowWildWilly(true);
    }
  }, [state.wildWillyEvent, state.isGameStarted]);

  useEffect(() => {
    if (state.rentDue && player && !isJonesPlaying) {
      toast.warning("Rent is due! Visit the Rent Office to pay.");
    }
  }, [state.rentDue, player, isJonesPlaying]);

  const handleLocationClick = (location: Location) => {
    if (!player || isAiTurn || isAnimating) return;

    if (player.currentLocation !== location.id) {
      // Check if player has enough time to move (costs 4 hours)
      if (player.hoursRemaining < 4) {
        toast.error("Ikke nok tid til a bevege deg! Avslutt uken.");
        return;
      }

      // Start movement animation, then update game state when complete
      startMovement(
        player,
        player.currentLocation,
        location.id,
        () => {
          dispatch({ type: 'MOVE_TO_LOCATION', locationId: location.id });
          setSelectedLocation(location);
        }
      );
    } else {
      // Already at this location, just open the menu
      setSelectedLocation(location);
    }
  };

  const handleEndTurn = () => {
    if (isAiTurn || isAnimating) return;

    if (!player) return;

    // Get the player's home location
    const homeLocation = getHomeLocation(player.apartment);

    // If player is not at home, animate them going home first
    if (player.currentLocation !== homeLocation) {
      setPendingEndTurn(true);
      queueAutoGoHome(player, () => {
        // After arriving home, end the turn
        dispatch({ type: 'END_TURN' });
        setPendingEndTurn(false);
      });
    } else {
      // Already at home, just end the turn
      dispatch({ type: 'END_TURN' });
    }
  };

  const handleRestart = () => {
    window.location.reload();
  };

  if (!state.isGameStarted) {
    return <GameSetup onStart={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.header
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-pixel text-xl md:text-2xl text-primary title-text">
            JONES IN THE FAST LANE
          </h1>
        </motion.header>

        {/* Main game layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Player Stats Sidebar */}
          <motion.div
            className="lg:col-span-1 order-2 lg:order-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <PlayerStats />
            
            {/* End Turn Button */}
            <Button
              className="pixel-button w-full mt-4 bg-accent hover:bg-accent/90"
              onClick={handleEndTurn}
              disabled={isAiTurn || isAnimating || pendingEndTurn}
            >
              {isAiTurn ? 'JONES SPILLER...' : pendingEndTurn ? 'GAR HJEM...' : isAnimating ? 'BEVEGER SEG...' : 'AVSLUTT UKE'}
            </Button>

            {/* AI Message */}
            {aiMessage && (
              <motion.div
                className="mt-4 bg-primary/20 border border-primary rounded-lg p-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="font-pixel text-xs text-primary text-center">
                  🤖 {aiMessage}
                </p>
              </motion.div>
            )}

            {/* Rent Warning */}
            {state.rentDue && (
              <motion.div
                className="mt-4 bg-destructive/20 border border-destructive rounded-lg p-3"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <p className="font-pixel text-xs text-destructive text-center">
                  ⚠️ RENT DUE!
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Game Board */}
          <motion.div
            className="lg:col-span-3 order-1 lg:order-2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <GameBoard
              onLocationClick={handleLocationClick}
              selectedLocation={selectedLocation}
              onCloseLocation={() => setSelectedLocation(null)}
              movementAnimation={currentAnimation}
              onAnimationComplete={completeAnimation}
            />
            
            {/* Quick info bar */}
            <div className="mt-4 flex flex-wrap justify-center gap-4 bg-card/50 rounded-lg p-3 pixel-border">
              <span className="game-text">
                📅 Week {state.week} • Month {state.month}
              </span>
              <span className="game-text text-muted-foreground">
                Current: {LOCATIONS.find(l => l.id === player?.currentLocation)?.name || 'Unknown'}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Dialogs */}
      <WeekendEventDialog
        open={showWeekendEvent}
        onClose={() => {
          setShowWeekendEvent(false);
          dispatch({ type: 'SET_WEEKEND_EVENT', event: null });
        }}
      />

      <WildWillyDialog
        open={showWildWilly}
        onClose={() => {
          setShowWildWilly(false);
        }}
      />

      <GameOverDialog
        open={state.isGameOver}
        onRestart={handleRestart}
      />
    </div>
  );
}

const Index = () => {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
};

export default Index;
