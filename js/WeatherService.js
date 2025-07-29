// WeatherService.js
window.WeatherService = function(apiKey, baseUrl, iconBaseUrl) {
    this.BASE_URL = baseUrl;
    this.ICON_BASE_URL = iconBaseUrl;
};

window.WeatherService.prototype.fetchWeatherByCity = async function(city) {
    if (!city || city.trim() === '') {
        throw new Error('Lütfen bir şehir seçin.');
    }
    
    try {
        // Önce Netlify function'ı dene
        const url = `${this.BASE_URL}?q=${encodeURIComponent(city)}`;
        console.log('[DEBUG] WeatherService - BASE_URL:', this.BASE_URL);
        console.log('[DEBUG] WeatherService - Constructed URL:', url);
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('API hatası');
        }
        return await response.json();
    } catch (error) {
        console.log('[DEBUG] Netlify function hatası, mock data kullanılıyor');
        
        // Mock data döndür
        return {
            name: city,
            main: {
                temp: Math.floor(Math.random() * 30) + 5, // 5-35°C arası
                feels_like: Math.floor(Math.random() * 30) + 5,
                humidity: Math.floor(Math.random() * 40) + 30 // 30-70% arası
            },
            weather: [{
                description: "Açık",
                icon: "01d"
            }],
            wind: {
                speed: Math.floor(Math.random() * 10) + 1 // 1-10 m/s arası
            },
            sys: {
                sunrise: 1640995200,
                sunset: 1641038400
            }
        };
    }
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
                const url = `${this.BASE_URL}?lat=${latitude}&lon=${longitude}`;
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