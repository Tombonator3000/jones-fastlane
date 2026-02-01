# Utviklingslogg - Jones in the Fast Lane

---

## 2026-02-01 - Implementering av Wiki Hour Rules

### Wiki-analyse

Gjennomgått følgende wiki-sider:
- https://jonesinthefastlane.fandom.com/wiki/Hour (Time-systemet)
- https://jonesinthefastlane.fandom.com/wiki/Turn (Tur-mekanikk)
- https://jonesinthefastlane.fandom.com/wiki/Week (Uke/måned-system)
- https://jonesinthefastlane.fandom.com/wiki/Weekend (Weekend events)
- https://jonesinthefastlane.fandom.com/wiki/Wild_Willy (Røveri-mekanikk)
- https://jonesinthefastlane.fandom.com/wiki/Relaxation (Hvile-system)
- https://jonesinthefastlane.fandom.com/wiki/Market_Crash (Økonomisk krasj)
- https://jonesinthefastlane.fandom.com/wiki/Clothes (Klær og uniformer)
- https://jonesinthefastlane.fandom.com/wiki/Doctor_Visit (Legebesøk)

### Identifiserte avvik fra original spill

#### 1. Starvation Penalty
- **Wiki**: 20 timer tap ved sult
- **Vår impl**: Brukte DOCTOR_VISIT.hoursLost (10 timer)
- **Fix**: Separat STARVATION.hoursLost = 20

#### 2. Wild Willy Apartment Robbery
- **Wiki**: Sjansen er `1/(relaxation+1)` - ikke flat prosent
  - Ved relaxation=10: ~9% sjanse per tur
  - Ved relaxation=50: ~2% sjanse per tur
- **Vår impl**: Flat 10% per item
- **Fix**: Beregn sjanse basert på spillerens relaxation stat

#### 3. Relaxation System
- **Wiki**:
  - RELAX action: 6 timer, +3 relaxation, max 50
  - Første RELAX per tur gir +2 happiness
  - Ved relaxation=10: 25% sjanse for doctor visit ved tur-start
- **Vår impl**: Mangler RELAX action og lav-relaxation penalty
- **Fix**: Legg til RELAX action og sjekk ved tur-start

#### 4. Weekend Cost Rules
- **Wiki**:
  - Hvis spiller har $0 cash: weekend koster $0
  - Før uke 8: max weekend cost $55
  - Etter uke 8: max weekend cost $100
- **Vår impl**: Ingen slike begrensninger
- **Fix**: Implementer disse reglene i selectWeekendEvent

#### 5. Enrollment Time Cost
- **Wiki**: Enrollment tar 0 timer (gratis tids-messig)
- **Vår impl**: Trekker 2 timer
- **Fix**: Fjern timer-kostnad fra ENROLL_DEGREE

#### 6. Study Time
- **Wiki**: Hver leksjon tar fast 6 timer
- **Vår impl**: Bruker action.hours parameter
- **Fix**: Fast 6 timer per study action

#### 7. Market Crash/Boom System
- **Wiki**:
  - Kan kun skje fra uke 8+
  - Moderate crash: spillere kan få pay cut til 80%
  - Major crash: alle mister jobb, bank deposits slettes
- **Vår impl**: Enkel random fluktuasjon
- **Fix**: Implementer ordentlig crash/boom system

#### 8. Rent Garnishment
- **Wiki**: Ved manglende betaling garnisheres lønn (ikke eviction)
- **Vår impl**: "Relative bails you out"
- **Fix**: Implementer garnishment system

### Implementasjonsplan

1. ✅ Oppdater STARVATION constant med 20 timer
2. ✅ Endre Wild Willy til relaxation-basert sjanse
3. ✅ Legg til RELAX action
4. ✅ Legg til lav-relaxation doctor visit sjekk
5. ✅ Fix weekend cost regler
6. ✅ Fix enrollment til 0 timer
7. ✅ Fix study til 6 timer
8. ✅ Implementer market crash/boom
9. ✅ Implementer rent garnishment

### Filer som endres
- `src/types/game.ts` - Nye constants og typer
- `src/contexts/GameContext.tsx` - Game logic endringer

### Implementerte endringer

#### 1. Nye Constants i types/game.ts

