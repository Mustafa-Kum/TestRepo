// main.js
// import/export yok, global fonksiyonlar ve nesneler kullanılıyor

// API Config
const API_KEY = 'afa97fb4861b31e96a91c1ff7f2b3255'; // Buraya API key'inizi yazın
const ICON_BASE_URL = 'https://openweathermap.org/img/wn/';

// Debug: API key kontrolü
console.log('[DEBUG] API_KEY:', API_KEY ? 'Set' : 'Not set');

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

const weatherService = new window.WeatherService(API_KEY, null, ICON_BASE_URL);
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

// Sayfa yüklendiğinde başlat
window.addEventListener('DOMContentLoaded', () => {
    initCitySelect();
    addEventListeners();
    // İsterseniz varsayılan şehir için ilk yüklemede hava durumu getirebilirsiniz
    // weatherService.fetchWeatherWithLoading('Ankara', ...);
});