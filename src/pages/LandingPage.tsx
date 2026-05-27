import { useState, useRef, useEffect } from 'react';
import { ArrowRight, Sparkles, LogIn, LogOut, Bookmark } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthModal from '../components/auth/AuthModal';
import { useAuth } from '../hooks/useAuth';
import { useSearch, parsePrompt } from '../hooks/useSearch';

/* ── Quick-suggestion chips shown under the prompt ────────────────────────── */
const SUGGESTIONS = [
  '2 bed under $1,500, pet friendly',
  'Studio near campus, utilities included',
  'Furnished 1BR, parking, max $1,200',
  'Roommate-friendly 3BR, no pet deposit',
];

export default function LandingPage() {
  const { query, setQuery, setFilters } = useSearch();
  const { isAuthenticated, user, logout } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const parsed = parsePrompt(query);
    setFilters(parsed);
    navigate('/filters');
  };

  const handleSuggestion = (text: string) => {
    setQuery(text);
    const parsed = parsePrompt(text);
    setFilters(parsed);
    navigate('/filters');
  };

  // Auto-focus prompt on load
  useEffect(() => {
    setTimeout(() => promptRef.current?.focus(), 400);
  }, []);

  const openAuth = (tab: 'login' | 'register' = 'login') => {
    setAuthTab(tab);
    setAuthOpen(true);
  };

  return (
    <>
      {/* Deep navy background layers */}
      <div className="landing-bg" aria-hidden="true">
        <div className="landing-blob lb-1" />
        <div className="landing-blob lb-2" />
        <div className="landing-blob lb-3" />
        <div className="landing-grid" />
      </div>

      {/* Corner auth button */}
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
            id="landing-signin-btn"
            className="landing-signin-btn"
            onClick={() => openAuth('login')}
          >
            <LogIn size={15} />
            Sign In
          </button>
        )}
      </div>

      {/* Hero content */}
      <div className="hero-prompt-content">
        {/* Logo */}
        <div className="hero-logo-wrap">
          <svg width="48" height="48" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="M16 3L2 14h4v15h8v-9h4v9h8V14h4L16 3z" fill="url(#landLogoGrad)" />
            <circle cx="24" cy="24" r="6" fill="rgba(10,14,35,0.95)" />
            <path d="M24 20.5c-1.5-1.5-4 .5-4 2.5 0 1.5 1.5 2.5 4 4 2.5-1.5 4-2.5 4-4 0-2-2.5-4-4-2.5z" fill="#ff6b6b" />
            <defs>
              <linearGradient id="landLogoGrad" x1="2" y1="3" x2="30" y2="29" gradientUnits="userSpaceOnUse">
                <stop stopColor="#5b8dee" />
                <stop offset="1" stopColor="#3b6fd4" />
              </linearGradient>
            </defs>
          </svg>
          <span className="hero-wordmark">Apartlo</span>
        </div>

        <h1 className="hero-prompt-title">
          Find your next apartment.<br />
          <span className="hero-prompt-gradient">Just describe it.</span>
        </h1>
        <p className="hero-prompt-subtitle">
          Tell us what you're looking for — budget, size, location, preferences.
          We'll build your filters and surface the full picture.
        </p>

        {/* Prompt form */}
        <form
          id="hero-prompt-form"
          className="hero-prompt-form"
          onSubmit={handlePromptSubmit}
          aria-label="Apartment search prompt"
        >
          <div className="hero-prompt-box">
            <Sparkles size={18} className="hero-prompt-sparkle" aria-hidden="true" />
            <textarea
              ref={promptRef}
              id="hero-prompt-input"
              className="hero-prompt-textarea"
              placeholder="e.g. 2 bed under $1,500/mo, pet friendly, near Ohio State, parking included…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (query.trim()) {
                    const parsed = parsePrompt(query);
                    setFilters(parsed);
                    navigate('/filters');
                  }
                }
              }}
              rows={3}
              aria-label="Describe your ideal apartment"
            />
            <button
              id="hero-prompt-submit"
              type="submit"
              className="hero-prompt-submit"
              disabled={!query.trim()}
              aria-label="Search apartments"
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </form>

        {/* Quick suggestions */}
        <div className="hero-suggestions" aria-label="Quick searches">
          <span className="hero-suggestions-label">Try:</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              className="hero-suggestion-chip"
              onClick={() => handleSuggestion(s)}
              type="button"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Auth modal */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialTab={authTab}
      />
    </>
  );
}
