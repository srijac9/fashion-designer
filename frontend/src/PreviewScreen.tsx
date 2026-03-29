import { useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import {
  type CameraPreset,
  resolveBackendAssetUrl,
  type ModelRenderConfig,
} from "./api/client";
import type { ShirtGarmentSpec } from "./schema/shirt-spec";
import { palette } from "./theme";
import { ProceduralModelViewer } from "./viewer/ProceduralModelViewer";

interface PreviewScreenProps {
  spec: ShirtGarmentSpec;
  modelRenderConfig: ModelRenderConfig | null;
  onBack: () => void;
  onEdit: () => void;
}

export function PreviewScreen({
  spec,
  modelRenderConfig,
  onBack,
  onEdit,
}: PreviewScreenProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 1024;
  const [activeCameraId, setActiveCameraId] = useState(
    modelRenderConfig?.activeCameraId ?? "hero",
  );

  const activeCamera = useMemo(
    () =>
      modelRenderConfig?.cameraPresets.find((preset) => preset.id === activeCameraId) ??
      modelRenderConfig?.cameraPresets[0] ??
      null,
    [activeCameraId, modelRenderConfig],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Back</Text>
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Generated Model</Text>
            <Text style={styles.subtitle}>
              Separate model screen driven by garment spec, procedural blueprint, generated GLB, and render bindings.
            </Text>
          </View>
          <Pressable onPress={onEdit} style={styles.primaryOutlineButton}>
            <Text style={styles.primaryOutlineButtonText}>Edit</Text>
          </Pressable>
        </View>

        <View style={[styles.grid, isTablet && styles.gridTablet]}>
          <View style={styles.stageColumn}>
            <View style={styles.stageCard}>
              <View style={styles.stageHeader}>
                <Text style={styles.cardTitle}>3D Model Stage</Text>
                <StatusPill
                  label={
                    modelRenderConfig?.integrationStatus === "ready-for-viewer"
                      ? "Asset Ready"
                      : modelRenderConfig?.integrationStatus === "procedural-builder-ready"
                        ? "Blueprint Ready"
                      : modelRenderConfig?.integrationStatus === "mannequin-ready"
                        ? "Mannequin Ready"
                      : "Asset Needed"
                  }
                />
              </View>
              <ModelStageHero
                spec={spec}
                modelRenderConfig={modelRenderConfig}
                activeCamera={activeCamera}
                activeCameraLabel={activeCamera?.label ?? "Hero"}
              />
              <Text style={styles.stageNote}>
                {modelRenderConfig?.renderNotes ??
                  "No model config returned yet. Attach the real mannequin asset and map this config into the viewer layer."}
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Camera Presets</Text>
              <View style={styles.cameraRow}>
                {(modelRenderConfig?.cameraPresets ?? []).map((preset) => (
                  <Pressable
                    key={preset.id}
                    onPress={() => setActiveCameraId(preset.id)}
                    style={[
                      styles.cameraButton,
                      activeCamera?.id === preset.id && styles.cameraButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.cameraButtonText,
                        activeCamera?.id === preset.id && styles.cameraButtonTextActive,
                      ]}
                    >
                      {preset.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {activeCamera ? (
                <Text style={styles.cameraMeta}>
                  yaw {activeCamera.yaw} deg, pitch {activeCamera.pitch} deg, distance{" "}
                  {activeCamera.distance.toFixed(1)}
                </Text>
              ) : (
                <Text style={styles.cameraMeta}>No camera presets available.</Text>
              )}
            </View>
          </View>

          <View style={styles.detailColumn}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Generated Asset</Text>
              <SpecRow
                label="Asset Id"
                value={modelRenderConfig?.generatedShirtAsset.assetId ?? "unconfigured"}
              />
              <SpecRow
                label="Format"
                value={modelRenderConfig?.generatedShirtAsset.format ?? "glb"}
              />
              <SpecRow
                label="Mannequin"
                value={
                  modelRenderConfig
                    ? resolveBackendAssetUrl(modelRenderConfig.modelAsset.uri)
                    : "unconfigured"
                }
              />
              <SpecRow
                label="Shirt Output"
                value={
                  modelRenderConfig
                    ? resolveBackendAssetUrl(modelRenderConfig.generatedShirtAsset.outputUri)
                    : "not generated"
                }
              />
              <SpecRow
                label="Export Status"
                value={modelRenderConfig?.generatedShirtAsset.exportStatus ?? "unknown"}
              />
              <SpecRow
                label="Vertices"
                value={String(modelRenderConfig?.generatedShirtAsset.vertexCount ?? 0)}
              />
              <SpecRow
                label="Triangles"
                value={String(modelRenderConfig?.generatedShirtAsset.triangleCount ?? 0)}
              />
              <SpecRow
                label="File Size"
                value={`${modelRenderConfig?.generatedShirtAsset.fileSizeBytes ?? 0} bytes`}
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Procedural Blueprint</Text>
              <BindingChipRow
                chips={[
                  `family: ${modelRenderConfig?.garmentBlueprint.family ?? "tee"}`,
                  `fit: ${modelRenderConfig?.silhouetteBindings.fitPreset ?? spec.fit}`,
                  `sleeves: ${
                    modelRenderConfig?.silhouetteBindings.sleevePreset ?? spec.sleeveLength
                  }`,
                  `neck: ${
                    modelRenderConfig?.silhouetteBindings.necklinePreset ?? spec.neckline
                  }`,
                  `hem: ${modelRenderConfig?.silhouetteBindings.hemPreset ?? spec.hemLength}`,
                ]}
              />
              <SpecRow
                label="Blueprint Id"
                value={modelRenderConfig?.garmentBlueprint.blueprintId ?? "not generated"}
              />
              <SpecRow
                label="Panels"
                value={String(modelRenderConfig?.garmentBlueprint.panels.length ?? 0)}
              />
              <SpecRow
                label="Manifest"
                value={
                  modelRenderConfig
                    ? resolveBackendAssetUrl(modelRenderConfig.generatedShirtAsset.manifestUri)
                    : "not written"
                }
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Material + Artwork</Text>
              <SpecRow
                label="Fabric Base"
                value={modelRenderConfig?.materialBindings.fabricBaseColor ?? spec.baseColor}
                swatch={modelRenderConfig?.materialBindings.fabricBaseColor ?? spec.baseColor}
              />
              <SpecRow
                label="Trim"
                value={modelRenderConfig?.materialBindings.trimColor ?? "n/a"}
                swatch={modelRenderConfig?.materialBindings.trimColor ?? undefined}
              />
              <SpecRow
                label="Front Artwork"
                value={
                  modelRenderConfig?.artworkBindings.frontArtworkVisible ? "Mapped" : "Not mapped"
                }
              />
              <SpecRow
                label="Back Artwork"
                value={
                  modelRenderConfig?.artworkBindings.backArtworkVisible ? "Mapped" : "Not mapped"
                }
              />
              <SpecRow
                label="Mapping"
                value={modelRenderConfig?.artworkBindings.mappingMode ?? "decal"}
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Builder Measurements</Text>
              <BindingChipRow
                chips={[
                  `shoulders: ${
                    modelRenderConfig?.garmentBlueprint.measurements.shoulderWidth ?? 0
                  }`,
                  `chest: ${modelRenderConfig?.garmentBlueprint.measurements.chestWidth ?? 0}`,
                  `waist: ${modelRenderConfig?.garmentBlueprint.measurements.waistWidth ?? 0}`,
                  `length: ${modelRenderConfig?.garmentBlueprint.measurements.bodyLength ?? 0}`,
                  `sleeve: ${modelRenderConfig?.garmentBlueprint.measurements.sleeveLength ?? 0}`,
                  `neck depth: ${
                    modelRenderConfig?.garmentBlueprint.measurements.necklineDepth ?? 0
                  }`,
                ]}
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Next Integration Step</Text>
              <Text style={styles.integrationCopy}>
                The app is now rendering the generated shirt geometry from the same
                procedural blueprint that the backend exports to GLB. The mannequin
                asset and generated shirt asset are also reachable over HTTP for the
                next runtime step that loads the real files directly.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ModelStageHero({
  spec,
  modelRenderConfig,
  activeCamera,
  activeCameraLabel,
}: {
  spec: ShirtGarmentSpec;
  modelRenderConfig: ModelRenderConfig | null;
  activeCamera: CameraPreset | null;
  activeCameraLabel: string;
}) {
  const cameraText = activeCamera
    ? `yaw ${activeCamera.yaw} deg, pitch ${activeCamera.pitch} deg`
    : "camera unavailable";

  return (
    <View style={styles.stageShell}>
      {modelRenderConfig ? (
        <ProceduralModelViewer
          modelRenderConfig={modelRenderConfig}
          activeCamera={activeCamera}
        />
      ) : (
        <View style={styles.emptyViewer}>
          <Text style={styles.emptyViewerTitle}>Model viewer not ready yet</Text>
          <Text style={styles.emptyViewerCopy}>
            Generate a shirt to build the procedural mesh and viewer bindings.
          </Text>
        </View>
      )}
      <View style={styles.stageOverlay}>
        <StatusPill label={activeCameraLabel} subtle />
        <StatusPill label={spec.fit} subtle />
        <StatusPill label={cameraText} subtle />
      </View>
    </View>
  );
}

function BindingChipRow({ chips }: { chips: string[] }) {
  return (
    <View style={styles.bindingRow}>
      {chips.map((chip) => (
        <View key={chip} style={styles.bindingChip}>
          <Text style={styles.bindingChipText}>{chip}</Text>
        </View>
      ))}
    </View>
  );
}

function SpecRow({
  label,
  value,
  swatch,
}: {
  label: string;
  value: string;
  swatch?: string;
}) {
  return (
    <View style={styles.specRow}>
      <Text style={styles.specLabel}>{label}</Text>
      <View style={styles.specValueWrap}>
        {swatch ? <View style={[styles.swatch, { backgroundColor: swatch }]} /> : null}
        <Text style={styles.specValue}>{value}</Text>
      </View>
    </View>
  );
}

function StatusPill({ label, subtle = false }: { label: string; subtle?: boolean }) {
  return (
    <View style={[styles.statusPill, subtle && styles.statusPillSubtle]}>
      <Text style={[styles.statusPillText, subtle && styles.statusPillTextSubtle]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.pageBg,
  },
  container: {
    flex: 1,
  },
  content: {
    gap: 18,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: palette.text,
    fontSize: 22,
    fontWeight: "700",
  },
  subtitle: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  secondaryButton: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.border,
  },
  secondaryButtonText: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "700",
  },
  primaryOutlineButton: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: palette.accentSoft,
    borderWidth: 1,
    borderColor: palette.accent,
  },
  primaryOutlineButtonText: {
    color: palette.accent,
    fontSize: 13,
    fontWeight: "700",
  },
  grid: {
    gap: 18,
  },
  gridTablet: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  stageColumn: {
    gap: 18,
    flex: 1.1,
  },
  detailColumn: {
    gap: 18,
    flex: 0.9,
  },
  stageCard: {
    backgroundColor: palette.panelBg,
    borderRadius: 22,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: palette.border,
  },
  card: {
    backgroundColor: "rgba(252, 248, 243, 0.96)",
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: palette.border,
  },
  stageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  cardTitle: {
    color: palette.text,
    fontSize: 14,
    fontWeight: "700",
  },
  stageShell: {
    gap: 0,
  },
  emptyViewer: {
    height: 360,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#e3d4c5",
    backgroundColor: "#f8f2eb",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 10,
  },
  emptyViewerTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "700",
  },
  emptyViewerCopy: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  stageOverlay: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: palette.accentSoft,
  },
  statusPillSubtle: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: palette.border,
  },
  statusPillText: {
    color: palette.accent,
    fontSize: 11,
    fontWeight: "700",
  },
  statusPillTextSubtle: {
    color: palette.text,
  },
  stageNote: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  cameraRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  cameraButton: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.border,
  },
  cameraButtonActive: {
    backgroundColor: palette.accentSoft,
    borderColor: palette.accent,
  },
  cameraButtonText: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "600",
  },
  cameraButtonTextActive: {
    color: palette.accent,
    fontWeight: "700",
  },
  cameraMeta: {
    color: palette.muted,
    fontSize: 12,
  },
  bindingRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  bindingChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.border,
  },
  bindingChipText: {
    color: palette.text,
    fontSize: 12,
    fontWeight: "600",
  },
  specRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  specLabel: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  specValueWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    maxWidth: "58%",
  },
  specValue: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "right",
    flexShrink: 1,
  },
  swatch: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: palette.border,
  },
  integrationCopy: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 19,
  },
});
