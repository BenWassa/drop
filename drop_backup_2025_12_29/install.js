// === INSTALL MODULE ===
// Handles Progressive Web App install prompt functionality

const Install = {
  deferredInstallPrompt: null,
  installEventsBound: false,

  setupInstallPromptEvents() {
    if (this.installEventsBound) return;
    this.installEventsBound = true;

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.deferredInstallPrompt = event;
      this.updateInstallButtonVisibility(true);
    });

    window.addEventListener('appinstalled', () => {
      this.deferredInstallPrompt = null;
      this.updateInstallButtonVisibility(false);
      if (typeof UI !== 'undefined' && typeof UI.toast === 'function') {
        UI.toast('drop installed');
      }
    });
  },

  updateInstallButtonVisibility(forceShow = false) {
    if (typeof UI === 'undefined' || !UI.elements || !UI.elements.settingsMenu) return;
    const settingsInstallBtn = UI.elements.settingsMenu.installBtn;
    if (!settingsInstallBtn) return;

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

    if (isStandalone) {
      settingsInstallBtn.hidden = true;
      return;
    }

    if (forceShow || this.deferredInstallPrompt) {
      settingsInstallBtn.hidden = false;
      settingsInstallBtn.disabled = false;
    } else {
      settingsInstallBtn.hidden = true;
    }
  },

  initInstallPrompt() {
    if (typeof UI === 'undefined' || !UI.elements || !UI.elements.settingsMenu) return;
    const settingsInstallBtn = UI.elements.settingsMenu.installBtn;
    if (!settingsInstallBtn) return;

    // Ensure the button state reflects any prompt captured before initialization
    this.updateInstallButtonVisibility();

    settingsInstallBtn.addEventListener('click', async () => {
      const promptEvent = this.deferredInstallPrompt;
      if (!promptEvent) {
        this.updateInstallButtonVisibility(false);
        return;
      }

      settingsInstallBtn.disabled = true;
      promptEvent.prompt();

      try {
        const { outcome } = await promptEvent.userChoice;
        if (outcome === 'accepted') {
          if (typeof UI !== 'undefined' && typeof UI.toast === 'function') {
            UI.toast('Installation started');
          }
          this.updateInstallButtonVisibility(false);
          const settingsMenu = UI.elements.settingsMenu.menu;
          if (settingsMenu) {
            settingsMenu.classList.remove('active');
          }
        } else {
          settingsInstallBtn.disabled = false;
        }
      } catch (error) {
        console.error('Install prompt failed:', error);
        settingsInstallBtn.disabled = false;
      }

      this.deferredInstallPrompt = null;
    });
  }
};

// Make Install available globally
if (typeof window !== 'undefined') {
  window.Install = Install;
}