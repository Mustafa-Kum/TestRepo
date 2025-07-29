const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const API_KEY = process.env.WEATHER_API_KEY;
  const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

  // API key yoksa mock data döndür
  if (!API_KEY) {
    console.log('API key bulunamadı, mock data döndürülüyor');
    return {
      statusCode: 200,
      body: JSON.stringify({
        name: "Test Şehir",
        main: {
          temp: 22,
          feels_like: 24,
          humidity: 65
        },
        weather: [{
          description: "Açık",
          icon: "01d"
        }],
        wind: {
          speed: 5.2
        },
        sys: {
          sunrise: 1640995200,
          sunset: 1641038400
        }
      }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    };
  }

  const params = event.queryStringParameters;
  let url = `${BASE_URL}?appid=${API_KEY}&units=metric&lang=tr`;

  if (params.q) url += `&q=${encodeURIComponent(params.q)}`;
  if (params.lat && params.lon) url += `&lat=${params.lat}&lon=${params.lon}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return {
      statusCode: response.status,
      body: JSON.stringify(data),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Sunucu hatası' })
    };
  }
}; 