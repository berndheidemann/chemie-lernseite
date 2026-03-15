/**
 * ionengitter.js – Widget: Ionengitter-Explorer
 *
 * AUFGABE:
 * Interaktiver Gitter-Explorer für NaCl.
 * Tabs: [Gitter-Struktur] [Schmelzpunkt] [Sprödigkeit] [Leitfähigkeit]
 *
 * VERHALTEN (Tab 1 – Gitter):
 * - SVG-Gitter aus Na⁺ (pink) und Cl⁻ (blau) im 4×4 Muster
 * - Hover/Tap auf ein Ion: Zeigt Infoblase mit Ion-Name und Ladung
 * - Coulomb-Kraftpfeile zwischen gewähltem Ion und Nachbarn
 *
 * VERHALTEN (Tab 2 – Schmelzpunkt):
 * - Temperatur-Slider oder Animations-Button
 * - Animation: Unter 801°C fixierte Ionen; über 801°C Ionen "tanzen"
 *
 * VERHALTEN (Tab 3 – Sprödigkeit):
 * - Klick auf "Hammer" → Gitter verschiebt sich → gleich geladene Ionen treffen sich → Abstoßung sichtbar → Bruch-Animation
 *
 * VERHALTEN (Tab 4 – Leitfähigkeit):
 * - Drei States: fest/gelöst/geschmolzen
 * - Leitfähigkeits-Anzeige (Ampere-Meter)
 *
 * UNLOCK: Nach dem ersten Tab-Wechsel (hat 2 Tabs gesehen)
 *
 * LAYOUT (mobile-first):
 * - Tabs oben
 * - SVG-Gitter: max 300×300px, zentriert
 *
 * TECHNOLOGIE: SVG + CSS-Animations
 *
 * @param {HTMLElement} container - Ziel-div (#widget-5)
 * @param {function} unlock
 */
