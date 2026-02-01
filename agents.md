# Agents - Jones in the Fast Lane

## Oversikt

Dette dokumentet beskriver AI-agentene i spillet og deres beslutningstaking.

---

## Jones AI (`useJonesAI.ts`)

Jones er den primære AI-motstanderen i spillet. Han tar automatiske beslutninger basert på spillets mål og sin nåværende tilstand.

### Beslutningslogikk

Jones bruker en prioritetsbasert beslutningsmodell:

#### 1. Nødsituasjoner (Høyest prioritet)
- **Betale husleie** - Hvis husleie er forfalt
- **Kjøpe mat** - Hvis Jones sulter (food <= 1 og ingen fast food)

#### 1.5 Kritisk Happiness (NY!)
- **Kjøpe appliances** - Hvis happiness < 15 og har penger
  - Prioriterer items med høyest happiness-bonus
  - Fallback: Kjøper deluxe meal for happiness
- **Flytte til security** - Hvis happiness < 20, bor i low-cost og har items

#### 2. Jobbsøking og oppgradering
- Hvis Jones ikke har jobb, søker han etter beste tilgjengelige jobb
- Kjøper klær hvis nødvendig for å kvalifisere til jobber
- **Søker etter bedre jobb** når kvalifisert (NY!)
- **Kjøper klær** som åpner for bedre jobber (NY!)

#### 3. Arbeid
- Arbeider når han trenger penger og har jobb
- Prioriterer arbeid over studier når formue-fremgang er lav

#### 4. Utdanning
- Melder seg på kurs ved Hi-Tech U
- Studerer eksisterende kurs
- Prioriterer utdanning når karriere-fremgang er lav

#### 5. Oppgraderinger
- Kjøper bedre klær for høyere jobber
- Kjøper elektronikk for lykke
- Kjøper kjøleskap for matlagring

#### 6. Banking
- Setter inn overskuddspenger i banken

### Prioritetsberegning

```typescript
const priority = {
  needsWealth: wealthProgress < 100,
  needsHappiness: happinessProgress < 100,
  needsEducation: educationProgress < 100,
  needsCareer: careerProgress < 100,
  lowestProgress: Math.min(all_progresses)
};
```

### Tilgjengelige handlinger

| Handling | Beskrivelse |
|----------|-------------|
| `MOVE_TO_LOCATION` | Flytt til en lokasjon |
| `WORK` | Arbeid X timer |
| `STUDY` | Studer et fag |
| `BUY_FAST_FOOD` | Kjøp hurtigmat |
| `BUY_FRESH_FOOD` | Kjøp fersk mat |
| `BUY_CLOTHES` | Kjøp klær |
| `BUY_APPLIANCE` | Kjøp elektronikk |
| `APPLY_FOR_JOB` | Søk på jobb |
| `ENROLL_DEGREE` | Meld deg på kurs |
| `DEPOSIT_MONEY` | Sett inn penger |
| `PAY_RENT` | Betal husleie |
| `END_TURN` | Avslutt uke |

---

## Fremtidige AI-forbedringer

### Implementert (2026-02-01)
- [x] Kritisk happiness-håndtering
- [x] Jobboppgradering logikk
- [x] Klesoppgradering for karriere
- [x] Security apartment-vurdering
- [x] Wild Willy balansering (10% istedenfor 25%)

### Planlagt
- [ ] Vanskelighetsgrader (Easy/Medium/Hard)
- [ ] Tilpassing til spillerens strategi
- [ ] Aksjehandel-strategi
- [ ] Lotteri-strategi

### Vanskelighetsgrader (planlagt)
- **Easy**: Jones tar tilfeldige valg
- **Medium**: Standard prioritetsbasert (nåværende)
- **Hard**: Optimal strategi med langsiktig planlegging

---

## Teknisk implementasjon

### Hook-struktur
```typescript
export function useJonesAI() {
  const decideNextAction = useCallback(
    (player: Player, goals: GameGoals, rentDue: boolean, economyIndex: number): AIDecision[] => {
      // Returnerer liste med beslutninger
    },
    []
  );

  return { decideNextAction };
}
```

### AIDecision Interface
```typescript
interface AIDecision {
  action: string;           // Handlingstype
  params?: Record<string, unknown>;  // Parametere
  delay: number;            // Forsinkelse i ms (for animasjon)
  message: string;          // Melding til spiller
}
```

---

*Sist oppdatert: 2026-02-01*
