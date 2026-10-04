/**
 * Computes a listing's average rating from actual submitted reviews instead of
 * relying on the static `rating` field seeded in mock data. Falls back to that
 * static field (and its review count) when no matching reviews exist yet.
 */
export function getLiveRating({ reviews, targetType, targetName, fallbackRating, fallbackCount }) {
  if (!reviews || !targetName) {
    return { rating: fallbackRating ?? 5.0, count: fallbackCount ?? 0, isLive: false };
  }

  const needle = targetName.toLowerCase();
  const matches = reviews.filter((r) => {
    if (targetType && r.targetType !== targetType) return false;
    const name = (r.targetName || '').toLowerCase();
    return name === needle || name.includes(needle) || needle.includes(name);
  });

  if (matches.length === 0) {
    return { rating: fallbackRating ?? 5.0, count: fallbackCount ?? 0, isLive: false };
  }

  const sum = matches.reduce((acc, r) => acc + Number(r.rating || 5), 0);
  return {
    rating: Number((sum / matches.length).toFixed(2)),
    count: matches.length,
    isLive: true
  };
}