```typescript
// STARVATION - Wiki: 20 timer tap ved sult
export const STARVATION = {
  hoursLost: 20,
  happinessLoss: 4,
  doctorChance: 0.5,
};

// RELAXATION - Wiki: Hvile-system
export const RELAXATION = {
  minValue: 10,
  maxValue: 50,
  hoursPerRelax: 6,
  relaxationGain: 3,
  happinessFirstRelax: 2,
  lowRelaxationThreshold: 10,
  doctorChanceAtMin: 0.25,
};

// MARKET_EVENTS - Wiki: Crash/Boom fra uke 8+
export const MARKET_EVENTS = {
  minWeekForCrash: 8,
  crashTypes: { minor, moderate, major },
  boomTypes: { minor, moderate, major },
};

// RENT_GARNISHMENT - Wiki: Lønnstrekk ved manglende betaling
export const RENT_GARNISHMENT = {
  garnishmentRate: 0.25,
};
```

#### 2. Nye Player-felt

```typescript
hasRelaxedThisTurn: boolean;  // For å spore første RELAX per tur
rentDebt: number;              // Husleiegjeld for garnishment
currentWage: number | null;    // For pay cut ved crash
```

#### 3. Oppdaterte Actions i GameContext.tsx

**STUDY**: Fast 6 timer per leksjon (var variabel)
```typescript
// Wiki: Each lesson takes 6 hours
// If fewer than 6 hours remain, still takes entire lesson
const hoursUsed = Math.min(6, currentPlayer.hoursRemaining);
const newProgress = currentProgress + 1; // 1 lesson per study
```

**RELAX** (NY): 6 timer, +3 relaxation, +2 happiness første gang
```typescript
case 'RELAX': {
  // Wiki: Relaxing takes 6 hours
  relaxation: Math.min(50, currentPlayer.relaxation + 3),
  happiness: currentPlayer.hasRelaxedThisTurn ? 0 : +2,
  hasRelaxedThisTurn: true,
}
```

**ENROLL_DEGREE**: 0 timer (var 2)
```typescript
// Wiki: Enrollment takes no time (0 hours)
// But need at least 1 hour to choose a course
```

**PAY_RENT**: Garnishment i stedet for "relative bails out"
```typescript
// Can't pay? Rest becomes rentDebt
rentDebt: totalOwed - amountPaid
```

**WORK**: Garnishment av lønn
```typescript
// Wiki: 25% of wages go to paying rent debt
if (rentDebt > 0) {
  const garnishment = earnings * 0.25;
  earnings -= garnishment;
  rentDebt -= garnishment;
}
```

#### 4. Oppdatert END_TURN

**Starvation**: Nå 20 timer (var 10)
```typescript
const starvationPenalty = starvation ? STARVATION.hoursLost : 0; // 20 timer
```

**Wild Willy**: Relaxation-basert sjanse
```typescript
// Wiki: 1/(relaxation+1) sjanse
const robberyChance = 1 / (currentPlayer.relaxation + 1);
// Ved relax=10: ~9% sjanse
// Ved relax=50: ~2% sjanse
```

**Lav-relaxation doctor visit**:
```typescript
// Wiki: 25% chance at relaxation=10
const lowRelaxationDoctorVisit =
  currentPlayer.relaxation <= 10 && Math.random() < 0.25;
```

**Weekend cost**:
```typescript
// Wiki: $0 hvis ingen cash
if (player.money === 0) return { cost: 0 };
// Wiki: max $55 før uke 8, max $100 etter
const maxCost = week < 8 ? 55 : 100;
```

**Market Crash/Boom**:
```typescript
// Wiki: Kun fra uke 8+
if (nextWeek >= 8 && Math.random() < 0.05) {
  // 5% sjanse for crash
  // Major: Banks wiped, all fired
  // Moderate: Economy drop, pay cut chance
  // Minor: Small economy drop
}
```

### Build-status
✅ Build vellykket (npm run build)

---

## 2026-02-01 - AI Forbedringer og Wild Willy Balansering

### Analyse
Basert på todo.md og AI-simuleringen ble følgende kritiske problemer identifisert:
1. AI: Happiness kollaps - AI prioriterer ikke happiness
2. AI: Karrierestagnasjon - AI oppgraderer aldri jobb etter første ansettelse
3. AI: Kjøper ikke dress/business klær - Hindrer karriereprogresjon
4. Wild Willy for aggressiv - 25% sjanse per item per uke

