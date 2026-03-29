/**
 * Simple shirt preview viewer - renders garment spec as clear visual preview.
 * Optimized for clarity over realism, showing front/back views side by side.
 */

import { useMemo } from "react";
import { StyleSheet, View, Text } from "react-native";
import Svg, { Rect, Path, Circle, Ellipse, Line } from "react-native-svg";
import type { ShirtGarmentSpec, ShirtArtwork } from "../schema/shirt-spec";
import { palette } from "../theme";

interface ShirtPreviewProps {
  /** Garment spec as single source of truth */
  spec: ShirtGarmentSpec;
}

export function ShirtPreview({ spec }: ShirtPreviewProps) {
  const frontPathData = useMemo(
    () => spec.frontArtwork?.pathData ?? null,
    [spec.frontArtwork],
  );
  const backPathData = useMemo(
    () => spec.backArtwork?.pathData ?? null,
    [spec.backArtwork],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>3D Preview</Text>
        <Text style={styles.subtitle}>
          Live preview from garment spec
        </Text>
      </View>

      <View style={styles.previewGrid}>
        {/* Front View */}
        <View style={styles.previewPanel}>
          <Text style={styles.panelLabel}>Front</Text>
          <View style={styles.previewCanvas}>
            <ShirtPreviewCanvas
              view="front"
              baseColor={spec.baseColor}
              fit={spec.fit}
              sleeveLength={spec.sleeveLength}
              neckline={spec.neckline}
              artwork={spec.frontArtwork}
            />
          </View>
        </View>

        {/* Back View */}
        <View style={styles.previewPanel}>
          <Text style={styles.panelLabel}>Back</Text>
          <View style={styles.previewCanvas}>
            <ShirtPreviewCanvas
              view="back"
              baseColor={spec.baseColor}
              fit={spec.fit}
              sleeveLength={spec.sleeveLength}
              neckline={spec.neckline}
              artwork={spec.backArtwork}
            />
          </View>
        </View>
      </View>

      {/* Spec Summary */}
      <View style={styles.specSummary}>
        <SpecBadge label="Fit" value={spec.fit} />
        <SpecBadge label="Sleeves" value={spec.sleeveLength} />
        <SpecBadge label="Neckline" value={spec.neckline} />
        <SpecBadge label="Hem" value={spec.hemLength} />
      </View>
    </View>
  );
}

interface ShirtPreviewCanvasProps {
  view: "front" | "back";
  baseColor: string;
  fit: ShirtGarmentSpec["fit"];
  sleeveLength: ShirtGarmentSpec["sleeveLength"];
  neckline: ShirtGarmentSpec["neckline"];
  artwork: ShirtArtwork | null;
}

