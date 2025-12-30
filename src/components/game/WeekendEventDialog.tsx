import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';

interface WeekendEventDialogProps {
  open: boolean;
  onClose: () => void;
}

export function WeekendEventDialog({ open, onClose }: WeekendEventDialogProps) {
  const { state } = useGame();

  if (!state.weekendEvent) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border pixel-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-pixel text-sm text-primary flex items-center gap-2">
            <span className="text-2xl">🎉</span>
            OH WHAT A WEEKEND!
          </DialogTitle>
          <DialogDescription className="sr-only">
            Weekend event description
          </DialogDescription>
        </DialogHeader>
        
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <p className="game-text text-lg text-foreground">
              {state.weekendEvent}
            </p>
            
            <Button
              className="pixel-button w-full"
              onClick={onClose}
            >
              CONTINUE
            </Button>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
