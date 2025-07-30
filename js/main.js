// main.js - Refactored for S.O.L.I.D principles

// Interface for orientation management (Single Responsibility Principle)
class IOrientationManager {
    checkOrientation() {
        throw new Error('checkOrientation method must be implemented');
    }
}

// Interface for event management (Single Responsibility Principle)
class IEventManager {
    addEventListeners() {
        throw new Error('addEventListeners method must be implemented');
    }
}

// Interface for weather data management (Single Responsibility Principle)
class IWeatherDataManager {
    loadWeatherForCity(city) {
        throw new Error('loadWeatherForCity method must be implemented');
    }
    
    loadDefaultWeather() {
        throw new Error('loadDefaultWeather method must be implemented');
    }
}

// Interface for UI state management (Single Responsibility Principle)
class IUIStateManager {
    updateCurrentWeather(data) {
        throw new Error('updateCurrentWeather method must be implemented');
    }
    
    updateSelectedDayWeather(dayIndex) {
        throw new Error('updateSelectedDayWeather method must be implemented');
    }
    
    updateHourlyForecast(data) {
        throw new Error('updateHourlyForecast method must be implemented');
    }
    
    updateDailyForecast(data) {
        throw new Error('updateDailyForecast method must be implemented');
    }
    
    showError(message) {
        throw new Error('showError method must be implemented');
    }
    
    populateCitySelect(citySelect, turkishCities) {
        throw new Error('populateCitySelect method must be implemented');
    }
}

// Concrete orientation manager implementation
class OrientationManager extends IOrientationManager {
    checkOrientation() {
        const isLandscape = window.innerWidth > window.innerHeight;
        const isMobile = window.innerWidth <= 768;
        
        if (isLandscape && isMobile) {
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
            
            if (screen.orientation && screen.orientation.lock) {
                screen.orientation.lock('portrait').catch(() => {
                    console.log('Orientation lock not supported');
                });
            }
        } else {
            document.body.style.display = 'block';
            const warning = document.getElementById('orientation-warning');
            if (warning) {
                warning.remove();
            }
        }
    }
}

// Concrete event manager implementation
class EventManager extends IEventManager {
    constructor(dom, weatherDataManager) {
        this.dom = dom;
        this.weatherDataManager = weatherDataManager;
    }
    
    addEventListeners() {
        if (this.dom.menuButton) {
            this.dom.menuButton.addEventListener('click', () => {
                console.log('Menu button clicked');
            });
        }
        
        if (this.dom.citySelect) {
            this.dom.citySelect.addEventListener('change', () => {
                const selectedCity = this.dom.citySelect.value;
                console.log('[DEBUG] City changed to:', selectedCity);
                if (selectedCity) {
                    this.weatherDataManager.loadWeatherForCity(selectedCity);
                }
            });
        }
    }
}

// Concrete weather data manager implementation
class WeatherDataManager extends IWeatherDataManager {
    constructor(weatherService, weatherUI) {
        this.weatherService = weatherService;
        this.weatherUI = weatherUI;
    }
    
    loadWeatherForCity(city) {
        this.weatherService.fetchWeatherAndForecastWithLoading(
            city,
            (isLoading) => {
                console.log('[DEBUG] Loading weather data for', city, ':', isLoading);
            },
            (data) => {
                console.log('[DEBUG] Current weather data received for', city, ':', data);
                this.weatherUI.updateCurrentWeather(data);
            },
            (forecastData) => {
                console.log('[DEBUG] Forecast data received for', city, ':', forecastData);
                this.weatherUI.updateHourlyForecast(forecastData);
                this.weatherUI.updateDailyForecast(forecastData);
            },
            (msg) => {
                console.log('[DEBUG] Error occurred for', city, ':', msg);
                this.weatherUI.showError(msg);
            },
            () => {
                console.log('[DEBUG] hideAll called');
            }
        );
    }
    
    loadDefaultWeather() {
        this.loadWeatherForCity('Ankara');
    }
}

// Concrete UI state manager implementation
class UIStateManager extends IUIStateManager {
    constructor(dom, utils) {
        this.dom = dom;
        this.utils = utils;
        this.currentForecastData = null;
        this.selectedDayIndex = 0;
    }
    
    updateCurrentWeather(data) {
        if (!data) return;
        
        const { main, weather } = data;
        
        if (this.dom.currentTemperature) {
            this.dom.currentTemperature.textContent = `${Math.round(main.temp)}°C`;
        }
        
        if (this.dom.weatherCondition) {
            const translatedDescription = this.utils.translateWeatherDescription(weather[0]?.description || '');
            this.dom.weatherCondition.textContent = translatedDescription;
        }
        
        if (this.dom.feelsLike) {
            this.dom.feelsLike.textContent = `Hissedilen ${Math.round(main.feels_like)}°`;
        }
        
        if (this.dom.currentLabel) {
            this.dom.currentLabel.textContent = 'Şimdi';
        }
    }
    
