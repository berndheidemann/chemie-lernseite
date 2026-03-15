/**
 * ionenbildung.js – Widget: Ionenbildung bei Salzen
 *
 * Schritt-für-Schritt-Animation: Elektron(en) springen von Donor → Acceptor.
 * Auswählbar: Na+Cl (1e) oder Ca+O (2e)
 *
 * @param {HTMLElement} container - Ziel-div (#widget-4)
 * @param {function} unlock
 */
export function init(container, unlock) {
  let step = 0;
  let unlockCalled = false;

  const PAIRS = {
    nacl: {
      label: 'Na + Cl',
      donor:    { symbol: 'Na', protons: 11, outerStart: 1, outerEnd: 0 },
      acceptor: { symbol: 'Cl', protons: 17, outerStart: 7, outerEnd: 8 },
      transfer: 1,
      steps: [
        { label: 'Ausgangszustand', desc: 'Na-Atom (11p, 11e – neutral) und Cl-Atom (17p, 17e – neutral). Na hat 1 Valenzelektron, Cl hat 7.' },
        { label: 'Elektronenübertragung', desc: 'Na gibt sein Außenelektron ab → Na⁺ (10e = Ne-Konfiguration). Cl nimmt es auf → Cl⁻ (18e = Ar-Konfiguration).' },
        { label: 'Ionenpaar entstand', desc: 'Na⁺ (10e, +1) und Cl⁻ (18e, −1) – beide Edelgaskonfiguration! Coulomb-Anziehung → NaCl.' },
      ],
      formula: 'Na + Cl → Na⁺ + Cl⁻',
      product: 'NaCl (Kochsalz)',
    },
    cao: {
      label: 'Ca + O',
      donor:    { symbol: 'Ca', protons: 20, outerStart: 2, outerEnd: 0 },
      acceptor: { symbol: 'O',  protons:  8, outerStart: 6, outerEnd: 8 },
      transfer: 2,
      steps: [
        { label: 'Ausgangszustand', desc: 'Ca-Atom (20p, 20e – neutral, 2. HG) und O-Atom (8p, 8e – neutral, 6. HG). Ca hat 2, O hat 6 Valenzelektronen.' },
        { label: '2 Elektronen übertragen', desc: 'Ca gibt beide Außenelektronen ab → Ca²⁺ (18e = Ar-Konfiguration). O nimmt beide auf → O²⁻ (10e = Ne-Konfiguration).' },
        { label: 'Ionenpaar entstand', desc: 'Ca²⁺ (+2) und O²⁻ (−2) – beide Edelgaskonfiguration! Starke Coulomb-Anziehung → CaO (Calciumoxid).' },
      ],
      formula: 'Ca + O → Ca²⁺ + O²⁻',
      product: 'CaO (Calciumoxid)',
    },
  };

  let currentPair = 'nacl';
  function getPair() { return PAIRS[currentPair]; }

  function render() {
    const pair = getPair();
    const { donor, acceptor, steps } = pair;
    const isStart = step === 0;
    const isDone  = step === steps.length - 1;
    const isTransfer = step === 1;

    const dCharge = step > 0 ? pair.transfer : 0;
    const aCharge = step > 0 ? -pair.transfer : 0;

    container.innerHTML = `
      <!-- Pair Selector -->
      <div style="display:flex; gap:0.5rem; justify-content:center; flex-wrap:wrap; margin-bottom:0.75rem">
        <button class="btn ${currentPair === 'nacl' ? 'btn-amber' : 'btn-secondary'}"
          id="pair-nacl" style="font-size:0.82rem; padding:0.3rem 0.8rem">Na + Cl (1e)</button>
        <button class="btn ${currentPair === 'cao' ? 'btn-amber' : 'btn-secondary'}"
          id="pair-cao" style="font-size:0.82rem; padding:0.3rem 0.8rem">Ca + O (2e)</button>
      </div>

      <div style="text-align:center; margin-bottom:0.5rem">
        <span class="badge badge-blue">Schritt ${step + 1}/${steps.length}</span>
        <span style="margin-left:0.5rem; font-size:0.85rem; color:var(--text-muted)">${steps[step].label}</span>
      </div>

      <div style="background:rgba(255,255,255,0.03); border-radius:8px; padding:0.5rem 0.75rem; font-size:0.85rem; color:var(--text-muted); text-align:center; margin-bottom:1rem">
        ${steps[step].desc}
      </div>

      <!-- Atoms display -->
      <div style="display:flex; flex-wrap:wrap; justify-content:center; align-items:center; gap:1.5rem; margin:1rem 0">
        ${drawAtom(donor.symbol, donor.protons, step === 0 ? donor.outerStart : donor.outerEnd, dCharge, true)}
        <div style="font-size:1.5rem; min-width:40px; text-align:center; transition:all 0.4s">
          ${step === 1 ? `<span style="color:var(--blue);animation:bounce 0.5s infinite">${'⚡'.repeat(pair.transfer)}</span>` : step === 2 ? '→' : '···'}
        </div>
        ${drawAtom(acceptor.symbol, acceptor.protons, step === 0 ? acceptor.outerStart : acceptor.outerEnd, aCharge, false)}
      </div>

      ${isDone ? `
        <div class="formula-box" style="text-align:center; margin:0.75rem auto; max-width:340px">
          ${pair.formula}<br>
          <span style="font-size:0.8rem; color:var(--text-muted)">Coulomb-Anziehung: ${pair.product}</span>
        </div>
      ` : ''}

      <div style="display:flex; gap:0.75rem; justify-content:center; flex-wrap:wrap; margin-top:1rem">
        ${!isDone ? `
          <button class="btn btn-amber" id="ionbild-next">
            ${step === 0 ? '⚡ Elektronen übertragen' : '✓ Weiter'}
          </button>
        ` : `
          <button class="btn btn-green" id="ionbild-done">✅ Verstanden!</button>
          <button class="btn btn-secondary" id="ionbild-reset">↺ Nochmal</button>
        `}
      </div>
      <p class="widget-hint">Beobachte, wie die Ladungen sich ändern!</p>
    `;

    document.getElementById('pair-nacl')?.addEventListener('click', () => { currentPair = 'nacl'; step = 0; render(); });
    document.getElementById('pair-cao')?.addEventListener('click',  () => { currentPair = 'cao';  step = 0; render(); });
    document.getElementById('ionbild-next')?.addEventListener('click', nextStep);
    document.getElementById('ionbild-done')?.addEventListener('click', () => {
      if (!unlockCalled) { unlockCalled = true; unlock(); }
    });
    document.getElementById('ionbild-reset')?.addEventListener('click', () => { step = 0; render(); });
  }

  function drawAtom(symbol, protons, outerElectrons, charge, isDonor) {
    const isIon = charge !== 0;
    const size = 120;
    const cx = size / 2;
    const cy = size / 2;
    const r2 = size * 0.38;

    let glowColor = 'transparent';
    if (isIon && isDonor)  glowColor = 'rgba(247,131,172,0.4)';
    if (isIon && !isDonor) glowColor = 'rgba(77,171,247,0.4)';

    const eDots = Array.from({length: Math.min(outerElectrons, 8)}, (_, i) => {
      const angle = (i / 8) * 2 * Math.PI - Math.PI / 2;
      const x = cx + r2 * Math.cos(angle);
      const y = cy + r2 * Math.sin(angle);
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5" fill="#4dabf7"/>`;
    }).join('');

    const kernColor = isDonor ? (isIon ? '#f783ac' : '#ffd43b') : (isIon ? '#4dabf7' : '#ffd43b');
    const chargeLabel = charge === 0 ? '' : charge > 0 ? (charge > 1 ? `${charge}+` : '+') : (charge < -1 ? `${Math.abs(charge)}−` : '−');

    return `
      <div style="text-align:center; flex:0 0 auto; filter:drop-shadow(0 0 8px ${glowColor})">
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          <circle cx="${cx}" cy="${cy}" r="${r2}" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1.5" stroke-dasharray="3,2"/>
          <circle cx="${cx}" cy="${cy}" r="${size*0.13}" fill="${kernColor}" opacity="0.9"/>
          <text x="${cx}" y="${cy+1}" text-anchor="middle" dominant-baseline="middle"
            font-family="monospace" font-weight="bold" font-size="11" fill="#000">${protons}</text>
          ${eDots}
          <text x="${cx}" y="${cy + r2 + 14}" text-anchor="middle" font-family="system-ui" font-weight="700" font-size="13" fill="var(--text)">${symbol}</text>
        </svg>
        <div style="margin-top:4px">
          <span class="charge-label ${charge > 0 ? 'charge-pos' : charge < 0 ? 'charge-neg' : 'charge-neutral'}">
            ${symbol}${isIon ? `<sup>${chargeLabel}</sup>` : ''}
          </span>
          <span class="badge ${isIon ? (charge > 0 ? 'badge-pink' : 'badge-blue') : 'badge-amber'}" style="margin-left:4px">
            ${isIon ? (charge > 0 ? 'Kation' : 'Anion') : 'Atom'}
          </span>
        </div>
      </div>
    `;
  }

  function nextStep() {
    const pair = getPair();
    if (step < pair.steps.length - 1) {
      step++;
      render();
      if (step === pair.steps.length - 1 && !unlockCalled) {
        unlockCalled = true;
        unlock();
      }
    }
  }

  if (!document.getElementById('ionbild-bounce-style')) {
    const style = document.createElement('style');
    style.id = 'ionbild-bounce-style';
    style.textContent = `@keyframes bounce { 0%,100%{transform:translateX(0)} 50%{transform:translateX(6px)} }`;
    document.head.appendChild(style);
  }

  render();
}
