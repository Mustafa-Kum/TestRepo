class PWA {
  constructor() {
    this.swRegistration = null;
    this.isOnline = navigator.onLine;
    this.isAndroid = this.detectAndroid();
    this.init();
  }

  detectAndroid() {
    return /Android/i.test(navigator.userAgent);
  }

  async init() {
    this.setupOnlineOfflineListeners();
    await this.registerServiceWorker();
    this.setupInstallPrompt();
    this.setupNotifications();
    
    // Android-specific optimizations
    if (this.isAndroid) {
      this.setupAndroidOptimizations();
    }
  }

  setupAndroidOptimizations() {
    // Prevent zoom on double tap for Android
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);

    // Add Android-specific CSS classes
    document.body.classList.add('android-device');
    
    // Optimize for Android Chrome
    if (navigator.userAgent.includes('Chrome')) {
      document.body.classList.add('android-chrome');
    }
  }

  setupOnlineOfflineListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.showOnlineStatus();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.showOfflineStatus();
    });
  }

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none'
        });
        console.log('Service Worker registered successfully:', this.swRegistration);

        // Handle service worker updates
        this.swRegistration.addEventListener('updatefound', () => {
          const newWorker = this.swRegistration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.showUpdateAvailable();
            }
          });
        });

        // Handle service worker controller change
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('Service Worker controller changed');
          window.location.reload();
        });

      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    } else {
      console.log('Service Worker not supported');
    }
  }

  setupInstallPrompt() {
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      this.showInstallPrompt();
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      this.hideInstallPrompt();
      
      // Track installation
      if (typeof gtag !== 'undefined') {
        gtag('event', 'pwa_installed', {
          'event_category': 'engagement',
          'event_label': this.isAndroid ? 'android' : 'ios'
        });
      }
    });
  }

  setupNotifications() {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        this.requestNotificationPermission();
      }
    }
  }

  async requestNotificationPermission() {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  }

  showInstallPrompt() {
    // Don't show install prompt if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    const installButton = document.createElement('div');
    installButton.id = 'install-prompt';
    installButton.className = 'install-prompt';
    installButton.innerHTML = `
      <div class="install-content">
        <i class="fas fa-download"></i>
        <span>Bu uygulamayı yükleyin</span>
        <button id="install-btn" class="install-btn">
          <i class="fas fa-plus"></i>
          Yükle
        </button>
        <button id="dismiss-btn" class="dismiss-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;

    document.body.appendChild(installButton);

    document.getElementById('install-btn').addEventListener('click', () => {
      this.installApp();
    });

    document.getElementById('dismiss-btn').addEventListener('click', () => {
      this.hideInstallPrompt();
    });
  }

  hideInstallPrompt() {
    const installPrompt = document.getElementById('install-prompt');
    if (installPrompt) {
      installPrompt.remove();
    }
  }

  async installApp() {
    if (window.deferredPrompt) {
      window.deferredPrompt.prompt();
      const { outcome } = await window.deferredPrompt.userChoice;
      console.log('Install prompt outcome:', outcome);
      window.deferredPrompt = null;
      this.hideInstallPrompt();
    }
  }

  showOnlineStatus() {
    this.showStatusMessage('Çevrimiçi', 'success');
  }

  showOfflineStatus() {
    this.showStatusMessage('Çevrimdışı - Önbellekten yükleniyor', 'warning');
  }

  showUpdateAvailable() {
    this.showStatusMessage('Yeni güncelleme mevcut. Sayfayı yenileyin.', 'info');
  }

  showStatusMessage(message, type) {
    const statusDiv = document.createElement('div');
    statusDiv.className = `status-message ${type}`;
    statusDiv.innerHTML = `
      <i class="fas fa-${this.getStatusIcon(type)}"></i>
      <span>${message}</span>
    `;

    document.body.appendChild(statusDiv);

    setTimeout(() => {
      statusDiv.classList.add('fade-out');
      setTimeout(() => {
        if (statusDiv.parentNode) {
          statusDiv.remove();
        }
      }, 500);
    }, 3000);
  }

  getStatusIcon(type) {
    const icons = {
      success: 'check-circle',
      warning: 'exclamation-triangle',
      info: 'info-circle',
      error: 'times-circle'
    };
    return icons[type] || 'info-circle';
  }

  // Background sync for offline requests
  async registerBackgroundSync() {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        await this.swRegistration.sync.register('background-sync');
        console.log('Background sync registered');
      } catch (error) {
        console.error('Background sync registration failed:', error);
      }
    }
  }

  // Send push notification
  async sendNotification(title, options = {}) {
    if ('serviceWorker' in navigator && this.swRegistration) {
      try {
        await this.swRegistration.showNotification(title, {
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-192x192.png',
          vibrate: [100, 50, 100],
          ...options
        });
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    }
  }
}

// Initialize PWA when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.pwa = new PWA();
}); 