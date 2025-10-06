import shapefile from 'shapefile';
import path from 'path';

interface LineStringGeometry {
  type: 'LineString';
  coordinates: number[][];
}

function isLineString(geometry: any): geometry is LineStringGeometry {
  return geometry.type === 'LineString' && Array.isArray(geometry.coordinates);
}

export async function parseRoadData() {
  try {
    const shpPath = path.join(process.cwd(), 'data', 'AmbalaRoad', 'AmbalaRoad.shp');
    const dbfPath = path.join(process.cwd(), 'data', 'AmbalaRoad', 'AmbalaRoad.dbf');
    
    const source = await shapefile.open(shpPath, dbfPath);
    const roads = [];
    
    let result = await source.read();
    while (!result.done) {
      const { value } = result;
      if (isLineString(value.geometry)) {
        roads.push({
          name: `Road ${roads.length + 1}`,
          geometry: JSON.stringify(value.geometry),
          startLat: value.geometry.coordinates[0][1],
          startLng: value.geometry.coordinates[0][0],
          endLat: value.geometry.coordinates[value.geometry.coordinates.length - 1][1],
          endLng: value.geometry.coordinates[value.geometry.coordinates.length - 1][0],
          lengthMeters: calculateRoadLength(value.geometry.coordinates)
        });
      }
      result = await source.read();
    }
    
    return roads;
  } catch (error) {
    console.error('Error parsing road data:', error);
    return [];
  }
}

function calculateRoadLength(coordinates: number[][]) {
  let length = 0;
  for (let i = 0; i < coordinates.length - 1; i++) {
    const [lng1, lat1] = coordinates[i];
    const [lng2, lat2] = coordinates[i + 1];
    length += getDistanceFromLatLonInM(lat1, lng1, lat2, lng2);
  }
  return length;
}

function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Earth's radius in meters
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180);
}