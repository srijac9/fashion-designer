import { useMemo, useState } from "react";
import { FashionCanvas } from "./components/fashion/FashionCanvas";
import { FashionLayers, type Layer } from "./components/fashion/FashionLayers";
import { FashionProperties } from "./components/fashion/FashionProperties";
import { FashionToolbar, type Tool } from "./components/fashion/FashionToolbar";
import { FashionTopBar } from "./components/fashion/FashionTopBar";

const initialLayers: Layer[] = [
  { id: "1", name: "Background", visible: true },
  { id: "2", name: "Sketch", visible: true },
  { id: "3", name: "Details", visible: true },
];

function App() {
  const [selectedTool, setSelectedTool] = useState<Tool>("sketch");
  const [selectedColor, setSelectedColor] = useState("#2c2c2c");
  const [brushSize, setBrushSize] = useState(3);
  const [opacity, setOpacity] = useState(1);
  const [layers, setLayers] = useState<Layer[]>(initialLayers);
  const [selectedLayerId, setSelectedLayerId] = useState<string>("2");
  const [statusMessage, setStatusMessage] = useState(
    "Sketch directly on the mannequin to start your concept.",
  );

  const activeLayerName = useMemo(() => {
    return layers.find((layer) => layer.id === selectedLayerId)?.name ?? "None";
  }, [layers, selectedLayerId]);

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

      if (selectedLayerId === id) {
        setSelectedLayerId(nextLayers[0]?.id ?? "");
      }

      setStatusMessage(
        `Removed the ${currentLayers.find((layer) => layer.id === id)?.name ?? "layer"} layer.`,
      );
      return nextLayers;
    });
  };

  const handleToolbarAction = (message: string) => {
    setStatusMessage(message);
  };

  return (
    <div className="app-shell">
      <FashionTopBar
        selectedTool={selectedTool}
        activeLayerName={activeLayerName}
        onAction={handleToolbarAction}
      />
      <div className="workspace">
        <FashionToolbar
          selectedTool={selectedTool}
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
          onStatusChange={setStatusMessage}
        />
        <div className="sidebar-column">
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
        </div>
      </div>
      <footer className="status-bar">
        <span>{statusMessage}</span>
      </footer>
    </div>
  );
}

export default App;
