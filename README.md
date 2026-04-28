# Char Dham Yatra - Web Application

A full-stack web application for booking and managing Char Dham Yatra (pilgrimage) tours. This application provides a complete user authentication system and booking management for the four sacred shrines: Yamunotri, Gangotri, Kedarnath, and Badrinath.

## Features

- 🔐 **User Authentication**: Secure registration and login system with JWT tokens
- 📦 **Tour Packages**: Browse and view detailed information about various Char Dham Yatra packages
- 📅 **Booking System**: Book tours with traveler count and travel date selection
- 💳 **Payments Integration**: Secure simulated checkout flow powered by Razorpay
- 📊 **User Dashboard**: View and manage all your bookings in one place
- 👑 **Admin Dashboard**: Comprehensive management of users, bookings, and tour packages (CRUD)
- 🌤️ **Live Weather**: Real-time weather updates for Char Dham locations via OpenWeather API
- 📧 **Automated Emails**: Confirmation and welcome emails via Nodemailer (Gmail OAuth2/App Passwords)
- ✨ **AI Recommendations**: Personalized package suggestions based on user booking history using Content-Based Filtering
- 📈 **Dynamic Pricing**: Heuristic AI pricing engine that adjusts costs based on peak seasons and demand
- 🤖 **Smart NLP Chatbot**: A zero-budget local chatbot powered by `node-nlp` to understand natural language intents (routes, budget, features)
- 🎨 **Modern UI**: Beautiful, responsive design with smooth animations
- 🔒 **Protected Routes**: Secure access to booking, admin, and dashboard pages

## Tech Stack

### Frontend
- React 19
- React Router DOM
- Axios
- CSS3 (Custom styling)

### Backend
- Node.js & Express.js
- MongoDB (Mongoose)
- JWT (JSON Web Tokens) & bcryptjs (Password hashing)
- Nodemailer & Googleapis (Email delivery)
- Razorpay SDK (Payments)
- node-nlp (Natural Language Processing for Chatbot)
- Socket.io (Real-time updates)

## Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas account)

## Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd char-dham-yatra
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up MongoDB:**
   - Option 1: Install MongoDB locally and ensure it's running on `mongodb://localhost:27017`
   - Option 2: Use MongoDB Atlas (cloud) and update the connection string in `.env`

4. **Configure environment variables:**
   Create a `.env` file in the root directory (already created with default values):
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/char-dham-yatra
   JWT_SECRET=char-dham-yatra-secret-key-2024
   ```

## Running the Application

### Development Mode

You need to run both the backend server and the React frontend:

1. **Start the backend server:**
   ```bash
   npm run server
   ```
   The server will run on `http://localhost:5000`

2. **Start the React development server (in a new terminal):**
   ```bash
   npm start
   ```
   The frontend will run on `http://localhost:3000`

3. **Open your browser:**
   Navigate to `http://localhost:3000` to view the application

## Project Structure

```
char-dham-yatra/
├── server.js                 # Backend Express server
├── src/
│   ├── components/          # React components
│   │   ├── Home.js          # Home page
│   │   ├── Login.js         # Login page
│   │   ├── Register.js      # Registration page
│   │   ├── Packages.js      # Tour packages listing
│   │   ├── Booking.js       # Booking form
│   │   ├── Dashboard.js     # User dashboard
│   │   ├── Navbar.js        # Navigation bar
│   │   ├── AdminDashboard.js# Admin management interface
│   │   ├── Chatbot.js       # NLP Smart Chatbot UI
│   │   ├── Recommendations.js# AI Package suggestions
│   │   ├── Weather.js       # Live weather widget
│   │   └── ProtectedRoute.js # Route protection
│   ├── context/
│   │   └── AuthContext.js   # Authentication context
│   ├── utils/
│   │   └── api.js          # API utility functions
│   ├── App.js              # Main App component
│   └── index.js            # Entry point
├── utils/
│   ├── email.js            # Email transporter utility
│   └── nlpManager.js       # NLP Intent training and processing
├── .env                    # Environment variables
└── package.json            # Dependencies
```

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login user
- `GET /api/user/profile` - Get user profile (protected)

### Packages
- `GET /api/packages` - Get all tour packages
- `GET /api/packages/:id` - Get single package details

### Bookings & Payments
- `POST /api/bookings` - Create a new booking (protected)
- `GET /api/bookings` - Get user's bookings (protected)
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify` - Verify Razorpay payment

### Admin & AI
- `GET/POST/PUT/DELETE /api/admin/*` - Admin package and booking management
- `GET /api/recommendations` - Get AI personalized packages
- `POST /api/chat` - Process NLP chatbot message
- `GET /api/weather` - Proxy OpenWeather API

## Usage

1. **Register/Login**: Create an account or login to access booking features
2. **Browse Packages**: View available Char Dham Yatra packages
3. **Book a Tour**: Select a package, choose travelers and travel date, and confirm booking
4. **View Dashboard**: Check all your bookings and their status

## Default Tour Packages

The application comes with 6 pre-configured tour packages:
1. Complete Char Dham Yatra (12 Days)
2. Kedarnath & Badrinath Special (8 Days)
3. Gangotri & Yamunotri Yatra (6 Days)
4. Badrinath Darshan (4 Days)
5. Kedarnath Helicopter Yatra (2 Days)
6. Char Dham with Valley of Flowers (15 Days)

## Security Features

- Password hashing using bcryptjs
- JWT token-based authentication
- Protected API routes
- Secure password validation
- Token expiration handling

## Future Enhancements

- Production deployment using Docker
- Mobile application using React Native
- Multi-language support for the NLP Chatbot

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod` (for local installation)
- Check MongoDB connection string in `.env`
- Verify MongoDB service is accessible

### Port Already in Use
- Change PORT in `.env` if 5000 is occupied
- Update API_URL in frontend if backend port changes

### CORS Issues
- Backend is configured to allow CORS from `http://localhost:3000`
- Update CORS settings in `server.js` if using different ports

## License

This project is created for educational purposes.

## Support

For issues or questions, please check the code comments or create an issue in the repository.

---

**Note**: Make sure MongoDB is running before starting the server. For production deployment, use environment variables and secure JWT secrets.
