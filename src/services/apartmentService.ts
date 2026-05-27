import type { Apartment, SearchFilters } from '../types';
import { mockApartments } from '../data/mockApartments';

/**
 * Apartment Search Service
 *
 * In production, replace the body of `searchApartments` with a call to your
 * backend API that scrapes / queries Apartments.com, Zillow, etc.
 *
 * Example stub:
 *   const response = await fetch('/api/search', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify(filters),
 *   });
 *   return response.json() as Apartment[];
 */
export async function searchApartments(filters: SearchFilters): Promise<Apartment[]> {
  try {
    const response = await fetch('/api/search-housing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filters),
    });

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const data = await response.json();
    return data.listings as Apartment[];
  } catch (error) {
    console.error('Error fetching live apartments, falling back to mock data:', error);

    // Simulate standard latency
    await new Promise(r => setTimeout(r, 1000));

    // Fallback: Filter and score mock apartments locally
    let results = [...mockApartments];

    if (filters.location) {
      const loc = filters.location.toLowerCase();
      results = results.filter(
        apt =>
          apt.city.toLowerCase().includes(loc) ||
          apt.state.toLowerCase().includes(loc) ||
          apt.address.toLowerCase().includes(loc) ||
          apt.name.toLowerCase().includes(loc)
      );
    }

    results = results.map(apt => {
      let score = apt.aiMatchScore;

      // Budget check
      const lowestPrice = Math.min(...apt.floorPlans.map(fp => fp.price));
      if (filters.maxBudget) {
        if (lowestPrice <= filters.maxBudget) score = Math.min(score + 5, 100);
        else score = Math.max(score - 20, 0);
      }

      // Pets
      if (filters.petsAllowed && apt.petsAllowed) score = Math.min(score + 5, 100);
      if (filters.petsAllowed && !apt.petsAllowed) score = Math.max(score - 15, 0);

      // Parking
      if (filters.parkingRequired && apt.parkingIncluded) score = Math.min(score + 3, 100);

      // Utilities
      if (filters.utilitiesIncluded && apt.utilitiesIncluded.length > 0) score = Math.min(score + 3, 100);

      return { ...apt, aiMatchScore: score };
    });

    // Sort by AI match score descending
    results.sort((a, b) => b.aiMatchScore - a.aiMatchScore);

    return results;
  }
}
