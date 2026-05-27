import { Link } from 'react-router-dom';
import { Shield, Eye, Zap, GraduationCap, ArrowRight, Star } from 'lucide-react';
import HeroSearch from '../components/search/HeroSearch';
import ApartmentGrid from '../components/apartments/ApartmentGrid';
import { mockApartments } from '../data/mockApartments';

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: '🔍',
    title: 'Describe what you need',
    desc: 'Type naturally — your budget, bedrooms, pets, location. Our AI understands you.',
  },
  {
    step: '02',
    icon: '✦',
    title: 'AI builds your filters',
    desc: 'Apartlo extracts your preferences automatically. Tweak anything before searching.',
  },
  {
    step: '03',
    icon: '🏠',
    title: 'See the full picture',
    desc: 'Results surface hidden costs, real reviews, and exactly which of your needs each listing meets.',
  },
];

const VALUE_PROPS = [
  {
    icon: <Shield size={24} />,
    title: 'No Hidden Surprises',
    desc: 'Security deposits, insurance requirements, parking fees, utility estimates — we surface it all upfront.',
  },
  {
    icon: <Eye size={24} />,
    title: 'Transparent Costs',
    desc: 'See the true monthly cost of every apartment, not just the advertised rent.',
  },
  {
    icon: <Zap size={24} />,
    title: 'AI-Powered Matching',
    desc: 'Every result is scored against your filters so you know at a glance what fits and what doesn\'t.',
  },
  {
    icon: <GraduationCap size={24} />,
    title: 'Built for Students',
    desc: 'Flexible leases, roommate-friendly options, and campus proximity all built into the search.',
  },
];

export default function LandingPage() {
  const featured = mockApartments.slice(0, 3);

  return (
    <main id="main-content">
      {/* Hero */}
      <HeroSearch />

      {/* How It Works */}
      <section className="section how-it-works" aria-labelledby="how-heading">
        <div className="section-inner">
          <div className="section-label">Simple Process</div>
          <h2 id="how-heading" className="section-title">How Apartlo works</h2>
          <p className="section-subtitle">From search to signed lease in three steps.</p>
          <div className="how-grid">
            {HOW_IT_WORKS.map(step => (
              <div key={step.step} className="how-card">
                <div className="how-step-num">{step.step}</div>
                <div className="how-icon">{step.icon}</div>
                <h3 className="how-title">{step.title}</h3>
                <p className="how-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="section value-props" aria-labelledby="value-heading">
        <div className="section-inner">
          <div className="section-label">Why Apartlo?</div>
          <h2 id="value-heading" className="section-title">Everything students deserve to know</h2>
          <div className="value-grid">
            {VALUE_PROPS.map(vp => (
              <div key={vp.title} className="value-card">
                <div className="value-icon">{vp.icon}</div>
                <h3 className="value-title">{vp.title}</h3>
                <p className="value-desc">{vp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial strip */}
      <section className="section testimonial-strip" aria-label="Student testimonials">
        <div className="section-inner">
          <div className="testimonial-row">
            {[
              { quote: 'Finally found a place that was actually in my budget — because I could see ALL the fees upfront.', author: 'Mia K., Ohio State Junior' },
              { quote: 'The AI filters saved me 3 hours of searching. I just typed what I wanted and it just worked.', author: 'Jordan T., Michigan State Sophomore' },
              { quote: 'I bookmarked 5 places and showed them side-by-side. Best apartment hunting experience I\'ve had.', author: 'Priya S., UNC Senior' },
            ].map(t => (
              <div key={t.author} className="testimonial-card">
                <div className="testimonial-stars">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} fill="#f59e0b" stroke="none" />)}
                </div>
                <p className="testimonial-quote">"{t.quote}"</p>
                <span className="testimonial-author">— {t.author}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="section featured-listings" aria-labelledby="featured-heading">
        <div className="section-inner">
          <div className="section-label">Sample Results</div>
          <h2 id="featured-heading" className="section-title">See what Apartlo finds</h2>
          <p className="section-subtitle">Real apartment data with hidden costs exposed. No account needed to browse.</p>
          <ApartmentGrid apartments={featured} />
          <div className="featured-cta">
            <Link to="/search" id="landing-search-cta" className="btn btn-primary btn-lg">
              Search All Apartments <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="cta-banner" aria-labelledby="cta-heading">
        <div className="cta-banner-inner">
          <h2 id="cta-heading" className="cta-title">Ready to find your next home?</h2>
          <p className="cta-subtitle">Join thousands of students who found their apartment through Apartlo.</p>
          <Link to="/search" id="landing-bottom-cta" className="btn btn-primary btn-lg">
            Start your search <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}