    updateSelectedDayWeather(dayIndex) {
        if (!this.currentForecastData || !this.currentForecastData.list) return;
        
        const dailyGroups = {};
        this.currentForecastData.list.forEach(forecast => {
            const date = new Date(forecast.dt * 1000);
            const dayKey = date.toISOString().split('T')[0];
            
            if (!dailyGroups[dayKey]) {
                dailyGroups[dayKey] = [];
            }
            dailyGroups[dayKey].push(forecast);
        });
        
        const allDays = Object.entries(dailyGroups).slice(0, 5);
        
        if (dayIndex >= 0 && dayIndex < allDays.length) {
            const [dayKey, forecasts] = allDays[dayIndex];
            const date = new Date(dayKey);
            const today = new Date();
            const todayKey = today.toISOString().split('T')[0];
            
            const isToday = dayKey === todayKey;
            const dayName = isToday ? 'Bugün' : this.utils.getDayName(date.getDay());
            
            const avgTemp = Math.round(forecasts.reduce((sum, f) => sum + f.main.temp, 0) / forecasts.length);
            const avgFeelsLike = Math.round(forecasts.reduce((sum, f) => sum + f.main.feels_like, 0) / forecasts.length);
            
            const weatherIcons = forecasts.map(f => f.weather[0]?.icon).filter(Boolean);
            const mostCommonIcon = this.getMostCommonIcon(weatherIcons);
            const weatherDescription = forecasts[0]?.weather[0]?.description || '';
            
            if (this.dom.currentTemperature) {
                this.dom.currentTemperature.textContent = `${avgTemp}°C`;
            }
            
            if (this.dom.weatherCondition) {
                const translatedDescription = this.utils.translateWeatherDescription(weatherDescription);
                this.dom.weatherCondition.textContent = translatedDescription;
            }
            
            if (this.dom.feelsLike) {
                this.dom.feelsLike.textContent = `Hissedilen ${avgFeelsLike}°`;
            }
            
            if (this.dom.currentLabel) {
                this.dom.currentLabel.textContent = dayName;
            }
            
            this.updateHourlyForecastForDay(forecasts);
        }
    }
    
