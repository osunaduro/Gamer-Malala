// storage.js
const STORAGE_KEY = 'gameRecords';

function saveRecord(playerName, score) {
    let records = getRecords();
    records.push({ name: playerName, score: score });
    records.sort((a, b) => b.score - a.score);
    records = records.slice(0, 10); // Keep only top 10 records
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function getRecords() {
    const records = localStorage.getItem(STORAGE_KEY);
    return records ? JSON.parse(records) : [];
}

function clearRecords() {
    localStorage.removeItem(STORAGE_KEY);
}