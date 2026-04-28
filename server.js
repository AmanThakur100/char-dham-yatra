const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const http = require('http');
const { Server } = require('socket.io');
const { trainNLP, processMessage } = require('./utils/nlpManager');
let Razorpay;
try { Razorpay = require('razorpay'); } catch(e) { console.log('Razorpay SDK not available, payment simulation mode'); }
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/char-dham-yatra';
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('MongoDB Connected successfully');
    await seedPackages();
    await trainNLP();
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err.message);
    console.error('Please ensure MongoDB is running and accessible at:', MONGODB_URI);
  });

// ============ SCHEMAS ============

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  address: { type: String, default: '' },
  bio: { type: String, default: '' },
  isAdmin: { type: Boolean, default: false },
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
  status: { type: String, default: 'confirmed', enum: ['confirmed', 'cancelled', 'pending_payment', 'completed'] },
  paymentId: { type: String, default: '' },
  paymentOrderId: { type: String, default: '' },
  paymentStatus: { type: String, default: 'paid', enum: ['pending', 'paid', 'refunded'] },
  cancellationReason: { type: String, default: '' },
  cancelledAt: { type: Date }
});
const Booking = mongoose.model('Booking', bookingSchema);

// Review Schema
const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  packageId: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
reviewSchema.index({ userId: 1, packageId: 1 }, { unique: true });
const Review = mongoose.model('Review', reviewSchema);

// Package Schema (stored in MongoDB for admin management)
const packageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  duration: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  highlights: [{ type: String }],
  image: { type: String, default: '/images/char-dham.jpg' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
const Package = mongoose.model('Package', packageSchema);

// ============ SEED DEFAULT PACKAGES ============

const seedPackages = async () => {
  const count = await Package.countDocuments();
  if (count === 0) {
    const defaults = [
      { name: 'Complete Char Dham Yatra', duration: '12 Days', price: 45000, description: 'Complete pilgrimage to all four sacred shrines: Yamunotri, Gangotri, Kedarnath, and Badrinath', highlights: ['Yamunotri Temple', 'Gangotri Temple', 'Kedarnath Temple', 'Badrinath Temple', 'Hot Springs', 'Scenic Views'], image: '/images/char-dham.jpg' },
      { name: 'Kedarnath & Badrinath Special', duration: '8 Days', price: 32000, description: 'Visit the two most important shrines of Char Dham - Kedarnath and Badrinath', highlights: ['Kedarnath Temple', 'Badrinath Temple', 'Mana Village', 'Valley of Flowers'], image: '/images/kedarnath-temple.jpg' },
      { name: 'Gangotri & Yamunotri Yatra', duration: '6 Days', price: 25000, description: 'Sacred journey to the source of Ganga and Yamuna rivers', highlights: ['Gangotri Temple', 'Yamunotri Temple', 'Gaumukh Glacier', 'Hot Springs'], image: '/images/gangotri-temple.jpg' },
      { name: 'Badrinath Darshan', duration: '4 Days', price: 18000, description: 'Quick pilgrimage to Badrinath, the abode of Lord Vishnu', highlights: ['Badrinath Temple', 'Mana Village', 'Vasudhara Falls', 'Tapt Kund'], image: '/images/badrinath-temple.jpg' },
      { name: 'Kedarnath Helicopter Yatra', duration: '2 Days', price: 35000, description: 'Quick and comfortable helicopter journey to Kedarnath', highlights: ['Helicopter Ride', 'Kedarnath Temple', 'Bhairon Temple', 'Scenic Aerial Views'], image: '/images/kedarnath-temple.jpg' },
      { name: 'Char Dham with Valley of Flowers', duration: '15 Days', price: 55000, description: 'Extended journey including the beautiful Valley of Flowers', highlights: ['All Four Dhams', 'Valley of Flowers', 'Hemkund Sahib', 'Auli'], image: '/images/valley-of-flowers.jpg' }
    ];
    await Package.insertMany(defaults);
    console.log('Default packages seeded');
  }
};

// ============ EMAIL UTILITY (Gmail OAuth2 + App Password fallback) ============

const createTransporter = async () => {
  // Method 1: Try Google OAuth2
  if (process.env.EMAIL_USER && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN) {
    try {
      const oAuth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'https://developers.google.com/oauthplayground'
      );
      oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
      const accessToken = await oAuth2Client.getAccessToken();

      if (accessToken && accessToken.token) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            type: 'OAuth2',
            user: process.env.EMAIL_USER,
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
            accessToken: accessToken.token
          }
        });
        // Verify the transporter works
        await transporter.verify();
        console.log('[EMAIL] OAuth2 transporter ready');
        return transporter;
      }
    } catch (err) {
      console.error('[EMAIL] OAuth2 failed:', err.message);
      console.log('[EMAIL] Trying App Password fallback...');
    }
  }

  // Method 2: Fallback to Gmail App Password / SMTP
  if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_APP_PASSWORD
        }
      });
      await transporter.verify();
      console.log('[EMAIL] App Password transporter ready');
      return transporter;
    } catch (err) {
      console.error('[EMAIL] App Password failed:', err.message);
    }
  }

  // Method 3: Direct SMTP (for other providers)
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      });
      await transporter.verify();
      console.log('[EMAIL] SMTP transporter ready');
      return transporter;
    } catch (err) {
      console.error('[EMAIL] SMTP failed:', err.message);
    }
  }

  console.log('[EMAIL] No email provider configured — emails will be logged to console');
  return null;
};

