/**
 * quiz.js – Quiz-Rendering-Engine
 *
 * Rendert Multiple-Choice-Fragen in einen Container.
 *
 * @param {HTMLElement} container - Der #quiz-N Container
 * @param {Array} questions - Array von Quiz-Fragen (aus quiz-data.js)
 * @param {number} topicId - Thema-ID (für CSS-Klassen etc.)
 */
// Inject flip-card CSS once
if (!document.getElementById('lernkarten-style')) {
  const s = document.createElement('style');
  s.id = 'lernkarten-style';
  s.textContent = `
    .lernkarte-wrap { perspective: 800px; width:100%; margin-bottom:1rem; cursor:pointer; }
    .lernkarte { position:relative; width:100%; min-height:140px; transition:transform 0.5s ease; transform-style:preserve-3d; }
    .lernkarte.flipped { transform:rotateY(180deg); }
    .lernkarte-front, .lernkarte-back {
      position:absolute; width:100%; min-height:140px; backface-visibility:hidden;
      border-radius:10px; padding:1rem 1.25rem;
      display:flex; flex-direction:column; justify-content:center; align-items:center;
      text-align:center;
    }
    .lernkarte-front { background:var(--bg-card); border:1px solid rgba(77,171,247,0.3); }
    .lernkarte-back  { background:rgba(11,50,30,0.95); border:1px solid rgba(81,207,102,0.4); transform:rotateY(180deg); }
  `;
  document.head.appendChild(s);
}

