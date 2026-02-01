import { motion } from 'framer-motion';
import { Waypoint, calculateAnimationDuration } from '@/data/roadPaths';

interface PlayerTokenProps {
  playerId: string;
  avatar: string;
  path: Waypoint[];
  isAnimating: boolean;
  onAnimationComplete: () => void;
  isCurrentPlayer: boolean;
}

export function PlayerToken({
  avatar,
  path,
  isAnimating,
  onAnimationComplete,
  isCurrentPlayer,
}: PlayerTokenProps) {
  if (!isAnimating || path.length === 0) {
    return null;
  }

  const duration = calculateAnimationDuration(path);

  // Convert waypoints to animation keyframes
  const xKeyframes = path.map(p => `${p.x}%`);
  const yKeyframes = path.map(p => `${p.y}%`);

  return (
    <motion.div
      className="absolute z-30 pointer-events-none"
      style={{
        left: 0,
        top: 0,
        transform: 'translate(-50%, -50%)',
      }}
      initial={{
        left: xKeyframes[0],
        top: yKeyframes[0],
      }}
      animate={{
        left: xKeyframes,
        top: yKeyframes,
      }}
      transition={{
        duration: duration,
        ease: 'linear',
        times: path.map((_, i) => i / (path.length - 1)),
      }}
      onAnimationComplete={onAnimationComplete}
    >
      <motion.div
        className={`
          w-10 h-10 rounded-full flex items-center justify-center text-xl
          shadow-lg border-3
          ${isCurrentPlayer
            ? 'bg-primary border-foreground shadow-primary/50'
            : 'bg-secondary border-foreground shadow-secondary/50'}
        `}
        animate={{
          scale: [1, 1.1, 1],
          y: [0, -3, 0],
        }}
        transition={{
          duration: 0.4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {avatar}
      </motion.div>
    </motion.div>
  );
}
