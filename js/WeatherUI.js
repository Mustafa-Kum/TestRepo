// WeatherUI.js - Refactored for S.O.L.I.D principles

// Interface for DOM manipulation (Dependency Inversion Principle)
class IDomManager {
    showElement(element) {
        throw new Error('showElement method must be implemented');
    }
    
    hideElement(element) {
        throw new Error('hideElement method must be implemented');
    }
    
    setElementText(element, text) {
        throw new Error('setElementText method must be implemented');
    }
    
    setElementAttribute(element, attribute, value) {
        throw new Error('setElementAttribute method must be implemented');
    }
}

// Concrete DOM manager implementation
class DomManager extends IDomManager {
    showElement(element) {
        if (element) {
            element.classList.add('show');
        }
    }
    
    hideElement(element) {
        if (element) {
            element.classList.remove('show');
        }
    }
    
    setElementText(element, text) {
        if (element) {
            element.textContent = text;
        }
    }
    
    setElementAttribute(element, attribute, value) {
        if (element) {
            element.setAttribute(attribute, value);
        }
    }
}

// Interface for data display (Single Responsibility Principle)
class IDataDisplay {
    displayWeatherData(data) {
        throw new Error('displayWeatherData method must be implemented');
    }
    
    displayForecastData(data) {
        throw new Error('displayForecastData method must be implemented');
    }
}

// Interface for UI state management (Single Responsibility Principle)
class IWeatherUIStateManager {
    setButtonLoading(isLoading) {
        throw new Error('setButtonLoading method must be implemented');
    }
    
    showError(message) {
        throw new Error('showError method must be implemented');
    }
    
    hideAll() {
        throw new Error('hideAll method must be implemented');
    }
}

// Interface for forecast data processing (Single Responsibility Principle)
class IForecastProcessor {
    groupForecastsByDay(forecastList) {
        throw new Error('groupForecastsByDay method must be implemented');
    }
    
    createDayForecastCard(dayForecasts) {
        throw new Error('createDayForecastCard method must be implemented');
    }
    
    createHourlyForecast(dayForecasts) {
        throw new Error('createHourlyForecast method must be implemented');
    }
}

// Concrete forecast processor implementation
class ForecastProcessor extends IForecastProcessor {
    constructor(utils) {
        this.utils = utils;
    }
    
    groupForecastsByDay(forecastList) {
        const dailyGroups = {};
        
        forecastList.forEach(forecast => {
            const date = new Date(forecast.dt * 1000);
            const dayKey = date.toISOString().split('T')[0];
            
            if (!dailyGroups[dayKey]) {
                dailyGroups[dayKey] = [];
            }
            dailyGroups[dayKey].push(forecast);
        });
        
        return Object.values(dailyGroups);
    }
    
    createDayForecastCard(dayForecasts) {
        const card = document.createElement('div');
        card.className = 'forecast-day-card';
        
        if (dayForecasts.length === 0) return card;
        
        const firstForecast = dayForecasts[0];
        const date = new Date(firstForecast.dt * 1000);
        const today = new Date();
        const todayKey = today.toISOString().split('T')[0];
        const forecastKey = date.toISOString().split('T')[0];
        
        const isToday = forecastKey === todayKey;
        const dayName = isToday ? 'Bugün' : this.utils.getDayName(date.getDay());
        const dateStr = date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
        
        const avgTemp = Math.round(dayForecasts.reduce((sum, f) => sum + f.main.temp, 0) / dayForecasts.length);
        const avgHumidity = Math.round(dayForecasts.reduce((sum, f) => sum + f.main.humidity, 0) / dayForecasts.length);
        const avgWindSpeed = Math.round(dayForecasts.reduce((sum, f) => sum + (f.wind?.speed || 0), 0) / dayForecasts.length);
        
        const weatherIcons = dayForecasts.map(f => f.weather[0]?.icon).filter(Boolean);
        const mostCommonIcon = this.getMostCommonIcon(weatherIcons);
        
        card.innerHTML = `
            <div class="forecast-day-header">
                <h3>${dayName}</h3>
                <span class="forecast-date">${dateStr}</span>
            </div>
            <div class="forecast-day-main">
                <img src="https://openweathermap.org/img/wn/${mostCommonIcon}@2x.png" alt="Hava Durumu" class="forecast-icon">
                <div class="forecast-temp">${avgTemp}°C</div>
            </div>
            <div class="forecast-day-details">
                <div class="forecast-detail">
                    <i class="fas fa-tint"></i>
                    <span>${avgHumidity}%</span>
                </div>
                <div class="forecast-detail">
                    <i class="fas fa-wind"></i>
                    <span>${avgWindSpeed} m/s</span>
                </div>
            </div>
            <div class="forecast-hourly">
                ${this.createHourlyForecast(dayForecasts)}
            </div>
        `;
        
        return card;
    }
    
