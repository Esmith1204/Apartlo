import { useState } from 'react';
import { Heart, MapPin } from 'lucide-react';
import type { Apartment } from '../../types';
import { useBookmarks } from '../../hooks/useBookmarks';
import { useAuth } from '../../hooks/useAuth';
import ApartmentDetailModal from './ApartmentDetailModal';

interface ApartmentCardCompactProps {
  apartment: Apartment;
  onAuthRequired: () => void;
}

export default function ApartmentCardCompact({ apartment, onAuthRequired }: ApartmentCardCompactProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();
  const { isAuthenticated } = useAuth();
  const bookmarked = isBookmarked(apartment.id);

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation(); // don't open the modal
    if (!isAuthenticated) { onAuthRequired(); return; }
    if (bookmarked) removeBookmark(apartment.id);
    else addBookmark(apartment.id);
  };

  const lowestPrice = Math.min(...apartment.floorPlans.map(fp => fp.price));

  const scoreColor =
    apartment.aiMatchScore >= 80 ? '#22c55e' :
    apartment.aiMatchScore >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <>
      <article
        className="apt-compact-card"
        onClick={() => setDetailOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setDetailOpen(true); }}
        aria-label={`View details for ${apartment.name}`}
      >
        {/* Image */}
        <div className="apt-compact-img-wrap">
          <img
            src={apartment.images[0]}
            alt={apartment.name}
            className="apt-compact-img"
            loading="lazy"
          />
          {/* Score badge */}
          <div className="apt-compact-score" style={{ color: scoreColor }} title={`AI Match: ${apartment.aiMatchScore}%`}>
            <span className="apt-compact-score-num">{apartment.aiMatchScore}</span>
            <span className="apt-compact-score-pct">%</span>
          </div>
          {/* Bookmark */}
          <button
            id={`compact-bookmark-${apartment.id}`}
            className={`apt-compact-bookmark ${bookmarked ? 'apt-compact-bookmark-active' : ''}`}
            onClick={handleBookmark}
            aria-label={bookmarked ? 'Remove bookmark' : 'Save listing'}
            aria-pressed={bookmarked}
          >
            <Heart size={15} fill={bookmarked ? '#ff6b6b' : 'none'} />
          </button>
          {/* Source */}
          <span className="apt-compact-source">{apartment.sourceName}</span>
        </div>

        {/* Info */}
        <div className="apt-compact-info">
          <div className="apt-compact-top">
            <h3 className="apt-compact-name">{apartment.name}</h3>
            <span className="apt-compact-price">${lowestPrice.toLocaleString()}<span className="apt-compact-price-unit">/mo</span></span>
          </div>
          <p className="apt-compact-location">
            <MapPin size={11} />
            {apartment.city}, {apartment.state}
          </p>
          {/* Feature chips */}
          <div className="apt-compact-chips">
            {apartment.petsAllowed && <span className="apt-compact-chip">🐾 Pets OK</span>}
            {apartment.parkingIncluded && <span className="apt-compact-chip">🚗 Parking</span>}
            {apartment.utilitiesIncluded.length > 0 && <span className="apt-compact-chip">⚡ Utilities</span>}
            <span className="apt-compact-chip">📅 {apartment.leaseLength}</span>
          </div>
        </div>
      </article>

      {/* Detail modal */}
      {detailOpen && (
        <ApartmentDetailModal
          apartment={apartment}
          onClose={() => setDetailOpen(false)}
          onAuthRequired={onAuthRequired}
        />
      )}
    </>
  );
}
