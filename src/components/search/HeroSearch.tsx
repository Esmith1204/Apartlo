import { useState, useRef, useEffect } from 'react';
import { Search, Sparkles, ArrowRight, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { extractFiltersFromPrompt } from '../../services/aiService';
import { useFilters } from '../../hooks/useFilters';
import LoadingSpinner from '../ui/LoadingSpinner';

const suggestions = [
  '2 bedroom near Ohio State under $1,200/mo, pet friendly',
  'Studio apartment near Michigan State, utilities included',
  'Pet friendly 1BR in Columbus under $950/mo with parking',
  '3 bedroom for roommates near UNC Chapel Hill',
  'Furnished studio near campus, all-inclusive under $800',
];

export default function HeroSearch() {
  const [query, setQuery] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [suggestionIdx, setSuggestionIdx] = useState(0);
  const [placeholderText, setPlaceholderText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { setFilters } = useFilters();

  // Animated placeholder cycle
  useEffect(() => {
    let charIdx = 0;
    let typingForward = true;
    let timeout: ReturnType<typeof setTimeout>;

    const tick = () => {
      const full = suggestions[suggestionIdx];
      if (typingForward) {
        charIdx++;
        setPlaceholderText(full.slice(0, charIdx));
        if (charIdx >= full.length) {
          typingForward = false;
          timeout = setTimeout(tick, 2400);
          return;
        }
      } else {
        charIdx--;
        setPlaceholderText(full.slice(0, charIdx));
        if (charIdx === 0) {
          typingForward = true;
          setSuggestionIdx(i => (i + 1) % suggestions.length);
        }
      }
      timeout = setTimeout(tick, typingForward ? 38 : 18);
    };
    timeout = setTimeout(tick, 500);
    return () => clearTimeout(timeout);
  }, [suggestionIdx]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) { inputRef.current?.focus(); return; }
    setExtracting(true);
    try {
      const filters = await extractFiltersFromPrompt(query);
      setFilters(filters);
      navigate('/search', { state: { filters } });
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="hero-search">
      {/* Animated background blobs */}
      <div className="hero-bg" aria-hidden="true">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="hero-grid" />
      </div>

      <div className="hero-content">
        <div className="hero-badge">
          <Sparkles size={14} />
          <span>AI-Powered Housing Search</span>
        </div>

        <h1 className="hero-title">
          Get started on your<br />
          <span className="hero-title-gradient">apartment search</span><br />
          with one search.
        </h1>

        <p className="hero-subtitle">
          No hidden fees surprises. No endless tabs. Just smart results built for students,
          surfacing the costs that listing sites bury.
        </p>

        <form id="hero-search-form" onSubmit={handleSearch} className="hero-form" role="search">
          <div className="hero-input-wrapper">
            <Search size={20} className="hero-input-icon" />
            <input
              ref={inputRef}
              id="hero-search-input"
              type="search"
              className="hero-input"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={placeholderText || 'Describe what you\'re looking for…'}
              aria-label="Describe your ideal apartment"
              disabled={extracting}
            />
            {extracting && <div className="hero-input-spinner"><LoadingSpinner size={22} /></div>}
          </div>
          <button
            id="hero-search-btn"
            type="submit"
            className="btn btn-primary hero-btn"
            disabled={extracting}
          >
            {extracting ? 'Analyzing…' : (
              <>Continue <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <div className="hero-quick-searches">
          <MapPin size={13} className="hero-quick-icon" />
          <span className="hero-quick-label">Quick searches:</span>
          {['Near Ohio State', 'Columbus under $1,000', 'Pet Friendly Studio'].map(q => (
            <button
              key={q}
              className="hero-quick-tag"
              onClick={() => setQuery(q)}
              type="button"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll" aria-hidden="true">
        <div className="scroll-dot" />
      </div>
    </div>
  );
}
