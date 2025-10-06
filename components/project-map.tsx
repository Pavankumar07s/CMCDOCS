"use client"

import { useEffect, useState, useCallback } from "react"
import { GoogleMap, LoadScript, Marker, Circle, Polyline } from "@react-google-maps/api"
import { Loader2 } from "lucide-react"

interface Location {
  lat: number
  lng: number
}

interface RoadSegment {
  id: number
  name: string
  geometry: string
  status: string
}

interface ProjectMapProps {
  location?: Location
  radius?: number // in meters
  projectId?: string
}

const mapContainerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "0.5rem",
}

const mapOptions = {
  styles: [
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#f5f5f5" }],
    },
    {
      featureType: "road.arterial",
      elementType: "geometry",
      stylers: [{ color: "#dadada" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#dadada" }],
    },
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    }
  ],
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: true,
  streetViewControl: true,
  rotateControl: false,
  fullscreenControl: true,
  clickableIcons: false
}

export function ProjectMap({ location, radius = 500, projectId }: ProjectMapProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [roadSegments, setRoadSegments] = useState<RoadSegment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  // Center will be updated once roads are loaded
  const defaultCenter = {
    lat: 20.5937, // India center coordinates
    lng: 78.9629,
  }
  
  const [mapCenter, setMapCenter] = useState(defaultCenter)
  const center = mapCenter

  const handleLoad = useCallback((map: google.maps.Map) => {
    setIsLoaded(true)
    setMap(map)
    map.setZoom(15)
  }, [])

  const handleUnmount = useCallback(() => {
    setMap(null)
  }, [])

  useEffect(() => {
    if (projectId) {
      setLoading(true)
      fetch(`/api/projects/${projectId}/roads`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch road data')
          return res.json()
        })
        .then(data => {
          console.log('Road data received:', data);
          const roads = data.roads || [];
          setRoadSegments(roads);
          
          if (roads.length > 0) {
            try {
              const firstRoad = roads[0];
              console.log('First road geometry:', firstRoad.geometry);
              
              // Parse the first coordinate from any geometry format
              let firstPoint;
              const geom = firstRoad.geometry;
              
              if (typeof geom === 'string' && geom.includes('MULTILINESTRING')) {
                // Extract first point from MULTILINESTRING
                const multiString = geom.replace('MULTILINESTRING((', '').replace('))', '');
                const firstCoords = multiString.split('),(')[0].split(',')[0].trim().split(/\s+/).map(Number);
                firstPoint = { lng: firstCoords[0], lat: firstCoords[1] };
              }
              else if (typeof geom === 'string' && geom.includes('LINESTRING')) {
                // Extract first point from LINESTRING
                const firstCoords = geom.slice(11, -1).split(',')[0].trim().split(/\s+/).map(Number);
                firstPoint = { lng: firstCoords[0], lat: firstCoords[1] };
              }
              else {
                // Handle JSON array format
                const points = typeof geom === 'string' ? JSON.parse(geom) : geom;
                if (Array.isArray(points) && points.length > 0) {
                  if ('lat' in points[0]) {
                    firstPoint = points[0];
                  } else {
                    firstPoint = { lng: points[0][0], lat: points[0][1] };
                  }
                }
              }
              
              if (firstPoint) {
                const newCenter = { lat: firstPoint.lat, lng: firstPoint.lng };
                setMapCenter(newCenter);
                map?.setCenter(newCenter);
                map?.setZoom(15);
              }
            } catch (parseError) {
              console.error('Failed to parse road geometry:', parseError);
            }
          }
        })
        .catch(err => {
          console.error("Failed to load road segments:", err)
          setError(err.message)
        })
        .finally(() => setLoading(false))
    }
  }, [projectId, map])

  if (loading && !roadSegments.length) {
    return (
      <div className="flex h-[300px] items-center justify-center bg-muted rounded-lg">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[300px] items-center justify-center bg-muted rounded-lg">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <LoadScript 
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
      onLoad={() => setIsLoaded(true)}
    >
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={15}
        onLoad={handleLoad}
        onUnmount={handleUnmount}
        options={mapOptions}
      >
        {location && (
          <>
            <Marker
              position={center}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: "#3b82f6",
                fillOpacity: 1,
                strokeWeight: 1,
                strokeColor: "#ffffff",
                scale: 10,
              }}
            />
            <Circle
              center={center}
              radius={radius}
              options={{
                fillColor: "#3b82f6",
                fillOpacity: 0.1,
                strokeColor: "#3b82f6",
                strokeOpacity: 0.5,
                strokeWeight: 2,
              }}
            />
          </>
        )}

        {/* Render road segments */}
        {roadSegments.map((segment) => {
          try {
            let paths: google.maps.LatLngLiteral[][] = [];
            const geom = segment.geometry;
            
            // If geometry is already an array of LatLng points
            if (Array.isArray(geom) && geom.length > 0 && ('lat' in geom[0] || Array.isArray(geom[0]))) {
              if ('lat' in geom[0]) {
                paths = [geom];
              } else {
                paths = [geom.map((coord: number[]) => ({
                  lat: coord[1],
                  lng: coord[0]
                }))];
              }
            }
            // If geometry is a MULTILINESTRING
            else if (typeof geom === 'string' && geom.includes('MULTILINESTRING')) {
              const multiString = geom.replace('MULTILINESTRING((', '').replace('))', '');
              paths = multiString.split('),(').map(lineString => {
                return lineString.split(',').map(p => {
                  const [lng, lat] = p.trim().split(/\s+/).map(coord => {
                    const num = parseFloat(coord);
                    if (isNaN(num)) {
                      throw new Error('Invalid coordinates in MULTILINESTRING');
                    }
                    return num;
                  });
                  return { lat, lng };
                });
              });
            }
            // If geometry is a LINESTRING
            else if (typeof geom === 'string' && geom.includes('LINESTRING')) {
              const coordStr = geom.slice(11, -1);
              const coords = coordStr.split(',').map(p => {
                const [lng, lat] = p.trim().split(' ').map(Number);
                if (isNaN(lng) || isNaN(lat)) {
                  throw new Error('Invalid coordinates in LINESTRING');
                }
                return { lat, lng };
              });
              paths = [coords];
            }
            // If geometry is a JSON string
            else if (typeof geom === 'string') {
              const parsedGeom = JSON.parse(geom);
              if (Array.isArray(parsedGeom)) {
                const coords = parsedGeom.map((coord: number[]) => ({
                  lat: coord[1],
                  lng: coord[0]
                }));
                paths = [coords];
              }
            }

            // Render each path as a separate Polyline
            return paths.map((path, pathIndex) => (
              <Polyline
                key={`${segment.id}-${pathIndex}`}
                path={path}
                options={{
                  strokeColor: segment.status === "active" ? "#ef4444" : "#3b82f6",
                  strokeOpacity: 0.9,
                  strokeWeight: 6,
                  geodesic: true,
                  clickable: true,
                  zIndex: 2,
                  icons: [{
                    icon: {
                      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                      scale: 3,
                      strokeColor: segment.status === "active" ? "#ef4444" : "#3b82f6"
                    },
                    offset: "50%",
                    repeat: "100px"
                  }]
                }}
              />
            ));
          }
          catch (err) {
            console.error(`Failed to parse geometry for road segment ${segment.id}:`, err);
            return null;
          }
        })}
      </GoogleMap>
    </LoadScript>
  )
}