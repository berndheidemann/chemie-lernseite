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
        ${questions.map((_, i) => `
          <div class="quiz-dot ${
            i === currentIndex ? 'current' :
            answered[i] === 'correct' ? 'done' :
            answered[i] === 'wrong' ? 'done' : ''
          }" title="Frage ${i + 1}"></div>
        `).join('')}
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
      dots[currentIndex].style.background = correct ? 'var(--green)' : '#f75050';
      dots[currentIndex].style.borderColor = correct ? 'var(--green)' : '#f75050';
    }

    // Show reset if all answered
    if (allAnswered() && !container.querySelector(`#quiz-reset-${topicId}`)) {
      const nav = container.querySelector('.quiz-nav');
      const resetBtn = document.createElement('button');
      resetBtn.className = 'btn btn-green';
      resetBtn.id = `quiz-reset-${topicId}`;
      resetBtn.textContent = 'Nochmal';
      resetBtn.addEventListener('click', reset);
      if (nav) nav.appendChild(resetBtn);
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
