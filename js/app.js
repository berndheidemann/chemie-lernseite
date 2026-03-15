/**
 * app.js – Widget-Init, Unlock-Logik, Progress-Tracking
 */

import { QUIZ_DATA } from './quiz-data.js';
import { init as initAtomIon } from './widgets/atom-ion.js';
import { init as initLewis }   from './widgets/lewis.js';
import { init as initStrom }   from './widgets/strom.js';
import { init as initIonenbildung } from './widgets/ionenbildung.js';
import { init as initIonengitter }  from './widgets/ionengitter.js';
import { init as initEpb }     from './widgets/epb.js';
import { init as initMetall }  from './widgets/metallbindung.js';
import { init as initEN }      from './widgets/en-rechner.js';
import { init as initElektrolyse } from './widgets/elektrolyse.js';
import { init as initQuiz }    from './widgets/quiz.js';

// ── State ──────────────────────────────────────────────
const unlocked = new Set(JSON.parse(localStorage.getItem('chem-unlocked') || '[]'));

function saveUnlocked() {
  localStorage.setItem('chem-unlocked', JSON.stringify([...unlocked]));
}

// ── Progress Bar ────────────────────────────────────────
function updateProgress() {
  const count = unlocked.size;
  document.getElementById('progress-count').textContent = count;
  document.getElementById('progress-fill').style.width = `${(count / 11) * 100}%`;

  // Update pill nav
  document.querySelectorAll('.pill[data-topic]').forEach(pill => {
    const t = parseInt(pill.dataset.topic);
    pill.classList.toggle('done', unlocked.has(t));
    pill.classList.toggle('active', false); // Reset, set below via IntersectionObserver
  });
}

// ── Unlock Callback Factory ─────────────────────────────
function makeUnlock(topicId) {
  return function unlock() {
    if (unlocked.has(topicId)) return;
    unlocked.add(topicId);
    saveUnlocked();
    updateProgress();

    // Unlock the explanation card
    const expCard = document.getElementById(`exp-${topicId}`);
    const lockIcon = document.getElementById(`lock-${topicId}`);
    if (expCard) {
      expCard.classList.add('unlocked');
      expCard.removeAttribute('disabled');
      if (lockIcon) lockIcon.textContent = '🔓';

      // Open it automatically
      expCard.open = true;

      // Show unlock toast
      const toast = document.createElement('div');
      toast.className = 'unlock-message';
      toast.innerHTML = '✅ Erklärung freigeschaltet!';
      expCard.insertAdjacentElement('beforebegin', toast);
      setTimeout(() => toast.remove(), 3000);
    }

    // Update pill
    const pill = document.querySelector(`.pill[data-topic="${topicId}"]`);
    if (pill) pill.classList.add('done');
  };
}

// ── Lock/Disable Explanation Cards Initially ─────────────
function lockExpCards() {
  for (let i = 1; i <= 11; i++) {
    const expCard = document.getElementById(`exp-${i}`);
    if (!expCard) continue;

    if (unlocked.has(i)) {
      // Already unlocked from previous session
      expCard.classList.add('unlocked');
      const lockIcon = document.getElementById(`lock-${i}`);
      if (lockIcon) lockIcon.textContent = '🔓';
    } else {
      // Lock: prevent opening
      expCard.addEventListener('click', e => {
        if (!expCard.classList.contains('unlocked')) {
          e.preventDefault();
          const hint = expCard.querySelector('.exp-summary');
          if (hint) {
            hint.style.animation = 'none';
            hint.offsetHeight; // reflow
            hint.style.animation = 'shake 0.3s ease';
          }
        }
      });
    }
  }
}

// ── Widget Initialization Map ───────────────────────────
const WIDGETS = [
  { id: 1,  init: initAtomIon,     topics: [1] },
  { id: 2,  init: initLewis,       topics: [2] },
  { id: 3,  init: initStrom,       topics: [3] },
  { id: 4,  init: initIonenbildung,topics: [4] },
  { id: 5,  init: initIonengitter, topics: [5] },
  { id: 6,  init: initEpb,         topics: [6, 7] },
  { id: 7,  init: null,            topics: [7] },  // Integrated in widget-6
  { id: 8,  init: initMetall,      topics: [8] },
  { id: 9,  init: initEN,          topics: [9, 10] },
  { id: 10, init: null,            topics: [10] }, // Integrated in widget-9
  { id: 11, init: initElektrolyse, topics: [11] },
];

function initWidgets() {
  WIDGETS.forEach(({ id, init, topics }) => {
    const container = document.getElementById(`widget-${id}`);
    if (!container || !init) return;

    // Pass an unlock callback that unlocks all related topics
    const unlock = () => {
      topics.forEach(t => makeUnlock(t)());
    };

    try {
      init(container, unlock);
    } catch (err) {
      console.error(`Widget ${id} init error:`, err);
      container.innerHTML = `<p style="color:var(--text-muted);padding:1rem;text-align:center">Widget ${id} konnte nicht geladen werden.<br><small>${err.message}</small></p>`;
    }
  });

  // Widget 7 shares EPB widget – just mirror unlock
  const w7 = document.getElementById('widget-7');
  if (w7) {
    w7.innerHTML = `<div style="padding:1rem;text-align:center;color:var(--text-muted)">
      <p>Dieses Thema wird im <a href="#topic-6" style="color:var(--blue)">EPB-Widget (Thema 6)</a> behandelt.</p>
      <p>Schau dir N₂ und O₂ als Beispiele an!</p>
    </div>`;
    makeUnlock(7)(); // Auto-unlock since it's explained via topic 6
  }

  // Widget 10 shares EN-Rechner – auto-unlock
  const w10 = document.getElementById('widget-10');
  if (w10) {
    w10.innerHTML = `<div style="padding:1rem;text-align:center;color:var(--text-muted)">
      <p>Der <a href="#topic-9" style="color:var(--blue)">EN-Rechner (Thema 9)</a> zeigt dir auch ΔEN und den Bindungstyp!</p>
    </div>`;
    // Topic 10 will be unlocked by the EN-Rechner widget when used
  }
}

// ── Quiz Initialization ─────────────────────────────────
function initQuizzes() {
  for (let i = 1; i <= 11; i++) {
    const container = document.getElementById(`quiz-${i}`);
    if (!container) continue;

    const topicQuestions = QUIZ_DATA.filter(q => q.topic === i);
    if (topicQuestions.length === 0) continue;

    try {
      initQuiz(container, topicQuestions, i);
    } catch (err) {
      console.error(`Quiz ${i} init error:`, err);
    }
  }
}

// ── Intersection Observer for Active Nav ────────────────
function setupNavObserver() {
  const sections = document.querySelectorAll('.topic-section');
  const pills = document.querySelectorAll('.pill[data-topic]');

  // Animate sections on scroll
  const visibilityObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  }, { threshold: 0.05 });

  sections.forEach(s => visibilityObserver.observe(s));

  // Active pill tracking
  const activeObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      const id = e.target.id; // e.g. "topic-3"
      const topicNum = parseInt(id.split('-')[1]);
      const pill = document.querySelector(`.pill[data-topic="${topicNum}"]`);
      if (!pill) return;

      if (e.isIntersecting) {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        // Scroll pill into view
        pill.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });

  sections.forEach(s => activeObserver.observe(s));
}

// ── Shake animation for locked cards ────────────────────
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    25% { transform: translateX(-6px); }
    75% { transform: translateX(6px); }
  }
`;
document.head.appendChild(shakeStyle);

// ── Boot ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  lockExpCards();
  updateProgress();
  initWidgets();
  initQuizzes();
  setupNavObserver();
});