### Implementerte løsninger

#### 1. AI Happiness-håndtering (useJonesAI.ts:208-273)
- Ny kritisk happiness-sjekk: Når happiness < 15 og har penger:
  - AI kjøper først appliances med høyest happiness-bonus
  - Hvis ingen appliances tilgjengelig, kjøper deluxe meal
- AI vurderer å flytte til LeSecurity Apartments når:
  - Bor i low-cost housing
  - Happiness < 20
  - Har items som kan stjeles
  - Har råd til security rent × 2

#### 2. AI Jobboppgradering (useJonesAI.ts:319-365)
- Ny `getBetterJob()` funksjon som finner bedre jobber enn nåværende
- AI sjekker etter bedre jobb når `needsCareer` er true
- Prioriterer høyere career points, deretter lønn
- AI søker automatisk på bedre jobb når kvalifisert

#### 3. AI Klesoppgradering for karriere (useJonesAI.ts:63-96, 338-364)
- Ny `getClothingForBetterJobs()` funksjon
- Sjekker om bedre klær ville åpne for bedre jobber
- AI kjøper dress/business klær proaktivt når det trengs for karriere
- Tar hensyn til grader, erfaring og dependability

#### 4. Wild Willy Balansering (types/game.ts:403)
- Redusert `chancePerItem` fra 0.25 (25%) til 0.10 (10%)
- Gjør low-cost housing mer spillbart
- Gir spillere tid til å spare til security apartments

### Nye hjelpefunksjoner i useJonesAI.ts
```typescript
getBetterJob(player: Player): Job | null
// Finner jobb med høyere lønn eller career points

getClothingForBetterJobs(player: Player): 'dress' | 'business' | null
// Sjekker hvilke klær som trengs for bedre jobber
```

### Filer endret
- `src/hooks/useJonesAI.ts` - AI forbedringer
- `src/types/game.ts` - Wild Willy balansering

### Build-status
✅ Build vellykket (npm run build)

---

## 2026-02-01 - Fix React Error #31 (WeekendEvent)

### Problem
React error #31: "Objects are not valid as a React child" med objekt `{text, cost, happinessChange}`.

Feilmeldingen førte til blank skjerm når weekend event ble trigget.

### Årsak
I `src/components/game/WeekendEventDialog.tsx:36` ble hele `state.weekendEvent` objektet rendret direkte:
```tsx
<p className="game-text text-lg text-foreground">
  {state.weekendEvent}
</p>
```

`state.weekendEvent` har typen `WeekendEvent` med properties `{ text: string, cost: number, happinessChange: number }` og kan ikke rendres som tekst.

### Løsning
Endret til å rendere `.text`-propertyen, og la til visning av kostnad og happiness-endring:
```tsx
<p className="game-text text-lg text-foreground">
  {state.weekendEvent.text}
</p>

<div className="text-sm text-muted-foreground space-y-1">
  <p>Cost: ${state.weekendEvent.cost}</p>
  <p>Happiness: {state.weekendEvent.happinessChange > 0 ? '+' : ''}{state.weekendEvent.happinessChange}</p>
</div>
```

### Filer endret
- `src/components/game/WeekendEventDialog.tsx` - Fikset weekend event visning

### Build-status
✅ Build vellykket (npm run build)

---

## 2026-02-01 - AI Gameplay Test Session

### Mål
Spille et helt spill mot Jones AI for å verifisere at:
1. AI-beslutningslogikken fungerer korrekt
2. Jones tar fornuftige valg gjennom hele spillet
3. Alle nylig implementerte features fungerer (Wild Willy, erfaringsbonus, sparking, doktor)
4. Spillet kan fullføres uten feil

### Testoppsett
- Mål: wealth: 500, happiness: 50, education: 30, career: 30
- Spillere: Player vs Jones (begge bruker AI-logikk)
- Max uker: 100
- Simuleringsscript: `test-ai-simulation.mjs`

### Simuleringsresultater

**Resultat: INGEN VINNER etter 100 uker**

#### Endelig spillerstatus (Uke 101):

