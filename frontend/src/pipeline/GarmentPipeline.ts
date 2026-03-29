/**
 * Garment pipeline - calls backend for real LLM-powered processing.
 * Replaces the simulated pipeline with actual API integration.
 */

import { generatePreview, type ModelRenderConfig } from "../api/client";
import type { ShirtGarmentSpec } from "../schema/shirt-spec";

export type PipelineStep = "validate" | "process" | "prepare" | "complete" | "error";

export interface PipelineState {
  status: PipelineStep;
  progress: number; // 0-100
  message: string;
  error?: string;
}

export interface PipelineResult {
  success: boolean;
  spec?: ShirtGarmentSpec;
  modelRenderConfig?: ModelRenderConfig;
  error?: string;
}

/**
 * Run the garment pipeline by calling the backend.
 * The backend handles validation, spec enhancement, and preview generation via LLM agents.
 */
export async function runGarmentPipeline(
  spec: ShirtGarmentSpec,
  onProgress?: (state: PipelineState) => void,
): Promise<PipelineResult> {
  // Call backend with streaming progress
  const result = await generatePreview(spec, (update) => {
    onProgress?.({
      status: update.status,
      progress: update.progress,
      message: update.message,
      error: update.error,
    });
  });

  if (result.success) {
    return {
      success: true,
      spec: result.spec,
      modelRenderConfig: result.modelRenderConfig,
    };
  } else {
    return {
      success: false,
      error: result.error,
    };
  }
}

/**
 * Simple validation before sending to backend.
 * Catches obvious issues early.
 */
export function validateSpecLocal(spec: ShirtGarmentSpec): { valid: boolean; error?: string } {
  if (!spec.baseColor) {
    return { valid: false, error: "Base color is required" };
  }
  if (!spec.fit) {
    return { valid: false, error: "Fit is required" };
  }
  // Check that at least one side has artwork
  if (!spec.frontArtwork && !spec.backArtwork) {
    return { valid: false, error: "Add artwork to front or back" };
  }
  return { valid: true };
}
