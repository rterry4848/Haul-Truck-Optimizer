// Vercel serverless function: /api/route
// Keeps the TomTom API key on the server. The phone app never sees it.
// Set TOMTOM_API_KEY in your Vercel project's Environment Variables.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Use POST" });
    return;
  }

  const key = process.env.TOMTOM_API_KEY;
  if (!key) {
    res.status(500).json({ error: "Server is missing TOMTOM_API_KEY. Add it in Vercel > Project > Settings > Environment Variables." });
    return;
  }

  const { origin, destination } = req.body || {};
  if (!origin || !destination) {
    res.status(400).json({ error: "Both origin and destination are required." });
    return;
  }

  try {
    const originPoint = await resolvePoint(origin, key);
    const destPoint = await resolvePoint(destination, key);

    const routeUrl = `https://api.tomtom.com/routing/1/calculateRoute/${originPoint.lat},${originPoint.lon}:${destPoint.lat},${destPoint.lon}/json?key=${key}&traffic=true&routeType=fastest`;
    const routeResp = await fetch(routeUrl);
    const routeData = await routeResp.json();

    if (!routeResp.ok || !routeData.routes || !routeData.routes.length) {
      throw new Error(routeData?.error?.description || "TomTom could not calculate a route between those points.");
    }

    const summary = routeData.routes[0].summary;
    res.status(200).json({
      originLabel: originPoint.label,
      destLabel: destPoint.label,
      distanceMiles: round1(summary.lengthInMeters / 1609.34),
      durationMinutes: round1(summary.travelTimeInSeconds / 60),
      trafficDelayMinutes: round1((summary.trafficDelayInSeconds || 0) / 60),
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Route lookup failed." });
  }
}

async function resolvePoint(text, key) {
  const t = String(text).trim();
  const coordMatch = t.match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/);
  if (coordMatch) {
    return { lat: parseFloat(coordMatch[1]), lon: parseFloat(coordMatch[2]), label: t };
  }
  const geoUrl = `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(t)}.json?key=${key}&limit=1&countrySet=US`;
  const geoResp = await fetch(geoUrl);
  const geoData = await geoResp.json();
  if (!geoResp.ok || !geoData.results || !geoData.results.length) {
    throw new Error(`Could not find a location for "${t}".`);
  }
  const best = geoData.results[0];
  return {
    lat: best.position.lat,
    lon: best.position.lon,
    label: best.address?.freeformAddress || t,
  };
}

function round1(n) {
  return Math.round(n * 10) / 10;
}
