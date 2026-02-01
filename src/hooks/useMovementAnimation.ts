import { useState, useCallback, useRef, useEffect } from 'react';
import { Waypoint, calculatePath, getHomeLocation, calculateAnimationDuration } from '@/data/roadPaths';
import { Player } from '@/types/game';

export interface MovementAnimation {
  playerId: string;
  avatar: string;
  path: Waypoint[];
  targetLocationId: string;
  isAutoGoHome: boolean;
}

interface UseMovementAnimationReturn {
  currentAnimation: MovementAnimation | null;
  isAnimating: boolean;
  startMovement: (
    player: Player,
    fromLocationId: string,
    toLocationId: string,
    onComplete: () => void,
    isAutoGoHome?: boolean
  ) => void;
  completeAnimation: () => void;
  queueAutoGoHome: (player: Player, onComplete: () => void) => void;
}

export function useMovementAnimation(): UseMovementAnimationReturn {
  const [currentAnimation, setCurrentAnimation] = useState<MovementAnimation | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const onCompleteCallback = useRef<(() => void) | null>(null);

  const startMovement = useCallback((
    player: Player,
    fromLocationId: string,
    toLocationId: string,
    onComplete: () => void,
    isAutoGoHome: boolean = false
  ) => {
    // Don't start a new animation if one is already in progress
    if (isAnimating) {
      return;
    }

    // Calculate the path
    const path = calculatePath(fromLocationId, toLocationId);

    if (path.length === 0) {
      // No path needed, just call complete
      onComplete();
      return;
    }

    // Store the callback
    onCompleteCallback.current = onComplete;

    // Start the animation
    setCurrentAnimation({
      playerId: player.id,
      avatar: player.avatar,
      path,
      targetLocationId: toLocationId,
      isAutoGoHome,
    });
    setIsAnimating(true);
  }, [isAnimating]);

  const completeAnimation = useCallback(() => {
    const callback = onCompleteCallback.current;

    // Clear the animation state
    setCurrentAnimation(null);
    setIsAnimating(false);
    onCompleteCallback.current = null;

    // Call the completion callback
    if (callback) {
      callback();
    }
  }, []);

  const queueAutoGoHome = useCallback((
    player: Player,
    onComplete: () => void
  ) => {
    const homeLocation = getHomeLocation(player.apartment);

    if (player.currentLocation === homeLocation) {
      // Already at home, just complete
      onComplete();
      return;
    }

    startMovement(player, player.currentLocation, homeLocation, onComplete, true);
  }, [startMovement]);

  return {
    currentAnimation,
    isAnimating,
    startMovement,
    completeAnimation,
    queueAutoGoHome,
  };
}
