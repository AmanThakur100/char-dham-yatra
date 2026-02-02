const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/char-dham-yatra';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB Connected successfully'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err.message);
    console.error('Please ensure MongoDB is running and accessible at:', MONGODB_URI);
  });

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Booking Schema
const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  packageId: { type: String, required: true },
  packageName: { type: String, required: true },
  travelers: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  bookingDate: { type: Date, default: Date.now },
  travelDate: { type: Date, required: true },
  status: { type: String, default: 'confirmed' }
});

const Booking = mongoose.model('Booking', bookingSchema);

// Tour Packages Data
const tourPackages = [
  {
    id: '1',
    name: 'Complete Char Dham Yatra',
    duration: '12 Days',
    price: 45000,
    description: 'Complete pilgrimage to all four sacred shrines: Yamunotri, Gangotri, Kedarnath, and Badrinath',
    highlights: ['Yamunotri Temple', 'Gangotri Temple', 'Kedarnath Temple', 'Badrinath Temple', 'Hot Springs', 'Scenic Views'],
    image: '/images/char-dham.jpg'
  },
  {
    id: '2',
    name: 'Kedarnath & Badrinath Special',
    duration: '8 Days',
    price: 32000,
    description: 'Visit the two most important shrines of Char Dham - Kedarnath and Badrinath',
    highlights: ['Kedarnath Temple', 'Badrinath Temple', 'Mana Village', 'Valley of Flowers'],
    image: '/images/kedarnath-temple.jpg'
  },
  {
    id: '3',
    name: 'Gangotri & Yamunotri Yatra',
    duration: '6 Days',
    price: 25000,
    description: 'Sacred journey to the source of Ganga and Yamuna rivers',
    highlights: ['Gangotri Temple', 'Yamunotri Temple', 'Gaumukh Glacier', 'Hot Springs'],
    image: '/images/gangotri-temple.jpg'
  },
  {
    id: '4',
    name: 'Badrinath Darshan',
    duration: '4 Days',
    price: 18000,
    description: 'Quick pilgrimage to Badrinath, the abode of Lord Vishnu',
    highlights: ['Badrinath Temple', 'Mana Village', 'Vasudhara Falls', 'Tapt Kund'],
    image: '/images/badrinath-temple.jpg'
  },
  {
    id: '5',
    name: 'Kedarnath Helicopter Yatra',
    duration: '2 Days',
    price: 35000,
    description: 'Quick and comfortable helicopter journey to Kedarnath',
    highlights: ['Helicopter Ride', 'Kedarnath Temple', 'Bhairon Temple', 'Scenic Aerial Views'],
    image: '/images/kedarnath-temple.jpg'
  },
  {
    id: '6',
    name: 'Char Dham with Valley of Flowers',
    duration: '15 Days',
    price: 55000,
    description: 'Extended journey including the beautiful Valley of Flowers',
    highlights: ['All Four Dhams', 'Valley of Flowers', 'Hemkund Sahib', 'Auli'],
    image: '/images/valley-of-flowers.jpg'
  }
];

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Register
app.post('/api/register', async (req, res) => {
  try {
    // Check MongoDB connection
    // Check MongoDB connection - removed strict check to allow request to proceed if technically connected but state not fully updated
    // if (mongoose.connection.readyState !== 1) { ... }

    const { name, email, password, phone } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Registration error detail:', error);
    console.error('Stack:', error.stack);

    // Handle MongoDB connection errors
    if (error.name === 'MongoServerError' || error.name === 'MongoNetworkError') {
      return res.status(500).json({
        message: 'Database connection error. Please check if MongoDB is running.',
        error: error.message
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error: ' + Object.values(error.errors).map(e => e.message).join(', '),
        error: error.message
      });
    }

    // Generic error
    res.status(500).json({
      message: error.message || 'Server error occurred. Please try again later.',
      error: error.message
    });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all tour packages
app.get('/api/packages', (req, res) => {
  res.json(tourPackages);
});

// Get single package
app.get('/api/packages/:id', (req, res) => {
  const package = tourPackages.find(p => p.id === req.params.id);
  if (!package) {
    return res.status(404).json({ message: 'Package not found' });
  }
  res.json(package);
});

// Create booking
app.post('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const { packageId, packageName, travelers, totalPrice, travelDate } = req.body;

    const booking = new Booking({
      userId: req.user.userId,
      packageId,
      packageName,
      travelers,
      totalPrice,
      travelDate: new Date(travelDate)
    });

    await booking.save();

    // Add booking to user
    await User.findByIdAndUpdate(req.user.userId, {
      $push: { bookings: booking._id }
    });

    res.status(201).json({
      message: 'Booking confirmed successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user bookings
app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.userId })
      .sort({ bookingDate: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all users (Admin endpoint)
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .populate('bookings', 'packageName totalPrice travelDate status');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'Server is running',
    database: dbStatus,
    mongodbConnected: mongoose.connection.readyState === 1
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

