import { Link } from 'react-router-dom';
import { Trash2, Search } from 'lucide-react';
import ApartmentGrid from '../components/apartments/ApartmentGrid';
import { useBookmarks } from '../hooks/useBookmarks';
import { mockApartments } from '../data/mockApartments';

export default function BookmarksPage() {
  const { bookmarks, removeBookmark } = useBookmarks();

  const bookmarkedApts = mockApartments.filter(apt =>
    bookmarks.some(b => b.apartmentId === apt.id)
  );

  return (
    <main id="main-content" className="bookmarks-page">
      <div className="bookmarks-header">
        <div className="bookmarks-header-inner">
          <h1 className="bookmarks-title">Your Saved Apartments</h1>
          <p className="bookmarks-subtitle">
            {bookmarks.length > 0
              ? `${bookmarks.length} apartment${bookmarks.length !== 1 ? 's' : ''} saved`
              : 'No apartments saved yet'}
          </p>
        </div>
        {bookmarks.length > 0 && (
          <button
            id="clear-all-bookmarks-btn"
            className="btn btn-ghost btn-sm"
            onClick={() => bookmarks.forEach(b => removeBookmark(b.apartmentId))}
          >
            <Trash2 size={14} /> Clear all
          </button>
        )}
      </div>

      <div className="bookmarks-inner">
        {bookmarkedApts.length === 0 ? (
          <div className="bookmarks-empty">
            <div className="empty-icon">🔖</div>
            <h2 className="empty-title">No bookmarks yet</h2>
            <p className="empty-message">
              Browse apartments and click the ♡ heart icon to save ones you like here.
            </p>
            <Link to="/search" id="bookmarks-search-cta" className="btn btn-primary">
              <Search size={16} /> Search Apartments
            </Link>
          </div>
        ) : (
          <>
            <div className="bookmarks-meta">
              {bookmarks.map(b => {
                const apt = mockApartments.find(a => a.id === b.apartmentId);
                if (!apt) return null;
                return (
                  <div key={b.apartmentId} className="bookmark-meta-item">
                    <span className="bookmark-meta-name">{apt.name}</span>
                    <span className="bookmark-meta-date">
                      Saved {new Date(b.savedAt).toLocaleDateString()}
                    </span>
                    <button
                      id={`remove-bookmark-${b.apartmentId}`}
                      className="bookmark-remove"
                      onClick={() => removeBookmark(b.apartmentId)}
                      aria-label={`Remove ${apt.name} from bookmarks`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
            <ApartmentGrid apartments={bookmarkedApts} />
          </>
        )}
      </div>
    </main>
  );
}
