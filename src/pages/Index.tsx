import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { GameProvider, useGame } from '@/contexts/GameContext';
import { GameBoard } from '@/components/game/GameBoard';
import { PlayerStats } from '@/components/game/PlayerStats';
import { LocationDialog } from '@/components/game/LocationDialog';
import { GameSetup } from '@/components/game/GameSetup';
import { WeekendEventDialog } from '@/components/game/WeekendEventDialog';
import { GameOverDialog } from '@/components/game/GameOverDialog';
import { Location, LOCATIONS } from '@/types/game';
import { toast } from 'sonner';

function GameContent() {
  const { state, dispatch, getCurrentPlayer } = useGame();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showWeekendEvent, setShowWeekendEvent] = useState(false);
  const player = getCurrentPlayer();

  useEffect(() => {
    if (state.weekendEvent && state.isGameStarted) {
      setShowWeekendEvent(true);
    }
  }, [state.weekendEvent, state.week]);

  useEffect(() => {
    if (state.rentDue && player) {
      toast.warning("Rent is due! Visit the Rent Office to pay.");
    }
  }, [state.rentDue]);

  const handleLocationClick = (location: Location) => {
    if (!player) return;
    
    if (player.currentLocation !== location.id) {
      dispatch({ type: 'MOVE_TO_LOCATION', locationId: location.id });
    }
    setSelectedLocation(location);
  };

  const handleEndTurn = () => {
    dispatch({ type: 'END_TURN' });
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
            >
              END WEEK
            </Button>

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
            <GameBoard onLocationClick={handleLocationClick} />
            
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
      <LocationDialog
        location={selectedLocation}
        open={!!selectedLocation}
        onClose={() => setSelectedLocation(null)}
      />

      <WeekendEventDialog
        open={showWeekendEvent}
        onClose={() => {
          setShowWeekendEvent(false);
          dispatch({ type: 'SET_WEEKEND_EVENT', event: null });
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
