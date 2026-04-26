"use client";

import * as React from "react";
import * as THREE from "three";
import { ThreeEvent, useThree } from "@react-three/fiber";
import { DecalGeometry } from "three-stdlib";
import type { DesignElement } from "@/lib/designer/types";
import { useDesignerStore } from "@/lib/designer/store";
import { anchorToEuler } from "@/lib/designer/decal-math";
import { decalSize, rasterizeImage, rasterizeText } from "@/lib/designer/rasterize";

type Props = {
  element: DesignElement;
  targetMesh: THREE.Mesh;
  layerIndex: number;
  inchesPerUnit: number;
};

/**
 * One projected decal on the target mesh.
 * Rebuilds geometry on anchor / size / content changes; reuses the texture
 * across re-renders unless the content actually changes.
 */
export function Decal({ element, targetMesh, layerIndex, inchesPerUnit }: Props) {
  const select = useDesignerStore((s) => s.select);
  const updateAnchor = useDesignerStore((s) => s.updateAnchor);
  const selectedId = useDesignerStore((s) => s.selectedId);
  const isSelected = selectedId === element.id;

  // Texture from the rasterized element.
  const [texture, setTexture] = React.useState<THREE.CanvasTexture | null>(null);
  const [aspect, setAspect] = React.useState(1);

  // Recompute texture when content-affecting props change.
  const contentKey = React.useMemo(() => {
    if (element.type === "text") {
      return [element.content, element.fontFamily, element.fontSize, element.fillColor].join("|");
    }
    return element.src;
  }, [element]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const r =
        element.type === "text" ? await rasterizeText(element) : await rasterizeImage(element);
      if (cancelled) return;
      const tex = new THREE.CanvasTexture(r.canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      tex.needsUpdate = true;
      setTexture((prev) => {
        prev?.dispose();
        return tex;
      });
      setAspect(r.aspect);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentKey, element.type]);

  // DecalGeometry rebuilt when anchor or size or aspect changes. Stringify
  // the anchor numerics so React's referential check fires on real changes.
  const anchor = element.anchor;
  const anchorKey = React.useMemo(
    () =>
      [
        ...anchor.position,
        ...anchor.normal,
        ...anchor.up,
        anchor.rotation,
        anchor.sizeIn,
      ].join(":"),
    [anchor.position, anchor.normal, anchor.up, anchor.rotation, anchor.sizeIn],
  );

  const geometry = React.useMemo(() => {
    if (!texture) return null;
    const { width, height } = decalSize(aspect, anchor.sizeIn, inchesPerUnit);
    const position = new THREE.Vector3().fromArray(anchor.position);
    const rotation = anchorToEuler(anchor);
    const size = new THREE.Vector3(width, height, Math.max(width, height) * 2);
    return new DecalGeometry(targetMesh, position, rotation, size);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texture, aspect, anchorKey, inchesPerUnit, targetMesh]);

  React.useEffect(() => () => geometry?.dispose(), [geometry]);

  const material = React.useMemo(() => {
    if (!texture) return null;
    return new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      polygonOffset: true,
      polygonOffsetFactor: -4 - layerIndex,
      polygonOffsetUnits: -4,
      depthTest: true,
      depthWrite: false,
      roughness: 0.6,
      metalness: 0,
    });
  }, [texture, layerIndex]);

  React.useEffect(() => () => material?.dispose(), [material]);

  // Drag-to-reposition state
  const dragging = React.useRef(false);
  const { gl, camera, raycaster } = useThree();

  const onPointerDown = React.useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      select(element.id);
      dragging.current = true;
      (e.target as Element)?.setPointerCapture?.(e.pointerId);
    },
    [element.id, select],
  );

  const onPointerMove = React.useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!dragging.current || !isSelected) return;
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      const hit = raycaster.intersectObject(targetMesh, false)[0];
      if (!hit?.face) return;
      const worldNormal = hit.face.normal
        .clone()
        .transformDirection(targetMesh.matrixWorld)
        .normalize();
      updateAnchor(element.id, {
        position: [hit.point.x, hit.point.y, hit.point.z],
        normal: [worldNormal.x, worldNormal.y, worldNormal.z],
      });
    },
    [isSelected, gl, camera, raycaster, targetMesh, updateAnchor, element.id],
  );

  const onPointerUp = React.useCallback((e: ThreeEvent<PointerEvent>) => {
    dragging.current = false;
    (e.target as Element)?.releasePointerCapture?.(e.pointerId);
  }, []);

  if (!geometry || !material) return null;

  return (
    <mesh
      geometry={geometry}
      material={material}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    />
  );
}
