// WeatherUI.js
function WeatherUI(dom, utils) {
    this.dom = dom;
    this.utils = utils;
}

WeatherUI.prototype.showWeatherDisplay = function() {
    this.hideAll();
    this.dom.weatherDisplay.classList.add('show');
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
    this.dom.weatherDisplay.classList.remove('show');
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
        this.dom.locationText.textContent = `${name}, ${sys.country}`;
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