/**
 * atom-ion.js – Widget: Atom, Ion, Kation & Anion
 *
 * AUFGABE:
 * Zeige zwei Atome nebeneinander: Natrium (Na) und Chlor (Cl).
 * Der Nutzer kann Elektronen vom Na-Atom zum Cl-Atom übertragen,
 * indem er auf Elektronen klickt oder "Elektron übertragen" drückt.
 *
 * VERHALTEN:
 * - Jedes Atom wird als Kreismodell (Bohr-Modell) mit SVG gezeichnet
 * - Na hat 1 Außenschalen-Elektron (gelb), Cl hat 7 (blau)
 * - Klick auf Na-Außenelektron: Elektron "fliegt" zu Cl
 * - Ladungsanzeige ändert sich: Na → Na⁺ (rot/pink), Cl → Cl⁻ (blau)
 * - unlock() wird aufgerufen nach der ersten Übertragung
 * - Reset-Button setzt alles zurück
 *
 * LAYOUT (mobile-first):
 * - Zwei Kreise nebeneinander (flex-wrap: wrap auf kleinen Screens)
 * - Pfeil-Animation zwischen den Atomen während Übertragung
 * - Ladungsanzeige unter jedem Atom
 * - Buttons: "Elektron übertragen" (amber) und "Zurücksetzen" (secondary)
 *
 * TECHNOLOGIE: SVG-Kreismodell + CSS-Transitions
 *
 * CSS-Variablen (aus style.css):
 *   --amber für Na/Kern-Farbe, --blue für Elektronen, --pink für Kation-Ladung
 *
 * @param {HTMLElement} container - Ziel-div (#widget-1)
 * @param {function} unlock - Callback nach erster Schlüsselinteraktion
 */
