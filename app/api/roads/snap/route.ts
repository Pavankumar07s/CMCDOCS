import { type NextRequest, NextResponse } from "next/server"

interface LatLng {
  lat: number
  lng: number
}

interface SnapToRoadsResponse {
  snappedPoints: Array<{
    location: {
      latitude: number
      longitude: number
    }
    originalIndex?: number
    placeId?: string
  }>
}

// Calculate distance between two points using Haversine formula
function calculateDistance(points: LatLng[]): number {
  if (points.length !== 2) return 0
  const [p1, p2] = points
  const R = 6371000 // Earth's radius in meters
  const lat1 = (p1.lat * Math.PI) / 180
  const lat2 = (p2.lat * Math.PI) / 180
  const deltaLat = ((p2.lat - p1.lat) * Math.PI) / 180
  const deltaLng = ((p2.lng - p1.lng) * Math.PI) / 180

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json()

    if (!path || !Array.isArray(path) || path.length < 2) {
      return NextResponse.json({ error: "Invalid path. Must be an array of at least 2 coordinates." }, { status: 400 })
    }

    // Ensure minimum distance between points to get better snapping
    const minDistanceMeters = 5
    const filteredPath = path.reduce((acc: LatLng[], curr, idx) => {
      if (idx === 0 || idx === path.length - 1) {
        return [...acc, curr]
      }
      const prevPoint = acc[acc.length - 1]
      const distance = calculateDistance([prevPoint, curr])
      if (distance >= minDistanceMeters) {
        return [...acc, curr]
      }
      return acc
    }, [])

    const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!googleMapsApiKey) {
      console.error("Missing Google Maps API key")
      return NextResponse.json({ error: "Google Maps API key not configured" }, { status: 500 })
    }

    // Validate API key format
    if (!googleMapsApiKey.startsWith('AIza')) {
      console.error("Invalid Google Maps API key format")
      return NextResponse.json({ error: "Invalid API key configuration" }, { status: 500 })
    }

    // Convert path to Google Roads API format
    const pathString = path.map((point: LatLng) => `${point.lat},${point.lng}`).join("|")

    // Split path into smaller chunks if too long (Roads API limit)
    const maxPoints = 100
    const chunks: LatLng[][] = []
    for (let i = 0; i < filteredPath.length; i += maxPoints - 1) {
      const chunk = filteredPath.slice(i, i + maxPoints)
      if (i > 0) {
        // Overlap chunks by one point for continuity
        chunk.unshift(filteredPath[i - 1])
      }
      chunks.push(chunk)
    }

    let allSnappedPoints: LatLng[] = []
    
    // Process each chunk
    for (const chunk of chunks) {
      const chunkString = chunk.map((point) => `${point.lat},${point.lng}`).join("|")
      const roadsApiUrl = `https://roads.googleapis.com/v1/snapToRoads?path=${encodeURIComponent(chunkString)}&interpolate=true&key=${googleMapsApiKey}`

      // Retry logic
      let retries = 3
      let response
      while (retries > 0) {
        try {
          response = await fetch(roadsApiUrl, {
            headers: {
              'Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
            }
          })
          if (response.ok) break
        } catch (error) {
          console.error(`Snap retry failed (${retries} left):`, error)
        }
        retries--
        if (retries > 0) await new Promise(r => setTimeout(r, 1000))
      }

      if (!response?.ok) {
        throw new Error('Failed to snap path after retries')

      }

      const data = await response?.json()
      if (!data?.snappedPoints?.length) {
        console.warn('No snapped points returned for chunk')
        // If snapping fails, use original points for this chunk
        allSnappedPoints.push(...chunk)
        continue
      }

      // Add snapped points, removing duplicates at chunk boundaries
      const chunkPoints = data.snappedPoints.map((point: SnapToRoadsResponse['snappedPoints'][0]) => ({
        lat: point.location.latitude,
        lng: point.location.longitude
      }))

      if (allSnappedPoints.length > 0) {
        // Remove first point of this chunk as it overlaps with last point of previous chunk
        chunkPoints.shift()
      }
      allSnappedPoints.push(...chunkPoints)
    }

    if (allSnappedPoints.length < 2) {
      return NextResponse.json({ error: "Failed to snap points" }, { status: 400 })
    }

    // Calculate final length
    const length = allSnappedPoints.reduce((total, point, i) => {
      if (i === 0) return 0
      return total + calculateDistance([allSnappedPoints[i - 1], point])
    }, 0)

    return NextResponse.json({
      snappedPath: allSnappedPoints,
      startPoint: allSnappedPoints[0],
      endPoint: allSnappedPoints[allSnappedPoints.length - 1],
      length,
      originalPath: path
    })
  } catch (error) {
    console.error("Road snapping error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
