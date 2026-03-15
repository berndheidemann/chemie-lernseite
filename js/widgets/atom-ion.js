/**
 * atom-ion.js – Widget: Atom, Ion, Kation & Anion
 *
 * AUFGABE:
 * Zeige zwei Atome nebeneinander: auswählbar Na+Cl oder Mg+O.
 * Der Nutzer kann Elektronen übertragen und sieht wie Ionen entstehen.
 *
 * VERHALTEN:
 * - Elemenpaar-Selektor: Na+Cl (1 Elektron) oder Mg+O (2 Elektronen)
 * - Jedes Atom wird als Kreismodell (Bohr-Modell) mit SVG gezeichnet
 * - Ladungsanzeige ändert sich nach Übertragung
 * - unlock() wird aufgerufen nach der ersten Übertragung
 * - Reset-Button setzt alles zurück
 *
 * @param {HTMLElement} container - Ziel-div (#widget-1)
 * @param {function} unlock - Callback nach erster Schlüsselinteraktion
 */
export function init(container, unlock) {
  let transferred = 0;
  let unlockCalled = false;

  // Elementpaar-Konfigurationen
  const PAIRS = {
    'nacl': {
      label: 'Na + Cl → NaCl',
      donor:    { symbol: 'Na', name: 'Natrium',   protons: 11, outer: 1 },
      acceptor: { symbol: 'Cl', name: 'Chlor',     protons: 17, outer: 7 },
      maxTransfer: 1,
      product: 'NaCl (Natriumchlorid / Kochsalz)',
      donorEG:   'Ne-Konfiguration (10e)',
      acceptorEG:'Ar-Konfiguration (18e)',
    },
    'mgo': {
      label: 'Mg + O → MgO',
      donor:    { symbol: 'Mg', name: 'Magnesium', protons: 12, outer: 2 },
      acceptor: { symbol: 'O',  name: 'Sauerstoff',protons:  8, outer: 6 },
      maxTransfer: 2,
      product: 'MgO (Magnesiumoxid)',
      donorEG:   'Ne-Konfiguration (10e)',
      acceptorEG:'Ne-Konfiguration (10e)',
    }
  };

  let currentPair = 'nacl';

  function getPair() { return PAIRS[currentPair]; }

  function render() {
    const pair = getPair();
    const { donor, acceptor, maxTransfer } = pair;
    const donorOuter    = donor.outer    - transferred;
    const acceptorOuter = acceptor.outer + transferred;
    const donorCharge   = transferred;
    const acceptorCharge = -transferred;

    const donorChargeStr    = donorCharge    === 0 ? '±0' : `+${donorCharge}`;
    const acceptorChargeStr = acceptorCharge === 0 ? '±0' : `${acceptorCharge}`;
    const donorType    = donorCharge    === 0 ? 'Atom' : 'Kation';
    const acceptorType = acceptorCharge === 0 ? 'Atom' : 'Anion';

    const done = transferred >= maxTransfer;

    container.innerHTML = `
      <p class="widget-title">Wähle ein Elementpaar und übertrage Elektronen</p>

      <!-- Pair Selector -->
      <div style="display:flex; gap:0.5rem; justify-content:center; flex-wrap:wrap; margin-bottom:1rem">
        <button class="btn ${currentPair === 'nacl' ? 'btn-amber' : 'btn-secondary'}"
          id="pair-nacl" style="font-size:0.85rem; padding:0.35rem 0.85rem">
          Na + Cl
        </button>
        <button class="btn ${currentPair === 'mgo' ? 'btn-amber' : 'btn-secondary'}"
          id="pair-mgo" style="font-size:0.85rem; padding:0.35rem 0.85rem">
          Mg + O
        </button>
      </div>

      <div style="display:flex; flex-wrap:wrap; justify-content:center; align-items:center; gap:1.5rem; margin:0.5rem 0">

        <!-- Donor Atom -->
        <div style="text-align:center; flex:0 0 auto">
          ${drawAtomSVG(donor.symbol, donor.protons, donorOuter, donorCharge)}
          <div style="margin-top:0.5rem">
            <span class="charge-label ${donorCharge > 0 ? 'charge-pos' : 'charge-neutral'}">${donor.symbol}${donorCharge > 0 ? `<sup>${donorChargeStr}</sup>` : ''}</span>
            <br>
            <span class="badge ${donorCharge > 0 ? 'badge-pink' : 'badge-amber'}">${donorType}</span>
          </div>
        </div>

        <!-- Arrow -->
        <div style="font-size:2rem; color:var(--blue); transition:opacity 0.3s; opacity:${transferred > 0 ? '1' : '0.3'}">
          ${transferred > 0 ? '⚡'.repeat(transferred) : '→'}
        </div>

        <!-- Acceptor Atom -->
        <div style="text-align:center; flex:0 0 auto">
          ${drawAtomSVG(acceptor.symbol, acceptor.protons, acceptorOuter, acceptorCharge)}
          <div style="margin-top:0.5rem">
            <span class="charge-label ${acceptorCharge < 0 ? 'charge-neg' : 'charge-neutral'}">${acceptor.symbol}${acceptorCharge < 0 ? `<sup>${acceptorChargeStr}</sup>` : ''}</span>
            <br>
            <span class="badge ${acceptorCharge < 0 ? 'badge-blue' : 'badge-amber'}">${acceptorType}</span>
          </div>
        </div>
      </div>

      <!-- Step indicator for multi-transfer -->
      ${maxTransfer > 1 ? `
        <div style="text-align:center; font-size:0.85rem; color:var(--text-muted); margin:0.25rem 0">
          Übertragen: ${transferred} / ${maxTransfer} Elektronen
          ${'●'.repeat(transferred)}${'○'.repeat(maxTransfer - transferred)}
        </div>
      ` : ''}

      ${done ? `
        <div style="text-align:center; margin:0.5rem 0; padding:0.5rem; background:rgba(81,207,102,0.1); border-radius:8px; color:var(--green); font-size:0.9rem">
          ✅ ${donor.symbol} hat ${maxTransfer} Elektron${maxTransfer > 1 ? 'en' : ''} abgegeben → ${pair.product}!
        </div>
        <div style="background:rgba(255,212,59,0.06); border:1px solid rgba(255,212,59,0.2); border-radius:8px; padding:0.5rem 0.75rem; margin-bottom:0.5rem; font-size:0.82rem">
          <div style="color:var(--amber); font-weight:700; margin-bottom:0.3rem">⭐ Edelgas-Konfiguration erreicht!</div>
          <div style="display:flex; gap:0.75rem; flex-wrap:wrap">
            <span style="color:var(--pink)">
              <strong>${donor.symbol}${maxTransfer > 1 ? maxTransfer : ''}⁺</strong> (${donor.protons - maxTransfer}e)
              = <strong style="color:var(--text)">${pair.donorEG}</strong>
            </span>
            <span style="color:var(--blue)">
              <strong>${acceptor.symbol}${maxTransfer > 1 ? maxTransfer : ''}⁻</strong> (${acceptor.protons + maxTransfer}e)
              = <strong style="color:var(--text)">${pair.acceptorEG}</strong>
            </span>
          </div>
          <div style="color:var(--text-muted); margin-top:0.3rem; font-size:0.78rem">
            Oktettregel ✓ – Beide haben vollständig besetzte Außenschale → maximale Stabilität
          </div>
        </div>
      ` : ''}

      <div style="display:flex; gap:0.75rem; justify-content:center; flex-wrap:wrap; margin-top:1rem">
        <button class="btn btn-amber" id="atom-transfer-btn" ${done ? 'disabled' : ''}>
          ⚡ Elektron übertragen
        </button>
        <button class="btn btn-secondary" id="atom-reset-btn">
          ↺ Zurücksetzen
        </button>
      </div>
      <p class="widget-hint">${currentPair === 'nacl'
        ? 'Na gibt sein Außenelektron ab → Na⁺. Cl nimmt es auf → Cl⁻.'
        : 'Mg gibt beide Außenelektronen ab → Mg²⁺. O nimmt 2 auf → O²⁻.'}</p>
    `;

    document.getElementById('pair-nacl')?.addEventListener('click', () => selectPair('nacl'));
    document.getElementById('pair-mgo')?.addEventListener('click',  () => selectPair('mgo'));
    document.getElementById('atom-transfer-btn')?.addEventListener('click', doTransfer);
    document.getElementById('atom-reset-btn')?.addEventListener('click', doReset);
  }

  function drawAtomSVG(symbol, protons, outerElectrons, charge) {
    const size = Math.min(160, (window.innerWidth - 120) / 2);
    const cx = size / 2;
    const cy = size / 2;
    const r1 = size * 0.15;
    const r2 = size * 0.35;
    const kernR = size * 0.12;

    const kernColor = charge > 0 ? '#f783ac' : charge < 0 ? '#4dabf7' : '#ffd43b';
    const shellColor = 'rgba(255,255,255,0.1)';
    const eColor = '#4dabf7';

    const ePoints = [];
    for (let i = 0; i < outerElectrons; i++) {
      const angle = (i / 8) * 2 * Math.PI - Math.PI / 2;
      ePoints.push({
        x: cx + r2 * Math.cos(angle),
        y: cy + r2 * Math.sin(angle)
      });
    }

    const eDots = ePoints.map(p =>
      `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${size * 0.045}" fill="${eColor}" stroke="none" />`
    ).join('');

    const totalElectrons = protons - charge;
    const eCountLabel = `${protons}p / ${totalElectrons}e`;

    return `
      <svg width="${size}" height="${size + size * 0.18}" viewBox="0 0 ${size} ${size + size * 0.18}">
        <circle cx="${cx}" cy="${cy}" r="${r1}" fill="none" stroke="${shellColor}" stroke-width="1.5" stroke-dasharray="3,2"/>
        <circle cx="${cx}" cy="${cy}" r="${r2}" fill="none" stroke="${shellColor}" stroke-width="1.5" stroke-dasharray="3,2"/>
        <circle cx="${cx}" cy="${cy}" r="${kernR}" fill="${kernColor}" opacity="0.9"/>
        <text x="${cx}" y="${cy + 1}" text-anchor="middle" dominant-baseline="middle"
          font-family="'Courier New',monospace" font-weight="bold" font-size="${size * 0.1}"
          fill="#000">${protons}</text>
        ${eDots}
        <text x="${cx}" y="${cy + r2 + size * 0.1}" text-anchor="middle"
          font-family="system-ui,sans-serif" font-weight="700" font-size="${size * 0.13}"
          fill="var(--text)">${symbol}</text>
        <text x="${cx}" y="${size + size * 0.14}" text-anchor="middle"
          font-family="monospace" font-size="${size * 0.09}"
          fill="rgba(123,163,192,0.8)">${eCountLabel}</text>
      </svg>
    `;
  }

  function selectPair(pairKey) {
    currentPair = pairKey;
    transferred = 0;
    render();
  }

  function doTransfer() {
    const pair = getPair();
    if (transferred >= pair.maxTransfer) return;
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
