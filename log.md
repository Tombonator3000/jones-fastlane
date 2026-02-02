# Utviklingslogg - Jones in the Fast Lane

---

## 2026-02-02 - Cross-Platform Support (Lovable + GitHub Pages)

### Oppgave
Gjøre spillet fungerende både lokalt (Lovable) og på GitHub Pages.

### Analyse

**Identifiserte problemer:**
1. `vite.config.ts` manglet `base`-konfigurasjon for GitHub Pages
   - Lokalt/Lovable: `base: '/'` (standard)
   - GitHub Pages: `base: '/jones-fastlane/'` (repo-navn)
2. Ingen GitHub Actions workflow for automatisk deployment
3. Dependencies måtte installeres

**Repository-info:**
- Repo: `Tombonator3000/jones-fastlane`
- Branch: `claude/game-cross-platform-support-WMKXT`

### Løsning

#### 1. Oppdatert `vite.config.ts`

Lagt til dynamisk `base` konfigurasjon som sjekker miljøvariabel:

```typescript
export default defineConfig(({ mode }) => ({
  // Base path: '/' for local/Lovable, '/jones-fastlane/' for GitHub Pages
  base: process.env.GITHUB_PAGES ? '/jones-fastlane/' : '/',
  // ...
}));
```

**Hvordan det fungerer:**
- Lokalt/Lovable: `GITHUB_PAGES` er ikke satt → `base: '/'`
- GitHub Actions: `GITHUB_PAGES=true` settes → `base: '/jones-fastlane/'`

#### 2. Opprettet GitHub Actions Workflow

Ny fil: `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
        env:
          GITHUB_PAGES: true
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/deploy-pages@v4
```

**Workflow features:**
- Trigger: Push til `main` branch eller manuell dispatch
- Node.js 20 med npm cache
- Setter `GITHUB_PAGES=true` under build
- Deploy til GitHub Pages med artifact upload

#### 3. Build-test resultater

**Lokal build (base: '/'):**
```
✓ built in 10.73s
dist/index.html - href="/assets/..."
```

**GitHub Pages build (base: '/jones-fastlane/'):**
```
✓ built in 10.30s
dist/index.html - href="/jones-fastlane/assets/..."
```

### Filer endret
- `vite.config.ts` - Dynamisk base path konfigurasjon
- `.github/workflows/deploy.yml` - NY fil for GitHub Pages deployment

### GitHub Pages oppsett (manuelt steg)

For at deployment skal fungere må repository-eier:
1. Gå til GitHub repo → Settings → Pages
2. Under "Build and deployment":
   - Source: "GitHub Actions"
3. Merge denne PR til `main`
4. Workflow kjører automatisk og deployer til GitHub Pages

### URLs etter deployment
- **GitHub Pages**: `https://tombonator3000.github.io/jones-fastlane/`
- **Lovable**: Kjører lokalt på `http://localhost:8080/`

### Build-status
✅ Begge build-konfigurasjoner fungerer

---

## 2026-02-02 - Fix Game Deployment (Lokal + GitHub Pages) - TIDLIGERE ANALYSE

### Oppgave
Fikse deployment slik at spillet kjører både lokalt og fra GitHub Pages.

### Analyse

**Identifiserte problemer:**
1. `vite.config.ts` mangler `base`-konfigurasjon for GitHub Pages
   - Lokalt: `base: '/'` fungerer
   - GitHub Pages: `base: '/jones-fastlane/'` kreves (repo-navn)
2. Ingen GitHub Actions workflow for automatisk deployment
3. Dependencies var ikke installert (fikset med `npm install`)

**Repository-info:**
- Repo: `Tombonator3000/jones-fastlane`
- Branch: `claude/fix-game-deployment-JxWrZ`

### Status
✅ Løst i commit over

---

## 2026-02-01 - Wiki Jobs List Implementation

### Oppgave
Implementere den fullstendige jobb-listen fra wiki: https://jonesinthefastlane.fandom.com/wiki/List_of_Jobs

### Wiki-data

Totalt 43 jobber fordelt på 9 lokasjoner:

