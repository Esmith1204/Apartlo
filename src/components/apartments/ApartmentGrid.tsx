import type { Apartment } from '../../types';
import ApartmentCard from './ApartmentCard';
import LoadingSpinner from '../ui/LoadingSpinner';

interface ApartmentGridProps {
  apartments: Apartment[];
  loading?: boolean;
  onAuthRequired?: () => void;
  emptyMessage?: string;
}

function SkeletonCard() {
  return (
    <div className="apt-card skeleton-card" aria-hidden="true">
      <div className="skeleton skeleton-img" />
      <div className="apt-body">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-text" />
        <div className="skeleton skeleton-text skeleton-text-short" />
        <div className="skeleton skeleton-text" />
        <div className="skeleton skeleton-block" />
      </div>
    </div>
  );
}

export default function ApartmentGrid({ apartments, loading, onAuthRequired, emptyMessage }: ApartmentGridProps) {
  if (loading) {
    return (
      <div className="apt-grid-loading">
        <div className="apt-grid-spinner">
          <LoadingSpinner size={48} label="Searching for apartments…" />
          <p className="loading-label">AI is finding your best matches…</p>
        </div>
        <div className="apt-grid">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (apartments.length === 0) {
    return (
      <div className="apt-grid-empty">
        <div className="empty-icon">🏠</div>
        <h3 className="empty-title">No apartments found</h3>
        <p className="empty-message">{emptyMessage ?? 'Try adjusting your filters or search a different location.'}</p>
      </div>
    );
  }

  return (
    <div className="apt-grid">
      {apartments.map(apt => (
        <ApartmentCard key={apt.id} apartment={apt} onAuthRequired={onAuthRequired} />
      ))}
    </div>
  );
}
