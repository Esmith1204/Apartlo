import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, LogIn, LogOut, Menu, X, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import AuthModal from '../auth/AuthModal';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <>
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <div className="navbar-inner">
          {/* Logo */}
          <Link to="/" className="navbar-logo" aria-label="Apartlo home">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M16 3L2 14h4v15h8v-9h4v9h8V14h4L16 3z" fill="url(#logoGrad)" />
              <circle cx="24" cy="24" r="6" fill="#1a1a2e" />
              <path d="M24 20.5c-1.5-1.5-4 .5-4 2.5 0 1.5 1.5 2.5 4 4 2.5-1.5 4-2.5 4-4 0-2-2.5-4-4-2.5z" fill="#ff6b6b" />
              <defs>
                <linearGradient id="logoGrad" x1="2" y1="3" x2="30" y2="29" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#7c6ff7" />
                  <stop offset="1" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
            </svg>
            <span className="navbar-wordmark">Apartlo</span>
          </Link>

          {/* Desktop links */}
          <div className="navbar-links">
            <Link to="/" className="nav-link">Home</Link>
            {isAuthenticated && <Link to="/dashboard" className="nav-link">Dashboard</Link>}
            {isAuthenticated && (
              <Link to="/bookmarks" className="nav-link nav-link-icon">
                <Bookmark size={16} />
                Bookmarks
              </Link>
            )}
          </div>

          {/* Auth controls */}
          <div className="navbar-auth">
            {isAuthenticated ? (
              <div className="avatar-dropdown">
                <button
                  id="avatar-btn"
                  className="avatar-btn"
                  onClick={() => setDropdownOpen(o => !o)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="menu"
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="avatar-img" />
                  ) : (
                    <div className="avatar-initials">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="avatar-name">{user?.name?.split(' ')[0]}</span>
                </button>
                {dropdownOpen && (
                  <div className="dropdown-menu" role="menu">
                    <Link to="/dashboard" className="dropdown-item" role="menuitem" onClick={() => setDropdownOpen(false)}>
                      <User size={15} /> Dashboard
                    </Link>
                    <Link to="/bookmarks" className="dropdown-item" role="menuitem" onClick={() => setDropdownOpen(false)}>
                      <Bookmark size={15} /> Bookmarks
                    </Link>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item dropdown-item-danger" role="menuitem" onClick={handleLogout}>
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button id="navbar-signin-btn" className="btn btn-ghost" onClick={() => setAuthOpen(true)}>
                <LogIn size={16} /> Sign In
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              id="navbar-menu-btn"
              className="hamburger"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen(o => !o)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="mobile-menu">
            <Link to="/" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Home</Link>
            {isAuthenticated && <Link to="/dashboard" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Dashboard</Link>}
            {isAuthenticated && <Link to="/bookmarks" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Bookmarks</Link>}
            {!isAuthenticated && (
              <button className="btn btn-primary mobile-signin" onClick={() => { setAuthOpen(true); setMenuOpen(false); }}>
                Sign In / Register
              </button>
            )}
          </div>
        )}
      </nav>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
