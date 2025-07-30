// WeatherService.js - Refactored for S.O.L.I.D principles

// Interface for HTTP client (Dependency Inversion Principle)
// Note: Using interface as contract rather than inheritance for better flexibility
const IHttpClient = {
    fetch: 'fetch method must be implemented'
};

// Concrete HTTP client implementation
class HttpClient {
    async fetch(url) {
        return await fetch(url);
    }
}

// Interface for error handling (Single Responsibility Principle)
// Note: Using interface as contract rather than inheritance for better flexibility
const IErrorHandler = {
    handleError: 'handleError method must be implemented'
};

// Concrete error handler implementation
class WeatherErrorHandler {
    handleError(response, defaultMessage) {
        let errorMessage = defaultMessage;
        try {
            const errorData = response.json();
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
                case 500:
                    errorMessage = errorData.error || 'Sunucu hatası.';
                    break;
                default:
                    errorMessage = errorData.error || errorData.message || errorMessage;
            }
        } catch (e) {
            console.error('Error parsing error response:', e);
        }
        throw new Error(errorMessage);
    }
}

// Interface for validation (Single Responsibility Principle)
// Note: Using interface as contract rather than inheritance for better flexibility
const IValidator = {
    validateCity: 'validateCity method must be implemented'
};

// Concrete validator implementation
class CityValidator {
    validateCity(city) {
        if (!city || city.trim() === '') {
            throw new Error('Lütfen bir şehir seçin.');
        }
    }
}

// Interface for weather data fetching (Interface Segregation Principle)
// Note: Using interface as contract rather than inheritance for better flexibility
const IWeatherDataFetcher = {
    fetchCurrentWeather: 'fetchCurrentWeather method must be implemented',
    fetchForecast: 'fetchForecast method must be implemented'
};

// Interface for location services (Interface Segregation Principle)
// Note: Using interface as contract rather than inheritance for better flexibility
const ILocationService = {
    getCurrentLocation: 'getCurrentLocation method must be implemented'
};

// Concrete location service implementation
class GeolocationService {
    async getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Konum servisi desteklenmiyor.'));
                return;
            }
            
            navigator.geolocation.getCurrentPosition(
                (position) => resolve(position.coords),
                (error) => {
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
                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000
                }
            );
        });
    }
}

// Main WeatherService class (Open/Closed Principle - open for extension, closed for modification)
class WeatherService {
    constructor(baseUrl, iconBaseUrl, httpClient = new HttpClient(), errorHandler = new WeatherErrorHandler(), validator = new CityValidator()) {
        this.BASE_URL = baseUrl;
        this.ICON_BASE_URL = iconBaseUrl;
        this.httpClient = httpClient;
        this.errorHandler = errorHandler;
        this.validator = validator;
    }

    async fetchWeatherByCity(city) {
        this.validator.validateCity(city);
        
        const url = `${this.BASE_URL}?q=${encodeURIComponent(city)}`;
        console.log('[DEBUG] WeatherService - BASE_URL:', this.BASE_URL);
        console.log('[DEBUG] WeatherService - Constructed URL:', url);
        
        const response = await this.httpClient.fetch(url);
        
        if (!response.ok) {
            this.errorHandler.handleError(response, 'Hava durumu bilgileri alınamadı.');
        }
        
        return await response.json();
    }

    async fetchForecastByCity(city) {
        this.validator.validateCity(city);
        
        const url = `${this.BASE_URL}?q=${encodeURIComponent(city)}&forecast=true`;
        console.log('[DEBUG] WeatherService - Forecast URL:', url);
        
        const response = await this.httpClient.fetch(url);
        
        if (!response.ok) {
            this.errorHandler.handleError(response, 'Hava durumu tahmini alınamadı.');
        }
        
        return await response.json();
    }

    async fetchWeatherWithLoading(city, setButtonLoading, displayWeatherData, showError, hideAll) {
        setButtonLoading(true);
        try {
            const data = await this.fetchWeatherByCity(city);
            displayWeatherData(data);
        } catch (error) {
            showError(error.message);
        } finally {
            setButtonLoading(false);
        }
    }

    async fetchWeatherAndForecastWithLoading(city, setButtonLoading, displayWeatherData, displayForecastData, showError, hideAll) {
        setButtonLoading(true);
        try {
            const [currentData, forecastData] = await Promise.all([
                this.fetchWeatherByCity(city),
                this.fetchForecastByCity(city)
            ]);
            displayWeatherData(currentData);
            displayForecastData(forecastData);
        } catch (error) {
            showError(error.message);
        } finally {
            setButtonLoading(false);
        }
    }

    async getCurrentLocationWeather(setButtonLoading, displayWeatherData, showError) {
        const locationService = new GeolocationService();
        
        try {
            setButtonLoading(true);
            const coords = await locationService.getCurrentLocation();
            const url = `${this.BASE_URL}?lat=${coords.latitude}&lon=${coords.longitude}`;
            const response = await this.httpClient.fetch(url);
            
            if (!response.ok) {
                throw new Error('Konum bilgisi alınamadı.');
            }
            
            const data = await response.json();
            displayWeatherData(data);
        } catch (error) {
            showError(error.message);
        } finally {
            setButtonLoading(false);
        }
    }
}

// For browser global fallback (optional, for backward compatibility)
if (typeof window !== 'undefined') {
    window.WeatherService = WeatherService;
    window.HttpClient = HttpClient;
    window.WeatherErrorHandler = WeatherErrorHandler;
    window.CityValidator = CityValidator;
    window.GeolocationService = GeolocationService;
} 