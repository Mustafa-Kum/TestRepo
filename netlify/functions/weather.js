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

  // Mock data for testing
  const mockData = {
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
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(mockData)
  };
}; 