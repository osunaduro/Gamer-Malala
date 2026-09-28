import { Timer } from './timer.js';
import { Storage } from './storage.js';

/**
 * Juego Malala: Aprendo a escribir
 * Refactorización completa con Bootstrap 5, Minty y Síntesis de voz.
 */

// --- Configuración y Estado ---
const GAME_DURATION = 5 * 60; // 5 minutos por defecto
const state = {
  images: [],
  currentIdx: 0,
  targetLetters: [],
  nextPos: 0,
  playerName: 'Invitado', // Nombre por defecto
  wordsShown: 0,
  wordsCompleted: 0,
  gameStartTs: 0,
  isRunning: false
};

// --- Elementos DOM ---
const elements = {
  image: document.getElementById('wordImage'),
  boxes: document.getElementById('boxes'),
  letters: document.getElementById('letters'),
  message: document.getElementById('message'),
  passBtn: document.getElementById('passBtn'),
  showRankingBtn: document.getElementById('showRankingBtn'),
  playerNameDisplay: document.getElementById('playerNameDisplay'),
  timerDisplay: document.getElementById('timerDisplay'),
  // Modales (instancias de Bootstrap)
  startScreenModal: new bootstrap.Modal(document.getElementById('startScreenModal')),
  rankingModal: new bootstrap.Modal(document.getElementById('rankingModal')),
  gameOverModal: new bootstrap.Modal(document.getElementById('gameOverModal')),
  helpModal: new bootstrap.Modal(document.getElementById('helpModal')),
  sidebar: new bootstrap.Offcanvas(document.getElementById('sidebarMenu')),
  // Inputs y Displays de Modales
  nameInput: document.getElementById('playerNameInput'),
  startGameBtn: document.getElementById('startGameBtn'),
  saveScoreBtn: document.getElementById('saveScoreBtn'),
  sidebarRankingBtn: document.getElementById('sidebarRankingBtn'),
  sidebarNewGameBtn: document.getElementById('sidebarNewGameBtn'),
  saveScoreSection: document.getElementById('saveScoreSection'),
  scoreSavedFeedback: document.getElementById('scoreSavedFeedback'),
  rankingTableBody: document.getElementById('rankingTableBody'),
  finalCompletedCount: document.getElementById('finalCompletedCount'),
  finalTotalCount: document.getElementById('finalTotalCount')
};

const timer = new Timer();

// --- Utilidades de Audio y Voz ---
const audio = {
  ctx: null,
  ensureCtx() {
    if (!this.ctx) {
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
    }
  },
  playTone(freq, duration = 0.15, type = 'sine', gain = 0.1) {
    this.ensureCtx();
    if (!this.ctx) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.value = gain;
    o.connect(g); g.connect(this.ctx.destination);
    const now = this.ctx.currentTime;
    o.start(now);
    g.gain.exponentialRampToValueAtTime(0.001, now + duration);
    o.stop(now + duration + 0.05);
  },
  success() {
    this.playTone(660, 0.1, 'sine', 0.1);
    setTimeout(() => this.playTone(880, 0.15, 'sine', 0.1), 100);
  },
  error() {
    this.playTone(220, 0.2, 'sawtooth', 0.15);
  },
  speak(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Detener locuciones previas
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }
};

// --- Lógica de Juego ---

function normalizeWord(filename) {
  return filename
    .replace(/\.[^/.]+$/, '') // Quitar extensión
    .replace(/[_-]+/g, ' ')   // Guiones por espacios
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Quitar acentos para comparación
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function loadImages() {
  // Intentar primero con el endpoint PHP, sino caer en list.json
  const endpoints = ['images/list.php'];
  
  const tryFetch = (index) => {
    if (index >= endpoints.length) {
      elements.message.textContent = '❌ No se encontraron imágenes.';
      return;
    }
    
    fetch(endpoints[index])
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) throw new Error('Vacío');
        state.images = shuffle(data);
        state.currentIdx = 0;
        // Game is ready, but wait for start button
      })
      .catch(() => tryFetch(index + 1));
  };
  
  tryFetch(0);
}

function renderCurrentWord() {
  if (state.images.length === 0) return;
  
  const filename = state.images[state.currentIdx];
  const word = normalizeWord(filename);
  
  // Feedback visual: fade
  elements.image.style.opacity = 0;
  setTimeout(() => {
    elements.image.src = `images/${filename}`;
    elements.image.style.opacity = 1;
  }, 150);
  
  elements.boxes.innerHTML = '';
  elements.letters.innerHTML = '';
  elements.message.textContent = '';
  state.nextPos = 0;
  state.wordsShown++;

  const chars = Array.from(word);
  const boxes = [];
  
  chars.forEach(ch => {
    const box = document.createElement('div');
    if (ch === ' ') {
      box.className = 'box space';
    } else {
      box.className = 'box';
      box.dataset.filled = 'false';
      boxes.push(box);
    }
    elements.boxes.appendChild(box);
  });

  state.targetLetters = chars.filter(c => c !== ' ');
  state.currentBoxes = boxes; // Guardar referencia para rellenar

  // Teclas mezcladas
  const letterPool = shuffle([...state.targetLetters]);
  letterPool.forEach(ltr => {
    const btn = document.createElement('button');
    btn.className = 'letter-btn shadow-sm';
    btn.textContent = ltr.toUpperCase();
    btn.dataset.letter = ltr;
    btn.onclick = () => onLetterSelect(btn);
    elements.letters.appendChild(btn);
  });
}

