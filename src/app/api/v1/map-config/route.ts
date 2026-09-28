export async function GET(){return Response.json({url:process.env.MAP_TILE_URL||null,attribution:process.env.MAP_TILE_ATTRIBUTION||''});}
