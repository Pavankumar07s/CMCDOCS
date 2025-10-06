"use client"

import { useState, useCallback, useRef } from "react"
import { GoogleMap, LoadScript, Polyline } from "@react-google-maps/api"
import type { MouseEvent } from "@react-google-maps/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AssignmentDialog } from "@/components/assignment-dialog"
import { useToast } from "@/hooks/use-toast"
import { LatLng, DrawnSegment } from "@/components/assignment-dialog"
import { RoadSegment } from "@/types/prisma"


const center = {
  lat: 40.7128,
  lng: -74.006, // New York City
}

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
}

const mapContainerStyle = {
  width: '100%',
  height: '600px',
}



interface SegmentGroup {
  id: string
  name: string
  segments: string[] // segment ids
  totalLength: number
}
interface MapInterfaceProps {
  onRoadsSelect: (roads: RoadSegment[]) => void;
}

export function MapInterface() {
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPath, setCurrentPath] = useState<LatLng[]>([])
  const [drawnSegments, setDrawnSegments] = useState<DrawnSegment[]>([])
  const [activeAssignments, setActiveAssignments] = useState<any[]>([])
  const mapRef = useRef<google.maps.Map | null>(null)
  const { toast } = useToast()
  const [currentAssigningSegment, setCurrentAssigningSegment] = useState<DrawnSegment | null>(null)
  const [segmentStart, setSegmentStart] = useState<LatLng | null>(null)
  const [drawingMode, setDrawingMode] = useState<'waiting' | 'drawing'>('waiting')
  const [groups, setGroups] = useState<SegmentGroup[]>([])
  const [selectedSegments, setSelectedSegments] = useState<string[]>([])
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null)

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map
    // Load existing assignments
    loadActiveAssignments()
  }, [])

  const loadActiveAssignments = async () => {
    try {
      const response = await fetch("/api/assignments")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const assignments = await response.json()
      // Filter active assignments and ensure geometry is properly parsed
      const activeOnes = assignments.filter(
        (assignment: any) => assignment.status === 'active' && assignment.geometry
      )
      setActiveAssignments(activeOnes)
      console.log('Loaded active assignments:', activeOnes)
    } catch (error) {
      console.error("Failed to load active assignments:", error)
      toast({
        title: "Error",
        description: "Failed to load active assignments. Please refresh the page.",
        variant: "destructive",
      })
    }
  }

  const showGuidance = () => {
    toast({
      title: "Drawing Mode Active",
      description: "Left-click to start segment, right-click to end segment",
      duration: 5000,
    });
  };

  const handleMapClick = (e: google.maps.MouseEvent) => {
    if (!isDrawing) return;
    
    if (e.domEvent.button === 0) { // Left click
      // Start new segment
      const point = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setCurrentPath([...currentPath, point]);
      if (currentPath.length === 0) {
        toast({
          title: "Started Drawing",
          description: "Right-click to end this segment",
        });
      }
    } else if (e.domEvent.button === 2) { // Right click
      if (currentPath.length < 2) {
        toast({
          title: "Error",
          description: "Please draw at least 2 points",
          variant: "destructive"
        });
        return;
      }
      finishSegment();
    }
  };

  const finishSegment = async () => {
    if (currentPath.length < 2) return;

    const path = [...currentPath];

    // Create temporary segment
    const tempSegment: DrawnSegment = {
      id: `temp-${Date.now()}`,
      path: path,
      isSnapped: false,
    }

    setDrawnSegments(prev => [...prev, tempSegment]);

    try {
      const response = await fetch("/api/roads/snap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });

      if (response.ok) {
        const snappedData = await response.json();
        setDrawnSegments(prev =>
          prev.map(segment =>
            segment.id === tempSegment.id
              ? {
                  ...segment,
                  snappedPath: snappedData.snappedPath,
                  startPoint: snappedData.startPoint,
                  endPoint: snappedData.endPoint,
                  length: snappedData.length,
                  isSnapped: true,
                }
              : segment
          )
        );
      }
    } catch (error) {
      console.error("Failed to snap to roads:", error);
    }

    // Reset for next segment
    setSegmentStart(null);
    setCurrentPath([]);
    setDrawingMode('waiting');
    toast({
      description: "Segment completed. Left-click to start new segment.",
      duration: 3000,
    });
  }

  const startDrawing = () => {
    setIsDrawing(true);
    showGuidance();
  }

  const finishDrawing = () => {
    // Only clean up state
    setIsDrawing(false)
    setCurrentPath([])
    setSegmentStart(null)
    setDrawingMode('waiting')
    
    // Only keep snapped segments
    const snappedSegments = drawnSegments.filter(segment => segment.isSnapped)
    setDrawnSegments(snappedSegments)
    
    // Show appropriate toast message
    if (snappedSegments.length > 0) {
      toast({
        description: "Drawing finished. Snapped segments are ready for assignment.",
        duration: 3000
      })
    } else {
      toast({
        description: "Drawing finished.",
        duration: 2000
      })
    }
  }

  const cancelDrawing = () => {
    setIsDrawing(false)
    setCurrentPath([])
    setSegmentStart(null)
    setDrawingMode('waiting')
    // Clear any unsnapped segments
    setDrawnSegments(prev => prev.filter(s => s.isSnapped))
    toast({
      description: "Drawing cancelled",
      duration: 2000
    })
  }

  const handleAssignmentCreated = () => {
    try {
      // For group assignments, remove all segments in the group
      if (currentAssigningSegment?.groupId) {
        // Remove all segments that belong to the group
        setDrawnSegments(prev => prev.filter(s => s.groupId !== currentAssigningSegment.groupId));
        
        // Also remove the group from groups state
        setGroups(prev => prev.filter(g => g.id !== currentAssigningSegment.groupId));
      } else {
        // Remove single assigned segment
        setDrawnSegments(prev => prev.filter(s => s.id !== currentAssigningSegment?.id));
      }
      
      setCurrentAssigningSegment(null);
      loadActiveAssignments();
      
      toast({
        title: "Success",
        description: "Road segment assigned successfully!",
        variant: "default"
      });
    } catch (error) {
      console.error("Assignment error:", error);
      toast({
        title: "Error",
        description: "Failed to complete assignment. Please try again.",
        variant: "destructive"
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Road Segment Map
          <div className="flex gap-2">
            {!isDrawing ? (
              <Button onClick={startDrawing}>Draw Road Segment</Button>
            ) : (
              <>
                <Button onClick={finishDrawing} variant="default">
                  Finish Drawing
                </Button>
                <Button onClick={cancelDrawing} variant="outline">
                  Cancel
                </Button>
              </>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={13}
            options={{
              ...mapOptions,
              clickableIcons: false
            }}
            onLoad={onMapLoad}
            onClick={handleMapClick}
            onRightClick={handleMapClick}
          >
            {/* Current drawing path */}
            {currentPath.length > 1 && (
              <Polyline
                path={currentPath}
                options={{
                  strokeColor: "#3b82f6",
                  strokeOpacity: 0.8,
                  strokeWeight: 4,
                  geodesic: true,
                }}
              />
            )}

            {/* Drawn segments */}
            {drawnSegments.map((segment) => {
              if (segment.disconnectedPaths) {
                // For grouped segments, render each path separately
                return segment.disconnectedPaths.map((path, index) => (
                  <Polyline
                    key={`${segment.id}-${index}`}
                    path={path}
                    options={{
                      strokeColor: segment.isSnapped ? "#10b981" : "#f59e0b",
                      strokeOpacity: 0.8,
                      strokeWeight: 4,
                      geodesic: true,
                    }}
                  />
                ));
              }
              // For single segments, render as before
              return (
                <Polyline
                  key={segment.id}
                  path={(segment.snappedPath || segment.path).filter((coord: LatLng | null): coord is LatLng => coord !== null)}
                  options={{
                    strokeColor: segment.isSnapped ? "#10b981" : "#f59e0b",
                    strokeOpacity: 0.8,
                    strokeWeight: 4,
                    geodesic: true,
                  }}
                />
              );
            })}

            {activeAssignments.map((assignment) => {
              if (!assignment?.geometry) {
                console.warn('Assignment without geometry:', assignment);
                return null;
              }
              
              let paths: LatLng[][] = [];
              try {
                const geom = assignment.geometry;
                // If geometry is already an array of LatLng points
                if (Array.isArray(geom) && geom.length > 0 && 'lat' in geom[0] && 'lng' in geom[0]) {
                  paths = [geom];
                }
                // If geometry is a MULTILINESTRING
                else if (typeof geom === 'string' && geom.includes('MULTILINESTRING')) {
                  // Remove 'MULTILINESTRING((' from start and '))' from end
                  const multiString = geom.replace('MULTILINESTRING((', '').replace('))', '');
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
                // If geometry is a string containing LINESTRING
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
                // If geometry is a JSON string or object with coordinates
                else {
                  const parsedGeom = typeof geom === 'string' ? JSON.parse(geom) : geom;
                  if (!Array.isArray(parsedGeom)) {
                    throw new Error('Invalid geometry format');
                  }
                  const coords = parsedGeom.map((coord: number[]) => {
                    if (!Array.isArray(coord) || coord.length < 2) {
                      throw new Error('Invalid coordinate array');
                    }
                    return {
                      lat: coord[1],
                      lng: coord[0]
                    };
                  });
                  paths = [coords];
                }
                
                return paths.map((path, index) => (
                  <Polyline
                    key={`assignment-${assignment.id}-${index}`}
                    path={path}
                    options={{
                      strokeColor: "#ef4444",
                      strokeOpacity: 0.9,
                      strokeWeight: 6,
                      geodesic: true,
                      clickable: true,
                      zIndex: 3,
                      icons: [{
                        icon: {
                          path: 1, // 1 is the value for FORWARD_CLOSED_ARROW
                          scale: 3,
                          strokeColor: "#ef4444"
                        },
                        offset: '50%',
                        repeat: '100px'
                      }]
                    }}
                    onClick={() => {
                      toast({
                        title: "Active Assignment",
                        description: `${assignment.road_segment_name}\nContractor: ${assignment.contractor_name}\nLength: ${(assignment.length_meters/1000).toFixed(2)} km`,
                        duration: 5000,
                      })
                    }}
                  />
                ));
              } catch (error) {
                console.error('Error parsing geometry:', error, assignment);
                return null;
              }
            })}
          </GoogleMap>
        </LoadScript>

        {/* Drawing instructions */}
        {isDrawing && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Click on the map to add points to your road segment. Click "Finish Drawing" when done.
            </p>
          </div>
        )}

        <div className="mt-4 p-3 bg-muted rounded-lg">
          <h4 className="text-sm font-semibold mb-2">Legend:</h4>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-blue-500"></div>
              <span>Drawing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-amber-500"></div>
              <span>Unsnapped</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-green-500"></div>
              <span>Snapped to Roads</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-red-500"></div>
              <span>Active Assignments</span>
            </div>
          </div>
        </div>

        {/* Segment info and grouping */}
        {drawnSegments.length > 0 && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Drawn Segments:</h3>
              {selectedSegments.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const groupId = `group-${Date.now()}`;
                      const totalLength = drawnSegments
                        .filter(s => selectedSegments.includes(s.id))
                        .reduce((sum, s) => sum + (s.length || 0), 0);
                      
                      setGroups(prev => [...prev, {
                        id: groupId,
                        name: `Group ${prev.length + 1}`,
                        segments: selectedSegments,
                        totalLength
                      }]);
                      
                      setDrawnSegments(prev => prev.map(s => 
                        selectedSegments.includes(s.id) ? {...s, groupId} : s
                      ));
                      setSelectedSegments([]);
                    }}
                  >
                    Group Selected ({selectedSegments.length})
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedSegments([])}
                  >
                    Clear Selection
                  </Button>
                </div>
              )}
            </div>

            {groups.map(group => (
              <div key={group.id} className="border rounded p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge>{group.name}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {(group.totalLength / 1000).toFixed(2)} km total
                    </span>
                  </div>
                  <AssignmentDialog 
                    segment={{
                      id: group.id,
                      path: drawnSegments
                        .filter(s => group.segments.includes(s.id))
                        .map(s => s.snappedPath || s.path)
                        .flat(),
                      isSnapped: true,
                      length: group.totalLength,
                      isMultiSegment: true,
                      disconnectedPaths: drawnSegments
                        .filter(s => group.segments.includes(s.id))
                        .map(s => s.snappedPath || s.path)
                    }} 
                    onAssignmentCreated={handleAssignmentCreated}
                  >
                    <Button size="sm">Assign Group</Button>
                  </AssignmentDialog>
                </div>
                <div className="space-y-1">
                  {drawnSegments
                    .filter(segment => group.segments.includes(segment.id))
                    .map(segment => (
                      <div key={segment.id} className="flex items-center gap-2 pl-4">
                        <Badge variant="outline" className="text-xs">
                          {(segment.length ? (segment.length / 1000).toFixed(2) : '0')} km
                        </Badge>
                      </div>
                    ))
                  }
                </div>
              </div>
            ))}

            {drawnSegments
              .filter(segment => !segment.groupId)
              .map((segment) => (
                <div 
                  key={segment.id} 
                  className={`flex items-center justify-between p-2 rounded ${
                    selectedSegments.includes(segment.id) 
                      ? 'bg-primary/10' 
                      : 'bg-muted'
                  }`}
                >
                  <div 
                    className="flex-1 flex items-center gap-2 cursor-pointer"
                    onClick={() => {
                      setSelectedSegments(prev => 
                        prev.includes(segment.id)
                          ? prev.filter(id => id !== segment.id)
                          : [...prev, segment.id]
                      );
                    }}
                  >
                    <Badge variant={segment.isSnapped ? "default" : "secondary"}>
                      {segment.isSnapped ? "Snapped" : "Drawing"}
                    </Badge>
                    {segment.length && (
                      <span className="text-sm text-muted-foreground">
                        {(segment.length / 1000).toFixed(2)} km
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {segment.isSnapped && !selectedSegments.length && (
                      <AssignmentDialog 
                        segment={segment} 
                        onAssignmentCreated={handleAssignmentCreated}
                        disabled={!segment.snappedPath}
                      >
                        <Button size="sm">Assign</Button>
                      </AssignmentDialog>
                    )}
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => {
                        // Find all segments with the same base timestamp
                        const baseTimestamp = segment.id.split('-')[1];
                        const relatedSegmentIds = drawnSegments
                          .filter(s => s.id.includes(baseTimestamp))
                          .map(s => s.id);
                        
                        console.log('Deleting segments:', relatedSegmentIds);

                        // Remove all related segments
                        setDrawnSegments(prev => 
                          prev.filter(s => !relatedSegmentIds.includes(s.id))
                        );

                        // Remove from selected segments
                        setSelectedSegments(prev => 
                          prev.filter(id => !relatedSegmentIds.includes(id))
                        );

                        // Remove from any groups and update group lengths
                        setGroups(prev => prev.map(group => ({
                          ...group,
                          segments: group.segments.filter(id => !relatedSegmentIds.includes(id)),
                          totalLength: drawnSegments
                            .filter(s => 
                              group.segments
                                .filter(id => !relatedSegmentIds.includes(id))
                                .includes(s.id)
                            )
                            .reduce((sum, s) => sum + (s.length || 0), 0)
                        })).filter(group => group.segments.length > 0));

                        // Show deletion feedback
                        toast({
                          description: "Segment and its related paths deleted",
                          duration: 2000
                        });
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
