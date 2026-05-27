import { useState, useRef, useEffect } from 'react';
import {
  DollarSign, Home, Bath, Dog, Car, Zap, Sofa, MapPin, Calendar, X, Pencil, Check,
} from 'lucide-react';
import type { SearchFilters } from '../../types';

interface PillDef {
  key: keyof SearchFilters;
  icon: React.ReactNode;
  label: string;
  getValue: (f: SearchFilters) => string | null;
  type: 'budget' | 'chip' | 'toggle' | 'text' | 'number';
  chipOptions?: { label: string; val: number }[];
}

const PILL_DEFS: PillDef[] = [
  {
    key: 'maxBudget',
    icon: <DollarSign size={14} />,
    label: 'Budget',
    getValue: (f) =>
      f.maxBudget ? `Up to $${f.maxBudget.toLocaleString()}/mo` : null,
    type: 'number',
  },
  {
    key: 'bedrooms',
    icon: <Home size={14} />,
    label: 'Bedrooms',
    getValue: (f) =>
      f.bedrooms !== undefined
        ? f.bedrooms === 0 ? 'Studio' : `${f.bedrooms} Bed${f.bedrooms > 1 ? 's' : ''}`
        : null,
    type: 'chip',
    chipOptions: [
      { label: 'Studio', val: 0 },
      { label: '1', val: 1 },
      { label: '2', val: 2 },
      { label: '3', val: 3 },
      { label: '4+', val: 4 },
    ],
  },
  {
    key: 'bathrooms',
    icon: <Bath size={14} />,
    label: 'Bathrooms',
    getValue: (f) =>
      f.bathrooms !== undefined ? `${f.bathrooms}+ Bath${f.bathrooms > 1 ? 's' : ''}` : null,
    type: 'chip',
    chipOptions: [
      { label: '1+', val: 1 },
      { label: '2+', val: 2 },
      { label: '3+', val: 3 },
    ],
  },
  {
    key: 'location',
    icon: <MapPin size={14} />,
    label: 'Location',
    getValue: (f) => (f.location ? f.location : null),
    type: 'text',
  },
  {
    key: 'petsAllowed',
    icon: <Dog size={14} />,
    label: 'Pet Friendly',
    getValue: (f) => (f.petsAllowed ? 'Pet Friendly' : null),
    type: 'toggle',
  },
  {
    key: 'parkingRequired',
    icon: <Car size={14} />,
    label: 'Parking',
    getValue: (f) => (f.parkingRequired ? 'Parking' : null),
    type: 'toggle',
  },
  {
    key: 'utilitiesIncluded',
    icon: <Zap size={14} />,
    label: 'Utilities Included',
    getValue: (f) => (f.utilitiesIncluded ? 'Utilities Incl.' : null),
    type: 'toggle',
  },
  {
    key: 'furnished',
    icon: <Sofa size={14} />,
    label: 'Furnished',
    getValue: (f) => (f.furnished ? 'Furnished' : null),
    type: 'toggle',
  },
  {
    key: 'maxLeaseMonths',
    icon: <Calendar size={14} />,
    label: 'Lease Length',
    getValue: (f) =>
      f.maxLeaseMonths ? `≤ ${f.maxLeaseMonths} mo lease` : null,
    type: 'number',
  },
];

interface FloatingFilterPillsProps {
  filters: SearchFilters;
  onChange: (f: SearchFilters) => void;
  visible: boolean;
  compact?: boolean;
}

