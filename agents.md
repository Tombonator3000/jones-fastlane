# Guild Life - Agent Instructions

## Project Overview
This is a fantasy adaptation of Jones in the Fast Lane. The game is a digital board game life simulator where players balance work, education, quests, and survival to achieve four goals: Wealth, Happiness, Education, and Career.

## Development Rules

### Logging
- Log ALL changes to `log.md` with timestamps
- Format: `## YYYY-MM-DD HH:MM` followed by bullet points of changes
- Include file names and brief descriptions

### Code Style
- No emoji in code or documentation
- No em dash characters
- Use TypeScript strict mode
- Prefer functional components in React
- Use Zustand for state management

### Naming Conventions
- AI opponent: "Grimwald" (not "Jones")
- Use fantasy-themed names for all locations and NPCs
- Keep variable names descriptive and in camelCase

### File Organization
```
src/
  components/    # React components
  systems/       # Game logic (TimeSystem, EconomySystem, etc.)
  store/         # Zustand stores
  data/          # JSON game data
  types/         # TypeScript type definitions
  utils/         # Helper functions
  hooks/         # Custom React hooks
```

### Key Mechanics to Preserve
1. Turn-based (1 turn = 1 week)
2. Time budget per turn (168 hours)
3. Rent due every 4 weeks
4. Clothing/equipment degrades every 8 weeks
5. Dynamic economy with price fluctuations
6. Four-goal victory system (Wealth, Happiness, Education, Career)
7. Hot-seat multiplayer support

### Priority Order
1. Core game loop (time, movement, basic actions)
2. Economy (money, rent, prices)
3. Jobs and work system
4. Education system
5. Goal tracking and victory
6. Quest system
7. Events and random encounters
8. Multiplayer and AI opponent
9. Polish and animations

### Testing
- Write tests for game systems (not UI)
- Test economic balance
- Test win conditions

### When in Doubt
- Refer to `guild-life-complete-spec.md` for detailed mechanics
- Keep the Jones in the Fast Lane feel: accessible, competitive, funny
- Prioritize playability over complexity
