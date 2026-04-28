import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './Weather.css';

/* Add these styles to Weather.css if not already present or inline here for simplicity */
const styles = `
.current-location-btn {
  background-color: #ff9800;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  margin-bottom: 1rem;
  transition: background-color 0.3s;
}

.current-location-btn:hover {
  background-color: #f57c00;
}

.location-controls {
  margin-bottom: 1rem;
  text-align: center;
}
`;
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

const Weather = () => {
  const [weatherData, setWeatherData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const charDhamLocations = [
    {
      name: 'Yamunotri',
      lat: 30.9944,
      lon: 78.4606,
      altitude: '3,293m'
    },
    {
      name: 'Gangotri',
      lat: 30.9944,
      lon: 78.9375,
      altitude: '3,100m'
    },
    {
      name: 'Kedarnath',
      lat: 30.7353,
      lon: 79.0669,
      altitude: '3,583m'
    },
    {
      name: 'Badrinath',
      lat: 30.7448,
      lon: 79.4937,
      altitude: '3,133m'
    }
  ];



  const fetchWeather = async (location) => {
    try {
      setLoading(true);
      setError(null);

      // Use backend proxy to securely fetch weather data
      const response = await api.get(`/weather?lat=${location.lat}&lon=${location.lon}`);

      if (response.status !== 200) {
        throw new Error('Failed to fetch weather data');
      }

      const data = response.data;
      setWeatherData(prev => ({
        ...prev,
        [location.name]: {
          ...data,
          location: location.name,
          altitude: location.altitude
        }
      }));
    } catch (err) {
      setError(`Failed to fetch weather for ${location.name}: ${err.message}`);
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch weather for all locations on component mount
    charDhamLocations.forEach(location => {
      fetchWeather(location);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getWeatherIcon = (weatherMain) => {
    const icons = {
      Clear: '☀️',
      Clouds: '☁️',
      Rain: '🌧️',
      Drizzle: '🌦️',
      Thunderstorm: '⛈️',
      Snow: '❄️',
      Mist: '🌫️',
      Fog: '🌫️'
    };
    return icons[weatherMain] || '🌤️';
  };

  const getWeatherAdvice = (weather) => {
    const main = weather?.weather?.[0]?.main;
    const temp = weather?.main?.temp;

    if (main === 'Snow' || main === 'Rain') {
      return '⚠️ Avoid travel. Weather conditions are not suitable for pilgrimage.';
    }
    if (temp < 5) {
      return '🧥 Very cold. Wear heavy warm clothes and be prepared for snow.';
    }
    if (temp < 15) {
      return '🧥 Cold weather. Wear warm clothes and carry rain protection.';
    }
    if (main === 'Clear' && temp > 15) {
      return '✅ Good weather conditions for travel.';
    }
    return '🌤️ Moderate conditions. Check local updates before traveling.';
  };

  const handleLocationClick = (location) => {
    setSelectedLocation(location);
    if (!weatherData[location.name]) {
      fetchWeather(location);
    }
  };

  return (
    <div className="weather-container">
      <div className="weather-header">
        <h2>Weather Conditions</h2>
        <div className="location-controls">
          <button onClick={() => {
            if (navigator.geolocation) {
              setLoading(true);
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  fetchWeather({
                    name: 'Current Location',
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                    altitude: 'Your Location'
                  });
                },
                (err) => {
                  setLoading(false);
                  setError('Unable to retrieve location: ' + err.message);
                }
              );
            } else {
              setError('Geolocation is not supported by your browser');
            }
          }} className="current-location-btn">
            📍 Get My Location Weather
          </button>
        </div>
      </div>

      {error && (
        <div className="weather-error">{error}</div>
      )}

      <div className="weather-grid">
        {charDhamLocations.map((location) => {
          const weather = weatherData[location.name];
          const isLoading = loading && !weather;

          return (
            <div
              key={location.name}
              className={`weather-card ${selectedLocation?.name === location.name ? 'selected' : ''}`}
              onClick={() => handleLocationClick(location)}
            >
              <div className="weather-card-header">
                <h3>{location.name}</h3>
                <span className="altitude">📍 {location.altitude}</span>
              </div>

              {isLoading ? (
                <div className="weather-loading">
                  <div className="spinner"></div>
                  <p>Loading weather...</p>
                </div>
              ) : weather ? (
                <>
                  <div className="weather-main">
                    <div className="weather-icon">
                      {getWeatherIcon(weather.weather?.[0]?.main)}
                    </div>
                    <div className="weather-temp">
                      {weather.main?.temp ? Math.round(weather.main.temp) : 'N/A'}°C
                    </div>
                    <div className="weather-desc">
                      {weather.weather?.[0]?.description || 'N/A'}
                    </div>
                  </div>

                  <div className="weather-details">
                    <div className="weather-detail-item">
                      <span className="detail-label">Feels Like</span>
                      <span className="detail-value">
                        {weather.main?.feels_like ? Math.round(weather.main.feels_like) : 'N/A'}°C
                      </span>
                    </div>
                    <div className="weather-detail-item">
                      <span className="detail-label">Humidity</span>
                      <span className="detail-value">{weather.main?.humidity || 'N/A'}%</span>
                    </div>
                    <div className="weather-detail-item">
                      <span className="detail-label">Wind Speed</span>
                      <span className="detail-value">
                        {weather.wind?.speed ? `${weather.wind.speed} m/s` : 'N/A'}
                      </span>
                    </div>
                    <div className="weather-detail-item">
                      <span className="detail-label">Pressure</span>
                      <span className="detail-value">
                        {weather.main?.pressure ? `${weather.main.pressure} hPa` : 'N/A'}
                      </span>
                    </div>
                    {weather.visibility && (
                      <div className="weather-detail-item">
                        <span className="detail-label">Visibility</span>
                        <span className="detail-value">
                          {(weather.visibility / 1000).toFixed(1)} km
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="weather-advice">
                    {getWeatherAdvice(weather)}
                  </div>
                </>
              ) : (
                <div className="weather-error-small">
                  Failed to load weather data
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedLocation && weatherData[selectedLocation.name] && (
        <div className="weather-summary">
          <h3>Weather Summary for {selectedLocation.name}</h3>
          <p>
            Current conditions are {weatherData[selectedLocation.name].weather?.[0]?.description || 'moderate'}
            with temperature around {Math.round(weatherData[selectedLocation.name].main?.temp || 0)}°C.
            {getWeatherAdvice(weatherData[selectedLocation.name])}
          </p>
        </div>
      )}
    </div>
  );
};

export default Weather;
