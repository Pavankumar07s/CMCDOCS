"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { GoogleMap, LoadScript, Polyline, InfoWindow } from "@react-google-maps/api"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

interface MapFilters {
  ward: string
  status: string
  type: string
  search: string
  dateRange: {
    from: Date | null
    to: Date | null
  }
  refreshKey: number
}

interface InteractiveMapProps {
  filters: MapFilters
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

const defaultCenter = {
  lat: 30.3752,
  lng: 76.7821,
}

export function InteractiveMap({ filters }: InteractiveMapProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [selectedRoad, setSelectedRoad] = useState<any>(null)
  const [mapCenter, setMapCenter] = useState(defaultCenter)
  const mapRef = useRef<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    setProjects([]) // Clear projects before fetching
    try {
      const params = new URLSearchParams()
      if (filters.ward !== "all") params.append("wardId", filters.ward)
      if (filters.status !== "all") params.append("status", filters.status)
      if (filters.type !== "all") params.append("type", filters.type)
      if (filters.search) params.append("search", filters.search)
      if (filters.dateRange.from) params.append("from", filters.dateRange.from.toISOString())
      if (filters.dateRange.to) params.append("to", filters.dateRange.to.toISOString())
      
      // Add role to query
      params.append("userRole", session?.user?.role || "")

      console.log("Fetching with params:", params.toString())
      const response = await fetch(`/api/projects/roads?${params}`)
      if (!response.ok) throw new Error("Failed to fetch projects")
      const data = await response.json()
      
      if (!data.projects) {
        console.warn("No projects data received");
        setProjects([]);
        return;
      }

      console.log(`Received ${data.projects.length} projects`);
      // Clear any existing projects first
      setProjects([]);
      // Small delay to ensure clearing happens before setting new data
      setTimeout(() => {
        setProjects(data.projects || []);
      }, 10);

      if (data.projects[0]?.roadSegments?.[0]) {
        const firstSegment = data.projects[0].roadSegments[0]
        const paths = parseGeometry(firstSegment.geometry)
        if (paths && paths[0] && paths[0][0]) {
          const firstPoint = paths[0][0]
          setMapCenter(firstPoint)
          if (mapRef.current) {
            mapRef.current.panTo(firstPoint)
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error)
      setError(error instanceof Error ? error.message : "Failed to load projects")
      toast.error("Failed to load road projects")
    } finally {
      setLoading(false)
    }
  }, [filters, session?.user?.role])

  // Effect to handle filter changes
  useEffect(() => {
    if (!mapLoaded) return;
    
    console.log("Fetching projects due to filter change", filters);
    // Clear existing data first
    setProjects([]);
    
    // Use a timeout to ensure state is cleared before fetching
    const timeoutId = setTimeout(() => {
      fetchProjects();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [filters, mapLoaded]) // Remove fetchProjects from deps to prevent double fetching

  const parseGeometry = useCallback((geometry: any) => {
    try {
      let paths: google.maps.LatLngLiteral[][] = [];
      
      // If geometry is already an array of LatLng points
      if (Array.isArray(geometry) && geometry.length > 0 && ('lat' in geometry[0] || Array.isArray(geometry[0]))) {
        if ('lat' in geometry[0]) {
          // Single array of LatLng objects
          paths = [geometry];
        } else {
          // Array of coordinate pairs
          paths = [geometry.map((coord: number[]) => ({
            lat: coord[1],
            lng: coord[0]
          }))];
        }
      }
      // If geometry is a MULTILINESTRING
      else if (typeof geometry === 'string' && geometry.includes('MULTILINESTRING')) {
        // Remove 'MULTILINESTRING((' from start and '))' from end
        const multiString = geometry.replace('MULTILINESTRING((', '').replace('))', '');
        paths = multiString.split('),(').map(lineString => {
          // Process each coordinate pair in the linestring
          return lineString.split(',').map(p => {
            // Clean and parse coordinates
            const [lng, lat] = p.trim().split(/\s+/).map(coord => {
              const num = parseFloat(coord);
              if (isNaN(num)) {
                console.error('Invalid coordinate:', coord, 'in', p);
                throw new Error('Invalid coordinates in MULTILINESTRING');
              }
              return num;
            });
            return { lat, lng };
          });
        });
      }
      // If geometry is a LINESTRING
      else if (typeof geometry === 'string' && geometry.includes('LINESTRING')) {
        const coordStr = geometry.slice(11, -1);
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
      else if (typeof geometry === 'string') {
        try {
          const parsedGeom = JSON.parse(geometry);
          if (Array.isArray(parsedGeom)) {
            const coords = parsedGeom.map((coord: number[]) => ({
              lat: coord[1],
              lng: coord[0]
            }));
            paths = [coords];
          }
        } catch (e) {
          console.error('Failed to parse JSON geometry:', e);
          return [];
        }
      }

      // Return all paths for multi-segment support
      return paths;
    } catch (error) {
      console.error("Failed to parse geometry:", error, geometry)
      return []
    }
  }, [])

  const onMapLoad = useCallback((map: any) => {
    console.log("Map loaded");
    mapRef.current = map
    setMapLoaded(true)
  }, [])

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-red-500">Google Maps API key is missing</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full" data-map-component>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-50">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}
      <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          key={filters.refreshKey} // Force re-render on filter change
          mapContainerStyle={{
            width: "100%",
            height: "100%",
          }}
          center={mapCenter}
          zoom={14}
          options={mapOptions}
          onLoad={onMapLoad}
        >
          {projects.map(project => 
            project.roadSegments.map((segment: any) => {
              const paths = parseGeometry(segment.geometry)
              if (!paths || !paths.length) return null

              // For each path in the geometry (handles MULTILINESTRING)
              return paths.map((path, pathIndex) => (
                <Polyline
                  key={`${project.id}-${segment.id}-${pathIndex}`}
                  path={path}
                  options={{
                    strokeColor: segment.status === "active" ? "#ef4444" : "#3b82f6",
                    strokeOpacity: 0.9,
                    strokeWeight: 6,
                    geodesic: true,
                    clickable: true,
                    zIndex: 2
                  }}
                  onClick={(e) => {
                    if (e.latLng) {
                      setSelectedRoad({
                        projectId: project.id,
                        segmentId: segment.id,
                        position: { lat: e.latLng.lat(), lng: e.latLng.lng() },
                        info: {
                          projectName: project.name,
                          tenderId: project.tenderId,
                          status: project.status,
                          type: project.type,
                          ward: project.ward.name,
                          roadName: segment.name,
                          length: segment.length
                        }
                      })
                    }
                  }}
                />
              ))
            })
          )}

          {selectedRoad && (
            <InfoWindow
              position={selectedRoad.position}
              onCloseClick={() => setSelectedRoad(null)}
            >
              <div className="p-2 max-w-xs">
                <h3 className="font-semibold mb-1 text-black">{selectedRoad.info.projectName}</h3>
                <p className="text-sm mb-1 text-black">Tender ID: {selectedRoad.info.tenderId}</p>
                <p className="text-sm mb-1 text-black">Ward: {selectedRoad.info.ward}</p>
                <p className="text-sm mb-1 text-black">Status: {selectedRoad.info.status}</p>
                <p className="text-sm mb-1 text-black">Type: {selectedRoad.info.type}</p>
                <p className="text-sm text-blue-400">Length: {(selectedRoad.info.length / 1000).toFixed(2)} km</p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  )
}
