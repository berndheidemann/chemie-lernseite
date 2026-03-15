/**
 * quiz.js – Quiz-Rendering-Engine
 *
 * Rendert Multiple-Choice-Fragen in einen Container.
 *
 * @param {HTMLElement} container - Der #quiz-N Container
 * @param {Array} questions - Array von Quiz-Fragen (aus quiz-data.js)
 * @param {number} topicId - Thema-ID (für CSS-Klassen etc.)
 */
export function init(container, questions, topicId) {
  if (!questions || questions.length === 0) return;

  let currentIndex = 0;
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

  // ── Render ──────────────────────────────────────────
  function render() {
    const q = questions[currentIndex];
    const isAnswered = answered[currentIndex] !== null;

    container.innerHTML = `
      <div class="quiz-progress">
        ${questions.map((_, i) => {
          let cls = '';
          if (i === currentIndex) cls = 'current';
          else if (answered[i] === 'correct') cls = 'done correct-dot';
          else if (answered[i] === 'wrong') cls = 'done wrong-dot';
          return `<div class="quiz-dot ${cls}" title="Frage ${i + 1}"></div>`;
        }).join('')}
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
