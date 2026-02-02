import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Packages from './components/Packages';
import Booking from './components/Booking';
import Dashboard from './components/Dashboard';
import Users from './components/Users';
import Map from './components/Map';
import Weather from './components/Weather';
import Chatbot from './components/Chatbot';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  const backgroundStyle = {
    backgroundImage: `url(${process.env.PUBLIC_URL}/images/background-image.jpg)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
    minHeight: '100vh',
    position: 'relative'
  };

  return (
    <AuthProvider>
      <Router>
        <div className="App" style={backgroundStyle}>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/map" element={<Map />} />
            <Route path="/weather" element={<Weather />} />
            <Route
              path="/book/:id"
              element={
                <ProtectedRoute>
                  <Booking />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <Users />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Chatbot />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