const sendEmail = async (to, subject, html) => {
  const transporter = await createTransporter();
  if (!transporter) {
    console.log(`[EMAIL LOG] To: ${to} | Subject: ${subject}`);
    console.log(`[EMAIL LOG] Body preview: ${html.substring(0, 200)}...`);
    return { simulated: true };
  }
  try {
    await transporter.sendMail({
      from: `Char Dham Yatra <${process.env.EMAIL_USER}>`,
      to, subject, html
    });
    console.log(`[EMAIL SENT] To: ${to} | Subject: ${subject}`);
    return { sent: true };
  } catch (err) {
    console.error('Email send error:', err.message);
    console.log(`[EMAIL LOG - FALLBACK] To: ${to} | Subject: ${subject}`);
    return { error: err.message };
  }
};

const emailTemplates = {
  welcome: (name) => ({
    subject: '🕉️ Welcome to Char Dham Yatra!',
    html: `<div style="font-family:Arial;max-width:600px;margin:0 auto;padding:20px;background:#f8f9fa;border-radius:10px"><h1 style="color:#667eea">Welcome, ${name}!</h1><p>Thank you for joining Char Dham Yatra. Start your spiritual journey today by exploring our pilgrimage packages.</p><a href="http://localhost:3000/packages" style="display:inline-block;padding:12px 30px;background:linear-gradient(135deg,#667eea,#764ba2);color:white;border-radius:8px;text-decoration:none;font-weight:600">Explore Packages</a></div>`
  }),
  bookingConfirmed: (name, booking) => ({
    subject: '✅ Booking Confirmed - Char Dham Yatra',
    html: `<div style="font-family:Arial;max-width:600px;margin:0 auto;padding:20px;background:#f8f9fa;border-radius:10px"><h1 style="color:#667eea">Booking Confirmed!</h1><p>Dear ${name},</p><p>Your booking has been confirmed.</p><table style="width:100%;border-collapse:collapse"><tr><td style="padding:8px;border-bottom:1px solid #ddd"><strong>Package:</strong></td><td style="padding:8px;border-bottom:1px solid #ddd">${booking.packageName}</td></tr><tr><td style="padding:8px;border-bottom:1px solid #ddd"><strong>Travelers:</strong></td><td style="padding:8px;border-bottom:1px solid #ddd">${booking.travelers}</td></tr><tr><td style="padding:8px;border-bottom:1px solid #ddd"><strong>Travel Date:</strong></td><td style="padding:8px;border-bottom:1px solid #ddd">${new Date(booking.travelDate).toLocaleDateString()}</td></tr><tr><td style="padding:8px"><strong>Total:</strong></td><td style="padding:8px;color:#667eea;font-weight:bold">₹${booking.totalPrice.toLocaleString()}</td></tr></table><p>Booking ID: ${booking._id}</p></div>`
  }),
  bookingCancelled: (name, booking) => ({
    subject: '❌ Booking Cancelled - Char Dham Yatra',
    html: `<div style="font-family:Arial;max-width:600px;margin:0 auto;padding:20px;background:#f8f9fa;border-radius:10px"><h1 style="color:#dc3545">Booking Cancelled</h1><p>Dear ${name},</p><p>Your booking for <strong>${booking.packageName}</strong> has been cancelled.</p><p><strong>Reason:</strong> ${booking.cancellationReason || 'Not specified'}</p><p>If payment was made, a refund will be processed.</p></div>`
  })
};

// ============ RAZORPAY SETUP ============

let razorpayInstance = null;
if (Razorpay && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== 'rzp_test_placeholder') {
  try {
    razorpayInstance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
  } catch(e) { console.log('Razorpay init failed, using simulation mode'); }
}

