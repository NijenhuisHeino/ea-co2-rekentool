# CO₂-reductie rekentool — eTruck Academy®

Standalone HTML-tool die de levenscyclus-uitstoot van een dieseltruck vergelijkt met een eTruck en het break-even punt berekent.

**Live**: wordt geserveerd via GitHub Pages en als `<iframe>` geëmbed in [etruckacademy.com](https://etruckacademy.com).

## Hoe het werkt

- `index.html` — self-contained tool (HTML + inline CSS + inline JS + inline beeldmerk-SVG). Geen build-stap nodig.
- `etruck-academy-factors.json` — CO₂-emissiefactoren, export uit [`@nts/params`](../nts-parameters-db). Tool fetcht dit bij laden met fallback op ingebouwde waarden.

## Factoren updaten (±1× per jaar)

```bash
# 1. NTS params bijwerken
cd /Users/johnnynijenhuis/clawd/projects/nts-parameters-db
vim src/data/emissie/2026.json

# 2. Export genereren
npx tsx scripts/export-etruck-academy-factors.ts

# 3. Kopieer naar dit repo + push
cp dist/etruck-academy-factors.json \
   /Users/johnnynijenhuis/conductor/workspaces/ea-co2-rekentool/mumbai/
cd /Users/johnnynijenhuis/conductor/workspaces/ea-co2-rekentool/mumbai
git add etruck-academy-factors.json
git commit -m "Update emissiefactoren"
git push
```

De tool toont op de publieke pagina altijd de datum van de laatste NTS-export.

## Stijl & canon

Volledig canonconform volgens `[[FORMAT - eTruck Academy Tool UI (Canon)]]` en `[[eTruck Academy brand kit]]` in de NTS Obsidian vault.

## Changelog

### 2026-04-24 — Review-fixes (`dfd922b`)
- **TtW-modus**: stroomfactor nu `0` kg CO₂/kWh (eTruck heeft geen uitlaat). Break-even Tank-to-Wheel valt van `~127.705 km` naar `~72.330 km`, consistent met de UI-belofte van "directe verbranding". Well-to-Wheel ongewijzigd op `~92.258 km`.
- **Validatie**: lege of nul-invoer voor `km/L` of `liters diesel` cascadet `NaN` door alle afgeleide waarden in plaats van stilletjes met een kunstmatige noemer van `0,0001` te rekenen. Resultaten tonen `–`, grafiek toont een placeholder-tekst.
- **Opruiming**: `build-data-uri.js` + `huddle-iframe-data-uri.html` verwijderd. Legacy Huddle-route had een JS-minifier-bug die `//` in string literals (o.a. `http://…`) kapot maakte. Sinds we via GitHub Pages hosten is deze route obsolete.

### 2026-04-24 — Batterijcapaciteit als parameter (`03494df`)
- Nieuw invoerveld `Batterijcapaciteit` (default 600 kWh) in "Elektrische aandrijflijn". Break-even reageert nu op voertuigtype: ~49.800 km bij 300 kWh city-truck, ~134.700 km bij 900 kWh long-haul.
- Afgeleide regels in de breakdown (batterijpakket-CO₂, totaal productie eTruck, extra productie-uitstoot) updaten live mee.

### 2026-04-24 — Initial deploy (`ad74bf6`)
- Self-contained HTML/CSS/JS volgens `FORMAT - eTruck Academy Tool UI (Canon)`.
- Titillium Web, beeldmerk-in-tegel hero, WtW/TtW-toggle, cumulatieve CO₂-grafiek.
- Live koppeling aan NTS params via `etruck-academy-factors.json` (same-origin fetch met fallback).
- Gepubliceerd via GitHub Pages: <https://nijenhuisheino.github.io/ea-co2-rekentool/>.