export function init(container, unlock) {
  let transferred = 0;
  let unlockCalled = false;

  // Na: 2,8,1 → Kern, Schale 1 (2e), Schale 2 (8e), Schale 3 (1e)
  // Cl: 2,8,7 → Kern, Schale 1 (2e), Schale 2 (8e), Schale 3 (7e)
  // Für das Widget zeigen wir vereinfacht nur die Außenschale

  const naConfig  = { symbol: 'Na', name: 'Natrium',  protons: 11, outer: 1 };
  const clConfig  = { symbol: 'Cl', name: 'Chlor',    protons: 17, outer: 7 };
  const maxTransfer = 1; // Na kann nur 1 Elektron abgeben

  function render() {
    const naOuter = naConfig.outer - transferred;
    const clOuter = clConfig.outer + transferred;
    const naCharge = transferred;
    const clCharge = -transferred;

    const naChargeStr = naCharge === 0 ? '±0' : `+${naCharge}`;
    const clChargeStr = clCharge === 0 ? '±0' : `${clCharge}`;
    const naType = naCharge === 0 ? 'Atom' : 'Kation';
    const clType = clCharge === 0 ? 'Atom' : 'Anion';

    container.innerHTML = `
      <p class="widget-title">Klicke auf "Elektron übertragen" um zu sehen, wie Ionen entstehen</p>

      <div style="display:flex; flex-wrap:wrap; justify-content:center; align-items:center; gap:1.5rem; margin:1rem 0">

        <!-- Na Atom -->
        <div style="text-align:center; flex:0 0 auto">
          ${drawAtomSVG('na', naConfig.symbol, naConfig.protons, naOuter, naCharge)}
          <div style="margin-top:0.5rem">
            <span class="charge-label ${naCharge > 0 ? 'charge-pos' : 'charge-neutral'}">${naConfig.symbol}${naCharge > 0 ? `<sup>${naChargeStr}</sup>` : ''}</span>
            <br>
            <span class="badge ${naCharge > 0 ? 'badge-pink' : 'badge-amber'}">${naType}</span>
          </div>
        </div>

        <!-- Arrow -->
        <div id="atom-arrow" style="font-size:2rem; color:var(--blue); transition:opacity 0.3s; opacity:${transferred > 0 ? '1' : '0.3'}">
          ${transferred > 0 ? '⚡' : '→'}
        </div>

        <!-- Cl Atom -->
        <div style="text-align:center; flex:0 0 auto">
          ${drawAtomSVG('cl', clConfig.symbol, clConfig.protons, clOuter, clCharge)}
          <div style="margin-top:0.5rem">
            <span class="charge-label ${clCharge < 0 ? 'charge-neg' : 'charge-neutral'}">${clConfig.symbol}${clCharge < 0 ? `<sup>${clChargeStr}</sup>` : ''}</span>
            <br>
            <span class="badge ${clCharge < 0 ? 'badge-blue' : 'badge-amber'}">${clType}</span>
          </div>
        </div>
      </div>

      ${transferred > 0 ? `
        <div style="text-align:center; margin:0.5rem 0; padding:0.5rem; background:rgba(81,207,102,0.1); border-radius:8px; color:var(--green); font-size:0.9rem">
          ✅ Na hat 1 Elektron abgegeben → Na⁺ (Kation) + Cl⁻ (Anion) = NaCl!
        </div>
      ` : ''}

      <div style="display:flex; gap:0.75rem; justify-content:center; flex-wrap:wrap; margin-top:1rem">
        <button class="btn btn-amber" id="atom-transfer-btn" ${transferred >= maxTransfer ? 'disabled' : ''}>
          ⚡ Elektron übertragen
        </button>
        <button class="btn btn-secondary" id="atom-reset-btn">
          ↺ Zurücksetzen
        </button>
      </div>
      <p class="widget-hint">Na gibt sein Außenelektron ab → Na⁺. Cl nimmt es auf → Cl⁻.</p>
    `;

    document.getElementById('atom-transfer-btn')?.addEventListener('click', doTransfer);
    document.getElementById('atom-reset-btn')?.addEventListener('click', doReset);
  }

  function drawAtomSVG(id, symbol, protons, outerElectrons, charge) {
    const size = Math.min(160, (window.innerWidth - 120) / 2);
    const cx = size / 2;
    const cy = size / 2;
    const r1 = size * 0.15; // inner shell radius
    const r2 = size * 0.35; // outer shell radius (simplified 2-shell model)
    const kernR = size * 0.12;

    // Color based on charge
    const kernColor = charge > 0 ? '#f783ac' : charge < 0 ? '#4dabf7' : '#ffd43b';
    const shellColor = 'rgba(255,255,255,0.1)';
    const eColor = '#4dabf7';

    // Draw electrons on outer shell
    const ePoints = [];
    for (let i = 0; i < outerElectrons; i++) {
      const angle = (i / 8) * 2 * Math.PI - Math.PI / 2; // max 8 positions
      ePoints.push({
        x: cx + r2 * Math.cos(angle),
        y: cy + r2 * Math.sin(angle)
      });
    }

    const eDots = ePoints.map(p =>
      `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${size * 0.045}" fill="${eColor}" stroke="none" class="e-dot" />`
    ).join('');

    const totalElectrons = protons - charge;
    const eCountLabel = `${protons}p / ${totalElectrons}e`;

    return `
      <svg width="${size}" height="${size + size * 0.18}" viewBox="0 0 ${size} ${size + size * 0.18}" class="atom-svg">
        <!-- Inner shell -->
        <circle cx="${cx}" cy="${cy}" r="${r1}" fill="none" stroke="${shellColor}" stroke-width="1.5" stroke-dasharray="3,2"/>
        <!-- Outer shell -->
        <circle cx="${cx}" cy="${cy}" r="${r2}" fill="none" stroke="${shellColor}" stroke-width="1.5" stroke-dasharray="3,2"/>
        <!-- Nucleus -->
        <circle cx="${cx}" cy="${cy}" r="${kernR}" fill="${kernColor}" opacity="0.9"/>
        <text x="${cx}" y="${cy + 1}" text-anchor="middle" dominant-baseline="middle"
          font-family="'Courier New',monospace" font-weight="bold" font-size="${size * 0.1}"
          fill="#000">${protons}</text>
        <!-- Outer electrons -->
        ${eDots}
        <!-- Symbol below nucleus -->
        <text x="${cx}" y="${cy + r2 + size * 0.1}" text-anchor="middle"
          font-family="system-ui,sans-serif" font-weight="700" font-size="${size * 0.13}"
          fill="var(--text)">${symbol}</text>
        <!-- Electron count label -->
        <text x="${cx}" y="${size + size * 0.14}" text-anchor="middle"
          font-family="monospace" font-size="${size * 0.09}"
          fill="rgba(123,163,192,0.8)">${eCountLabel}</text>
      </svg>
    `;
  }

  function doTransfer() {
    if (transferred >= maxTransfer) return;
    transferred++;
    render();
    if (!unlockCalled) {
      unlockCalled = true;
      unlock();
    }
  }

  function doReset() {
    transferred = 0;
    render();
  }

  render();
}
