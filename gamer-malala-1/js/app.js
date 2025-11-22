// js/app.js
let words = [];
let currentWordIndex = 0;
let score = 0;
let timer;
let timeLeft = 600; // 10 minutes in seconds
let totalWords = 9;

document.addEventListener('DOMContentLoaded', () => {
    loadWords();
    startGame();
    document.getElementById('passBtn').addEventListener('click', nextWord);
});

function loadWords() {
    fetch('data/words.json')
        .then(response => response.json())
        .then(data => {
            words = data;
            displayWord();
        });
}

function displayWord() {
    if (currentWordIndex < totalWords) {
        const wordData = words[currentWordIndex];
        document.getElementById('wordImage').src = wordData.image;
        document.getElementById('letters').innerHTML = '';
        wordData.letters.forEach(letter => {
            const letterButton = document.createElement('button');
            letterButton.textContent = letter;
            letterButton.addEventListener('click', () => checkLetter(letter));
            document.getElementById('letters').appendChild(letterButton);
        });
    } else {
        endGame();
    }
}

function checkLetter(letter) {
    const currentWord = words[currentWordIndex].word;
    if (letter === currentWord[score]) {
        score++;
        if (score === currentWord.length) {
            currentWordIndex++;
            score = 0;
            displayWord();
        }
    } else {
        document.getElementById('message').textContent = 'Incorrecto!';
        document.getElementById('message').classList.add('error');
        setTimeout(() => {
            document.getElementById('message').textContent = '';
            document.getElementById('message').classList.remove('error');
        }, 1000);
    }
}

function nextWord() {
    currentWordIndex++;
    score = 0;
    displayWord();
}

function startGame() {
    timer = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
            clearInterval(timer);
            endGame();
        }
        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timer').textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function endGame() {
    clearInterval(timer);
    document.getElementById('message').textContent = 'Juego terminado!';
    saveScore();
}

function saveScore() {
    // Logic to save the score to record.json using storage.js
}