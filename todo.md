# Todo - Jones in the Fast Lane

## Status: Under utvikling

---

## Prioritet 1: Kjernefunksjonalitet

### Spillmekanikk
- [x] Grunnleggende spillmotor (GameContext)
- [x] Spillerdata og typer
- [x] Jones AI motstander
- [x] Ukesyklus og helgehendelser
- [x] Økonomi-indeks system
- [x] Wild Willy tilfeldige røverier (apartment robbery i END_TURN)
- [x] Leilighetsskifte-mekanikk
- [x] Pantelåner fullstendig implementasjon

### Lokasjoner
- [x] Alle 13 lokasjoner definert
- [x] Navigasjon mellom lokasjoner (MOVE_TO_LOCATION)
- [x] Visuell lokasjonsdialog for hver plass (LocationDialog.tsx)

### Jobber og karriere
- [x] 30+ jobber med krav
- [x] Jobbsøking ved Employment Office (APPLY_FOR_JOB)
- [x] Lønnsøkning basert på erfaring (experience bonus opptil 50%)
- [x] Oppsigelse/sparking mekanikk (dependability < 10)

### Utdanning
- [x] 11 grader med prereqs
- [x] Innskriving ved Hi-Tech U (ENROLL_DEGREE)
- [x] Studiefremdrift tracking (studyProgress)
- [x] Eksamen og graduering (automatisk ved fullført timer)

---

## Prioritet 2: UI/UX

### Spillbrett
- [ ] Interaktivt kart
- [ ] Spillerbrikke animasjon
- [ ] Lokasjonsindikatorer

### Dialogs
- [x] Game Over dialog
- [x] Weekend Event dialog
- [x] Location Menu i center panel (2026-02-01)
- [x] Butikk-dialoger (alle lokasjoner via LocationMenu)
- [x] Jobb-søknad dialog (via LocationMenu)
- [x] Studieprogram dialog (via LocationMenu)

### Statistikk
- [x] PlayerStats komponent
- [ ] Detaljert økonomi-oversikt
- [ ] Utdanningstre visualisering
- [ ] Karrierestige visning

---

## Prioritet 3: Avanserte features

### AI Forbedringer
- [ ] Vanskelighetsgrader (Easy/Medium/Hard)
- [ ] Jones respons på spillerens strategi
- [ ] Optimalisert aksjehandel
- [ ] Risikovurdering for Wild Willy

### Multiplayer
- [ ] 2-4 spillere lokalt
- [ ] Tur-basert system
- [ ] Spillerfarger og avatarer

### Lydeffekter
- [ ] Bakgrunnsmusikk
- [ ] UI-lyder
- [ ] Hendelseslyder

---

## Prioritet 4: Polish

### Visuell
- [ ] Retro-stil grafikk
- [ ] Animasjoner (Framer Motion)
- [ ] Responsivt design
- [ ] Dark mode

### QoL
- [ ] Lagre/laste spill
- [ ] Statistikk historie
- [ ] Tutorial/hjelp
- [ ] Hurtigtaster

---

## Bugs

### Aktive (identifisert via AI-simulering 2026-02-01)

#### KRITISK
- [x] **AI: Happiness kollaps** - AI prioriterer ikke happiness, spillere ender på 0 (FIKSET 2026-02-01)
  - Årsak: Weekend events og Wild Willy trekker mer happiness enn AI kompenserer
  - Løsning: Implementert kritisk happiness-sjekk ved < 15, kjøper appliances/mat aktivt

- [x] **AI: Karrierestagnasjon** - AI oppgraderer aldri jobb etter første ansettelse (FIKSET 2026-02-01)
  - Årsak: `useJonesAI.ts` sjekket kun for jobb hvis `!player.job`
  - Løsning: Ny `getBetterJob()` funksjon og Priority 1.5 for jobboppgradering

#### MEDIUM
- [x] **AI: Kjøper ikke dress/business klær** - Hindrer karriereprogresjon (FIKSET 2026-02-01)
  - Årsak: AI kjøpte kun klær når ingen klær (`currentClothing === 'none'`)
  - Løsning: Ny `getClothingForBetterJobs()` funksjon, oppgraderer klær proaktivt

- [x] **Balansering: Wild Willy for aggressiv** - 25% sjanse per item per uke (FIKSET 2026-02-01)
  - Resultat: Items stjeles konstant i low-cost housing
  - Løsning: Redusert til 10%, AI vurderer security apartments ved lav happiness

### Fikset
- [x] React Error #31 - `player.clothes` objekt rendret direkte i PlayerStats.tsx (2026-02-01)

---

## Fullførte oppgaver

- [x] Prosjektoppsett med Vite + React
- [x] TypeScript konfigurasjon
- [x] Shadcn-ui integrasjon
- [x] Tailwind CSS oppsett
- [x] Game state management
- [x] Jones AI grunnleggende logikk
- [x] Wiki-basert spilldata
- [x] Dokumentasjonsfiler opprettet
- [x] Wild Willy apartment robbery triggering (2026-02-01)
- [x] Erfaringsbasert lønnsbonus - opptil 50% (2026-02-01)
- [x] Oppsigelse ved lav dependability (2026-02-01)
- [x] Doktor-triggering ved sult (2026-02-01)
- [x] AI happiness-håndtering - kritisk sjekk og appliance-kjøp (2026-02-01)
- [x] AI jobboppgradering - søker etter bedre jobber automatisk (2026-02-01)
- [x] AI klesoppgradering for karriere - kjøper dress/business proaktivt (2026-02-01)
- [x] Wild Willy balansering - redusert fra 25% til 10% (2026-02-01)
- [x] AI security apartment-vurdering ved lav happiness (2026-02-01)
- [x] Location Menu i center panel - retro design (2026-02-01)

### Wiki Hour Rules Implementation (2026-02-01)
- [x] Starvation penalty: 20 timer (var 10)
- [x] Wild Willy relaxation-basert sjanse: 1/(relax+1)
- [x] RELAX action: 6 timer, +3 relax, +2 happiness første gang
- [x] Lav-relaxation doctor visit: 25% sjanse ved relax=10
- [x] Weekend cost: $0 hvis ingen cash, max $55 før uke 8
- [x] Enrollment: 0 timer (var 2)
- [x] Study: Fast 6 timer per leksjon
- [x] Market crash/boom system (uke 8+)
- [x] Rent garnishment system

---

*Sist oppdatert: 2026-02-01*
