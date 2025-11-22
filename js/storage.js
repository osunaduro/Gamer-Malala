const STORAGE_KEY = 'gamerMalala_records_v1';
const API_BASE = '/api/records.php';

export const Storage = {
  loadRecords() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (e) {
      console.error('Error loading records', e);
      return [];
    }
  },

  saveRecords(records) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Error saving records', e);
    }
  },

  addRecord(entry) {
    // entry: { name, completed, total, timeTakenSeconds, timestamp }
    const records = Storage.loadRecords();
    records.push(entry);
    // ordenar: más completados primero; en empate, menor timeTakenSeconds primero
    records.sort((a, b) => {
      if (b.completed !== a.completed) return b.completed - a.completed;
      return (a.timeTakenSeconds || 0) - (b.timeTakenSeconds || 0);
    });
    const top = records.slice(0, 10);
    Storage.saveRecords(top);
    return top;
  },

  getTop() {
    return Storage.loadRecords();
  }
};