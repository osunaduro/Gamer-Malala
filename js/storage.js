const STORAGE_KEY = 'gamerMalala_records_v1';
const API_BASE = 'api/records.php';

export const Storage = {
  // Carga persistente local (síncrona)
  loadLocal() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  },

  // Guarda persistente local
  saveLocal(records) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {}
  },

  /**
   * Obtiene el ranking. Primero intenta del servidor, sino usa local.
   */
  async getTop() {
    try {
      const resp = await fetch(API_BASE);
      if (resp.ok) {
        const remote = await resp.json();
        this.saveLocal(remote);
        return remote;
      }
    } catch (e) {
      console.warn('Error accediendo al ranking global, usando local.', e);
    }
    return this.loadLocal();
  },

  /**
   * Agrega un récord y lo sincroniza con el servidor.
   */
  async addRecord(entry) {
    try {
      const resp = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
      if (resp.ok) {
        const updated = await resp.json();
        this.saveLocal(updated);
        return updated;
      }
    } catch (e) {
      console.error('Error sincronizando récord con el servidor', e);
    }

    // Fallback local si el servidor falla
    const local = this.loadLocal();
    local.push(entry);
    local.sort((a, b) => {
      if (b.completed !== a.completed) return b.completed - a.completed;
      return (a.timeTakenSeconds || 0) - (b.timeTakenSeconds || 0);
    });
    const top = local.slice(0, 10);
    this.saveLocal(top);
    return top;
  }
};