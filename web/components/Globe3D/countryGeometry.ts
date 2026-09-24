import * as THREE from 'three';
import { mesh } from 'topojson-client';
import type { Topology } from 'topojson-client';
import worldTopology from 'world-atlas/countries-110m.json';
import { latLonToVector3 } from './sphereMath';

let cachedLineGeometry: THREE.BufferGeometry | null = null;
let cachedRadius: number | null = null;

/**
 * All country/territory boundaries (interior + coastal) as a single
 * LineSegments-ready BufferGeometry, conformed onto the sphere
 * surface. Built once and cached at module scope -- the topology is
 * static, so there's no reason to recompute it per Globe3D mount.
 * Sourced from world-atlas's 110m-resolution countries topology (real
 * Natural Earth-derived boundaries, not the previous fake lat/lon
 * wireframe) -- only this one file is imported, so webpack only
 * bundles the 110m resolution (~100KB raw), not the package's larger
 * 50m/10m files.
 */
export function getCountryLineGeometry(radius: number): THREE.BufferGeometry {
  if (cachedLineGeometry && cachedRadius === radius) return cachedLineGeometry;
  cachedLineGeometry?.dispose();

  const topology = worldTopology as unknown as Topology;
  const borders = mesh(topology, topology.objects.countries!);

  const positions: number[] = [];
  const v = new THREE.Vector3();
  for (const line of borders.coordinates) {
    for (let i = 0; i < line.length - 1; i++) {
      const [lon0, lat0] = line[i]!;
      const [lon1, lat1] = line[i + 1]!;
      latLonToVector3(lat0!, lon0!, radius, v);
      positions.push(v.x, v.y, v.z);
      latLonToVector3(lat1!, lon1!, radius, v);
      positions.push(v.x, v.y, v.z);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  cachedLineGeometry = geometry;
  cachedRadius = radius;
  return geometry;
}
