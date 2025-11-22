import { Timer } from './timer.js';
import { Storage } from './storage.js';

// Lógica principal de la app
const imageEl = document.getElementById('wordImage');
const boxesEl = document.getElementById('boxes');
const lettersEl = document.getElementById('letters');
const messageEl = document.getElementById('message');
const passBtn = document.getElementById('passBtn');

let images = [];
let current = 0;
let targetLetters = []; // sin espacios
let boxes = []; // nodos .box para las letras (sin espacios)
let nextPos = 0;

// WebAudio: funciones simples para reproducir tonos de acierto/error
const AudioContextClass = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
function ensureAudio(){
  if(!audioCtx){
    try{ audioCtx = new AudioContextClass(); }catch(e){ audioCtx = null; }
  }
}

function playTone(freq, duration = 0.12, type = 'sine', gain = 0.18){
  ensureAudio();
  if(!audioCtx) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.value = gain;
  o.connect(g); g.connect(audioCtx.destination);
  const now = audioCtx.currentTime;
  o.start(now);
  g.gain.setValueAtTime(gain, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + duration);
  o.stop(now + duration + 0.02);
}

function playSuccess(){
  // pequeña secuencia de dos tonos ascendentes
  ensureAudio(); if(!audioCtx) return;
  playTone(660, 0.12, 'sine', 0.14);
  setTimeout(()=>playTone(880, 0.14, 'sine', 0.14), 140);
}

function playError(){
  // tono bajo corto
  playTone(220, 0.18, 'sawtooth', 0.22);
}

function normalizeWord(name){
  return name
    .replace(/\.[^/.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'');
}

function shuffle(a){
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]
  }
  return a;
}

function buildForImage(filename){
  const word = normalizeWord(filename);
  imageEl.src = `images/${filename}`;
  imageEl.alt = word;
  // preparar cajas
  boxesEl.innerHTML = '';
  lettersEl.innerHTML = '';
  messageEl.textContent = '';
  nextPos = 0;

  const chars = Array.from(word);
  // crear cajas visuales; guardamos referencias sólo para letras (no espacios)
  boxes = [];
  chars.forEach(ch=>{
    if(ch === ' '){
      const s = document.createElement('div');
      s.className = 'box space';
      boxesEl.appendChild(s);
    } else {
      const b = document.createElement('div');
      b.className = 'box';
      b.dataset.filled = 'false';
      boxesEl.appendChild(b);
      boxes.push(b);
    }
  });

  targetLetters = chars.filter(c=>c!==' ');

  // crear botones con letras mezcladas
  const letterPool = [...targetLetters];
  shuffle(letterPool);
  letterPool.forEach((ltr, idx)=>{
    const btn = document.createElement('button');
    btn.className = 'letter-btn';
    btn.textContent = ltr.toUpperCase();
    btn.dataset.letter = ltr;
    btn.dataset.idx = idx;
    btn.addEventListener('click', ()=> onLetterClick(btn));
    lettersEl.appendChild(btn);
  });
}

function onLetterClick(btn){
  const ltr = btn.dataset.letter;
  if(btn.disabled) return;
  if(ltr === targetLetters[nextPos]){
    // colocar en la siguiente caja libre
    const box = boxes[nextPos];
    box.textContent = ltr.toUpperCase();
    box.dataset.filled = 'true';
    btn.disabled = true;
    nextPos++;
    if(nextPos >= targetLetters.length){
      messageEl.textContent = '¡Muy bien! ✅';
      messageEl.style.color = 'var(--success)';
      playSuccess();
    }
  } else {
    btn.classList.add('wrong');
    setTimeout(()=>btn.classList.remove('wrong'),350);
    // pequeña retroalimentación
    playError();
  }
}

function loadList(){
  // solicitamos al endpoint PHP que lista automáticamente las imágenes
  fetch('images/list.php')
    .then(r=>r.json())
    .then(arr=>{
      images = arr;
      if(!images || images.length===0){
        messageEl.textContent = 'No hay imágenes en la carpeta images (o images/list.php no devolvió datos)';
        return;
      }
      // Mezclar aleatoriamente las imágenes
      shuffle(images);
      current = 0;
      buildForImage(images[current]);
    })
    .catch(err=>{
      console.error(err);
      messageEl.textContent = 'Error cargando images/list.php';
    });
}

