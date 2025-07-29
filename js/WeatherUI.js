// WeatherUI.js
function WeatherUI(dom, utils) {
    this.dom = dom;
    this.utils = utils;
}

WeatherUI.prototype.showWeatherDisplay = function() {
    this.hideAll();
    this.dom.weatherContainer.classList.add('show');
};

WeatherUI.prototype.showError = function(message) {
    this.hideAll();
    this.dom.errorText.textContent = message;
    this.dom.errorMessage.classList.add('show');
    setTimeout(() => {
        this.dom.errorMessage.classList.remove('show');
    }, 5000);
};

WeatherUI.prototype.hideAll = function() {
    this.dom.weatherContainer.classList.remove('show');
    this.dom.errorMessage.classList.remove('show');
};

WeatherUI.prototype.setButtonLoading = function(isLoading) {
    const buttonText = this.dom.getWeatherBtn.querySelector('span');
    const buttonIcon = this.dom.getWeatherBtn.querySelector('i');
    if (isLoading) {
        this.dom.getWeatherBtn.disabled = true;
        buttonIcon.className = 'fas fa-spinner fa-spin';
        buttonText.textContent = 'Yükleniyor...';
        this.dom.getWeatherBtn.style.opacity = '0.7';
    } else {
        this.dom.getWeatherBtn.disabled = false;
        buttonIcon.className = 'fas fa-search';
        buttonText.textContent = 'Hava Durumunu Getir';
        this.dom.getWeatherBtn.style.opacity = '1';
    }
};

WeatherUI.prototype.displayWeatherData = function(data) {
    if (!data) {
        this.showError('Hava durumu verisi alınamadı.');
        return;
    }
    try {
        const { name, main, weather, wind, sys } = data;
        // Country bilgisi yoksa sadece şehir adını göster
        const locationText = sys?.country ? `${name}, ${sys.country}` : name;
        this.dom.locationText.textContent = locationText;
        this.dom.currentTime.textContent = this.utils.getCurrentTime();
        this.dom.temperature.textContent = `${Math.round(main.temp)}°`;
        this.dom.feelsLike.textContent = `Hissedilen: ${Math.round(main.feels_like)}°C`;
        if (weather[0]?.icon) {
            this.dom.weatherIcon.src = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;
            this.dom.weatherIcon.alt = weather[0].description;
        }
        const translatedDescription = this.utils.translateWeatherDescription(weather[0]?.description || '');
        this.dom.description.textContent = translatedDescription;
        this.dom.humidity.textContent = `${main.humidity}%`;
        this.dom.windSpeed.textContent = wind?.speed ? `${Math.round(wind.speed)} m/s ${wind.deg ? this.utils.getWindDirection(wind.deg) : ''}` : 'Bilinmiyor';
        if (sys.sunrise && sys.sunset) {
            this.dom.sunrise.textContent = this.utils.formatTime(sys.sunrise, data.timezone);
            this.dom.sunset.textContent = this.utils.formatTime(sys.sunset, data.timezone);
        } else {
            this.dom.sunrise.textContent = 'Bilinmiyor';
            this.dom.sunset.textContent = 'Bilinmiyor';
        }
        this.showWeatherDisplay();
    } catch (error) {
        console.error('Veri gösterilirken hata:', error);
        this.showError('Hava durumu verileri gösterilirken bir hata oluştu.');
    }
};

WeatherUI.prototype.displayForecastData = function(data) {
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
        
        // Forecast container'ı temizle
        forecastContainer.innerHTML = '';
        
        // 5 günlük tahmin için günlük gruplar oluştur
        const dailyForecasts = this.groupForecastsByDay(data.list);
        
        // Bugünün tarihini al
        const today = new Date();
        const todayKey = today.toISOString().split('T')[0];
        
        // Gelecek günleri filtrele
        const futureForecasts = dailyForecasts.filter((dayForecast, index) => {
            if (index >= 5) return false; // Sadece 5 gün göster
            
            const firstForecast = dayForecast[0];
            const forecastDate = new Date(firstForecast.dt * 1000);
            const forecastKey = forecastDate.toISOString().split('T')[0];
            
            return forecastKey !== todayKey; // Bugünün forecast'unu atla
        });
        
        // Dropdown menü oluştur
        const dropdownContainer = this.createForecastDropdown(futureForecasts);
        forecastContainer.appendChild(dropdownContainer);
        
        // İlk günü varsayılan olarak göster
        if (futureForecasts.length > 0) {
            this.showSelectedDayForecast(futureForecasts[0]);
        }
        
        // Forecast section zaten weather container içinde olduğu için ayrıca göstermeye gerek yok
        
    } catch (error) {
        console.error('Forecast verisi gösterilirken hata:', error);
    }
};

