import { useState } from 'react';
import { SlidersHorizontal, RotateCcw, Search, DollarSign, Home, Bath, Car, Dog, Zap, Sofa, ChevronDown, ChevronUp } from 'lucide-react';
import type { SearchFilters } from '../../types';

interface FilterPanelProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onSearch: () => void;
  searching?: boolean;
}

export default function FilterPanel({ filters, onChange, onSearch, searching }: FilterPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  const update = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    onChange({ ...filters, [key]: value });
  };

  const reset = () => onChange({ query: filters.query, location: filters.location });

  return (
    <aside className={`filter-panel ${collapsed ? 'filter-panel-collapsed' : ''}`}>
      {/* Header */}
      <div className="filter-header">
        <div className="filter-title">
          <SlidersHorizontal size={18} />
          <span>Filters</span>
          {filters.query && (
            <span className="filter-ai-badge">
              ✦ AI Applied
            </span>
          )}
        </div>
        <div className="filter-header-actions">
          <button className="filter-reset" onClick={reset} title="Reset filters">
            <RotateCcw size={14} />
          </button>
          <button
            className="filter-collapse"
            onClick={() => setCollapsed(c => !c)}
            aria-label={collapsed ? 'Expand filters' : 'Collapse filters'}
          >
            {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="filter-body">
          {/* Budget */}
          <div className="filter-section">
            <label className="filter-section-label">
              <DollarSign size={15} /> Budget (per month)
            </label>
            <div className="filter-row">
              <div className="filter-input-group">
                <span className="filter-prefix">$</span>
                <input
                  id="filter-min-budget"
                  type="number"
                  className="filter-input"
                  placeholder="Min"
                  value={filters.minBudget ?? ''}
                  onChange={e => update('minBudget', e.target.value ? Number(e.target.value) : undefined)}
                  min={0}
                />
              </div>
              <span className="filter-range-sep">–</span>
              <div className="filter-input-group">
                <span className="filter-prefix">$</span>
                <input
                  id="filter-max-budget"
                  type="number"
                  className="filter-input"
                  placeholder="Max"
                  value={filters.maxBudget ?? ''}
                  onChange={e => update('maxBudget', e.target.value ? Number(e.target.value) : undefined)}
                  min={0}
                />
              </div>
            </div>
          </div>

          {/* Bedrooms */}
          <div className="filter-section">
            <label className="filter-section-label"><Home size={15} /> Bedrooms</label>
            <div className="filter-chips">
              {[{ label: 'Studio', val: 0 }, { label: '1', val: 1 }, { label: '2', val: 2 }, { label: '3', val: 3 }, { label: '4+', val: 4 }].map(({ label, val }) => (
                <button
                  key={val}
                  id={`filter-bed-${val}`}
                  className={`filter-chip ${filters.bedrooms === val ? 'filter-chip-active' : ''}`}
                  onClick={() => update('bedrooms', filters.bedrooms === val ? undefined : val)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Bathrooms */}
          <div className="filter-section">
            <label className="filter-section-label"><Bath size={15} /> Bathrooms</label>
            <div className="filter-chips">
              {[1, 2, 3].map(val => (
                <button
                  key={val}
                  id={`filter-bath-${val}`}
                  className={`filter-chip ${filters.bathrooms === val ? 'filter-chip-active' : ''}`}
                  onClick={() => update('bathrooms', filters.bathrooms === val ? undefined : val)}
                >
                  {val}+
                </button>
              ))}
            </div>
          </div>

          {/* Toggle filters */}
          <div className="filter-section">
            <label className="filter-section-label">Preferences</label>
            <div className="filter-toggles">
              {[
                { key: 'petsAllowed', label: 'Pet Friendly', icon: <Dog size={15} /> },
                { key: 'parkingRequired', label: 'Parking', icon: <Car size={15} /> },
                { key: 'utilitiesIncluded', label: 'Utilities Included', icon: <Zap size={15} /> },
                { key: 'furnished', label: 'Furnished', icon: <Sofa size={15} /> },
              ].map(({ key, label, icon }) => {
                const k = key as keyof SearchFilters;
                const active = !!filters[k];
                return (
                  <button
                    key={key}
                    id={`filter-toggle-${key}`}
                    className={`filter-toggle ${active ? 'filter-toggle-active' : ''}`}
                    onClick={() => update(k, active ? undefined : true)}
                  >
                    {icon}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location */}
          <div className="filter-section">
            <label className="filter-section-label" htmlFor="filter-location">📍 Location</label>
            <input
              id="filter-location"
              type="text"
              className="filter-input filter-input-full"
              placeholder="City, campus, or address"
              value={filters.location}
              onChange={e => update('location', e.target.value)}
            />
          </div>

          <button
            id="filter-search-btn"
            className="btn btn-primary btn-full"
            onClick={onSearch}
            disabled={searching}
          >
            {searching ? 'Searching…' : (
              <><Search size={16} /> Search Apartments</>
            )}
          </button>
        </div>
      )}
    </aside>
  );
}
