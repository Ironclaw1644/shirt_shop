"use client";

import * as React from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { ShirtMesh } from "./shirt-mesh";
import { DecalLayer } from "./decal-layer";
import { useDesignerStore } from "@/lib/designer/store";
import type { CameraView } from "@/lib/designer/types";
import type { SampleProduct } from "@/lib/catalog/sample-products";

const FAR_DISTANCE_MULTIPLIER = 3;

function CameraDriver({ distance }: { distance: number }) {
  const cameraView = useDesignerStore((s) => s.cameraView);
  const { camera } = useThree();
  const controlsRef = React.useRef<OrbitControlsImpl | null>(null);

  React.useEffect(() => {
    if (cameraView === "free") return;
    const positions: Record<Exclude<CameraView, "free">, [number, number, number]> = {
      front: [0, 0, distance],
      back: [0, 0, -distance],
      left: [-distance, 0, 0],
      right: [distance, 0, 0],
    };
    const [x, y, z] = positions[cameraView];
    camera.position.set(x, y, z);
    camera.lookAt(0, 0, 0);
    controlsRef.current?.target.set(0, 0, 0);
    controlsRef.current?.update();
  }, [cameraView, camera, distance]);

  const setCameraView = useDesignerStore((s) => s.setCameraView);
  // Mark as free when the user manually orbits
  const onChange = React.useCallback(() => {
    if (cameraView !== "free") setCameraView("free");
  }, [cameraView, setCameraView]);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      minDistance={distance * 0.4}
      maxDistance={distance * 2}
      onStart={onChange}
    />
  );
}

function Scene({
  product,
  onCanvasReady,
}: {
  product: SampleProduct;
  onCanvasReady: (gl: THREE.WebGLRenderer) => void;
}) {
  const meshRef = React.useRef<THREE.Mesh | null>(null);
  const [mesh, setMesh] = React.useState<THREE.Mesh | null>(null);
  const inchesPerUnit = product.model3D?.inchesPerUnit ?? 1;
  const distance = product.model3D?.cameraDistance ?? 60;
  const color = product.model3D?.defaultColor ?? "#d1d5db";

  const { gl } = useThree();
  React.useEffect(() => {
    onCanvasReady(gl);
  }, [gl, onCanvasReady]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[20, 30, 30]} intensity={0.9} castShadow />
      <directionalLight position={[-20, 10, -10]} intensity={0.35} />
      <Environment preset="studio" environmentIntensity={0.4} />
      <ShirtMesh
        ref={meshRef}
        color={color}
        onMeshReady={(m) => setMesh(m)}
      />
      <DecalLayer targetMesh={mesh} inchesPerUnit={inchesPerUnit} />
      <CameraDriver distance={distance} />
    </>
  );
}

export type Viewer3DApi = {
  getCanvas: () => HTMLCanvasElement | null;
  /** Snapshot the current 3D scene as a PNG data URL (for save/proof). */
  exportPNG: () => string | null;
};

export function Viewer3D({
  product,
  apiRef,
}: {
  product: SampleProduct;
  apiRef?: React.MutableRefObject<Viewer3DApi | null>;
}) {
  const glRef = React.useRef<THREE.WebGLRenderer | null>(null);
  const distance = product.model3D?.cameraDistance ?? 60;

  React.useEffect(() => {
    if (!apiRef) return;
    apiRef.current = {
      getCanvas: () => glRef.current?.domElement ?? null,
      exportPNG: () => {
        const gl = glRef.current;
        if (!gl) return null;
        // Force a render so the screenshot reflects the latest state.
        try {
          // The R3F render loop may have skipped a frame; we read whatever
          // is currently in the framebuffer. This is fine for save flows
          // where the user has been viewing the scene before clicking save.
          return gl.domElement.toDataURL("image/png");
        } catch {
          return null;
        }
      },
    };
    return () => {
      if (apiRef) apiRef.current = null;
    };
  }, [apiRef]);

  // Suspend orbit when an element is being dragged would be nicer; for
  // now we rely on event.stopPropagation in the Decal pointer handlers
  // to prevent OrbitControls from grabbing the input.
  return (
    <div className="relative w-full aspect-square rounded-lg border border-ink/10 bg-paper-warm overflow-hidden">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        camera={{ position: [0, 0, distance], fov: 35, near: 0.1, far: distance * FAR_DISTANCE_MULTIPLIER * 5 }}
      >
        <React.Suspense fallback={null}>
          <Scene
            product={product}
            onCanvasReady={(gl) => {
              glRef.current = gl;
            }}
          />
        </React.Suspense>
      </Canvas>
    </div>
  );
}
