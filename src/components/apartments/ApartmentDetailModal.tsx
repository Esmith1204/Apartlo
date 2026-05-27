import { useState } from 'react';
import {
  Heart, ExternalLink, MapPin, Sparkles, Star, AlertTriangle,
  CheckCircle2, XCircle, X, ChevronLeft, ChevronRight,
  Phone, Mail, Globe, ChevronDown, ChevronUp,
} from 'lucide-react';
import type { Apartment } from '../../types';
import { useBookmarks } from '../../hooks/useBookmarks';
import { useAuth } from '../../hooks/useAuth';

interface ApartmentDetailModalProps {
  apartment: Apartment;
  onClose: () => void;
  onAuthRequired: () => void;
}

export default function ApartmentDetailModal({
  apartment,
  onClose,
  onAuthRequired,
}: ApartmentDetailModalProps) {
  const [imgIdx, setImgIdx] = useState(0);
  const [amenitiesOpen, setAmenitiesOpen] = useState(false);
  const [floorOpen, setFloorOpen] = useState(false);
  const [quotesOpen, setQuotesOpen] = useState(false);
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();
  const { isAuthenticated } = useAuth();
  const bookmarked = isBookmarked(apartment.id);

  const handleBookmark = () => {
    if (!isAuthenticated) { onAuthRequired(); return; }
    if (bookmarked) removeBookmark(apartment.id);
    else addBookmark(apartment.id);
  };

  const lowestPrice = Math.min(...apartment.floorPlans.map(fp => fp.price));
  const highestPrice = Math.max(...apartment.floorPlans.map(fp => fp.price));

  const prevImg = () => setImgIdx(i => (i - 1 + apartment.images.length) % apartment.images.length);
  const nextImg = () => setImgIdx(i => (i + 1) % apartment.images.length);

  return (
    <div
      className="apt-detail-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`${apartment.name} details`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="apt-detail-panel">
        {/* ── Image hero ─────────────────────────────────────────────────── */}
        <div className="apt-detail-images">
          <img
            src={apartment.images[imgIdx]}
            alt={`${apartment.name} photo ${imgIdx + 1}`}
            className="apt-detail-hero-img"
          />
          {/* Nav arrows */}
          {apartment.images.length > 1 && (
            <>
              <button className="apt-detail-img-nav apt-detail-img-prev" onClick={prevImg} aria-label="Previous photo">
                <ChevronLeft size={20} />
              </button>
              <button className="apt-detail-img-nav apt-detail-img-next" onClick={nextImg} aria-label="Next photo">
                <ChevronRight size={20} />
              </button>
            </>
          )}
          {/* Dots */}
          <div className="apt-detail-dots">
            {apartment.images.map((_, i) => (
              <button
                key={i}
                className={`apt-detail-dot ${i === imgIdx ? 'apt-detail-dot-active' : ''}`}
                onClick={() => setImgIdx(i)}
                aria-label={`Photo ${i + 1}`}
              />
            ))}
          </div>
          {/* Source badge */}
          <a
            href={apartment.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="apt-source-badge"
            aria-label={`View on ${apartment.sourceName}`}
          >
            <ExternalLink size={11} />
            {apartment.sourceName}
          </a>
          {/* AI score */}
          <div className="apt-detail-score-badge">
            <span className="apt-detail-score-num" style={{
              color: apartment.aiMatchScore >= 80 ? '#22c55e' : apartment.aiMatchScore >= 60 ? '#f59e0b' : '#ef4444'
            }}>
              {apartment.aiMatchScore}
            </span>
            <span className="apt-detail-score-label">match</span>
          </div>
          {/* Close button */}
          <button className="apt-detail-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* ── Scrollable body ─────────────────────────────────────────────── */}
        <div className="apt-detail-body">
          {/* Header */}
          <div className="apt-detail-header">
            <div className="apt-detail-title-group">
              <h2 className="apt-detail-name">{apartment.name}</h2>
              <p className="apt-detail-address">
                <MapPin size={13} />
                {apartment.address}, {apartment.city}, {apartment.state} {apartment.zip}
              </p>
            </div>
            <div className="apt-detail-price-group">
              <span className="apt-detail-price">${lowestPrice.toLocaleString()}</span>
              {lowestPrice !== highestPrice && (
                <span className="apt-detail-price-range"> – ${highestPrice.toLocaleString()}</span>
              )}
              <span className="apt-detail-price-unit">/mo</span>
            </div>
          </div>

          {/* Bookmark + View Full Listing */}
          <div className="apt-detail-cta-row">
            <a
              href={apartment.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary apt-detail-cta-primary"
              id={`detail-view-${apartment.id}`}
            >
              <ExternalLink size={15} />
              View Full Listing
            </a>
            <button
              id={`detail-bookmark-${apartment.id}`}
              className={`btn ${bookmarked ? 'btn-bookmarked' : 'btn-ghost'} apt-detail-cta-save`}
              onClick={handleBookmark}
            >
              <Heart size={15} fill={bookmarked ? '#ff6b6b' : 'none'} />
              {bookmarked ? 'Saved' : 'Save'}
            </button>
          </div>

          {/* Filter match badges */}
          {(apartment.matchedFilters.length > 0 || apartment.unmatchedFilters.length > 0) && (
            <div className="apt-detail-section">
              <div className="filter-match-row">
                {apartment.matchedFilters.map(f => (
                  <span key={f} className="filter-match-badge filter-match-yes">
                    <CheckCircle2 size={12} /> {f}
                  </span>
                ))}
                {apartment.unmatchedFilters.map(f => (
                  <span key={f} className="filter-match-badge filter-match-no">
                    <XCircle size={12} /> {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI description */}
          <div className="apt-detail-section apt-ai-section">
            <div className="apt-ai-header">
              <Sparkles size={15} className="apt-ai-icon" />
              <span className="apt-ai-title">Why this matches you</span>
            </div>
            <p className="apt-ai-desc">{apartment.aiDescription}</p>
          </div>

          {/* Hidden costs */}
          <div className="apt-detail-section apt-hidden-costs">
            <div className="hidden-costs-header">
              <AlertTriangle size={16} className="hidden-costs-icon" />
              <span className="hidden-costs-title">Hidden Costs Breakdown</span>
            </div>
            <div className="hidden-costs-grid">
              <div className="cost-item">
                <span className="cost-label">Security Deposit</span>
                <span className="cost-value">${apartment.hiddenCosts.securityDeposit.toLocaleString()} <span className="cost-freq">one-time</span></span>
              </div>
              <div className="cost-item">
                <span className="cost-label">Application Fee</span>
                <span className="cost-value">${apartment.hiddenCosts.applicationFee} <span className="cost-freq">one-time</span></span>
              </div>
              {apartment.hiddenCosts.requiredInsurance && (
                <div className="cost-item cost-item-warn">
                  <span className="cost-label">Required Insurance</span>
                  <span className="cost-value">~${apartment.hiddenCosts.requiredInsurance}/mo</span>
                </div>
              )}
              {apartment.hiddenCosts.utilityEstimate && (
                <div className="cost-item cost-item-warn">
                  <span className="cost-label">Utility Estimate</span>
                  <span className="cost-value">~${apartment.hiddenCosts.utilityEstimate}/mo</span>
                </div>
              )}
              {apartment.hiddenCosts.parkingFee && (
                <div className="cost-item cost-item-warn">
                  <span className="cost-label">Parking Fee</span>
                  <span className="cost-value">${apartment.hiddenCosts.parkingFee}/mo</span>
                </div>
              )}
              {apartment.hiddenCosts.petFee && (
                <div className="cost-item">
                  <span className="cost-label">Pet Fee</span>
                  <span className="cost-value">${apartment.hiddenCosts.petFee}/mo</span>
                </div>
              )}
              {apartment.hiddenCosts.petDeposit && (
                <div className="cost-item">
                  <span className="cost-label">Pet Deposit</span>
                  <span className="cost-value">${apartment.hiddenCosts.petDeposit} <span className="cost-freq">one-time</span></span>
                </div>
              )}
            </div>
            <div className="cost-total">
              <span className="cost-total-label">Est. True Monthly Cost</span>
              <span className="cost-total-value">
                ${(
                  lowestPrice +
                  (apartment.hiddenCosts.requiredInsurance ?? 0) +
                  (apartment.hiddenCosts.utilityEstimate ?? 0) +
                  (apartment.hiddenCosts.parkingFee ?? 0)
                ).toLocaleString()}+/mo
              </span>
            </div>
          </div>

          {/* Amenities */}
          <div className="apt-detail-section apt-collapsible">
            <button
              id={`detail-amenities-${apartment.id}`}
              className="collapsible-trigger"
              onClick={() => setAmenitiesOpen(o => !o)}
              aria-expanded={amenitiesOpen}
            >
              <span>Amenities ({apartment.amenities.length})</span>
              {amenitiesOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {amenitiesOpen && (
              <div className="collapsible-body">
                <ul className="amenities-list">
                  {apartment.amenities.map(a => (
                    <li key={a} className="amenity-item">
                      <CheckCircle2 size={13} className="amenity-check" /> {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Floor plans */}
          <div className="apt-detail-section apt-collapsible">
            <button
              id={`detail-floors-${apartment.id}`}
              className="collapsible-trigger"
              onClick={() => setFloorOpen(o => !o)}
              aria-expanded={floorOpen}
            >
              <span>Floor Plans & Pricing</span>
              {floorOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {floorOpen && (
              <div className="collapsible-body">
                <table className="floor-table" aria-label="Floor plans">
                  <thead>
                    <tr>
                      <th>Plan</th><th>Sq Ft</th><th>Rent/mo</th><th>Availability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apartment.floorPlans.map(fp => (
                      <tr key={fp.name} className={!fp.available ? 'floor-row-unavailable' : ''}>
                        <td>{fp.name}</td>
                        <td>{fp.sqft.toLocaleString()}</td>
                        <td className="floor-price">${fp.price.toLocaleString()}</td>
                        <td>
                          <span className={`avail-badge ${fp.available ? 'avail-yes' : 'avail-no'}`}>
                            {fp.available ? 'Available' : 'Waitlist'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Community reviews */}
          {apartment.forumQuotes && apartment.forumQuotes.length > 0 && (
            <div className="apt-detail-section apt-collapsible">
              <button
                id={`detail-quotes-${apartment.id}`}
                className="collapsible-trigger"
                onClick={() => setQuotesOpen(o => !o)}
                aria-expanded={quotesOpen}
              >
                <span>Community Reviews ({apartment.forumQuotes.length})</span>
                {quotesOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {quotesOpen && (
                <div className="collapsible-body quotes-body">
                  {apartment.forumQuotes.map((q, i) => (
                    <div key={i} className="quote-card">
                      <div className="quote-header">
                        <span className="quote-author">{q.author}</span>
                        <span className="quote-source">{q.source}</span>
                        {q.rating && (
                          <span className="quote-rating">
                            {Array.from({ length: q.rating }).map((_, i) => (
                              <Star key={i} size={11} fill="#f59e0b" stroke="none" />
                            ))}
                          </span>
                        )}
                      </div>
                      <p className="quote-body">"{q.body}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Contact */}
          <div className="apt-detail-section apt-contact">
            {apartment.contactPhone && (
              <a href={`tel:${apartment.contactPhone}`} className="contact-item">
                <Phone size={14} /> {apartment.contactPhone}
              </a>
            )}
            {apartment.contactEmail && (
              <a href={`mailto:${apartment.contactEmail}`} className="contact-item">
                <Mail size={14} /> {apartment.contactEmail}
              </a>
            )}
            {apartment.contactWebsite && (
              <a href={apartment.contactWebsite} target="_blank" rel="noopener noreferrer" className="contact-item">
                <Globe size={14} /> Website
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
