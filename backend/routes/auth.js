import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();

// JWT helper
function createToken(user) {
  return jwt.sign({ id: user._id }, process.env.SESSION_SECRET, {
    expiresIn: "1d",
  });
}

// cookie options used everywhere
const cookieOptions = {
  httpOnly: true,
  sameSite: "none",
  secure: process.env.NODE_ENV === "production",
  maxAge: 1000 * 60 * 60 * 24, // 1 day
};

// --- Signup ---
router.post("/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashed,
      name,
      displayName: name,
      authMethod: "email",
    });
    await user.save();

    const token = createToken(user);
    res.cookie("token", token, cookieOptions);
    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        displayName: user.displayName || user.name || "",
        authMethod: user.authMethod,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// --- Login ---
router.post("/login", (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (!user)
      return res
        .status(401)
        .json({ message: info?.message || "Invalid credentials" });

    const token = createToken(user);
    res.cookie("token", token, cookieOptions);
    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        displayName: user.displayName || user.name || "",
        authMethod: user.authMethod,
      },
    });
  })(req, res, next);
});

// --- Logout ---
router.post("/logout", (_req, res) => {
  res.clearCookie("token", { ...cookieOptions, maxAge: 0 });
  res.json({ message: "Logged out" });
});

// --- Google OAuth ---
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/", session: false }),
  (req, res) => {
    const token = createToken(req.user);
    res.cookie("token", token, cookieOptions);

    const frontendUrl =
      process.env.NODE_ENV === "production"
        ? "https://mintmoments.netlify.app/dashboard"
        : "http://localhost:5173/dashboard";

    res.redirect(frontendUrl);
  }
);

// --- Current user (/me) ---
router.get("/me", async (req, res) => {
  try {
    const token = req.cookies?.token; // cookie-parser required
    if (!token) return res.status(401).json({ user: null });

    const decoded = jwt.verify(token, process.env.SESSION_SECRET);
    const user = await User.findById(decoded.id).select(
      "email displayName name authMethod"
    );
    if (!user) return res.status(404).json({ user: null });

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        displayName: user.displayName || user.name || "",
        authMethod: user.authMethod,
      },
    });
  } catch (err) {
    console.error("Error in /me:", err);
    res.status(401).json({ user: null });
  }
});

export default router;
