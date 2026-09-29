import * as THREE from 'three';
import { feature } from 'topojson-client';
import type { Topology } from 'topojson-client';
import worldLandTopology from 'world-atlas/land-110m.json';
import { latLonToVector3 } from './sphereMath';

let cachedLandGeometry: THREE.BufferGeometry | null = null;
let cachedRadius: number | null = null;

/**
 * Real landmass polygons (world-atlas's 110m-resolution land topology --
 * the same package/resolution already used for country borders), filled
 * and bent onto the sphere surface, for the "green land vs. blue ocean"
 * realistic-globe treatment. This is genuine geography, not a texture
 * image or invented shape: each polygon ring is triangulated in flat
 * lon/lat space via THREE.ShapeGeometry (handles holes, e.g. the
 * Caspian-adjacent inland gaps, natively), then every resulting vertex
 * is projected onto the sphere with the same latLonToVector3 used for
 * borders/markers, so land, borders and markers all line up exactly.
 *
 * Known, accepted limitation: a small number of polygons that straddle
 * the antimeridian (e.g. part of the Aleutians/Fiji) are skipped rather
 * than triangulated, since flat 2D triangulation across a +/-180 degree
 * seam produces a wrap-around sliver, not a real landmass shape. This
 * is a restrained/stylized globe ("do not make it photorealistic"), not
 * a navigational map -- an honest, minor omission beats a visible seam
 * artifact.
 */
export function getLandGeometry(radius: number): THREE.BufferGeometry {
  if (cachedLandGeometry && cachedRadius === radius) return cachedLandGeometry;
  cachedLandGeometry?.dispose();

  const topology = worldLandTopology as unknown as Topology;
  const landFeatures = feature(topology, topology.objects.land!).features;

  const positions: number[] = [];
  const indices: number[] = [];

  for (const f of landFeatures) {
    const polygons: number[][][][] =
      f.geometry.type === 'Polygon'
        ? [f.geometry.coordinates as unknown as number[][][]]
        : (f.geometry.coordinates as unknown as number[][][][]);

    for (const rings of polygons) {
      const outer = rings[0];
      if (!outer || outer.length < 3) continue;

      const lons = outer.map((p) => p[0]!);
      if (Math.max(...lons) - Math.min(...lons) > 180) continue; // antimeridian seam -- see doc comment

      const shape = new THREE.Shape(outer.map(([lon, lat]) => new THREE.Vector2(lon!, lat!)));
      for (let i = 1; i < rings.length; i++) {
        const hole = rings[i];
        if (hole && hole.length >= 3) {
          shape.holes.push(new THREE.Path(hole.map(([lon, lat]) => new THREE.Vector2(lon!, lat!))));
        }
      }

      const flat = new THREE.ShapeGeometry(shape);
      const pos = flat.attributes.position!;
      const idx = flat.index;
      if (!idx) {
        flat.dispose();
        continue;
      }

      const vertStart = positions.length / 3;
      const v = new THREE.Vector3();
      for (let i = 0; i < pos.count; i++) {
        const lon = pos.getX(i);
        const lat = pos.getY(i);
        latLonToVector3(lat, lon, radius, v);
        positions.push(v.x, v.y, v.z);
      }
      for (let i = 0; i < idx.count; i++) {
        indices.push(idx.getX(i) + vertStart);
      }
      flat.dispose();
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  cachedLandGeometry = geometry;
  cachedRadius = radius;
  return geometry;
}
