import { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import { Quest, QuestRank, GuildRank, Player } from '@/types/game';
import { useQuests, GUILD_RANK_THRESHOLDS, canRankUp, getNextGuildRank } from '@/hooks/useQuests';
import { toast } from 'sonner';

interface QuestBoardProps {
  player: Player;
  onClose?: () => void;
}

const RANK_COLORS: Record<QuestRank, string> = {
  'E': 'bg-gray-500',
  'D': 'bg-green-600',
  'C': 'bg-blue-600',
  'B': 'bg-purple-600',
  'A': 'bg-orange-500',
  'S': 'bg-red-600',
};

const RANK_LABELS: Record<GuildRank, string> = {
  novice: 'Novice',
  apprentice: 'Apprentice',
  journeyman: 'Journeyman',
  adept: 'Adept',
  veteran: 'Veteran',
  elite: 'Elite',
  guildmaster: 'Guildmaster',
};

export function QuestBoard({ player }: QuestBoardProps) {
  const { dispatch } = useGame();
  const { availableQuests, refreshQuests, attemptQuest } = useQuests();
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);

  // Refresh quests when component mounts or guild rank changes
  useEffect(() => {
    refreshQuests(player.guildRank);
  }, [player.guildRank, refreshQuests]);

  const handleAcceptQuest = (quest: Quest) => {
    if (player.hoursRemaining < quest.timeCost) {
      toast.error(`Not enough time! Need ${quest.timeCost} hours.`);
      return;
    }

    // Check guild rank requirement
    if (quest.requirements?.guildRank) {
      const rankOrder: GuildRank[] = ['novice', 'apprentice', 'journeyman', 'adept', 'veteran', 'elite', 'guildmaster'];
      const playerRankIndex = rankOrder.indexOf(player.guildRank);
      const requiredRankIndex = rankOrder.indexOf(quest.requirements.guildRank);
      if (playerRankIndex < requiredRankIndex) {
        toast.error(`Rank too low! Need ${RANK_LABELS[quest.requirements.guildRank]} rank.`);
        return;
      }
    }

    setSelectedQuest(quest);
  };

  const handleAttemptQuest = () => {
    if (!selectedQuest) return;

    const result = attemptQuest(selectedQuest);

    dispatch({
      type: 'COMPLETE_QUEST',
      questId: selectedQuest.id,
      success: result.success,
      goldEarned: result.goldEarned,
      damage: result.damage,
      timeCost: selectedQuest.timeCost,
    });

    if (result.success) {
      toast.success(`Quest completed! Earned ${result.goldEarned} gold!`);
    } else {
      toast.error(`Quest failed! Took ${result.damage} damage. Earned ${result.goldEarned} gold.`);
    }

    setSelectedQuest(null);
    refreshQuests(player.guildRank);
  };

  const completedCount = player.completedQuests.length;
  const nextRank = getNextGuildRank(player.guildRank);
  const nextRankThreshold = nextRank ? GUILD_RANK_THRESHOLDS[nextRank] : null;
  const canPromote = canRankUp(completedCount, player.guildRank);

  const handleRankUp = () => {
    if (!canPromote) return;
    dispatch({ type: 'RANK_UP' });
    toast.success(`Promoted to ${RANK_LABELS[nextRank!]}!`);
  };

  return (
    <div className="space-y-3">
      {/* Guild Rank Display */}
      <div className="bg-[#2a2a4a] p-2 rounded border border-[#4a4a6a]">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-[#b8a878] text-xs">Guild Rank:</span>
            <span className="text-[#f0e6d0] text-sm font-bold ml-2">
              {RANK_LABELS[player.guildRank]}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[#8a8a9a] text-xs">
              Quests: {completedCount}
              {nextRankThreshold && ` / ${nextRankThreshold}`}
            </span>
          </div>
        </div>
        {canPromote && (
          <Button
            size="sm"
            className="w-full mt-2 bg-[#4a8a4a] hover:bg-[#5a9a5a] text-white text-xs"
            onClick={handleRankUp}
          >
            Rank Up to {RANK_LABELS[nextRank!]}!
          </Button>
        )}
      </div>

      {/* Quest Selection Modal */}
      {selectedQuest ? (
        <div className="bg-[#3a3a5a] p-3 rounded border-2 border-[#6a6a8a]">
          <div className="flex items-center gap-2 mb-2">
            <span className={`${RANK_COLORS[selectedQuest.rank]} text-white text-xs px-2 py-1 rounded`}>
              {selectedQuest.rank}
            </span>
            <span className="text-[#f0e6d0] font-bold">{selectedQuest.name}</span>
          </div>
          <p className="text-[#b8a878] text-sm mb-3">{selectedQuest.description}</p>
          <div className="grid grid-cols-3 gap-2 text-xs mb-3">
            <div className="text-center">
              <div className="text-[#8a8a9a]">Time</div>
              <div className="text-[#f0e6d0]">{selectedQuest.timeCost}h</div>
            </div>
            <div className="text-center">
              <div className="text-[#8a8a9a]">Reward</div>
              <div className="text-[#d4af37]">{selectedQuest.goldReward}g</div>
            </div>
            <div className="text-center">
              <div className="text-[#8a8a9a]">Risk</div>
              <div className="text-[#c44]">{Math.round(selectedQuest.riskLevel * 100)}%</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 bg-[#4a6a8a] hover:bg-[#5a7a9a] text-white text-xs"
              onClick={() => setSelectedQuest(null)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-[#8a4a4a] hover:bg-[#9a5a5a] text-white text-xs"
              onClick={handleAttemptQuest}
              disabled={player.hoursRemaining < selectedQuest.timeCost}
            >
              Attempt Quest
            </Button>
          </div>
        </div>
      ) : (
        /* Quest Board */
        <div className="location-menu-section">
          <h4 className="location-menu-section-title">QUEST BOARD</h4>
          <ScrollArea className="h-40">
            <div className="space-y-1 pr-2">
              {availableQuests.length === 0 ? (
                <p className="text-[#8a8a9a] text-sm text-center py-4">
                  No quests available. Check back later!
                </p>
              ) : (
                availableQuests.map(quest => {
                  const isCompleted = player.completedQuests.includes(quest.id);
                  const canAttempt = player.hoursRemaining >= quest.timeCost;
                  return (
                    <button
                      key={quest.id}
                      className={`location-menu-item ${isCompleted ? 'opacity-50' : ''}`}
                      onClick={() => handleAcceptQuest(quest)}
                      disabled={isCompleted}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <span className={`${RANK_COLORS[quest.rank]} text-white text-[10px] px-1.5 py-0.5 rounded`}>
                          {quest.rank}
                        </span>
                        <div className="flex-1 text-left">
                          <div className="text-sm">{quest.name}</div>
                          <div className="text-[10px] text-[#6a6a7a]">
                            {quest.timeCost}h | {quest.goldReward}g | Risk: {Math.round(quest.riskLevel * 100)}%
                          </div>
                        </div>
                        {!canAttempt && !isCompleted && (
                          <span className="text-[#c44] text-[10px]">No time</span>
                        )}
                        {isCompleted && <span className="text-[#4a8a4a]">Done</span>}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
