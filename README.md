# Weather App

A modern weather application built with HTML, CSS, JavaScript, and Netlify Functions.

## Features

- Real-time weather data
- Beautiful, responsive UI
- Netlify Functions for API calls
- Modern design with smooth animations

## Tech Stack

- HTML5
- CSS3
- JavaScript (ES6+)
- Netlify Functions
- Node.js

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- Netlify CLI (optional, for local development)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/weather-app.git
cd weather-app
```

2. Install dependencies:
```bash
npm install
```

3. Run locally:
```bash
npm run dev
```

## Deployment

This project is configured for automatic deployment on Netlify with GitHub integration.

### Netlify Configuration

- **Build command**: `npm run build`
- **Publish directory**: `.`
- **Functions directory**: `netlify/functions`

## Project Structure

```
├── index.html          # Main HTML file
├── css/               # Stylesheets
├── js/                # JavaScript files
├── netlify/           # Netlify functions
│   └── functions/
├── netlify.toml       # Netlify configuration
└── package.json       # Dependencies and scripts
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.