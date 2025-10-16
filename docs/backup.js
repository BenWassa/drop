/**
 * ===========================
 * BACKUP MODULE
 * ===========================
 *
 * Handles automatic backups of the drop app state to a user-selected folder
 * on the local device using the File System Access API.
 *
 * Responsibilities:
 * - Persist the user's chosen directory handle using IndexedDB
 * - Throttle automatic backups after Store.save() calls
 * - Provide manual "Backup Now" support from the settings menu
 * - Keep the backup folder tidy by rotating daily snapshots
 * - Avoid redundant writes by hashing the payload before saving
 */

const Backup = {
  DB_NAME: 'drop-backup',
  STORE_NAME: 'handles',
  HANDLE_KEY: 'local-backup-dir',
  METADATA_KEY: 'drop-backup-metadata',
  AUTO_DELAY_MS: 4000,
  MAX_DAILY_FILES: 14,
  MAX_ENTRY_SNAPSHOTS: 120,

  dirHandle: null,
  pendingTimer: null,
  busy: false,
  supported: false,
  ready: false,
  metadata: {
    lastBackupISO: '',
    lastDailyISO: '',
    lastHash: ''
  },

  async persistHandle(handle) {
    const db = await this.openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.STORE_NAME, 'readwrite');
      const store = tx.objectStore(this.STORE_NAME);
      const req = store.put(handle, this.HANDLE_KEY);
      req.onsuccess = () => {
        resolve();
        db.close();
      };
      req.onerror = () => {
        reject(req.error);
        db.close();
      };
    });
  },
  getState: null,

  async init({ getState } = {}) {
    this.getState = typeof getState === 'function'
      ? getState
      : () => (typeof Store !== 'undefined' ? Store.state : {});

    this.supported = this.checkSupport();
    this.loadMetadata();

    if (!this.supported) {
      this.updateUI({
        statusText: 'Local folder backups are not available on this device.',
        unsupported: true,
        ready: false
      });
      return;
    }

    console.log('Backup: Initializing backup system...');
    try {
      this.dirHandle = await this.loadHandle();
    } catch (error) {
      console.error('Backup: Failed to load stored directory handle', error);
      this.dirHandle = null;
    }

    if (!this.dirHandle) {
      this.updateUI({ statusText: 'Choose a folder to store automatic backups.' });
      return;
    }

    // Try to validate existing backup data
    const backupValid = await this.validateExistingBackup();
    if (!backupValid) {
      console.log('Backup: Existing backup data is invalid or outdated, prompting for new backup folder');
      this.dirHandle = null;
      this.updateUI({ statusText: 'Backup data needs updating. Please choose a new backup folder.' });
      return;
    }

    const hasPermission = await this.ensurePermission(this.dirHandle, 'readwrite', false);

    if (!hasPermission) {
      this.updateUI({
        statusText: 'Allow folder access to resume automatic backups.',
        ready: false,
        needsPermission: true
      });
      return;
    }

    this.ready = true;
    this.updateUI({
      statusText: this.describeCurrentStatus(),
      ready: true
    });
    this.scheduleBackup('startup');
  },

  checkSupport() {
    return typeof window !== 'undefined'
      && 'showDirectoryPicker' in window
      && typeof indexedDB !== 'undefined';
  },

  loadMetadata() {
    try {
      const raw = localStorage.getItem(this.METADATA_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.metadata = { ...this.metadata, ...parsed };
      }
    } catch (error) {
      console.warn('Backup: Failed to read metadata', error);
    }
  },

  saveMetadata() {
    try {
      localStorage.setItem(this.METADATA_KEY, JSON.stringify(this.metadata));
    } catch (error) {
      console.warn('Backup: Failed to persist metadata', error);
    }
  },

  async openDb() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, 1);
      request.onerror = () => reject(request.error);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
    });
  },

  async validateExistingBackup() {
    if (!this.dirHandle) {
      console.log('Backup: validateExistingBackup called but no dirHandle');
      return false;
    }

    try {
      // Check if we can access the directory
      const hasPermission = await this.ensurePermission(this.dirHandle, 'readwrite', true);
      if (!hasPermission) {
        console.log('Backup: Permission not granted for existing backup folder');
        return false;
      }

      // Check if the backup folder has the expected structure
      // Look for recent backup files
      const recentBackups = [];
      try {
        for await (const [name, handle] of this.dirHandle.entries()) {
          if (name.endsWith('.json') && name.includes('drop-state')) {
            // Check if it's a recent file (within last 30 days)
            const file = await handle.getFile();
            const fileDate = new Date(file.lastModified);
            const daysSinceModified = (Date.now() - fileDate.getTime()) / (1000 * 60 * 60 * 24);
            
            if (daysSinceModified <= 30) {
              recentBackups.push({ name, date: fileDate, size: file.size });
            }
          }
        }
      } catch (error) {
        console.warn('Backup: Error checking existing backup files', error);
        return false;
      }

      // If we have recent backup files, consider the backup valid
      if (recentBackups.length > 0) {
        console.log(`Backup: Found ${recentBackups.length} recent backup files, validating existing setup`);
        return true;
      }

      // If no recent backups but folder exists, we might need to create new backups
      console.log('Backup: Folder exists but no recent backups found, will create new backups');
      return true;

    } catch (error) {
      console.error('Backup: Error validating existing backup', error);
      return false;
    }
  },

  async loadHandle() {
    const db = await this.openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.STORE_NAME, 'readonly');
      const store = tx.objectStore(this.STORE_NAME);
      const req = store.get(this.HANDLE_KEY);
      req.onsuccess = () => {
        console.log('Backup: Retrieved handle from IndexedDB:', handle ? 'handle exists' : 'no handle stored');
        
        // If we have a handle, validate it before returning
        if (handle) {
          this.dirHandle = handle;
          this.validateExistingBackup().then(isValid => {
            console.log('Backup: Validation result:', isValid ? 'valid' : 'invalid');
            if (isValid) {
              console.log('Backup: Loaded and validated existing backup folder');
              resolve(handle);
            } else {
              console.log('Backup: Existing backup folder is invalid, will prompt for new folder');
              this.dirHandle = null;
              resolve(null);
            }
          }).catch(error => {
            console.warn('Backup: Error validating loaded handle, will prompt for new folder', error);
            this.dirHandle = null;
            resolve(null);
          });
        } else {
          resolve(null);
        }
      };
      req.onerror = () => {
        reject(req.error);
        db.close();
      };
    });
  },

  async ensurePermission(handle, mode = 'readwrite', request = false) {
    if (!handle || typeof handle.queryPermission !== 'function') {
      console.log('Backup: ensurePermission - no handle or no queryPermission function');
      return true;
    }

    const options = { mode };
    try {
      const status = await handle.queryPermission(options);
      if (status === 'granted') {
        return true;
      }
      if (status === 'prompt' && request) {
        const result = await handle.requestPermission(options);
        return result === 'granted';
      }
      if (!request) {
        return false;
      }
      if (typeof handle.requestPermission === 'function') {
        const result = await handle.requestPermission(options);
        return result === 'granted';
      }
    } catch (error) {
      console.warn('Backup: Permission request failed', error);
    }
    return false;
  },

  describeCurrentStatus() {
    if (!this.dirHandle) {
      return 'Choose a folder to store automatic backups.';
    }
    if (this.metadata.lastBackupISO) {
      return `Last backup: ${this.formatTimestamp(this.metadata.lastBackupISO)}`;
    }
    return 'Backup folder linked. Backups run automatically after changes.';
  },

  updateUI({ statusText = '', ready, needsPermission = false, unsupported = false, busy = this.busy } = {}) {
    if (typeof UI === 'undefined' || typeof UI.setBackupState !== 'function') {
      return;
    }

    const resolvedReady = typeof ready === 'boolean'
      ? ready
      : Boolean(this.dirHandle && !needsPermission && !unsupported);

    this.ready = resolvedReady;
    UI.setBackupState({
      statusText: statusText || this.describeCurrentStatus(),
      ready: resolvedReady,
      needsPermission,
      unsupported,
      busy
    });
  },

  async chooseDirectory() {
    if (!this.supported) {
      if (typeof UI !== 'undefined') {
        UI.notify?.('Local folder backups are not supported on this device.');
      }
      this.updateUI({
        statusText: 'Local folder backups are not available on this device.',
        unsupported: true,
        ready: false
      });
      return;
    }

    try {
      const rootHandle = await window.showDirectoryPicker({ id: 'drop-backups', mode: 'readwrite' });
      const dirHandle = await rootHandle.getDirectoryHandle('drop-backups', { create: true });
      const granted = await this.ensurePermission(dirHandle, 'readwrite', true);

      if (!granted) {
        throw new Error('permission-denied');
      }

      this.dirHandle = dirHandle;
      await this.persistHandle(dirHandle);
      this.metadata.lastBackupISO = '';
      this.metadata.lastDailyISO = '';
      this.metadata.lastHash = '';
      this.saveMetadata();
      this.ready = true;
      this.updateUI({ statusText: 'Backup folder connected. Creating first backup…', ready: true, busy: true });
      await this.performBackup('setup');
      if (typeof UI !== 'undefined' && typeof UI.notify === 'function') {
        UI.notify('Backup folder connected');
      }
    } catch (error) {
      if (error?.name === 'AbortError') {
        this.updateUI({ statusText: this.describeCurrentStatus(), ready: this.ready });
        return;
      }
      console.error('Backup: Failed to configure folder', error);
      if (error?.message === 'permission-denied') {
        if (typeof UI !== 'undefined' && typeof UI.notify === 'function') {
          UI.notify('Permission required to write backups to the selected folder.');
        }
        this.updateUI({
          statusText: 'Permission required. Choose the folder again and allow access.',
          ready: false,
          needsPermission: true
        });
      } else {
        if (typeof UI !== 'undefined' && typeof UI.notify === 'function') {
          UI.notify('Unable to configure backup folder. Try a different location.');
        }
        this.updateUI({
          statusText: 'Unable to access folder. Choose a different location.',
          ready: false,
          needsPermission: true
        });
      }
    }
  },

  async manualBackup() {
    if (!this.supported) {
      if (typeof UI !== 'undefined' && typeof UI.notify === 'function') {
        UI.notify('Local folder backups are not supported on this device.');
      }
      return;
    }
    if (!this.dirHandle) {
      if (typeof UI !== 'undefined' && typeof UI.notify === 'function') {
        UI.notify('Choose a backup folder first.');
      }
      this.updateUI({ statusText: 'Choose a folder to store automatic backups.', ready: false });
      return;
    }
    await this.performBackup('manual');
  },

  handleStoreSave() {
    if (!this.supported || !this.dirHandle || this.busy) {
      return;
    }
    this.scheduleBackup('auto');
  },

  scheduleBackup(reason = 'auto') {
    if (!this.ready || !this.dirHandle) {
      return;
    }

    if (reason === 'manual') {
      this.performBackup('manual');
      return;
    }

    if (this.pendingTimer) {
      clearTimeout(this.pendingTimer);
    }

    const delay = reason === 'startup' ? 1500 : this.AUTO_DELAY_MS;
    this.pendingTimer = setTimeout(() => {
      this.pendingTimer = null;
      this.performBackup('auto');
    }, delay);
  },

  async performBackup(reason = 'auto') {
    if (!this.dirHandle || this.busy) {
      return false;
    }

    const hasPermission = await this.ensurePermission(this.dirHandle, 'readwrite', reason !== 'auto');
    if (!hasPermission) {
      this.updateUI({
        statusText: 'Allow folder access to resume automatic backups.',
        ready: false,
        needsPermission: true
      });
      return false;
    }

    this.busy = true;
    this.updateUI({ statusText: 'Backing up…', ready: true, busy: true });

    let uiState = {
      statusText: this.describeCurrentStatus(),
      ready: true,
      needsPermission: false
    };

    try {
      const payload = await this.buildPayload();
      const hash = await this.hashString(payload);

      if (hash === this.metadata.lastHash && reason !== 'manual') {
        this.metadata.lastBackupISO = new Date().toISOString();
        this.saveMetadata();
        uiState.statusText = `${this.describeCurrentStatus()} (up to date)`;
        return true;
      }

      await this.writeFile(this.dirHandle, 'drop-backup-latest.json', payload);

      const today = new Date().toISOString().slice(0, 10);
      const dailyName = `drop-backup-${today}.json`;
      await this.writeFile(this.dirHandle, dailyName, payload);
      this.metadata.lastDailyISO = today;
      await this.pruneOldBackups(this.dirHandle);

      this.metadata.lastBackupISO = new Date().toISOString();
      this.metadata.lastHash = hash;
      this.saveMetadata();

      uiState.statusText = this.describeCurrentStatus();
      if (reason === 'manual' && typeof UI !== 'undefined' && typeof UI.notify === 'function') {
        UI.notify('Backup saved');
      }
      return true;
    } catch (error) {
      console.error('Backup: Failed to write backup file', error);
      uiState = {
        statusText: 'Backup failed. Reconnect the folder to continue.',
        ready: false,
        needsPermission: true
      };
      if (typeof UI !== 'undefined' && typeof UI.notify === 'function') {
        UI.notify('Backup failed. Check folder access and try again.');
      }
      return false;
    } finally {
      this.busy = false;
      this.updateUI({ ...uiState, busy: false });
    }
  },

  async buildPayload() {
    const rawState = this.getState ? this.getState() : {};
    const safeState = JSON.parse(JSON.stringify(rawState || {}));

    if (safeState && typeof safeState === 'object' && safeState.entries && typeof safeState.entries === 'object') {
      const dates = Object.keys(safeState.entries).sort();
      if (dates.length > this.MAX_ENTRY_SNAPSHOTS) {
        const trimmed = dates.length - this.MAX_ENTRY_SNAPSHOTS;
        const keepDates = dates.slice(-this.MAX_ENTRY_SNAPSHOTS);
        const pruned = {};
        keepDates.forEach(date => {
          pruned[date] = safeState.entries[date];
        });
        safeState.entries = pruned;
        safeState._backupMeta = {
          ...(safeState._backupMeta || {}),
          trimmedEntries: trimmed
        };
      }
    }

    const payload = {
      version: 1,
      source: 'drop-life-tracker',
      exportedAt: new Date().toISOString(),
      metadata: {
        entriesRetained: safeState.entries ? Object.keys(safeState.entries).length : 0,
        lastEntryDate: safeState.lastEntryDate || null
      },
      state: safeState
    };

    return JSON.stringify(payload, null, 2);
  },

  async writeFile(dirHandle, name, contents) {
    const fileHandle = await dirHandle.getFileHandle(name, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(contents);
    await writable.close();
  },

  async pruneOldBackups(dirHandle) {
    const backups = [];
    try {
      for await (const [name] of dirHandle.entries()) {
        if (/^drop-backup-\d{4}-\d{2}-\d{2}\.json$/u.test(name)) {
          backups.push(name);
        }
      }
    } catch (error) {
      console.warn('Backup: Unable to enumerate backup directory', error);
      return;
    }

    backups.sort();
    while (backups.length > this.MAX_DAILY_FILES) {
      const oldest = backups.shift();
      try {
        await dirHandle.removeEntry(oldest);
      } catch (error) {
        console.warn('Backup: Failed to remove old snapshot', oldest, error);
        break;
      }
    }
  },

  async hashString(input) {
    if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
      let hash = 0;
      for (let i = 0; i < input.length; i += 1) {
        hash = (hash << 5) - hash + input.charCodeAt(i);
        hash |= 0;
      }
      return String(hash);
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
  },

  async clearBackupData() {
    try {
      // Clear the stored directory handle from IndexedDB
      const db = await this.openDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.STORE_NAME, 'readwrite');
        const store = tx.objectStore(this.STORE_NAME);
        
        // Delete both the handle and metadata
        const deleteHandle = store.delete(this.HANDLE_KEY);
        const deleteMetadata = store.delete(this.METADATA_KEY);
        
        let completed = 0;
        const checkComplete = () => {
          completed++;
          if (completed === 2) {
            // Reset in-memory state
            this.dirHandle = null;
            this.ready = false;
            this.metadata = {
              lastBackupISO: '',
              lastDailyISO: '',
              lastHash: ''
            };
            this.saveMetadata(); // This will save empty metadata
            this.updateUI({ statusText: 'Choose a folder to store automatic backups.' });
            console.log('Backup: Cleared backup data and reset state');
            db.close();
            resolve();
          }
        };
        
        deleteHandle.onsuccess = checkComplete;
        deleteMetadata.onsuccess = checkComplete;
        
        deleteHandle.onerror = () => {
          console.warn('Backup: Failed to delete handle from IndexedDB');
          checkComplete();
        };
        deleteMetadata.onerror = () => {
          console.warn('Backup: Failed to delete metadata from IndexedDB');
          checkComplete();
        };
      });
    } catch (error) {
      console.error('Backup: Error clearing backup data', error);
      throw error;
    }
  },

  formatTimestamp(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    const now = new Date();
    const sameDay = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const timeFormatter = new Intl.DateTimeFormat(undefined, { timeStyle: 'short' });

    if (sameDay) {
      return `Today at ${timeFormatter.format(date)}`;
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${timeFormatter.format(date)}`;
    }
    const formatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    return formatter.format(date);
  }
};

if (typeof window !== 'undefined') {
  window.Backup = Backup;
}
