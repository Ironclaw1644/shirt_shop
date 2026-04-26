import * as THREE from "three";
import type { DecalAnchor } from "./types";
import type { Vec3 } from "@/lib/catalog/sample-products";

const _o = new THREE.Object3D();
const _normal = new THREE.Vector3();
const _up = new THREE.Vector3();
const _target = new THREE.Vector3();

/**
 * Compute the Euler rotation that orients a decal so it projects along
 * `-normal` with `up` as its world-up reference. Adds the in-plane
 * `rotation` component around the normal axis last.
 */
export function anchorToEuler(anchor: DecalAnchor): THREE.Euler {
  _normal.fromArray(anchor.normal).normalize();
  _up.fromArray(anchor.up).normalize();
  _o.position.fromArray(anchor.position);
  _o.up.copy(_up);
  _target.copy(_o.position).add(_normal);
  _o.lookAt(_target);
  // In-plane rotation around the local Z axis (DecalGeometry orients along Z)
  _o.rotateZ(anchor.rotation);
  return _o.rotation.clone();
}

export function vecFromTriple(v: Vec3): THREE.Vector3 {
  return new THREE.Vector3(v[0], v[1], v[2]);
}

export function tripleFromVec(v: THREE.Vector3): Vec3 {
  return [v.x, v.y, v.z];
}
