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
const perfectQuizzes = new Set(JSON.parse(localStorage.getItem('chem-quiz-perfect') || '[]'));

function savePerfectQuizzes() {
  localStorage.setItem('chem-quiz-perfect', JSON.stringify([...perfectQuizzes]));
}

function updateQuizStreak() {
  const count = perfectQuizzes.size;
  const countEl = document.getElementById('quiz-streak-count');
  const wrapEl  = document.getElementById('quiz-streak-wrap');
  if (countEl) countEl.textContent = count;
  if (wrapEl)  wrapEl.style.display = count > 0 ? 'inline-flex' : 'none';
}

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

  // Completion celebration
  if (count === 11 && !document.getElementById('completion-toast')) {
    const toast = document.createElement('div');
    toast.id = 'completion-toast';
    toast.style.cssText = `
      position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);
      background:linear-gradient(135deg,rgba(81,207,102,0.95),rgba(77,171,247,0.9));
      color:#000; padding:1.5rem 2rem; border-radius:16px; text-align:center;
      font-weight:700; font-size:1.1rem; z-index:999; box-shadow:0 0 40px rgba(81,207,102,0.5);
      animation:fadeInUp 0.5s ease;
    `;
    toast.innerHTML = `🏆 Alle 11 Themen freigeschaltet!<br><span style="font-size:0.85rem;font-weight:400">Du hast die gesamte Chemie-Lernseite abgeschlossen!</span>`;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.5s'; setTimeout(() => toast.remove(), 500); }, 4000);
  }
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
  { id: 6,  init: initEpb,         topics: [6, 7] }, // EPB widget unlocks both 6 and 7
  { id: 7,  init: null,            topics: [7] },  // Integrated in widget-6
  { id: 8,  init: initMetall,      topics: [8] },
  { id: 9,  init: initEN,          topics: [9, 10] }, // EN-Rechner unlocks both 9 and 10
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

  // Widget 7 shares EPB widget – shows link, unlocked when widget-6 is used
  const w7 = document.getElementById('widget-7');
  if (w7) {
    w7.innerHTML = `
      <div style="padding:1rem; text-align:center">
        <div style="font-size:1.5rem; margin-bottom:0.5rem">🌬️</div>
        <p style="font-weight:600; color:var(--text); margin-bottom:0.5rem">Luft als Isolator – EPB in Aktion</p>
        <p style="color:var(--text-muted); font-size:0.9rem; margin-bottom:0.75rem">
          Dieses Thema baut auf dem EPB-Widget auf. Untersuche N₂ und O₂ dort!
        </p>
        <a href="#topic-6" class="btn btn-secondary" style="font-size:0.85rem; text-decoration:none">
          👆 Zum EPB-Widget (Thema 6)
        </a>
        <p style="margin-top:0.75rem; font-size:0.82rem; color:var(--text-muted)">
          Wähle N₂ oder O₂ → "Zusammenschieben" → Erklärung wird freigeschaltet!
        </p>
      </div>`;
  }

  // Widget 10 shares EN-Rechner from widget-9
  const w10 = document.getElementById('widget-10');
  if (w10) {
    w10.innerHTML = `
      <div style="padding:1rem; text-align:center">
        <div style="font-size:1.5rem; margin-bottom:0.5rem">⚖️</div>
        <p style="font-weight:600; color:var(--text); margin-bottom:0.5rem">ΔEN und Bindungstypen</p>
        <p style="color:var(--text-muted); font-size:0.9rem; margin-bottom:0.75rem">
          Nutze den EN-Rechner aus Thema 9, um verschiedene Bindungstypen zu bestimmen!
        </p>
        <a href="#topic-9" class="btn btn-secondary" style="font-size:0.85rem; text-decoration:none">
          👆 Zum EN-Rechner (Thema 9)
        </a>
        <p style="margin-top:0.75rem; font-size:0.82rem; color:var(--text-muted)">
          Probiere: Na+Cl (Ionenbindung), H+Cl (polare Bindung), H+H (unpolar)
        </p>
      </div>`;
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

    // Listen for quiz completion → update pill + streak
    container.addEventListener('quiz-complete', e => {
      const { topicId, allCorrect } = e.detail;
      const pill = document.querySelector(`.pill[data-topic="${topicId}"]`);
      if (pill && allCorrect) {
        pill.classList.add('done');
      }
      if (allCorrect && !perfectQuizzes.has(topicId)) {
        perfectQuizzes.add(topicId);
        savePerfectQuizzes();
        updateQuizStreak();
      }
    });
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

// ── Reset Progress ───────────────────────────────────────
function setupResetButton() {
  const btn = document.getElementById('reset-progress-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (confirm('Gesamten Fortschritt zurücksetzen? Alle freigeschalteten Themen und Quiz-Punkte werden zurückgesetzt.')) {
      localStorage.removeItem('chem-unlocked');
      localStorage.removeItem('chem-quiz-perfect');
      location.reload();
    }
  });
}

// ── Exp-Card "Zum Quiz" Deeplinks ───────────────────────
function setupExpQuizLinks() {
  for (let i = 1; i <= 11; i++) {
    const expCard = document.getElementById(`exp-${i}`);
    if (!expCard) continue;
    const body = expCard.querySelector('.exp-body');
    if (!body) continue;

    const link = document.createElement('div');
    link.style.cssText = 'text-align:right; margin-top:1rem; padding-top:0.75rem; border-top:1px solid var(--border)';
    link.innerHTML = `<a href="#quiz-${i}" class="btn btn-secondary" style="font-size:0.8rem; text-decoration:none; display:inline-flex; align-items:center; gap:0.4rem">
      📝 Zum Quiz →
    </a>`;
    body.appendChild(link);
  }
}

// ── Topic Prev/Next Navigation ───────────────────────────
function setupTopicNavigation() {
  const sections = document.querySelectorAll('.topic-section');
  sections.forEach((section, idx) => {
    const nav = document.createElement('div');
    nav.className = 'topic-nav-buttons';
    nav.style.cssText = 'display:flex; justify-content:space-between; align-items:center; margin-top:1rem; gap:0.5rem';

    const hasPrev = idx > 0;
    const hasNext = idx < sections.length - 1;

    nav.innerHTML = `
      ${hasPrev ? `<a href="#${sections[idx - 1].id}" class="btn btn-secondary" style="font-size:0.82rem; text-decoration:none">
        ← ${sections[idx - 1].querySelector('h2')?.textContent || 'Zurück'}
      </a>` : '<span></span>'}
      ${hasNext ? `<a href="#${sections[idx + 1].id}" class="btn btn-secondary" style="font-size:0.82rem; text-decoration:none">
        ${sections[idx + 1].querySelector('h2')?.textContent || 'Weiter'} →
      </a>` : '<a href="#topic-1" class="btn btn-secondary" style="font-size:0.82rem; text-decoration:none">↑ Zum Anfang</a>'}
    `;
    section.appendChild(nav);
  });
}

// ── Boot ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  lockExpCards();
  updateProgress();
  initWidgets();
  initQuizzes();
  setupNavObserver();
  setupResetButton();
  setupTopicNavigation();
  setupExpQuizLinks();
  updateQuizStreak();
});
