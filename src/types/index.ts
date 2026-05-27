// ─── Apartment ────────────────────────────────────────────────────────────────

export interface FloorPlan {
  name: string;          // e.g. "Studio", "1BR/1BA"
  sqft: number;
  price: number;         // monthly rent
  available: boolean;
}

export interface HiddenCosts {
  securityDeposit: number;        // one-time
  applicationFee: number;         // one-time
  requiredInsurance?: number;     // /month estimate
  utilityEstimate?: number;       // /month estimate (if not included)
  parkingFee?: number;            // /month if not free
  petFee?: number;                // /month or one-time
  petDeposit?: number;            // one-time
}

export interface Apartment {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  images: string[];               // array of image URLs
  sourceUrl: string;              // link back to listing
  sourceName: string;             // e.g. "Apartments.com"
  contactPhone?: string;
  contactEmail?: string;
  contactWebsite?: string;

  floorPlans: FloorPlan[];
  hiddenCosts: HiddenCosts;
  amenities: string[];
  tags: ApartmentTag[];

  leaseLength: string;            // e.g. "12 months", "6–12 months"
  incomeRequirement?: string;     // e.g. "2.5× monthly rent"
  petsAllowed: boolean;
  parkingIncluded: boolean;
  utilitiesIncluded: string[];    // e.g. ["Water", "Trash"]

  aiMatchScore: number;           // 0–100
  aiDescription: string;          // why this suits the user
  matchedFilters: string[];        // filter keys that matched
  unmatchedFilters: string[];      // filter keys that didn't

  forumQuotes?: ForumQuote[];
}

export interface ApartmentTag {
  label: string;
  icon: string;   // emoji or icon name
}

export interface ForumQuote {
  author: string;
  body: string;
  source: string; // e.g. "Reddit r/OSU"
  rating?: number; // 1–5
}

// ─── Search & Filters ─────────────────────────────────────────────────────────

export interface SearchFilters {
  query: string;            // raw user input
  location: string;         // city, state, or "near [campus]"
  minBudget?: number;
  maxBudget?: number;
  bedrooms?: number;         // 0 = studio
  bathrooms?: number;
  petsAllowed?: boolean;
  parkingRequired?: boolean;
  utilitiesIncluded?: boolean;
  furnished?: boolean;
  maxLeaseMonths?: number;
  maxSecurityDeposit?: number;
}

// ─── User & Auth ──────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  college?: string;
  savedFilters?: SearchFilters;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// ─── Bookmarks ────────────────────────────────────────────────────────────────

export interface Bookmark {
  apartmentId: string;
  savedAt: string;    // ISO date string
}
