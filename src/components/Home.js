import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Embark on a Sacred Journey</h1>
          <p className="hero-subtitle">
            Experience the divine Char Dham Yatra - A pilgrimage to the four sacred shrines
            of Yamunotri, Gangotri, Kedarnath, and Badrinath
          </p>
          <div className="hero-buttons">
            <Link to="/packages" className="btn-primary">
              Explore Packages
            </Link>
            {!isAuthenticated && (
              <Link to="/register" className="btn-secondary">
                Get Started
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose Char Dham Yatra?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🕉️</div>
              <h3>Sacred Pilgrimage</h3>
              <p>Visit the four most sacred shrines in the Himalayas, each holding immense spiritual significance.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏔️</div>
              <h3>Breathtaking Views</h3>
              <p>Experience the majestic beauty of the Himalayas with stunning mountain vistas and pristine landscapes.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🙏</div>
              <h3>Spiritual Experience</h3>
              <p>Connect with your inner self through meditation, prayers, and the divine energy of these holy places.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✨</div>
              <h3>Well-Planned Tours</h3>
              <p>Enjoy hassle-free travel with our carefully curated packages including accommodation and transportation.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="dhams">
        <div className="container">
          <h2 className="section-title">The Four Sacred Dhams</h2>
          <div className="dhams-grid">
            <div className="dham-card">
              <div className="dham-image">
                <img src="/images/yamunotri-temple.jpg" alt="Yamunotri Temple" />
              </div>
              <h3>Yamunotri</h3>
              <p>The source of the Yamuna River, dedicated to Goddess Yamuna. Located at an altitude of 3,293 meters.</p>
            </div>
            <div className="dham-card">
              <div className="dham-image">
                <img src="/images/gangotri-temple.jpg" alt="Gangotri Temple" />
              </div>
              <h3>Gangotri</h3>
              <p>The origin of the holy Ganges River, dedicated to Goddess Ganga. Situated at 3,100 meters above sea level.</p>
            </div>
            <div className="dham-card">
              <div className="dham-image">
                <img src="/images/kedarnath-temple.jpg" alt="Kedarnath Temple" />
              </div>
              <h3>Kedarnath</h3>
              <p>One of the 12 Jyotirlingas, dedicated to Lord Shiva. Located at 3,583 meters in the Garhwal Himalayas.</p>
            </div>
            <div className="dham-card">
              <div className="dham-image">
                <img src="/images/badrinath-temple.jpg" alt="Badrinath Temple" />
              </div>
              <h3>Badrinath</h3>
              <p>The abode of Lord Vishnu, one of the most important pilgrimage sites. Situated at 3,133 meters.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="section-title">Plan Your Journey</h2>
          <div className="features-grid">
            <Link to="/map" className="feature-card">
              <div className="feature-icon">🗺️</div>
              <h3>Interactive Map</h3>
              <p>Explore the Char Dham locations on an interactive map. Track your location and find the nearest temple.</p>
            </Link>
            <Link to="/weather" className="feature-card">
              <div className="feature-icon">🌤️</div>
              <h3>Weather Conditions</h3>
              <p>Check real-time weather conditions at all four Char Dham locations to plan your visit accordingly.</p>
            </Link>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>AI Assistant</h3>
              <p>Get instant answers to your questions about Char Dham Yatra from our helpful chatbot assistant.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