export function init(container, unlock) {
  let activeTab = 'gitter';
  let unlockCalled = false;
  let seenTabs = new Set(['gitter']);
  let selectedIon = null;
  let hammerHit = false;
  let meltMode = false;
  let conductState = 'fest'; // fest | loesung | schmelze

  const TABS = [
    { key: 'gitter', label: '🔷 Gitter' },
    { key: 'schmelz', label: '🌡 Schmelzpunkt' },
    { key: 'sproede', label: '🔨 Sprödigkeit' },
    { key: 'leitung', label: '⚡ Leitfähigkeit' },
  ];

  function checkUnlock() {
    if (seenTabs.size >= 2 && !unlockCalled) {
      unlockCalled = true;
      unlock();
    }
  }

  function render() {
    container.innerHTML = `
      <p class="widget-title">Erkunde die Eigenschaften des Ionengitters (NaCl)</p>

      <!-- Tabs -->
      <div style="display:flex; gap:0.4rem; flex-wrap:wrap; margin-bottom:1rem">
        ${TABS.map(t => `
          <button class="btn ${t.key === activeTab ? 'btn-primary' : 'btn-secondary'}"
            data-tab="${t.key}" style="flex:1; font-size:0.8rem; padding:0.45rem 0.25rem; min-height:44px">
            ${t.label}
          </button>
        `).join('')}
      </div>

      <!-- Tab Content -->
      <div id="tab-content">
        ${renderTab()}
      </div>
    `;

    container.querySelectorAll('[data-tab]').forEach(btn => {
      const handler = () => {
        activeTab = btn.dataset.tab;
        seenTabs.add(activeTab);
        hammerHit = false;
        checkUnlock();
        render();
      };
      btn.addEventListener('click', handler);
      btn.addEventListener('touchend', e => { e.preventDefault(); handler(); });
    });

    bindTabEvents();
  }

  function renderTab() {
    switch (activeTab) {
      case 'gitter':  return renderGitter();
      case 'schmelz': return renderSchmelz();
      case 'sproede': return renderSproede();
      case 'leitung': return renderLeitung();
    }
  }

  // ── Tab 1: Gitter ──
  function renderGitter() {
    const size = Math.min(280, (window.innerWidth - 80));
    const cols = 5, rows = 5;
    const cellSize = size / cols;
    const r = cellSize * 0.35;

    let ions = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const isNa = (row + col) % 2 === 0;
        const cx = cellSize * col + cellSize / 2;
        const cy = cellSize * row + cellSize / 2;
        ions.push({ id: `${row}-${col}`, cx, cy, isNa, row, col });
      }
    }

    const svgIons = ions.map(ion => {
      const isSelected = selectedIon === ion.id;
      const color = ion.isNa ? '#f783ac' : '#4dabf7';
      const label = ion.isNa ? 'Na⁺' : 'Cl⁻';
      return `
        <g class="gitter-ion" data-ion="${ion.id}" style="cursor:pointer">
          <circle cx="${ion.cx}" cy="${ion.cy}" r="${r}"
            fill="${color}${isSelected ? '' : '55'}" stroke="${color}" stroke-width="${isSelected ? 2.5 : 1.5}"
            ${isSelected ? `filter="url(#glow)"` : ''}/>
          <text x="${ion.cx}" y="${ion.cy + 4}" text-anchor="middle" dominant-baseline="middle"
            font-size="${cellSize * 0.22}" font-weight="bold" font-family="monospace" fill="#fff" pointer-events="none">
            ${label}
          </text>
        </g>
      `;
    }).join('');

    // Coulomb arrows from selected ion
    let arrows = '';
    if (selectedIon) {
      const sel = ions.find(i => i.id === selectedIon);
      if (sel) {
        ions.filter(n => {
          const dr = Math.abs(n.row - sel.row), dc = Math.abs(n.col - sel.col);
          return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
        }).forEach(neighbor => {
          const color = sel.isNa !== neighbor.isNa ? '#51cf66' : '#f75050';
          const label = sel.isNa !== neighbor.isNa ? '▶' : '◀';
          const midX = (sel.cx + neighbor.cx) / 2;
          const midY = (sel.cy + neighbor.cy) / 2;
          arrows += `
            <line x1="${sel.cx}" y1="${sel.cy}" x2="${neighbor.cx}" y2="${neighbor.cy}"
              stroke="${color}" stroke-width="1.5" stroke-dasharray="3,2" opacity="0.8"/>
            <text x="${midX}" y="${midY - 4}" text-anchor="middle" font-size="10" fill="${color}" font-weight="bold">${label}</text>
          `;
        });
      }
    }

    // Tooltip
    let tooltip = '';
    if (selectedIon) {
      const sel = ions.find(i => i.id === selectedIon);
      if (sel) {
        tooltip = `<div style="margin-top:0.5rem; background:rgba(0,0,0,0.4); border-radius:8px; padding:0.5rem 0.75rem; font-size:0.85rem; color:var(--text)">
          ${sel.isNa
            ? '🔴 <strong>Na⁺</strong> – Natrium-Kation: 11 Protonen, 10 Elektronen, Ladung +1'
            : '🔵 <strong>Cl⁻</strong> – Chlorid-Anion: 17 Protonen, 18 Elektronen, Ladung −1'}
          <br><span style="color:var(--text-muted); font-size:0.8rem">Grün = Anziehung, Rot = Abstoßung</span>
        </div>`;
      }
    }

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="display:block; margin:0 auto; overflow:visible">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>
        ${arrows}
        ${svgIons}
      </svg>
      ${tooltip}
      <!-- 3 Eigenschaften von Salzen (Lernzettel Punkt 5) -->
      <div style="display:flex; gap:0.4rem; flex-wrap:wrap; margin-top:0.75rem">
        <span class="badge badge-amber" style="flex:1; min-width:100px; text-align:center; padding:5px 6px; font-size:0.75rem; text-transform:none; letter-spacing:0">🌡 Hoher Schmelzpunkt</span>
        <span class="badge badge-pink" style="flex:1; min-width:80px; text-align:center; padding:5px 6px; font-size:0.75rem; text-transform:none; letter-spacing:0">🔨 Spröde</span>
        <span class="badge badge-blue" style="flex:1; min-width:110px; text-align:center; padding:5px 6px; font-size:0.75rem; text-transform:none; letter-spacing:0">⚡ Leitet in Lösung/Schmelze</span>
      </div>
      <p class="widget-hint">Tippe auf ein Ion, um die Coulomb-Kräfte zu sehen · Tabs erklären alle 3 Eigenschaften</p>
      <div style="margin-top:0.5rem; background:rgba(77,171,247,0.06); border:1px solid rgba(77,171,247,0.2); border-radius:8px; padding:0.5rem 0.75rem; font-size:0.8rem; color:var(--text-muted)">
        <strong style="color:var(--blue)">Merkhilfe:</strong>
        Jedes Ion wird von 6 Nachbarionen der entgegengesetzten Ladung umgeben (oktaedrisch). Je größer die Ladungsdifferenz und je kleiner der Abstand, desto stärker die Coulomb-Kraft!
      </div>
    `;
  }

  // ── Tab 2: Schmelzpunkt ──
  function renderSchmelz() {
    return `
      <div style="text-align:center; padding:1rem 0">
        <div style="font-size:2.5rem; margin-bottom:0.5rem">${meltMode ? '🌊' : '🧊'}</div>
        <div style="font-size:1.1rem; font-weight:700; color:${meltMode ? '#f783ac' : '#4dabf7'}; margin-bottom:0.5rem">
          NaCl – ${meltMode ? 'Schmelze (>801°C)' : 'Festkörper (<801°C)'}
        </div>
        <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1.25rem">
          ${meltMode
            ? 'Bei 801°C werden die Gitterkräfte überwunden – Ionen werden frei beweglich!'
            : 'Starke Coulomb-Kräfte halten das Gitter zusammen. Schmelzpunkt: 801°C (NaCl).'}
        </div>

        ${renderMeltSVG()}

        <button class="btn ${meltMode ? 'btn-secondary' : 'btn-amber'}" id="melt-toggle" style="margin-top:1rem">
          ${meltMode ? '❄️ Abkühlen' : '🌡 Auf 801°C erhitzen'}
        </button>
      </div>
    `;
  }

  function renderMeltSVG() {
    const w = Math.min(250, window.innerWidth - 80);
    const h = 80;
    const ions = [];
    for (let i = 0; i < 12; i++) {
      const x = 20 + (i % 6) * 38;
      const y = 20 + Math.floor(i / 6) * 38;
      const dx = meltMode ? (Math.random() - 0.5) * 20 : 0;
      const dy = meltMode ? (Math.random() - 0.5) * 20 : 0;
      const isNa = i % 2 === 0;
      ions.push({ x: x + dx, y: y + dy, isNa });
    }

    return `<svg width="${w}" height="${h + 20}" style="display:block;margin:0 auto">
      ${ions.map(ion => `
        <circle cx="${ion.x}" cy="${ion.y}" r="13"
          fill="${ion.isNa ? '#f783ac' : '#4dabf7'}55"
          stroke="${ion.isNa ? '#f783ac' : '#4dabf7'}" stroke-width="1.5"
          style="${meltMode ? 'animation:float-ion 0.8s ease-in-out infinite alternate' : ''}">
          ${meltMode ? '<animate attributeName="cx" values="'+ion.x+';'+(ion.x+6)+';'+ion.x+'" dur="'+(0.5+Math.random()*0.5)+'s" repeatCount="indefinite"/>' : ''}
          ${meltMode ? '<animate attributeName="cy" values="'+ion.y+';'+(ion.y+6)+';'+ion.y+'" dur="'+(0.4+Math.random()*0.5)+'s" repeatCount="indefinite"/>' : ''}
        </circle>
        <text x="${ion.x}" y="${ion.y+4}" text-anchor="middle" font-size="8" font-family="monospace" fill="#fff" pointer-events="none">
          ${ion.isNa ? 'Na⁺' : 'Cl⁻'}
        </text>
      `).join('')}
    </svg>`;
  }

  // ── Tab 3: Sprödigkeit ──
  function renderSproede() {
    return `
      <div style="text-align:center; padding:0.5rem 0">
        <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem">
          ${!hammerHit
            ? 'Was passiert, wenn man einen Ionenkristall schlägt?'
            : 'Beim Verschieben kommen gleich geladene Ionen nebeneinander → Abstoßung → Bruch!'}
        </div>
        ${renderSprödeSVG()}
        <button class="btn btn-amber" id="hammer-btn" style="margin-top:1rem" ${hammerHit ? 'disabled' : ''}>
          🔨 Hammer! Schlag auf den Kristall
        </button>
        ${hammerHit ? `<button class="btn btn-secondary" id="sproede-reset" style="margin-top:0.5rem">↺ Nochmal</button>` : ''}
      </div>
    `;
  }

  function renderSprödeSVG() {
    const w = Math.min(280, window.innerWidth - 80);
    const h = 90;
    const shift = hammerHit ? 28 : 0;

    const ions = [];
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 5; col++) {
        const isNa = (row + col) % 2 === 0;
        const x = 28 + col * 44 + (row === 1 ? shift : 0);
        const y = 18 + row * 44;
        ions.push({ x, y, isNa, row });
      }
    }

    const crackLine = hammerHit ? `<line x1="${w/2}" y1="0" x2="${w/2 + 15}" y2="${h + 10}" stroke="#f75050" stroke-width="2" stroke-dasharray="4,2" opacity="0.9"/>` : '';

    return `<svg width="${w}" height="${h}" style="display:block;margin:0 auto">
      ${crackLine}
      ${ions.map(ion => `
        <circle cx="${ion.x}" cy="${ion.y}" r="16"
          fill="${ion.isNa ? '#f783ac' : '#4dabf7'}55"
          stroke="${ion.isNa ? '#f783ac' : '#4dabf7'}" stroke-width="1.5"/>
        <text x="${ion.x}" y="${ion.y+4}" text-anchor="middle" font-size="9" font-family="monospace" fill="#fff">
          ${ion.isNa ? 'Na⁺' : 'Cl⁻'}
        </text>
      `).join('')}
    </svg>`;
  }

  // ── Tab 4: Leitfähigkeit ──
  function renderLeitung() {
    const states = [
      { key: 'fest', label: '🔒 Fest', conducts: false, reason: 'Ionen im Gitter fixiert – kein Transport möglich' },
      { key: 'loesung', label: '💧 In Lösung', conducts: true, reason: 'Na⁺ und Cl⁻ frei beweglich – Ionenleitung!' },
      { key: 'schmelze', label: '🌊 Schmelze', conducts: true, reason: 'Ionen frei beweglich – Ionenleitung!' },
    ];

    const current = states.find(s => s.key === conductState);

    return `
      <div style="display:flex; gap:0.5rem; justify-content:center; margin-bottom:1rem; flex-wrap:wrap">
        ${states.map(s => `
          <button class="btn ${s.key === conductState ? 'btn-primary' : 'btn-secondary'}" data-state="${s.key}"
            style="font-size:0.82rem; min-height:44px">${s.label}</button>
        `).join('')}
      </div>

      <!-- Meter -->
      <div style="text-align:center; margin-bottom:0.75rem">
        <div style="width:120px; height:120px; border-radius:50%; border:4px solid ${current.conducts ? 'var(--green)' : '#f75050'};
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          background:rgba(0,0,0,0.3); margin:0 auto; transition:border-color 0.3s">
          <div style="font-size:2rem">${current.conducts ? '⚡' : '🚫'}</div>
          <div style="font-size:0.8rem; font-weight:700; color:${current.conducts ? 'var(--green)' : '#f75050'}">
            ${current.conducts ? 'LEITET' : 'ISOLIERT'}
          </div>
        </div>
      </div>

      <div style="background:rgba(255,255,255,0.04); border-radius:8px; padding:0.6rem 0.75rem; font-size:0.85rem; color:var(--text-muted); text-align:center">
        ${current.reason}
      </div>
    `;
  }

  function bindTabEvents() {
    // Gitter: ion clicks
    container.querySelectorAll('.gitter-ion').forEach(ion => {
      const handler = () => {
        selectedIon = selectedIon === ion.dataset.ion ? null : ion.dataset.ion;
        render();
      };
      ion.addEventListener('click', handler);
      ion.addEventListener('touchend', e => { e.preventDefault(); handler(); });
    });

    // Schmelz: melt toggle
    document.getElementById('melt-toggle')?.addEventListener('click', () => {
      meltMode = !meltMode;
      render();
    });

    // Sprödigkeit
    document.getElementById('hammer-btn')?.addEventListener('click', () => {
      hammerHit = true;
      render();
    });
    document.getElementById('sproede-reset')?.addEventListener('click', () => {
      hammerHit = false;
      render();
    });

    // Leitfähigkeit
    container.querySelectorAll('[data-state]').forEach(btn => {
      btn.addEventListener('click', () => {
        conductState = btn.dataset.state;
        render();
      });
    });
  }

  render();
}
