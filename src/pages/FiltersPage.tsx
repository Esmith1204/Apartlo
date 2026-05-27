import { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, LogIn, LogOut, Bookmark } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import FloatingFilterPills from '../components/search/FloatingFilterPills';
import AuthModal from '../components/auth/AuthModal';
import { useAuth } from '../hooks/useAuth';
import { useSearch } from '../hooks/useSearch';

export default function FiltersPage() {
  const { query, filters, setFilters } = useSearch();
  const { isAuthenticated, user, logout } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [pillsVisible, setPillsVisible] = useState(false);
  const navigate = useNavigate();

  // If someone navigates here directly with no query, send them back
  useEffect(() => {
    if (!query) navigate('/', { replace: true });
    else setTimeout(() => setPillsVisible(true), 120);
  }, []);

  return (
    <>
      <div className="landing-bg" aria-hidden="true">
        <div className="landing-blob lb-4" />
        <div className="landing-blob lb-5" />
        <div className="landing-blob lb-2" />
        <div className="landing-grid" />
      </div>

      {/* Corner auth */}
      <div className="landing-corner-auth">
        {isAuthenticated ? (
          <div className="landing-user-menu">
            <div className="landing-avatar">
              {user?.avatar
                ? <img src={user.avatar} alt={user.name} />
                : <span>{user?.name?.charAt(0).toUpperCase()}</span>
              }
            </div>
            <span className="landing-user-name">{user?.name?.split(' ')[0]}</span>
            <Link to="/bookmarks" className="landing-corner-btn" aria-label="Bookmarks">
              <Bookmark size={15} />
            </Link>
            <button className="landing-corner-btn" onClick={logout} aria-label="Sign out">
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <button
            id="filters-signin-btn"
            className="landing-signin-btn"
            onClick={() => setAuthOpen(true)}
          >
            <LogIn size={15} />
            Sign In
          </button>
        )}
      </div>

      {/* Page content */}
      <div className="filter-section-content">
        <div className="filter-section-header">
          <div className="filter-section-badge">
            <Sparkles size={13} />
            AI Extracted Filters
          </div>
          <h1 className="filter-section-title">Here's what we found</h1>
          <p className="filter-section-subtitle">
            Review and refine your filters. Click any pill to edit, or add more below.
          </p>
        </div>

        <div className="filter-pills-stage">
          <FloatingFilterPills
            filters={filters}
            onChange={setFilters}
            visible={pillsVisible}
          />
        </div>

        {query && (
          <div className="filter-query-echo">
            <Sparkles size={12} />
            <span>"{query}"</span>
          </div>
        )}

        <div className="filter-section-cta">
          <button
            id="filters-back-btn"
            className="filter-back-btn"
            onClick={() => navigate('/')}
          >
            ← Edit prompt
          </button>
          <button
            id="filters-continue-btn"
            className="filter-continue-btn"
            onClick={() => navigate('/results')}
          >
            View Listings
            <ArrowRight size={17} />
          </button>
        </div>
      </div>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
