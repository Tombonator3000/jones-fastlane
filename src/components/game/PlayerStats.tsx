import { motion } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';

export function PlayerStats() {
  const { state, getCurrentPlayer } = useGame();
  const player = getCurrentPlayer();

  if (!player) return null;

  const stats = [
    { 
      label: 'W', 
      fullLabel: 'Wealth',
      value: player.money + player.bankBalance, 
      goal: state.goals.wealth, 
      color: '#ffd700',
      icon: '💰'
    },
    { 
      label: 'H', 
      fullLabel: 'Happiness',
      value: player.happiness, 
      goal: state.goals.happiness, 
      color: '#ff69b4',
      icon: '😊'
    },
    { 
      label: 'E', 
      fullLabel: 'Education',
      value: player.education, 
      goal: state.goals.education, 
      color: '#4169e1',
      icon: '📚'
    },
    { 
      label: 'C', 
      fullLabel: 'Career',
      value: player.career, 
      goal: state.goals.career, 
      color: '#32cd32',
      icon: '📈'
    },
  ];

  const totalGoalPoints = state.goals.wealth + state.goals.happiness + state.goals.education + state.goals.career;
  const currentPoints = Math.min(state.goals.wealth, player.money + player.bankBalance) 
    + Math.min(state.goals.happiness, player.happiness) 
    + Math.min(state.goals.education, player.education) 
    + Math.min(state.goals.career, player.career);
  const progressPercent = Math.round((currentPoints / totalGoalPoints) * 100);

  return (
    <div className="retro-stats-panel">
      {/* Header */}
      <div className="retro-stats-header">
        <div className="flex items-center gap-2">
          <span className="text-xl">{player.avatar}</span>
          <span className="font-pixel text-[10px] text-[#f8f4e8] uppercase">{player.name}</span>
        </div>
        <div className="text-[#f8f4e8] font-pixel text-[9px]">
          Goal: {progressPercent}%
        </div>
      </div>

      {/* Vertical bars like original game */}
      <div className="retro-stats-bars">
        {stats.map((stat) => {
          const percent = Math.min(100, (stat.value / stat.goal) * 100);
          return (
            <div key={stat.label} className="retro-stat-column">
              <div className="retro-stat-bar-container">
                <motion.div
                  className="retro-stat-bar-fill"
                  style={{ backgroundColor: stat.color }}
                  initial={{ height: 0 }}
                  animate={{ height: `${percent}%` }}
                  transition={{ duration: 0.5 }}
                />
                {/* Goal markers */}
                <div className="retro-stat-goal-line" style={{ bottom: '100%' }} />
              </div>
              <div className="retro-stat-icon" style={{ color: stat.color }}>
                {stat.icon}
              </div>
              <div className="retro-stat-label">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Info section */}
      <div className="retro-stats-info">
        <div className="retro-info-row">
          <span>⏰ Time</span>
          <span className="retro-info-value">{player.hoursRemaining}h</span>
        </div>
        <div className="retro-info-row">
          <span>💵 Cash</span>
          <span className="retro-info-value">${player.money}</span>
        </div>
        <div className="retro-info-row">
          <span>🏦 Bank</span>
          <span className="retro-info-value">${player.bankBalance}</span>
        </div>
        <div className="retro-info-row">
          <span>👔 Clothes</span>
          <span className="retro-info-value text-[10px]">
            C:{player.clothes.casual} D:{player.clothes.dress} B:{player.clothes.business}
          </span>
        </div>
        <div className="retro-info-row">
          <span>🏠</span>
          <span className="retro-info-value text-[10px]">
            {player.apartment === 'low-cost' ? 'Low-Cost' : 'Security'}
          </span>
        </div>
        {player.job && (
          <div className="retro-info-row">
            <span>💼</span>
            <span className="retro-info-value text-[9px]">{player.job.title}</span>
          </div>
        )}
      </div>
    </div>
  );
}
