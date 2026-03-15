/**
 * lewis.js – Widget: Lewis-Schreibweise (Elektronenpunktformel)
 *
 * AUFGABE:
 * Der Nutzer wählt ein Element und platziert interaktiv die Elektronen-Punkte
 * um das Elementsymbol. Das Widget validiert die Eingabe.
 *
 * ELEMENTE (auswählbar): H, C, N, O, F, Na, Cl, S
 *
 * VERHALTEN:
 * - Dropdown/Button-Leiste: Element auswählen
 * - Unter dem Symbol: 4 Klick-Zonen (oben, rechts, unten, links)
 * - Jede Zone nimmt maximal 2 Elektronen auf (0 → 1 → 2 → 0)
 * - Elektronen werden als Punkte dargestellt
 * - "Prüfen"-Button: Vergleicht mit korrekter Lewis-Formel
 * - Bei richtiger Antwort: ✅ Grüne Bestätigung + unlock()
 * - Bei falscher Antwort: ❌ Hinweis, welche Zone falsch ist
 * - "Zeigen"-Button: Zeigt die korrekte Lösung
 *
 * LAYOUT (mobile-first):
 * - Element-Auswahl als horizontale Scrollbar
 * - Lewis-Diagramm zentriert (mind. 200×200px)
 * - Klick-Zonen: 60×60px Touch-Targets
 *
 * TECHNOLOGIE: DOM + CSS
 *
 * @param {HTMLElement} container - Ziel-div (#widget-2)
 * @param {function} unlock - Callback nach erster korrekter Lewis-Formel
 */
