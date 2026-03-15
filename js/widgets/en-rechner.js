/**
 * en-rechner.js – Widget: Elektronegativität (EN) & ΔEN
 *
 * AUFGABE:
 * EN-Rechner: Der Nutzer wählt zwei Elemente, ΔEN wird berechnet,
 * Bindungstyp wird angezeigt. Für Thema 9+10.
 *
 * EN-DATEN (Pauling-Skala):
 * H: 2.1, Li: 1.0, Be: 1.5, B: 2.0, C: 2.5, N: 3.0, O: 3.5, F: 4.0,
 * Na: 0.9, Mg: 1.2, Al: 1.5, Si: 1.8, P: 2.1, S: 2.5, Cl: 3.0,
 * K: 0.8, Ca: 1.0, Br: 2.8, I: 2.5
 *
 * VERHALTEN:
 * - Zwei Dropdown-Menüs: Element A und Element B auswählen
 * - Live-Berechnung: ΔEN = |EN(A) - EN(B)|
 * - Bindungstyp-Klassifikation:
 *   - ΔEN = 0: unpolare Bindung
 *   - 0 < ΔEN < 1.7: polare kovalente Bindung
 *   - ΔEN ≥ 1.7: Ionenbindung
 * - Visualisierung: Horizontaler Gradient-Balken
 *   Links = unpolar (grün), Mitte = polar (amber), Rechts = ionisch (pink)
 *   Mit Marker an der berechneten Position
 * - Pfeil-Diagramm: Zeigt δ+ und δ− bei polarer Bindung
 * - unlock() bei erster Berechnung (Änderung eines Elements)
 *
 * LAYOUT (mobile-first):
 * - Zwei <select> nebeneinander (flex-wrap auf kleinen Screens)
 * - Gradient-Balken darunter (100% Breite)
 * - Ergebnis-Karte mit Bindungstyp
 *
 * TECHNOLOGIE: DOM + CSS
 *
 * @param {HTMLElement} container - Ziel-div (#widget-9)
 * @param {function} unlock - Callback nach erster ΔEN-Berechnung
 */
