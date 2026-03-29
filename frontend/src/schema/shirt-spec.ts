/**
 * Shirt garment spec schema - the single source of truth for shirt preview.
 * This defines the contract between UI input and preview rendering.
 */

export type ShirtFit = "slim" | "regular" | "relaxed";
export type ShirtSleeveLength = "short" | "long" | "sleeveless";
export type ShirtNeckline = "crew" | "v-neck" | "polo" | "henley";
export type ShirtHemLength = "regular" | "extended" | "cropped";

export interface ShirtArtwork {
  /** SVG path data from user drawing */
  pathData: string;
  /** Primary color used in artwork */
  primaryColor: string;
  /** Whether artwork is visible */
  visible: boolean;
}

export interface ShirtGarmentSpec {
  /** Unique identifier for this shirt design */
  id: string;
  /** Base color of the shirt fabric */
  baseColor: string;
  /** Fit silhouette */
  fit: ShirtFit;
  /** Sleeve length */
  sleeveLength: ShirtSleeveLength;
  /** Neckline style */
  neckline: ShirtNeckline;
  /** Hem length */
  hemLength: ShirtHemLength;
  /** Front artwork/drawing */
  frontArtwork: ShirtArtwork | null;
  /** Back artwork/drawing */
  backArtwork: ShirtArtwork | null;
  /** Timestamp of last update */
  updatedAt: number;
}

/**
 * Creates a default shirt spec with minimal valid values.
 */
export function createDefaultShirtSpec(): ShirtGarmentSpec {
  return {
    id: `shirt-${Date.now()}`,
    baseColor: "#ffffff",
    fit: "regular",
    sleeveLength: "short",
    neckline: "crew",
    hemLength: "regular",
    frontArtwork: null,
    backArtwork: null,
    updatedAt: Date.now(),
  };
}

/**
 * Validates that a shirt spec has all required fields.
 */
export function isValidShirtSpec(spec: unknown): spec is ShirtGarmentSpec {
  if (!spec || typeof spec !== "object") return false;

  const s = spec as Record<string, unknown>;

  return (
    typeof s.id === "string" &&
    typeof s.baseColor === "string" &&
    isShirtFit(s.fit) &&
    isShirtSleeveLength(s.sleeveLength) &&
    isShirtNeckline(s.neckline) &&
    isShirtHemLength(s.hemLength) &&
    isValidArtwork(s.frontArtwork) &&
    isValidArtwork(s.backArtwork) &&
    typeof s.updatedAt === "number"
  );
}

function isShirtFit(value: unknown): value is ShirtFit {
  return ["slim", "regular", "relaxed"].includes(value as string);
}

function isShirtSleeveLength(value: unknown): value is ShirtSleeveLength {
  return ["short", "long", "sleeveless"].includes(value as string);
}

function isShirtNeckline(value: unknown): value is ShirtNeckline {
  return ["crew", "v-neck", "polo", "henley"].includes(value as string);
}

function isShirtHemLength(value: unknown): value is ShirtHemLength {
  return ["regular", "extended", "cropped"].includes(value as string);
}

function isValidArtwork(value: unknown): boolean {
  if (value === null) return true; // null is valid for optional artwork
  if (!value || typeof value !== "object") return false;

  const a = value as Record<string, unknown>;
  return (
    typeof a.pathData === "string" &&
    typeof a.primaryColor === "string" &&
    typeof a.visible === "boolean"
  );
}

/**
 * Transforms drawing strokes into artwork for the spec.
 */
export function strokesToArtwork(
  strokes: Array<{ path: string; color: string }>,
): ShirtArtwork | null {
  if (!strokes || strokes.length === 0) return null;

  // Combine all paths into single path data
  const combinedPath = strokes.map((s) => s.path).join(" ");

  // Use the most common color as primary
  const colorCounts = new Map<string, number>();
  for (const stroke of strokes) {
    colorCounts.set(stroke.color, (colorCounts.get(stroke.color) || 0) + 1);
  }
  const primaryColor =
    Array.from(colorCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "#000000";

  return {
    pathData: combinedPath,
    primaryColor,
    visible: true,
  };
}
