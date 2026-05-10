// Approximate driving distances (miles) from our Duluth base
// (Great Wall Supermarket, ~5150 Buford Hwy, Doraville/Duluth border).
// Distances are rough estimates — used for instant on-site quoting only.
// Update or expand this table as the business grows.

export const FREE_RADIUS_MILES = 20;
export const PER_MILE_FEE = 2;

export const ZIP_DISTANCES: Record<string, { city: string; miles: number }> = {
  // Duluth core
  '30096': { city: 'Duluth', miles: 1 },
  '30097': { city: 'Duluth / Johns Creek', miles: 4 },
  '30099': { city: 'Duluth', miles: 2 },

  // Johns Creek / Suwanee / Alpharetta
  '30022': { city: 'Johns Creek', miles: 9 },
  '30024': { city: 'Suwanee', miles: 7 },
  '30005': { city: 'Alpharetta', miles: 12 },
  '30009': { city: 'Alpharetta', miles: 14 },
  '30004': { city: 'Alpharetta / Milton', miles: 18 },
  '30076': { city: 'Roswell', miles: 16 },
  '30075': { city: 'Roswell', miles: 19 },

  // Lawrenceville / Buford / Cumming
  '30043': { city: 'Lawrenceville', miles: 8 },
  '30044': { city: 'Lawrenceville', miles: 10 },
  '30045': { city: 'Lawrenceville', miles: 13 },
  '30046': { city: 'Lawrenceville', miles: 11 },
  '30518': { city: 'Buford', miles: 12 },
  '30519': { city: 'Buford', miles: 14 },
  '30041': { city: 'Cumming', miles: 17 },
  '30040': { city: 'Cumming', miles: 21 },

  // Norcross / Peachtree Corners
  '30093': { city: 'Norcross', miles: 6 },
  '30071': { city: 'Norcross', miles: 9 },
  '30092': { city: 'Peachtree Corners', miles: 8 },

  // Doraville / Chamblee / Brookhaven / Tucker
  '30340': { city: 'Doraville', miles: 12 },
  '30341': { city: 'Chamblee', miles: 14 },
  '30319': { city: 'Brookhaven', miles: 18 },
  '30084': { city: 'Tucker', miles: 14 },
  '30087': { city: 'Stone Mountain', miles: 20 },

  // Sandy Springs / Dunwoody
  '30338': { city: 'Dunwoody', miles: 17 },
  '30360': { city: 'Dunwoody / Sandy Springs', miles: 16 },
  '30328': { city: 'Sandy Springs', miles: 21 },
  '30342': { city: 'Sandy Springs', miles: 19 },

  // Marietta / East Cobb
  '30062': { city: 'East Cobb / Marietta', miles: 24 },
  '30068': { city: 'East Cobb', miles: 25 },
  '30067': { city: 'Marietta', miles: 26 },
  '30066': { city: 'Marietta', miles: 25 },
  '30064': { city: 'Marietta', miles: 30 },
  '30060': { city: 'Marietta', miles: 30 },

  // Decatur / Atlanta intown
  '30030': { city: 'Decatur', miles: 24 },
  '30033': { city: 'Decatur', miles: 22 },
  '30032': { city: 'Decatur', miles: 24 },
  '30307': { city: 'Atlanta - Inman Park', miles: 26 },
  '30308': { city: 'Atlanta - Midtown', miles: 28 },
  '30309': { city: 'Atlanta - Midtown', miles: 29 },
  '30312': { city: 'Atlanta - Downtown', miles: 30 },
  '30305': { city: 'Atlanta - Buckhead', miles: 24 },
  '30324': { city: 'Atlanta - Lindbergh', miles: 24 },

  // Snellville / Loganville / further east
  '30078': { city: 'Snellville', miles: 16 },
  '30039': { city: 'Snellville', miles: 18 },
  '30052': { city: 'Loganville', miles: 22 },

  // Sugar Hill / Flowery Branch
  '30518F': { city: 'Sugar Hill', miles: 14 }, // dedupe-safe
  '30542': { city: 'Flowery Branch', miles: 22 },

  // Gainesville (edge of service area)
  '30506': { city: 'Gainesville', miles: 30 },
  '30507': { city: 'Gainesville', miles: 32 },
};

export interface DistanceLookupResult {
  found: true;
  city: string;
  miles: number;
  withinFreeZone: boolean;
  extraMiles: number;
  travelFee: number;
}

export interface NotFoundResult {
  found: false;
}

export function lookupZip(zip: string): DistanceLookupResult | NotFoundResult {
  const cleaned = zip.trim().slice(0, 5);
  const entry = ZIP_DISTANCES[cleaned];
  if (!entry) return { found: false };

  const withinFreeZone = entry.miles <= FREE_RADIUS_MILES;
  const extraMiles = withinFreeZone ? 0 : entry.miles - FREE_RADIUS_MILES;
  const travelFee = extraMiles * PER_MILE_FEE;

  return {
    found: true,
    city: entry.city,
    miles: entry.miles,
    withinFreeZone,
    extraMiles,
    travelFee,
  };
}
