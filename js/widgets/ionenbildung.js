/**
 * ionenbildung.js – Widget: Ionenbildung bei Salzen
 *
 * AUFGABE:
 * Schritt-für-Schritt-Animation: Na-Elektron "springt" zu Cl.
 * Zeigt die Entstehung von Na⁺ und Cl⁻ visuell.
 *
 * SCHRITTE:
 * 1. Start: Na-Atom (11e, neutral) links, Cl-Atom (17e, neutral) rechts
 * 2. Animation: Das Außenelektron von Na bewegt sich als Punkt von Na → Cl
 * 3. Ende: Na⁺ (links, pink Glow) und Cl⁻ (rechts, blau Glow)
 * 4. Gleichung erscheint: Na + Cl → Na⁺ + Cl⁻
 * 5. Taste: [→ Nächster Schritt] / [↺ Nochmal]
 *
 * UNLOCK: Nach Abschluss der Animation (Schritt 3 erreicht)
 *
 * LAYOUT (mobile-first):
 * - SVG-Atome nebeneinander (flex-wrap)
 * - Animierter Elektron-Punkt (absolute-positioned div)
 * - Schritt-Anzeige oben: "Schritt 1/3"
 *
 * TECHNOLOGIE: SVG + CSS-Transitions/Animations
 *
 * @param {HTMLElement} container - Ziel-div (#widget-4)
 * @param {function} unlock
 */
export function init(container, unlock) {
  let step = 0; // 0=start, 1=transferring, 2=done
  let unlockCalled = false;
  let animating = false;

  const STEPS = [
    { label: 'Ausgangszustand', desc: 'Na-Atom (11 Protonen, 11 Elektronen) und Cl-Atom (17 Protonen, 17 Elektronen) – beide neutral.' },
    { label: 'Elektronenübertragung', desc: 'Na gibt sein Außenelektron ab. Es "springt" zu Cl.' },
    { label: 'Ionenpaar entstand', desc: 'Na⁺ (Kation) und Cl⁻ (Anion) ziehen sich an → Ionenbindung!' },
  ];

  function render() {
    const isStart = step === 0;
    const isDone  = step === 2;

    container.innerHTML = `
      <div style="text-align:center; margin-bottom:0.5rem">
        <span class="badge badge-blue">Schritt ${step + 1}/3</span>
        <span style="margin-left:0.5rem; font-size:0.85rem; color:var(--text-muted)">${STEPS[step].label}</span>
      </div>

      <div style="background:rgba(255,255,255,0.03); border-radius:8px; padding:0.5rem 0.75rem; font-size:0.85rem; color:var(--text-muted); text-align:center; margin-bottom:1rem">
        ${STEPS[step].desc}
      </div>

      <!-- Atoms display -->
      <div style="display:flex; flex-wrap:wrap; justify-content:center; align-items:center; gap:1.5rem; margin:1rem 0; position:relative">
        ${drawAtom('Na', 11, isStart ? 11 : 10, step)}
        <div id="electron-travel" style="font-size:1.5rem; min-width:40px; text-align:center; transition:all 0.4s">
          ${step === 1 ? '<span style="color:var(--blue);animation:bounce 0.5s infinite">⚡</span>' : step === 2 ? '→' : '···'}
        </div>
        ${drawAtom('Cl', 17, isStart ? 17 : 18, step)}
      </div>

      ${isDone ? `
        <div class="formula-box" style="text-align:center; margin:0.75rem auto; max-width:320px">
          Na + Cl → Na⁺ + Cl⁻<br>
          <span style="font-size:0.8rem; color:var(--text-muted)">Coulomb-Anziehung: NaCl (Kochsalz)</span>
        </div>
      ` : ''}

      <div style="display:flex; gap:0.75rem; justify-content:center; flex-wrap:wrap; margin-top:1rem">
        ${!isDone ? `
          <button class="btn btn-amber" id="ionbild-next" ${animating ? 'disabled' : ''}>
            ${step === 0 ? '⚡ Elektron übertragen' : '✓ Weiter'}
          </button>
        ` : `
          <button class="btn btn-green" id="ionbild-done">✅ Verstanden!</button>
          <button class="btn btn-secondary" id="ionbild-reset">↺ Nochmal</button>
        `}
      </div>
      <p class="widget-hint">Beobachte, wie die Ladungen sich ändern!</p>
    `;

    document.getElementById('ionbild-next')?.addEventListener('click', nextStep);
    document.getElementById('ionbild-done')?.addEventListener('click', () => {
      if (!unlockCalled) { unlockCalled = true; unlock(); }
    });
    document.getElementById('ionbild-reset')?.addEventListener('click', () => { step = 0; render(); });
  }

  function drawAtom(symbol, protons, electrons, currentStep) {
    const charge = protons - electrons;
    const isIon = charge !== 0;
    const isNa = symbol === 'Na';

    const size = 120;
    const cx = size / 2;
    const cy = size / 2;
    const r2 = size * 0.38; // outer shell

    // Glow based on ion status
    let glowColor = 'transparent';
    if (isIon && isNa) glowColor = 'rgba(247,131,172,0.4)';
    if (isIon && !isNa) glowColor = 'rgba(77,171,247,0.4)';

    const outerCount = isNa ? (currentStep === 0 ? 1 : 0) : (currentStep < 2 ? 7 : 8);

    const eDots = Array.from({length: Math.min(outerCount, 8)}, (_, i) => {
      const angle = (i / 8) * 2 * Math.PI - Math.PI / 2;
      const x = cx + r2 * Math.cos(angle);
      const y = cy + r2 * Math.sin(angle);
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5" fill="#4dabf7"/>`;
    }).join('');

    const kernColor = isNa ? (isIon ? '#f783ac' : '#ffd43b') : (isIon ? '#4dabf7' : '#ffd43b');

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
            ${symbol}${isIon ? `<sup>${charge > 0 ? '+' : '−'}</sup>` : ''}
          </span>
          <span class="badge ${isIon ? (charge > 0 ? 'badge-pink' : 'badge-blue') : 'badge-amber'}" style="margin-left:4px">
            ${isIon ? (charge > 0 ? 'Kation' : 'Anion') : 'Atom'}
          </span>
        </div>
      </div>
    `;
  }

  function nextStep() {
    if (step < 2) {
      step++;
      render();
      if (step === 2 && !unlockCalled) {
        unlockCalled = true;
        unlock();
      }
    }
  }

  // Add bounce animation
  const style = document.createElement('style');
  style.textContent = `@keyframes bounce { 0%,100%{transform:translateX(0)} 50%{transform:translateX(6px)} }`;
  document.head.appendChild(style);

  render();
}