passBtn.addEventListener('click', ()=>{
  if(images.length===0) return;
  current = (current + 1) % images.length;
  buildForImage(images[current]);
});

// Soporte teclado: presionar la letra equivalente habilita el primer botón disponible con esa letra
window.addEventListener('keydown', (e)=>{
  const key = e.key.toLowerCase();
  if(!/^[a-zñáéíóúü ]$/.test(key)) return;
  const normalized = key.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const buttons = Array.from(document.querySelectorAll('.letter-btn')).filter(b=>!b.disabled);
  const target = buttons.find(b=>b.dataset.letter === normalized);
  if(target) target.click();
});

// iniciar
document.addEventListener('DOMContentLoaded', ()=>{
  loadList();
});

document.addEventListener('DOMContentLoaded', () => {
  const nameModal = document.getElementById('nameModal');
  const playerNameInput = document.getElementById('playerNameInput');
  const startGameBtn = document.getElementById('startGameBtn');
  const playerNameDisplay = document.getElementById('playerNameDisplay');
  const timerDisplay = document.getElementById('timerDisplay');
  const showRankingBtn = document.getElementById('showRankingBtn');

  const GAME_DURATION = 10 * 60; // 10 minutos en segundos
  let playerName = 'Jugador';
  let wordsShown = 0;
  let wordsCompleted = 0;
  let gameStartTs = 0;

  const timer = new Timer();

  function startGame() {
    playerName = (playerNameInput.value || 'Jugador').trim();
    playerNameDisplay.textContent = `Jugador: ${playerName}`;
    nameModal.style.display = 'none';
    wordsShown = 0;
    wordsCompleted = 0;
    gameStartTs = Date.now();

    // comenzar temporizador
    timer.start(GAME_DURATION, (remaining) => {
      timerDisplay.textContent = Timer.format(remaining);
    }, onTimeUp);

    // TODO: inicializar o reiniciar la lógica actual del juego (mostrar primera palabra)
    // Si tu app.js ya tiene función para iniciar juego, llama a ella aquí.
    if (typeof initGame === 'function') initGame(); // optional hook
  }

  startGameBtn.addEventListener('click', startGame);
  playerNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') startGame();
  });

  // Mostrar ranking
  showRankingBtn.addEventListener('click', () => {
    const top = Storage.getTop();
    if (!top || top.length === 0) {
      alert('No hay registros aún.');
      return;
    }
    const text = top.map((r, i) => `${i+1}. ${r.name} — ${r.completed}/${r.total} en ${r.timeTakenSeconds || 0}s`).join('\n');
    alert('Top 10:\n' + text);
  });

  function onTimeUp() {
    endGame();
  }

  // Funciones para que el juego actual actualice contadores:
  // Llama a incrementShown() cada vez que se muestra una nueva palabra.
  // Llama a incrementCompleted() cuando el jugador completa correctamente una palabra.
  window.incrementShown = function() {
    wordsShown += 1;
  };

  window.incrementCompleted = function() {
    wordsCompleted += 1;
  };

  function endGame() {
    timer.stop();
    const timeTakenSeconds = Math.floor((Date.now() - gameStartTs) / 1000);
    const record = {
      name: playerName,
      completed: wordsCompleted,
      total: wordsShown,
      timeTakenSeconds,
      timestamp: Date.now()
    };
    const top = Storage.addRecord(record);
    // mostrar resumen
    alert(`Tiempo terminado.\nCompletadas: ${wordsCompleted}/${wordsShown}\nTu puesto (si quedó en top):\n` +
      (top.findIndex(r => r.timestamp === record.timestamp) + 1 || 'No entró en top'));
    // TODO: detener/poner en pausa la lógica del juego actual
    if (typeof pauseGame === 'function') pauseGame(); // optional hook
  }

  // Exponer función para terminar manualmente (por ejemplo botón)
  window.endCurrentGame = endGame;

  // Si quieres que el modal desaparezca y comience con nombre guardado previamente:
  const lastRecords = Storage.getTop();
  if (lastRecords && lastRecords.length > 0 && lastRecords[0].name) {
    // prefill input con último jugador conocido
    playerNameInput.value = lastRecords[0].name;
  }
});
