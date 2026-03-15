/**
 * epb.js – Widget: Elektronenpaarbindung (EPB) + Luft leitet nicht
 *
 * AUFGABE:
 * Bindungs-Builder: Der Nutzer schiebt zwei Atome zusammen und sieht,
 * wie gemeinsame Elektronenpaare entstehen.
 *
 * ELEMENTE (auswählbar): H₂, O₂, N₂, Cl₂, HCl, H₂O
 * Für Thema 7 (Luft): N₂ und O₂ als Beispiele mit Hinweis "Alle Elektronen gebunden → kein Strom"
 *
 * VERHALTEN:
 * - Dropdown: Molekül auswählen
 * - Zwei Atome als Kreise, anfangs getrennt (50px Abstand)
 * - [→ Zusammenschieben] animiert die Atome aufeinander zu
 * - Gemeinsame Elektronen erscheinen als leuchtende Punkte zwischen den Atomen
 * - Bindungstyp wird angezeigt: Einfach- / Doppel- / Dreifachbindung
 * - Lewis-Formel wird eingeblendet
 * - Bei N₂ und O₂: Hinweis "Alle Elektronen gebunden → kein freier Ladungsträger"
 * - unlock() nach dem ersten vollständigen Zusammenschieben
 *
 * LAYOUT (mobile-first):
 * - SVG zentriert, max 350px breit
 * - Zwei Buttons: [→ Zusammenschieben] und [↺ Trennen]
 * - Molekül-Auswahl als horizontaler Button-Strip
 *
 * TECHNOLOGIE: SVG + CSS-Transitions
 *
 * @param {HTMLElement} container - Ziel-div (#widget-6)
 * @param {function} unlock - Callback nach erstem Zusammenschieben
 */
