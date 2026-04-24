/**
 * Google Gemini "Nano Banana 2" image generation client.
 * Model: gemini-2.5-flash-image
 *
 * Prompt writing discipline (embed in manifest):
 *  - Lead with subject + action.
 *  - Specify lens / light ("85mm, shallow depth of field, soft north-window light"
 *    / "overhead studio flat-lay with crisp shadows").
 *  - Describe environment + props.
 *  - State mood and color grade.
 *  - For photography, end with: "photorealistic, ultra-detailed, commercial product photography".
 *  - For illustrations, use brand-consistent descriptors.
 *  - Brand-safe only.
 */
import { GoogleGenAI } from "@google/genai";

export const NANO_BANANA_MODEL = "gemini-2.5-flash-image";

let client: GoogleGenAI | null = null;
export function getGeminiClient() {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("GOOGLE_API_KEY is not set");
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
  }
  return client;
}

export type GenerateImageInput = {
  prompt: string;
  /** ISO aspect token like "4:3", "16:9", "1:1", "1200:630". */
  aspect?: string;
  /** Used for branding consistency within a single session. */
  brandPalette?: string;
  style?: string;
};

export type GeneratedImage = {
  /** base64-encoded bytes of the raw image */
  base64: string;
  mimeType: string;
  /** echo of the full prompt sent to the model */
  expandedPrompt: string;
};

export async function generateImage(input: GenerateImageInput): Promise<GeneratedImage> {
  const expandedPrompt = composePrompt(input);

  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: NANO_BANANA_MODEL,
    contents: [{ role: "user", parts: [{ text: expandedPrompt }] }],
  });

  return extractImageFromResponse(response, expandedPrompt);
}

export type GenerateImageFromReferenceInput = GenerateImageInput & {
  /** HTTPS URL of a reference photo to alter (passed as inline image to Gemini). */
  referenceImageUrl: string;
};

/**
 * Generate an image using a reference photo as the visual basis. Useful when
 * a real branded item photo is preferable to a hallucinated look-alike — the
 * model alters materials/lighting/background per the prompt while preserving
 * the silhouette of the reference.
 */
export async function generateImageFromReference(
  input: GenerateImageFromReferenceInput,
): Promise<GeneratedImage> {
  const promptWithGuidance = `${input.prompt.trim()}\n\nUse the attached reference photo as the visual basis for the product. Alter materials, lighting, background, and any branding/text per the description. Do not reproduce visible logos or trademark text from the reference — produce a brand-safe variant.`;
  const expandedPrompt = composePrompt({ ...input, prompt: promptWithGuidance });

  const res = await fetch(input.referenceImageUrl);
  if (!res.ok) {
    throw new Error(`Reference image fetch failed: ${res.status} ${res.statusText}`);
  }
  const refMime = res.headers.get("content-type") ?? "image/jpeg";
  const refBytes = Buffer.from(await res.arrayBuffer());
  const refBase64 = refBytes.toString("base64");

  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: NANO_BANANA_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType: refMime, data: refBase64 } },
          { text: expandedPrompt },
        ],
      },
    ],
  });

  return extractImageFromResponse(response, expandedPrompt);
}

function extractImageFromResponse(
  response: { candidates?: Array<{ content?: { parts?: Array<unknown> } }> },
  expandedPrompt: string,
): GeneratedImage {
  const candidates = response.candidates ?? [];
  for (const cand of candidates) {
    for (const part of cand.content?.parts ?? []) {
      const inline = (part as { inlineData?: { mimeType?: string; data?: string } })
        .inlineData;
      if (inline?.data) {
        return {
          base64: inline.data,
          mimeType: inline.mimeType ?? "image/png",
          expandedPrompt,
        };
      }
    }
  }
  throw new Error("Nano Banana returned no image data");
}

function composePrompt(input: GenerateImageInput) {
  const parts = [input.prompt.trim()];
  if (input.brandPalette) {
    parts.push(`Brand palette guidance: ${input.brandPalette}.`);
  }
  if (input.aspect) {
    parts.push(
      `Aspect ratio: ${input.aspect}. Compose so the subject reads well at this ratio.`,
    );
  }
  if (input.style) {
    parts.push(input.style);
  }
  parts.push(
    "Final output: high-resolution, no text overlays unless requested, brand-safe, no real trademarked logos.",
  );
  return parts.join("\n\n");
}
