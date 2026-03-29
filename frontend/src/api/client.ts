/**
 * API client for backend communication.
 * Handles HTTP calls to the FastAPI backend.
 */

import type { ShirtGarmentSpec } from "../schema/shirt-spec";
import type { PipelineStep } from "../pipeline/GarmentPipeline";

// Backend URL - configure via environment or default
const BACKEND_URL = __DEV__
  ? "http://192.168.2.49:8000"
  : "http://192.168.2.49:8000";

export interface PipelineUpdate {
  status: PipelineStep;
  progress: number;
  message: string;
  result?: {
    spec?: ShirtGarmentSpec;
    modelRenderConfig?: ModelRenderConfig;
  };
  error?: string;
}

export interface ModelAssetRef {
  assetId: string;
  format: "glb" | "gltf";
  source: "local-bundle" | "remote-url" | "unconfigured";
  uri: string;
  configured: boolean;
}

export interface ModelMaterialBindings {
  fabricBaseColor: string;
  trimColor: string;
  frontArtworkColor: string | null;
  backArtworkColor: string | null;
}

export interface ModelArtworkBindings {
  frontArtworkPath: string | null;
  backArtworkPath: string | null;
  mappingMode: "decal" | "texture-overlay";
  frontArtworkVisible: boolean;
  backArtworkVisible: boolean;
}

export interface ModelSilhouetteBindings {
  fitPreset: "slim" | "regular" | "relaxed";
  sleevePreset: "short" | "long" | "sleeveless";
  necklinePreset: "crew" | "v-neck" | "polo" | "henley";
  hemPreset: "regular" | "extended" | "cropped";
}

export interface CameraPreset {
  id: string;
  label: string;
  yaw: number;
  pitch: number;
  distance: number;
}

export interface BlueprintMeasurements {
  shoulderWidth: number;
  chestWidth: number;
  waistWidth: number;
  hemWidth: number;
  bodyLength: number;
  armholeDepth: number;
  sleeveLength: number;
  sleeveOpeningWidth: number;
  necklineWidth: number;
  necklineDepth: number;
}

export interface BlueprintPanel {
  id: string;
  kind: "front" | "back" | "sleeve-left" | "sleeve-right" | "neckband";
  polyline: number[][];
  mirroredFrom?: string | null;
}

export interface ArtworkZone {
  side: "front" | "back";
  anchor: "upper-chest" | "full-front" | "upper-back" | "full-back";
  normalizedBounds: number[];
  artworkPath: string | null;
  artworkColor: string | null;
}

export interface GarmentBlueprint {
  blueprintId: string;
  generationMode: "procedural-shirt-builder";
  family: "tank" | "tee" | "long-sleeve";
  measurements: BlueprintMeasurements;
  panels: BlueprintPanel[];
  artworkZones: ArtworkZone[];
  constructionNotes: string[];
  styleTags: string[];
}

export interface GeneratedGarmentAsset {
  assetId: string;
  format: "glb";
  exportStatus: "blueprint-generated" | "glb-export-pending" | "glb-generated";
  outputPath: string;
  outputUri: string;
  manifestPath: string;
  manifestUri: string;
  mannequinAssetUri: string;
  layeringMode: "shirt-over-mannequin";
  vertexCount: number;
  triangleCount: number;
  fileSizeBytes: number;
}

export interface ModelRenderConfig {
  modelAsset: ModelAssetRef;
  garmentBlueprint: GarmentBlueprint;
  generatedShirtAsset: GeneratedGarmentAsset;
  materialBindings: ModelMaterialBindings;
  artworkBindings: ModelArtworkBindings;
  silhouetteBindings: ModelSilhouetteBindings;
  cameraPresets: CameraPreset[];
  activeCameraId: string;
  viewerMode: "true-3d-model";
  renderNotes?: string;
  integrationStatus:
    | "awaiting-asset"
    | "mannequin-ready"
    | "procedural-builder-ready"
    | "ready-for-viewer";
}

export interface GenerateResult {
  success: boolean;
  spec?: ShirtGarmentSpec;
  modelRenderConfig?: ModelRenderConfig;
  error?: string;
}

export function resolveBackendAssetUrl(uri: string): string {
  if (uri.startsWith("http://") || uri.startsWith("https://")) {
    return uri;
  }
  return `${BACKEND_URL}${uri.startsWith("/") ? uri : `/${uri}`}`;
}

/**
 * Generate preview by calling backend.
 * Uses streaming SSE for progress updates.
 */
export async function generatePreview(
  spec: ShirtGarmentSpec,
  onProgress?: (update: PipelineUpdate) => void,
): Promise<GenerateResult> {
  try {
    onProgress?.({
      status: "validate",
      progress: 10,
      message: "Sending design to backend...",
    });

    // Use streaming endpoint for progress updates
    const response = await fetch(`${BACKEND_URL}/api/generate/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ spec }),
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    if (!response.body) {
      return generatePreviewFallback(spec, onProgress);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let finalResult: GenerateResult | null = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          try {
            const update: PipelineUpdate = JSON.parse(data);
            onProgress?.(update);

            // Check if this is the final result
            if (update.status === "complete" && update.result) {
              finalResult = {
                success: true,
                spec: update.result.spec,
                modelRenderConfig: update.result.modelRenderConfig,
              };
            } else if (update.status === "error") {
              finalResult = {
                success: false,
                error: update.error || "Unknown error",
              };
            }
          } catch (e) {
            console.warn("Failed to parse SSE data:", e);
          }
        }
      }
    }

    return (
      finalResult || {
        success: false,
        error: "No result received from backend",
      }
    );
  } catch (e) {
    const error = e instanceof Error ? e.message : "Network error";
    return {
      success: false,
      error,
    };
  }
}

async function generatePreviewFallback(
  spec: ShirtGarmentSpec,
  onProgress?: (update: PipelineUpdate) => void,
): Promise<GenerateResult> {
  try {
    onProgress?.({
      status: "process",
      progress: 45,
      message: "Streaming unavailable, using standard request...",
    });

    const response = await fetch(`${BACKEND_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ spec }),
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const data: PipelineUpdate = await response.json();
    onProgress?.({
      status: data.status,
      progress: data.progress,
      message: data.message,
      error: data.error,
      result: data.result,
    });

    if (data.status === "complete" && data.result) {
      return {
        success: true,
        spec: data.result.spec,
        modelRenderConfig: data.result.modelRenderConfig,
      };
    }

    return {
      success: false,
      error: data.error || "No result received from backend",
    };
  } catch (e) {
    const error = e instanceof Error ? e.message : "Network error";
    return {
      success: false,
      error,
    };
  }
}

/**
 * Health check endpoint.
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
}
