// Lógica principal de la app
const imageEl = document.getElementById('wordImage');
const boxesEl = document.getElementById('boxes');
const lettersEl = document.getElementById('letters');
const messageEl = document.getElementById('message');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const resetBtn = document.getElementById('resetBtn');

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
      current = 0;
      buildForImage(images[current]);
    })
    .catch(err=>{
      console.error(err);
      messageEl.textContent = 'Error cargando images/list.php';
    });
}

prevBtn.addEventListener('click', ()=>{
  if(images.length===0) return;
  current = (current - 1 + images.length) % images.length;
  buildForImage(images[current]);
});
nextBtn.addEventListener('click', ()=>{
  if(images.length===0) return;
  current = (current + 1) % images.length;
  buildForImage(images[current]);
});
resetBtn.addEventListener('click', ()=>{
  if(images.length===0) return;
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
