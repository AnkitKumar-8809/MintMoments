import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

// --- Local Strategy (email + password) ---
passport.use(
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' },
    async (email, password, done) => {
      try {
        console.log('🔄 Local strategy login attempt for:', email);
        
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
          console.log('❌ User not found:', email);
          return done(null, false, { message: 'Incorrect email.' });
        }

        // Check if user signed up with Google
        if (user.authMethod === 'google') {
          console.log('❌ User should use Google login:', email);
          return done(null, false, { message: 'Please sign in with Google instead.' });
        }

        const isMatch = await bcrypt.compare(password, user.password || '');
        if (!isMatch) {
          console.log('❌ Invalid password for:', email);
          return done(null, false, { message: 'Incorrect password.' });
        }

        console.log('✅ Local login successful for:', email);
        return done(null, user);
      } catch (err) {
        console.error('❌ Local strategy error:', err);
        return done(err);
      }
    }
  )
);

// --- Google OAuth Strategy ---
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.NODE_ENV === 'production' 
        ? "https://mintmoments.onrender.com/api/auth/google/callback"
        : (process.env.GOOGLE_CALLBACK_URL || "http://localhost:3001/api/auth/google/callback"),
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('🔄 Google OAuth callback received');
        console.log('Profile ID:', profile.id);
        console.log('Profile Email:', profile.emails?.[0]?.value);
        
        // Extract email and name with fallbacks
        const email = profile.emails?.[0]?.value || `${profile.id}@google-oauth.com`;
        const displayName = profile.displayName || profile.name?.givenName || 'Google User';
        const profilePicture = profile.photos?.[0]?.value;

        // Check if user exists with Google ID
        let user = await User.findOne({ googleId: profile.id });
        
        if (user) {
          console.log('✅ Existing Google user found:', user.email);
          return done(null, user);
        }

        // Check if user exists with same email (different auth method)
        user = await User.findOne({ email: email.toLowerCase() });
        
        if (user) {
          // Link Google account to existing user
          console.log('🔗 Linking Google account to existing user:', email);
          user.googleId = profile.id;
          user.displayName = displayName;
          user.authMethod = 'google';
          user.profilePicture = profilePicture;
          await user.save();
          return done(null, user);
        }

        // Create new user
        console.log('➕ Creating new Google user:', email);
        user = await User.create({
          googleId: profile.id,
          email: email.toLowerCase(),
          name: displayName,
          displayName: displayName,
          profilePicture: profilePicture,
          authMethod: 'google',
        });

        console.log('✅ New Google user created:', user.email);
        return done(null, user);
        
      } catch (err) {
        console.error('❌ Google OAuth strategy error:', err);
        return done(err, false);
      }
    }
  )
);

// --- Serialize/Deserialize ---
passport.serializeUser((user, done) => {
  console.log('🔄 Serializing user:', user._id || user.id);
  done(null, user._id || user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    console.log('🔄 Deserializing user:', id);
    const user = await User.findById(id);
    if (user) {
      console.log('✅ User deserialized:', user.email);
    } else {
      console.log('❌ User not found during deserialization:', id);
    }
    done(null, user);
  } catch (err) {
    console.error('❌ Deserialization error:', err);
    done(err);
  }
});

export default passport;