export function init(container, unlock) {
  let unlockCalled = false;
  let isMerged = false;

  const MOLECULES = {
    H2:  { label: 'H₂', atoms: ['H','H'], bonds: 1, valence: [1,1], formula: 'H–H', note: '' },
    O2:  { label: 'O₂', atoms: ['O','O'], bonds: 2, valence: [6,6], formula: 'O=O', note: '⚠️ Alle Elektronen gebunden → O₂ leitet keinen Strom!' },
    N2:  { label: 'N₂', atoms: ['N','N'], bonds: 3, valence: [5,5], formula: 'N≡N', note: '⚠️ Alle Elektronen gebunden → N₂ leitet keinen Strom! (Hauptbestandteil Luft: 78%)' },
    Cl2: { label: 'Cl₂', atoms: ['Cl','Cl'], bonds: 1, valence: [7,7], formula: 'Cl–Cl', note: '' },
    HCl: { label: 'HCl', atoms: ['H','Cl'], bonds: 1, valence: [1,7], formula: 'H–Cl', note: '(polare Bindung: Cl zieht Elektronen stärker an)' },
    H2O: { label: 'H₂O', atoms: ['H','O'], bonds: 1, valence: [1,6], formula: 'H–O–H', note: '(Wasser: je 1 gem. EP pro H–O-Bindung, 2 freie Paare am O → Gewinkelt, polare Bindung)' },
  };

  let selectedMol = 'H2';

  const BOND_LABELS = { 1: 'Einfachbindung', 2: 'Doppelbindung', 3: 'Dreifachbindung' };
  const BOND_COLORS = { 1: 'var(--green)', 2: 'var(--amber)', 3: 'var(--pink)' };

  function render() {
    const mol = MOLECULES[selectedMol];

    container.innerHTML = `
      <p class="widget-title">Wie entstehen Elektronenpaarbindungen? Schiebe zwei Atome zusammen!</p>

      <!-- Molecule selector -->
      <div style="display:flex; gap:0.4rem; flex-wrap:wrap; justify-content:center; margin-bottom:1.25rem">
        ${Object.entries(MOLECULES).map(([key, m]) => `
          <button class="btn ${key === selectedMol ? 'btn-primary' : 'btn-secondary'}" data-mol="${key}"
            style="min-width:56px; font-size:0.85rem">${m.label}</button>
        `).join('')}
      </div>

      <!-- SVG Animation Area -->
      <div style="display:flex; justify-content:center; margin-bottom:1rem">
        ${drawMoleculeSVG(mol)}
      </div>

      ${isMerged ? `
        <div style="text-align:center; margin-bottom:0.75rem">
          <div class="formula-box" style="display:inline-block; margin:0 auto">
            ${mol.formula}
          </div>
          <div style="margin-top:0.4rem">
            <span class="badge" style="background:${BOND_COLORS[mol.bonds]}22; color:${BOND_COLORS[mol.bonds]}; border:1px solid ${BOND_COLORS[mol.bonds]}55">
              ${BOND_LABELS[mol.bonds]} (${mol.bonds} gem. EP)
            </span>
          </div>
        </div>
        ${mol.note ? `
          <div style="background:rgba(247,131,172,0.1); border:1px solid rgba(247,131,172,0.3); border-radius:8px; padding:0.6rem 0.75rem; font-size:0.85rem; color:var(--pink); margin-bottom:0.75rem; text-align:center">
            ${mol.note}
          </div>
        ` : ''}
      ` : `
        <div style="text-align:center; font-size:0.85rem; color:var(--text-muted); margin-bottom:0.75rem">
          ${mol.atoms[0]} hat ${mol.valence[0]} Valenzelektronen &nbsp;|&nbsp; ${mol.atoms[1]} hat ${mol.valence[1]} Valenzelektronen
        </div>
      `}

      <div style="display:flex; gap:0.75rem; justify-content:center; flex-wrap:wrap">
        <button class="btn btn-green" id="epb-merge" ${isMerged ? 'disabled' : ''}>→ Zusammenschieben</button>
        <button class="btn btn-secondary" id="epb-split">↺ Trennen</button>
      </div>
      <p class="widget-hint">Beobachte die gemeinsamen Elektronenpaare zwischen den Atomen!</p>
    `;

    container.querySelectorAll('[data-mol]').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedMol = btn.dataset.mol;
        isMerged = false;
        render();
      });
    });

    document.getElementById('epb-merge')?.addEventListener('click', () => {
      isMerged = true;
      render();
      if (!unlockCalled) {
        unlockCalled = true;
        unlock();
      }
    });

    document.getElementById('epb-split')?.addEventListener('click', () => {
      isMerged = false;
      render();
    });
  }

  function drawMoleculeSVG(mol) {
    const svgW = Math.min(340, window.innerWidth - 60);
    const svgH = 140;
    const cx = svgW / 2;
    const cy = svgH / 2;
    const r = 30;

    const gap = isMerged ? r * 0.4 : r * 2.5;
    const leftX = cx - r - gap / 2;
    const rightX = cx + r + gap / 2;

    // Colors
    const colorMap = { H: '#ffd43b', O: '#f783ac', N: '#4dabf7', Cl: '#51cf66' };
    const leftColor = colorMap[mol.atoms[0]] || '#888';
    const rightColor = colorMap[mol.atoms[1]] || '#888';

    // Shared electron dots between atoms
    let sharedElectrons = '';
    if (isMerged) {
      const midX = (leftX + r + rightX - r) / 2;
      const bondSpread = 8;
      for (let b = 0; b < mol.bonds; b++) {
        const dy = (b - (mol.bonds - 1) / 2) * bondSpread;
        sharedElectrons += `
          <circle cx="${midX - 6}" cy="${cy + dy}" r="4" fill="#4dabf7" opacity="0.9"/>
          <circle cx="${midX + 6}" cy="${cy + dy}" r="4" fill="#4dabf7" opacity="0.9"/>
        `;
      }
    }

    // Free electron dots on atoms
    const leftFree = isMerged ? Math.floor((mol.valence[0] - mol.bonds) / 2) : Math.floor(mol.valence[0] / 2);
    const rightFree = isMerged ? Math.floor((mol.valence[1] - mol.bonds) / 2) : Math.floor(mol.valence[1] / 2);

    const freeDotsLeft = drawFreeDots(leftX, cy, r, leftFree, true);
    const freeDotsRight = drawFreeDots(rightX, cy, r, rightFree, false);

    return `
      <svg width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}">
        <!-- Left Atom -->
        <circle cx="${leftX}" cy="${cy}" r="${r}" fill="${leftColor}44" stroke="${leftColor}" stroke-width="2"/>
        <text x="${leftX}" y="${cy + 5}" text-anchor="middle" font-size="${mol.atoms[0].length > 1 ? 13 : 16}" font-weight="700" font-family="monospace" fill="${leftColor}">
          ${mol.atoms[0]}
        </text>
        ${freeDotsLeft}

        <!-- Right Atom -->
        <circle cx="${rightX}" cy="${cy}" r="${r}" fill="${rightColor}44" stroke="${rightColor}" stroke-width="2"/>
        <text x="${rightX}" y="${cy + 5}" text-anchor="middle" font-size="${mol.atoms[1].length > 1 ? 13 : 16}" font-weight="700" font-family="monospace" fill="${rightColor}">
          ${mol.atoms[1]}
        </text>
        ${freeDotsRight}

        <!-- Shared electrons -->
        ${sharedElectrons}

        ${!isMerged ? `
          <text x="${cx}" y="${cy + 5}" text-anchor="middle" font-size="20" fill="var(--text-muted)" opacity="0.5">···</text>
        ` : ''}
      </svg>
    `;
  }

  function drawFreeDots(atomX, cy, r, pairCount, isLeft) {
    let dots = '';
    const positions = isLeft
      ? [[atomX - r - 8, cy - 8], [atomX - r - 8, cy + 8], [atomX, cy - r - 8], [atomX, cy + r + 8]]
      : [[atomX + r + 8, cy - 8], [atomX + r + 8, cy + 8], [atomX, cy - r - 8], [atomX, cy + r + 8]];

    for (let i = 0; i < Math.min(pairCount, 4); i++) {
      const [x, y] = positions[i];
      dots += `
        <circle cx="${x - 3}" cy="${y}" r="3" fill="#4dabf7" opacity="0.7"/>
        <circle cx="${x + 3}" cy="${y}" r="3" fill="#4dabf7" opacity="0.7"/>
      `;
    }
    return dots;
  }

  render();
}
