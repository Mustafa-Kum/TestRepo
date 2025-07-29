// main.js
// import/export yok, global fonksiyonlar ve nesneler kullanılıyor

// API Config - Netlify function kullan
const BASE_URL = '/.netlify/functions/weather';
const ICON_BASE_URL = 'https://openweathermap.org/img/wn/';

// PWA Configuration
const PWA_CONFIG = {
    name: 'Modern Hava Durumu',
    shortName: 'Hava Durumu',
    themeColor: '#667eea',
    backgroundColor: '#667eea'
};

// Debug: BASE_URL kontrolü
console.log('[DEBUG] BASE_URL:', BASE_URL);

// WeatherUtils saf modül olarak kullanılıyor
// Eğer WeatherUtils globalde yoksa, local değişkeni kullan
const utils = typeof WeatherUtils !== 'undefined' ? WeatherUtils : window.WeatherUtils;

// DOM Elements
const dom = {
    citySelect: document.getElementById('city-select'),
    getWeatherBtn: document.getElementById('get-weather-btn'),
    weatherDisplay: document.getElementById('weather-display'),
    errorMessage: document.getElementById('error-message'),
    locationText: document.getElementById('location-text'),
    currentTime: document.getElementById('current-time'),
    temperature: document.getElementById('temperature'),
    feelsLike: document.getElementById('feels-like'),
    weatherIcon: document.getElementById('weather-icon'),
    description: document.getElementById('description'),
    humidity: document.getElementById('humidity'),
    windSpeed: document.getElementById('wind-speed'),
    sunrise: document.getElementById('sunrise'),
    sunset: document.getElementById('sunset'),
    errorText: document.getElementById('error-text')
};

const weatherService = new window.WeatherService(null, BASE_URL, ICON_BASE_URL);
const weatherUI = new WeatherUI(dom, utils);

// Şehir select doldur
function initCitySelect() {
    weatherUI.populateCitySelect(dom.citySelect, utils.turkishCities);
}

// Olay dinleyiciler
function addEventListeners() {
    dom.getWeatherBtn.addEventListener('click', () => {
        const selectedCity = dom.citySelect.value;
        console.log('[DEBUG] Butona basıldı, seçilen şehir:', selectedCity);
        weatherService.fetchWeatherWithLoading(
            selectedCity,
            (isLoading) => {
                console.log('[DEBUG] setButtonLoading:', isLoading);
                weatherUI.setButtonLoading(isLoading);
            },
            (data) => {
                console.log('[DEBUG] API verisi geldi:', data);
                weatherUI.displayWeatherData(data);
            },
            (msg) => {
                console.log('[DEBUG] Hata oluştu:', msg);
                weatherUI.showError(msg);
            },
            () => {
                console.log('[DEBUG] hideAll çağrıldı');
                weatherUI.hideAll();
            }
        );
    });

    dom.citySelect.addEventListener('change', () => {
        const selectedCity = dom.citySelect.value;
        console.log('[DEBUG] Şehir değişti, yeni şehir:', selectedCity);
        if (selectedCity) {
            weatherService.fetchWeatherWithLoading(
                selectedCity,
                (isLoading) => {
                    console.log('[DEBUG] setButtonLoading:', isLoading);
                    weatherUI.setButtonLoading(isLoading);
                },
                (data) => {
                    console.log('[DEBUG] API verisi geldi:', data);
                    weatherUI.displayWeatherData(data);
                },
                (msg) => {
                    console.log('[DEBUG] Hata oluştu:', msg);
                    weatherUI.showError(msg);
                },
                () => {
                    console.log('[DEBUG] hideAll çağrıldı');
                    weatherUI.hideAll();
                }
            );
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && document.activeElement === dom.citySelect) {
            const selectedCity = dom.citySelect.value;
            console.log('[DEBUG] Enter ile şehir seçildi:', selectedCity);
            if (selectedCity) {
                weatherService.fetchWeatherWithLoading(
                    selectedCity,
                    (isLoading) => {
                        console.log('[DEBUG] setButtonLoading:', isLoading);
                        weatherUI.setButtonLoading(isLoading);
                    },
                    (data) => {
                        console.log('[DEBUG] API verisi geldi:', data);
                        weatherUI.displayWeatherData(data);
                    },
                    (msg) => {
                        console.log('[DEBUG] Hata oluştu:', msg);
                        weatherUI.showError(msg);
                    },
                    () => {
                        console.log('[DEBUG] hideAll çağrıldı');
                        weatherUI.hideAll();
                    }
                );
            }
        }
    });
}

// PWA Service Worker Registration
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered successfully:', registration);
            
            // Check for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        showUpdateNotification();
                    }
                });
            });
            
            return registration;
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }
}

// Show update notification
function showUpdateNotification() {
    const updateNotification = document.createElement('div');
    updateNotification.className = 'update-notification';
    updateNotification.innerHTML = `
        <div class="update-content">
            <i class="fas fa-download"></i>
            <span>Yeni güncelleme mevcut!</span>
            <button onclick="location.reload()" class="update-btn">
                <i class="fas fa-sync-alt"></i> Güncelle
            </button>
        </div>
    `;
    document.body.appendChild(updateNotification);
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
        if (updateNotification.parentNode) {
            updateNotification.remove();
        }
    }, 10000);
}

// Install prompt handling
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallPrompt();
});

function showInstallPrompt() {
    const installNotification = document.createElement('div');
    installNotification.className = 'install-notification';
    installNotification.innerHTML = `
        <div class="install-content">
            <i class="fas fa-download"></i>
            <span>Uygulamayı yüklemek ister misiniz?</span>
            <button onclick="installApp()" class="install-btn">
                <i class="fas fa-plus"></i> Yükle
            </button>
            <button onclick="this.parentElement.parentElement.remove()" class="close-btn">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    document.body.appendChild(installNotification);
}

async function installApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('Install prompt outcome:', outcome);
        deferredPrompt = null;
        
        // Remove install notification
        const installNotification = document.querySelector('.install-notification');
        if (installNotification) {
            installNotification.remove();
        }
    }
}

// Offline/Online status handling
function handleOnlineStatus() {
    const statusIndicator = document.createElement('div');
    statusIndicator.className = 'connection-status';
    statusIndicator.innerHTML = `
        <i class="fas fa-wifi"></i>
        <span>Çevrimiçi</span>
    `;
    document.body.appendChild(statusIndicator);
    
    window.addEventListener('online', () => {
        statusIndicator.innerHTML = `
            <i class="fas fa-wifi"></i>
            <span>Çevrimiçi</span>
        `;
        statusIndicator.classList.remove('offline');
        statusIndicator.classList.add('online');
        
        setTimeout(() => {
            statusIndicator.classList.remove('online');
        }, 3000);
    });
    
    window.addEventListener('offline', () => {
        statusIndicator.innerHTML = `
            <i class="fas fa-wifi-slash"></i>
            <span>Çevrimdışı</span>
        `;
        statusIndicator.classList.remove('online');
        statusIndicator.classList.add('offline');
    });
}

// Sayfa yüklendiğinde başlat
window.addEventListener('DOMContentLoaded', async () => {
    initCitySelect();
    addEventListeners();
    
    // PWA initialization
    await registerServiceWorker();
    handleOnlineStatus();
    
    // İsterseniz varsayılan şehir için ilk yüklemede hava durumu getirebilirsiniz
    // weatherService.fetchWeatherWithLoading('Ankara', ...);
});