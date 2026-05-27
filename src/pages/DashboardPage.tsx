import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, SlidersHorizontal } from 'lucide-react';
import ApartmentGrid from '../components/apartments/ApartmentGrid';
import AuthModal from '../components/auth/AuthModal';
import { useAuth } from '../hooks/useAuth';
import { useFilters } from '../hooks/useFilters';
import { useBookmarks } from '../hooks/useBookmarks';
import { searchApartments } from '../services/apartmentService';
import { extractFiltersFromPrompt } from '../services/aiService';
import { mockApartments } from '../data/mockApartments';
import type { Apartment } from '../types';

export default function DashboardPage() {
  const { user } = useAuth();
  const { filters, setFilters } = useFilters();
  const { bookmarks } = useBookmarks();
  const [matchingApts, setMatchingApts] = useState<Apartment[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  // Load matching apartments based on saved filters
  useEffect(() => {
    if (filters.location || filters.maxBudget) {
      setLoadingMatches(true);
      searchApartments(filters)
        .then(setMatchingApts)
        .finally(() => setLoadingMatches(false));
    } else {
      setMatchingApts(mockApartments.slice(0, 4));
    }
  }, []);

  // Get bookmarked apartment objects
  const bookmarkedApts = mockApartments.filter(apt =>
    bookmarks.some(b => b.apartmentId === apt.id)
  );

  const handleNewSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const newFilters = await extractFiltersFromPrompt(searchQuery);
      setFilters(newFilters);
      setMatchingApts(await searchApartments(newFilters));
    } finally {
      setSearching(false);
    }
  };

  const timeOfDay = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <>
      <main id="main-content" className="dashboard-page">
        {/* Hero greeting */}
        <section className="dashboard-hero">
          <div className="dashboard-hero-inner">
            <div className="dashboard-greeting">
              <h1 className="dashboard-title">
                {timeOfDay()}, <span className="dashboard-name">{user?.name?.split(' ')[0] ?? 'there'}</span> 👋
              </h1>
              <p className="dashboard-subtitle">
                Your personalized apartment dashboard. Your saved filters are applied automatically.
              </p>
            </div>

            {/* Stats */}
            <div className="dashboard-stats">
              <div className="stat-card">
                <span className="stat-number">{bookmarks.length}</span>
                <span className="stat-label">Bookmarks</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{matchingApts.length}</span>
                <span className="stat-label">Matches</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{filters.maxBudget ? `$${filters.maxBudget.toLocaleString()}` : '—'}</span>
                <span className="stat-label">Budget</span>
              </div>
            </div>
          </div>
        </section>

        <div className="dashboard-inner">
          {/* New search prompt */}
          <section className="dashboard-section" aria-labelledby="new-search-heading">
            <div className="section-row">
              <h2 id="new-search-heading" className="dashboard-section-title">
                <Search size={18} /> Search for new apartments
              </h2>
              <Link to="/search" className="section-row-link">
                Adjust filters <SlidersHorizontal size={14} />
              </Link>
            </div>
            <form onSubmit={handleNewSearch} className="dashboard-search-form">
              <input
                id="dashboard-search-input"
                type="search"
                className="dashboard-search-input"
                placeholder="e.g. 2 bedroom near campus under $1,100/mo"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                disabled={searching}
              />
              <button
                id="dashboard-search-btn"
                type="submit"
                className="btn btn-primary"
                disabled={searching}
              >
                {searching ? 'Searching…' : <><Search size={15} /> Search</>}
              </button>
            </form>

            {/* Current filter summary */}
            {(filters.location || filters.maxBudget) && (
              <div className="filter-summary">
                <span className="filter-summary-label">Saved filters:</span>
                {filters.location && <span className="filter-chip-sm">📍 {filters.location}</span>}
                {filters.maxBudget && <span className="filter-chip-sm">💰 Up to ${filters.maxBudget.toLocaleString()}/mo</span>}
                {filters.bedrooms !== undefined && <span className="filter-chip-sm">🛏 {filters.bedrooms === 0 ? 'Studio' : `${filters.bedrooms}BR`}</span>}
                {filters.petsAllowed && <span className="filter-chip-sm">🐾 Pets OK</span>}
                {filters.utilitiesIncluded && <span className="filter-chip-sm">💡 Utilities incl.</span>}
              </div>
            )}
          </section>

          {/* Matching apartments */}
          <section className="dashboard-section" aria-labelledby="matches-heading">
            <div className="section-row">
              <h2 id="matches-heading" className="dashboard-section-title">
                ✦ Apartments for you
              </h2>
              <Link to="/search" id="see-all-matches-link" className="section-row-link">
                See all <ArrowRight size={14} />
              </Link>
            </div>
            <ApartmentGrid
              apartments={matchingApts.slice(0, 4)}
              loading={loadingMatches}
              onAuthRequired={() => setAuthOpen(true)}
            />
          </section>

          {/* Bookmarks preview */}
          {bookmarkedApts.length > 0 && (
            <section className="dashboard-section" aria-labelledby="bookmarks-heading">
              <div className="section-row">
                <h2 id="bookmarks-heading" className="dashboard-section-title">
                  ❤️ Your saved apartments
                </h2>
                <Link to="/bookmarks" id="see-all-bookmarks-link" className="section-row-link">
                  View all <ArrowRight size={14} />
                </Link>
              </div>
              <ApartmentGrid
                apartments={bookmarkedApts.slice(0, 2)}
                onAuthRequired={() => setAuthOpen(true)}
              />
            </section>
          )}

          {bookmarkedApts.length === 0 && (
            <section className="dashboard-section dashboard-bookmark-cta">
              <div className="bookmark-cta-card">
                <div className="bookmark-cta-icon">🔖</div>
                <h3 className="bookmark-cta-title">No bookmarks yet</h3>
                <p className="bookmark-cta-desc">Click the ♡ heart on any apartment to save it here for easy comparison.</p>
                <Link to="/search" className="btn btn-primary">
                  Browse apartments
                </Link>
              </div>
            </section>
          )}
        </div>
      </main>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
