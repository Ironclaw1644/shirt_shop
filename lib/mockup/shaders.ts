// WebGL2 shader strings for the photoreal mockup composite.
//
// Inputs (textures):
//   uPhoto      RGBA  studio photo of the (white) garment
//   uDisp       R     depth/displacement (bright = closer = higher)
//   uLight      R     normalized luminance shadow map (0.5 = neutral, <0.5 darkens)
//   uColor      R     garment alpha mask (1 = recolorable, 0 = bg)
//   uZone       R     active print zone alpha (1 = printable, 0 = forbidden)
//   uDesign     RGBA  rasterized design (text + images, transparent bg)
//
// Uniforms:
//   uGarment    vec3  RGB color to multiply into the garment area
//   uDispStrength float  fraction-of-uv displacement amount (0..0.05)
//   uShowZone   float  if >0.5, ghost the print zone with a dashed outline

export const VERTEX_SHADER = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  // Flip Y so texture(0,0) lands at top-left (matches PNG/JPG convention).
  vUv.y = 1.0 - vUv.y;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

export const FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 outColor;

uniform sampler2D uPhoto;
uniform sampler2D uDisp;
uniform sampler2D uLight;
uniform sampler2D uColor;
uniform sampler2D uZone;
uniform sampler2D uDesign;

uniform vec3 uGarment;
uniform float uDispStrength;
uniform float uShowZone;

// Sobel-like depth gradient: estimates how much to slide the design
// sample to follow the cloth folds at this UV.
vec2 depthGradient(vec2 uv, vec2 texel) {
  float l = texture(uDisp, uv - vec2(texel.x, 0.0)).r;
  float r = texture(uDisp, uv + vec2(texel.x, 0.0)).r;
  float t = texture(uDisp, uv - vec2(0.0, texel.y)).r;
  float b = texture(uDisp, uv + vec2(0.0, texel.y)).r;
  return vec2(r - l, b - t);
}

// Convert sRGB → linear → adjust lightness via a multiplicative tint.
// Preserves the photo's luminance variations (folds + shading) while
// shifting hue to the chosen garment color. Works because the source
// photo is a near-white tee where photo.rgb ≈ luminance.
vec3 recolor(vec3 photoRgb, vec3 tint, float mask) {
  // photoRgb should be neutral on the garment area; multiply by tint and
  // clamp. For non-white source, this is approximate but plausible.
  vec3 colored = photoRgb * tint;
  return mix(photoRgb, colored, mask);
}

void main() {
  vec2 texel = vec2(1.0) / vec2(textureSize(uPhoto, 0));

  // Sample the photo and recolor.
  vec4 photo = texture(uPhoto, vUv);
  float colorMask = texture(uColor, vUv).r;
  vec3 base = recolor(photo.rgb, uGarment, colorMask);

  // Displacement: warp the design lookup by the depth gradient so the
  // print follows folds. Strength scales with overall mockup size.
  vec2 grad = depthGradient(vUv, texel);
  vec2 designUv = vUv + grad * uDispStrength * 60.0;
  vec4 design = texture(uDesign, designUv);

  // Light map: multiply over the design so shadow areas darken the print.
  // The map is centered on 0.5 → 1.0 multiplier for unchanged areas.
  float light = texture(uLight, vUv).r;
  float shade = clamp(light * 2.0, 0.4, 1.6);
  vec3 designShaded = design.rgb * shade;

  // Print zone: fades the design at the boundary of the active zone.
  float zoneAlpha = texture(uZone, vUv).r;

  // Composite design over the recolored garment, masked by zone & alpha.
  float a = design.a * zoneAlpha;
  vec3 composite = mix(base, designShaded, a);

  // Optional dashed zone outline for visual reference while empty.
  if (uShowZone > 0.5) {
    float edge = smoothstep(0.30, 0.60, zoneAlpha) - smoothstep(0.62, 0.95, zoneAlpha);
    composite = mix(composite, vec3(0.85, 0.63, 0.09), edge * 0.55);
  }

  outColor = vec4(composite, 1.0);
}
`;