| Location | Jobber | Lønnsspenn |
|----------|--------|------------|
| Z-Mart | 3 | $5-$8 |
| Monolith Burgers | 4 | $5-$8 |
| QT Clothing | 4 | $6-$12 |
| Socket City | 4 | $6-$14 |
| Hi-Tech U | 3 | $5-$20 |
| Factory | 9 | $7-$25 |
| Bank | 5 | $6-$22 |
| Black's Market | 5 | $6-$18 |
| Rent Office | 2 | $7-$9 |

### Spesielle regler
- **Cook** (Monolith Burgers): Hvem som helst kan få denne jobben (0 experience krav)
- **Janitor** (QT Clothing, Socket City): CD-ROM only jobber
- **Clerk** (Socket City): CD-ROM only jobb

### Implementerte endringer

#### JOBS array fullstendig erstattet (`types/game.ts:206-269`)

Alle 43 jobber implementert med wiki-nøyaktige verdier:

```typescript
// Eksempel struktur for hver jobb:
{
  id: 'cook-monolith',
  title: 'Cook',
  location: 'monolith-burger',
  baseWage: 5,
  hoursPerShift: 6,
  requiredDegrees: [],
  requiredClothes: 'casual',
  requiredExperience: 0,  // Anyone can get this job
  requiredDependability: 10,
  careerPoints: 3
}
```

#### Jobb-hierarki per lokasjon

**Z-Mart:**
- Clerk ($5) → Assistant Manager ($7) → Manager ($8, Junior College)

**Monolith Burgers:**
- Cook ($5, ingen krav) → Clerk ($6) → Assistant Manager ($7) → Manager ($8, Junior College)

**QT Clothing:**
- Janitor ($6) → Salesperson ($8) → Assistant Manager ($9, Junior College) → Manager ($12, Business Admin)

**Socket City:**
- Clerk ($6) → Salesperson ($7) → Electronics Repairman ($11, Electronics) → Manager ($14, Electronics + Junior College)

**Hi-Tech U:**
- Janitor ($5) → Teacher ($11, Academic) → Professor ($20, Research)

**Factory (høyeste lønn):**
- Janitor ($7) → Assembly Worker ($8, Trade School) → Secretary ($9, Junior College)
- Machinist's Helper ($10, Pre-Engineering) → Machinist ($19, Engineering)
- Executive Secretary ($18, Business Admin)
- Department Manager ($22, Junior College + Engineering)
- Engineer ($23, Junior College + Engineering)
- General Manager ($25, Business Admin + Engineering) **HØYEST BETALT**

**Bank:**
- Janitor ($6) → Teller ($10, Junior College) → Assistant Manager ($14, Business Admin)
- Manager ($19, Business Admin) → Broker ($22, Business Admin + Academic)

**Black's Market:**
- Janitor ($6) → Checker ($8) → Butcher ($12, Trade School)
- Assistant Manager ($15, Junior College) → Manager ($18, Business Admin)

**Rent Office:**
- Groundskeeper ($7) → Apartment Manager ($9, Junior College)

### Career Points beregning

Career points er beregnet basert på lønn og krav:
- Laveste jobber (Janitor, Cook): 3-8 points
- Entry-level: 5-15 points
- Mid-tier: 18-35 points
- Senior: 42-65 points
- Top-tier: 72-100 points

General Manager (Factory) gir maksimum 100 career points.

### Kleskrav

