(() => {
  'use strict';
  const protocolVersion = 1;
  const status = document.getElementById('status');
  const button = document.getElementById('complete');
  let platformPort = null;

  window.addEventListener('message', (event) => {
    if (event.source !== window.parent || !event.data || event.data.type !== 'platform:init') return;
    if (event.data.protocolVersion !== protocolVersion || !event.ports[0]) return;

    platformPort = event.ports[0];
    status.textContent = 'Conexión lista. Esta actividad de muestra no guarda datos.';
    button.disabled = false;
    platformPort.postMessage({ protocolVersion, type: 'game:ready' });
  });

  button.addEventListener('click', () => {
    if (!platformPort) return;
    button.disabled = true;
    status.textContent = '¡Actividad completada! El portal recibió el evento de prueba.';
    platformPort.postMessage({
      protocolVersion,
      type: 'game:event',
      event: { name: 'activity_completed', data: { completed: true } }
    });
  });
})();
