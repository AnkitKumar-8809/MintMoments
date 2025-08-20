import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

// --- Local Strategy (email + password) ---
passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) return done(null, false, { message: "Incorrect email." });

        const isMatch = await bcrypt.compare(password, user.password || "");
        if (!isMatch)
          return done(null, false, { message: "Incorrect password." });

        return done(null, user);
      } catch (err) {
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
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "http://localhost:3001/api/auth/google/callback",
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        // Fallbacks if Google doesn’t return email or displayName
        const email = profile.emails?.[0]?.value || `${profile.id}@google-oauth.com`;
        const displayName = profile.displayName || profile.name?.givenName || "Google User";

        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          // Try existing email first
          user = await User.findOne({ email });
          if (user) {
            user.googleId = profile.id;
            user.displayName = displayName;
            await user.save();
          } else {
            user = await User.create({
              googleId: profile.id,
              email,
              displayName,
              authMethod: "google",
            });
          }
        }
        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

// --- Serialize/Deserialize ---
passport.serializeUser((user, done) => {
  done(null, user.id); // user.id is a Mongoose virtual (string _id)
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});
