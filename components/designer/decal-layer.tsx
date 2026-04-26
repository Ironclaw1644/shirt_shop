"use client";

import * as React from "react";
import * as THREE from "three";
import { useDesignerStore } from "@/lib/designer/store";
import { Decal } from "./decal";

export function DecalLayer({
  targetMesh,
  inchesPerUnit,
}: {
  targetMesh: THREE.Mesh | null;
  inchesPerUnit: number;
}) {
  const elements = useDesignerStore((s) => s.elements);
  if (!targetMesh) return null;
  return (
    <>
      {elements.map((el, i) => (
        <Decal
          key={el.id}
          element={el}
          targetMesh={targetMesh}
          layerIndex={i}
          inchesPerUnit={inchesPerUnit}
        />
      ))}
    </>
  );
}
