import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';

interface GameOverDialogProps {
  open: boolean;
  onRestart: () => void;
}

export function GameOverDialog({ open, onRestart }: GameOverDialogProps) {
  const { state } = useGame();

  if (!state.winner) return null;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="bg-card border-border pixel-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-pixel text-xl text-primary text-center">
            🏆 WINNER! 🏆
          </DialogTitle>
          <DialogDescription className="sr-only">
            Game over - winner announcement
          </DialogDescription>
        </DialogHeader>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6 text-center"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-6xl"
          >
            {state.winner.avatar}
          </motion.div>
          
          <div>
            <h3 className="font-pixel text-2xl text-accent">
              {state.winner.name}
            </h3>
            <p className="game-text text-muted-foreground mt-2">
              has won the game in {state.week} weeks!
            </p>
          </div>

          <div className="bg-muted rounded-lg p-4 text-left space-y-2">
            <div className="flex justify-between">
              <span className="game-text">💰 Wealth:</span>
              <span className="text-wealth">${state.winner.money + state.winner.bankBalance}</span>
            </div>
            <div className="flex justify-between">
              <span className="game-text">😊 Happiness:</span>
              <span className="text-happiness">{state.winner.happiness}</span>
            </div>
            <div className="flex justify-between">
              <span className="game-text">📚 Education:</span>
              <span className="text-education">{state.winner.education}</span>
            </div>
            <div className="flex justify-between">
              <span className="game-text">📈 Career:</span>
              <span className="text-career">{state.winner.career}</span>
            </div>
          </div>
          
          <Button
            className="pixel-button w-full bg-accent hover:bg-accent/90"
            onClick={onRestart}
          >
            PLAY AGAIN
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
