/**
 * metallbindung.js – Widget: Metallbindung & Elektronen-See
 *
 * AUFGABE:
 * Canvas-Simulation: Zeigt Metall-Ionen im Gitter (gelbe Kreise)
 * und frei bewegliche Elektronen (blaue Punkte, zufällige Bewegung).
 * Interaktion: Kristall verformen (ziehen) zeigt Duktilität.
 *
 * VERHALTEN:
 * - Canvas-Animation: Elektronen-Punkte bewegen sich zufällig
 * - Metall-Ionen im Gitter bleiben (grob) an Position
 * - [Strom anlegen] Toggle: Elektronen beginnen, gerichtet zu fließen
 * - [Gitter verformen] Button: Gitter-Schichten verschieben sich + Elektronen passen sich an
 *   → Vergleich-Text: "Metall bricht nicht – im Gegensatz zu Salzkristall!"
 * - unlock() nach erstem Strom-Anlegen oder Verformen
 *
 * LAYOUT (mobile-first):
 * - Canvas: 100% Breite, max 420px, Höhe ~180px
 * - Controls darunter: [⚡ Strom anlegen] [🔧 Verformen] [↺ Reset]
 * - Live-Anzeige: "Ladungsträger: Elektronen | Leitfähigkeit: ✅ hoch"
 *
 * TECHNOLOGIE: Canvas 2D + requestAnimationFrame
 *
 * @param {HTMLElement} container - Ziel-div (#widget-8)
 * @param {function} unlock
 */
