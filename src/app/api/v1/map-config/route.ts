export async function GET() {
  const mapTilerKey = process.env.MAPTILER_API_KEY;
  const url =
    process.env.MAP_TILE_URL ||
    (mapTilerKey
      ? `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${mapTilerKey}`
      : "https://tile.openstreetmap.org/{z}/{x}/{y}.png");
  const attribution =
    process.env.MAP_TILE_ATTRIBUTION ||
    (mapTilerKey
      ? '&copy; MapTiler &copy; OpenStreetMap contributors'
      : '&copy; OpenStreetMap contributors');

  return Response.json(
    { url, attribution },
    { headers: { "Cache-Control": "public, max-age=300" } },
  );
}