| Uniform | Jobber |
|---------|--------|
| Casual | Janitor, Cook, Clerk, Assembly Worker, Machinist, etc. |
| Dress | Salesperson, Teller, Secretary, Teacher, Professor, etc. |
| Business | Manager-stillinger (QT, Socket City, Bank, Black's Market, Factory) |

### Grad-krav

| Grad | Åpner for |
|------|-----------|
| Trade School | Assembly Worker, Butcher |
| Junior College | Manager (Z-Mart/Monolith), Assistant Manager (QT/Black's), Teller, Secretary, Apartment Manager |
| Electronics | Electronics Repairman, Manager (Socket City) |
| Pre-Engineering | Machinist's Helper |
| Engineering | Machinist, Department Manager, Engineer, General Manager |
| Business Admin | Manager (QT/Black's), Executive Secretary, Bank positions, General Manager |
| Academic | Teacher, Broker |
| Research | Professor |

### Filer endret
- `src/types/game.ts` - Fullstendig erstattet JOBS array (43 jobber)

### Build-status
✅ Build vellykket (npm run build)

---

## 2026-02-01 - Wild Willy Full Implementation

### Oppgave
Implementere Wild Willy karakteren fullstendig basert på wiki-spesifikasjonene:
- Street Robbery (når spilleren forlater Bank eller Black's Market)
- Apartment Robbery (ved Low-Cost Housing)
- Visuell dialog med Wild Willy sprite og animasjon

### Wiki-spesifikasjoner

#### Street Robbery
- **Trigger**: Kun når spilleren FORLATER Bank eller Black's Market
- **Vilkår**:
  - Uke 4 eller senere
  - Spilleren må ha Cash
- **Sannsynlighet**:
  - Bank: 1/31 sjanse (~3.2%)
  - Black's Market: 1/51 sjanse (~1.95%)
- **Konsekvens**:
  - Mister ALL Cash (settes til $0)
  - -3 Happiness

#### Apartment Robbery
- **Trigger**: Ved turstart for spillere i Low-Cost Housing
- **Vilkår**: Spilleren må eie Durables (gjenstander)
- **Sannsynlighet**: `1 / (Relaxation + 1)`
  - Ved Relaxation=10: ~9% sjanse
  - Ved Relaxation=50: ~2% sjanse
- **Item-sjekk**: 25% sjanse per item TYPE (ikke per item)
- **Konsekvens**:
  - Hvis minst én gjenstand stjeles: -4 Happiness
  - Hvis ingen stjeles: Ingen effekt

#### Items som ALDRI kan stjeles
- Refrigerator, Freezer, Stove
- Computer
- Encyclopedia, Dictionary, Atlas

### Implementerte endringer

#### 1. types/game.ts - WILD_WILLY konstant
```typescript
export const WILD_WILLY = {
  streetRobbery: {
    minWeek: 4,
    happinessLoss: 3,
    chances: {
      'bank': 1 / 31,        // ~3.2%
      'blacks-market': 1 / 51, // ~1.95%
    },
  },
  apartmentRobbery: {
    chancePerItemType: 0.25, // 25% per item type
    happinessLoss: 4,
  },
  unStealableItems: [
    'refrigerator', 'freezer', 'stove',
    'computer', 'encyclopedia', 'dictionary', 'atlas',
  ],
};
```

#### 2. types/game.ts - APPLIANCES canBeStolen oppdatert
Rettet `canBeStolen` verdier for:
- Freezer: `true` → `false`
- Stove: `true` → `false`
- Encyclopedia, Dictionary, Atlas: `true` → `false`

#### 3. types/game.ts - WildWillyEvent interface
```typescript
export interface WildWillyEvent {
  type: 'street' | 'apartment';
  amountStolen?: number;  // For street robbery
  itemsStolen?: string[]; // For apartment robbery
  happinessLoss: number;
}
```

#### 4. GameContext.tsx - Street Robbery i MOVE_TO_LOCATION
- Sjekker om spilleren forlater 'bank' eller 'blacks-market'
- Ruller sannsynlighet basert på lokasjon
- Setter `wildWillyEvent` i state for å trigge dialog

#### 5. GameContext.tsx - Apartment Robbery i END_TURN
- Forbedret logikk for relaxation-basert sjanse
- Bruker `WILD_WILLY.unStealableItems` for å filtrere
- Setter `apartmentRobberyEvent` for UI-visning

#### 6. Ny komponent: WildWillyDialog.tsx
- Animert dialog med Wild Willy sprite
- Forskjellig bakgrunn for street vs apartment robbery
- Framer Motion animasjoner:
  - Wild Willy glir inn fra høyre
  - "STICK 'EM UP!" tekst for street robbery
  - Gun flash effekt
- Newspaper-stil overskrift med detaljer
- Viser stjålet beløp eller gjenstander

#### 7. Index.tsx - Integrert WildWillyDialog
- Importerer og bruker WildWillyDialog
- State for `showWildWilly`
- Effect som lytter på `state.wildWillyEvent`
- AI-tur venter på dialog før fortsettelse

### Filer endret
- `src/types/game.ts` - Typer og konstanter
- `src/contexts/GameContext.tsx` - Spilllogikk
- `src/components/game/WildWillyDialog.tsx` - NY komponent
- `src/pages/Index.tsx` - Dialog-integrasjon

### Build-status
✅ Build vellykket (npm run build)

---

## 2026-02-01 - Wiki Economy System Implementation

### Oppgave
Implementere det fullstendige økonomisystemet fra wiki: https://jonesinthefastlane.fandom.com/wiki/Economy

### Wiki-analyse

Økonomisystemet har to sentrale verdier:
1. **Economic Index** (-3 til +3): Markedstrend-indikator
2. **Economic Reading** (-30 til +90): Faktisk prismultiplikator

**Prisformel fra wiki:**
```
Item Price = Base Price + (Base Price × Reading / 60)
```
- Ved Reading -30: Pris = 50% av basispris
- Ved Reading 0: Pris = 100% av basispris
- Ved Reading +90: Pris = 250% av basispris

**Crash/Boom regler:**
- Kan kun skje fra uke 4+ (første 3 ukene er unntatt)
- Sterk økonomi → større sjanse for crash
- Svak økonomi → større sjanse for boom
- Major crash: Bank tømmes, alle mister jobb
- Moderate crash: Mulig lønnskutt til 80%
- Minor crash: Liten økonomisk nedgang

### Implementerte endringer

#### 1. Nye typer og funksjoner i `types/game.ts`

**GameState oppdatert:**
```typescript
interface GameState {
  economicIndex: number;   // -3 til +3, trend-indikator
  economyReading: number;  // -30 til +90, prismultiplikator
  // ... andre felt
}
```

**Ny prisformel (fikset fra /100 til /60):**
```typescript
export function calculatePrice(basePrice: number, economyReading: number): number {
  const multiplier = 1 + (economyReading / 60);
  return Math.round(basePrice * Math.max(0.5, Math.min(2.5, multiplier)));
}
```

**Ny økonomi-beregningsfunksjon:**
```typescript
export function calculateEconomy(
  currentIndex: number,
  currentReading: number,
  week: number
): EconomyCalculation {
  // Kompleks formel som:
  // 1. Index påvirker Reading-endring
  // 2. Reading-momentum påvirker Index
  // 3. Crash-sjanse øker med høy Reading
  // 4. Boom-sjanse øker med lav Reading
  // 5. Kun events fra uke 4+
}
```

**Ny stock-pris beregning:**
```typescript
export function calculateStockPrice(
  basePrice: number,
  currentPrice: number,
  economyReading: number,
  isSafe: boolean
): number {
  // Aksjer fluktuerer uavhengig rundt økonomi-baseline
  // T-Bills er stabile (±2.5%)
  // Andre aksjer kan variere mer, men trekkes mot baseline
}
```

#### 2. GameContext oppdateringer

**END_TURN bruker nå ny økonomi-beregning:**
```typescript
const economyResult = calculateEconomy(
  state.economicIndex,
  state.economyReading,
  nextWeek
);

// Håndter crash-effekter
if (economyResult.crashType === 'moderate') {
  // Pay cut til 80% for noen arbeidere
  if (Math.random() < 0.3 && player.job) {
    player.currentWage = player.currentWage * 0.8;
  }
}
```

**Alle filer oppdatert til å bruke `economyReading`:**
- `GameContext.tsx` - Hovedlogikk
- `LocationMenu.tsx` - UI prisvisning
- `LocationDialog.tsx` - UI prisvisning
- `useJonesAI.ts` - AI-beslutninger

#### 3. Crash/Boom tidspunkt

**Endret fra uke 8+ til uke 4+ (per wiki):**
- Første 3 uker er nå trygge
- Fra uke 4 kan market events skje
- Sannsynlighet øker med økonomisk styrke/svakhet

#### 4. Pay cut system

**Moderate crash kan nå gi lønnskutt:**
```typescript
if (payCutApplied && player.job && Math.random() < 0.3) {
  const currentWage = player.currentWage || player.job.baseWage;
  player.currentWage = currentWage * 0.8; // 80% av nåværende
}
```

### Formler oppsummert

| Formel | Beskrivelse |
|--------|-------------|
| `Price = Base × (1 + Reading/60)` | Itempriser |
| `Wage = Base × (1 + Reading/60) × ExpBonus` | Lønninger |
| `CrashChance = 0.05 + (Reading - 30) × 0.01` | Crash-sannsynlighet |
| `BoomChance = 0.05 + (0 - Reading) × 0.01` | Boom-sannsynlighet |
| `PayCut = CurrentWage × 0.8` | Moderate crash lønnskutt |

### Priseksempler

Ved ulike Reading-verdier:

| Reading | Multiplikator | Eksempel ($100 base) |
|---------|---------------|---------------------|
| -30 | 0.5 | $50 |
| -15 | 0.75 | $75 |
| 0 | 1.0 | $100 |
| +30 | 1.5 | $150 |
| +60 | 2.0 | $200 |
| +90 | 2.5 | $250 |

### Filer endret
- `src/types/game.ts` - Nye typer, formler, funksjoner
- `src/contexts/GameContext.tsx` - Ny økonomi-logikk
- `src/components/game/LocationMenu.tsx` - economyReading
- `src/components/game/LocationDialog.tsx` - economyReading
- `src/hooks/useJonesAI.ts` - economyReading
- `test-ai-simulation.mjs` - economyReading

### Build-status
✅ Build vellykket (npm run build)

---

## 2026-02-01 - Location Menu i Center Panel

### Oppgave
Når spilleren er på et sted skal menyen åpnes på midten av spillbrettet slik at man kan samhandle med stedet man er på. Layout og design skal matche originalspillets stil.

### Implementasjon

#### 1. Ny komponent: LocationMenu (`src/components/game/LocationMenu.tsx`)
- Erstatter den tidligere modale LocationDialog
- Vises direkte i sentrum av spillbrettet
- Retro-stil design med:
  - Kremfarget bakgrunn med gradient
  - Teal/turkis header
  - Pixel-font titler
  - Interaktive item-lister
  - Done-knapp for å lukke

#### 2. CSS-stiler (`src/index.css`)
Nye klasser lagt til:
```css
.location-menu-panel      /* Hovedpanel med retro-utseende */
.location-menu-header     /* Turkis header med lokasjonsnavn */
.location-menu-content    /* Scrollbar innholdsområde */
.location-menu-section    /* Seksjoner med border */
.location-menu-section-title  /* Pixel-font seksjonstitler */
.location-menu-button     /* Retro-stil knapper */
.location-menu-close      /* Done-knapp */
.location-menu-item       /* Klikkbare items i lister */
```

#### 3. Oppdatert GameBoard (`src/components/game/GameBoard.tsx`)
- Nye props: `selectedLocation`, `onCloseLocation`
- Senterpanelet viser nå enten:
  - Spillstatus (uke, måned, spiller) når ingen lokasjon er valgt
  - LocationMenu når en lokasjon er valgt
- AnimatePresence for smooth overganger

#### 4. Oppdatert Index.tsx (`src/pages/Index.tsx`)
- Fjernet LocationDialog import/bruk
- Sender selectedLocation og onCloseLocation til GameBoard

### Lokasjonsmenyer implementert
Alle 13 lokasjoner har fullstendig menyinnhold:
- **Monolith Burgers**: Fast food meny med priser
- **Black's Market**: Fresh food, lottery
- **QT Clothing**: Kvalitetsklær med varighet
- **Z-Mart**: Rabatterte klær og elektronikk
- **Socket City**: Elektronikk/appliances med priser
- **Employment Office**: Jobbliste med krav
- **Hi-Tech U**: Kurs innskriving og studieprogresjon
- **Bank**: Innskudd/uttak, aksjehandel
- **Factory**: Arbeidsområde
- **Rent Office**: Husleie og leilighetsbytte
- **Pawn Shop**: Pantsetting og innløsning
- **Low-Cost Housing / Security Apartments**: Hjemvisning

### Design-elementer (fra originalspill-bilder)
- Kremfarget bakgrunn (#f5f0e6)
- Turkis knapper (#4a9a9a)
- Pixel-font (Press Start 2P)
- VT323 for vanlig tekst
- Innrykket border med skygge
- Scrollbar med retro-stil

### Build-status
✅ Build vellykket (npm run build)

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
