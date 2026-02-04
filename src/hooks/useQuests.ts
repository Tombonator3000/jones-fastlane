import { useState, useCallback } from 'react';
import { Quest, QuestRank, GuildRank } from '../types/game';

const QUEST_TEMPLATES: Quest[] = [
  // E-Rank (Novice)
  {
    id: 'rats_cellar',
    name: 'Rats in the Cellar',
    description: 'Clear out the tavern basement.',
    rank: 'E',
    timeCost: 10,
    goldReward: 15,
    riskLevel: 0.1,
  },
  {
    id: 'herb_gathering',
    name: 'Herb Gathering',
    description: 'Collect herbs from the forest edge.',
    rank: 'E',
    timeCost: 8,
    goldReward: 12,
    riskLevel: 0.05,
  },
  {
    id: 'lost_cat',
    name: 'Lost Cat',
    description: 'Find the missing cat for a worried merchant.',
    rank: 'E',
    timeCost: 6,
    goldReward: 10,
    riskLevel: 0.02,
  },
  // D-Rank
  {
    id: 'delivery_urgent',
    name: 'Urgent Delivery',
    description: 'Deliver a package across town quickly.',
    rank: 'D',
    timeCost: 12,
    goldReward: 25,
    riskLevel: 0.15,
  },
  {
    id: 'guard_duty',
    name: 'Guard Duty',
    description: 'Stand watch at the merchant district.',
    rank: 'D',
    timeCost: 14,
    goldReward: 30,
    riskLevel: 0.1,
  },
  // C-Rank (Journeyman)
  {
    id: 'escort_merchant',
    name: 'Escort Merchant',
    description: 'Protect a merchant on the road.',
    rank: 'C',
    timeCost: 20,
    goldReward: 60,
    riskLevel: 0.3,
    requirements: { guildRank: 'journeyman' },
  },
  {
    id: 'investigate_ruins',
    name: 'Investigate Ruins',
    description: 'Explore the old ruins outside town.',
    rank: 'C',
    timeCost: 18,
    goldReward: 50,
    riskLevel: 0.25,
    requirements: { guildRank: 'journeyman' },
  },
  // B-Rank
  {
    id: 'bandit_camp',
    name: 'Clear Bandit Camp',
    description: 'Eliminate a bandit threat.',
    rank: 'B',
    timeCost: 30,
    goldReward: 120,
    riskLevel: 0.4,
    requirements: { guildRank: 'adept' },
  },
  {
    id: 'monster_hunt',
    name: 'Monster Hunt',
    description: 'Hunt down a dangerous beast.',
    rank: 'B',
    timeCost: 28,
    goldReward: 100,
    riskLevel: 0.35,
    requirements: { guildRank: 'adept' },
  },
  // A-Rank
  {
    id: 'goblin_fortress',
    name: 'Goblin Fortress',
    description: 'Assault a goblin stronghold.',
    rank: 'A',
    timeCost: 40,
    goldReward: 300,
    riskLevel: 0.5,
    requirements: { guildRank: 'veteran' },
  },
  {
    id: 'dragon_sighting',
    name: 'Dragon Sighting',
    description: 'Investigate reports of a dragon.',
    rank: 'A',
    timeCost: 35,
    goldReward: 250,
    riskLevel: 0.45,
    requirements: { guildRank: 'veteran' },
  },
  // S-Rank
  {
    id: 'deep_dungeon',
    name: 'The Deep Dungeon',
    description: 'Face the legendary dungeon.',
    rank: 'S',
    timeCost: 50,
    goldReward: 1000,
    riskLevel: 0.6,
    requirements: { guildRank: 'elite' },
  },
  {
    id: 'demon_lord',
    name: 'Demon Lord',
    description: 'Confront the ancient evil.',
    rank: 'S',
    timeCost: 60,
    goldReward: 1500,
    riskLevel: 0.7,
    requirements: { guildRank: 'elite' },
  },
];

function getRankAccess(rank: GuildRank): QuestRank[] {
  const access: Record<GuildRank, QuestRank[]> = {
    novice: ['E'],
    apprentice: ['E', 'D'],
    journeyman: ['E', 'D', 'C'],
    adept: ['E', 'D', 'C', 'B'],
    veteran: ['E', 'D', 'C', 'B', 'A'],
    elite: ['E', 'D', 'C', 'B', 'A', 'S'],
    guildmaster: ['E', 'D', 'C', 'B', 'A', 'S'],
  };
  return access[rank];
}

// Guild rank progression thresholds (completed quests required)
export const GUILD_RANK_THRESHOLDS: Record<GuildRank, number> = {
  novice: 0,
  apprentice: 3,
  journeyman: 8,
  adept: 15,
  veteran: 25,
  elite: 40,
  guildmaster: 60,
};

export function getNextGuildRank(currentRank: GuildRank): GuildRank | null {
  const ranks: GuildRank[] = ['novice', 'apprentice', 'journeyman', 'adept', 'veteran', 'elite', 'guildmaster'];
  const currentIndex = ranks.indexOf(currentRank);
  if (currentIndex === ranks.length - 1) return null;
  return ranks[currentIndex + 1];
}

export function canRankUp(completedQuests: number, currentRank: GuildRank): boolean {
  const nextRank = getNextGuildRank(currentRank);
  if (!nextRank) return false;
  return completedQuests >= GUILD_RANK_THRESHOLDS[nextRank];
}

export function useQuests() {
  const [availableQuests, setAvailableQuests] = useState<Quest[]>([]);

  const refreshQuests = useCallback((guildRank: GuildRank) => {
    // Generate available quests based on rank
    const rankAccess = getRankAccess(guildRank);
    const quests = QUEST_TEMPLATES.filter(q => {
      // Check if quest rank is accessible
      if (!rankAccess.includes(q.rank)) return false;

      // Check guild rank requirement
      if (q.requirements?.guildRank) {
        const rankOrder: GuildRank[] = ['novice', 'apprentice', 'journeyman', 'adept', 'veteran', 'elite', 'guildmaster'];
        const playerRankIndex = rankOrder.indexOf(guildRank);
        const requiredRankIndex = rankOrder.indexOf(q.requirements.guildRank);
        if (playerRankIndex < requiredRankIndex) return false;
      }

      return true;
    });

    // Randomize selection and pick up to 5 quests
    const shuffled = quests.sort(() => Math.random() - 0.5);
    setAvailableQuests(shuffled.slice(0, 5));
  }, []);

  const attemptQuest = useCallback((quest: Quest): { success: boolean; damage: number; goldEarned: number } => {
    const success = Math.random() > quest.riskLevel;
    const damage = success ? 0 : Math.floor(Math.random() * 20) + 5;
    const goldEarned = success ? quest.goldReward : Math.floor(quest.goldReward * 0.25); // Partial reward on failure
    return { success, damage, goldEarned };
  }, []);

  return {
    availableQuests,
    refreshQuests,
    attemptQuest,
    QUEST_TEMPLATES,
    getRankAccess,
    canRankUp,
    getNextGuildRank,
    GUILD_RANK_THRESHOLDS,
  };
}
