// main.js - Dark Theme Weather App

// Orientation control - Force portrait only
function checkOrientation() {
    const isLandscape = window.innerWidth > window.innerHeight;
    const isMobile = window.innerWidth <= 768;
    
    if (isLandscape && isMobile) {
        // Force portrait mode on mobile landscape
        document.body.style.display = 'none';
        const warning = document.getElementById('orientation-warning');
        if (!warning) {
            const warningDiv = document.createElement('div');
            warningDiv.id = 'orientation-warning';
            warningDiv.innerHTML = `
                <div style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    color: white;
                    font-size: 1.2em;
                    font-weight: 600;
                    text-align: center;
                    padding: 20px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                ">
                    <div>
                        <i class="fas fa-mobile-alt" style="font-size: 2em; margin-bottom: 15px; display: block;"></i>
                        <p>Lütfen telefonu dikey konuma çevirin</p>
                        <p style="font-size: 0.8em; margin-top: 10px; opacity: 0.8;">Uygulama sadece dikey modda çalışır</p>
                    </div>
                </div>
            `;
            document.body.appendChild(warningDiv);
        }
        
        // Prevent landscape orientation
        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('portrait').catch(() => {
                console.log('Orientation lock not supported');
            });
        }
    } else {
        // Portrait mode or desktop - show app
        document.body.style.display = 'block';
        const warning = document.getElementById('orientation-warning');
        if (warning) {
            warning.remove();
        }
    }
}

// API Config - Netlify function kullan
const BASE_URL = '/.netlify/functions/weather';
const ICON_BASE_URL = 'https://openweathermap.org/img/wn/';

// Debug: BASE_URL kontrolü
console.log('[DEBUG] BASE_URL:', BASE_URL);

// WeatherUtils saf modül olarak kullanılıyor
const utils = typeof WeatherUtils !== 'undefined' ? WeatherUtils : window.WeatherUtils;

// Global variables to store forecast data
let currentForecastData = null;
let selectedDayIndex = 0; // 0 = today, 1 = tomorrow, etc.

// DOM Elements for new layout
const dom = {
    // City selector
    citySelect: document.getElementById('city-select'),
    
    // Weather data elements
    locationText: document.getElementById('location-text'),
    currentTemp: document.getElementById('current-temp'),
    currentCondition: document.getElementById('current-condition'),
    feelsLikeTemp: document.getElementById('feels-like-temp'),
    hourlyData: document.getElementById('hourly-data'),
    dailyData: document.getElementById('daily-data'),
    
    // UI elements
    currentTemperature: document.querySelector('.current-temperature'),
    weatherCondition: document.querySelector('.weather-condition'),
    feelsLike: document.querySelector('.feels-like'),
    currentLabel: document.querySelector('.current-label'),
    hourlyForecast: document.querySelector('.hourly-forecast'),
    dailyForecastContainer: document.querySelector('.daily-forecast-container'),
    
    // Menu button
    menuButton: document.querySelector('.menu-button')
};

const weatherService = new window.WeatherService(null, BASE_URL, ICON_BASE_URL);

