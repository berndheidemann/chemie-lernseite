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
          ${q.options.map((opt, i) => `
            <button class="quiz-option ${isAnswered ? 'disabled ' + (opt.correct ? 'correct' : answered[currentIndex] === 'wrong' && !opt.correct ? '' : '') : ''}"
              data-index="${i}"
              data-correct="${opt.correct}"
              ${isAnswered ? 'disabled' : ''}>
              <span class="quiz-option-key">${String.fromCharCode(65 + i)}</span>
              ${opt.text}
            </button>
          `).join('')}
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
        ${allAnswered() ? `<button class="btn btn-green" id="quiz-reset-${topicId}">Nochmal</button>` : ''}
      </div>
    `;

    // Mark selected answer if answered
    if (isAnswered) {
      const opts = container.querySelectorAll('.quiz-option');
      const selectedIdx = questions[currentIndex].options.findIndex(
        (_, i) => answered[currentIndex] === (questions[currentIndex].options[i].correct ? 'correct' : 'wrong') && i === getSelectedIndex(currentIndex)
      );
      opts.forEach((btn, i) => {
        const opt = questions[currentIndex].options[i];
        if (opt.correct) {
          btn.classList.add('correct');
        }
      });
    }

    // Events
    container.querySelectorAll('.quiz-option:not([disabled])').forEach(btn => {
      btn.addEventListener('click', () => handleAnswer(btn));
      btn.addEventListener('touchend', e => { e.preventDefault(); handleAnswer(btn); });
    });

    // Keyboard shortcuts: A/B/C/D or 1/2/3/4
    const keyHandler = (e) => {
      if (answered[currentIndex] !== null) return;
      const keyMap = { a: 0, b: 1, c: 2, d: 3, '1': 0, '2': 1, '3': 2, '4': 3 };
      const idx = keyMap[e.key.toLowerCase()];
      if (idx !== undefined) {
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
    const selectedOpt = q.options[selectedIndices[idx]];
    if (!selectedOpt) return '';
    return `
      <div class="quiz-feedback ${status}">
        ${status === 'correct' ? '✅ ' : '❌ '}${selectedOpt.explanation}
      </div>
    `;
  }

  // Track selected option indices
  const selectedIndices = new Array(questions.length).fill(-1);

  function getSelectedIndex(idx) {
    return selectedIndices[idx];
  }

  function handleAnswer(btn) {
    if (answered[currentIndex] !== null) return;

    const optIdx = parseInt(btn.dataset.index);
    const correct = btn.dataset.correct === 'true';

    selectedIndices[currentIndex] = optIdx;
    answered[currentIndex] = correct ? 'correct' : 'wrong';

    // Visually mark all options
    const opts = container.querySelectorAll('.quiz-option');
    opts.forEach((b, i) => {
      b.classList.add('disabled');
      b.setAttribute('disabled', '');
      if (questions[currentIndex].options[i].correct) {
        b.classList.add('correct');
      } else if (i === optIdx && !correct) {
        b.classList.add('wrong');
      }
    });

    // Show feedback
    const existingFeedback = container.querySelector('.quiz-feedback');
    if (!existingFeedback) {
      const feedbackDiv = document.createElement('div');
      const selOpt = questions[currentIndex].options[optIdx];
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
    render();
  }

  render();
}
