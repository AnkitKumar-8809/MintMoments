// src/components/Navbar.jsx
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Ticket, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
      // Navigate anyway since user is cleared locally
      navigate('/login');
    }
  }

  // Colors
  const mintGreen = '#98FF98';

  return (
    <header className="sticky top-0 z-50 w-full bg-white/5 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-3 min-w-0 flex-shrink-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent shadow-md">
              <Ticket className="h-5 w-5 text-primary" />
            </div>
            <div className="hidden sm:block">
              <h1
                className="text-lg font-bold whitespace-nowrap"
                style={{
                  color: mintGreen,
                  textShadow:
                    '0px 0px 6px rgba(0, 255, 0, 0.5), 0px 0px 12px rgba(0, 255, 0, 0.3)',
                }}
              >
                MintMoments
              </h1>
            </div>
            <div className="sm:hidden">
              <h1 className="text-sm font-bold text-white">
                DT
              </h1>
            </div>
          </div>

          {/* Right Section - Fixed */}
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
            {/* User Info - Hidden on mobile if too cramped */}
            {currentUser && (
              <div className="hidden md:flex items-center space-x-2 text-sm text-white/70">
                <User className="h-4 w-4" />
                <span className="truncate max-w-[150px]">
                  {currentUser.displayName || currentUser.name || currentUser.email}
                </span>
                {currentUser.authMethod === 'google' && (
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                    Google
                  </span>
                )}
              </div>
            )}

            {/* Connect Button - Responsive */}
            <div className="flex-shrink-0">
              <ConnectButton 
                chainStatus="icon" 
                showBalance={false}
                accountStatus={{
                  smallScreen: 'avatar',
                  largeScreen: 'full',
                }}
              />
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-2 py-1 text-xs sm:text-sm text-gray-300 hover:text-white transition-colors rounded-md hover:bg-white/10"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
