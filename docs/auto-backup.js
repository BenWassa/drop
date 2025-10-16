/**
 * ===========================
 * AUTO-BACKUP MODULE
 * ===========================
 *
 * Provides reliable automatic backups by downloading JSON files to the Downloads folder.
 * This avoids Chrome's File System Access API handle expiration issues.
 *
 * Strategy:
 * - Creates timestamped backup files automatically after changes
 * - Keeps 2 backup files: one "latest" and one "previous day"
 * - Uses browser download API (always works, no permissions needed)
 * - Throttles backups to avoid overwhelming the user with downloads
 */

const AutoBackup = {
  METADATA_KEY: 'drop-auto-backup-metadata',
  AUTO_DELAY_MS: 30000, // 30 seconds after last change
  MIN_BACKUP_INTERVAL_MS: 3600000, // Minimum 1 hour between auto-backups
  
  pendingTimer: null,
  lastBackupTime: 0,
  lastHash: '',
  enabled: true,

  metadata: {
    lastBackupISO: '',
    lastBackupDate: '',
    lastHash: '',
    backupCount: 0
  },

  init() {
    this.loadMetadata();
    console.log('AutoBackup: Initialized with metadata:', this.metadata);
  },

  loadMetadata() {
    try {
      const raw = localStorage.getItem(this.METADATA_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.metadata = { ...this.metadata, ...parsed };
        this.lastHash = this.metadata.lastHash || '';
        this.lastBackupTime = this.metadata.lastBackupISO ? new Date(this.metadata.lastBackupISO).getTime() : 0;
      }
    } catch (error) {
      console.warn('AutoBackup: Failed to load metadata', error);
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
   * Perform an automatic backup
   */
  async performBackup() {
    try {
      // Check if enough time has passed since last backup
      const now = Date.now();
      const timeSinceLastBackup = now - this.lastBackupTime;
      
      if (timeSinceLastBackup < this.MIN_BACKUP_INTERVAL_MS) {
        console.log('AutoBackup: Skipping backup, too soon since last backup');
        return;
      }

      // Get current state
      const state = typeof Store !== 'undefined' ? Store.state : {};
      const dataStr = JSON.stringify(state, null, 2);
      
      // Check if data has changed
      const hash = await this.hashString(dataStr);
      if (hash === this.lastHash) {
        console.log('AutoBackup: Skipping backup, data unchanged');
        this.lastBackupTime = now; // Update time to prevent repeated checks
        return;
      }

      // Create backup file
      const timestamp = new Date().toISOString();
      const dateStr = timestamp.slice(0, 10); // YYYY-MM-DD
      const timeStr = timestamp.slice(11, 19).replace(/:/g, '-'); // HH-MM-SS
      
      // Determine filename based on whether this is a new day
      let filename;
      if (dateStr !== this.metadata.lastBackupDate) {
        // New day - create dated backup
        filename = `drop-backup-${dateStr}.json`;
      } else {
        // Same day - update "latest" backup
        filename = `drop-backup-latest.json`;
      }

      // Download the file
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

      // Update metadata
      this.lastHash = hash;
      this.lastBackupTime = now;
      this.metadata.lastBackupISO = timestamp;
      this.metadata.lastBackupDate = dateStr;
      this.metadata.lastHash = hash;
      this.metadata.backupCount = (this.metadata.backupCount || 0) + 1;
      this.saveMetadata();

      console.log(`AutoBackup: Backup created - ${filename}`);
      
      // Show subtle notification
      if (typeof UI !== 'undefined' && typeof UI.notify === 'function') {
        UI.notify(`Backup saved to Downloads folder`, 2000);
      }

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
      return 'No backups yet';
    }

    const lastBackup = new Date(this.metadata.lastBackupISO);
    const now = new Date();
    const hoursSince = Math.floor((now - lastBackup) / (1000 * 60 * 60));
    
    if (hoursSince < 1) {
      return 'Last backup: Less than 1 hour ago';
    } else if (hoursSince < 24) {
      return `Last backup: ${hoursSince} hour${hoursSince > 1 ? 's' : ''} ago`;
    } else {
      const daysSince = Math.floor(hoursSince / 24);
      return `Last backup: ${daysSince} day${daysSince > 1 ? 's' : ''} ago`;
    }
  }
};
