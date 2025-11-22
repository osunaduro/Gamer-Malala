// timer.js

let timeLimit = 10 * 60; // 10 minutes in seconds
let timerInterval;
let timeRemaining = timeLimit;

function startTimer() {
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    if (timeRemaining <= 0) {
        clearInterval(timerInterval);
        notifyTimeUp();
    } else {
        timeRemaining--;
        displayTime();
    }
}

function displayTime() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    document.getElementById('timerDisplay').innerText = formattedTime; // Ensure there's an element with this ID in your HTML
}

function notifyTimeUp() {
    document.getElementById('message').innerText = "¡Tiempo agotado! Has completado el juego.";
    // Additional logic to end the game can be added here
}

function resetTimer() {
    clearInterval(timerInterval);
    timeRemaining = timeLimit;
    displayTime();
}

export { startTimer, resetTimer };