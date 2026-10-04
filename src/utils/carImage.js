/**
 * Fetches an "appropriate" vehicle photo for a listing using a keyless public
 * image API (LoremFlickr), keyed off the car's brand + body type + fuel type.
 * No API key required — resolves directly to an <img> src URL.
 *
 * Used whenever a host lists a new car and doesn't supply their own photo,
 * so every listing gets a relevant image instead of one shared placeholder.
 */
export function getCarImageUrl({ brand, type, name, fuel } = {}) {
  const keywords = [brand, type, fuel === 'Electric' ? 'electric' : null, 'car']
    .filter(Boolean)
    .map((k) => encodeURIComponent(String(k).split(' ')[0].toLowerCase()))
    .join(',');

  // Cache-buster derived from the name so repeated saves of the same model
  // don't keep re-rolling to a different random photo on every render.
  const seed = encodeURIComponent((name || brand || 'car').replace(/\s+/g, '-').toLowerCase());

  return `https://loremflickr.com/640/480/${keywords}?lock=${hashSeed(seed)}`;
}

function hashSeed(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 1000;
}
