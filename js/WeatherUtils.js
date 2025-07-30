// WeatherUtils.js - Refactored for S.O.L.I.D principles

// Interface for time formatting (Single Responsibility Principle)
class ITimeFormatter {
    formatTime(timestamp, timezone) {
        throw new Error('formatTime method must be implemented');
    }
    
    getCurrentTime() {
        throw new Error('getCurrentTime method must be implemented');
    }
}

// Interface for wind direction calculation (Single Responsibility Principle)
class IWindDirectionCalculator {
    getWindDirection(degree) {
        throw new Error('getWindDirection method must be implemented');
    }
}

// Interface for weather translation (Single Responsibility Principle)
class IWeatherTranslator {
    translateWeatherDescription(description) {
        throw new Error('translateWeatherDescription method must be implemented');
    }
}

// Interface for day name retrieval (Single Responsibility Principle)
class IDayNameProvider {
    getDayName(dayIndex) {
        throw new Error('getDayName method must be implemented');
    }
}

// Interface for city data management (Single Responsibility Principle)
class ICityDataProvider {
    getTurkishCities() {
        throw new Error('getTurkishCities method must be implemented');
    }
}

// Concrete time formatter implementation
class TimeFormatter extends ITimeFormatter {
    formatTime(timestamp, timezone) {
        const date = new Date((timestamp + timezone) * 1000);
        return date.toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'UTC'
        });
    }
    
    getCurrentTime() {
        const now = new Date();
        return now.toLocaleString('tr-TR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Concrete wind direction calculator implementation
class WindDirectionCalculator extends IWindDirectionCalculator {
    getWindDirection(degree) {
        const directions = ['K', 'KKD', 'KD', 'DKD', 'D', 'DGD', 'GD', 'GGD', 'G', 'GGB', 'GB', 'BGB', 'B', 'BBK', 'BK', 'KBK'];
        const index = Math.round(degree / 22.5) % 16;
        return directions[index];
    }
}

// Concrete weather translator implementation
class WeatherTranslator extends IWeatherTranslator {
    constructor() {
        this.weatherTranslations = {
            'clear sky': 'açık',
            'few clouds': 'az bulutlu',
            'scattered clouds': 'parçalı bulutlu',
            'broken clouds': 'çok bulutlu',
            'overcast clouds': 'kapalı',
            'shower rain': 'sağanak yağmurlu',
            'rain': 'yağmurlu',
            'thunderstorm': 'gök gürültülü fırtına',
            'snow': 'karlı',
            'mist': 'sisli',
            'fog': 'sisli',
            'light rain': 'hafif yağmurlu',
            'moderate rain': 'orta şiddetli yağmurlu',
            'heavy rain': 'şiddetli yağmurlu',
            'light snow': 'hafif karlı',
            'heavy snow': 'şiddetli karlı'
        };
    }
    
    translateWeatherDescription(description) {
        return this.weatherTranslations[description.toLowerCase()] || description;
    }
}

// Concrete day name provider implementation
class DayNameProvider extends IDayNameProvider {
    getDayName(dayIndex) {
        const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
        return days[dayIndex];
    }
}

// Concrete city data provider implementation
class CityDataProvider extends ICityDataProvider {
    getTurkishCities() {
        return [
            "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin",
            "Aydın", "Balıkesir", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale",
            "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan", "Erzurum",
            "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Iğdır", "Isparta",
            "İstanbul", "İzmir", "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri",
            "Kırıkkale", "Kırklareli", "Kırşehir", "Kilis", "Kocaeli", "Konya", "Kütahya", "Malatya",
            "Manisa", "Mardin", "Mersin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Osmaniye",
            "Rize", "Sakarya", "Samsun", "Şanlıurfa", "Siirt", "Sinop", "Sivas", "Şırnak", "Tekirdağ",
            "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak"
        ];
    }
}

// Main WeatherUtils class (Open/Closed Principle - open for extension, closed for modification)
class WeatherUtils {
    constructor(
        timeFormatter = new TimeFormatter(),
        windDirectionCalculator = new WindDirectionCalculator(),
        weatherTranslator = new WeatherTranslator(),
        dayNameProvider = new DayNameProvider(),
        cityDataProvider = new CityDataProvider()
    ) {
        this.timeFormatter = timeFormatter;
        this.windDirectionCalculator = windDirectionCalculator;
        this.weatherTranslator = weatherTranslator;
        this.dayNameProvider = dayNameProvider;
        this.cityDataProvider = cityDataProvider;
    }
    
    // Delegate methods to specific implementations
    formatTime(timestamp, timezone) {
        return this.timeFormatter.formatTime(timestamp, timezone);
    }
    
    getCurrentTime() {
        return this.timeFormatter.getCurrentTime();
    }
    
    getWindDirection(degree) {
        return this.windDirectionCalculator.getWindDirection(degree);
    }
    
    translateWeatherDescription(description) {
        return this.weatherTranslator.translateWeatherDescription(description);
    }
    
    getDayName(dayIndex) {
        return this.dayNameProvider.getDayName(dayIndex);
    }
    
    get turkishCities() {
        return this.cityDataProvider.getTurkishCities();
    }
}

// For browser global fallback (optional, for backward compatibility)
if (typeof window !== 'undefined') {
    window.WeatherUtils = WeatherUtils;
    window.TimeFormatter = TimeFormatter;
    window.WindDirectionCalculator = WindDirectionCalculator;
    window.WeatherTranslator = WeatherTranslator;
    window.DayNameProvider = DayNameProvider;
    window.CityDataProvider = CityDataProvider;
} 