function onLetterSelect(btn) {
  if (!state.isRunning || btn.disabled) return;
  
  const selected = btn.dataset.letter;
  const correct = state.targetLetters[state.nextPos];
  
  if (selected === correct) {
    // Acierto
    const box = state.currentBoxes[state.nextPos];
    box.textContent = selected.toUpperCase();
    box.dataset.filled = 'true';
    btn.disabled = true;
    state.nextPos++;
    
    if (state.nextPos >= state.targetLetters.length) {
      state.wordsCompleted++;
      elements.message.innerHTML = '¡Excelente! 💪✨';
      elements.message.classList.add('text-success');
      audio.success();
      audio.speak(normalizeWord(state.images[state.currentIdx]));
      
      // Pasar a la siguiente automáticamente tras un breve delay
      setTimeout(() => {
        nextWord();
      }, 1500);
    }
  } else {
    // Error
    audio.error();
    btn.classList.add('wrong');
    setTimeout(() => btn.classList.remove('wrong'), 400);
  }
}

function nextWord() {
  state.currentIdx = (state.currentIdx + 1) % state.images.length;
  renderCurrentWord();
}

// --- Gestión de Sesión ---

function startNewGame() {
  state.playerName = 'Invitado'; // Reiniciar a invitado
  state.wordsShown = 0;
  state.wordsCompleted = 0;
  state.gameStartTs = Date.now();
  state.isRunning = true;
  
  elements.startScreenModal.hide();
  elements.sidebar.hide(); 
  
  // Resetear secciones del modal de fin
  elements.saveScoreSection.classList.remove('d-none');
  elements.scoreSavedFeedback.classList.add('d-none');
  elements.nameInput.value = '';

  renderCurrentWord();
  
  timer.start(GAME_DURATION, (rem) => {
    elements.timerDisplay.textContent = Timer.format(rem);
    if (rem < 30) {
      elements.timerDisplay.classList.remove('bg-secondary');
      elements.timerDisplay.classList.add('bg-danger');
    } else {
      elements.timerDisplay.classList.remove('bg-danger');
      elements.timerDisplay.classList.add('bg-secondary');
    }
  }, onGameOver);
}

function onGameOver() {
  state.isRunning = false;
  timer.stop();
  
  elements.finalCompletedCount.textContent = state.wordsCompleted;
  elements.finalTotalCount.textContent = state.wordsShown;
  elements.gameOverModal.show();
}

async function saveScore() {
  const name = (elements.nameInput.value || 'Jugador').trim();
  const timeTaken = Math.floor((Date.now() - state.gameStartTs) / 1000);
  
  const record = {
    name: name,
    completed: state.wordsCompleted,
    total: state.wordsShown,
    timeTakenSeconds: timeTaken,
    timestamp: Date.now()
  };
  
  // Mostrar feedback visual
  elements.saveScoreBtn.disabled = true;
  elements.saveScoreBtn.textContent = 'Guardando...';
  
  try {
    await Storage.addRecord(record);
    elements.saveScoreSection.classList.add('d-none');
    elements.scoreSavedFeedback.classList.remove('d-none');
  } catch (error) {
    console.error("Error saving score:", error);
    alert("Hubo un problema al guardar el récord. Revisa tu conexión.");
  } finally {
    elements.saveScoreBtn.disabled = false;
    elements.saveScoreBtn.textContent = 'Guardar mi Récord 🌟';
  }
}

async function showRanking() {
  const top = await Storage.getTop();
  elements.rankingTableBody.innerHTML = '';
  
  if (top.length === 0) {
    elements.rankingTableBody.innerHTML = '<tr><td colspan="4" class="text-center p-4 text-muted">No hay récords todavía 🌟</td></tr>';
  } else {
    top.forEach((r, i) => {
      const tr = document.createElement('tr');
      const crown = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1;
      tr.innerHTML = `
        <td class="ps-4 fw-bold">${crown}</td>
        <td>${r.name}</td>
        <td class="text-center">${r.completed}/${r.total}</td>
        <td class="text-center text-muted small">${r.timeTakenSeconds}s</td>
      `;
      elements.rankingTableBody.appendChild(tr);
    });
  }
  elements.rankingModal.show();
}

// --- Inicialización ---

document.addEventListener('DOMContentLoaded', () => {
  loadImages();
  
  // Mostrar pantalla inicial tras cargar recursos
  setTimeout(() => elements.startScreenModal.show(), 500);

  // Eventos de botones
  elements.startGameBtn.onclick = startNewGame;
  elements.saveScoreBtn.onclick = saveScore;
  
  // Eventos de Sidebar
  elements.sidebarRankingBtn.onclick = () => {
    elements.sidebar.hide();
    showRanking();
  };
  
  elements.sidebarNewGameBtn.onclick = () => {
    elements.sidebar.hide();
    startNewGame();
  };

  elements.passBtn.onclick = () => state.isRunning && nextWord();

  // Soporte teclado físico
  window.onkeydown = (e) => {
    if (!state.isRunning) return;
    
    // Evitar que el teclado físico funcione si hay un modal abierto (ej. el de fin de juego)
    if (document.querySelector('.modal.show')) return;

    const key = e.key.toLowerCase();
    if (!/^[a-zñáéíóúü ]$/.test(key)) return;
    
    const normalized = key.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const activeBtns = Array.from(elements.letters.querySelectorAll('.letter-btn:not(:disabled)'));
    const target = activeBtns.find(b => b.dataset.letter === normalized);
    if (target) target.click();
  };
});
