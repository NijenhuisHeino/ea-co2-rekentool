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
