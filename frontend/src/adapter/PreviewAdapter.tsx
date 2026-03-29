/**
 * Preview adapter - transforms UI state into garment spec and feeds viewer.
 * This is the reactive layer that keeps preview in sync with design input.
 */

import { useMemo } from "react";
import type { ShirtGarmentSpec } from "../schema/shirt-spec";
import {
  createDefaultShirtSpec,
  strokesToArtwork,
  type ShirtFit,
  type ShirtSleeveLength,
  type ShirtNeckline,
  type ShirtHemLength,
} from "../schema/shirt-spec";
import type { Stroke, ViewName } from "../components/fashion/types";
import { ShirtPreview } from "../viewer/ShirtPreview";

/**
 * UI state interface - what the adapter consumes from the UI layer.
 */
export interface ShirtDesignState {
  /** Current base color selection */
  baseColor: string;
  /** Fit selection */
  fit: ShirtFit;
  /** Sleeve length selection */
  sleeveLength: ShirtSleeveLength;
  /** Neckline selection */
  neckline: ShirtNeckline;
  /** Hem length selection */
  hemLength: ShirtHemLength;
  /** Front view strokes from canvas */
  frontStrokes: Stroke[];
  /** Back view strokes from canvas */
  backStrokes: Stroke[];
}

/**
 * Transforms UI design state into typed garment spec.
 * Pure function - same input always produces same output.
 */
export function designStateToSpec(state: ShirtDesignState): ShirtGarmentSpec {
  const baseSpec = createDefaultShirtSpec();

  return {
    ...baseSpec,
    baseColor: state.baseColor,
    fit: state.fit,
    sleeveLength: state.sleeveLength,
    neckline: state.neckline,
    hemLength: state.hemLength,
    frontArtwork: strokesToArtwork(
      state.frontStrokes.map((s) => ({ path: s.path, color: s.color })),
    ),
    backArtwork: strokesToArtwork(
      state.backStrokes.map((s) => ({ path: s.path, color: s.color })),
    ),
    updatedAt: Date.now(),
  };
}

/**
 * PreviewAdapter component - consumes design state, renders preview.
 *
 * Usage:
 * ```tsx
 * <PreviewAdapter
 *   baseColor={selectedColor}
 *   fit={fit}
 *   sleeveLength={sleeveLength}
 *   neckline={neckline}
 *   hemLength={hemLength}
 *   strokesByView={strokesByView}
 * />
 * ```
 */
export interface PreviewAdapterProps {
  baseColor: string;
  fit: ShirtFit;
  sleeveLength: ShirtSleeveLength;
  neckline: ShirtNeckline;
  hemLength: ShirtHemLength;
  strokesByView: Record<ViewName, Stroke[]>;
}

export function PreviewAdapter({
  baseColor,
  fit,
  sleeveLength,
  neckline,
  hemLength,
  strokesByView,
}: PreviewAdapterProps) {
  // Memoized spec computation - only recalculates when inputs change
  const garmentSpec = useMemo<ShirtGarmentSpec>(() => {
    return designStateToSpec({
      baseColor,
      fit,
      sleeveLength,
      neckline,
      hemLength,
      frontStrokes: strokesByView.front,
      backStrokes: strokesByView.back,
    });
  }, [baseColor, fit, sleeveLength, neckline, hemLength, strokesByView]);

  // Render preview with spec as single source of truth
  return <ShirtPreview spec={garmentSpec} />;
}