export function init(container, unlock) {
  let unlockCalled = false;
  let stromOn = false;
  let deformed = false;
  let animFrame = null;
  let canvas, ctx;

  const GRID_ROWS = 3;
  const GRID_COLS = 6;
  let ionPositions = [];
  let electrons = [];

  function initPhysics(w, h) {
    ionPositions = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const baseX = (w / (GRID_COLS + 1)) * (col + 1);
        const baseY = (h / (GRID_ROWS + 1)) * (row + 1);
        const shiftX = deformed && row === 1 ? w * 0.12 : 0;
        ionPositions.push({ x: baseX + shiftX, y: baseY, baseX, baseY });
      }
    }

    electrons = [];
    for (let i = 0; i < 22; i++) {
      electrons.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        r: 4
      });
    }
  }

  function buildUI() {
    container.innerHTML = `
      <p class="widget-title">Elektronen-See-Modell der Metalle</p>
      <div style="position:relative; margin-bottom:0.75rem">
        <canvas id="metall-canvas" style="width:100%; border-radius:8px; background:#080e1a; border:1px solid rgba(255,212,59,0.2)"></canvas>
      </div>

      <!-- Status bar -->
      <div style="display:flex; gap:0.75rem; flex-wrap:wrap; margin-bottom:0.75rem; font-size:0.82rem">
        <span style="background:rgba(255,212,59,0.1); border:1px solid rgba(255,212,59,0.3); border-radius:6px; padding:3px 8px; color:var(--amber)">
          🔶 Kationen: ${GRID_ROWS * GRID_COLS} Na⁺
        </span>
        <span style="background:rgba(77,171,247,0.1); border:1px solid rgba(77,171,247,0.3); border-radius:6px; padding:3px 8px; color:var(--blue)">
          🔵 Elektronen: frei beweglich
        </span>
        <span style="background:${stromOn ? 'rgba(81,207,102,0.1)' : 'rgba(255,255,255,0.05)'}; border:1px solid ${stromOn ? 'var(--green)' : 'rgba(255,255,255,0.1)'}; border-radius:6px; padding:3px 8px; color:${stromOn ? 'var(--green)' : 'var(--text-muted)'}">
          ⚡ ${stromOn ? 'Strom: FLIESSEND' : 'Strom: AUS'}
        </span>
      </div>

      <div style="display:flex; gap:0.75rem; flex-wrap:wrap; justify-content:center; margin-bottom:0.5rem">
        <button class="btn ${stromOn ? 'btn-green' : 'btn-amber'}" id="metall-strom">
          ${stromOn ? '⏹ Strom aus' : '⚡ Strom anlegen'}
        </button>
        <button class="btn ${deformed ? 'btn-secondary' : 'btn-secondary'}" id="metall-deform">
          ${deformed ? '↺ Gitter zurück' : '🔧 Gitter verformen'}
        </button>
      </div>

      ${deformed ? `
        <div style="background:rgba(81,207,102,0.1); border:1px solid rgba(81,207,102,0.3); border-radius:8px; padding:0.6rem 0.75rem; font-size:0.85rem; color:var(--green); text-align:center; margin-top:0.5rem">
          ✅ Das Metall bricht nicht! Elektronen passen sich an → Metall ist duktil (verformbar).
        </div>
      ` : ''}

      <p class="widget-hint">Vergleich: Salzkristall würde bei gleicher Verformung brechen (Abstoßung gleicher Ladungen)</p>
    `;

    canvas = container.querySelector('#metall-canvas');
    const w = Math.min(canvas.parentElement.offsetWidth || window.innerWidth - 48, 520);
    const h = Math.max(150, Math.round(w * 0.36));
    canvas.width = w;
    canvas.height = h;
    ctx = canvas.getContext('2d');

    initPhysics(w, h);
    startAnimation();

    document.getElementById('metall-strom')?.addEventListener('click', () => {
      stromOn = !stromOn;
      if (!unlockCalled) { unlockCalled = true; unlock(); }
      buildUI();
    });

    document.getElementById('metall-deform')?.addEventListener('click', () => {
      deformed = !deformed;
      if (!unlockCalled) { unlockCalled = true; unlock(); }
      buildUI();
    });
  }

  function draw() {
    if (!ctx || !canvas) return;
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = '#080e1a';
    ctx.fillRect(0, 0, w, h);

    // Move electrons
    electrons.forEach(e => {
      if (stromOn) {
        e.vx = Math.abs(e.vx) * 0.95 + 1.2; // Drift right (conventional: electrons left, but visually right)
      } else {
        // Random walk with slight damping
        e.vx += (Math.random() - 0.5) * 0.4;
        e.vy += (Math.random() - 0.5) * 0.4;
        e.vx *= 0.95;
        e.vy *= 0.95;
        e.vx = Math.max(-2.5, Math.min(2.5, e.vx));
        e.vy = Math.max(-2.5, Math.min(2.5, e.vy));
      }

      e.x += e.vx;
      e.y += e.vy;

      // Wrap around
      if (e.x > w + e.r) e.x = -e.r;
      if (e.x < -e.r) e.x = w + e.r;
      if (e.y > h + e.r) e.y = -e.r;
      if (e.y < -e.r) e.y = h + e.r;
    });

    // Draw ions
    ionPositions.forEach(ion => {
      // Glow
      const grad = ctx.createRadialGradient(ion.x, ion.y, 0, ion.x, ion.y, 18);
      grad.addColorStop(0, 'rgba(255,212,59,0.4)');
      grad.addColorStop(1, 'rgba(255,212,59,0)');
      ctx.beginPath();
      ctx.arc(ion.x, ion.y, 18, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(ion.x, ion.y, 11, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd43b44';
      ctx.fill();
      ctx.strokeStyle = '#ffd43b';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#ffd43b';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('+', ion.x, ion.y + 3);
    });

    // Draw electrons
    electrons.forEach(e => {
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.fillStyle = '#4dabf7bb';
      ctx.fill();
      ctx.strokeStyle = '#4dabf7';
      ctx.lineWidth = 1;
      ctx.stroke();

      if (stromOn) {
        // Velocity trail
        ctx.beginPath();
        ctx.moveTo(e.x, e.y);
        ctx.lineTo(e.x - e.vx * 4, e.y - e.vy * 4);
        ctx.strokeStyle = 'rgba(77,171,247,0.3)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });

    // Direction arrow when strom on
    if (stromOn) {
      ctx.strokeStyle = '#4dabf7';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      ctx.moveTo(10, h - 15);
      ctx.lineTo(w - 10, h - 15);
      ctx.stroke();
      ctx.setLineDash([]);

      // Arrowhead
      ctx.fillStyle = '#4dabf7';
      ctx.beginPath();
      ctx.moveTo(w - 10, h - 15);
      ctx.lineTo(w - 18, h - 20);
      ctx.lineTo(w - 18, h - 10);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#4dabf7';
      ctx.font = '10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('e⁻ Fluss', w / 2, h - 5);
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

  // Pause when tab hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
    } else if (canvas) {
      startAnimation();
    }
  });

  buildUI();
}
