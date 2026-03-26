import { useMemo, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import { palette } from "../../theme";
import { MannequinBack } from "./MannequinBack";
import { MannequinFront } from "./MannequinFront";
import type { Stroke, Tool, ViewName } from "./types";

interface FashionCanvasProps {
  selectedTool: Tool;
  selectedColor: string;
  brushSize: number;
  opacity: number;
  selectedLayerId: string;
  currentView: ViewName;
  isTablet: boolean;
  visibleLayerIds: string[];
  strokesByView: Record<ViewName, Stroke[]>;
  onViewChange: (view: ViewName) => void;
  onDrawingStateChange: (isDrawing: boolean) => void;
  onAddStroke: (view: ViewName, stroke: Stroke, message: string) => void;
  onStatusChange: (message: string) => void;
}

export function FashionCanvas({
  selectedTool,
  selectedColor,
  brushSize,
  opacity,
  selectedLayerId,
  currentView,
  isTablet,
  visibleLayerIds,
  strokesByView,
  onViewChange,
  onDrawingStateChange,
  onAddStroke,
  onStatusChange,
}: FashionCanvasProps) {
  const currentStrokeRef = useRef<Stroke | null>(null);
  const pointsCountRef = useRef(0);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [stageSize, setStageSize] = useState({ width: 1, height: 1 });

  const visibleLayers = useMemo(() => new Set(visibleLayerIds), [visibleLayerIds]);
  const renderedStrokes = useMemo(
    () =>
      strokesByView[currentView].filter((stroke) => visibleLayers.has(stroke.layerId)),
    [currentView, strokesByView, visibleLayers],
  );

  const beginStroke = (locationX: number, locationY: number) => {
    if (selectedTool !== "sketch" && selectedTool !== "eraser") {
      onStatusChange(
        `${selectedTool} is selected. Only sketch and eraser draw on the canvas right now.`,
      );
      return;
    }

    if (!visibleLayers.has(selectedLayerId)) {
      onStatusChange("Unhide the active layer before drawing on it.");
      return;
    }

    const point = toViewBoxPoint(locationX, locationY, stageSize.width, stageSize.height);
    const stroke: Stroke = {
      id: `${selectedLayerId}-${Date.now()}`,
      layerId: selectedLayerId,
      color: selectedColor,
      size: selectedTool === "eraser" ? brushSize * 3 : brushSize,
      opacity,
      mode: selectedTool === "eraser" ? "erase" : "draw",
      path: `M ${point.x} ${point.y} L ${point.x} ${point.y}`,
    };

    currentStrokeRef.current = stroke;
    pointsCountRef.current = 1;
    setCurrentStroke(stroke);
    onDrawingStateChange(true);
  };

  const extendStroke = (locationX: number, locationY: number) => {
    const activeStroke = currentStrokeRef.current;
    if (!activeStroke) {
      return;
    }

    const point = toViewBoxPoint(locationX, locationY, stageSize.width, stageSize.height);
    const nextStroke = {
      ...activeStroke,
      path: `${activeStroke.path} L ${point.x} ${point.y}`,
    };

    currentStrokeRef.current = nextStroke;
    pointsCountRef.current += 1;
    setCurrentStroke(nextStroke);
  };

  const finishStroke = () => {
    const activeStroke = currentStrokeRef.current;
    if (activeStroke && pointsCountRef.current > 0) {
      onAddStroke(
        currentView,
        activeStroke,
        `${activeStroke.mode === "erase" ? "Eraser" : "Stroke"} captured on the ${currentView} view.`,
      );
    }

    currentStrokeRef.current = null;
    pointsCountRef.current = 0;
    setCurrentStroke(null);
    onDrawingStateChange(false);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (event) => {
          beginStroke(event.nativeEvent.locationX, event.nativeEvent.locationY);
        },
        onPanResponderMove: (event) => {
          extendStroke(event.nativeEvent.locationX, event.nativeEvent.locationY);
        },
        onPanResponderRelease: finishStroke,
        onPanResponderTerminate: finishStroke,
      }),
    [
      brushSize,
      currentView,
      onAddStroke,
      onStatusChange,
      opacity,
      selectedColor,
      selectedLayerId,
      selectedTool,
      stageSize.height,
      stageSize.width,
      visibleLayers,
    ],
  );

  const handleStageLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setStageSize({ width, height });
    }
  };

  return (
    <View style={styles.canvasPanel}>
      <View style={styles.canvasHeader}>
        <View style={styles.headerCopy}>
          <Text style={styles.canvasTitle}>Design Canvas</Text>
          <Text style={styles.canvasSubtitle}>
            Use the mannequin as a construction guide and sketch directly over it.
          </Text>
        </View>

        <View style={styles.inputHint}>
          <Text style={styles.inputHintLabel}>Input</Text>
          <Text style={styles.inputHintText}>Apple Pencil + touch ready</Text>
        </View>

        <View style={styles.viewToggle} accessibilityLabel="Mannequin view">
          {(["front", "back"] as const).map((view) => (
            <Pressable
              key={view}
              onPress={() => {
                onViewChange(view);
              }}
              style={[
                styles.viewButton,
                currentView === view && styles.viewButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.viewButtonText,
                  currentView === view && styles.viewButtonTextActive,
                ]}
              >
                {view} view
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.canvasFrame}>
        <View style={styles.canvasFrameHeader}>
          <Text style={styles.canvasFrameTitle}>
            {currentView === "front" ? "Front draft" : "Back draft"}
          </Text>
          <Text style={styles.canvasFrameNote}>
            Rest your hand on screen and sketch directly over the form.
          </Text>
        </View>
        <View style={[styles.canvasBoard, isTablet && styles.canvasBoardTablet]}>
          <View
            onLayout={handleStageLayout}
            style={[styles.canvasStage, isTablet && styles.canvasStageTablet]}
            {...panResponder.panHandlers}
          >
          <Svg
            pointerEvents="none"
            width="100%"
            height="100%"
            viewBox="0 0 300 550"
            preserveAspectRatio="none"
          >
              <Rect x="0" y="0" width="300" height="550" fill={palette.canvasBg} />
              {renderedStrokes.map((stroke) => (
                <Path
                  key={stroke.id}
                  d={stroke.path}
                  fill="none"
                  opacity={stroke.mode === "erase" ? 1 : stroke.opacity}
                  stroke={stroke.mode === "erase" ? palette.canvasBg : stroke.color}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={stroke.size}
                />
              ))}
              {currentStroke ? (
                <Path
                  d={currentStroke.path}
                  fill="none"
                  opacity={currentStroke.mode === "erase" ? 1 : currentStroke.opacity}
                  stroke={
                    currentStroke.mode === "erase"
                      ? palette.canvasBg
                      : currentStroke.color
                  }
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={currentStroke.size}
                />
              ) : null}
            </Svg>
            {currentView === "front" ? (
              <MannequinFront style={styles.mannequin} />
            ) : (
              <MannequinBack style={styles.mannequin} />
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

function toViewBoxPoint(
  locationX: number,
  locationY: number,
  width: number,
  height: number,
) {
  const x = clamp((locationX / width) * 300, 0, 300);
  const y = clamp((locationY / height) * 550, 0, 550);

  return {
    x: Number(x.toFixed(2)),
    y: Number(y.toFixed(2)),
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

const styles = StyleSheet.create({
  canvasPanel: {
    minWidth: 0,
    gap: 12,
  },
  canvasHeader: {
    gap: 14,
  },
  headerCopy: {
    gap: 4,
  },
  canvasTitle: {
    color: palette.text,
    fontSize: 24,
    fontWeight: "700",
  },
  canvasSubtitle: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 680,
  },
  inputHint: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e7d8c9",
    backgroundColor: "#fbf6f0",
  },
  inputHintLabel: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  inputHintText: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
  viewToggle: {
    flexDirection: "row",
    alignSelf: "stretch",
    padding: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: "rgba(255, 255, 255, 0.55)",
    gap: 4,
  },
  viewButton: {
    flex: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "center",
  },
  viewButtonActive: {
    backgroundColor: palette.white,
  },
  viewButtonText: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  viewButtonTextActive: {
    color: palette.text,
  },
  canvasFrame: {
    width: "100%",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: "#f5ecdf",
    padding: 16,
    gap: 12,
  },
  canvasFrameHeader: {
    gap: 4,
  },
  canvasFrameTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "700",
  },
  canvasFrameNote: {
    color: palette.muted,
    fontSize: 13,
  },
  canvasBoard: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#e3d3c3",
    backgroundColor: "#fbf7f2",
    padding: 12,
  },
  canvasBoardTablet: {
    padding: 10,
  },
  canvasStage: {
    width: "100%",
    maxWidth: 560,
    aspectRatio: 300 / 320,
    overflow: "hidden",
    borderRadius: 28,
    position: "relative",
    backgroundColor: palette.canvasBg,
  },
  canvasStageTablet: {
    maxWidth: 840,
  },
  mannequin: {
    ...StyleSheet.absoluteFillObject,
  },
});
