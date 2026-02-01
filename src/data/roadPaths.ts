// Road path waypoints for player movement animation
// The road forms a loop around the game board connecting all locations

// Waypoints are defined as percentage positions on the board
// The road runs clockwise starting from top-left

export interface Waypoint {
  x: number;
  y: number;
}

// Main road waypoints (clockwise loop)
// These are points along the road between buildings
export const ROAD_WAYPOINTS: Waypoint[] = [
  // Top-left corner (near Security Apartments)
  { x: 12, y: 28 },
  // Top road - left segment
  { x: 20, y: 26 },
  // Near Rent Office
  { x: 28, y: 25 },
  // Top road - middle segment
  { x: 36, y: 25 },
  // Near Low-Cost Housing
  { x: 44, y: 25 },
  // Top road - right segment
  { x: 52, y: 25 },
  // Near Pawn Shop
  { x: 60, y: 25 },
  // Top road - far right
  { x: 72, y: 26 },
  // Top-right corner (near Z-Mart)
  { x: 80, y: 28 },
  // Right road - top segment
  { x: 80, y: 35 },
  // Near Monolith Burgers
  { x: 80, y: 42 },
  // Right road - middle segment
  { x: 80, y: 50 },
  // Near QT Clothing
  { x: 80, y: 58 },
  // Right road - bottom segment
  { x: 80, y: 68 },
  // Near Socket City
  { x: 80, y: 75 },
  // Bottom-right corner
  { x: 78, y: 80 },
  // Near Hi-Tech U
  { x: 70, y: 80 },
  // Bottom road - right segment
  { x: 60, y: 80 },
  // Near Employment Office
  { x: 50, y: 80 },
  // Bottom road - left segment
  { x: 40, y: 80 },
  // Near Factory
  { x: 30, y: 80 },
  // Bottom-left corner
  { x: 22, y: 78 },
  // Left road - bottom segment
  { x: 20, y: 72 },
  // Near Bank
  { x: 20, y: 65 },
  // Left road - middle segment
  { x: 20, y: 55 },
  // Near Black's Market
  { x: 20, y: 45 },
  // Left road - top segment
  { x: 20, y: 35 },
];

// Location to nearest road waypoint index mapping
// This maps each location to the closest point on the road loop
export const LOCATION_WAYPOINT_INDEX: Record<string, number> = {
  'security-apartments': 0,
  'rent-office': 2,
  'low-cost-housing': 4,
  'pawn-shop': 6,
  'z-mart': 8,
  'monolith-burger': 10,
  'qt-clothing': 12,
  'socket-city': 14,
  'hi-tech-u': 16,
  'employment-office': 18,
  'factory': 20,
  'bank': 23,
  'blacks-market': 25,
};

// Entry points - the position where a player enters/exits a location from the road
// These are positions between the building and the road
export const LOCATION_ENTRY_POINTS: Record<string, Waypoint> = {
  'security-apartments': { x: 12, y: 25 },
  'rent-office': { x: 28, y: 22 },
  'low-cost-housing': { x: 44, y: 22 },
  'pawn-shop': { x: 60, y: 22 },
  'z-mart': { x: 82, y: 22 },
  'monolith-burger': { x: 82, y: 40 },
  'qt-clothing': { x: 82, y: 56 },
  'socket-city': { x: 82, y: 73 },
  'hi-tech-u': { x: 72, y: 82 },
  'employment-office': { x: 52, y: 82 },
  'factory': { x: 28, y: 82 },
  'bank': { x: 18, y: 65 },
  'blacks-market': { x: 18, y: 44 },
};

/**
 * Calculate the path between two locations
 * Returns an array of waypoints to animate through
 */
export function calculatePath(fromLocationId: string, toLocationId: string): Waypoint[] {
  if (fromLocationId === toLocationId) return [];

  const fromIndex = LOCATION_WAYPOINT_INDEX[fromLocationId];
  const toIndex = LOCATION_WAYPOINT_INDEX[toLocationId];
  const fromEntry = LOCATION_ENTRY_POINTS[fromLocationId];
  const toEntry = LOCATION_ENTRY_POINTS[toLocationId];

  if (fromIndex === undefined || toIndex === undefined) {
    console.warn(`Unknown location: ${fromLocationId} or ${toLocationId}`);
    return [];
  }

  // Start with the entry point from the starting location
  const path: Waypoint[] = [fromEntry];

  // Calculate the shortest direction around the loop
  const totalWaypoints = ROAD_WAYPOINTS.length;
  const clockwiseDistance = (toIndex - fromIndex + totalWaypoints) % totalWaypoints;
  const counterClockwiseDistance = (fromIndex - toIndex + totalWaypoints) % totalWaypoints;

  const goClockwise = clockwiseDistance <= counterClockwiseDistance;

  // Add waypoints along the path
  let currentIndex = fromIndex;
  while (currentIndex !== toIndex) {
    path.push(ROAD_WAYPOINTS[currentIndex]);

    if (goClockwise) {
      currentIndex = (currentIndex + 1) % totalWaypoints;
    } else {
      currentIndex = (currentIndex - 1 + totalWaypoints) % totalWaypoints;
    }
  }

  // Add the final road waypoint
  path.push(ROAD_WAYPOINTS[toIndex]);

  // End with the entry point to the destination
  path.push(toEntry);

  return path;
}

/**
 * Get home location ID based on apartment type
 */
export function getHomeLocation(apartmentType: 'low-cost' | 'security'): string {
  return apartmentType === 'low-cost' ? 'low-cost-housing' : 'security-apartments';
}

/**
 * Calculate total animation duration based on path length
 * Returns duration in seconds
 */
export function calculateAnimationDuration(path: Waypoint[]): number {
  if (path.length <= 1) return 0;

  // Base duration per segment (in seconds)
  const durationPerSegment = 0.15;

  // Total segments is path length - 1
  return (path.length - 1) * durationPerSegment;
}
