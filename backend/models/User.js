import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: String, // for local signup
  googleId: String, // for Google OAuth
  name: String, // user’s full name
  displayName: String, // from Google profile.displayName
  authMethod: { type: String, enum: ['email', 'google'], default: 'email' },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', UserSchema);

export default User;