// Weather UI for new layout
const weatherUI = {
    updateCurrentWeather: function(data) {
        if (!data) return;
        
        const { main, weather } = data;
        
        // Update current temperature
        if (dom.currentTemperature) {
            dom.currentTemperature.textContent = `${Math.round(main.temp)}°C`;
        }
        
        // Update weather condition
        if (dom.weatherCondition) {
            const translatedDescription = utils.translateWeatherDescription(weather[0]?.description || '');
            dom.weatherCondition.textContent = translatedDescription;
        }
        
        // Update feels like
        if (dom.feelsLike) {
            dom.feelsLike.textContent = `Hissedilen ${Math.round(main.feels_like)}°`;
        }
        
        // Update current label
        if (dom.currentLabel) {
            dom.currentLabel.textContent = 'Şimdi';
        }
    },
    
    updateSelectedDayWeather: function(dayIndex) {
        if (!currentForecastData || !currentForecastData.list) return;
        
        // Group forecasts by day
        const dailyGroups = {};
        currentForecastData.list.forEach(forecast => {
            const date = new Date(forecast.dt * 1000);
            const dayKey = date.toISOString().split('T')[0];
            
            if (!dailyGroups[dayKey]) {
                dailyGroups[dayKey] = [];
            }
            dailyGroups[dayKey].push(forecast);
        });
        
        // Get all days (including today)
        const allDays = Object.entries(dailyGroups)
            .slice(0, 5); // Include today and next 4 days
        
        if (dayIndex >= 0 && dayIndex < allDays.length) {
            const [dayKey, forecasts] = allDays[dayIndex];
            const date = new Date(dayKey);
            const today = new Date();
            const todayKey = today.toISOString().split('T')[0];
            
            // Check if this is today
            const isToday = dayKey === todayKey;
            const dayName = isToday ? 'Bugün' : utils.getDayName(date.getDay());
            
            // Calculate average values for the selected day
            const avgTemp = Math.round(forecasts.reduce((sum, f) => sum + f.main.temp, 0) / forecasts.length);
            const avgFeelsLike = Math.round(forecasts.reduce((sum, f) => sum + f.main.feels_like, 0) / forecasts.length);
            
            // Get most common weather icon
            const weatherIcons = forecasts.map(f => f.weather[0]?.icon).filter(Boolean);
            const mostCommonIcon = this.getMostCommonIcon(weatherIcons);
            const weatherDescription = forecasts[0]?.weather[0]?.description || '';
            
            // Update current weather card
            if (dom.currentTemperature) {
                dom.currentTemperature.textContent = `${avgTemp}°C`;
            }
            
            if (dom.weatherCondition) {
                const translatedDescription = utils.translateWeatherDescription(weatherDescription);
                dom.weatherCondition.textContent = translatedDescription;
            }
            
            if (dom.feelsLike) {
                dom.feelsLike.textContent = `Hissedilen ${avgFeelsLike}°`;
            }
            
            if (dom.currentLabel) {
                dom.currentLabel.textContent = dayName;
            }
            
            // Update hourly forecast for the selected day
            this.updateHourlyForecastForDay(forecasts);
        }
    },
    
    updateHourlyForecastForDay: function(dayForecasts) {
        if (!dom.hourlyForecast) return;
        
        // Clear existing hourly items
        dom.hourlyForecast.innerHTML = '';
        
        // Show hourly data for the selected day
        dayForecasts.forEach((hour, index) => {
            const time = new Date(hour.dt * 1000);
            const hourStr = `${time.getHours()}:00`;
            const temp = Math.round(hour.main.temp);
            const icon = hour.weather[0]?.icon || '01d';
            
            const hourlyItem = document.createElement('div');
            hourlyItem.className = 'hourly-item';
            
            // Determine icon based on weather condition
            let iconClass = 'fas fa-moon'; // Default night icon
            if (icon.includes('d')) {
                if (icon.includes('01')) iconClass = 'fas fa-sun';
                else if (icon.includes('02') || icon.includes('03') || icon.includes('04')) iconClass = 'fas fa-cloud';
                else if (icon.includes('09') || icon.includes('10')) iconClass = 'fas fa-cloud-rain';
                else if (icon.includes('11')) iconClass = 'fas fa-bolt';
                else if (icon.includes('13')) iconClass = 'fas fa-snowflake';
                else if (icon.includes('50')) iconClass = 'fas fa-smog';
            } else {
                if (icon.includes('01')) iconClass = 'fas fa-moon';
                else if (icon.includes('02') || icon.includes('03') || icon.includes('04')) iconClass = 'fas fa-cloud';
                else if (icon.includes('09') || icon.includes('10')) iconClass = 'fas fa-cloud-rain';
                else if (icon.includes('11')) iconClass = 'fas fa-bolt';
                else if (icon.includes('13')) iconClass = 'fas fa-snowflake';
                else if (icon.includes('50')) iconClass = 'fas fa-smog';
            }
            
            hourlyItem.innerHTML = `
                <div class="hourly-temp">${temp}°</div>
                <div class="hourly-icon">
                    <i class="${iconClass}"></i>
                </div>
                <div class="hourly-time">${hourStr}</div>
            `;
            
            dom.hourlyForecast.appendChild(hourlyItem);
        });
    },
    
    updateHourlyForecast: function(data) {
        if (!data || !data.list) return;
        
        // Clear existing hourly items
        if (dom.hourlyForecast) {
            dom.hourlyForecast.innerHTML = '';
        }
        
        // Get next 6 hours
        const hourlyData = data.list.slice(0, 6);
        
        hourlyData.forEach((hour, index) => {
            const time = new Date(hour.dt * 1000);
            const hourStr = index === 0 ? 'Şimdi' : `${time.getHours()}:00`;
            const temp = Math.round(hour.main.temp);
            const icon = hour.weather[0]?.icon || '01d';
            
            const hourlyItem = document.createElement('div');
            hourlyItem.className = `hourly-item ${index === 0 ? 'current' : ''}`;
            
            // Determine icon based on weather condition
            let iconClass = 'fas fa-moon'; // Default night icon
            if (icon.includes('d')) {
                if (icon.includes('01')) iconClass = 'fas fa-sun';
                else if (icon.includes('02') || icon.includes('03') || icon.includes('04')) iconClass = 'fas fa-cloud';
                else if (icon.includes('09') || icon.includes('10')) iconClass = 'fas fa-cloud-rain';
                else if (icon.includes('11')) iconClass = 'fas fa-bolt';
                else if (icon.includes('13')) iconClass = 'fas fa-snowflake';
                else if (icon.includes('50')) iconClass = 'fas fa-smog';
            } else {
                if (icon.includes('01')) iconClass = 'fas fa-moon';
                else if (icon.includes('02') || icon.includes('03') || icon.includes('04')) iconClass = 'fas fa-cloud';
                else if (icon.includes('09') || icon.includes('10')) iconClass = 'fas fa-cloud-rain';
                else if (icon.includes('11')) iconClass = 'fas fa-bolt';
                else if (icon.includes('13')) iconClass = 'fas fa-snowflake';
                else if (icon.includes('50')) iconClass = 'fas fa-smog';
            }
            
            hourlyItem.innerHTML = `
                <div class="hourly-temp">${temp}°</div>
                <div class="hourly-icon">
                    <i class="${iconClass}"></i>
                </div>
                <div class="hourly-time">${hourStr}</div>
            `;
            
            if (dom.hourlyForecast) {
                dom.hourlyForecast.appendChild(hourlyItem);
            }
        });
    },
    
    updateDailyForecast: function(data) {
        if (!data || !data.list) return;
        
        // Store forecast data globally
        currentForecastData = data;
        
        // Clear existing daily items
        if (dom.dailyForecastContainer) {
            dom.dailyForecastContainer.innerHTML = '';
        }
        
        // Group forecasts by day
        const dailyGroups = {};
        data.list.forEach(forecast => {
            const date = new Date(forecast.dt * 1000);
            const dayKey = date.toISOString().split('T')[0];
            
            if (!dailyGroups[dayKey]) {
                dailyGroups[dayKey] = [];
            }
            dailyGroups[dayKey].push(forecast);
        });
        
        // Get next 5 days (including today)
        const today = new Date();
        const todayKey = today.toISOString().split('T')[0];
        const allDays = Object.entries(dailyGroups)
            .slice(0, 5); // Include today and next 4 days
        
        allDays.forEach(([dayKey, forecasts], index) => {
            const date = new Date(dayKey);
            const today = new Date();
            const todayKey = today.toISOString().split('T')[0];
            
            // Check if this is today
            const isToday = dayKey === todayKey;
            const dayName = isToday ? 'Bugün' : utils.getDayName(date.getDay());
            
            // Calculate average temperature
            const avgTemp = Math.round(forecasts.reduce((sum, f) => sum + f.main.temp, 0) / forecasts.length);
            const minTemp = Math.round(Math.min(...forecasts.map(f => f.main.temp)));
            const maxTemp = Math.round(Math.max(...forecasts.map(f => f.main.temp)));
            
            // Get most common weather icon
            const weatherIcons = forecasts.map(f => f.weather[0]?.icon).filter(Boolean);
            const mostCommonIcon = this.getMostCommonIcon(weatherIcons);
            
            // Determine icon class
            let iconClass = 'fas fa-cloud';
            if (mostCommonIcon.includes('01')) iconClass = 'fas fa-sun';
            else if (mostCommonIcon.includes('02') || mostCommonIcon.includes('03') || mostCommonIcon.includes('04')) iconClass = 'fas fa-cloud';
            else if (mostCommonIcon.includes('09') || mostCommonIcon.includes('10')) iconClass = 'fas fa-cloud-rain';
            else if (mostCommonIcon.includes('11')) iconClass = 'fas fa-bolt';
            else if (mostCommonIcon.includes('13')) iconClass = 'fas fa-snowflake';
            else if (mostCommonIcon.includes('50')) iconClass = 'fas fa-smog';
            
            const dailyItem = document.createElement('div');
            dailyItem.className = `daily-item ${index === 0 ? 'selected' : ''}`;
            dailyItem.dataset.dayIndex = index;
            
            dailyItem.innerHTML = `
                <div class="daily-day">${dayName}</div>
                <div class="daily-icon">
                    <i class="${iconClass}"></i>
                </div>
                <div class="daily-temp">${maxTemp}°/${minTemp}°</div>
            `;
            
            // Add click event listener
            dailyItem.addEventListener('click', () => {
                // Remove selected class from all items
                document.querySelectorAll('.daily-item').forEach(d => d.classList.remove('selected'));
                // Add selected class to clicked item
                dailyItem.classList.add('selected');
                
                // Update selected day index
                selectedDayIndex = index;
                
                // Update current weather card for selected day
                this.updateSelectedDayWeather(index);
            });
            
            if (dom.dailyForecastContainer) {
                dom.dailyForecastContainer.appendChild(dailyItem);
            }
        });
    },
    
    getMostCommonIcon: function(icons) {
        const iconCount = {};
        icons.forEach(icon => {
            iconCount[icon] = (iconCount[icon] || 0) + 1;
        });
        
        let mostCommon = '01d';
        let maxCount = 0;
        
        Object.entries(iconCount).forEach(([icon, count]) => {
            if (count > maxCount) {
                maxCount = count;
                mostCommon = icon;
            }
        });
        
        return mostCommon;
    },
    
    showError: function(message) {
        console.error('Weather error:', message);
        // For now, just log the error. You can add a toast notification later
    },
    
    populateCitySelect: function(citySelect, turkishCities) {
        citySelect.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Şehir seçiniz...';
        defaultOption.disabled = true;
        citySelect.appendChild(defaultOption);
        
        turkishCities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
        
        // Set Ankara as default selected city
        citySelect.value = 'Ankara';
    }
};

