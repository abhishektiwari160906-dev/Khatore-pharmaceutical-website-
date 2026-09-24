import * as THREE from 'three';

/** Standard lon/lat (degrees) -> unit-sphere xyz, radius `r`. */
export function latLonToVector3(lat: number, lon: number, r: number, target = new THREE.Vector3()): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  target.set(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
  return target;
}

/**
 * A great-circle-ish arc lifted above the sphere surface between two
 * lat/lon points, as a smooth curve for the network-line visual. Not a
 * literal flight path -- a restrained "connection" motif, matching the
 * client's requested "subtle connecting arcs" language.
 */
export function buildArcPoints(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number,
  radius: number,
  segments = 48,
): THREE.Vector3[] {
  const start = latLonToVector3(fromLat, fromLon, radius);
  const end = latLonToVector3(toLat, toLon, radius);
  const mid = start.clone().add(end).multiplyScalar(0.5);
  const liftFactor = 1 + start.distanceTo(end) / radius / 3.2;
  mid.normalize().multiplyScalar(radius * liftFactor);
  const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
  return curve.getPoints(segments);
}