// ============ MIDDLEWARE ============

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access token required' });
  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || !user.isAdmin) return res.status(403).json({ message: 'Admin access required' });
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ============ AUTH ROUTES ============

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, and password are required' });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists with this email' });

    const hashedPassword = await bcrypt.hash(password, 10);
    // First user becomes admin
    const userCount = await User.countDocuments();
    const user = new User({ name, email, password: hashedPassword, phone, isAdmin: userCount === 0 });
    await user.save();

    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });

    // Send welcome email
    const template = emailTemplates.welcome(name);
    sendEmail(email, template.subject, template.html);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, isAdmin: user.isAdmin, address: user.address, bio: user.bio }
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.name === 'MongoServerError' || error.name === 'MongoNetworkError') {
      return res.status(500).json({ message: 'Database connection error. Please check if MongoDB is running.', error: error.message });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error: ' + Object.values(error.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ message: error.message || 'Server error', error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
    res.json({
      message: 'Login successful', token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, isAdmin: user.isAdmin, address: user.address, bio: user.bio }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ USER PROFILE ROUTES ============

app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, address, bio } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;
    if (bio !== undefined) updates.bio = bio;

    const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/user/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Both current and new password required' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters' });

    const user = await User.findById(req.user.userId);
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) return res.status(400).json({ message: 'Current password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ CHATBOT ROUTE ============
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ reply: "Please send a message." });
    
    const reply = await processMessage(message);
    res.json({ reply });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ reply: "Sorry, my brain is offline right now. Try again later!" });
  }
});

// ============ AI/ML ENGINES ============

// 1. Dynamic Pricing Engine (Heuristic/Simulated ML model)
const calculateDynamicPrice = (basePrice) => {
  const currentMonth = new Date().getMonth(); // 0-11
  let multiplier = 1.0;
  
  // Peak seasons for Char Dham: April(3), May(4), June(5), Sept(8), Oct(9)
  if ([3, 4, 5, 8, 9].includes(currentMonth)) {
    multiplier += 0.15; // 15% surge
  } else if ([6, 7].includes(currentMonth)) {
    multiplier -= 0.10; // 10% discount in monsoon
  } else if ([11, 0, 1, 2].includes(currentMonth)) {
    multiplier -= 0.20; // 20% discount in winter
  }
  
  return Math.round(basePrice * multiplier);
};

// 2. Content-Based Recommendation Engine
const getRecommendations = async (userId, allPackages) => {
  // Fallback to most popular if no user data
  const getPopular = () => [...allPackages].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 3);
  if (!userId) return getPopular();

  const user = await User.findById(userId).populate('bookings');
  if (!user || !user.bookings || user.bookings.length === 0) return getPopular();

  const bookedPackageIds = user.bookings.map(b => b.packageId.toString());
  const unbookedPackages = allPackages.filter(p => !bookedPackageIds.includes(p.id));
  if (unbookedPackages.length === 0) return getPopular();

  const bookedPackagesDetails = allPackages.filter(p => bookedPackageIds.includes(p.id));
  
  unbookedPackages.forEach(unbooked => {
    unbooked.similarityScore = 0;
    bookedPackagesDetails.forEach(booked => {
      // Feature 1: Price similarity
      const priceDiff = Math.abs(unbooked.price - booked.price);
      const priceScore = Math.max(0, 1 - (priceDiff / Math.max(unbooked.price, booked.price)));
      
      // Feature 2: Highlights similarity (Jaccard Index)
      const unbookedHighlights = new Set(unbooked.highlights.map(h => h.toLowerCase()));
      const bookedHighlights = new Set(booked.highlights.map(h => h.toLowerCase()));
      const intersection = new Set([...unbookedHighlights].filter(x => bookedHighlights.has(x)));
      const union = new Set([...unbookedHighlights, ...bookedHighlights]);
      const jaccardScore = union.size === 0 ? 0 : intersection.size / union.size;

      unbooked.similarityScore += (priceScore * 0.4) + (jaccardScore * 0.6);
    });
  });

  return unbookedPackages.sort((a, b) => b.similarityScore - a.similarityScore).slice(0, 3);
};

// ============ PACKAGE ROUTES ============