// Event listeners
function addEventListeners() {
    // Menu button functionality
    if (dom.menuButton) {
        dom.menuButton.addEventListener('click', () => {
            console.log('Menu button clicked');
            // Add menu functionality here
        });
    }
    
    // City select functionality
    if (dom.citySelect) {
        dom.citySelect.addEventListener('change', () => {
            const selectedCity = dom.citySelect.value;
            console.log('[DEBUG] City changed to:', selectedCity);
            if (selectedCity) {
                loadWeatherForCity(selectedCity);
            }
        });
    }
    
    // Initialize city select
    initCitySelect();
    
    // Auto-load weather for a default city
    loadDefaultWeather();
}

// Initialize city select dropdown
function initCitySelect() {
    if (dom.citySelect && utils.turkishCities) {
        weatherUI.populateCitySelect(dom.citySelect, utils.turkishCities);
    }
}

// Load weather for specific city
function loadWeatherForCity(city) {
                weatherService.fetchWeatherAndForecastWithLoading(
        city,
                    (isLoading) => {
            console.log('[DEBUG] Loading weather data for', city, ':', isLoading);
                    },
                    (data) => {
            console.log('[DEBUG] Current weather data received for', city, ':', data);
            weatherUI.updateCurrentWeather(data);
                    },
                    (forecastData) => {
            console.log('[DEBUG] Forecast data received for', city, ':', forecastData);
            weatherUI.updateHourlyForecast(forecastData);
            weatherUI.updateDailyForecast(forecastData);
                    },
                    (msg) => {
            console.log('[DEBUG] Error occurred for', city, ':', msg);
                        weatherUI.showError(msg);
                    },
                    () => {
            console.log('[DEBUG] hideAll called');
        }
    );
}

// Load default weather (Ankara)
function loadDefaultWeather() {
    loadWeatherForCity('Ankara');
}

// Initialize app
window.addEventListener('DOMContentLoaded', () => {
    // Check orientation on load
    checkOrientation();
    
    // Listen for orientation changes
    window.addEventListener('orientationchange', checkOrientation);
    window.addEventListener('resize', checkOrientation);
    
    addEventListeners();
});