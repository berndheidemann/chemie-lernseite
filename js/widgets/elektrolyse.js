/**
 * elektrolyse.js – Widget: Elektrolyse
 *
 * AUFGABE:
 * Canvas-Animation einer Elektrolysezelle.
 * Zeigt Ionenwanderung und Produktentstehung an den Elektroden.
 *
 * SETUP: NaCl-Lösung (Chloralkali-Elektrolyse)
 * - Kathode (−, links): H₂O + 2e⁻ → H₂ + 2OH⁻
 * - Anode (+, rechts): 2Cl⁻ → Cl₂ + 2e⁻
 *
 * VERHALTEN:
 * - Canvas zeigt: Zwei Elektroden (links/rechts), Elektrolytlösung dazwischen
 * - Strom-Toggle: An/Aus
 * - Bei Strom EIN:
 *   - Na⁺-Ionen (pink) wandern zur Kathode (links)
 *   - Cl⁻-Ionen (blau) wandern zur Anode (rechts)
 *   - An Kathode: H₂-Bläschen erscheinen
 *   - An Anode: Cl₂-Bläschen erscheinen
 * - Produktanzeige: "Kathode: H₂ (gas)" / "Anode: Cl₂ (gas)" mit wachsendem Counter
 * - Reaktionsgleichungen werden eingeblendet
 * - unlock() bei erstem Strom-Einschalten
 *
 * LAYOUT (mobile-first):
 * - Canvas: 100% Breite, max 500px, Höhe ~200px
 * - Controls: [⚡ Strom ein] toggle + Produktzähler
 * - Reaktionsgleichungen in formula-box unterhalb
 *
 * TECHNOLOGIE: Canvas 2D + requestAnimationFrame
 *
 * @param {HTMLElement} container - Ziel-div (#widget-11)
 * @param {function} unlock
 */
