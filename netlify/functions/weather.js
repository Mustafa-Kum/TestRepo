const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  const API_KEY = process.env.WEATHER_API_KEY;
  
  if (!API_KEY) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'API key bulunamadı. Lütfen Netlify environment variables\'da WEATHER_API_KEY ayarlayın.' 
      })
    };
  }

  const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
  const params = event.queryStringParameters || {};
  
  let url = `${BASE_URL}?appid=${API_KEY}&units=metric&lang=tr`;

  if (params.q) {
    url += `&q=${encodeURIComponent(params.q)}`;
  } else if (params.lat && params.lon) {
    url += `&lat=${params.lat}&lon=${params.lon}`;
  } else {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Şehir adı veya koordinat gerekli' })
    };
  }

  try {
    console.log('Weather API isteği:', url);
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Weather API hatası:', data);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: data.message || 'Hava durumu bilgisi alınamadı',
          cod: data.cod
        })
      };
    }

    console.log('Weather API başarılı:', data.name);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Function hatası:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Sunucu hatası: ' + error.message 
      })
    };
  }
}; 