function ShirtPreviewCanvas({
  view,
  baseColor,
  fit,
  sleeveLength,
  neckline,
  artwork,
}: ShirtPreviewCanvasProps) {
  // Fit determines width multiplier
  const widthOffset = fit === "slim" ? 15 : fit === "relaxed" ? 35 : 25;

  // Sleeve length determines arm path
  const sleevePath =
    sleeveLength === "sleeveless"
      ? view === "front"
        ? "M85 95 Q80 110 78 130"
        : "M85 95 Q80 110 78 130"
      : sleeveLength === "short"
        ? view === "front"
          ? "M85 95 Q75 105 70 135 L85 130"
          : "M85 95 Q75 105 70 135 L85 130"
        : view === "front"
          ? "M85 95 Q70 110 65 180 Q63 220 65 260 L80 255"
          : "M85 95 Q70 110 65 180 Q63 220 65 260 L80 255";

  // Neckline determines collar shape
  const neckPath =
    neckline === "v-neck"
      ? "M135 70 L150 95 L165 70"
      : neckline === "polo"
        ? "M135 70 L145 85 L155 85 L165 70"
        : neckline === "henley"
          ? "M140 70 L140 90 M150 70 L150 85 M160 70 L160 90"
          : "M135 70 Q150 80 165 70"; // crew

  // Body outline based on view and fit
  const bodyOutline =
    view === "front"
      ? `M${150 - widthOffset} 95
         Q${150 - widthOffset - 10} 120 ${150 - widthOffset - 5} 180
         L${150 - widthOffset} 320
         Q${150 - widthOffset - 8} 380 ${150 - widthOffset - 3} 450
         L${150 - widthOffset} 520
         L${150 + widthOffset} 520
         L${150 + widthOffset + 3} 450
         Q${150 + widthOffset + 8} 380 ${150 + widthOffset} 320
         L${150 + widthOffset + 5} 180
         Q${150 + widthOffset + 10} 120 ${150 + widthOffset} 95
         Z`
      : `M${150 - widthOffset} 95
         Q${150 - widthOffset - 8} 120 ${150 - widthOffset - 3} 180
         L${150 - widthOffset} 320
         Q${150 - widthOffset - 6} 380 ${150 - widthOffset - 2} 450
         L${150 - widthOffset} 520
         L${150 + widthOffset} 520
         L${150 + widthOffset + 2} 450
         Q${150 + widthOffset + 6} 380 ${150 + widthOffset} 320
         L${150 + widthOffset + 3} 180
         Q${150 + widthOffset + 8} 120 ${150 + widthOffset} 95
         Z`;

  return (
    <Svg viewBox="0 0 300 550" style={styles.svg}>
      {/* Background */}
      <Rect x="0" y="0" width="300" height="550" fill="#faf8f5" />

      {/* Shirt body filled with base color */}
      <Path d={bodyOutline} fill={baseColor} stroke={palette.border} strokeWidth="1.5" />

      {/* Neckline */}
      <Path d={neckPath} fill="none" stroke={palette.text} strokeWidth="1.2" />

      {/* Sleeves */}
      {sleeveLength !== "sleeveless" && (
        <>
          {/* Left sleeve */}
          <Path
            d={sleevePath}
            fill={baseColor}
            stroke={palette.border}
            strokeWidth="1.2"
          />
          {/* Right sleeve (mirrored) */}
          <Path
            d={sleevePath.replace(/85/g, "215").replace(/75/g, "225").replace(/70/g, "230").replace(/65/g, "235").replace(/63/g, "237").replace(/80/g, "220").replace(/78/g, "222")
}
            fill={baseColor}
            stroke={palette.border}
            strokeWidth="1.2"
          />
        </>
      )}

      {/* Side seams for fit indication */}
      <Line
        x1={150 - widthOffset}
        y1="180"
        x2={150 - widthOffset}
        y2="320"
        stroke={palette.border}
        strokeWidth="0.8"
        strokeDasharray="4,3"
        opacity="0.6"
      />
      <Line
        x1={150 + widthOffset}
        y1="180"
        x2={150 + widthOffset}
        y2="320"
        stroke={palette.border}
        strokeWidth="0.8"
        strokeDasharray="4,3"
        opacity="0.6"
      />

      {/* Artwork overlay - user drawing shown as texture */}
      {artwork?.visible && artwork.pathData && (
        <Path
          d={artwork.pathData}
          fill="none"
          stroke={artwork.primaryColor}
          strokeWidth="2"
          opacity="0.85"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* Center line for reference */}
      <Line
        x1="150"
        y1="70"
        x2="150"
        y2="520"
        stroke={palette.muted}
        strokeWidth="0.6"
        opacity="0.4"
      />
    </Svg>
  );
}

function SpecBadge({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeLabel}>{label}</Text>
      <Text style={styles.badgeValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.panelBg,
    borderRadius: 20,
    padding: 16,
    gap: 14,
  },
  header: {
    gap: 4,
  },
  title: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "700",
  },
  subtitle: {
    color: palette.muted,
    fontSize: 13,
  },
  previewGrid: {
    flexDirection: "row",
    gap: 12,
  },
  previewPanel: {
    flex: 1,
    gap: 8,
  },
  panelLabel: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  previewCanvas: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: "#fff",
    overflow: "hidden",
    aspectRatio: 300 / 550,
  },
  svg: {
    width: "100%",
    height: "100%",
  },
  specSummary: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  badge: {
    backgroundColor: palette.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 2,
  },
  badgeLabel: {
    color: palette.muted,
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  badgeValue: {
    color: palette.text,
    fontSize: 12,
    fontWeight: "500",
  },
});
