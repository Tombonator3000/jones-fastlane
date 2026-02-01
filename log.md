# Utviklingslogg - Jones in the Fast Lane

---

## 2026-02-01 - Dokumentasjon

### Utført
- Opprettet `agents.md` - dokumentasjon for AI-systemet
- Opprettet `log.md` - denne utviklingsloggen
- Opprettet `todo.md` - oppgaveliste for prosjektet
- Oppdatert `README.md` med prosjektbeskrivelse

### Analyse av kodebasen
- **Spillmotor**: React Context med useReducer (`GameContext.tsx`)
- **AI-motstander**: Jones AI implementert i `useJonesAI.ts`
- **Spilltyper**: Definert i `types/game.ts`
- **UI-komponenter**: Shadcn-ui + Tailwind CSS

### Teknologier identifisert
- React 18.3
- TypeScript 5.8
- Vite 5.4
- Tailwind CSS 3.4
- Shadcn-ui (Radix primitives)
- Framer Motion

---

## Tidligere commits (fra git log)

### 31ef49e - Merge PR #1: Wiki game content
- Lagt til omfattende wiki-basert spillinnhold

### 285d8e0 - Add comprehensive wiki-based game content
- Implementert komplett spilldata basert på original wiki
- 11 utdanningsgrader
- 30+ jobber
- 12 elektronikkprodukter
- Weekend events
- Lotteri-system
- Wild Willy hendelser

### a180ece - Introduce Jones AI opponent
- Implementert Jones AI med prioritetsbasert beslutningslogikk
- AI kan arbeide, studere, handle og navigere spillbrettet

### 355c4bc - Initial changes
- Grunnleggende prosjektoppsett

---

## Notater

### Spillmekanikk (fra wiki-analyse)
- **Timer**: 60 timer per uke
- **Husleie**: Forfaller hver 4. uke
- **Klær**: Slites ut (1 uke per runde)
- **Mat**: Fersk mat krever kjøleskap
- **Økonomi**: Fluktuerer (-30 til +90 indeks)

### Vinnerkrav
Spilleren må oppnå mål i alle fire kategorier:
1. Formue (penger + bank)
2. Lykke
3. Utdanning
4. Karriere

---

## 2026-02-01 - Implementering av manglende features

### Analyse av manglende funksjonalitet

Basert på gjennomgang av `todo.md` og kodebasen, identifisert følgende mangler:

#### Prioritet 1 - Mangler implementering:
1. **Wild Willy triggering** - Actions finnes, men blir aldri automatisk trigget
   - Street robbery: Bør trigges ved bank/market besøk etter uke 4
   - Apartment robbery: Bør trigges ved END_TURN for low-cost housing (25% sjanse)

2. **Lønnsøkning basert på erfaring** - Kun økonomi-indeks påvirker lønn, ikke erfaring

3. **Oppsigelse/sparking mekanikk** - Ingen mekanikk for å miste jobb ved lav dependability

4. **Doktor-triggering** - Action finnes, men trigges ikke automatisk ved sult

#### Allerede implementert (oppdatert fra todo.md):
- ✅ Navigasjon mellom lokasjoner (MOVE_TO_LOCATION)
- ✅ Visuell lokasjonsdialog (LocationDialog.tsx - 993 linjer)
- ✅ Jobbsøking ved Employment Office (APPLY_FOR_JOB)
- ✅ Innskriving ved Hi-Tech U (ENROLL_DEGREE)
- ✅ Studiefremdrift tracking (studyProgress)
- ✅ Eksamen og graduering (automatisk ved fullført timer)
- ✅ Leilighetsskifte-mekanikk (CHANGE_APARTMENT)
- ✅ Pantelåner fullstendig (PAWN_ITEM, REDEEM_ITEM)

### Implementeringsplan

1. Implementere Wild Willy triggering i END_TURN
2. Legge til erfaringsbasert lønnsbonus
3. Implementere sparking ved lav dependability
4. Legge til automatisk doktor-triggering ved sult

### Implementert

#### 1. Wild Willy Apartment Robbery (GameContext.tsx:683-702)
- Trigges i END_TURN når spiller bor i low-cost housing og uke >= 4
- 25% sjanse per gjenstand som kan stjeles (basert på `canBeStolen` property)
- Computer kan aldri stjeles
- Happiness tap: -4
- Newspaper-melding viser hvilke items som ble stjålet

#### 2. Erfaringsbasert lønnsbonus (types/game.ts:488-494)
- `calculateWage()` oppdatert med experience-parameter
- Bonus formel: `experienceBonus = 1 + (experience / 200)`
- Ved 0 erfaring: 1x lønn
- Ved 100 erfaring: 1.5x lønn (50% bonus)
- Kombineres med økonomi-indeks multiplier

#### 3. Oppsigelse/sparking mekanikk (GameContext.tsx:753-755)
- Sjekkes i END_TURN
- Spilleren mister jobben hvis dependability < 10
- Newspaper-melding: "You were fired from your job due to low dependability!"

#### 4. Doktor-triggering ved sult (GameContext.tsx:737-743)
- Trigges automatisk ved starvation i END_TURN
- Kost: tilfeldig mellom $30-$200 (DOCTOR_VISIT.minCost - maxCost)
- Timer-tap: 10 timer
- Happiness-tap: -4
- Newspaper-melding viser kostnad

### Filer endret
- `src/contexts/GameContext.tsx` - Wild Willy, job loss, doctor trigger
- `src/types/game.ts` - calculateWage med experience bonus
- `todo.md` - Oppdatert status
- `log.md` - Denne loggen

### Build-status
✅ Build vellykket (npm run build)

---

## Kommende loggføringer
*Nye oppføringer legges til øverst i filen*

---

*Logg opprettet: 2026-02-01*
