import { useState } from 'react';
import {
  Heart, ExternalLink, Phone, Mail, Globe, ChevronDown, ChevronUp,
  MapPin, AlertTriangle, CheckCircle2, XCircle, Sparkles, Star
} from 'lucide-react';
import type { Apartment } from '../../types';
import Tag from '../ui/Tag';
import { useBookmarks } from '../../hooks/useBookmarks';
import { useAuth } from '../../hooks/useAuth';

interface ApartmentCardProps {
  apartment: Apartment;
  onAuthRequired?: () => void;
}

function ScoreRing({ score }: { score: number }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div className="score-ring-wrapper" title={`AI Match: ${score}%`}>
      <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
        <circle cx="22" cy="22" r={r} fill="none" stroke="var(--border)" strokeWidth="3" />
        <circle
          cx="22" cy="22" r={r} fill="none"
          stroke={color} strokeWidth="3"
          strokeDasharray={`${fill} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 22 22)"
        />
      </svg>
      <span className="score-ring-text" style={{ color }}>{score}</span>
    </div>
  );
}

export default function ApartmentCard({ apartment, onAuthRequired }: ApartmentCardProps) {
  const [imgIdx, setImgIdx] = useState(0);
  const [amenitiesOpen, setAmenitiesOpen] = useState(false);
  const [floorOpen, setFloorOpen] = useState(false);
  const [quotesOpen, setQuotesOpen] = useState(false);
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();
  const { isAuthenticated } = useAuth();
  const bookmarked = isBookmarked(apartment.id);

  const handleBookmark = () => {
    if (!isAuthenticated) { onAuthRequired?.(); return; }
    if (bookmarked) removeBookmark(apartment.id);
    else addBookmark(apartment.id);
  };

  const lowestPrice = Math.min(...apartment.floorPlans.map(fp => fp.price));
  const highestPrice = Math.max(...apartment.floorPlans.map(fp => fp.price));

  return (
    <article className="apt-card" aria-label={`${apartment.name} apartment listing`}>
      {/* Image carousel */}
      <div className="apt-images">
        <img
          src={apartment.images[imgIdx]}
          alt={`${apartment.name} - photo ${imgIdx + 1}`}
          className="apt-hero-img"
          loading="lazy"
        />
        {/* Dots */}
        <div className="apt-img-dots" aria-label="Image navigation">
          {apartment.images.map((_, i) => (
            <button
              key={i}
              id={`img-dot-${apartment.id}-${i}`}
              className={`img-dot ${i === imgIdx ? 'img-dot-active' : ''}`}
              onClick={() => setImgIdx(i)}
              aria-label={`Photo ${i + 1}`}
            />
          ))}
        </div>
        {/* Score ring */}
        <div className="apt-score-badge">
          <ScoreRing score={apartment.aiMatchScore} />
        </div>
        {/* Bookmark */}
        <button
          id={`bookmark-btn-${apartment.id}`}
          className={`apt-bookmark ${bookmarked ? 'apt-bookmark-active' : ''}`}
          onClick={handleBookmark}
          aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this apartment'}
          aria-pressed={bookmarked}
        >
          <Heart size={18} fill={bookmarked ? '#ff6b6b' : 'none'} />
        </button>
        {/* Source badge */}
        <a
          href={apartment.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="apt-source-badge"
          aria-label={`View on ${apartment.sourceName}`}
        >
          <ExternalLink size={12} />
          {apartment.sourceName}
        </a>
      </div>

      <div className="apt-body">
        {/* Name & location */}
        <div className="apt-header">
          <div>
            <h2 className="apt-name">{apartment.name}</h2>
            <p className="apt-address">
              <MapPin size={13} />
              {apartment.address}, {apartment.city}, {apartment.state} {apartment.zip}
            </p>
          </div>
          <div className="apt-price-range">
            <span className="apt-price">${lowestPrice.toLocaleString()}</span>
            {lowestPrice !== highestPrice && (
              <span className="apt-price-secondary"> – ${highestPrice.toLocaleString()}</span>
            )}
            <span className="apt-price-unit">/mo</span>
          </div>
        </div>

        {/* Map thumbnail */}
        <a
          href={`https://maps.google.com/?q=${encodeURIComponent(apartment.address + ', ' + apartment.city + ' ' + apartment.state)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="apt-map-link"
          aria-label={`View ${apartment.name} on Google Maps`}
        >
          <img
            src={`https://maps.googleapis.com/maps/api/staticmap?center=${apartment.lat},${apartment.lng}&zoom=15&size=600x120&maptype=roadmap&markers=color:0x7c6ff7%7C${apartment.lat},${apartment.lng}&style=element:geometry%7Ccolor:0x1a1a2e&style=element:labels.text.fill%7Ccolor:0xa78bfa`}
            alt={`Map showing location of ${apartment.name}`}
            className="apt-map-img"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="apt-map-overlay">
            <MapPin size={14} /> View on Map
          </div>
        </a>

        {/* Feature tags */}
        <div className="apt-tags" role="list" aria-label="Apartment features">
          {apartment.tags.map(tag => (
            <div key={tag.label} role="listitem">
              <Tag label={tag.label} icon={tag.icon} />
            </div>
          ))}
          <Tag label={apartment.leaseLength} icon="📅" />
          {apartment.incomeRequirement && <Tag label={apartment.incomeRequirement} icon="💼" />}
        </div>

        {/* AI Description */}
        <div className="apt-ai-section">
          <div className="apt-ai-header">
            <Sparkles size={15} className="apt-ai-icon" />
            <span className="apt-ai-title">Why this matches you</span>
          </div>
          <p className="apt-ai-desc">{apartment.aiDescription}</p>
        </div>

        {/* Filter match/miss */}
        {(apartment.matchedFilters.length > 0 || apartment.unmatchedFilters.length > 0) && (
          <div className="apt-filter-match">
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

        {/* ⚠️ Hidden Costs — the core feature */}
        <div className="apt-hidden-costs">
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
          {/* Estimated true monthly total */}
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

        {/* Amenities (collapsible) */}
        <div className="apt-collapsible">
          <button
            id={`amenities-toggle-${apartment.id}`}
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

        {/* Floor plans (collapsible) */}
        <div className="apt-collapsible">
          <button
            id={`floorplans-toggle-${apartment.id}`}
            className="collapsible-trigger"
            onClick={() => setFloorOpen(o => !o)}
            aria-expanded={floorOpen}
          >
            <span>Floor Plans &amp; Pricing</span>
            {floorOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {floorOpen && (
            <div className="collapsible-body">
              <table className="floor-table" aria-label="Floor plans and pricing">
                <thead>
                  <tr>
                    <th>Plan</th>
                    <th>Sq Ft</th>
                    <th>Rent / mo</th>
                    <th>Availability</th>
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

        {/* Forum quotes (collapsible, stretch feature) */}
        {apartment.forumQuotes && apartment.forumQuotes.length > 0 && (
          <div className="apt-collapsible">
            <button
              id={`quotes-toggle-${apartment.id}`}
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

        {/* Contact info */}
        <div className="apt-contact">
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

        {/* CTA row */}
        <div className="apt-cta-row">
          <a
            href={apartment.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary apt-cta-btn"
            id={`view-listing-${apartment.id}`}
          >
            <ExternalLink size={15} /> View Full Listing
          </a>
          <button
            id={`bookmark-cta-${apartment.id}`}
            className={`btn ${bookmarked ? 'btn-bookmarked' : 'btn-ghost'} apt-bookmark-btn`}
            onClick={handleBookmark}
          >
            <Heart size={15} fill={bookmarked ? '#ff6b6b' : 'none'} />
            {bookmarked ? 'Bookmarked' : 'Save'}
          </button>
        </div>
      </div>
    </article>
  );
}
