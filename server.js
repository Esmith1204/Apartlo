import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Initialize Google Gen AI with key from environment variables
const aiStudio = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/search-housing', async (req, res) => {
  try {
    const { location, maxBudget, bedrooms, query, petsAllowed, parkingRequired } = req.body;

    if (!location) {
      return res.status(400).json({ error: 'Location is required' });
    }

    // 1. Build search query for Tavily
    let searchQuery = `housing apartments for rent in ${location}`;
    if (maxBudget) {
      searchQuery += ` up to $${maxBudget}`;
    }
    if (bedrooms !== undefined) {
      searchQuery += ` ${bedrooms === 0 ? 'studio' : `${bedrooms} bedroom`}`;
    }
    if (query) {
      searchQuery += ` matching ${query}`;
    }
    searchQuery += ` listed recently`;

    console.log(`Executing Tavily search with query: "${searchQuery}"`);

    // 2. Fetch live listings from Tavily
    const searchResponse = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query: searchQuery,
        search_depth: "advanced",
        include_answer: false
      })
    });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('Tavily API error:', errorText);
      throw new Error(`Tavily API returned status ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    const webContext = (searchData.results || [])
      .map((r, i) => `[Listing #${i+1}]\nSource URL: ${r.url}\nTitle: ${r.title}\nContent: ${r.content}`)
      .join("\n\n");

    if (!webContext.trim()) {
      console.log('No Tavily web results found.');
      return res.json({ listings: [] });
    }

    console.log(`Found ${searchData.results?.length || 0} results from Tavily. Structuring with Gemini 2.5 Flash...`);

    // 3. Define JSON Schema for Gemini
    const listingSchema = {
      type: Type.OBJECT,
      properties: {
        listings: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Name of the apartment complex or listing title" },
              address: { type: Type.STRING, description: "Street address" },
              city: { type: Type.STRING, description: "City name" },
              state: { type: Type.STRING, description: "State abbreviation" },
              zip: { type: Type.STRING, description: "Zip code" },
              price: { type: Type.INTEGER, description: "Monthly rent price (numbers only)" },
              bedrooms: { type: Type.INTEGER, description: "Number of bedrooms (0 for studio)" },
              bathrooms: { type: Type.INTEGER, description: "Number of bathrooms" },
              sqft: { type: Type.INTEGER, description: "Square footage" },
              url: { type: Type.STRING, description: "Listing source URL" },
              sourceName: { type: Type.STRING, description: "Listing source site name (e.g. Apartments.com, Zillow, Craigslist)" },
              amenities: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array of key amenities (e.g. In-unit Laundry, Pool, Parking, etc.)"
              },
              petsAllowed: { type: Type.BOOLEAN, description: "Are pets allowed?" },
              parkingIncluded: { type: Type.BOOLEAN, description: "Is parking included in the rent?" },
              utilitiesIncluded: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of utilities included in the base rent (e.g. Water, Trash)"
              },
              aiDescription: { type: Type.STRING, description: "A 2-3 sentence summary of why this listing fits or does not fit the search criteria" }
            },
            required: ["name", "address", "city", "state", "price", "url"]
          }
        }
      }
    };

    // 4. Let Gemini parse the Tavily results into our schema
    const aiResponse = await aiStudio.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Extract all available valid housing/apartment listings from this web data. Ensure you extract the correct direct Source URL from the web data matching the listing. Keep details like price, address, and amenities accurate based on the context. If price is not mentioned, infer it or skip the listing.\n\nWeb Data:\n${webContext}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: listingSchema,
        systemInstruction: "You are an expert real estate data parser. Extract real listings from the search data. Do not make up listings. If multiple listings exist, extract them all. If information is missing, infer it cleanly or omit the listing if it lacks a name, price, or url."
      }
    });

    const parsedData = JSON.parse(aiResponse.text);
    console.log(`Gemini parsed ${parsedData.listings?.length || 0} listings.`);
    
    // 5. Enrich listings with standard attributes needed by React App
    const enrichedListings = (parsedData.listings || []).map((listing, index) => {
      // Unsplash mock images for premium styling
      const PLACEHOLDER_IMAGES = [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
        'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800&q=80',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
        'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&q=80'
      ];
      const img1 = PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length];
      const img2 = PLACEHOLDER_IMAGES[(index + 1) % PLACEHOLDER_IMAGES.length];
      const img3 = PLACEHOLDER_IMAGES[(index + 2) % PLACEHOLDER_IMAGES.length];

      const lowPrice = listing.price || 1200;
      const bedroomsCount = listing.bedrooms !== undefined ? listing.bedrooms : 1;
      const bathroomsCount = listing.bathrooms !== undefined ? listing.bathrooms : 1;
      
      const mappedListing = {
        id: `apt-live-${index}-${Date.now()}`,
        name: listing.name || "Apartment Listing",
        address: listing.address || "Street Address",
        city: listing.city || location,
        state: listing.state || "OH",
        zip: listing.zip || "",
        lat: 40.0012 + (Math.random() - 0.5) * 0.02, // slightly offset default center
        lng: -83.0183 + (Math.random() - 0.5) * 0.02,
        images: [img1, img2, img3],
        sourceUrl: listing.url || "https://www.apartments.com",
        sourceName: listing.sourceName || "Apartments.com",
        floorPlans: [
          {
            name: bedroomsCount === 0 ? "Studio" : `${bedroomsCount} BR / ${bathroomsCount} BA`,
            sqft: listing.sqft || 650,
            price: lowPrice,
            available: true
          }
        ],
        hiddenCosts: {
          securityDeposit: lowPrice, // default: 1 month rent
          applicationFee: 50,
          utilityEstimate: listing.utilitiesIncluded && listing.utilitiesIncluded.length > 0 ? 0 : 80,
        },
        amenities: listing.amenities && listing.amenities.length > 0 ? listing.amenities : ["Air Conditioning", "In-unit Laundry", "Dishwasher"],
        tags: [
          { label: bedroomsCount === 0 ? "Studio" : `${bedroomsCount} Bed`, icon: "🛏" },
          { label: `${bathroomsCount} Bath`, icon: "🛁" },
          ...(listing.petsAllowed ? [{ label: "Pet Friendly", icon: "🐾" }] : []),
          ...(listing.parkingIncluded ? [{ label: "Parking Included", icon: "🚗" }] : [])
        ],
        leaseLength: "12 months",
        petsAllowed: !!listing.petsAllowed,
        parkingIncluded: !!listing.parkingIncluded,
        utilitiesIncluded: listing.utilitiesIncluded || [],
        aiDescription: listing.aiDescription || "This listing has been retrieved through live web search matching your criteria.",
        matchedFilters: [],
        unmatchedFilters: [],
        forumQuotes: [
          {
            author: "u/ApartmentSeeker",
            body: "Great location, looks close to local spots.",
            source: "Reddit r/LocalCommunity"
          }
        ]
      };

      // Calculate AI match score relative to input filters
      let score = 85;
      const matched = [];
      const unmatched = [];

      if (maxBudget) {
        if (lowPrice <= maxBudget) {
          score += 5;
          matched.push("budget");
        } else {
          score -= 20;
          unmatched.push("budget");
        }
      }
      if (petsAllowed !== undefined) {
        if (petsAllowed === mappedListing.petsAllowed) {
          score += 5;
          matched.push("petsAllowed");
        } else if (petsAllowed) {
          score -= 15;
          unmatched.push("petsAllowed");
        }
      }
      if (parkingRequired !== undefined) {
        if (parkingRequired === mappedListing.parkingIncluded) {
          score += 5;
          matched.push("parkingRequired");
        } else if (parkingRequired) {
          score -= 10;
          unmatched.push("parkingRequired");
        }
      }
      if (bedrooms !== undefined) {
        if (bedrooms === bedroomsCount) {
          score += 5;
          matched.push("bedrooms");
        } else {
          score -= 15;
          unmatched.push("bedrooms");
        }
      }

      mappedListing.aiMatchScore = Math.min(100, Math.max(0, score));
      mappedListing.matchedFilters = matched;
      mappedListing.unmatchedFilters = unmatched;

      return mappedListing;
    });

    // Sort by AI score
    enrichedListings.sort((a, b) => b.aiMatchScore - a.aiMatchScore);

    res.json({ listings: enrichedListings });

  } catch (error) {
    console.error('Error handling housing search:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
