import { useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { FashionCanvas } from "./components/fashion/FashionCanvas";
import { FashionLayers } from "./components/fashion/FashionLayers";
import { FashionProperties } from "./components/fashion/FashionProperties";
import { FashionToolbar } from "./components/fashion/FashionToolbar";
import { FashionTopBar } from "./components/fashion/FashionTopBar";
import { GenerateButton } from "./components/ui/GenerateButton";
import { PipelineProgress } from "./components/ui/PipelineProgress";
import { PreviewScreen } from "./PreviewScreen";
import { runGarmentPipeline, type PipelineState } from "./pipeline/GarmentPipeline";
import { designStateToSpec } from "./adapter/PreviewAdapter";
import type { ModelRenderConfig } from "./api/client";
import type { Layer, Stroke, Tool, ViewName } from "./components/fashion/types";
import type { ShirtFit, ShirtSleeveLength, ShirtNeckline, ShirtHemLength, ShirtGarmentSpec } from "./schema/shirt-spec";
import { palette } from "./theme";

const initialLayers: Layer[] = [
  { id: "1", name: "Background", visible: true },
  { id: "2", name: "Sketch", visible: true },
  { id: "3", name: "Details", visible: true },
];

function App() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 1024;
  const inspectorWidth = Math.max(280, Math.min(360, Math.round(width * 0.32)));
  const [selectedTool, setSelectedTool] = useState<Tool>("sketch");
  const [selectedColor, setSelectedColor] = useState("#2c2c2c");
  const [brushSize, setBrushSize] = useState(3);
  const [opacity, setOpacity] = useState(1);
  const [layers, setLayers] = useState<Layer[]>(initialLayers);
  const [selectedLayerId, setSelectedLayerId] = useState<string>("2");
  const [currentView, setCurrentView] = useState<ViewName>("front");
  const [isDrawing, setIsDrawing] = useState(false);

  // Shirt design state for preview adapter
  const [shirtFit, setShirtFit] = useState<ShirtFit>("regular");
  const [shirtSleeveLength, setShirtSleeveLength] = useState<ShirtSleeveLength>("short");
  const [shirtNeckline, setShirtNeckline] = useState<ShirtNeckline>("crew");
  const [shirtHemLength, setShirtHemLength] = useState<ShirtHemLength>("regular");
  const [shirtBaseColor, setShirtBaseColor] = useState("#f5f5f5");
  const [strokesByView, setStrokesByView] = useState<Record<ViewName, Stroke[]>>({
    front: [],
    back: [],
  });
  const [redoStrokesByView, setRedoStrokesByView] = useState<Record<ViewName, Stroke[]>>({
    front: [],
    back: [],
  });
  const [statusMessage, setStatusMessage] = useState(
    "Sketch directly on the mannequin to start your concept.",
  );

  // Pipeline and navigation state
  const [showPreviewScreen, setShowPreviewScreen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pipelineState, setPipelineState] = useState<PipelineState | null>(null);
  const [generatedSpec, setGeneratedSpec] = useState<ShirtGarmentSpec | null>(null);
  const [generatedModelConfig, setGeneratedModelConfig] = useState<ModelRenderConfig | null>(null);

  const activeLayerName = useMemo(() => {
    return layers.find((layer) => layer.id === selectedLayerId)?.name ?? "None";
  }, [layers, selectedLayerId]);
  const visibleLayerIds = useMemo(
    () => layers.filter((layer) => layer.visible).map((layer) => layer.id),
    [layers],
  );
  const canUndo = strokesByView[currentView].length > 0;
  const canRedo = redoStrokesByView[currentView].length > 0;

  const handleToggleVisibility = (id: string) => {
    setLayers((currentLayers) =>
      currentLayers.map((layer) =>
        layer.id === id ? { ...layer, visible: !layer.visible } : layer,
      ),
    );
  };

  const handleDelete = (id: string) => {
    setLayers((currentLayers) => {
      if (currentLayers.length <= 1) {
        setStatusMessage("At least one layer needs to stay in the stack.");
        return currentLayers;
      }

      const nextLayers = currentLayers.filter((layer) => layer.id !== id);
      setStrokesByView((currentStrokes) => ({
        front: currentStrokes.front.filter((stroke) => stroke.layerId !== id),
        back: currentStrokes.back.filter((stroke) => stroke.layerId !== id),
      }));
      setRedoStrokesByView((currentStrokes) => ({
        front: currentStrokes.front.filter((stroke) => stroke.layerId !== id),
        back: currentStrokes.back.filter((stroke) => stroke.layerId !== id),
      }));

      if (selectedLayerId === id) {
        setSelectedLayerId(nextLayers[0]?.id ?? "");
      }

      setStatusMessage(
        `Removed the ${currentLayers.find((layer) => layer.id === id)?.name ?? "layer"} layer.`,
      );
      return nextLayers;
    });
  };

  const handleAddStroke = (view: ViewName, stroke: Stroke, message: string) => {
    setStrokesByView((currentStrokes) => ({
      ...currentStrokes,
      [view]: [...currentStrokes[view], stroke],
    }));
    setRedoStrokesByView((currentRedo) => ({
      ...currentRedo,
      [view]: [],
    }));
    setStatusMessage(message);
  };

  const handleUndo = () => {
    let removedStroke: Stroke | null = null;

    setStrokesByView((currentStrokes) => {
      const nextStack = currentStrokes[currentView];
      if (nextStack.length === 0) {
        return currentStrokes;
      }

      removedStroke = nextStack[nextStack.length - 1] ?? null;
      return {
        ...currentStrokes,
        [currentView]: nextStack.slice(0, -1),
      };
    });

    if (!removedStroke) {
      setStatusMessage(`Nothing to undo on the ${currentView} view.`);
      return;
    }

    setRedoStrokesByView((currentRedo) => ({
      ...currentRedo,
      [currentView]: [...currentRedo[currentView], removedStroke as Stroke],
    }));
    setStatusMessage(`Undid the last stroke on the ${currentView} view.`);
  };

  const handleRedo = () => {
    let restoredStroke: Stroke | null = null;

    setRedoStrokesByView((currentRedo) => {
      const redoStack = currentRedo[currentView];
      if (redoStack.length === 0) {
        return currentRedo;
      }

      restoredStroke = redoStack[redoStack.length - 1] ?? null;
      return {
        ...currentRedo,
        [currentView]: redoStack.slice(0, -1),
      };
    });

    if (!restoredStroke) {
      setStatusMessage(`Nothing to redo on the ${currentView} view.`);
      return;
    }

    setStrokesByView((currentStrokes) => ({
      ...currentStrokes,
      [currentView]: [...currentStrokes[currentView], restoredStroke as Stroke],
    }));
    setStatusMessage(`Restored the last stroke on the ${currentView} view.`);
  };

  const handleToolbarAction = (message: string) => {
    setStatusMessage(message);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setPipelineState({ status: "validate", progress: 0, message: "Starting..." });

    const spec = designStateToSpec({
      baseColor: shirtBaseColor,
      fit: shirtFit,
      sleeveLength: shirtSleeveLength,
      neckline: shirtNeckline,
      hemLength: shirtHemLength,
      frontStrokes: strokesByView.front,
      backStrokes: strokesByView.back,
    });

    const result = await runGarmentPipeline(spec, (state) => {
      setPipelineState(state);
    });

    setIsGenerating(false);
    if (result.success && result.spec) {
      setGeneratedSpec(result.spec);
      setGeneratedModelConfig(result.modelRenderConfig ?? null);
      setShowPreviewScreen(true);
      setStatusMessage("Model preview configuration generated successfully!");
    } else {
      setStatusMessage(result.error ?? "Generation failed");
      setPipelineState(null);
    }
  };

  const handleBackToEditor = () => {
    setShowPreviewScreen(false);
    setPipelineState(null);
  };

  const handleEditAgain = () => {
    setShowPreviewScreen(false);
    setPipelineState(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={palette.panelBg} />

      {showPreviewScreen && generatedSpec ? (
        <PreviewScreen
          spec={generatedSpec}
          modelRenderConfig={generatedModelConfig}
          onBack={handleBackToEditor}
          onEdit={handleEditAgain}
        />
      ) : (
        <>
          <FashionTopBar
        selectedTool={selectedTool}
        activeLayerName={activeLayerName}
        currentView={currentView}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onAction={handleToolbarAction}
      />
      <View style={styles.appShell}>
        {isTablet ? (
          <View style={styles.tabletWorkspace}>
            <FashionToolbar
              selectedTool={selectedTool}
              orientation="vertical"
              onToolSelect={(tool) => {
                setSelectedTool(tool);
                setStatusMessage(`Selected the ${tool} tool.`);
              }}
            />
            <ScrollView
              style={styles.canvasColumn}
              contentContainerStyle={styles.canvasColumnContent}
              showsVerticalScrollIndicator={false}
              scrollEnabled={!isDrawing}
            >
              <FashionCanvas
                selectedTool={selectedTool}
                selectedColor={selectedColor}
                brushSize={brushSize}
                opacity={opacity}
                selectedLayerId={selectedLayerId}
                currentView={currentView}
                isTablet={isTablet}
                visibleLayerIds={visibleLayerIds}
                strokesByView={strokesByView}
                onViewChange={(view) => {
                  setCurrentView(view);
                  setStatusMessage(`Switched to the ${view} mannequin view.`);
                }}
                onDrawingStateChange={setIsDrawing}
                onAddStroke={handleAddStroke}
                onStatusChange={setStatusMessage}
              />
            </ScrollView>
            <ScrollView
              style={[
                styles.inspectorRail,
                {
                  width: inspectorWidth,
                  minWidth: inspectorWidth,
                  maxWidth: inspectorWidth,
                },
              ]}
              contentContainerStyle={styles.inspectorRailContent}
              showsVerticalScrollIndicator={false}
            >
              <FashionProperties
                selectedColor={selectedColor}
                onColorChange={(color) => {
                  setSelectedColor(color);
                  setStatusMessage(`Color updated to ${color.toUpperCase()}.`);
                }}
                brushSize={brushSize}
                onBrushSizeChange={(size) => {
                  setBrushSize(size);
                  setStatusMessage(`Brush size set to ${size}px.`);
                }}
                opacity={opacity}
                onOpacityChange={(nextOpacity) => {
                  setOpacity(nextOpacity);
                  setStatusMessage(`Opacity set to ${Math.round(nextOpacity * 100)}%.`);
                }}
                shirtFit={shirtFit}
                onShirtFitChange={(fit) => {
                  setShirtFit(fit);
                  setStatusMessage(`Shirt fit set to ${fit}.`);
                }}
                shirtSleeveLength={shirtSleeveLength}
                onShirtSleeveLengthChange={(sleeveLength) => {
                  setShirtSleeveLength(sleeveLength);
                  setStatusMessage(`Sleeve length set to ${sleeveLength}.`);
                }}
                shirtNeckline={shirtNeckline}
                onShirtNecklineChange={(neckline) => {
                  setShirtNeckline(neckline);
                  setStatusMessage(`Neckline set to ${neckline}.`);
                }}
                shirtHemLength={shirtHemLength}
                onShirtHemLengthChange={(hemLength) => {
                  setShirtHemLength(hemLength);
                  setStatusMessage(`Hem length set to ${hemLength}.`);
                }}
                shirtBaseColor={shirtBaseColor}
                onShirtBaseColorChange={(color) => {
                  setShirtBaseColor(color);
                  setStatusMessage(`Shirt base color updated to ${color.toUpperCase()}.`);
                }}
              />
              <FashionLayers
                layers={layers}
                selectedLayerId={selectedLayerId}
                onLayerSelect={(id) => {
                  setSelectedLayerId(id);
                  setStatusMessage(
                    `Switched to the ${
                      layers.find((layer) => layer.id === id)?.name ?? "selected"
                    } layer.`,
                  );
                }}
                onToggleVisibility={handleToggleVisibility}
                onDelete={handleDelete}
              />
            </ScrollView>
          </View>
        ) : (
          <ScrollView
            style={styles.mobileScroll}
            contentContainerStyle={styles.mobileScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <FashionToolbar
              selectedTool={selectedTool}
              orientation="horizontal"
              onToolSelect={(tool) => {
                setSelectedTool(tool);
                setStatusMessage(`Selected the ${tool} tool.`);
              }}
            />
            <FashionCanvas
              selectedTool={selectedTool}
              selectedColor={selectedColor}
              brushSize={brushSize}
              opacity={opacity}
              selectedLayerId={selectedLayerId}
              currentView={currentView}
              isTablet={false}
              visibleLayerIds={visibleLayerIds}
              strokesByView={strokesByView}
              onViewChange={(view) => {
                setCurrentView(view);
                setStatusMessage(`Switched to the ${view} mannequin view.`);
              }}
              onDrawingStateChange={setIsDrawing}
              onAddStroke={handleAddStroke}
              onStatusChange={setStatusMessage}
            />
            <View style={styles.mobileInspector}>
              <FashionProperties
                selectedColor={selectedColor}
                onColorChange={(color) => {
                  setSelectedColor(color);
                  setStatusMessage(`Color updated to ${color.toUpperCase()}.`);
                }}
                brushSize={brushSize}
                onBrushSizeChange={(size) => {
                  setBrushSize(size);
                  setStatusMessage(`Brush size set to ${size}px.`);
                }}
                opacity={opacity}
                onOpacityChange={(nextOpacity) => {
                  setOpacity(nextOpacity);
                  setStatusMessage(`Opacity set to ${Math.round(nextOpacity * 100)}%.`);
                }}
                shirtFit={shirtFit}
                onShirtFitChange={(fit) => {
                  setShirtFit(fit);
                  setStatusMessage(`Shirt fit set to ${fit}.`);
                }}
                shirtSleeveLength={shirtSleeveLength}
                onShirtSleeveLengthChange={(sleeveLength) => {
                  setShirtSleeveLength(sleeveLength);
                  setStatusMessage(`Sleeve length set to ${sleeveLength}.`);
                }}
                shirtNeckline={shirtNeckline}
                onShirtNecklineChange={(neckline) => {
                  setShirtNeckline(neckline);
                  setStatusMessage(`Neckline set to ${neckline}.`);
                }}
                shirtHemLength={shirtHemLength}
                onShirtHemLengthChange={(hemLength) => {
                  setShirtHemLength(hemLength);
                  setStatusMessage(`Hem length set to ${hemLength}.`);
                }}
                shirtBaseColor={shirtBaseColor}
                onShirtBaseColorChange={(color) => {
                  setShirtBaseColor(color);
                  setStatusMessage(`Shirt base color updated to ${color.toUpperCase()}.`);
                }}
              />
              <FashionLayers
                layers={layers}
                selectedLayerId={selectedLayerId}
                onLayerSelect={(id) => {
                  setSelectedLayerId(id);
                  setStatusMessage(
                    `Switched to the ${
                      layers.find((layer) => layer.id === id)?.name ?? "selected"
                    } layer.`,
                  );
                }}
                onToggleVisibility={handleToggleVisibility}
                onDelete={handleDelete}
              />
            </View>
          </ScrollView>
        )}
      </View>
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>{statusMessage}</Text>
      </View>

      {/* Generate Button - always visible at bottom */}
      {!showPreviewScreen && (
        <View style={styles.generateBar}>
          <GenerateButton
            onPress={handleGenerate}
            isGenerating={isGenerating}
            disabled={strokesByView.front.length === 0 && strokesByView.back.length === 0}
          />
        </View>
      )}

      {/* Pipeline Progress Modal */}
      {pipelineState && isGenerating && (
        <View style={styles.pipelineOverlay}>
          <View style={styles.pipelineModal}>
            <PipelineProgress state={pipelineState} />
          </View>
        </View>
      )}
        </>
      )}
    </SafeAreaView>
  );
}

export default App;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.pageBg,
  },
  appShell: {
    flex: 1,
    backgroundColor: "#efe6db",
  },
  tabletWorkspace: {
    flex: 1,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  canvasColumn: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
  },
  canvasColumnContent: {
    paddingBottom: 20,
  },
  inspectorRail: {
    flexGrow: 0,
    flexShrink: 0,
  },
  inspectorRailContent: {
    gap: 18,
    paddingBottom: 12,
  },
  mobileScroll: {
    flex: 1,
  },
  mobileScrollContent: {
    gap: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  mobileInspector: {
    gap: 18,
  },
  statusBar: {
    borderTopWidth: 1,
    borderTopColor: palette.border,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "rgba(252, 248, 243, 0.95)",
  },
  statusText: {
    color: palette.muted,
    fontSize: 13,
  },
  generateBar: {
    borderTopWidth: 1,
    borderTopColor: palette.border,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: palette.panelBg,
  },
  pipelineOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  pipelineModal: {
    width: "85%",
    maxWidth: 400,
  },
});
