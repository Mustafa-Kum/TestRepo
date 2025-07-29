// WeatherUtils.js
const WeatherUtils = {
    formatTime: function(timestamp, timezone) {
        const date = new Date((timestamp + timezone) * 1000);
        return date.toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'UTC'
        });
    },
    getCurrentTime: function() {
        const now = new Date();
        return now.toLocaleString('tr-TR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    getWindDirection: function(degree) {
        const directions = ['K', 'KKD', 'KD', 'DKD', 'D', 'DGD', 'GD', 'GGD', 'G', 'GGB', 'GB', 'BGB', 'B', 'BBK', 'BK', 'KBK'];
        const index = Math.round(degree / 22.5) % 16;
        return directions[index];
    },
    weatherTranslations: {
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
    },
    translateWeatherDescription: function(description) {
        return WeatherUtils.weatherTranslations[description.toLowerCase()] || description;
    },
    turkishCities: [
        "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin",
        "Aydın", "Balıkesir", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale",
        "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan", "Erzurum",
        "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Iğdır", "Isparta",
        "İstanbul", "İzmir", "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri",
        "Kırıkkale", "Kırklareli", "Kırşehir", "Kilis", "Kocaeli", "Konya", "Kütahya", "Malatya",
        "Manisa", "Mardin", "Mersin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Osmaniye",
        "Rize", "Sakarya", "Samsun", "Şanlıurfa", "Siirt", "Sinop", "Sivas", "Şırnak", "Tekirdağ",
        "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak"
    ]
};
// For browser global fallback (optional, for backward compatibility)
if (typeof window !== 'undefined') window.WeatherUtils = WeatherUtils; 