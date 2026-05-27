import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M16 3L2 14h4v15h8v-9h4v9h8V14h4L16 3z" fill="url(#footerLogoGrad)" />
            <circle cx="24" cy="24" r="6" fill="#0f0e17" />
            <path d="M24 20.5c-1.5-1.5-4 .5-4 2.5 0 1.5 1.5 2.5 4 4 2.5-1.5 4-2.5 4-4 0-2-2.5-4-4-2.5z" fill="#ff6b6b" />
            <defs>
              <linearGradient id="footerLogoGrad" x1="2" y1="3" x2="30" y2="29" gradientUnits="userSpaceOnUse">
                <stop stopColor="#7c6ff7" />
                <stop offset="1" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
          </svg>
          <span className="footer-wordmark">Apartlo</span>
        </div>
        <p className="footer-tagline">
          Making student housing simpler, one search at a time.
        </p>
        <div className="footer-links">
          <Link to="/" className="footer-link">Home</Link>
          <Link to="/search" className="footer-link">Search</Link>
          <Link to="/dashboard" className="footer-link">Dashboard</Link>
          <Link to="/bookmarks" className="footer-link">Bookmarks</Link>
        </div>
        <div className="footer-bottom">
          <p className="footer-copy">
            Made with <Heart size={12} className="footer-heart" /> for college students everywhere
          </p>
          <div className="footer-socials">
            <a href="#" aria-label="GitHub" className="footer-social-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
            <a href="#" aria-label="X (Twitter)" className="footer-social-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
