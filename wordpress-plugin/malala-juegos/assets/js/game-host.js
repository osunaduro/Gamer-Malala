(() => {
    'use strict';

    const protocolVersion = 1;
    const init = (section) => {
        const button = section.querySelector('[data-game-start]');
        const intro = section.querySelector('[data-game-intro]');
        const status = section.querySelector('[data-game-status]');
        const wrap = section.querySelector('[data-game-frame-wrap]');
        const frame = section.querySelector('iframe[data-entry-url]');
        if (!button || !intro || !status || !wrap || !frame) return;

        let started = false;
        let port = null;
        let readyTimer = null;
        let eventWindowStarted = Date.now();
        let eventCount = 0;
        const allowedEvents = new Set(['answer_submitted', 'hint_used', 'difficulty_changed', 'activity_completed', 'session_completed']);

        const showError = (message) => {
            status.textContent = message;
            if (port) {
                port.close();
                port = null;
            }
        };

        const start = () => {
            if (started) return;
            started = true;
            button.disabled = true;
            intro.hidden = true;
            wrap.hidden = false;
            status.textContent = 'Cargando el juego…';
            wrap.scrollIntoView({ block: 'start', behavior: 'auto' });

            frame.addEventListener('error', () => showError('No pudimos abrir el juego. Volvé al catálogo e intentá otra vez.'), { once: true });
            frame.addEventListener('load', () => {
                const channel = new MessageChannel();
                port = channel.port1;
                port.onmessage = (event) => {
                    const message = event.data;
                    if (!message || message.protocolVersion !== protocolVersion || typeof message.type !== 'string') return;
                    if (message.type === 'game:ready') {
                        window.clearTimeout(readyTimer);
                        status.textContent = '';
                    } else if (message.type === 'game:event') {
                        const now = Date.now();
                        if (now - eventWindowStarted >= 60000) {
                            eventWindowStarted = now;
                            eventCount = 0;
                        }
                        if (!message.event || !allowedEvents.has(message.event.name) || !message.event.data || typeof message.event.data !== 'object') return;
                        let eventSize;
                        try {
                            eventSize = JSON.stringify(message.event).length;
                        } catch (error) {
                            return;
                        }
                        if (eventCount >= 120 || eventSize > 8192) return;
                        eventCount += 1;
                        // En modo libre, los eventos se mantienen en el navegador y no se envían al servidor.
                        section.dispatchEvent(new CustomEvent('malala:game-event', {
                            detail: { gameId: frame.dataset.gameId, receivedAt: new Date(now).toISOString(), event: message.event }
                        }));
                    }
                };
                port.start();

                const initMessage = {
                    protocolVersion,
                    type: 'platform:init',
                    session: {
                        id: window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                        mode: 'free',
                        durationSeconds: 300
                    },
                    settings: {
                        difficulty: 'adaptive',
                        audioEnabled: true,
                        theme: 'default',
                        textScale: 1,
                        reducedMotion: false,
                        locale: document.documentElement.lang || 'es-AR'
                    }
                };
                frame.contentWindow.postMessage(initMessage, '*', [channel.port2]);
                readyTimer = window.setTimeout(() => showError('El juego tardó demasiado en responder. Volvé al catálogo e intentá otra vez.'), 8000);
            }, { once: true });

            frame.src = frame.dataset.entryUrl;
        };

        button.addEventListener('click', start);
        window.addEventListener('pagehide', () => {
            window.clearTimeout(readyTimer);
            if (port) port.close();
        }, { once: true });
    };

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('[data-malala-game]').forEach(init);
    });
})();
