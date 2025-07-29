const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const API_KEY = process.env.WEATHER_API_KEY; // Netlify'da gizli tutulacak!
  const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

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
        'Access-Control-Allow-Origin': '*', // Gerekirse kısıtlayabilirsiniz
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