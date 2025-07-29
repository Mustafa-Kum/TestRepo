// WeatherService.js
window.WeatherService = function(apiKey, baseUrl, iconBaseUrl) {
    this.API_KEY = apiKey;
    this.BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
    this.ICON_BASE_URL = iconBaseUrl;
};

window.WeatherService.prototype.fetchWeatherByCity = async function(city) {
    if (!city || city.trim() === '') {
        throw new Error('Lütfen bir şehir seçin.');
    }
    
    // Direkt OpenWeatherMap API'sine istek at
    const url = `${this.BASE_URL}?q=${encodeURIComponent(city)}&appid=${this.API_KEY}&units=metric&lang=tr`;
    console.log('[DEBUG] WeatherService - Direct API call:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
        let errorMessage = 'Hava durumu bilgileri alınamadı.';
        try {
            const errorData = await response.json();
            switch (response.status) {
                case 404:
                    errorMessage = 'Şehir bulunamadı. Lütfen geçerli bir şehir adı girin.';
                    break;
                case 401:
                    errorMessage = 'API anahtarı geçersiz.';
                    break;
                case 429:
                    errorMessage = 'Çok fazla istek gönderildi. Lütfen biraz bekleyin.';
                    break;
                default:
                    errorMessage = errorData.message || errorMessage;
            }
        } catch (e) {
            console.error('Error parsing error response:', e);
        }
        throw new Error(errorMessage);
    }
    
    return await response.json();
};

window.WeatherService.prototype.fetchWeatherWithLoading = async function(city, setButtonLoading, displayWeatherData, showError, hideAll) {
    setButtonLoading(true);
    try {
        const data = await this.fetchWeatherByCity(city);
        displayWeatherData(data);
    } catch (error) {
        showError(error.message);
    } finally {
        setButtonLoading(false);
    }
};

window.WeatherService.prototype.getCurrentLocationWeather = function(setButtonLoading, displayWeatherData, showError) {
    if (!navigator.geolocation) {
        showError('Konum servisi desteklenmiyor.');
        return;
    }
    setButtonLoading(true);
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                const url = `${this.BASE_URL}?lat=${latitude}&lon=${longitude}&appid=${this.API_KEY}&units=metric&lang=tr`;
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Konum bilgisi alınamadı.');
                }
                const data = await response.json();
                displayWeatherData(data);
            } catch (error) {
                showError('Konumunuz için hava durumu bilgisi alınamadı.');
            } finally {
                setButtonLoading(false);
            }
        },
        (error) => {
            setButtonLoading(false);
            let errorMessage = 'Konum bilgisi alınamadı.';
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = 'Konum izni reddedildi.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Konum bilgisi mevcut değil.';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'Konum bilgisi alma zaman aşımına uğradı.';
                    break;
            }
            showError(errorMessage);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
        }
    );
}; 