    createHourlyForecast(dayForecasts) {
        return dayForecasts.map(forecast => {
            const time = new Date(forecast.dt * 1000);
            const hour = time.getHours();
            const temp = Math.round(forecast.main.temp);
            const icon = forecast.weather[0]?.icon || '01d';
            
            return `
                <div class="forecast-hour">
                    <span class="hour-time">${hour}:00</span>
                    <img src="https://openweathermap.org/img/wn/${icon}.png" alt="Hava Durumu" class="hour-icon">
                    <span class="hour-temp">${temp}°</span>
                </div>
            `;
        }).join('');
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
}

// Main WeatherUI class (Open/Closed Principle)
class WeatherUI extends IWeatherUIStateManager {
    constructor(dom, utils, domManager = new DomManager(), forecastProcessor = null) {
        this.dom = dom;
        this.utils = utils;
        this.domManager = domManager;
        this.forecastProcessor = forecastProcessor || new ForecastProcessor(utils);
    }

    showWeatherDisplay() {
        this.hideAll();
        this.domManager.showElement(this.dom.weatherContainer);
    }

    showError(message) {
        this.hideAll();
        this.domManager.setElementText(this.dom.errorText, message);
        this.domManager.showElement(this.dom.errorMessage);
        setTimeout(() => {
            this.domManager.hideElement(this.dom.errorMessage);
        }, 5000);
    }

    hideAll() {
        this.domManager.hideElement(this.dom.weatherContainer);
        this.domManager.hideElement(this.dom.errorMessage);
    }

    setButtonLoading(isLoading) {
        const buttonText = this.dom.getWeatherBtn.querySelector('span');
        const buttonIcon = this.dom.getWeatherBtn.querySelector('i');
        
        if (isLoading) {
            this.dom.getWeatherBtn.disabled = true;
            buttonIcon.className = 'fas fa-spinner fa-spin';
            this.domManager.setElementText(buttonText, 'Yükleniyor...');
            this.dom.getWeatherBtn.style.opacity = '0.7';
        } else {
            this.dom.getWeatherBtn.disabled = false;
            buttonIcon.className = 'fas fa-search';
            this.domManager.setElementText(buttonText, 'Hava Durumunu Getir');
            this.dom.getWeatherBtn.style.opacity = '1';
        }
    }

    displayWeatherData(data) {
        if (!data) {
            this.showError('Hava durumu verisi alınamadı.');
            return;
        }
        
        try {
            const { name, main, weather, wind, sys } = data;
            const locationText = sys?.country ? `${name}, ${sys.country}` : name;
            
            this.domManager.setElementText(this.dom.locationText, locationText);
            this.domManager.setElementText(this.dom.currentTime, this.utils.getCurrentTime());
            this.domManager.setElementText(this.dom.temperature, `${Math.round(main.temp)}°`);
            this.domManager.setElementText(this.dom.feelsLike, `Hissedilen: ${Math.round(main.feels_like)}°C`);
            
            if (weather[0]?.icon) {
                this.domManager.setElementAttribute(this.dom.weatherIcon, 'src', `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`);
                this.domManager.setElementAttribute(this.dom.weatherIcon, 'alt', weather[0].description);
            }
            
            const translatedDescription = this.utils.translateWeatherDescription(weather[0]?.description || '');
            this.domManager.setElementText(this.dom.description, translatedDescription);
            this.domManager.setElementText(this.dom.humidity, `${main.humidity}%`);
            
            const windText = wind?.speed ? `${Math.round(wind.speed)} m/s ${wind.deg ? this.utils.getWindDirection(wind.deg) : ''}` : 'Bilinmiyor';
            this.domManager.setElementText(this.dom.windSpeed, windText);
            
            if (sys.sunrise && sys.sunset) {
                this.domManager.setElementText(this.dom.sunrise, this.utils.formatTime(sys.sunrise, data.timezone));
                this.domManager.setElementText(this.dom.sunset, this.utils.formatTime(sys.sunset, data.timezone));
            } else {
                this.domManager.setElementText(this.dom.sunrise, 'Bilinmiyor');
                this.domManager.setElementText(this.dom.sunset, 'Bilinmiyor');
            }
            
            this.showWeatherDisplay();
        } catch (error) {
            console.error('Veri gösterilirken hata:', error);
            this.showError('Hava durumu verileri gösterilirken bir hata oluştu.');
        }
    }

