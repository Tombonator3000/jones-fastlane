import { motion } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';

export function PlayerStats() {
  const { state, getCurrentPlayer } = useGame();
  const player = getCurrentPlayer();

  if (!player) return null;

  const stats = [
    { 
      label: 'Wealth', 
      value: player.money + player.bankBalance, 
      goal: state.goals.wealth, 
      color: 'bg-wealth',
      icon: '💰'
    },
    { 
      label: 'Happiness', 
      value: player.happiness, 
      goal: state.goals.happiness, 
      color: 'bg-happiness',
      icon: '😊'
    },
    { 
      label: 'Education', 
      value: player.education, 
      goal: state.goals.education, 
      color: 'bg-education',
      icon: '📚'
    },
    { 
      label: 'Career', 
      value: player.career, 
      goal: state.goals.career, 
      color: 'bg-career',
      icon: '📈'
    },
  ];

  return (
    <div className="bg-card pixel-border rounded-lg p-4 space-y-4">
      {/* Player info header */}
      <div className="flex items-center gap-3 border-b border-border pb-3">
        <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-2xl">
          {player.avatar}
        </div>
        <div>
          <h3 className="font-pixel text-sm text-primary">{player.name}</h3>
          <p className="game-text text-muted-foreground text-sm">
            {player.job?.title || 'Unemployed'}
          </p>
        </div>
      </div>

      {/* Time remaining */}
      <div className="flex items-center justify-between">
        <span className="game-text text-muted-foreground">⏰ Time Left:</span>
        <span className="font-pixel text-sm text-primary">{player.hoursRemaining}h</span>
      </div>

      {/* Money */}
      <div className="flex items-center justify-between">
        <span className="game-text text-muted-foreground">💵 Cash:</span>
        <span className="font-pixel text-sm text-wealth">${player.money}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="game-text text-muted-foreground">🏦 Bank:</span>
        <span className="font-pixel text-sm text-wealth">${player.bankBalance}</span>
      </div>

      {/* Stats bars */}
      <div className="space-y-3 pt-2 border-t border-border">
        {stats.map((stat) => (
          <div key={stat.label} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="game-text text-sm">
                {stat.icon} {stat.label}
              </span>
              <span className="font-pixel text-[10px] text-muted-foreground">
                {stat.value}/{stat.goal}
              </span>
            </div>
            <div className="stat-bar">
              <motion.div
                className={`stat-bar-fill ${stat.color}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (stat.value / stat.goal) * 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Status indicators */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border text-sm">
        <div className="flex items-center gap-2">
          <span>🍔</span>
          <span className="game-text text-muted-foreground">Food: {player.food}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>👔</span>
          <span className="game-text text-muted-foreground">
            C:{player.clothes.casual} D:{player.clothes.dress} B:{player.clothes.business}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>🏠</span>
          <span className="game-text text-muted-foreground capitalize">
            {player.apartment === 'low-cost' ? 'Low-Cost' : 'Security'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>🎓</span>
          <span className="game-text text-muted-foreground">{player.degrees.length} degrees</span>
        </div>
      </div>
    </div>
  );
}
