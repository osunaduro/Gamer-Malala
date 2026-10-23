(() => {
  'use strict';

  const PROTOCOL_VERSION = 1;
  const WORDS = [
    { word: 'oso', image: 'oso.jpg' },
    { word: 'gato', image: 'gato.jpg' },
    { word: 'vaca', image: 'vaca.jpg' },
    { word: 'rana', image: 'rana.jpg' },
    { word: 'pato', image: 'pato.jpg' },
    { word: 'mono', image: 'mono.jpg' },
    { word: 'mano', image: 'mano.jpg' },
    { word: 'casa', image: 'casa.jpg' },
    { word: 'auto', image: 'auto.jpg' },
    { word: 'avión', image: 'avion.jpg' },
    { word: 'tomate', image: 'tomate.jpg' },
    { word: 'limón', image: 'limon.jpg' },
    { word: 'libro', image: 'libro.jpg' },
    { word: 'ratón', image: 'raton.jpg' },
    { word: 'árbol', image: 'arbol.jpg' }
  ];
  const DISTRACTORS = 'aeiourmnslpt';
  const LEVELS = ['facil', 'intermedio', 'desafiante'];
  const LEVEL_NAMES = { facil: 'Con más ayuda', intermedio: 'A tu ritmo', desafiante: 'Un poco más' };
  const elements = Object.fromEntries([
    'welcome', 'activity', 'finish', 'start', 'again', 'timer-wrap', 'timer', 'progress-label', 'level-label',
    'progress-fill', 'picture', 'prompt', 'answer', 'letter-bank', 'hint', 'clear', 'feedback',
    'finish-title', 'finish-summary', 'summary-words', 'summary-hints', 'summary-time', 'progress-track', 'connection-status'
  ].map((id) => [id, document.getElementById(id)]));

  const state = {
    port: null,
    settings: { audioEnabled: true, difficulty: 'adaptive', durationSeconds: 300 },
    words: [],
    index: 0,
    level: 1,
    wrongAttempts: 0,
    attemptsForWord: 0,
    totalAttempts: 0,
    correctWords: 0,
    correctLetters: 0,
    hintsUsed: 0,
    hintsForWord: 0,
    consecutiveMisses: 0,
    consecutiveClean: 0,
    startedAt: 0,
    remaining: 300,
    timerId: null,
    finished: false,
    target: '',
    selected: [],
    buttons: []
  };

  function sendEvent(name, data) {
    if (!state.port) return;
    state.port.postMessage({ protocolVersion: PROTOCOL_VERSION, type: 'game:event', event: { name, data } });
  }

  function shuffle(items) {
    const result = items.slice();
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function tone(success) {
    if (!state.settings.audioEnabled || !window.AudioContext) return;
    try {
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = success ? 660 : 260;
      gain.gain.setValueAtTime(0.08, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.16);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.17);
      oscillator.addEventListener('ended', () => context.close(), { once: true });
    } catch (error) {
      // El audio es opcional y puede estar bloqueado por el navegador.
    }
  }

  function speak(text) {
    if (!state.settings.audioEnabled || !window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-AR';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }

  function currentWord() { return state.words[state.index]; }

  function updateProgress() {
    elements['progress-label'].textContent = `Palabra ${Math.min(state.index + 1, state.words.length)} de ${state.words.length}`;
    elements['progress-fill'].style.width = `${Math.min(100, (state.index / state.words.length) * 100)}%`;
    elements['progress-track'].setAttribute('aria-valuemax', String(state.words.length));
    elements['progress-track'].setAttribute('aria-valuenow', String(state.index));
    const level = LEVELS[state.level];
    elements['level-label'].textContent = LEVEL_NAMES[level];
  }

  function makeLetterBank() {
    const targetLetters = Array.from(state.target);
    const alreadySelected = state.selected.filter(Boolean).slice();
    const distractorCount = [0, 2, 4][state.level];
    const extras = [];
    const available = Array.from(new Set(DISTRACTORS.split('').filter((letter) => !targetLetters.includes(letter))));
    while (extras.length < distractorCount && available.length) {
      extras.push(available[Math.floor(Math.random() * available.length)]);
    }
    const letters = shuffle(targetLetters.concat(extras));
    elements['letter-bank'].replaceChildren();
    state.buttons = letters.map((letter, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'letter-button';
      button.textContent = letter.toLocaleUpperCase('es-AR');
      button.setAttribute('aria-label', `Letra ${letter}`);
      button.addEventListener('click', () => chooseLetter(button, letter));
      elements['letter-bank'].append(button);
      const selectedIndex = alreadySelected.indexOf(letter);
      if (selectedIndex !== -1) alreadySelected.splice(selectedIndex, 1);
      return { button, letter, index, used: selectedIndex !== -1 };
    });
  }

  function drawAnswer() {
    elements.answer.replaceChildren();
    Array.from(state.target).forEach((_, index) => {
      const slot = document.createElement('span');
      slot.className = `answer-slot${state.selected[index] ? ' filled' : ''}`;
      slot.textContent = state.selected[index] ? state.selected[index].toLocaleUpperCase('es-AR') : '';
      elements.answer.append(slot);
    });
    state.buttons.forEach(({ button, used }) => { button.disabled = used; });
  }

  function showWord() {
    if (state.index >= state.words.length) return finishGame('completed');
    const entry = currentWord();
    state.target = entry.word;
    state.selected = [];
    state.wrongAttempts = 0;
    state.attemptsForWord = 0;
    state.hintsForWord = 0;
    elements.picture.src = `assets/images/${entry.image}`;
    elements.picture.alt = `Imagen de ${entry.word}`;
    elements.prompt.textContent = 'Tocá las letras en orden para formar la palabra.';
    elements.feedback.textContent = '';
    elements['hint'].disabled = false;
    updateProgress();
    makeLetterBank();
    drawAnswer();
    const firstLetter = state.buttons.find((item) => !item.used);
    if (firstLetter) firstLetter.button.focus();
  }

  function setLevel(nextLevel) {
    const bounded = Math.max(0, Math.min(LEVELS.length - 1, nextLevel));
    if (bounded === state.level) return;
    const previous = LEVELS[state.level];
    state.level = bounded;
    const next = LEVELS[state.level];
    updateProgress();
    sendEvent('difficulty_changed', { from: previous, to: next, reason: 'session_performance' });
  }

  function chooseLetter(button, letter) {
    if (state.finished || button.disabled) return;
    const position = state.selected.filter(Boolean).length;
    state.totalAttempts += 1;
    state.attemptsForWord += 1;
    if (letter === state.target[position]) {
      state.selected[position] = letter;
      state.correctLetters += 1;
      const picked = state.buttons.find((item) => item.button === button);
      if (picked) picked.used = true;
      drawAnswer();
      elements.feedback.textContent = '¡Bien! Seguí así.';
      if (state.selected.filter(Boolean).length === state.target.length) {
        state.correctWords += 1;
        state.consecutiveMisses = 0;
        state.consecutiveClean += state.wrongAttempts === 0 && state.hintsForWord === 0 ? 1 : 0;
        sendEvent('answer_submitted', { correct: true, attempts: state.attemptsForWord, hintsUsed: state.hintsForWord });
        sendEvent('activity_completed', { activityId: currentWord().image.replace(/\.jpg$/, ''), correct: true, attempts: state.attemptsForWord, hintsUsed: state.hintsForWord });
        tone(true);
        speak(state.target);
        elements.feedback.textContent = '¡Lo lograste!';
        state.index += 1;
        if (state.consecutiveClean >= 2) {
          setLevel(state.level + 1);
          state.consecutiveClean = 0;
        }
        window.setTimeout(showWord, 850);
      }
      return;
    }

    state.wrongAttempts += 1;
    state.consecutiveMisses += 1;
    state.consecutiveClean = 0;
    button.classList.add('wrong');
    window.setTimeout(() => button.classList.remove('wrong'), 350);
    elements.feedback.textContent = 'No pasa nada. Probá con otra letra.';
    sendEvent('answer_submitted', { correct: false, attempts: state.attemptsForWord, hintsUsed: state.hintsForWord });
    tone(false);
    if (state.wrongAttempts >= 3) giveHint(true);
    if (state.consecutiveMisses >= 3) {
      setLevel(state.level - 1);
      state.consecutiveMisses = 0;
      elements.feedback.textContent = 'Vamos paso a paso. Ahora hay menos letras para elegir.';
      makeLetterBank();
      drawAnswer();
    }
  }

  function giveHint(automatic) {
    if (state.finished) return;
    const position = state.selected.filter(Boolean).length;
    if (position >= state.target.length) return;
    const correct = state.target[position];
    const choice = state.buttons.find((item) => item.letter === correct && !item.button.disabled);
    if (!choice) return;
    state.hintsUsed += 1;
    state.hintsForWord += 1;
    choice.button.classList.add('hinted');
    elements.feedback.textContent = automatic
      ? `Pista: la próxima letra es ${correct.toLocaleUpperCase('es-AR')}.`
      : `La próxima letra es ${correct.toLocaleUpperCase('es-AR')}. ¡Vos podés!`;
    sendEvent('hint_used', { automatic, position: position + 1 });
    window.setTimeout(() => choice.button.classList.remove('hinted'), 1200);
    if (state.wrongAttempts >= 3) elements['hint'].disabled = true;
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const remainder = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remainder}`;
  }

  function finishGame(reason) {
    if (state.finished) return;
    state.finished = true;
    window.clearInterval(state.timerId);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    elements.activity.hidden = true;
    elements.finish.hidden = false;
    elements['progress-fill'].style.width = '100%';
    elements['progress-track'].setAttribute('aria-valuenow', String(state.index));
    const elapsed = Math.round((Date.now() - state.startedAt) / 1000);
    elements['finish-title'].textContent = reason === 'completed' ? '¡Terminaste las imágenes!' : '¡Gracias por jugar!';
    elements['finish-summary'].textContent = reason === 'completed'
      ? '¡Completaste todas las palabras! Cada intento te ayudó a practicar.'
      : `Alcanzaste ${state.correctWords} ${state.correctWords === 1 ? 'palabra' : 'palabras'} durante esta partida. ¡Gracias por practicar!`;
    elements['summary-words'].textContent = String(state.correctWords);
    elements['summary-hints'].textContent = String(state.hintsUsed);
    elements['summary-time'].textContent = formatTime(elapsed);
    elements['finish-title'].focus();
    sendEvent('session_completed', {
      reason,
      completedActivities: state.correctWords,
      totalActivities: state.words.length,
      answerAttempts: state.totalAttempts,
      hintsUsed: state.hintsUsed,
      elapsedSeconds: elapsed,
      accuracy: state.totalAttempts ? Math.round((state.correctLetters / state.totalAttempts) * 100) : 0
    });
  }

  function startGame() {
    state.words = shuffle(WORDS);
    state.index = 0;
    state.level = state.settings.difficulty === 'facil' ? 0 : state.settings.difficulty === 'desafiante' ? 2 : 1;
    state.wrongAttempts = 0;
    state.attemptsForWord = 0;
    state.totalAttempts = 0;
    state.correctLetters = 0;
    state.correctWords = 0;
    state.hintsUsed = 0;
    state.hintsForWord = 0;
    state.consecutiveMisses = 0;
    state.consecutiveClean = 0;
    state.startedAt = Date.now();
    state.finished = false;
    state.remaining = Math.max(0, Number(state.settings.durationSeconds) || 0);
    elements.welcome.hidden = true;
    elements.finish.hidden = true;
    elements.activity.hidden = false;
    elements['timer-wrap'].hidden = !state.remaining;
    showWord();
    if (state.remaining) {
      elements.timer.textContent = formatTime(state.remaining);
      state.timerId = window.setInterval(() => {
        state.remaining -= 1;
        elements.timer.textContent = formatTime(state.remaining);
        if (state.remaining <= 0) finishGame('time_expired');
      }, 1000);
    }
  }

  function handleInit(event) {
    if (event.source !== window.parent || !event.data || event.data.type !== 'platform:init') return;
    if (event.data.protocolVersion !== PROTOCOL_VERSION || !event.ports || !event.ports[0] || state.port) return;
    state.port = event.ports[0];
    const session = event.data.session || {};
    const settings = event.data.settings || {};
    state.settings.audioEnabled = settings.audioEnabled !== false;
    state.settings.difficulty = ['facil', 'intermedio', 'desafiante', 'adaptive'].includes(settings.difficulty) ? settings.difficulty : 'adaptive';
    state.settings.durationSeconds = session.mode === 'free' ? Number(session.durationSeconds) || 0 : 0;
    elements['connection-status'].textContent = 'Listo para jugar.';
    state.port.postMessage({ protocolVersion: PROTOCOL_VERSION, type: 'game:ready' });
  }

  elements.start.addEventListener('click', startGame);
  elements.again.addEventListener('click', () => {
    elements.finish.hidden = true;
    elements.welcome.hidden = false;
    elements.start.focus();
  });
  elements.hint.addEventListener('click', () => giveHint(false));
  elements.clear.addEventListener('click', () => {
    state.selected = [];
    elements.feedback.textContent = 'Probá otra vez, no hay apuro.';
    makeLetterBank();
    drawAnswer();
  });
  window.addEventListener('message', handleInit);
})();
