import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import { APPLIANCES } from '@/types/game';

interface WildWillyDialogProps {
  open: boolean;
  onClose: () => void;
}

// Wild Willy pixel art sprite (inline base64 for simplicity)
// This is a stylized bandit character with a gun
const WILD_WILLY_SPRITE = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAOESURBVFiF7ZZNaBNBFMd/s5tNd5NuYppUq9YPFBUVRBRFPHjw4MGbB/HgwYN48ODRg1cvXkTBg+LFgxcPHkQQRMSDeBARQRRFRdFWq7VVW5smNptNdjd7cNNm06TaFPTg/2DYnZl5vzfz5s0U/u9/HCLwl4DrwAlgP1ALWMA0MAoMAk+BmUCbYuC0p8sGYJ2X5Pf+VwDcvB5OcL+gD6YhOACMF5Nc8bTl4CjQBYQ9fQ8wCnQA54CjwE1gPJ+Cgo6qGQ2dAKz29DsK+gR0AC8oTAF+fgU8BA4CLQXtgJ1A3DMgI+CJgPWN2G5gO2AB3wWsEGDYa9sAdHv9dgLWAGjYC9wCLgXsYgC3PX0NcBB4H7BOgjsAGoqTJQxC6+gBLgO3CugGOAk87AwFPBOwd1GYAo6GfSdjbgTwmLyRICqUEBrfgNbO4M+LwDMBOwPcCNh+AOC+p58BXhR44hdQkOLOQrj2hKJXgJsBC5TQTsA0MBHQ/hCwcJGLpPdQAbqBu/OxOOCG9x1oAZ5PBwI+B44BR4DbBbQJ4FnAXk/PB1xUJvgJ2AGc8/T7A3YRwPPA84CdAnYGLBKwXQG75unHAGCXpx+nsBOgvE04C2wqSDcFHC2gD4CbAdse0CPAfwACnAvYSqA94FuAPgUJhVsR6AFoFLD7A5oEmgN2L0DnAW4DbqbAS/4V0OSf+o4Cjoc1J4G1QBbYDJz11LN06OmQsOmgJwx0ARtBaCLhWeAG0OyxWxFR4FTATgJPPS0DWEPYLqCjhL7s9T3h9a0A1gdscQnUAjR7/VqAOwE76rVXAXsKaAU4g4JXuVzA24DtLkIvj5JZ0ObtXFAMWa8BaxewPQFdEtBFBbSdJcB6zzYEtKSAzQHdbKATOOM11EWJ8wGtB24E7FBa/iqF+c3ruy9gK4B/AjQHbFNBn+PAnYLamoAeCehOD+VGwHYE9BqKIaIHgUcBDYcwNSDoAG57/Y4HbCLhMxQGy5vAi4gC0B3QZgKeAW56bc0F+gRoKIwCw9RKOkD4COcL0sZJaS3oLj3GZ3E6b/j3dHqZ7WLhM4F5gG8F7G4ULgC3A3YrYFuBh0u1r/DJpwO6JaBHgcsF+TqA64hCRYpx4ELA+gBu5WvOxyKgJ2DrUWgI6EXgbqBPQ8GRn/T5lyfAI89+EbC7sHgrRJ5/C/4CepULv/8AAAAASUVORK5CYII=`;

export function WildWillyDialog({ open, onClose }: WildWillyDialogProps) {
  const { state, dispatch } = useGame();

  if (!state.wildWillyEvent) return null;

  const isStreetRobbery = state.wildWillyEvent.type === 'street';
  const isApartmentRobbery = state.wildWillyEvent.type === 'apartment';

  const handleClose = () => {
    dispatch({ type: 'CLEAR_WILD_WILLY_EVENT' });
    onClose();
  };

  // Get item names for apartment robbery
  const stolenItemNames = state.wildWillyEvent.itemsStolen?.map(itemId => {
    const appliance = APPLIANCES.find(a => a.id === itemId);
    return appliance?.name || itemId;
  }) || [];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border pixel-border max-w-md overflow-hidden">
        <DialogHeader>
          <DialogTitle className="font-pixel text-sm text-destructive flex items-center gap-2">
            <span className="text-2xl">🔫</span>
            ROBBERY!
          </DialogTitle>
          <DialogDescription className="sr-only">
            Wild Willy robbery event
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Wild Willy Animation */}
            <div className="relative h-32 bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg overflow-hidden">
              {/* Street background for street robbery */}
              {isStreetRobbery && (
                <div className="absolute inset-0 flex items-end justify-center">
                  <div className="w-full h-8 bg-slate-700" /> {/* Road */}
                </div>
              )}

              {/* Apartment background for apartment robbery */}
              {isApartmentRobbery && (
                <div className="absolute inset-0">
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-amber-900/50" /> {/* Floor */}
                  <div className="absolute top-4 left-4 w-12 h-16 bg-slate-600 border-2 border-slate-500" /> {/* Window */}
                </div>
              )}

              {/* Wild Willy sprite with animation */}
              <motion.div
                initial={{ x: 200, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                  delay: 0.2
                }}
                className="absolute bottom-4 right-8"
              >
                <motion.img
                  src={WILD_WILLY_SPRITE}
                  alt="Wild Willy"
                  className="w-16 h-16 pixelated"
                  style={{ imageRendering: 'pixelated' }}
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    repeat: 2,
                    duration: 0.3,
                    delay: 0.8
                  }}
                />
              </motion.div>

              {/* Gun flash effect */}
              {isStreetRobbery && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0] }}
                  transition={{ delay: 1.2, duration: 0.3 }}
                  className="absolute bottom-8 right-20 w-8 h-8 bg-yellow-400 rounded-full blur-sm"
                />
              )}

              {/* "BANG!" text for street robbery */}
              {isStreetRobbery && (
                <motion.div
                  initial={{ opacity: 0, scale: 0, rotate: -15 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 1.3, type: "spring" }}
                  className="absolute top-4 right-4 font-pixel text-xl text-yellow-400"
                  style={{ textShadow: '2px 2px 0 #000' }}
                >
                  STICK 'EM UP!
                </motion.div>
              )}

              {/* Stolen items flying out for apartment robbery */}
              {isApartmentRobbery && stolenItemNames.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="absolute top-4 left-1/2 -translate-x-1/2 font-pixel text-xs text-red-400"
                >
                  💨 STOLEN!
                </motion.div>
              )}
            </div>

            {/* Newspaper headline */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="bg-amber-50 border-2 border-amber-800 p-4 rounded"
            >
              <div className="text-center">
                <h3 className="font-pixel text-xs text-amber-900 mb-2">📰 DAILY NEWS</h3>
                <div className="h-px bg-amber-800 mb-2" />

                {isStreetRobbery && (
                  <>
                    <p className="font-pixel text-sm text-amber-900 mb-2">
                      WILD WILLY STRIKES AGAIN!
                    </p>
                    <p className="game-text text-amber-800">
                      Local citizen robbed at gunpoint outside the {
                        state.players[state.currentPlayerIndex]?.currentLocation === 'bank'
                          ? 'Bank'
                          : "Black's Market"
                      }.
                      All cash stolen - ${state.wildWillyEvent.amountStolen}!
                    </p>
                  </>
                )}

                {isApartmentRobbery && (
                  <>
                    <p className="font-pixel text-sm text-amber-900 mb-2">
                      BURGLARY AT LOW-COST HOUSING!
                    </p>
                    <p className="game-text text-amber-800">
                      Wild Willy broke into an apartment and stole: {stolenItemNames.join(', ')}.
                    </p>
                  </>
                )}

                <div className="h-px bg-amber-800 my-2" />
                <p className="text-xs text-amber-700">
                  Happiness: -{state.wildWillyEvent.happinessLoss}
                </p>
              </div>
            </motion.div>

            <Button
              className="pixel-button w-full bg-red-600 hover:bg-red-700"
              onClick={handleClose}
            >
              CONTINUE
            </Button>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
