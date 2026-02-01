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
- [ ] Butikk-dialoger (alle lokasjoner)
- [ ] Jobb-søknad dialog
- [ ] Studieprogram dialog

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
- [ ] **AI: Happiness kollaps** - AI prioriterer ikke happiness, spillere ender på 0
  - Årsak: Weekend events og Wild Willy trekker mer happiness enn AI kompenserer
  - Løsning: AI bør kjøpe items mer aktivt, flytte til security apartments

- [ ] **AI: Karrierestagnasjon** - AI oppgraderer aldri jobb etter første ansettelse
  - Årsak: `useJonesAI.ts` sjekker kun for jobb hvis `!player.job`
  - Løsning: Legg til logikk for å søke bedre jobb når kvalifisert

#### MEDIUM
- [ ] **AI: Kjøper ikke dress/business klær** - Hindrer karriereprogresjon
  - Årsak: AI kjøper kun klær når ingen klær (`currentClothing === 'none'`)
  - Løsning: Oppgrader klær når det åpner for bedre jobber

- [ ] **Balansering: Wild Willy for aggressiv** - 25% sjanse per item per uke
  - Resultat: Items stjeles konstant i low-cost housing
  - Forslag: Reduser til 10% eller øk incentiv for security apartments

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

---

*Sist oppdatert: 2026-02-01*
