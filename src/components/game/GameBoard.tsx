import { motion, AnimatePresence } from 'framer-motion';
import { LOCATIONS, Location } from '@/types/game';
import { useGame } from '@/contexts/GameContext';
import { LocationMenu } from './LocationMenu';
import { PlayerToken } from './PlayerToken';
import { MovementAnimation } from '@/hooks/useMovementAnimation';
import gameBoardImage from '@/assets/game-board.jpg';

interface GameBoardProps {
  onLocationClick: (location: Location) => void;
  selectedLocation: Location | null;
  onCloseLocation: () => void;
  movementAnimation?: MovementAnimation | null;
  onAnimationComplete?: () => void;
}

export function GameBoard({
  onLocationClick,
  selectedLocation,
  onCloseLocation,
  movementAnimation,
  onAnimationComplete,
}: GameBoardProps) {
  const { state, getCurrentPlayer } = useGame();
  const currentPlayer = getCurrentPlayer();

  // Check if a player is currently animating (should hide their static marker)
  const animatingPlayerId = movementAnimation?.playerId;

  return (
    <div
      className="relative w-full h-full rounded-lg overflow-hidden"
      style={{
        backgroundImage: `url(${gameBoardImage})`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Center panel - covers the white square in the middle of the board */}
      {/* Based on reference image: the center area is roughly 35-65% horizontally, 32-68% vertically */}
      <div 
        className="absolute z-20 flex items-center justify-center"
        style={{
          left: '35%',
          top: '32%',
          width: '30%',
          height: '36%',
        }}
      >
        <AnimatePresence mode="wait">
          {selectedLocation ? (
            <motion.div
              key="location-menu"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="w-full h-full flex items-center justify-center"
            >
              <LocationMenu
                location={selectedLocation}
                onClose={onCloseLocation}
              />
            </motion.div>
          ) : (
            <motion.div
              key="game-status"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="location-menu-panel text-center w-full h-full flex flex-col items-center justify-center"
            >
              <div className="location-menu-header w-full">
                <h2 className="font-pixel text-[10px] md:text-xs text-[#f5f0e6]">
                  GUILD LIFE
                </h2>
              </div>
              <div className="location-menu-content flex-1 flex flex-col items-center justify-center">
                <p className="text-[#4a4a5a] text-sm">Week {state.week} • Month {state.month}</p>
                {currentPlayer && (
                  <>
                    <p className="text-[#1a1a2e] mt-2 text-lg font-bold">
                      {currentPlayer.avatar} {currentPlayer.name}&apos;s Turn
                    </p>
                    <p className="text-[#4a4a5a] text-sm mt-1">
                      {currentPlayer.hoursRemaining} hours left
                    </p>
                  </>
                )}
                <p className="text-[#6a6a7a] text-xs mt-4 italic">
                  Click a location to interact
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Clickable location hotspots */}
      {LOCATIONS.map((location) => {
        const isCurrentLocation = currentPlayer?.currentLocation === location.id;
        // Filter out players who are currently animating - they'll be shown as moving tokens
        const playersHere = state.players.filter(
          p => p.currentLocation === location.id && p.id !== animatingPlayerId
        );

        return (
          <motion.button
            key={location.id}
            className="absolute rounded-lg bg-transparent hover:bg-primary/20 border-2 border-transparent hover:border-primary cursor-pointer transition-all flex items-center justify-center"
            style={{
              left: `${location.position.x}%`,
              top: `${location.position.y}%`,
              width: `${location.size.width}%`,
              height: `${location.size.height}%`,
              transform: 'translate(-50%, -50%)',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={isCurrentLocation && !animatingPlayerId ? {
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

      {/* Animated player token for movement */}
      {movementAnimation && onAnimationComplete && (
        <PlayerToken
          playerId={movementAnimation.playerId}
          avatar={movementAnimation.avatar}
          path={movementAnimation.path}
          isAnimating={true}
          onAnimationComplete={onAnimationComplete}
          isCurrentPlayer={movementAnimation.playerId === currentPlayer?.id}
        />
      )}
    </div>
  );
}