export function init(container, unlock) {
  let unlockCalled = false;
  let stromOn = false;
  let animFrame = null;
  let canvas, ctx;
  let ions = [];
  let bubbles = [];
  let h2Count = 0, cl2Count = 0;
  let tick = 0;

  function initIons(w, h) {
    ions = [];
    const zone = { x: w * 0.18, y: h * 0.15, w: w * 0.64, h: h * 0.7 };
    for (let i = 0; i < 12; i++) {
      const isNa = i < 6;
      ions.push({
        x: zone.x + Math.random() * zone.w,
        y: zone.y + Math.random() * zone.h,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        r: 9,
        type: isNa ? 'Na+' : 'Cl-',
        color: isNa ? '#f783ac' : '#4dabf7',
        label: isNa ? 'Na⁺' : 'Cl⁻',
        targetDir: isNa ? -1 : 1, // -1 = left (cathode), 1 = right (anode)
      });
    }
    bubbles = [];
    h2Count = 0;
    cl2Count = 0;
    tick = 0;
  }

  function buildUI() {
    container.innerHTML = `
      <p class="widget-title">Elektrolyse von NaCl-Lösung (Chloralkali-Elektrolyse)</p>

      <div style="position:relative; margin-bottom:0.75rem">
        <canvas id="elyse-canvas" style="width:100%; border-radius:8px; background:#06101a; border:1px solid rgba(77,171,247,0.2)"></canvas>
      </div>

      <!-- Controls -->
      <div style="display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap; margin-bottom:0.75rem">
        <button class="btn ${stromOn ? 'btn-green' : 'btn-amber'}" id="elyse-toggle" style="min-width:160px">
          ${stromOn ? '⏹ Strom ausschalten' : '⚡ Strom einschalten'}
        </button>
        <button class="btn btn-secondary" id="elyse-reset">↺ Reset</button>
      </div>

      <!-- Product counters -->
      <div style="display:flex; gap:0.75rem; flex-wrap:wrap; margin-bottom:0.75rem">
        <div style="flex:1; min-width:120px; background:rgba(77,171,247,0.08); border:1px solid rgba(77,171,247,0.3); border-radius:8px; padding:0.5rem 0.75rem; text-align:center">
          <div style="font-size:0.75rem; color:var(--text-muted)">Kathode (−)</div>
          <div style="font-size:1.1rem; font-weight:700; color:var(--blue)">H₂ <span id="h2-count">×${h2Count}</span></div>
          <div style="font-size:0.75rem; color:var(--text-muted)">Wasserstoffgas</div>
        </div>
        <div style="flex:1; min-width:120px; background:rgba(247,131,172,0.08); border:1px solid rgba(247,131,172,0.3); border-radius:8px; padding:0.5rem 0.75rem; text-align:center">
          <div style="font-size:0.75rem; color:var(--text-muted)">Anode (+)</div>
          <div style="font-size:1.1rem; font-weight:700; color:var(--pink)">Cl₂ <span id="cl2-count">×${cl2Count}</span></div>
          <div style="font-size:0.75rem; color:var(--text-muted)">Chlorgas</div>
        </div>
      </div>

      <!-- Reactions -->
      <div class="formula-box" style="font-size:0.8rem">
        Kathode: 2 H₂O + 2 e⁻ → H₂ + 2 OH⁻ &nbsp;&nbsp;(Reduktion)<br>
        Anode:   2 Cl⁻ → Cl₂ + 2 e⁻ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(Oxidation)
      </div>

      <p class="widget-hint">LEO sagt GER: Elektronen-Abgabe = Oxidation | Elektronen-Aufnahme = Reduktion</p>
    `;

    canvas = container.querySelector('#elyse-canvas');
    const w = Math.min(canvas.parentElement.offsetWidth || 500, 560);
    const h = 200;
    canvas.width = w;
    canvas.height = h;
    ctx = canvas.getContext('2d');
    initIons(w, h);
    startAnimation();

    document.getElementById('elyse-toggle')?.addEventListener('click', () => {
      stromOn = !stromOn;
      if (stromOn && !unlockCalled) { unlockCalled = true; unlock(); }
      const btn = document.getElementById('elyse-toggle');
      if (btn) {
        btn.textContent = stromOn ? '⏹ Strom ausschalten' : '⚡ Strom einschalten';
        btn.className = `btn ${stromOn ? 'btn-green' : 'btn-amber'}`;
      }
    });

    document.getElementById('elyse-reset')?.addEventListener('click', () => {
      stromOn = false;
      buildUI();
    });
  }

  function draw() {
    if (!ctx || !canvas) return;
    const w = canvas.width, h = canvas.height;
    tick++;

    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = '#06101a';
    ctx.fillRect(0, 0, w, h);

    // Electrolyte zone (between electrodes)
    const elW = w * 0.15; // electrode width
    const zoneX = elW;
    const zoneW = w - 2 * elW;

    ctx.fillStyle = 'rgba(77,171,247,0.06)';
    ctx.fillRect(zoneX, 0, zoneW, h);
    ctx.strokeStyle = 'rgba(77,171,247,0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(zoneX, 0, zoneW, h);

    // Cathode (−, left)
    const catGrad = ctx.createLinearGradient(0, 0, elW, 0);
    catGrad.addColorStop(0, 'rgba(77,171,247,0.5)');
    catGrad.addColorStop(1, 'rgba(77,171,247,0.1)');
    ctx.fillStyle = catGrad;
    ctx.fillRect(0, 0, elW, h);
    ctx.strokeStyle = '#4dabf7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(elW, 0); ctx.lineTo(elW, h); ctx.stroke();
    ctx.fillStyle = '#4dabf7';
    ctx.font = 'bold 13px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('−', elW / 2, h / 2 - 10);
    ctx.font = '10px system-ui';
    ctx.fillText('Kathode', elW / 2, h / 2 + 6);

    // Anode (+, right)
    const anoGrad = ctx.createLinearGradient(w - elW, 0, w, 0);
    anoGrad.addColorStop(0, 'rgba(247,131,172,0.1)');
    anoGrad.addColorStop(1, 'rgba(247,131,172,0.5)');
    ctx.fillStyle = anoGrad;
    ctx.fillRect(w - elW, 0, elW, h);
    ctx.strokeStyle = '#f783ac';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w - elW, 0); ctx.lineTo(w - elW, h); ctx.stroke();
    ctx.fillStyle = '#f783ac';
    ctx.font = 'bold 13px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('+', w - elW / 2, h / 2 - 10);
    ctx.font = '10px system-ui';
    ctx.fillText('Anode', w - elW / 2, h / 2 + 6);

    // Move & draw ions
    ions.forEach(ion => {
      if (stromOn) {
        const drift = ion.targetDir * (1.2 + Math.random() * 0.3);
        ion.vx = ion.vx * 0.7 + drift * 0.3;
        ion.vy += (Math.random() - 0.5) * 0.3;
        ion.vy *= 0.9;
      } else {
        ion.vx += (Math.random() - 0.5) * 0.3;
        ion.vy += (Math.random() - 0.5) * 0.3;
        ion.vx *= 0.95;
        ion.vy *= 0.95;
      }

      ion.x += ion.vx;
      ion.y += ion.vy;

      // Bounce off zone walls
      if (ion.x < zoneX + ion.r) { ion.x = zoneX + ion.r; ion.vx = Math.abs(ion.vx); }
      if (ion.x > w - elW - ion.r) { ion.x = w - elW - ion.r; ion.vx = -Math.abs(ion.vx); }
      if (ion.y < ion.r) { ion.y = ion.r; ion.vy = Math.abs(ion.vy); }
      if (ion.y > h - ion.r) { ion.y = h - ion.r; ion.vy = -Math.abs(ion.vy); }

      // Spawn bubbles when reaching electrode
      if (stromOn && tick % 60 === 0) {
        if (ion.type === 'Cl-' && ion.x > w - elW - 20) {
          spawnBubble(w - elW - 5, ion.y, '#f783ac', 'Cl₂');
          cl2Count++;
          const el = document.getElementById('cl2-count');
          if (el) el.textContent = `×${cl2Count}`;
        }
        if (ion.type === 'Na+' && ion.x < zoneX + 20) {
          spawnBubble(zoneX + 5, ion.y, '#4dabf7', 'H₂');
          h2Count++;
          const el = document.getElementById('h2-count');
          if (el) el.textContent = `×${h2Count}`;
        }
      }

      ctx.beginPath();
      ctx.arc(ion.x, ion.y, ion.r, 0, Math.PI * 2);
      ctx.fillStyle = ion.color + '66';
      ctx.fill();
      ctx.strokeStyle = ion.color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(ion.label, ion.x, ion.y + 3);
    });

    // Draw bubbles
    bubbles = bubbles.filter(b => b.alpha > 0.05);
    bubbles.forEach(b => {
      b.y -= b.vy;
      b.alpha -= 0.012;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.strokeStyle = b.color + Math.round(b.alpha * 255).toString(16).padStart(2, '0');
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = b.color + Math.round(b.alpha * 60).toString(16).padStart(2, '0');
      ctx.fill();
      ctx.fillStyle = b.color + Math.round(b.alpha * 255).toString(16).padStart(2, '0');
      ctx.font = '7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(b.label, b.x, b.y + 3);
    });

    // Electron flow arrow in external circuit (top)
    if (stromOn) {
      ctx.strokeStyle = 'rgba(77,171,247,0.5)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(elW, 8);
      ctx.lineTo(w - elW, 8);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#4dabf7';
      ctx.font = '9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('e⁻ →', w / 2, 6);
    }
  }

  function spawnBubble(x, y, color, label) {
    for (let i = 0; i < 3; i++) {
      bubbles.push({
        x: x + (Math.random() - 0.5) * 10,
        y,
        vy: 0.8 + Math.random() * 0.5,
        r: 4 + Math.random() * 3,
        alpha: 0.8,
        color,
        label
      });
    }
  }

  function startAnimation() {
    if (animFrame) cancelAnimationFrame(animFrame);
    function loop() {
      draw();
      animFrame = requestAnimationFrame(loop);
    }
    loop();
  }

  buildUI();
}
