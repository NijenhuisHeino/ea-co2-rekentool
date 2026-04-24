#!/usr/bin/env node
/**
 * Bouwt de Huddle-compatibele data-URI embed voor de CO2-reductie rekentool.
 *
 * Waarom data-URI en niet srcdoc?
 *   The Huddle strip-t JavaScript uit `srcdoc`-iframes. De werkende route
 *   (bevestigd in de PV+BESS+ERE-runbook) is een `data:text/html` URI in
 *   `src=` — die wordt wel als zelfstandig document behandeld en JS blijft
 *   intact.
 *
 * Uitvoeren:
 *   node build-data-uri.js
 *
 * Output:
 *   huddle-iframe-data-uri.html   — plakbaar iframe-blok voor Huddle
 */
const fs = require("fs");
const path = require("path");

const root = __dirname;
const indexPath = path.join(root, "index.html");
const outPath = path.join(root, "huddle-iframe-data-uri.html");

// Huddle CDN URL voor het beeldmerk. Zelfde asset die de PV+BESS+ERE-tool
// gebruikt. Spaart ~4,5 KB aan base64-payload in de data-URI.
const HUDDLE_BEELDMERK_URL =
  "https://cdn.thehuddle-aws.com/uploads/tenants/11258/202406/094151-094151-etruckacademy_beeldmerk_rgb.jpg";

function minifyCss(input) {
  return input
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>+])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}

function lightMinifyJs(input) {
  // Conservatief: comments weg, opeenvolgende whitespace comprimeren.
  // Niet trimmen rondom operatoren — breekt regex/template literals.
  return input
    .replace(/\/\*[\s\S]*?\*\//g, "")       // block comments
    .replace(/^\s*\/\/[^\n]*$/gm, "")       // line comments
    .replace(/\/\/[^\n]*$/gm, "")           // trailing line comments
    .replace(/\n\s*\n/g, "\n")              // blank lines
    .replace(/^\s+/gm, "")                  // leading indent
    .replace(/\s+$/gm, "")                  // trailing whitespace
    .replace(/\n+/g, "\n")                  // merge consecutive newlines
    .trim();
}

function minifyHtmlBetweenTags(input) {
  return input
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .trim();
}

let html = fs.readFileSync(indexPath, "utf8");
const original = html.length;

// 1) Inline CSS minifyen
html = html.replace(/<style>([\s\S]*?)<\/style>/, (_, css) => {
  return `<style>${minifyCss(css)}</style>`;
});

// 2) Inline JS licht minifyen (alleen whitespace, veilig voor template
//    literals, regex en arrow functions)
html = html.replace(/<script>([\s\S]*?)<\/script>/, (_, js) => {
  return `<script>${lightMinifyJs(js)}</script>`;
});

// 3) Base64 SVG beeldmerk vervangen door Huddle CDN URL
html = html.replace(
  /<img class="brand-logo" src="data:image\/svg\+xml;base64,[^"]+" ([^>]+)>/,
  `<img class="brand-logo" src="${HUDDLE_BEELDMERK_URL}" $1>`
);

// 4) Preconnect-links weghalen (<link rel="stylesheet"> doet al de connectie)
html = html.replace(/<link rel="preconnect"[^>]*>\s*/g, "");

// 5) HTML-commentaar weghalen
html = html.replace(/<!--[\s\S]*?-->/g, "");

// 6) HTML-whitespace tussen tags opruimen
html = minifyHtmlBetweenTags(html);

const minified = html.length;

// Base64 is efficiënter dan encodeURIComponent bij content met veel
// non-ASCII tekens (€, ², é, enz. — Nederlandse tool). Elke non-ASCII-char
// wordt anders 6-9 bytes; met base64 is alles +33%.
const b64 = Buffer.from(html, "utf8").toString("base64");
const dataUri = `data:text/html;charset=utf-8;base64,${b64}`;

const iframe = `<iframe title="CO2-reductie rekentool" loading="lazy" style="width:100%;min-height:2600px;border:0;border-radius:24px;overflow:hidden;background:transparent;" src="${dataUri}"></iframe>\n`;

fs.writeFileSync(outPath, iframe);

const kb = (n) => (n / 1024).toFixed(1) + " KB";
console.log(`✅ Huddle data-URI embed geschreven naar:`);
console.log(`   ${outPath}\n`);
console.log(`   HTML originally:     ${kb(original)}`);
console.log(`   HTML na minify:      ${kb(minified)}`);
console.log(`   iframe-blok totaal:  ${kb(iframe.length)}`);
console.log(`   content-uri length:  ${kb(dataUri.length)}`);
console.log("");
if (iframe.length > 40 * 1024) {
  console.warn(
    "⚠️  iframe-blok is groter dan 40 KB. Huddle kan 422 'Content te lang' teruggeven."
  );
  console.warn("   Overweeg: externe CSS/JS, of kleinere inline assets.");
}
