import { motion } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';

interface TopBarProps {
  onPlayerClick: () => void;
}

export function TopBar({ onPlayerClick }: TopBarProps) {
  const { state, getCurrentPlayer } = useGame();
  const player = getCurrentPlayer();

  if (!player) return null;

  const totalGoalPoints = state.goals.wealth + state.goals.happiness + state.goals.education + state.goals.career;
  const currentPoints = Math.min(state.goals.wealth, player.money + player.bankBalance)
    + Math.min(state.goals.happiness, player.happiness)
    + Math.min(state.goals.education, player.education)
    + Math.min(state.goals.career, player.career);
  const progressPercent = Math.round((currentPoints / totalGoalPoints) * 100);

  return (
    <motion.div
      className="top-bar"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Left: Game title and week */}
      <div className="top-bar-section">
        <span className="top-bar-title">GUILD LIFE</span>
        <span className="top-bar-divider">|</span>
        <span className="top-bar-week">Week {state.week}</span>
      </div>

      {/* Right: Player stats */}
      <div className="top-bar-stats">
        <div className="top-bar-stat">
          <span className="top-bar-stat-icon">⏰</span>
          <span className="top-bar-stat-label">TIME</span>
          <span className="top-bar-stat-value">{player.hoursRemaining}</span>
        </div>

        <div className="top-bar-stat">
          <span className="top-bar-stat-icon">💰</span>
          <span className="top-bar-stat-label">GOLD</span>
          <span className="top-bar-stat-value">{player.money}</span>
        </div>

        <div className="top-bar-stat">
          <span className="top-bar-stat-icon">❤️</span>
          <span className="top-bar-stat-label">HEALTH</span>
          <span className="top-bar-stat-value">{player.food > 0 || player.hasFastFood ? '100/100' : '0/100'}</span>
        </div>

        <div className="top-bar-stat">
          <span className="top-bar-stat-icon">😊</span>
          <span className="top-bar-stat-label">JOY</span>
          <span className="top-bar-stat-value">{progressPercent}%</span>
        </div>

        {/* Player name - clickable */}
        <motion.button
          className="top-bar-player"
          onClick={onPlayerClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="top-bar-player-avatar">{player.avatar}</span>
          <span className="top-bar-player-name">{player.name}</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