WeatherUI.prototype.groupForecastsByDay = function(forecastList) {
    const dailyGroups = {};
    
    forecastList.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD formatı
        
        if (!dailyGroups[dayKey]) {
            dailyGroups[dayKey] = [];
        }
        dailyGroups[dayKey].push(forecast);
    });
    
    return Object.values(dailyGroups);
};

WeatherUI.prototype.createDayForecastCard = function(dayForecasts) {
    const card = document.createElement('div');
    card.className = 'forecast-day-card';
    
    if (dayForecasts.length === 0) return card;
    
    const firstForecast = dayForecasts[0];
    const date = new Date(firstForecast.dt * 1000);
    const dayName = this.utils.getDayName(date.getDay());
    const dateStr = date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    
    // Günlük ortalama değerler hesapla
    const avgTemp = Math.round(dayForecasts.reduce((sum, f) => sum + f.main.temp, 0) / dayForecasts.length);
    const avgHumidity = Math.round(dayForecasts.reduce((sum, f) => sum + f.main.humidity, 0) / dayForecasts.length);
    const avgWindSpeed = Math.round(dayForecasts.reduce((sum, f) => sum + (f.wind?.speed || 0), 0) / dayForecasts.length);
    
    // En yaygın hava durumu ikonu
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
};

WeatherUI.prototype.getMostCommonIcon = function(icons) {
    const iconCount = {};
    icons.forEach(icon => {
        iconCount[icon] = (iconCount[icon] || 0) + 1;
    });
    
    let mostCommon = '01d'; // Varsayılan
    let maxCount = 0;
    
    Object.entries(iconCount).forEach(([icon, count]) => {
        if (count > maxCount) {
            maxCount = count;
            mostCommon = icon;
        }
    });
    
    return mostCommon;
};

WeatherUI.prototype.createHourlyForecast = function(dayForecasts) {
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
};

WeatherUI.prototype.createForecastDropdown = function(futureForecasts) {
    const dropdownContainer = document.createElement('div');
    dropdownContainer.className = 'forecast-dropdown-container';
    
    // Dropdown select oluştur
    const select = document.createElement('select');
    select.className = 'forecast-day-select';
    select.id = 'forecast-day-select';
    
    // Varsayılan seçenek
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Gün seçiniz...';
    defaultOption.disabled = true;
    select.appendChild(defaultOption);
    
    // Gün seçeneklerini ekle
    futureForecasts.forEach((dayForecast, index) => {
        const firstForecast = dayForecast[0];
        const date = new Date(firstForecast.dt * 1000);
        const dayName = this.utils.getDayName(date.getDay());
        const dateStr = date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
        
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${dayName} ${dateStr}`;
        select.appendChild(option);
    });
    
    // Seçim değiştiğinde günü göster
    select.addEventListener('change', (e) => {
        const selectedIndex = parseInt(e.target.value);
        if (selectedIndex >= 0 && selectedIndex < futureForecasts.length) {
            this.showSelectedDayForecast(futureForecasts[selectedIndex]);
        }
    });
    
    dropdownContainer.appendChild(select);
    
    // Seçilen günün detaylarını gösterecek container
    const detailsContainer = document.createElement('div');
    detailsContainer.className = 'forecast-details-container';
    detailsContainer.id = 'forecast-details-container';
    dropdownContainer.appendChild(detailsContainer);
    
    return dropdownContainer;
};

WeatherUI.prototype.showSelectedDayForecast = function(dayForecasts) {
    const detailsContainer = document.getElementById('forecast-details-container');
    if (!detailsContainer) return;
    
    // Container'ı temizle
    detailsContainer.innerHTML = '';
    
    // Seçilen günün kartını oluştur
    const dayCard = this.createDayForecastCard(dayForecasts);
    detailsContainer.appendChild(dayCard);
};

WeatherUI.prototype.populateCitySelect = function(citySelect, turkishCities) {
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
};

// For browser global fallback (optional, for backward compatibility)
if (typeof window !== 'undefined') window.WeatherUI = WeatherUI; 