| Spiller | Penger | Happiness | Education | Career | Job | Degrees |
|---------|--------|-----------|-----------|--------|-----|---------|
| Player | $149 (bank: -$390) | 0 | 37 | 10 | Stock Clerk | 4 grader |
| Jones | $180 | 0 | 37 | 10 | Stock Clerk | 4 grader |

#### Progress mot mål:
- **Wealth**: Player -48%, Jones 36% (mål: $500)
- **Happiness**: Begge 0% (mål: 50)
- **Education**: Begge 123% - OPPNÅDD
- **Career**: Begge 33% (mål: 30) - OPPNÅDD

### AI Atferdsanalyse

**Jones sine handlinger over 100 uker:**
- Totalt: 1304 handlinger
- Arbeidshandlinger: 554 (42%)
- Studiehandlinger: 12 (1%)
- Kjøpshandlinger: 39 (3%)
- Jobbsøknader: 1

### Identifiserte Problemer

#### KRITISK: Happiness kollaps
Begge spillere endte med 0 happiness. Årsaker:
1. Weekend events trekker fra happiness (-4 fra medisinsk nødstilfelle)
2. Wild Willy tyveri gir -4 happiness per stjålet gjenstand
3. Sult gir -4 happiness (DOCTOR_VISIT.happinessLoss)
4. AI kjøper appliances, men happiness-gevinsten (+1-3 per item) er for lav

#### KRITISK: Karrierestagnasjon
Begge spillere sitter fast på Stock Clerk (8 career points):
1. AI søker ikke etter bedre jobber etter første ansettelse
2. Erfaring og dependability bygges opp, men AI oppgraderer ikke jobb
3. Høyere jobber krever dress/business klær som AI ikke kjøper

#### BUG: Wild Willy er for aggressiv
Med 25% sjanse per item per uke i low-cost housing:
- Gjenstander stjeles konstant
- Spillere mister items de nettopp kjøpte
- Ingen incentiv til å flytte til security apartments

#### OBSERVASJON: Duplikat-kjøp
Simuleringen viser at spillere "kjøper Freezer" gjentatte ganger - dette indikerer enten:
1. Bug i simuleringen (sjekker ikke om item er kjøpt)
2. Items blir stjålet og må kjøpes på nytt

### Foreslåtte Forbedringer

1. **AI bør prioritere happiness mer**
   - Kjøpe items aktivt når happiness synker
   - Bytte til security apartment når man har råd

2. **AI bør oppgradere jobb**
   - Sjekke etter bedre jobber når erfaring/dependability øker
   - Kjøpe dress/business klær for høyere jobber

3. **Juster Wild Willy-mekanikk**
   - Reduser sjanse fra 25% til 10%
   - Eller: Lag AI som flytter til security apartments

4. **Balansering av happiness**
   - Weekend events bør gi mer happiness
   - Appliances bør gi mer happiness-bonus

### Konklusjon

AI-simuleringen avslørte at Jones AI fungerer teknisk korrekt, men har strategiske svakheter:

**Fungerer som forventet:**
- Jobbsøking ved oppstart
- Studier og fullføring av grader
- Arbeid for å tjene penger
- Kjøp av items

**Trenger forbedring:**
- Happiness-håndtering (kritisk)
- Jobboppgradering
- Klesoppgradering for karriere
- Flytte til security apartments

**Neste steg:**
Se todo.md for identifiserte bugs og foreslåtte løsninger.

---

## 2026-02-01 - Fix React Error #31

### Problem
React error #31: "Objects are not valid as a React child" med objekt `{casual, dress, business}`.

Feilmeldingen viste blank skjerm på grunn av at et objekt ble forsøkt rendret direkte i JSX.

### Årsak
I `src/components/game/PlayerStats.tsx:104` ble `player.clothes` (et objekt) rendret direkte:
```tsx
<span>{player.clothes}</span>
```

`player.clothes` har typen `{ casual: number, dress: number, business: number }` og kan ikke rendres som tekst.

### Løsning
Formaterte klær-objektet til lesbar streng:
```tsx
<span>C:{player.clothes.casual} D:{player.clothes.dress} B:{player.clothes.business}</span>
```

### Filer endret
- `src/components/game/PlayerStats.tsx` - Fikset klær-visning

### Build-status
✅ Build vellykket (npm run build)

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
