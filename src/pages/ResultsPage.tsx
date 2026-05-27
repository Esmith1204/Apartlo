import { useState, useEffect } from 'react';
import { LogIn, LogOut, Bookmark, Sparkles, Home } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ApartmentCardCompact from '../components/apartments/ApartmentCardCompact';
import FloatingFilterPills from '../components/search/FloatingFilterPills';
import AuthModal from '../components/auth/AuthModal';
import { mockApartments } from '../data/mockApartments';
import { useAuth } from '../hooks/useAuth';
import { useSearch } from '../hooks/useSearch';

export default function ResultsPage() {
  const { query, filters, setFilters } = useSearch();
  const { isAuthenticated, user, logout } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [pillsVisible, setPillsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query) navigate('/', { replace: true });
    else setTimeout(() => setPillsVisible(true), 80);
  }, []);

  const openAuth = (tab: 'login' | 'register' = 'register') => {
    setAuthTab(tab);
    setAuthOpen(true);
  };

  // Sort by match score by default
  const sorted = [...mockApartments].sort((a, b) => b.aiMatchScore - a.aiMatchScore);

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
            {sorted.length} apartments found
            {filters.location && <> near <strong>{filters.location}</strong></>}
          </span>
          {!isAuthenticated && (
            <button className="listings-signin-nudge" onClick={() => openAuth('register')}>
              Sign up to save listings
            </button>
          )}
        </div>

        {/* ── Compact card grid ─────────────────────────────────────────────── */}
        {sorted.length === 0 ? (
          <div className="results-empty">
            <Home size={40} />
            <p>No apartments match your filters. Try adjusting them above.</p>
          </div>
        ) : (
          <div className="results-grid" aria-label="Apartment listings">
            {sorted.map(apt => (
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
