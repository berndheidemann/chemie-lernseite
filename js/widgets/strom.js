/**
 * strom.js – Widget: Elektrischer Strom
 *
 * AUFGABE:
 * Drei-Kanal-Simulation: Metall / Salzwasser / Luft
 * Zeigt den Partikelfluss (oder dessen Ausbleiben) in einem Canvas-Widget.
 *
 * AUFBAU:
 * - Tab-Leiste: [Metall] [Salzwasser] [Luft]
 * - Canvas: Zeigt Röhre/Leiter mit animierten Partikeln
 *   - Metall: Elektronen (blaue Punkte) fließen schnell
 *   - Salzwasser: Na⁺ (pink) und Cl⁻ (blau) wandern langsam in entgegengesetzte Richtungen
 *   - Luft: KEINE Partikel – rotes X erscheint
 * - Darunter: Kurze Erklärung (1-2 Sätze)
 * - Schalter-Toggle: Stromkreis ein/aus
 *
 * UNLOCK: Nach Ausprobieren aller 3 Modi
 *
 * LAYOUT (mobile-first):
 * - Canvas: 100% Breite, max 400px, Höhe ~120px
 * - Tabs: 3 gleich breite Buttons (min-height: 48px)
 * - Touch-Events für Canvas-Interaktion
 *
 * TECHNOLOGIE: Canvas 2D API + requestAnimationFrame
 *
 * @param {HTMLElement} container - Ziel-div (#widget-3)
 * @param {function} unlock - Callback nach Interaktion mit allen 3 Modi
 */
