# Jones in the Fast Lane

En moderne web-reimagining av det klassiske Sierra-spillet fra 1991.

## Om spillet

Jones in the Fast Lane er et livssimulerings-brettspill der du konkurrerer mot Jones (AI) for å oppnå livsmål innen:

- **Formue** - Tjen penger, spar i banken
- **Lykke** - Kjøp ting, nyt helgene
- **Utdanning** - Fullfør grader ved Hi-Tech U
- **Karriere** - Klatr karrierestigen

### Spillmekanikk

- **60 timer per uke** - Bruk tiden klokt
- **Husleie hver 4. uke** - Ikke gå tom for penger!
- **Wild Willy** - Pass opp for røveren
- **Økonomi** - Priser og lønninger fluktuerer

## Teknologier

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Shadcn-ui
- Framer Motion

## Kom i gang

```bash
# Installer dependencies
npm install

# Start utviklingsserver
npm run dev

# Bygg for produksjon
npm run build
```

## Prosjektstruktur

```
src/
├── components/
│   ├── game/          # Spillkomponenter
│   └── ui/            # Shadcn-ui komponenter
├── contexts/
│   └── GameContext.tsx  # Spilltilstand
├── hooks/
│   └── useJonesAI.ts    # AI-motstander
├── types/
│   └── game.ts          # TypeScript typer
└── pages/
    └── Index.tsx        # Hovedside
```

## Dokumentasjon

- [agents.md](./agents.md) - AI-dokumentasjon
- [todo.md](./todo.md) - Oppgaveliste
- [log.md](./log.md) - Utviklingslogg

## Lokasjoner

| Lokasjon | Type | Beskrivelse |
|----------|------|-------------|
| Low-Cost Housing | Leilighet | Billig, men risikabelt |
| LeSecurity Apts | Leilighet | Trygt og dyrt |
| Employment Office | Tjeneste | Finn jobber |
| Hi-Tech U | Tjeneste | Utdanning |
| Bank | Tjeneste | Sparing og aksjer |
| Monolith Burgers | Mat | Hurtigmat |
| Black's Market | Mat | Fersk mat og lotteri |
| QT Clothing | Butikk | Kvalitetsklær |
| Z-Mart | Butikk | Billige varer |
| Socket City | Butikk | Elektronikk |
| Factory | Arbeid | Fabrikk-jobber |
| Pawn Shop | Tjeneste | Pantelåner |
| Rent Office | Tjeneste | Betal husleie |

## Jobber (utvalg)

**Entry-level:**
- Janitor ($5/t)
- Fry Cook ($6/t)
- Stock Clerk ($6-7/t)

**Med utdanning:**
- Butcher ($11/t) - Trade School
- Technician ($14/t) - Electronics
- Engineer ($23/t) - Engineering

**Toppnivå:**
- General Manager ($25/t) - Engineering + Business Admin

## Lisens

Basert på det originale spillet av Sierra On-Line (1991).
Denne versjonen er et fan-prosjekt for læring og underholdning.

---

*Utviklet med React og Lovable*
