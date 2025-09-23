// sync.js - Sync layer: Background sync and API communication

async function trySync() {
  if (!navigator.onLine) {
    console.log('Offline, skipping sync');
    return;
  }

  const db = await dbp;
  const tx = db.transaction('outbox', 'readonly');
  const store = tx.objectStore('outbox');
  const outbox = await new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });

  if (outbox.length === 0) {
    console.log('Outbox empty, nothing to sync');
    return;
  }

  console.log(`Syncing ${outbox.length} items...`);

  try {
    const response = await fetch(CONFIG.SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': CONFIG.API_KEY,
        'X-Client-ID': window.getClientId(),
      },
      body: JSON.stringify({ ops: outbox.map(item => item.payload) }),
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Sync successful:', result);

    // Clear outbox on success
    const clearTx = db.transaction('outbox', 'readwrite');
    const clearStore = clearTx.objectStore('outbox');
    outbox.forEach(item => clearStore.delete(item.id));

    // Mark entries as synced
    const entriesTx = db.transaction('entries', 'readwrite');
    const entriesStore = entriesTx.objectStore('entries');
    outbox.forEach(item => {
      const entry = item.payload;
      entry.synced = true;
      entriesStore.put(entry);
    });

    await updateOutboxCount();
    updateSyncStatus('Synced successfully');
  } catch (error) {
    console.error('Sync error:', error);
    updateSyncStatus(`Sync failed: ${error.message}`);
    // Retry logic could be added here
  }
}

function updateSyncStatus(message) {
  const statusEl = $('syncStatus');
  if (statusEl) {
    statusEl.textContent = message;
    statusEl.classList.remove('hidden');
    setTimeout(() => {
      statusEl.classList.add('hidden');
    }, 3000);
  }
}

async function updateOutboxCount() {
  try {
    const db = await dbp;
    const tx = db.transaction('outbox', 'readonly');
    const store = tx.objectStore('outbox');
    const count = await new Promise((resolve, reject) => {
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    const outboxCountEl = $('outboxCount');
    if (outboxCountEl) {
      outboxCountEl.textContent = count > 0 ? `PENDING ${count}` : '';
    }
  } catch (error) {
    console.error('Failed to update outbox count:', error);
  }
}

window.updateOutboxCount = updateOutboxCount;