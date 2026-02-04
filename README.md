# Guild Life

A fantasy-themed life simulation game set in the world of Guildholm. Originally inspired by the classic Sierra game "Jones in the Fast Lane" (1991), now reimagined with a fantasy twist.

## About the Game

Guild Life is a board-game style life simulation where you compete against Grimwald (AI) to achieve life goals in:

- **Wealth** - Earn gold, save at Guildholm Bank
- **Happiness** - Buy items, enjoy weekends at the tavern
- **Education** - Complete studies at The Academy
- **Career** - Rise through the guild ranks

### Game Mechanics

- **60 hours per week** - Manage your time wisely
- **Rent every 4 weeks** - Do not run out of gold!
- **Shadowfingers** - Beware the notorious thief
- **Economy** - Prices and wages fluctuate

## Technologies

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Shadcn-ui
- Framer Motion

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── game/            # Game components
│   └── ui/              # Shadcn-ui components
├── contexts/
│   └── GameContext.tsx  # Game state
├── hooks/
│   ├── useGrimwaldAI.ts # AI opponent
│   └── useQuests.ts     # Quest system
├── types/
│   └── game.ts          # TypeScript types
└── pages/
    └── Index.tsx        # Main page
```

## Documentation

- [agents.md](./agents.md) - AI documentation
- [todo.md](./todo.md) - Task list
- [log.md](./log.md) - Development log

## Locations

| Location | Type | Description |
|----------|------|-------------|
| The Slums | Lodging | Cheap, but Shadowfingers lurks |
| Noble Heights | Lodging | Safe and expensive |
| Guild Hall | Service | Find work, take quests |
| The Academy | Service | Learn new skills |
| Guildholm Bank | Service | Savings and investments |
| The Rusty Tankard | Tavern | Food, drink, and rumors |
| Shadow Market | Market | Fresh provisions and lottery |
| The Armory | Store | Quality gear |
| General Store | Store | Basic supplies |
| Enchanter's Workshop | Store | Magical items |
| The Forge | Workplace | Hard work, fair pay |
| The Fence | Service | Pawn shop |
| Landlord's Office | Service | Pay rent |

## Guild Ranks

| Rank | Quests Required | Quest Access |
|------|-----------------|--------------|
| Novice | 0 | E-Rank |
| Apprentice | 3 | E, D-Rank |
| Journeyman | 8 | E, D, C-Rank |
| Adept | 15 | E, D, C, B-Rank |
| Veteran | 25 | E, D, C, B, A-Rank |
| Elite | 40 | All Ranks |
| Guildmaster | 60 | All Ranks |

## Jobs (Selection)

**Entry-level:**
- Kitchen Hand (5 gold/hr)
- Stock Hand (5 gold/hr)
- Forge Hand (7 gold/hr)

**With Education:**
- Butcher (12 gold/hr) - Trade School
- Journeyman Enchanter (11 gold/hr) - Enchanting
- Artificer (23 gold/hr) - Advanced Enchanting

**Top-tier:**
- Guild Council Member (25 gold/hr) - Guild Administration + Advanced Enchanting

## License

Originally inspired by Sierra On-Line's classic game (1991).
This version is a fan project for learning and entertainment.

---

*A Fantasy Life Simulation*