export function init(container, questions, topicId) {
  if (!questions || questions.length === 0) return;

  let currentIndex = 0;
  let quizMode = 'quiz'; // 'quiz' | 'lernkarten'
  let cardFlipped = false;
  let lernkartenIndex = 0;
  const lernkartenStatus = new Array(questions.length).fill(null); // null | 'knew' | 'repeat'

  const answered = new Array(questions.length).fill(null); // null | 'correct' | 'wrong'

  // Shuffle answer options once per session (stable during quiz, changes on reset)
  function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  let shuffledOrders = questions.map(q => shuffleArray(q.options.map((_, i) => i)));

  // ── Lernkarten Mode ─────────────────────────────────
  function renderLernkarten() {
    const q = questions[lernkartenIndex];
    const knew  = lernkartenStatus.filter(s => s === 'knew').length;
    const total = questions.length;
    const allDone = lernkartenStatus.every(s => s !== null);

    container.innerHTML = `
      <div style="display:flex; gap:0.4rem; margin-bottom:0.75rem; align-items:center">
        <button class="btn btn-secondary" id="mode-quiz" style="font-size:0.78rem; padding:0.3rem 0.7rem; min-height:32px">
          📝 Quiz
        </button>
        <button class="btn btn-amber" id="mode-lk" style="font-size:0.78rem; padding:0.3rem 0.7rem; min-height:32px">
          🃏 Lernkarten
        </button>
        <span style="font-size:0.72rem; color:var(--text-muted); margin-left:auto">${lernkartenIndex + 1}/${total} · ✓ ${knew}</span>
      </div>

      ${allDone ? `
        <div style="text-align:center; padding:1rem; background:rgba(81,207,102,0.1); border-radius:8px; color:var(--green); font-size:0.9rem; margin-bottom:0.75rem">
          🏆 Alle ${total} Karten durchgegangen! Gewusst: ${knew}/${total}
        </div>
        <button class="btn btn-secondary" id="lk-reset" style="width:100%">↺ Nochmal von vorne</button>
      ` : `
        <div class="lernkarte-wrap" id="lk-wrap">
          <div class="lernkarte${cardFlipped ? ' flipped' : ''}" id="lk-card">
            <div class="lernkarte-front">
              <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:0.5rem">Frage ${lernkartenIndex + 1}</div>
              <div style="font-size:0.95rem; font-weight:600; color:var(--text)">${q.question}</div>
              <div style="font-size:0.78rem; color:var(--text-muted); margin-top:0.75rem">👆 Tippe zum Aufdecken</div>
            </div>
            <div class="lernkarte-back">
              <div style="font-size:0.78rem; color:var(--green); margin-bottom:0.4rem; font-weight:700">✅ Antwort:</div>
              <div style="font-size:0.9rem; color:var(--text); font-weight:600; margin-bottom:0.5rem">
                ${q.options.find(o => o.correct)?.text || ''}
              </div>
              <div style="font-size:0.8rem; color:var(--text-muted)">
                ${q.options.find(o => o.correct)?.explanation || ''}
              </div>
            </div>
          </div>
        </div>
        ${cardFlipped ? `
          <div style="display:flex; gap:0.5rem; justify-content:center">
            <button class="btn btn-green" id="lk-knew" style="flex:1">✓ Gewusst</button>
            <button class="btn btn-secondary" id="lk-repeat" style="flex:1">↺ Wiederholen</button>
          </div>
        ` : ''}
      `}
      <p class="widget-hint" style="margin-top:0.75rem">Lernkarten: Decke die Antwort auf und bewerte dein Wissen.</p>
    `;

    document.getElementById('mode-quiz')?.addEventListener('click', () => { quizMode = 'quiz'; render(); });
    document.getElementById('mode-lk')?.addEventListener('click',   () => { quizMode = 'lernkarten'; renderLernkarten(); });

    const wrap = document.getElementById('lk-wrap');
    if (wrap && !allDone) {
      wrap.addEventListener('click', () => {
        cardFlipped = !cardFlipped;
        renderLernkarten();
      });
    }

    document.getElementById('lk-knew')?.addEventListener('click', e => {
      e.stopPropagation();
      lernkartenStatus[lernkartenIndex] = 'knew';
      lernkartenIndex = Math.min(lernkartenIndex + 1, total - 1);
      cardFlipped = false;
      renderLernkarten();
    });

    document.getElementById('lk-repeat')?.addEventListener('click', e => {
      e.stopPropagation();
      lernkartenStatus[lernkartenIndex] = 'repeat';
      lernkartenIndex = Math.min(lernkartenIndex + 1, total - 1);
      cardFlipped = false;
      renderLernkarten();
    });

    document.getElementById('lk-reset')?.addEventListener('click', () => {
      lernkartenIndex = 0;
      cardFlipped = false;
      lernkartenStatus.fill(null);
      renderLernkarten();
    });
  }

  // ── Render ──────────────────────────────────────────
  function render() {
    if (quizMode === 'lernkarten') { renderLernkarten(); return; }
    const q = questions[currentIndex];
    const isAnswered = answered[currentIndex] !== null;

    const correctSoFar  = answered.filter(a => a === 'correct').length;
    const answeredSoFar = answered.filter(a => a !== null).length;

    container.innerHTML = `
      <div style="display:flex; gap:0.4rem; margin-bottom:0.6rem">
        <button class="btn btn-amber" id="mode-quiz" style="font-size:0.78rem; padding:0.3rem 0.7rem; min-height:32px">
          📝 Quiz
        </button>
        <button class="btn btn-secondary" id="mode-lk" style="font-size:0.78rem; padding:0.3rem 0.7rem; min-height:32px">
          🃏 Lernkarten
        </button>
      </div>
      <div class="quiz-progress" style="display:flex; align-items:center; gap:0.6rem; flex-wrap:wrap">
        <div style="display:flex; gap:0.4rem; align-items:center">
          ${questions.map((_, i) => {
            let cls = '';
            if (i === currentIndex) cls = 'current';
            else if (answered[i] === 'correct') cls = 'done correct-dot';
            else if (answered[i] === 'wrong') cls = 'done wrong-dot';
            return `<div class="quiz-dot ${cls}" title="Frage ${i + 1}"></div>`;
          }).join('')}
        </div>
        ${answeredSoFar > 0 ? `
          <span style="font-size:0.75rem; font-weight:700; margin-left:auto;
            color:${correctSoFar === answeredSoFar ? 'var(--green)' : correctSoFar > answeredSoFar / 2 ? 'var(--amber)' : '#f75050'}">
            ${correctSoFar}/${answeredSoFar} ✓
          </span>
        ` : `<span style="font-size:0.72rem; color:var(--text-muted); margin-left:auto">${questions.length} Fragen</span>`}
      </div>

      <div class="quiz-question-wrap">
        <div class="quiz-question-text">${currentIndex + 1}. ${q.question}</div>
        <div class="quiz-options" id="quiz-options-${topicId}">
          ${shuffledOrders[currentIndex].map((origIdx, i) => {
            const opt = q.options[origIdx];
            const wasSelected = selectedIndices[currentIndex] === i;
            let cls = '';
            if (isAnswered) {
              cls += ' disabled';
              if (opt.correct) cls += ' correct';
              else if (wasSelected) cls += ' wrong';
            }
            return `
            <button class="quiz-option${cls}"
              data-shuffled-index="${i}"
              data-correct="${opt.correct}"
              ${isAnswered ? 'disabled' : ''}>
              <span class="quiz-option-key">${String.fromCharCode(65 + i)}</span>
              ${opt.text}
            </button>`;
          }).join('')}
        </div>
        ${isAnswered ? renderFeedback(q, currentIndex) : ''}
      </div>

      <div class="quiz-nav">
        <button class="btn btn-secondary" id="quiz-prev-${topicId}" ${currentIndex === 0 ? 'disabled' : ''}>
          ← Zurück
        </button>
        <button class="btn btn-secondary" id="quiz-next-${topicId}" ${currentIndex === questions.length - 1 ? 'disabled' : ''}>
          Weiter →
        </button>
        ${allAnswered() ? `<button class="btn btn-green" id="quiz-reset-${topicId}">↺ Nochmal</button>` : ''}
      </div>
      <div style="text-align:center; font-size:0.72rem; color:var(--text-muted); margin-top:0.35rem; opacity:0.6">
        Tastatur: A/B/C/D oder 1/2/3/4 zum Antworten
      </div>
    `;

    // Mode toggles
    container.querySelector('#mode-quiz')?.addEventListener('click', () => { quizMode = 'quiz'; render(); });
    container.querySelector('#mode-lk')?.addEventListener('click',   () => { quizMode = 'lernkarten'; renderLernkarten(); });

    // Events – use shuffled index
    container.querySelectorAll('.quiz-option:not([disabled])').forEach(btn => {
      btn.addEventListener('click', () => handleAnswer(btn));
      btn.addEventListener('touchend', e => { e.preventDefault(); handleAnswer(btn); });
    });

    // Keyboard shortcuts: A/B/C/D or 1/2/3/4 — only when THIS container is in viewport
    if (container._quizKeyHandler) document.removeEventListener('keydown', container._quizKeyHandler);
    const keyHandler = (e) => {
      // Ignore if container not visible in viewport
      const rect = container.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 0.8 && rect.bottom > window.innerHeight * 0.2;
      if (!inView) return;

      const keyMap = { a: 0, b: 1, c: 2, d: 3, '1': 0, '2': 1, '3': 2, '4': 3 };
      const idx = keyMap[e.key.toLowerCase()];
      if (idx !== undefined && answered[currentIndex] === null) {
        const opts = container.querySelectorAll('.quiz-option:not([disabled])');
        if (opts[idx]) handleAnswer(opts[idx]);
      }
    };
    container._quizKeyHandler = keyHandler;
    document.addEventListener('keydown', keyHandler);

    const prevBtn = container.querySelector(`#quiz-prev-${topicId}`);
    const nextBtn = container.querySelector(`#quiz-next-${topicId}`);
    const resetBtn = container.querySelector(`#quiz-reset-${topicId}`);

    if (prevBtn) prevBtn.addEventListener('click', () => { currentIndex--; render(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { currentIndex++; render(); });
    if (resetBtn) resetBtn.addEventListener('click', reset);
  }

  function renderFeedback(q, idx) {
    const status = answered[idx];
    const shuffledIdx = selectedIndices[idx];
    if (shuffledIdx < 0) return '';
    const origIdx = shuffledOrders[idx][shuffledIdx];
    const selectedOpt = q.options[origIdx];
    if (!selectedOpt) return '';
    return `
      <div class="quiz-feedback ${status}">
        ${status === 'correct' ? '✅ ' : '❌ '}${selectedOpt.explanation}
      </div>
    `;
  }

  // Track selected shuffled-position indices
  const selectedIndices = new Array(questions.length).fill(-1);

  function handleAnswer(btn) {
    if (answered[currentIndex] !== null) return;

    const shuffledIdx = parseInt(btn.dataset.shuffledIndex);
    const correct = btn.dataset.correct === 'true';

    selectedIndices[currentIndex] = shuffledIdx;
    answered[currentIndex] = correct ? 'correct' : 'wrong';

    // Visually mark all options in shuffled display order
    const opts = container.querySelectorAll('.quiz-option');
    opts.forEach((b, displayIdx) => {
      b.classList.add('disabled');
      b.setAttribute('disabled', '');
      const origIdx = shuffledOrders[currentIndex][displayIdx];
      if (questions[currentIndex].options[origIdx].correct) {
        b.classList.add('correct');
      } else if (displayIdx === shuffledIdx && !correct) {
        b.classList.add('wrong');
      }
    });

    // Show feedback using original option's explanation
    const existingFeedback = container.querySelector('.quiz-feedback');
    if (!existingFeedback) {
      const feedbackDiv = document.createElement('div');
      const origIdx = shuffledOrders[currentIndex][shuffledIdx];
      const selOpt = questions[currentIndex].options[origIdx];
      feedbackDiv.className = `quiz-feedback ${correct ? 'correct' : 'wrong'}`;
      feedbackDiv.textContent = (correct ? '✅ ' : '❌ ') + selOpt.explanation;
      container.querySelector('.quiz-question-wrap').appendChild(feedbackDiv);
    }

    // Update dots
    const dots = container.querySelectorAll('.quiz-dot');
    if (dots[currentIndex]) {
      dots[currentIndex].classList.remove('current');
      dots[currentIndex].classList.add('done');
      if (!correct) dots[currentIndex].classList.add('wrong-dot');
    }

    // Show score + reset if all answered
    if (allAnswered() && !container.querySelector(`#quiz-reset-${topicId}`)) {
      const correctCount = answered.filter(a => a === 'correct').length;
      const total = questions.length;
      const allCorrect = correctCount === total;

      // Score banner
      const nav = container.querySelector('.quiz-nav');
      const scoreBanner = document.createElement('div');
      scoreBanner.style.cssText = `width:100%; padding:0.6rem 0.75rem; border-radius:8px; text-align:center; font-weight:700; font-size:0.95rem; margin-top:0.75rem; background:${allCorrect ? 'rgba(81,207,102,0.15)' : 'rgba(255,212,59,0.12)'}; border:1px solid ${allCorrect ? 'var(--green)' : 'var(--amber)'}; color:${allCorrect ? 'var(--green)' : 'var(--amber)'}`;
      scoreBanner.textContent = `Ergebnis: ${correctCount}/${total} richtig ${allCorrect ? '🏆' : '💪'}`;
      if (nav) nav.insertAdjacentElement('beforebegin', scoreBanner);

      // Reset button
      const resetBtn = document.createElement('button');
      resetBtn.className = 'btn btn-secondary';
      resetBtn.id = `quiz-reset-${topicId}`;
      resetBtn.textContent = '↺ Nochmal';
      resetBtn.addEventListener('click', reset);
      if (nav) nav.appendChild(resetBtn);

      // Fire event so app.js can update pill color
      container.dispatchEvent(new CustomEvent('quiz-complete', {
        bubbles: true,
        detail: { topicId, correctCount, total, allCorrect }
      }));
    }
  }

  function allAnswered() {
    return answered.every(a => a !== null);
  }

  function reset() {
    answered.fill(null);
    selectedIndices.fill(-1);
    currentIndex = 0;
    // Re-shuffle on each retry
    shuffledOrders = questions.map(q => shuffleArray(q.options.map((_, i) => i)));
    render();
  }

  render();
}
