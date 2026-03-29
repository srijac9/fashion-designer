import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, {
  Defs,
  LinearGradient,
  Path,
  Polygon,
  Rect,
  Stop,
} from "react-native-svg";
import type { CameraPreset, ModelRenderConfig } from "../api/client";
import { palette } from "../theme";
import {
  buildProjectedScene,
  proceduralViewerLayout,
} from "./proceduralMesh";

interface ProceduralModelViewerProps {
  modelRenderConfig: ModelRenderConfig;
  activeCamera: CameraPreset | null;
}

export function ProceduralModelViewer({
  modelRenderConfig,
  activeCamera,
}: ProceduralModelViewerProps) {
  const scene = useMemo(() => {
    const camera =
      activeCamera ??
      modelRenderConfig.cameraPresets.find(
        (preset) => preset.id === modelRenderConfig.activeCameraId,
      ) ??
      modelRenderConfig.cameraPresets[0];

    if (!camera) {
      return null;
    }

    return buildProjectedScene({
      blueprint: modelRenderConfig.garmentBlueprint,
      camera,
      materialBindings: modelRenderConfig.materialBindings,
      artworkBindings: modelRenderConfig.artworkBindings,
    });
  }, [activeCamera, modelRenderConfig]);

  return (
    <View style={styles.shell}>
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${proceduralViewerLayout.width} ${proceduralViewerLayout.height}`}
      >
        <Defs>
          <LinearGradient id="viewer-bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#f8f1e8" />
            <Stop offset="100%" stopColor="#efe3d3" />
          </LinearGradient>
          <LinearGradient id="stage-floor" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="rgba(166, 132, 97, 0.18)" />
            <Stop offset="100%" stopColor="rgba(114, 82, 50, 0.04)" />
          </LinearGradient>
        </Defs>

        <Rect
          x={0}
          y={0}
          width={proceduralViewerLayout.width}
          height={proceduralViewerLayout.height}
          rx={28}
          fill="url(#viewer-bg)"
        />

        <Path
          d="M 64 350 C 120 334 220 334 276 350 C 242 372 100 372 64 350 Z"
          fill="url(#stage-floor)"
        />

        {scene?.mannequin ? (
          <Polygon
            points={scene.mannequin.map(([x, y]) => `${x},${y}`).join(" ")}
            fill="rgba(255,255,255,0.48)"
            stroke="rgba(193, 168, 143, 0.55)"
            strokeWidth={1.2}
          />
        ) : null}

        {scene?.triangles.map((triangle) => (
          <Polygon
            key={triangle.id}
            points={triangle.points.map(([x, y]) => `${x},${y}`).join(" ")}
            fill={triangle.fill}
            stroke="rgba(78, 58, 42, 0.2)"
            strokeWidth={0.8}
          />
        ))}

        {scene?.artwork.map((artwork) => (
          <Polygon
            key={`${artwork.side}-${artwork.label}`}
            points={artwork.points.map(([x, y]) => `${x},${y}`).join(" ")}
            fill={artwork.color}
            fillOpacity={0.8}
            stroke="rgba(255,255,255,0.8)"
            strokeWidth={1.2}
          />
        ))}
      </Svg>

      <View style={styles.overlay}>
        <Text style={styles.overlayTitle}>Procedural 3D Garment View</Text>
        <Text style={styles.overlayMeta}>
          {modelRenderConfig.generatedShirtAsset.vertexCount} vertices •{" "}
          {modelRenderConfig.generatedShirtAsset.triangleCount} triangles
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    height: 360,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e3d4c5",
    backgroundColor: "#f8f2ea",
  },
  overlay: {
    position: "absolute",
    top: 14,
    left: 14,
    right: 14,
    gap: 2,
  },
  overlayTitle: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "700",
  },
  overlayMeta: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: "600",
  },
});