app.get('/api/packages', async (req, res) => {
  try {
    const packages = await Package.find({ isActive: true }).sort({ createdAt: 1 });
    const ratings = await Review.aggregate([
      { $group: { _id: '$packageId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    const ratingMap = {};
    ratings.forEach(r => { ratingMap[r._id] = { avgRating: Math.round(r.avgRating * 10) / 10, reviewCount: r.count }; });
    const packagesWithRatings = packages.map(p => ({
      id: p._id.toString(),
      name: p.name,
      duration: p.duration,
      price: p.price,
      description: p.description,
      highlights: p.highlights,
      image: p.image,
      avgRating: ratingMap[p._id.toString()]?.avgRating || 0,
      reviewCount: ratingMap[p._id.toString()]?.reviewCount || 0,
      dynamicPrice: calculateDynamicPrice(p.price)
    }));
    res.json(packagesWithRatings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET Personalized Recommendations
app.get('/api/recommendations', authenticateToken, async (req, res) => {
  try {
    const packages = await Package.find({ isActive: true });
    const ratings = await Review.aggregate([{ $group: { _id: '$packageId', count: { $sum: 1 } } }]);
    const ratingMap = {};
    ratings.forEach(r => { ratingMap[r._id] = r.count; });
    
    const formattedPackages = packages.map(p => ({
      id: p._id.toString(),
      name: p.name,
      duration: p.duration,
      price: p.price,
      dynamicPrice: calculateDynamicPrice(p.price),
      description: p.description,
      highlights: p.highlights,
      image: p.image,
      reviewCount: ratingMap[p._id.toString()] || 0
    }));

    const recommendations = await getRecommendations(req.user.userId, formattedPackages);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/packages/:id', async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    const agg = await Review.aggregate([
      { $match: { packageId: req.params.id } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    res.json({
      id: pkg._id.toString(),
      name: pkg.name,
      duration: pkg.duration,
      price: pkg.price,
      description: pkg.description,
      highlights: pkg.highlights,
      image: pkg.image,
      avgRating: agg[0]?.avgRating || 0,
      reviewCount: agg[0]?.count || 0,
      dynamicPrice: calculateDynamicPrice(pkg.price)
    });
  } catch (e) {
    res.status(500).json({ message: 'Package not found' });
  }
});

// ============ BOOKING ROUTES ============

app.post('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const { packageId, packageName, travelers, totalPrice, travelDate } = req.body;
    const booking = new Booking({
      userId: req.user.userId, packageId, packageName, travelers, totalPrice,
      travelDate: new Date(travelDate), status: 'confirmed', paymentStatus: 'paid'
    });
    await booking.save();
    await User.findByIdAndUpdate(req.user.userId, { $push: { bookings: booking._id } });

    // Send email
    const user = await User.findById(req.user.userId);
    if (user) {
      const template = emailTemplates.bookingConfirmed(user.name, booking);
      sendEmail(user.email, template.subject, template.html);
    }

    // Socket.IO broadcast
    io.emit('booking-created', { bookingId: booking._id, packageName, userId: req.user.userId });

    res.status(201).json({ message: 'Booking confirmed successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.userId }).sort({ bookingDate: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/bookings/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status === 'cancelled') return res.status(400).json({ message: 'Booking is already cancelled' });

    booking.status = 'cancelled';
    booking.paymentStatus = booking.paymentStatus === 'paid' ? 'refunded' : booking.paymentStatus;
    booking.cancellationReason = reason || 'No reason provided';
    booking.cancelledAt = new Date();
    await booking.save();

    // Send email
    const user = await User.findById(req.user.userId);
    if (user) {
      const template = emailTemplates.bookingCancelled(user.name, booking);
      sendEmail(user.email, template.subject, template.html);
    }

    io.emit('booking-cancelled', { bookingId: booking._id, userId: req.user.userId });
    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ PAYMENT ROUTES ============

app.post('/api/payment/create-order', authenticateToken, async (req, res) => {
  try {
    const { amount, bookingDetails } = req.body;
    if (razorpayInstance) {
      const order = await razorpayInstance.orders.create({
        amount: amount * 100, currency: 'INR',
        receipt: `booking_${Date.now()}`, notes: { packageName: bookingDetails.packageName }
      });
      return res.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: process.env.RAZORPAY_KEY_ID });
    }
    // Simulation mode
    const simulatedOrderId = `sim_order_${Date.now()}`;
    res.json({ orderId: simulatedOrderId, amount: amount * 100, currency: 'INR', keyId: 'rzp_test_simulated', simulated: true });
  } catch (error) {
    res.status(500).json({ message: 'Payment order creation failed', error: error.message });
  }
});

app.post('/api/payment/verify', authenticateToken, async (req, res) => {
  try {
    const { orderId, paymentId, signature, bookingId, simulated } = req.body;
    if (!simulated && razorpayInstance) {
      const body = orderId + '|' + paymentId;
      const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');
      if (expectedSignature !== signature) return res.status(400).json({ message: 'Payment verification failed' });
    }
    if (bookingId) {
      await Booking.findByIdAndUpdate(bookingId, { paymentId: paymentId || `sim_pay_${Date.now()}`, paymentOrderId: orderId, paymentStatus: 'paid', status: 'confirmed' });
    }
    res.json({ message: 'Payment verified successfully', verified: true });
  } catch (error) {
    res.status(500).json({ message: 'Payment verification failed', error: error.message });
  }
});

// ============ REVIEW ROUTES ============

app.post('/api/reviews', authenticateToken, async (req, res) => {
  try {
    const { packageId, rating, title, comment } = req.body;
    if (!packageId || !rating || !title || !comment) return res.status(400).json({ message: 'All fields are required' });
    if (rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be between 1 and 5' });

    const existing = await Review.findOne({ userId: req.user.userId, packageId });
    if (existing) return res.status(400).json({ message: 'You have already reviewed this package' });

    const review = new Review({ userId: req.user.userId, packageId, rating, title, comment });
    await review.save();
    const populated = await Review.findById(review._id).populate('userId', 'name');
    res.status(201).json({ message: 'Review submitted successfully', review: populated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/reviews/:packageId', async (req, res) => {
  try {
    const reviews = await Review.find({ packageId: req.params.packageId }).populate('userId', 'name').sort({ createdAt: -1 });
    const agg = await Review.aggregate([
      { $match: { packageId: req.params.packageId } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    res.json({ reviews, avgRating: agg[0]?.avgRating || 0, totalReviews: agg[0]?.count || 0 });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ ADMIN ROUTES ============

app.get('/api/admin/stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const todayBookings = await Booking.countDocuments({ bookingDate: { $gte: todayStart } });
    const revenueAgg = await Booking.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;
    const totalReviews = await Review.countDocuments();
    res.json({ totalUsers, totalBookings, confirmedBookings, cancelledBookings, todayBookings, totalRevenue, totalReviews });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/admin/bookings', authenticateToken, isAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find().populate('userId', 'name email phone').sort({ bookingDate: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/admin/bookings/:id/status', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    io.emit('booking-updated', { bookingId: booking._id, status });
    res.json({ message: 'Booking status updated', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/admin/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).populate('bookings', 'packageName totalPrice travelDate status');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin Package Management
app.get('/api/admin/packages', authenticateToken, isAdmin, async (req, res) => {
  try {
    const packages = await Package.find().sort({ createdAt: -1 });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/admin/packages', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, duration, price, description, highlights, image } = req.body;
    if (!name || !duration || !price || !description) {
      return res.status(400).json({ message: 'Name, duration, price, and description are required' });
    }
    const pkg = new Package({
      name, duration, price: Number(price), description,
      highlights: highlights || [],
      image: image || '/images/char-dham.jpg'
    });
    await pkg.save();
    res.status(201).json({ message: 'Package created successfully', package: pkg });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/admin/packages/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, duration, price, description, highlights, image, isActive } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (duration) updates.duration = duration;
    if (price) updates.price = Number(price);
    if (description) updates.description = description;
    if (highlights) updates.highlights = highlights;
    if (image) updates.image = image;
    if (isActive !== undefined) updates.isActive = isActive;
    const pkg = await Package.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    res.json({ message: 'Package updated successfully', package: pkg });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/api/admin/packages/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const pkg = await Package.findByIdAndDelete(req.params.id);
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    res.json({ message: 'Package deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Keep old /api/users endpoint for backward compatibility
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).populate('bookings', 'packageName totalPrice travelDate status');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ status: 'Server is running', database: dbStatus, mongodbConnected: mongoose.connection.readyState === 1 });
});

// ============ WEATHER API PROXY ============

app.get('/api/weather', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ message: 'lat and lon are required' });

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      // Return mock data if no API key
      return res.json({
        simulated: true,
        main: {
          temp: Math.round(Math.random() * 15 + 5),
          feels_like: Math.round(Math.random() * 15 + 3),
          humidity: Math.round(Math.random() * 40 + 40),
          pressure: Math.round(Math.random() * 100 + 950)
        },
        weather: [{ main: ['Clear', 'Clouds', 'Rain', 'Snow'][Math.floor(Math.random() * 4)], description: 'partly cloudy', icon: '02d' }],
        wind: { speed: parseFloat((Math.random() * 10 + 5).toFixed(1)) },
        visibility: Math.round(Math.random() * 5000 + 5000)
      });
    }

    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
    if (!response.ok) throw new Error('OpenWeather API error');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Weather API error:', error.message);
    res.status(500).json({ message: 'Failed to fetch weather data', error: error.message });
  }
});

// ============ SOCKET.IO ============

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

// Use server.listen instead of app.listen for Socket.IO
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