export function init(container, unlock) {
  let unlockCalled = false;

  const EN_DATA = {
    H:  { en: 2.1, name: 'Wasserstoff' },
    Li: { en: 1.0, name: 'Lithium' },
    Be: { en: 1.5, name: 'Beryllium' },
    B:  { en: 2.0, name: 'Bor' },
    C:  { en: 2.5, name: 'Kohlenstoff' },
    N:  { en: 3.0, name: 'Stickstoff' },
    O:  { en: 3.5, name: 'Sauerstoff' },
    F:  { en: 4.0, name: 'Fluor' },
    Na: { en: 0.9, name: 'Natrium' },
    Mg: { en: 1.2, name: 'Magnesium' },
    Al: { en: 1.5, name: 'Aluminium' },
    Si: { en: 1.8, name: 'Silizium' },
    P:  { en: 2.1, name: 'Phosphor' },
    S:  { en: 2.5, name: 'Schwefel' },
    Cl: { en: 3.0, name: 'Chlor' },
    K:  { en: 0.9, name: 'Kalium' },
    Ca: { en: 1.0, name: 'Calcium' },
    Br: { en: 2.8, name: 'Brom' },
    I:  { en: 2.5, name: 'Iod' },
  };

  let elemA = 'K';
  let elemB = 'F';

  function getBondType(den) {
    if (den === 0) return { type: 'Unpolare Bindung', color: 'var(--green)', icon: '⚖️', desc: 'Elektronen gleichmäßig verteilt' };
    if (den < 1.7) return { type: 'Polare kovalente Bindung', color: 'var(--amber)', icon: '🔀', desc: `Elektronen zum elektronegativen Atom verschoben (δ+ und δ−)` };
    return { type: 'Ionenbindung', color: 'var(--pink)', icon: '⚡', desc: 'Praktisch vollständige Elektronenübertragung' };
  }

  function render() {
    const enA = EN_DATA[elemA].en;
    const enB = EN_DATA[elemB].en;
    const delta = Math.abs(enA - enB);
    const bond = getBondType(delta);

    // Which atom is more electronegative?
    const moreEN = enA >= enB ? elemA : elemB;
    const lessEN = enA >= enB ? elemB : elemA;
    const isPolar = delta > 0 && delta < 1.7;
    const isIonic = delta >= 1.7;

    container.innerHTML = `
      <p class="widget-title">Elektronegativität & Bindungstyp-Rechner</p>

      <!-- Element Selectors -->
      <div style="display:flex; flex-wrap:wrap; gap:0.75rem; margin-bottom:1.25rem; align-items:flex-end">
        <div style="flex:1; min-width:120px">
          <label style="font-size:0.8rem; color:var(--text-muted); display:block; margin-bottom:4px">Element A</label>
          <select class="element-select" id="en-elem-a">
            ${Object.entries(EN_DATA).map(([sym, d]) =>
              `<option value="${sym}" ${sym === elemA ? 'selected' : ''}>${sym} – ${d.name} (EN: ${d.en})</option>`
            ).join('')}
          </select>
        </div>
        <div style="font-size:1.5rem; color:var(--text-muted); padding-bottom:4px; flex-shrink:0">+</div>
        <div style="flex:1; min-width:120px">
          <label style="font-size:0.8rem; color:var(--text-muted); display:block; margin-bottom:4px">Element B</label>
          <select class="element-select" id="en-elem-b">
            ${Object.entries(EN_DATA).map(([sym, d]) =>
              `<option value="${sym}" ${sym === elemB ? 'selected' : ''}>${sym} – ${d.name} (EN: ${d.en})</option>`
            ).join('')}
          </select>
        </div>
      </div>

      <!-- EN Values Display -->
      <div style="display:flex; gap:0.5rem; justify-content:center; flex-wrap:wrap; margin-bottom:1rem">
        <span style="background:rgba(255,212,59,0.1); border:1px solid rgba(255,212,59,0.3); border-radius:6px; padding:4px 10px; font-family:monospace">
          EN(${elemA}) = ${enA}
        </span>
        <span style="color:var(--text-muted); padding:4px 0">|</span>
        <span style="background:rgba(77,171,247,0.1); border:1px solid rgba(77,171,247,0.3); border-radius:6px; padding:4px 10px; font-family:monospace">
          EN(${elemB}) = ${enB}
        </span>
        <span style="color:var(--text-muted); padding:4px 0">→</span>
        <span style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); border-radius:6px; padding:4px 10px; font-family:monospace; font-weight:700; color:var(--text)">
          ΔEN = ${delta.toFixed(1)}
        </span>
      </div>

      <!-- Gradient Bar -->
      ${renderGradientBar(delta)}

      <!-- Bond Type Result -->
      <div style="background:rgba(255,255,255,0.04); border:1px solid ${bond.color}44; border-radius:10px; padding:0.75rem 1rem; text-align:center; margin-bottom:0.75rem">
        <div style="font-size:1.5rem">${bond.icon}</div>
        <div style="font-size:1.1rem; font-weight:700; color:${bond.color}; margin:0.25rem 0">${bond.type}</div>
        <div style="font-size:0.85rem; color:var(--text-muted)">${bond.desc}</div>
      </div>

      <!-- Polar Bond Visualization -->
      ${isPolar ? renderPolarViz(elemA, elemB, enA, enB) : ''}
      ${isIonic ? renderIonicViz(lessEN, moreEN) : ''}

      <!-- Lernzettel-Beispiele -->
      ${(() => {
        const pair = [elemA, elemB].sort().join('-');
        const notes = {
          'F-K':  { calc: 'EN K = 0,9 ; EN F = 4,0 → ΔEN = 4,0 − 0,9 = 3,1', result: 'Da ΔEN > 1,7 → Ionenbindung', color: 'var(--pink)' },
          'Cl-Na':{ calc: 'EN Na = 0,9 ; EN Cl = 3,0 → ΔEN = 3,0 − 0,9 = 2,1', result: 'Da ΔEN > 1,7 → Ionenbindung (NaCl)', color: 'var(--pink)' },
          'Cl-H': { calc: 'EN H = 2,1 ; EN Cl = 3,0 → ΔEN = 3,0 − 2,1 = 0,9', result: '0 < ΔEN < 1,7 → Polare Bindung (HCl)', color: 'var(--amber)' },
          'H-H':  { calc: 'EN H = 2,1 ; EN H = 2,1 → ΔEN = 2,1 − 2,1 = 0', result: 'ΔEN = 0 → Unpolare Bindung (H₂)', color: 'var(--green)' },
        };
        const n = notes[pair];
        if (!n) return '';
        return `<div style="background:rgba(255,212,59,0.08); border:1px solid rgba(255,212,59,0.3); border-radius:8px; padding:0.65rem 0.75rem; font-size:0.85rem; margin-bottom:0.75rem">
          <span style="color:var(--amber); font-weight:700">📋 Lernzettel-Beispiel:</span>
          <span style="font-family:monospace; color:var(--text)"> ${n.calc}</span><br>
          <span style="color:${n.color}; font-weight:600">${n.result}</span>
        </div>`;
      })()}

      <!-- Quick Examples -->
      <div style="margin-bottom:0.75rem">
        <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:0.35rem">Schnellbeispiele:</div>
        <div style="display:flex; gap:0.4rem; flex-wrap:wrap">
          ${[['Na','Cl','NaCl'],['K','F','KF'],['H','Cl','HCl'],['H','H','H₂'],['O','O','O₂'],['N','O','NO']].map(([a,b,label]) =>
            `<button class="btn btn-secondary" data-qa="${a}" data-qb="${b}" style="font-size:0.78rem; padding:3px 10px; min-height:30px; font-family:monospace">${label}</button>`
          ).join('')}
        </div>
      </div>

      <p class="widget-hint">ΔEN &lt; 1,7 = kovalent | ΔEN ≥ 1,7 = Ionenbindung</p>
    `;

    document.getElementById('en-elem-a')?.addEventListener('change', e => {
      elemA = e.target.value;
      if (!unlockCalled) { unlockCalled = true; unlock(); }
      render();
    });

    document.getElementById('en-elem-b')?.addEventListener('change', e => {
      elemB = e.target.value;
      if (!unlockCalled) { unlockCalled = true; unlock(); }
      render();
    });

    container.querySelectorAll('[data-qa]').forEach(btn => {
      btn.addEventListener('click', () => {
        elemA = btn.dataset.qa;
        elemB = btn.dataset.qb;
        if (!unlockCalled) { unlockCalled = true; unlock(); }
        render();
      });
    });
  }

  function renderGradientBar(delta) {
    const maxDen = 3.3;
    const position = Math.min((delta / maxDen) * 100, 100);

    return `
      <div style="margin-bottom:1rem">
        <div style="position:relative; height:24px; border-radius:12px; overflow:hidden;
          background: linear-gradient(to right, var(--green) 0%, var(--green) 30%, var(--amber) 45%, var(--amber) 55%, var(--pink) 70%, var(--pink) 100%);
          margin-bottom:6px">
          <!-- Marker -->
          <div style="position:absolute; top:0; left:${position}%; transform:translateX(-50%);
            width:4px; height:100%; background:#fff; border-radius:2px; box-shadow:0 0 6px #fff"></div>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:0.72rem; color:var(--text-muted); padding:0 2px">
          <span>0 – unpolar</span>
          <span>1,7 – polar↔ionisch</span>
          <span>3,3 – stark ionisch</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:0.72rem; margin-top:2px; padding:0 2px">
          <span style="color:var(--green)">kovalent</span>
          <span style="color:var(--amber)">polar</span>
          <span style="color:var(--pink)">ionisch</span>
        </div>
      </div>
    `;
  }

  function renderPolarViz(a, b, enA, enB) {
    const aIsMore = enA >= enB;
    const dPlus = aIsMore ? b : a;
    const dMinus = aIsMore ? a : b;
    return `
      <div style="background:rgba(255,212,59,0.06); border-radius:8px; padding:0.6rem 0.75rem; font-size:0.88rem; margin-bottom:0.75rem">
        <div style="text-align:center; font-family:monospace; font-size:1rem; margin-bottom:0.4rem">
          <span style="color:var(--blue)">δ+${dPlus}</span>
          &nbsp;—&nbsp;
          <span style="color:var(--pink)">δ−${dMinus}</span>
        </div>
        <div style="text-align:center; color:var(--text-muted)">
          ${dMinus} zieht die Bindungselektronen stärker an → Partialladung δ−
        </div>
      </div>
    `;
  }

  function renderIonicViz(donor, acceptor) {
    return `
      <div style="background:rgba(247,131,172,0.06); border-radius:8px; padding:0.6rem 0.75rem; font-size:0.88rem; margin-bottom:0.75rem">
        <div style="text-align:center; font-family:monospace; font-size:1rem; margin-bottom:0.4rem">
          <span style="color:var(--pink)">${donor}⁺</span>
          &nbsp;+&nbsp;
          <span style="color:var(--blue)">${acceptor}⁻</span>
        </div>
        <div style="text-align:center; color:var(--text-muted)">
          ${donor} gibt Elektron ab → ${donor}⁺ | ${acceptor} nimmt auf → ${acceptor}⁻
        </div>
      </div>
    `;
  }

  render();
}
