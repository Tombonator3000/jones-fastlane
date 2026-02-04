import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import { DEGREES, APPLIANCES, JOBS, LOCATIONS } from '@/types/game';

interface CharacterSheetProps {
  open: boolean;
  onClose: () => void;
}

export function CharacterSheet({ open, onClose }: CharacterSheetProps) {
  const { state, getCurrentPlayer } = useGame();
  const player = getCurrentPlayer();

  if (!player) return null;

  // Calculate progress stats
  const totalGoalPoints = state.goals.wealth + state.goals.happiness + state.goals.education + state.goals.career;
  const currentPoints = Math.min(state.goals.wealth, player.money + player.bankBalance)
    + Math.min(state.goals.happiness, player.happiness)
    + Math.min(state.goals.education, player.education)
    + Math.min(state.goals.career, player.career);
  const progressPercent = Math.round((currentPoints / totalGoalPoints) * 100);

  // Get degree names
  const completedDegrees = player.degrees.map(degreeId => {
    const degree = DEGREES.find(d => d.id === degreeId);
    return degree?.name || degreeId;
  });

  // Get enrolled courses
  const enrolledCourses = player.enrolledCourses.map(degreeId => {
    const degree = DEGREES.find(d => d.id === degreeId);
    const progress = player.studyProgress[degreeId] || 0;
    const required = degree?.lessonsRequired || 10;
    return { name: degree?.name || degreeId, progress, required };
  });

  // Get owned items
  const ownedItems = player.items.map(itemId => {
    const item = APPLIANCES.find(a => a.id === itemId);
    return item?.name || itemId;
  });

  // Get current location name
  const currentLocation = LOCATIONS.find(l => l.id === player.currentLocation);

  // Get job info
  const jobLocation = player.job ? LOCATIONS.find(l => l.id === player.job!.location) : null;

  // Guild rank display
  const guildRankDisplay = {
    'novice': 'Novice',
    'apprentice': 'Apprentice',
    'journeyman': 'Journeyman',
    'adept': 'Adept',
    'veteran': 'Veteran',
    'elite': 'Elite',
    'guildmaster': 'Guildmaster'
  }[player.guildRank] || player.guildRank;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="character-sheet-dialog">
        <DialogHeader>
          <DialogTitle className="character-sheet-header">
            <span className="character-sheet-avatar">{player.avatar}</span>
            <span className="character-sheet-name">{player.name}</span>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Character sheet showing player stats, items, and progress
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="character-sheet-content"
        >
          {/* Main Stats */}
          <div className="character-sheet-section">
            <h3 className="character-sheet-section-title">STATS</h3>
            <div className="character-sheet-stats-grid">
              <div className="character-sheet-stat">
                <span className="stat-icon">💰</span>
                <span className="stat-label">Wealth</span>
                <span className="stat-value gold">${player.money + player.bankBalance}</span>
                <span className="stat-goal">/ ${state.goals.wealth}</span>
              </div>
              <div className="character-sheet-stat">
                <span className="stat-icon">😊</span>
                <span className="stat-label">Happiness</span>
                <span className="stat-value pink">{player.happiness}</span>
                <span className="stat-goal">/ {state.goals.happiness}</span>
              </div>
              <div className="character-sheet-stat">
                <span className="stat-icon">📚</span>
                <span className="stat-label">Education</span>
                <span className="stat-value blue">{player.education}</span>
                <span className="stat-goal">/ {state.goals.education}</span>
              </div>
              <div className="character-sheet-stat">
                <span className="stat-icon">📈</span>
                <span className="stat-label">Career</span>
                <span className="stat-value green">{player.career}</span>
                <span className="stat-goal">/ {state.goals.career}</span>
              </div>
            </div>
            <div className="character-sheet-progress">
              <span>Overall Progress: {progressPercent}%</span>
              <div className="progress-bar">
                <motion.div
                  className="progress-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>

          {/* Resources */}
          <div className="character-sheet-section">
            <h3 className="character-sheet-section-title">RESOURCES</h3>
            <div className="character-sheet-resources">
              <div className="resource-row">
                <span>💵 Cash</span>
                <span>${player.money}</span>
              </div>
              <div className="resource-row">
                <span>🏦 Bank</span>
                <span>${player.bankBalance}</span>
              </div>
              <div className="resource-row">
                <span>⏰ Time Left</span>
                <span>{player.hoursRemaining}h</span>
              </div>
              <div className="resource-row">
                <span>🍖 Food</span>
                <span>{player.food} weeks</span>
              </div>
              <div className="resource-row">
                <span>🎫 Lottery Tickets</span>
                <span>{player.lotteryTickets}</span>
              </div>
            </div>
          </div>

          {/* Clothing */}
          <div className="character-sheet-section">
            <h3 className="character-sheet-section-title">CLOTHING</h3>
            <div className="character-sheet-resources">
              <div className="resource-row">
                <span>👕 Casual</span>
                <span>{player.clothes.casual} weeks</span>
              </div>
              <div className="resource-row">
                <span>👔 Dress</span>
                <span>{player.clothes.dress} weeks</span>
              </div>
              <div className="resource-row">
                <span>🎩 Business</span>
                <span>{player.clothes.business} weeks</span>
              </div>
            </div>
          </div>

          {/* Housing & Job */}
          <div className="character-sheet-section">
            <h3 className="character-sheet-section-title">STATUS</h3>
            <div className="character-sheet-resources">
              <div className="resource-row">
                <span>🏠 Housing</span>
                <span>{player.apartment === 'low-cost' ? 'The Slums' : 'Noble Heights'}</span>
              </div>
              <div className="resource-row">
                <span>📍 Location</span>
                <span>{currentLocation?.name || 'Unknown'}</span>
              </div>
              <div className="resource-row">
                <span>🏅 Guild Rank</span>
                <span>{guildRankDisplay}</span>
              </div>
              {player.job && (
                <>
                  <div className="resource-row">
                    <span>💼 Job</span>
                    <span>{player.job.title}</span>
                  </div>
                  <div className="resource-row">
                    <span>🏢 Workplace</span>
                    <span>{jobLocation?.name || player.job.location}</span>
                  </div>
                  <div className="resource-row">
                    <span>💵 Wage</span>
                    <span>${player.currentWage || player.job.baseWage}/hr</span>
                  </div>
                </>
              )}
              {!player.job && (
                <div className="resource-row">
                  <span>💼 Job</span>
                  <span className="text-muted">Unemployed</span>
                </div>
              )}
            </div>
          </div>

          {/* Education */}
          <div className="character-sheet-section">
            <h3 className="character-sheet-section-title">EDUCATION</h3>
            {completedDegrees.length > 0 ? (
              <div className="character-sheet-list">
                <h4 className="list-subtitle">Completed Degrees:</h4>
                {completedDegrees.map((degree, index) => (
                  <div key={index} className="list-item completed">
                    <span>🎓</span>
                    <span>{degree}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No degrees completed yet</p>
            )}
            {enrolledCourses.length > 0 && (
              <div className="character-sheet-list mt-2">
                <h4 className="list-subtitle">Currently Studying:</h4>
                {enrolledCourses.map((course, index) => (
                  <div key={index} className="list-item in-progress">
                    <span>📖</span>
                    <span>{course.name}</span>
                    <span className="progress-text">({course.progress}/{course.required})</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Items */}
          <div className="character-sheet-section">
            <h3 className="character-sheet-section-title">INVENTORY</h3>
            {ownedItems.length > 0 ? (
              <div className="character-sheet-items">
                {ownedItems.map((item, index) => (
                  <div key={index} className="inventory-item">
                    <span>📦</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No items owned yet</p>
            )}
          </div>

          {/* Stocks */}
          {Object.keys(player.stocks).length > 0 && (
            <div className="character-sheet-section">
              <h3 className="character-sheet-section-title">INVESTMENTS</h3>
              <div className="character-sheet-resources">
                {Object.entries(player.stocks).map(([stockId, shares]) => (
                  <div key={stockId} className="resource-row">
                    <span>📊 {stockId}</span>
                    <span>{shares} shares</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hidden Stats */}
          <div className="character-sheet-section">
            <h3 className="character-sheet-section-title">HIDDEN STATS</h3>
            <div className="character-sheet-resources">
              <div className="resource-row">
                <span>⭐ Experience</span>
                <span>{player.experience}</span>
              </div>
              <div className="resource-row">
                <span>🤝 Dependability</span>
                <span>{player.dependability}</span>
              </div>
              <div className="resource-row">
                <span>🧘 Relaxation</span>
                <span>{player.relaxation}</span>
              </div>
              {player.rentDebt > 0 && (
                <div className="resource-row debt">
                  <span>⚠️ Rent Debt</span>
                  <span>${player.rentDebt}</span>
                </div>
              )}
            </div>
          </div>

          {/* Close Button */}
          <div className="character-sheet-footer">
            <Button
              className="pixel-button w-full bg-secondary hover:bg-secondary/90"
              onClick={onClose}
            >
              CLOSE
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
