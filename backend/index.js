import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import cors from 'cors';
import bcrypt from 'bcryptjs';

const app = express();

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  password: String,
  googleId: String,
  profilePicture: String,
  authMethod: { type: String, enum: ['email', 'google'], default: 'email' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Debug environment variables
console.log('=== Environment Variables ===');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Loaded' : 'Missing');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Loaded' : 'Missing');
console.log('SESSION_SECRET:', process.env.SESSION_SECRET ? 'Loaded' : 'Missing');

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://1234ankit88:kc3MgdiAMuYS3lba@mint.3camxte.mongodb.net/ps3-tickets?retryWrites=true&w=majority&appName=mint";

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Passport Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    
    if (user) {
      return done(null, user);
    }
    
    user = await User.findOne({ email: profile.emails[0].value });
    
    if (user) {
      user.googleId = profile.id;
      user.authMethod = 'google';
      await user.save();
      return done(null, user);
    }
    
    user = new User({
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails?.[0]?.value, // ✅ safe
      authMethod: 'google'
    });
    
    await user.save();
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Routes
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend server is working!',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/api/auth/google/callback',
  passport.authenticate('google', { 
    failureRedirect: 'http://localhost:5173/login' 
  }),
  (req, res) => {
    req.session.user = {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      authMethod: req.user.authMethod
    };
    res.redirect('http://localhost:5173/dashboard');
  }
);

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = new User({
      email,
      password: hashedPassword,
      name,
      authMethod: 'email'
    });
    
    await user.save();
    
    req.session.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      authMethod: user.authMethod
    };
    
    res.json({ 
      user: { 
        email: user.email, 
        name: user.name,
        authMethod: user.authMethod
      } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    if (user.authMethod === 'google') {
      return res.status(400).json({ error: 'Please sign in with Google' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    req.session.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      authMethod: user.authMethod
    };
    
    res.json({ 
      user: { 
        email: user.email, 
        name: user.name,
        authMethod: user.authMethod
      } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/auth/me', (req, res) => {
  if (req.session.user || req.user) {
    const user = req.session.user || {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      authMethod: req.user.authMethod
    };
    res.json({ user });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Test: http://localhost:${PORT}/api/test`);
});
