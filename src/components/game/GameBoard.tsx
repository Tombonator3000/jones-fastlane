import { motion } from 'framer-motion';
import { LOCATIONS, Location } from '@/types/game';
import { useGame } from '@/contexts/GameContext';
import gameBoardImage from '@/assets/game-board.jpg';

interface GameBoardProps {
  onLocationClick: (location: Location) => void;
}

export function GameBoard({ onLocationClick }: GameBoardProps) {
  const { state, getCurrentPlayer } = useGame();
  const currentPlayer = getCurrentPlayer();

  return (
    <div 
      className="relative w-full aspect-[3/2] max-w-4xl mx-auto rounded-lg overflow-hidden"
      style={{
        backgroundImage: `url(${gameBoardImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Center info panel - game status */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background/95 rounded-lg pixel-border p-4 min-w-[200px] text-center">
        <h2 className="font-pixel text-xs md:text-sm text-primary mb-2">
          JONES IN THE FAST LANE
        </h2>
        <div className="game-text">
          <p className="text-muted-foreground text-sm">Week {state.week} • Month {state.month}</p>
          {currentPlayer && (
            <p className="text-primary mt-2 text-lg font-bold">
              {currentPlayer.avatar} {currentPlayer.name}&apos;s Turn
            </p>
          )}
          {currentPlayer && (
            <p className="text-muted-foreground text-xs mt-1">
              {currentPlayer.hoursRemaining} hours left
            </p>
          )}
        </div>
      </div>

      {/* Clickable location hotspots */}
      {LOCATIONS.map((location) => {
        const isCurrentLocation = currentPlayer?.currentLocation === location.id;
        const playersHere = state.players.filter(p => p.currentLocation === location.id);

        return (
          <motion.button
            key={location.id}
            className="absolute w-12 h-12 md:w-16 md:h-16 rounded-lg bg-transparent hover:bg-primary/20 border-2 border-transparent hover:border-primary cursor-pointer transition-all flex items-center justify-center"
            style={{
              left: `${location.position.x}%`,
              top: `${location.position.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            animate={isCurrentLocation ? { 
              boxShadow: ['0 0 10px hsl(45, 100%, 50%)', '0 0 25px hsl(45, 100%, 50%)', '0 0 10px hsl(45, 100%, 50%)'],
              borderColor: 'hsl(45, 100%, 50%)'
            } : {}}
            transition={isCurrentLocation ? { repeat: Infinity, duration: 1 } : {}}
            onClick={() => onLocationClick(location)}
            title={location.name}
          >
            {/* Player markers */}
            {playersHere.length > 0 && (
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
                {playersHere.map(p => (
                  <motion.div
                    key={p.id}
                    className="w-6 h-6 rounded-full bg-primary border-2 border-foreground flex items-center justify-center text-sm shadow-lg"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    {p.avatar}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
