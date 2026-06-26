const R_KM = 6371;
const toRad = (deg) => (deg * Math.PI) / 180;

export function haversineKm(aLat, aLng, bLat, bLng) {
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R_KM * Math.asin(Math.sqrt(h));
}

export function nearest(lat, lng, items = []) {
  let best = null;
  for (const it of items) {
    const d = haversineKm(lat, lng, it.lat, it.lng);
    if (!best || d < best.distancia_km) {
      best = { ...it, distancia_km: Math.round(d * 10) / 10 };
    }
  }
  return best;
}