    displayForecastData(data) {
        if (!data || !data.list) {
            console.error('Forecast verisi alınamadı:', data);
            return;
        }
        
        try {
            const forecastContainer = this.dom.forecastContainer;
            if (!forecastContainer) {
                console.error('Forecast container bulunamadı');
                return;
            }
            
            forecastContainer.innerHTML = '';
            
            const dailyForecasts = this.forecastProcessor.groupForecastsByDay(data.list);
            const today = new Date();
            const todayKey = today.toISOString().split('T')[0];
            const allForecasts = dailyForecasts.slice(0, 5);
            
            const dropdownContainer = this.createForecastDropdown(allForecasts);
            forecastContainer.appendChild(dropdownContainer);
            
            if (allForecasts.length > 0) {
                this.showSelectedDayForecast(allForecasts[0]);
            }
            
        } catch (error) {
            console.error('Forecast verisi gösterilirken hata:', error);
        }
    }

    createForecastDropdown(futureForecasts) {
        const dropdownContainer = document.createElement('div');
        dropdownContainer.className = 'forecast-dropdown-container';
        
        const select = document.createElement('select');
        select.className = 'forecast-day-select';
        select.id = 'forecast-day-select';
        
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Gün seçiniz...';
        defaultOption.disabled = true;
        select.appendChild(defaultOption);
        
        futureForecasts.forEach((dayForecast, index) => {
            const firstForecast = dayForecast[0];
            const date = new Date(firstForecast.dt * 1000);
            const today = new Date();
            const todayKey = today.toISOString().split('T')[0];
            const forecastKey = date.toISOString().split('T')[0];
            
            const isToday = forecastKey === todayKey;
            const dayName = isToday ? 'Bugün' : this.utils.getDayName(date.getDay());
            const dateStr = date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
            
            const option = document.createElement('option');
            option.value = index;
            option.textContent = isToday ? 'Bugün' : `${dayName} ${dateStr}`;
            select.appendChild(option);
        });
        
        select.addEventListener('change', (e) => {
            const selectedIndex = parseInt(e.target.value);
            if (selectedIndex >= 0 && selectedIndex < futureForecasts.length) {
                this.showSelectedDayForecast(futureForecasts[selectedIndex]);
            }
        });
        
        dropdownContainer.appendChild(select);
        
        const detailsContainer = document.createElement('div');
        detailsContainer.className = 'forecast-details-container';
        detailsContainer.id = 'forecast-details-container';
        dropdownContainer.appendChild(detailsContainer);
        
        return dropdownContainer;
    }

    showSelectedDayForecast(dayForecasts) {
        const detailsContainer = document.getElementById('forecast-details-container');
        if (!detailsContainer) return;
        
        detailsContainer.innerHTML = '';
        const dayCard = this.forecastProcessor.createDayForecastCard(dayForecasts);
        detailsContainer.appendChild(dayCard);
    }

    populateCitySelect(citySelect, turkishCities) {
        citySelect.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Şehir seçiniz...';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        citySelect.appendChild(defaultOption);
        
        turkishCities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
    }
}

// For browser global fallback (optional, for backward compatibility)
if (typeof window !== 'undefined') {
    window.WeatherUI = WeatherUI;
    window.DomManager = DomManager;
    window.ForecastProcessor = ForecastProcessor;
} 