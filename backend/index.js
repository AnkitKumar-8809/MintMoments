import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import cors from 'cors';
import bcrypt from 'bcryptjs';

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// User Schema & Model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  displayName: String,
  password: String,
  googleId: String,
  profilePicture: String,
  authMethod: { type: String, enum: ['email', 'google'], default: 'email' },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

// --- ENV and DB Debugging ---
console.log('=== Environment Variables ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Loaded' : 'Missing');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Loaded' : 'Missing');
console.log('SESSION_SECRET:', process.env.SESSION_SECRET ? 'Loaded' : 'Missing');
console.log('Production Mode:', isProduction);

// Trust proxy for production
if (isProduction) app.set('trust proxy', 1);

// --- CORS ---
const allowedOrigins = [
  'http://localhost:5173',
  'https://mintmoments.netlify.app',
  'https://mintmoments.onrender.com'
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.warn('Blocked CORS origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- MongoDB ---
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌ MONGO_URI missing');
  process.exit(1);
}
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => { console.error('❌ MongoDB error:', err); process.exit(1); });

// --- Session ---
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: MONGO_URI, ttl: 24*60*60 }),
  cookie: {
    secure: isProduction,
    httpOnly: true,
    maxAge: 24*60*60*1000,
    sameSite: isProduction ? 'none' : 'lax'
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// --- Google Strategy ---
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: isProduction
    ? "https://mintmoments.onrender.com/api/auth/google/callback"
    : "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('🔄 Google OAuth callback');
    console.log('Profile:', profile);
    let user = await User.findOne({ googleId: profile.id });
    if (user) return done(null, user);
    user = await User.findOne({ email: profile.emails?.[0]?.value });
    if (user) {
      user.googleId = profile.id;
      user.displayName = profile.displayName;
      user.authMethod = 'google';
      user.profilePicture = profile.photos?.[0]?.value;
      await user.save();
      return done(null, user);
    }
    user = new User({
      googleId: profile.id,
      name: profile.displayName,
      displayName: profile.displayName,
      email: profile.emails?.[0]?.value,
      profilePicture: profile.photos?.[0]?.value,
      authMethod: 'google'
    });
    await user.save();
    return done(null, user);
  } catch (error) {
    console.error('❌ Google OAuth strategy error:', error);
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Helper for frontend redirect
const getRedirectUrl = (path) => (
  isProduction
    ? `https://mintmoments.netlify.app${path}`
    : `http://localhost:5173${path}`
);

// --- ROUTES ---
// Health & debug
app.get('/', (req, res) => res.json({ message: 'MintMoments API running' }));
app.get('/health', (req, res) => res.json({ healthy: true, timestamp: new Date() }));
app.get('/api/test', (req, res) => res.json({ status: 'Backend up', time: new Date() }));

// Google OAuth
app.get('/api/auth/google', (req, res, next) => {
  console.log('🔄 Initiating Google OAuth');
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    accessType: 'offline',
    prompt: 'consent'
  })(req, res, next);
});

app.get('/api/auth/google/callback', (req, res, next) => {
  passport.authenticate('google', (err, user, info) => {
    if (err) {
      console.error('❌ OAuth authentication error:', err);
      return res.redirect(getRedirectUrl(`/login?error=oauth_error&details=${encodeURIComponent(err.message || 'Unknown error')}`));
    }
    if (!user) {
      console.error('❌ No user returned from OAuth');
      return res.redirect(getRedirectUrl('/login?error=no_user'));
    }
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error('❌ Login error:', loginErr);
        return res.redirect(getRedirectUrl('/login?error=login_failed'));
      }
      try {
        req.session.user = {
          id: user._id,
          email: user.email,
          name: user.name,
          displayName: user.displayName,
          authMethod: user.authMethod,
          profilePicture: user.profilePicture
        };
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error('❌ Session save error:', saveErr);
            return res.redirect(getRedirectUrl('/login?error=session_save_failed'));
          }
          console.log('✅ Google OAuth success for:', user.email);
          res.redirect(getRedirectUrl('/dashboard?auth=success'));
        });
      } catch (sessionError) {
        console.error('❌ Session creation error:', sessionError);
        res.redirect(getRedirectUrl('/login?error=session_error'));
      }
    });
  })(req, res, next);
});

// Auth status debug
app.get('/api/auth/status', (req, res) => {
  res.json({
    authenticated: !!(req.session?.user || req.user),
    sessionUser: req.session?.user || null,
    passportUser: req.user ? {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name
    } : null,
    sessionId: req.session?.id
  });
});

// Email/Password
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });
    if (password.length < 6) return res.status(400).json({ error: 'Password too short' });
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({
      email: email.toLowerCase(),
      password: hashed,
      name: name || email.split('@')[0],
      authMethod: 'email'
    });
    await user.save();
    req.session.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      authMethod: user.authMethod
    };
    res.json({ user: { email: user.email, name: user.name } });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    if (user.authMethod === 'google') return res.status(400).json({ error: 'Please sign in with Google' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
    req.session.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      authMethod: user.authMethod
    };
    res.json({ user: { email: user.email, name: user.name } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
app.get('/api/auth/me', (req, res) => {
  if (req.session?.user) res.json({ user: req.session.user });
  else res.status(401).json({ error: 'Not authenticated' });
});
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});

// 404 handler (Express 5+ Safe)
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl, method: req.method });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 MintMoments Backend Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${isProduction ? 'production' : 'development'}`);
  console.log(`🔗 Health: ${isProduction ? 'https://mintmoments.onrender.com' : 'http://localhost:' + PORT}/health`);
  console.log(`🔐 Google OAuth: ${isProduction ? 'https://mintmoments.onrender.com' : 'http://localhost:' + PORT}/api/auth/google`);
});
