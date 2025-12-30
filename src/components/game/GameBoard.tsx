import { motion } from 'framer-motion';
import { LOCATIONS, Location } from '@/types/game';
import { useGame } from '@/contexts/GameContext';

interface GameBoardProps {
  onLocationClick: (location: Location) => void;
}

export function GameBoard({ onLocationClick }: GameBoardProps) {
  const { state, getCurrentPlayer } = useGame();
  const currentPlayer = getCurrentPlayer();

  const getLocationStyle = (location: Location) => {
    const baseClasses = "absolute w-16 h-16 md:w-20 md:h-20 rounded-lg pixel-border flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 hover:z-20";
    
    const colorMap: Record<string, string> = {
      'location-apartment': 'bg-location-apartment',
      'location-work': 'bg-location-work',
      'location-store': 'bg-location-store',
      'location-service': 'bg-location-service',
      'location-food': 'bg-location-food',
    };

    return `${baseClasses} ${colorMap[location.color] || 'bg-muted'}`;
  };

  return (
    <div className="relative w-full aspect-square max-w-2xl mx-auto retro-screen rounded-lg p-4 scanlines">
      {/* Center area with game info */}
      <div className="absolute inset-[25%] flex flex-col items-center justify-center bg-card/50 rounded-lg pixel-border p-4">
        <h2 className="font-pixel text-xs md:text-sm text-primary mb-2 text-center">
          JONES IN THE FAST LANE
        </h2>
        <div className="game-text text-center">
          <p className="text-muted-foreground text-sm">Week {state.week}</p>
          <p className="text-muted-foreground text-sm">Month {state.month}</p>
          {currentPlayer && (
            <p className="text-primary mt-2 text-lg">
              {currentPlayer.name}&apos;s Turn
            </p>
          )}
        </div>
      </div>

      {/* Locations around the board */}
      {LOCATIONS.map((location) => {
        const isCurrentLocation = currentPlayer?.currentLocation === location.id;
        const hasPlayer = state.players.some(p => p.currentLocation === location.id);

        return (
          <motion.div
            key={location.id}
            className={getLocationStyle(location)}
            style={{
              left: `${location.position.x}%`,
              top: `${location.position.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            animate={isCurrentLocation ? { 
              boxShadow: ['0 0 10px hsl(45, 100%, 50%)', '0 0 20px hsl(45, 100%, 50%)', '0 0 10px hsl(45, 100%, 50%)']
            } : {}}
            transition={isCurrentLocation ? { repeat: Infinity, duration: 1 } : {}}
            onClick={() => onLocationClick(location)}
          >
            <span className="text-2xl md:text-3xl">{location.icon}</span>
            <span className="font-pixel text-[6px] md:text-[8px] text-center leading-tight mt-1 text-foreground">
              {location.name.split(' ').slice(0, 2).join(' ')}
            </span>
            
            {/* Player markers */}
            {hasPlayer && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                {state.players
                  .filter(p => p.currentLocation === location.id)
                  .map(p => (
                    <motion.div
                      key={p.id}
                      className="w-4 h-4 rounded-full bg-primary border-2 border-foreground flex items-center justify-center text-xs"
                      animate={{ y: [0, -3, 0] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    >
                      {p.avatar}
                    </motion.div>
                  ))}
              </div>
            )}
          </motion.div>
        );
      })}

      {/* Road/path connecting locations */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
        <ellipse
          cx="50%"
          cy="50%"
          rx="42%"
          ry="42%"
          fill="none"
          stroke="hsl(220, 20%, 25%)"
          strokeWidth="8"
          strokeDasharray="20 10"
        />
      </svg>
    </div>
  );
}
