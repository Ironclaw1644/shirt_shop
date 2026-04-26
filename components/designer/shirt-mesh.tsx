"use client";

import * as React from "react";
import * as THREE from "three";

/**
 * Build a stylized but recognizable t-shirt mesh procedurally.
 * Built in inches — 1 unit = 1 inch.
 *
 * Shape:
 *   - Body: extruded silhouette (front+back+sleeve outline) with subtle
 *     front/back curvature so decals visibly wrap.
 *   - Sleeves are part of the silhouette, not separate meshes — keeps
 *     the decal raycast simple.
 *
 * Sized for a Medium tee (~20" pit-to-pit, ~28" body length, ~15" sleeve out).
 */
function buildTeeShape(): THREE.Shape {
  // Half-silhouette traced from neck down to hem on the right side.
  // Coordinates are (x, y) in inches, centered horizontally.
  const shape = new THREE.Shape();
  shape.moveTo(-3, 13);            // left collar
  shape.bezierCurveTo(-2.5, 13.5, 2.5, 13.5, 3, 13);  // collar curve
  shape.lineTo(7, 12);              // right shoulder
  shape.lineTo(15, 8);              // sleeve outer top (right)
  shape.lineTo(15.5, 4);            // sleeve outer bottom (right)
  shape.lineTo(11, 5);              // sleeve underarm (right)
  shape.lineTo(11, -14);            // right hem corner
  shape.lineTo(-11, -14);           // left hem corner
  shape.lineTo(-11, 5);             // sleeve underarm (left)
  shape.lineTo(-15.5, 4);           // sleeve outer bottom (left)
  shape.lineTo(-15, 8);             // sleeve outer top (left)
  shape.lineTo(-7, 12);             // left shoulder back to collar
  shape.lineTo(-3, 13);
  return shape;
}

function buildTeeGeometry(): THREE.BufferGeometry {
  const shape = buildTeeShape();
  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: 0.8,
    bevelEnabled: true,
    bevelThickness: 0.4,
    bevelSize: 0.4,
    bevelSegments: 4,
    curveSegments: 24,
  });
  // Center the geometry on Z so front/back are symmetric around z=0.
  geom.translate(0, 0, -0.4);

  // Subtle convex bow on the front and back faces so the decal wraps a curve
  // rather than projecting onto a perfectly flat plane. We bias z by a
  // gaussian falloff from the center.
  const pos = geom.attributes.position;
  const bowAmount = 1.4; // inches of additional bulge at center
  const sigmaX = 9;
  const sigmaY = 11;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    if (Math.abs(z) < 0.5) continue; // skip the bevel-side edges
    const falloff = Math.exp(-((x * x) / (2 * sigmaX * sigmaX) + (y * y) / (2 * sigmaY * sigmaY)));
    const sign = z > 0 ? 1 : -1;
    pos.setZ(i, z + sign * bowAmount * falloff);
  }
  pos.needsUpdate = true;
  geom.computeVertexNormals();
  return geom;
}

export const ShirtMesh = React.forwardRef<
  THREE.Mesh,
  { color?: string; onMeshReady?: (mesh: THREE.Mesh) => void }
>(function ShirtMesh({ color = "#d1d5db", onMeshReady }, fwdRef) {
  const geometry = React.useMemo(() => buildTeeGeometry(), []);
  const material = React.useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.85,
        metalness: 0.0,
      }),
    [color],
  );

  React.useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  const localRef = React.useRef<THREE.Mesh>(null);
  React.useImperativeHandle(fwdRef, () => localRef.current as THREE.Mesh, []);

  React.useEffect(() => {
    if (localRef.current && onMeshReady) onMeshReady(localRef.current);
  }, [onMeshReady]);

  return <mesh ref={localRef} geometry={geometry} material={material} castShadow receiveShadow />;
});
