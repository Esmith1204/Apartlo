import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUpDown } from 'lucide-react';
import FilterPanel from '../components/search/FilterPanel';
import ApartmentGrid from '../components/apartments/ApartmentGrid';
import AuthModal from '../components/auth/AuthModal';
import { searchApartments } from '../services/apartmentService';
import { useFilters } from '../hooks/useFilters';
import type { Apartment } from '../types';

type SortKey = 'match' | 'price-asc' | 'price-desc';

export default function SearchPage() {
  const location = useLocation();
  const { filters, setFilters } = useFilters();
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [sort, setSort] = useState<SortKey>('match');

  // Auto-search if navigated here from hero with pre-set filters
  useEffect(() => {
    if (location.state?.filters) {
      setFilters(location.state.filters);
      runSearch(location.state.filters);
    }
  }, []);

  const runSearch = async (overrideFilters = filters) => {
    setLoading(true);
    setSearched(true);
    try {
      const results = await searchApartments(overrideFilters);
      setApartments(results);
    } finally {
      setLoading(false);
    }
  };

  const sorted = [...apartments].sort((a, b) => {
    if (sort === 'match') return b.aiMatchScore - a.aiMatchScore;
    const aPrice = Math.min(...a.floorPlans.map(f => f.price));
    const bPrice = Math.min(...b.floorPlans.map(f => f.price));
    return sort === 'price-asc' ? aPrice - bPrice : bPrice - aPrice;
  });

  return (
    <>
      <main id="main-content" className="search-page">
        <div className="search-page-header">
          <div className="search-page-header-inner">
            <h1 className="search-page-title">
              {filters.location ? `Apartments near ${filters.location}` : 'Find your apartment'}
            </h1>
            {filters.query && (
              <p className="search-page-query">
                <span className="search-query-label">Your search:</span> "{filters.query}"
              </p>
            )}
          </div>
        </div>

        <div className="search-layout">
          {/* Filter sidebar */}
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            onSearch={() => runSearch()}
            searching={loading}
          />

          {/* Results */}
          <div className="search-results">
            {searched && !loading && apartments.length > 0 && (
              <div className="results-toolbar">
                <span className="results-count">
                  {apartments.length} apartment{apartments.length !== 1 ? 's' : ''} found
                </span>
                <div className="results-sort">
                  <ArrowUpDown size={14} />
                  <select
                    id="results-sort-select"
                    value={sort}
                    onChange={e => setSort(e.target.value as SortKey)}
                    className="sort-select"
                    aria-label="Sort results"
                  >
                    <option value="match">Best Match</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>
              </div>
            )}

            {!searched && !loading ? (
              <div className="search-prompt">
                <div className="search-prompt-icon">🔍</div>
                <h2 className="search-prompt-title">Adjust your filters and search</h2>
                <p className="search-prompt-desc">
                  Use the filters on the left to describe your ideal apartment, then click "Search Apartments."
                </p>
              </div>
            ) : (
              <ApartmentGrid
                apartments={sorted}
                loading={loading}
                onAuthRequired={() => setAuthOpen(true)}
              />
            )}
          </div>
        </div>
      </main>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
