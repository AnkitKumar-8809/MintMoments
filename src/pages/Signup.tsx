import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Ticket } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa'; // Import Google icon from react-icons

const quotes = [
  {
    text: 'Innovation starts with a single ticket.',
    img: 'https://cometogether.network/wp-content/uploads/2022/12/1-7.png',
  },
  {
    text: 'Build for impact.',
    img: 'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*g37CYwOky7vRU9Es9uOrdg.jpeg',
  },
  {
    text: 'Set up your digital wallet',
    img: 'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*hzfQBtJCaVDEJzp959rdnA.jpeg',
  },
];

export function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password);
      navigate('/dashboard');
    } catch {
      setError('Failed to create an account. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      navigate('/dashboard');
    } catch {
      setError('Failed to sign in with Google.');
    } finally {
      setLoading(false);
    }
  }

  // Color constants
  const mintGreen = '#98FF98'; // Mint green for "Welcome Back"
  const paleSpringBud = '#b6f1c4'; // Pale spring bud for placeholder text and icons

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4 py-8"
      style={{
        backgroundImage:
          "url('https://media.istockphoto.com/id/1376238514/vector/vector-illustrarion-green-technology-cyber-background.jpg?s=612x612&w=0&k=20&c=zxVu6xqskbL23VTMvv_L0-SC5vdvlTVpqN_OSLtcwWg=')",
      }}
    >
      <div className="max-w-6xl w-full bg-white/5 backdrop-blur-md rounded-3xl shadow-xl flex overflow-hidden">
        {/* Left Image + Quote */}
        <div
          className="w-1/2 relative overflow-hidden rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none"
          style={{ minHeight: '480px' }}
        >
          <img
            src={quotes[quoteIndex].img}
            alt="Signup theme"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center p-8 text-white">
            <p
              className="text-lg font-semibold text-center max-w-xs md:max-w-md italic"
              style={{
                fontStyle: 'italic',
                fontSize: '1.25rem',
                textShadow:
                  '0 0 10px rgba(255, 255, 255, 0.9), 0 0 30px rgba(255, 255, 255, 0.6), 0 0 60px rgba(0, 255, 255, 0.8)', // Glowing effect
                color: 'white',
              }}
            >
              &quot;{quotes[quoteIndex].text}&quot;
            </p>
          </div>
        </div>

        {/* Signup Form */}
        <div className="w-1/2 p-10 text-gray-100">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-3">
              <Ticket className="h-10 w-10 text-accent" />
            </div>
            <h2
              className="text-3xl font-bold"
              style={{
                color: mintGreen,
                textShadow:
                  '0px 0px 8px rgba(0, 255, 0, 0.6), 0px 0px 20px rgba(0, 255, 0, 0.4)', // Glowing text effect
              }}
            >
              Welcome Back
            </h2>
            <p
              className="text-sm mt-4"
              style={{
                color: paleSpringBud,
                textShadow: '0px 0px 8px rgba(255, 255, 255, 0.6)', // Light glow effect
              }}
            >
              Sign up to your MintMoments account
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg">
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5" style={{ color: paleSpringBud }} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-2 rounded-lg bg-white/90 text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Email address"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5" style={{ color: paleSpringBud }} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-2 rounded-lg bg-white/90 text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Password"
                />
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5" style={{ color: paleSpringBud }} />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-2 rounded-lg bg-white/90 text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Confirm Password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 rounded-lg bg-accent text-white font-semibold hover:bg-accent-dark transition disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-6 flex items-center">
              <div className="flex-grow border-t border-white/30"></div>
              <span className="px-4 text-sm" style={{ color: paleSpringBud }}>
                or
              </span>
              <div className="flex-grow border-t border-white/30"></div>
            </div>

            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/20 text-white hover:bg-white/10 transition disabled:opacity-50"
            >
              <FaGoogle className="h-5 w-5 text-white" /> {/* Google icon */}
              {loading ? 'Creating account with Google...' : 'Sign up with Google'}
            </button>

            {/* Sign in link */}
            <p className="mt-6 text-center text-sm" style={{ color: paleSpringBud }}>
              Already have an account?{' '}
              <Link to="/login" className="hover:underline" style={{ color: paleSpringBud }}>
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}