export function init(container, unlock) {
  let unlockCalled = false;

  // Element data: valence electrons, correct distribution [top, right, bottom, left]
  // Each position: 0 = empty, 1 = one dot, 2 = pair
  const ELEMENTS = {
    H:  { name: 'Wasserstoff', valence: 1, correct: [1,0,0,0], group: 1 },
    C:  { name: 'Kohlenstoff',  valence: 4, correct: [1,1,1,1], group: 4 },
    N:  { name: 'Stickstoff',   valence: 5, correct: [2,1,1,1], group: 5 },
    O:  { name: 'Sauerstoff',   valence: 6, correct: [2,2,1,1], group: 6 },
    F:  { name: 'Fluor',        valence: 7, correct: [2,2,2,1], group: 7 },
    Na: { name: 'Natrium',      valence: 1, correct: [1,0,0,0], group: 1 },
    Cl: { name: 'Chlor',        valence: 7, correct: [2,2,2,1], group: 7 },
    S:  { name: 'Schwefel',     valence: 6, correct: [2,2,1,1], group: 6 },
  };

  let selectedElement = 'Na';
  let dots = [0, 0, 0, 0]; // [top, right, bottom, left]
  let checked = false;
  let checkResult = null;

  const POSITIONS = ['oben', 'rechts', 'unten', 'links'];
  const POS_STYLES = [
    'top:0; left:50%; transform:translateX(-50%)',
    'right:0; top:50%; transform:translateY(-50%)',
    'bottom:0; left:50%; transform:translateX(-50%)',
    'left:0; top:50%; transform:translateY(-50%)',
  ];

  function dotsSVG(count) {
    if (count === 0) return '';
    if (count === 1) return '•';
    return '••';
  }

  function render() {
    const el = ELEMENTS[selectedElement];
    const totalPlaced = dots.reduce((a, b) => a + b, 0);

    container.innerHTML = `
      <p class="widget-title">Platziere die Elektronen-Punkte für <strong>${selectedElement}</strong> (${el.name}, ${el.valence} Valenzelektronen)</p>

      <!-- Element Selector -->
      <div style="display:flex; gap:0.5rem; flex-wrap:wrap; justify-content:center; margin-bottom:1.25rem">
        ${Object.keys(ELEMENTS).map(sym => `
          <button class="btn ${sym === selectedElement ? 'btn-primary' : 'btn-secondary'}" style="min-width:48px; font-family:monospace; font-weight:700" data-el="${sym}">${sym}</button>
        `).join('')}
      </div>

      <!-- Lewis Diagram -->
      <div style="display:flex; justify-content:center; margin-bottom:1rem">
        <div style="position:relative; width:140px; height:140px">
          <!-- Symbol in center -->
          <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
            width:60px; height:60px; display:flex; align-items:center; justify-content:center;
            font-size:${selectedElement.length > 1 ? '1.4rem' : '1.8rem'}; font-weight:700; font-family:'Courier New',monospace;
            color:var(--amber); background:var(--bg); border-radius:8px; border:1px solid rgba(255,212,59,0.2)">
            ${selectedElement}
          </div>

          <!-- 4 Click Zones -->
          ${[0,1,2,3].map(i => `
            <button data-pos="${i}" style="position:absolute; ${POS_STYLES[i]};
              width:44px; height:44px; display:flex; align-items:center; justify-content:center;
              background:${dots[i] > 0 ? 'rgba(77,171,247,0.2)' : 'rgba(255,255,255,0.04)'};
              border:1px solid ${dots[i] > 0 ? 'rgba(77,171,247,0.5)' : 'rgba(255,255,255,0.1)'};
              border-radius:8px; cursor:pointer; font-size:1.4rem; color:var(--blue);
              transition:all 0.15s; -webkit-tap-highlight-color:transparent;
              ${checked && checkResult && checkResult[i] === 'wrong' ? 'border-color:#f75050; background:rgba(247,80,80,0.15)' : ''}
              ${checked && checkResult && checkResult[i] === 'correct' ? 'border-color:var(--green); background:rgba(81,207,102,0.15)' : ''}
            " title="${POSITIONS[i]}" aria-label="Position ${POSITIONS[i]}">
              ${dotsSVG(dots[i])}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Counter + Tipp -->
      <div style="text-align:center; font-size:0.85rem; color:var(--text-muted); margin-bottom:0.5rem">
        Platziert: <strong style="color:${totalPlaced === el.valence ? 'var(--green)' : totalPlaced > el.valence ? '#f75050' : 'var(--amber)'}">${totalPlaced}</strong> / ${el.valence} Elektronen
        ${totalPlaced > el.valence ? '<span style="color:#f75050"> ← zu viele!</span>' : ''}
        ${totalPlaced === el.valence ? '<span style="color:var(--green)"> ✓</span>' : ''}
      </div>
      <div style="text-align:center; font-size:0.78rem; color:var(--text-muted); margin-bottom:0.75rem; background:rgba(255,212,59,0.05); border-radius:6px; padding:4px 8px">
        💡 Tipp: ${el.name} ist in der <strong style="color:var(--amber)">${el.group}. Hauptgruppe</strong> → ${el.valence} Valenzelektronen. Erst alle 4 Seiten einzeln, dann Paare!
      </div>

      ${checked ? `
        <div class="quiz-feedback ${checkResult && checkResult.every(r => r === 'correct') ? 'correct' : 'wrong'}" style="text-align:center; margin-bottom:0.75rem">
          ${checkResult && checkResult.every(r => r === 'correct')
            ? '✅ Richtig! Das ist die korrekte Lewis-Schreibweise für ' + selectedElement + '!'
            : '❌ Nicht ganz – rote Positionen sind falsch.<br><small>Tipp: Erst alle 4 Seiten je 1 Elektron → dann Paare auffüllen.</small>'}
        </div>
      ` : ''}

      <!-- Buttons -->
      <div style="display:flex; gap:0.75rem; justify-content:center; flex-wrap:wrap">
        <button class="btn btn-green" id="lewis-check">✓ Prüfen</button>
        <button class="btn btn-secondary" id="lewis-show">👁 Lösung</button>
        <button class="btn btn-secondary" id="lewis-reset">↺ Reset</button>
      </div>
      <p class="widget-hint">Klicke auf die Felder um Elektronen-Punkte zu setzen (0 → 1 → 2 → 0)</p>
    `;

    // Element select
    container.querySelectorAll('[data-el]').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedElement = btn.dataset.el;
        dots = [0,0,0,0];
        checked = false;
        checkResult = null;
        render();
      });
    });

    // Dot placement
    container.querySelectorAll('[data-pos]').forEach(btn => {
      const handleClick = () => {
        const pos = parseInt(btn.dataset.pos);
        dots[pos] = (dots[pos] + 1) % 3;
        checked = false;
        checkResult = null;
        renderUpdate();
      };
      btn.addEventListener('click', handleClick);
    });

    document.getElementById('lewis-check')?.addEventListener('click', checkLewis);
    document.getElementById('lewis-show')?.addEventListener('click', showSolution);
    document.getElementById('lewis-reset')?.addEventListener('click', () => {
      dots = [0,0,0,0]; checked = false; checkResult = null; render();
    });
  }

  function renderUpdate() {
    // Re-render without rebuilding element selector
    render();
  }

  function checkLewis() {
    const el = ELEMENTS[selectedElement];
    checkResult = dots.map((d, i) => d === el.correct[i] ? 'correct' : 'wrong');
    checked = true;

    if (checkResult.every(r => r === 'correct')) {
      if (!unlockCalled) {
        unlockCalled = true;
        unlock();
      }
    }
    render();
  }

  function showSolution() {
    const el = ELEMENTS[selectedElement];
    dots = [...el.correct];
    checked = false;
    checkResult = null;
    render();
    if (!unlockCalled) {
      unlockCalled = true;
      unlock();
    }
  }

  render();
}
