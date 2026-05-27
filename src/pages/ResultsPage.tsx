import { useState, useEffect } from 'react';
import { LogIn, LogOut, Bookmark, Sparkles, Home } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ApartmentCardCompact from '../components/apartments/ApartmentCardCompact';
import FloatingFilterPills from '../components/search/FloatingFilterPills';
import AuthModal from '../components/auth/AuthModal';
import { searchApartments } from '../services/apartmentService';
import { useAuth } from '../hooks/useAuth';
import { useSearch } from '../hooks/useSearch';
import type { Apartment } from '../types';

const LOADING_STATUSES = [
  'Initializing live apartment search...',
  'Tavily AI searching the web for real-time listings...',
  'Retrieving deep page content from listing directories...',
  'Gemini 2.5 Flash structuring raw listings into JSON schema...',
  'Calculating AI compatibility scores and estimating hidden costs...',
];

export default function ResultsPage() {
  const { query, filters, setFilters } = useSearch();
  const { isAuthenticated, user, logout } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [pillsVisible, setPillsVisible] = useState(false);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusIndex, setStatusIndex] = useState(0);
  const navigate = useNavigate();

  // Cycle through loading status messages
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setStatusIndex(prev => (prev + 1) % LOADING_STATUSES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [loading]);

  // Fetch results live from search service
  useEffect(() => {
    if (!query) {
      navigate('/', { replace: true });
      return;
    }

    let active = true;
    setLoading(true);
    setStatusIndex(0);

    searchApartments(filters)
      .then(results => {
        if (active) {
          setApartments(results);
          setLoading(false);
          setTimeout(() => setPillsVisible(true), 80);
        }
      })
      .catch(err => {
        console.error('Failed to load live apartments:', err);
        if (active) {
          setLoading(false);
          setTimeout(() => setPillsVisible(true), 80);
        }
      });

    return () => {
      active = false;
    };
  }, [filters, query]);

  const openAuth = (tab: 'login' | 'register' = 'register') => {
    setAuthTab(tab);
    setAuthOpen(true);
  };

  return (
    <>
      {/* Navy background */}
      <div className="landing-bg" aria-hidden="true">
        <div className="landing-blob lb-1" style={{ opacity: 0.20 }} />
        <div className="landing-blob lb-3" style={{ opacity: 0.15 }} />
        <div className="landing-grid" />
      </div>

      <div className="results-page-inner">
        {/* ── Top bar ──────────────────────────────────────────────────────── */}
        <header className="results-topbar">
          <Link to="/" className="results-logo-link" aria-label="Apartlo home">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <path d="M16 3L2 14h4v15h8v-9h4v9h8V14h4L16 3z" fill="url(#resLogoGrad)" />
              <circle cx="24" cy="24" r="6" fill="rgba(10,14,35,0.95)" />
              <path d="M24 20.5c-1.5-1.5-4 .5-4 2.5 0 1.5 1.5 2.5 4 4 2.5-1.5 4-2.5 4-4 0-2-2.5-4-4-2.5z" fill="#ff6b6b" />
              <defs>
                <linearGradient id="resLogoGrad" x1="2" y1="3" x2="30" y2="29" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#5b8dee" />
                  <stop offset="1" stopColor="#3b6fd4" />
                </linearGradient>
              </defs>
            </svg>
            <span className="results-wordmark">Apartlo</span>
          </Link>

          {/* Editable filter pills — inline on the top bar */}
          <div className="results-filter-strip">
            <FloatingFilterPills
              filters={filters}
              onChange={setFilters}
              visible={pillsVisible}
              compact
            />
          </div>

          {/* Auth corner */}
          <div className="results-auth">
            {isAuthenticated ? (
              <div className="landing-user-menu">
                <div className="landing-avatar">
                  {user?.avatar
                    ? <img src={user.avatar} alt={user.name} />
                    : <span>{user?.name?.charAt(0).toUpperCase()}</span>
                  }
                </div>
                <Link to="/bookmarks" className="landing-corner-btn" aria-label="Bookmarks">
                  <Bookmark size={15} />
                </Link>
                <button className="landing-corner-btn" onClick={logout} aria-label="Sign out">
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <button
                id="results-signin-btn"
                className="landing-signin-btn"
                onClick={() => openAuth('login')}
              >
                <LogIn size={15} />
                Sign In
              </button>
            )}
          </div>
        </header>

        {/* ── Results meta ─────────────────────────────────────────────────── */}
        <div className="results-meta-row">
          <span className="results-count-label">
            <Sparkles size={14} />
            {loading ? 'Searching...' : `${apartments.length} apartments found`}
            {filters.location && <> near <strong>{filters.location}</strong></>}
          </span>
          {!isAuthenticated && (
            <button className="listings-signin-nudge" onClick={() => openAuth('register')}>
              Sign up to save listings
            </button>
          )}
        </div>

        {/* ── Compact card grid ─────────────────────────────────────────────── */}
        {loading ? (
          <div className="results-loading-container">
            {/* Glassmorphic loader overlay */}
            <div className="results-loader-overlay">
              <div className="results-loader-content">
                <div className="results-loader-glow" />
                <div className="results-loader-circle">
                  <Sparkles className="results-loader-sparkle-icon" size={28} />
                </div>
                <h2 className="results-loader-title">Finding Live Listings</h2>
                <div className="results-loader-progress-bar">
                  <div
                    className="results-loader-progress-fill"
                    style={{ width: `${(statusIndex + 1) * 20}%` }}
                  />
                </div>
                <p key={statusIndex} className="results-loader-text">
                  {LOADING_STATUSES[statusIndex]}
                </p>
              </div>
            </div>

            {/* Pulsing skeletons in the background */}
            <div className="results-grid" aria-hidden="true">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="apt-compact-card skeleton-card-compact">
                  <div className="skeleton-img-placeholder" />
                  <div className="skeleton-info-placeholder">
                    <div className="skeleton-line skeleton-title" />
                    <div className="skeleton-line skeleton-text" />
                    <div className="skeleton-chips">
                      <div className="skeleton-chip" />
                      <div className="skeleton-chip" />
                      <div className="skeleton-chip" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : apartments.length === 0 ? (
          <div className="results-empty">
            <Home size={40} />
            <p>No apartments match your filters. Try adjusting them above.</p>
          </div>
        ) : (
          <div className="results-grid" aria-label="Apartment listings">
            {apartments.map(apt => (
              <ApartmentCardCompact
                key={apt.id}
                apartment={apt}
                onAuthRequired={() => openAuth('register')}
              />
            ))}
          </div>
        )}
      </div>

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialTab={authTab}
      />
    </>
  );
}
