/**
 * Minimal local typings for the two topojson-client functions this
 * project uses (no @types package exists for topojson-client). Kept
 * intentionally narrow to what's actually called.
 */
declare module 'topojson-client' {
  export interface GeometryCollection {
    type: 'GeometryCollection';
    geometries: Array<{ id?: string | number; type: string; arcs: unknown }>;
  }

  export interface Topology {
    type: 'Topology';
    arcs: number[][][];
    transform?: { scale: [number, number]; translate: [number, number] };
    objects: Record<string, GeometryCollection>;
  }

  export interface MultiLineStringGeometry {
    type: 'MultiLineString';
    coordinates: number[][][];
  }

  export function mesh(topology: Topology, object: GeometryCollection): MultiLineStringGeometry;

  export function feature(
    topology: Topology,
    object: GeometryCollection,
  ): {
    type: 'FeatureCollection';
    features: Array<{
      type: 'Feature';
      id?: string | number;
      properties: Record<string, unknown>;
      geometry: { type: 'Polygon' | 'MultiPolygon'; coordinates: number[][][] | number[][][][] };
    }>;
  };
}