export function init(container, unlock) {
  const seen = new Set();
  let unlockCalled = false;

  let activeMode = 'metal';
  let animFrame = null;
  let circuitOn = true;

  // Particle systems per mode
  const particles = {
    metal: [],
    water: [],
    air: []
  };

  const MODES = {
    metal: {
      label: '⚡ Metall',
      desc: 'Freie Elektronen (e⁻) bewegen sich gerichtet von − nach + → Elektronenleitung, sehr schnell.',
      carrier: 'Elektronen (e⁻)',
      speed: 'Sehr schnell',
      type: 'Elektronenleitung',
      example: 'Kupferdraht, Eisen'
    },
    water: {
      label: '🧪 Salzwasser',
      desc: 'Na⁺-Ionen wandern zur Kathode (−), Cl⁻-Ionen zur Anode (+) → Ionenleitung, langsamer.',
      carrier: 'Ionen (Na⁺, Cl⁻)',
      speed: 'Langsam',
      type: 'Ionenleitung',
      example: 'NaCl-Lösung, Blut'
    },
    air: {
      label: '💨 Luft',
      desc: 'Alle Elektronen sind in kovalenten Bindungen fest gebunden → keine freien Ladungsträger → kein Strom!',
      carrier: 'Keine',
      speed: '—',
      type: 'Isolator',
      example: 'Luft, Glas, Kunststoff'
    }
  };

  let canvas, ctx, canvasW, canvasH;

  function initParticles(mode, w, h) {
    const p = [];
    if (mode === 'metal') {
      for (let i = 0; i < 18; i++) {
        p.push({ x: Math.random() * w, y: h * 0.3 + Math.random() * h * 0.4, vx: 1.5 + Math.random(), r: 5, color: '#4dabf7', label: 'e⁻', type: 'electron' });
      }
    } else if (mode === 'water') {
      for (let i = 0; i < 8; i++) {
        p.push({ x: Math.random() * w, y: h * 0.25 + Math.random() * h * 0.25, vx: 0.7 + Math.random() * 0.5, r: 8, color: '#f783ac', label: '+', type: 'cation' });
      }
      for (let i = 0; i < 8; i++) {
        p.push({ x: Math.random() * w, y: h * 0.5 + Math.random() * h * 0.25, vx: -(0.7 + Math.random() * 0.5), r: 8, color: '#4dabf7', label: '−', type: 'anion' });
      }
    }
    particles[mode] = p;
  }

  function buildUI() {
    container.innerHTML = `
      <p class="widget-title">Wie fließt elektrischer Strom? Wähle einen Leitertyp!</p>

      <div style="display:flex; gap:0.5rem; margin-bottom:1rem">
        ${Object.entries(MODES).map(([key, m]) => `
          <button class="btn ${key === activeMode ? 'btn-primary' : 'btn-secondary'}" data-mode="${key}"
            style="flex:1; font-size:0.82rem; padding:0.5rem 0.25rem">${m.label}</button>
        `).join('')}
      </div>

      <div style="position:relative; margin-bottom:0.75rem">
        <canvas id="strom-canvas" style="width:100%; border-radius:8px; background:#0a0f1e; border:1px solid rgba(77,171,247,0.2)"></canvas>
      </div>

      <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.75rem">
        <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer; font-size:0.9rem">
          <input type="checkbox" id="strom-switch" ${circuitOn ? 'checked' : ''} style="width:18px;height:18px;cursor:pointer">
          Stromkreis einschalten
        </label>
      </div>

      <div id="strom-desc" style="background:rgba(255,255,255,0.04); border-radius:8px; padding:0.6rem 0.75rem; font-size:0.88rem;">
        ${circuitOn ? `
          <div style="color:var(--text); margin-bottom:0.35rem">${MODES[activeMode].desc}</div>
          <div style="display:flex; gap:0.4rem; flex-wrap:wrap; font-size:0.78rem">
            <span class="badge badge-blue">Träger: ${MODES[activeMode].carrier}</span>
            <span class="badge badge-amber">Typ: ${MODES[activeMode].type}</span>
            <span class="badge badge-green">Beispiel: ${MODES[activeMode].example}</span>
          </div>
        ` : '<span style="color:var(--text-muted)">🔌 Stromkreis offen – keine Ladungsträger in Bewegung.</span>'}
      </div>

      <p class="widget-hint">Probiere alle 3 Modi aus, um die Erklärung freizuschalten!</p>
    `;

    canvas = container.querySelector('#strom-canvas');
    canvasW = Math.min(canvas.parentElement.offsetWidth || window.innerWidth - 48, 500);
    canvasH = Math.max(110, Math.round(canvasW * 0.28));
    canvas.width = canvasW;
    canvas.height = canvasH;
    ctx = canvas.getContext('2d');

    initParticles(activeMode, canvasW, canvasH);

    container.querySelectorAll('[data-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeMode = btn.dataset.mode;
        seen.add(activeMode);
        if (seen.size >= 3 && !unlockCalled) {
          unlockCalled = true;
          unlock();
        }
        buildUI();
        startAnimation();
      });
      btn.addEventListener('touchend', e => { e.preventDefault(); btn.click(); });
    });

    container.querySelector('#strom-switch')?.addEventListener('change', e => {
      circuitOn = e.target.checked;
      const desc = document.getElementById('strom-desc');
      if (desc) desc.textContent = circuitOn ? MODES[activeMode].desc : '🔌 Stromkreis offen – keine Ladungsträger in Bewegung.';
    });

    seen.add(activeMode);
    if (seen.size >= 3 && !unlockCalled) { unlockCalled = true; unlock(); }
  }

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasW, canvasH);

    // Background tube
    ctx.fillStyle = '#0a0f1e';
    ctx.fillRect(0, 0, canvasW, canvasH);

    // Draw wire/tube
    ctx.strokeStyle = 'rgba(77,171,247,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvasH * 0.2);
    ctx.lineTo(canvasW, canvasH * 0.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, canvasH * 0.8);
    ctx.lineTo(canvasW, canvasH * 0.8);
    ctx.stroke();

    // Electrode indicators
    const elColor = circuitOn ? '#f75050' : '#555';
    ctx.fillStyle = elColor;
    ctx.fillRect(0, canvasH * 0.15, 10, canvasH * 0.7);
    ctx.fillStyle = circuitOn ? '#4dabf7' : '#555';
    ctx.fillRect(canvasW - 10, canvasH * 0.15, 10, canvasH * 0.7);

    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('+', 5, canvasH * 0.12);
    ctx.fillText('−', canvasW - 5, canvasH * 0.12);

    if (activeMode === 'air' || !circuitOn) {
      // Red X
      ctx.strokeStyle = '#f75050';
      ctx.lineWidth = 3;
      const cx = canvasW / 2, cy = canvasH / 2, s = 20;
      ctx.beginPath(); ctx.moveTo(cx-s, cy-s); ctx.lineTo(cx+s, cy+s); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx+s, cy-s); ctx.lineTo(cx-s, cy+s); ctx.stroke();

      ctx.fillStyle = '#f75050';
      ctx.font = '12px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(activeMode === 'air' ? 'Kein Strom – Isolator' : 'Stromkreis offen', cx, cy + 30);
      return;
    }

    // Animate particles
    const ps = particles[activeMode];
    ps.forEach(p => {
      if (circuitOn) {
        p.x += p.vx;
        if (p.vx > 0 && p.x > canvasW + p.r) p.x = -p.r;
        if (p.vx < 0 && p.x < -p.r) p.x = canvasW + p.r;
      }

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + '99';
      ctx.fill();
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${p.r < 7 ? 9 : 11}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(p.label, p.x, p.y + 4);
    });

    // Direction arrows
    if (activeMode === 'metal') {
      drawArrow(ctx, canvasW * 0.3, canvasH * 0.12, canvasW * 0.7, canvasH * 0.12, '#4dabf7', 'e⁻ →');
    } else if (activeMode === 'water') {
      drawArrow(ctx, canvasW * 0.3, canvasH * 0.09, canvasW * 0.7, canvasH * 0.09, '#f783ac', 'Na⁺ →');
      drawArrow(ctx, canvasW * 0.7, canvasH * 0.17, canvasW * 0.3, canvasH * 0.17, '#4dabf7', '← Cl⁻');
    }
  }

  function drawArrow(ctx, x1, y1, x2, y2, color, label) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    // Arrowhead
    const angle = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 8 * Math.cos(angle - 0.4), y2 - 8 * Math.sin(angle - 0.4));
    ctx.lineTo(x2 - 8 * Math.cos(angle + 0.4), y2 - 8 * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  function startAnimation() {
    if (animFrame) cancelAnimationFrame(animFrame);
    function loop() {
      draw();
      animFrame = requestAnimationFrame(loop);
    }
    loop();
  }

  // Pause animation when tab is hidden
  const visibilityHandler = () => {
    if (document.hidden) {
      if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
    } else {
      startAnimation();
    }
  };
  document.addEventListener('visibilitychange', visibilityHandler);

  // Cleanup on re-init
  container._stromCleanup = () => {
    if (animFrame) cancelAnimationFrame(animFrame);
    document.removeEventListener('visibilitychange', visibilityHandler);
  };

  buildUI();
  startAnimation();
}
