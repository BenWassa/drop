/**
 * ===========================
 * AUTO-BACKUP MODULE
 * ===========================
 *
 * Provides reliable automatic backups using localStorage for redundancy.
 * This avoids Chrome's File System Access API handle expiration issues.
 *
 * Strategy:
 * - Maintains rolling backups in localStorage (current + 2 previous versions)
 * - Automatically saves after changes with throttling
 * - Manual download creates timestamped files
 * - No file system permissions needed
 * - Works reliably across all sessions
 */

const AutoBackup = {
  BACKUP_CURRENT_KEY: 'drop-backup-current',
  BACKUP_PREVIOUS_KEY: 'drop-backup-previous',
  BACKUP_OLDEST_KEY: 'drop-backup-oldest',
  METADATA_KEY: 'drop-auto-backup-metadata',
  AUTO_DELAY_MS: 5000, // 5 seconds after last change
  
  pendingTimer: null,
  lastHash: '',
  enabled: true,

  metadata: {
    lastBackupISO: '',
    currentBackupDate: '',
    previousBackupDate: '',
    oldestBackupDate: '',
    backupCount: 0
  },

  init() {
    this.loadMetadata();
    this.restoreBackupIfNeeded();
    console.log('AutoBackup: Initialized with metadata:', this.metadata);
  },

  loadMetadata() {
    try {
      const raw = localStorage.getItem(this.METADATA_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.metadata = { ...this.metadata, ...parsed };
        this.lastHash = this.metadata.lastHash || '';
      }
    } catch (error) {
      console.warn('AutoBackup: Failed to load metadata', error);
    }
  },

  restoreBackupIfNeeded() {
    // Check if main state is corrupted or empty, restore from backup if needed
    try {
      const mainState = localStorage.getItem('drop-state-v2');
      if (!mainState || mainState === 'null' || mainState === '{}') {
        const backup = localStorage.getItem(this.BACKUP_CURRENT_KEY);
        if (backup) {
          console.warn('AutoBackup: Main state appears empty, restoring from backup');
          localStorage.setItem('drop-state-v2', backup);
        }
      }
    } catch (error) {
      console.error('AutoBackup: Error checking for backup restore', error);
    }
  },

  saveMetadata() {
    try {
      localStorage.setItem(this.METADATA_KEY, JSON.stringify(this.metadata));
    } catch (error) {
      console.warn('AutoBackup: Failed to save metadata', error);
    }
  },

  async hashString(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  /**
   * Called by Store after state changes
   */
  handleStoreSave() {
    if (!this.enabled) return;

    // Clear any pending backup
    if (this.pendingTimer) {
      clearTimeout(this.pendingTimer);
    }

    // Schedule a backup after delay
    this.pendingTimer = setTimeout(() => {
      this.pendingTimer = null;
      this.performBackup();
    }, this.AUTO_DELAY_MS);
  },

  /**
   * Perform an automatic backup to localStorage
   */
  async performBackup() {
    try {
      // Get current state
      const state = typeof Store !== 'undefined' ? Store.state : {};
      const dataStr = JSON.stringify(state);
      
      // Check if data has changed
      const hash = await this.hashString(dataStr);
      if (hash === this.lastHash) {
        console.log('AutoBackup: Skipping backup, data unchanged');
        return;
      }

      // Rotate backups: oldest <- previous <- current <- new
      try {
        const current = localStorage.getItem(this.BACKUP_CURRENT_KEY);
        const previous = localStorage.getItem(this.BACKUP_PREVIOUS_KEY);
        
        // Move current to previous, previous to oldest
        if (current) {
          if (previous) {
            localStorage.setItem(this.BACKUP_OLDEST_KEY, previous);
            this.metadata.oldestBackupDate = this.metadata.previousBackupDate;
          }
          localStorage.setItem(this.BACKUP_PREVIOUS_KEY, current);
          this.metadata.previousBackupDate = this.metadata.currentBackupDate;
        }
        
        // Save new current backup
        localStorage.setItem(this.BACKUP_CURRENT_KEY, dataStr);
        
      } catch (error) {
        console.warn('AutoBackup: Failed to rotate backups', error);
        // Still try to save current backup
        localStorage.setItem(this.BACKUP_CURRENT_KEY, dataStr);
      }

      // Update metadata
      const timestamp = new Date().toISOString();
      this.lastHash = hash;
      this.metadata.lastBackupISO = timestamp;
      this.metadata.currentBackupDate = timestamp;
      this.metadata.lastHash = hash;
      this.metadata.backupCount = (this.metadata.backupCount || 0) + 1;
      this.saveMetadata();

      console.log('AutoBackup: Backup saved to localStorage (3 versions maintained)');

    } catch (error) {
      console.error('AutoBackup: Failed to create backup', error);
    }
  },

  /**
   * Manual backup triggered by user
   */
  async manualBackup() {
    const state = typeof Store !== 'undefined' ? Store.state : {};
    const dataStr = JSON.stringify(state, null, 2);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `drop-backup-manual-${timestamp}.json`;

    try {
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Update hash for future comparisons
      this.lastHash = await this.hashString(dataStr);

      if (typeof UI !== 'undefined' && typeof UI.notify === 'function') {
        UI.notify('Manual backup downloaded');
      }
      
      console.log(`AutoBackup: Manual backup created - ${filename}`);
    } catch (error) {
      console.error('AutoBackup: Manual backup failed', error);
      if (typeof UI !== 'undefined' && typeof UI.notify === 'function') {
        UI.notify('Failed to create backup');
      }
    }
  },

  /**
   * Enable or disable automatic backups
   */
  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
    console.log(`AutoBackup: ${this.enabled ? 'Enabled' : 'Disabled'}`);
  },

  /**
   * Get backup status for UI display
   */
  getStatus() {
    if (!this.metadata.lastBackupISO) {
      return 'No automatic backups yet. Will backup after first change.';
    }

    const lastBackup = new Date(this.metadata.lastBackupISO);
    const now = new Date();
    const minutesSince = Math.floor((now - lastBackup) / (1000 * 60));
    
    if (minutesSince < 1) {
      return 'Last backup: Just now';
    } else if (minutesSince < 60) {
      return `Last backup: ${minutesSince} minute${minutesSince > 1 ? 's' : ''} ago (3 versions saved)`;
    } else {
      const hoursSince = Math.floor(minutesSince / 60);
      if (hoursSince < 24) {
        return `Last backup: ${hoursSince} hour${hoursSince > 1 ? 's' : ''} ago (3 versions saved)`;
      } else {
        const daysSince = Math.floor(hoursSince / 24);
        return `Last backup: ${daysSince} day${daysSince > 1 ? 's' : ''} ago (3 versions saved)`;
      }
    }
  },

  /**
   * Get available backup info
   */
  getBackupInfo() {
    const backups = [];
    
    if (this.metadata.currentBackupDate) {
      backups.push({
        label: 'Current',
        date: new Date(this.metadata.currentBackupDate),
        key: this.BACKUP_CURRENT_KEY
      });
    }
    
    if (this.metadata.previousBackupDate) {
      backups.push({
        label: 'Previous',
        date: new Date(this.metadata.previousBackupDate),
        key: this.BACKUP_PREVIOUS_KEY
      });
    }
    
    if (this.metadata.oldestBackupDate) {
      backups.push({
        label: 'Oldest',
        date: new Date(this.metadata.oldestBackupDate),
        key: this.BACKUP_OLDEST_KEY
      });
    }
    
    return backups;
  },

  /**
   * Restore from a specific backup
   */
  async restoreFromBackup(backupKey) {
    try {
      const backupData = localStorage.getItem(backupKey);
      if (!backupData) {
        throw new Error('Backup not found');
      }

      // Validate it's valid JSON
      const parsed = JSON.parse(backupData);
      
      // Save to main state
      localStorage.setItem('drop-state-v2', backupData);
      
      // Reload the page to apply restored state
      window.location.reload();
      
      return true;
    } catch (error) {
      console.error('AutoBackup: Failed to restore backup', error);
      if (typeof UI !== 'undefined' && typeof UI.notify === 'function') {
        UI.notify('Failed to restore backup');
      }
      return false;
    }
  }
};
