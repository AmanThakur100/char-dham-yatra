import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for Char Dham locations
const templeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom icon for user location
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to update map view when user location changes
function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  return null;
}

const Map = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);

  // Char Dham locations
  const charDhamLocations = [
    {
      name: 'Yamunotri',
      position: [30.9944, 78.4606],
      description: 'Source of Yamuna River, Altitude: 3,293 meters'
    },
    {
      name: 'Gangotri',
      position: [30.9944, 78.9375],
      description: 'Origin of Ganges River, Altitude: 3,100 meters'
    },
    {
      name: 'Kedarnath',
      position: [30.7353, 79.0669],
      description: 'One of 12 Jyotirlingas, Altitude: 3,583 meters'
    },
    {
      name: 'Badrinath',
      position: [30.7448, 79.4937],
      description: 'Abode of Lord Vishnu, Altitude: 3,133 meters'
    }
  ];

  const defaultCenter = [30.8, 79.0]; // Center of Char Dham region
  const defaultZoom = 8;

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsTracking(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        setIsTracking(false);
      },
      (error) => {
        setLocationError('Unable to retrieve your location. Please enable location services.');
        setIsTracking(false);
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsTracking(true);
    setLocationError(null);

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
      },
      (error) => {
        setLocationError('Unable to track your location');
        setIsTracking(false);
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    // Store watchId to stop tracking later
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  };

  const stopTracking = () => {
    setIsTracking(false);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getNearestTemple = () => {
    if (!userLocation) return null;

    let nearest = null;
    let minDistance = Infinity;

    charDhamLocations.forEach(temple => {
      const distance = calculateDistance(
        userLocation[0],
        userLocation[1],
        temple.position[0],
        temple.position[1]
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearest = { ...temple, distance: distance.toFixed(2) };
      }
    });

    return nearest;
  };

  const nearestTemple = getNearestTemple();

  return (
    <div className="map-container">
      <div className="map-header">
        <h2>Char Dham Map & Location Tracker</h2>
        <div className="map-controls">
          <button onClick={getCurrentLocation} className="location-btn" disabled={isTracking}>
            {isTracking ? 'Locating...' : '📍 Get My Location'}
          </button>
          {userLocation && (
            <>
              <button onClick={isTracking ? stopTracking : startTracking} className="track-btn">
                {isTracking ? '⏸️ Stop Tracking' : '▶️ Start Tracking'}
              </button>
              <button onClick={() => setUserLocation(null)} className="clear-btn">
                Clear Location
              </button>
            </>
          )}
        </div>
      </div>

      {locationError && (
        <div className="location-error">{locationError}</div>
      )}

      {userLocation && nearestTemple && (
        <div className="nearest-temple-info">
          <h3>📍 Nearest Temple: {nearestTemple.name}</h3>
          <p>{nearestTemple.description}</p>
          <p><strong>Distance:</strong> {nearestTemple.distance} km</p>
        </div>
      )}

      <div className="map-wrapper">
        <MapContainer
          center={userLocation || defaultCenter}
          zoom={userLocation ? 10 : defaultZoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <MapUpdater center={userLocation || defaultCenter} zoom={userLocation ? 10 : defaultZoom} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Char Dham locations */}
          {charDhamLocations.map((location, index) => (
            <Marker key={index} position={location.position} icon={templeIcon}>
              <Popup>
                <div className="popup-content">
                  <h3>{location.name}</h3>
                  <p>{location.description}</p>
                  {userLocation && (
                    <p>
                      Distance: {calculateDistance(
                        userLocation[0],
                        userLocation[1],
                        location.position[0],
                        location.position[1]
                      ).toFixed(2)} km
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* User location */}
          {userLocation && (
            <Marker position={userLocation} icon={userIcon}>
              <Popup>
                <div className="popup-content">
                  <h3>Your Location</h3>
                  <p>Latitude: {userLocation[0].toFixed(4)}</p>
                  <p>Longitude: {userLocation[1].toFixed(4)}</p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-marker red">📍</span>
          <span>Char Dham Temples</span>
        </div>
        {userLocation && (
          <div className="legend-item">
            <span className="legend-marker blue">📍</span>
            <span>Your Location</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Map;