export default function FloatingFilterPills({
  filters,
  onChange,
  visible,
  compact = false,
}: FloatingFilterPillsProps) {
  const activePills = PILL_DEFS.filter((p) => p.getValue(filters) !== null);
  const inactivePills = PILL_DEFS.filter((p) => p.getValue(filters) === null);

  const update = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) =>
    onChange({ ...filters, [key]: value });

  const remove = (key: keyof SearchFilters) => {
    const next = { ...filters };
    delete next[key];
    onChange(next);
  };

  if (!visible) return null;

  return (
    <div className={`fp-container ${compact ? 'fp-container-compact' : ''}`} aria-label="Your active filters">
      {/* Active pills */}
      <div className="fp-active-area">
        {activePills.map((pill, idx) => (
          <ActivePill
            key={String(pill.key)}
            pill={pill}
            filters={filters}
            index={idx}
            onUpdate={update}
            onRemove={remove}
          />
        ))}
      </div>

      {/* Dormant pills to add — hidden in compact mode */}
      {!compact && inactivePills.length > 0 && (
        <div className="fp-inactive-area">
          <span className="fp-add-label">Add filter:</span>
          {inactivePills.map((pill) => (
            <button
              key={String(pill.key)}
              className="fp-inactive-pill"
              onClick={() => {
                if (pill.type === 'toggle') {
                  update(pill.key, true as SearchFilters[typeof pill.key]);
                } else if (pill.type === 'chip' && pill.chipOptions) {
                  update(pill.key, pill.chipOptions[0].val as SearchFilters[typeof pill.key]);
                }
                // text / number → the pill will open in edit mode
              }}
              aria-label={`Add ${pill.label} filter`}
            >
              {pill.icon}
              {pill.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Single active pill with inline edit ──────────────────────────────────── */
interface ActivePillProps {
  pill: PillDef;
  filters: SearchFilters;
  index: number;
  onUpdate: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void;
  onRemove: (key: keyof SearchFilters) => void;
}

function ActivePill({ pill, filters, index, onUpdate, onRemove }: ActivePillProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-open edit for non-toggle pills if value is empty/placeholder
  const currentVal = pill.getValue(filters);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commitDraft = () => {
    if (pill.type === 'number' || pill.type === 'budget') {
      const num = parseInt(draft.replace(/[^0-9]/g, ''), 10);
      if (!isNaN(num) && num > 0) {
        onUpdate(pill.key, num as SearchFilters[typeof pill.key]);
      }
    } else if (pill.type === 'text') {
      if (draft.trim()) onUpdate(pill.key, draft.trim() as SearchFilters[typeof pill.key]);
      else onRemove(pill.key);
    }
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitDraft();
    if (e.key === 'Escape') setEditing(false);
  };

  const animStyle: React.CSSProperties = {
    animationDelay: `${index * 80}ms`,
  };

  return (
    <div className="fp-pill-wrap" style={animStyle}>
      <div className={`fp-pill ${editing ? 'fp-pill-editing' : ''}`}>
        <span className="fp-pill-icon">{pill.icon}</span>

        {/* Chip-style editing */}
        {editing && pill.type === 'chip' && pill.chipOptions ? (
          <div className="fp-chip-options">
            {pill.chipOptions.map((opt) => (
              <button
                key={opt.val}
                className={`fp-chip-opt ${filters[pill.key] === opt.val ? 'fp-chip-opt-active' : ''}`}
                onClick={() => {
                  onUpdate(pill.key, opt.val as SearchFilters[typeof pill.key]);
                  setEditing(false);
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        ) : editing && (pill.type === 'number' || pill.type === 'text') ? (
          <div className="fp-pill-input-row">
            <input
              ref={inputRef}
              className="fp-pill-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                pill.type === 'number'
                  ? pill.key === 'maxBudget' ? '1500' : '12'
                  : 'City or campus…'
              }
              aria-label={`Edit ${pill.label}`}
            />
            <button className="fp-pill-confirm" onClick={commitDraft} aria-label="Confirm">
              <Check size={12} />
            </button>
          </div>
        ) : (
          <button
            className="fp-pill-value"
            onClick={() => {
              if (pill.type !== 'toggle') {
                setDraft(
                  pill.type === 'number'
                    ? String((filters[pill.key] as number | undefined) ?? '')
                    : String(filters[pill.key] ?? '')
                );
                setEditing(true);
              }
            }}
            aria-label={pill.type !== 'toggle' ? `Edit ${pill.label}` : undefined}
          >
            {currentVal}
            {pill.type !== 'toggle' && <Pencil size={10} className="fp-edit-hint" />}
          </button>
        )}

        <button
          className="fp-pill-remove"
          onClick={() => onRemove(pill.key)}
          aria-label={`Remove ${pill.label} filter`}
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}