    updateHourlyForecastForDay(dayForecasts) {
        if (!this.dom.hourlyForecast) return;
        
        this.dom.hourlyForecast.innerHTML = '';
        
        dayForecasts.forEach((hour, index) => {
            const time = new Date(hour.dt * 1000);
            const hourStr = `${time.getHours()}:00`;
            const temp = Math.round(hour.main.temp);
            const icon = hour.weather[0]?.icon || '01d';
            
            const hourlyItem = document.createElement('div');
            hourlyItem.className = 'hourly-item';
            
            let iconClass = 'fas fa-moon';
            if (icon.includes('d')) {
                if (icon.includes('01')) iconClass = 'fas fa-sun';
                else if (icon.includes('02')) iconClass = 'fas fa-cloud-sun';
                else if (icon.includes('03') || icon.includes('04')) iconClass = 'fas fa-cloud';
                else if (icon.includes('09') || icon.includes('10')) iconClass = 'fas fa-cloud-rain';
                else if (icon.includes('11')) iconClass = 'fas fa-bolt';
                else if (icon.includes('13')) iconClass = 'fas fa-snowflake';
                else if (icon.includes('50')) iconClass = 'fas fa-smog';
            } else {
                if (icon.includes('01')) iconClass = 'fas fa-moon';
                else if (icon.includes('02')) iconClass = 'fas fa-cloud-moon';
                else if (icon.includes('03') || icon.includes('04')) iconClass = 'fas fa-cloud';
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
            
            this.dom.hourlyForecast.appendChild(hourlyItem);
        });
    }
    
    updateHourlyForecast(data) {
        if (!data || !data.list) return;
        
        if (this.dom.hourlyForecast) {
            this.dom.hourlyForecast.innerHTML = '';
        }
        
        const hourlyData = data.list.slice(0, 6);
        
        hourlyData.forEach((hour, index) => {
            const time = new Date(hour.dt * 1000);
            const hourStr = index === 0 ? 'Şimdi' : `${time.getHours()}:00`;
            const temp = Math.round(hour.main.temp);
            const icon = hour.weather[0]?.icon || '01d';
            
            const hourlyItem = document.createElement('div');
            hourlyItem.className = `hourly-item ${index === 0 ? 'current' : ''}`;
            
            let iconClass = 'fas fa-moon';
            if (icon.includes('d')) {
                if (icon.includes('01')) iconClass = 'fas fa-sun';
                else if (icon.includes('02')) iconClass = 'fas fa-cloud-sun';
                else if (icon.includes('03') || icon.includes('04')) iconClass = 'fas fa-cloud';
                else if (icon.includes('09') || icon.includes('10')) iconClass = 'fas fa-cloud-rain';
                else if (icon.includes('11')) iconClass = 'fas fa-bolt';
                else if (icon.includes('13')) iconClass = 'fas fa-snowflake';
                else if (icon.includes('50')) iconClass = 'fas fa-smog';
            } else {
                if (icon.includes('01')) iconClass = 'fas fa-moon';
                else if (icon.includes('02')) iconClass = 'fas fa-cloud-moon';
                else if (icon.includes('03') || icon.includes('04')) iconClass = 'fas fa-cloud';
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
            
            if (this.dom.hourlyForecast) {
                this.dom.hourlyForecast.appendChild(hourlyItem);
            }
        });
    }
    
    updateDailyForecast(data) {
        if (!data || !data.list) return;
        
        this.currentForecastData = data;
        
        if (this.dom.dailyForecastContainer) {
            this.dom.dailyForecastContainer.innerHTML = '';
        }
        
        const dailyGroups = {};
        data.list.forEach(forecast => {
            const date = new Date(forecast.dt * 1000);
            const dayKey = date.toISOString().split('T')[0];
            
            if (!dailyGroups[dayKey]) {
                dailyGroups[dayKey] = [];
            }
            dailyGroups[dayKey].push(forecast);
        });
        
        const today = new Date();
        const todayKey = today.toISOString().split('T')[0];
        const allDays = Object.entries(dailyGroups).slice(0, 5);
        
        allDays.forEach(([dayKey, forecasts], index) => {
            const date = new Date(dayKey);
            const today = new Date();
            const todayKey = today.toISOString().split('T')[0];
            
            const isToday = dayKey === todayKey;
            const dayName = isToday ? 'Bugün' : this.utils.getDayName(date.getDay());
            
            const avgTemp = Math.round(forecasts.reduce((sum, f) => sum + f.main.temp, 0) / forecasts.length);
            const minTemp = Math.round(Math.min(...forecasts.map(f => f.main.temp)));
            const maxTemp = Math.round(Math.max(...forecasts.map(f => f.main.temp)));
            
            const weatherIcons = forecasts.map(f => f.weather[0]?.icon).filter(Boolean);
            const mostCommonIcon = this.getMostCommonIcon(weatherIcons);
            
            let iconClass = 'fas fa-cloud';
            if (mostCommonIcon.includes('01')) iconClass = 'fas fa-sun';
            else if (mostCommonIcon.includes('02')) iconClass = 'fas fa-cloud-sun';
            else if (mostCommonIcon.includes('03') || mostCommonIcon.includes('04')) iconClass = 'fas fa-cloud';
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
            
            dailyItem.addEventListener('click', () => {
                document.querySelectorAll('.daily-item').forEach(d => d.classList.remove('selected'));
                dailyItem.classList.add('selected');
                this.selectedDayIndex = index;
                this.updateSelectedDayWeather(index);
            });
            
            if (this.dom.dailyForecastContainer) {
                this.dom.dailyForecastContainer.appendChild(dailyItem);
            }
        });
    }
    
    getMostCommonIcon(icons) {
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
    }
    
    showError(message) {
        console.error('Weather error:', message);
    }
    
    populateCitySelect(citySelect, turkishCities) {
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
        
        citySelect.value = 'Ankara';
    }
}

// Main application class (Open/Closed Principle)
class WeatherApp {
    constructor() {
        this.BASE_URL = '/.netlify/functions/weather';
        this.ICON_BASE_URL = 'https://openweathermap.org/img/wn/';
        
        console.log('[DEBUG] BASE_URL:', this.BASE_URL);
        
        this.utils = typeof WeatherUtils !== 'undefined' ? WeatherUtils : window.WeatherUtils;
        
        this.dom = {
            citySelect: document.getElementById('city-select'),
            locationText: document.getElementById('location-text'),
            currentTemp: document.getElementById('current-temp'),
            currentCondition: document.getElementById('current-condition'),
            feelsLikeTemp: document.getElementById('feels-like-temp'),
            hourlyData: document.getElementById('hourly-data'),
            dailyData: document.getElementById('daily-data'),
            currentTemperature: document.querySelector('.current-temperature'),
            weatherCondition: document.querySelector('.weather-condition'),
            feelsLike: document.querySelector('.feels-like'),
            currentLabel: document.querySelector('.current-label'),
            hourlyForecast: document.querySelector('.hourly-forecast'),
            dailyForecastContainer: document.querySelector('.daily-forecast-container'),
            menuButton: document.querySelector('.menu-button')
        };
        
        this.weatherService = new window.WeatherService(null, this.BASE_URL, this.ICON_BASE_URL);
        this.weatherUI = new window.WeatherUI(this.dom, this.utils);
        this.uiStateManager = new UIStateManager(this.dom, this.utils);
        this.weatherDataManager = new WeatherDataManager(this.weatherService, this.uiStateManager);
        this.eventManager = new EventManager(this.dom, this.weatherDataManager);
        this.orientationManager = new OrientationManager();
    }
    
    init() {
        this.orientationManager.checkOrientation();
        
        window.addEventListener('orientationchange', () => this.orientationManager.checkOrientation());
        window.addEventListener('resize', () => this.orientationManager.checkOrientation());
        
        this.eventManager.addEventListeners();
        this.initCitySelect();
        this.weatherDataManager.loadDefaultWeather();
    }
    
    initCitySelect() {
        if (this.dom.citySelect && this.utils.turkishCities) {
            this.uiStateManager.populateCitySelect(this.dom.citySelect, this.utils.turkishCities);
        }
    }
}

// Initialize app when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    const app = new WeatherApp();
    app.init();
});