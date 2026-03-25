import { Eye, EyeOff, Trash2 } from "lucide-react";

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
}

interface FashionLayersProps {
  layers: Layer[];
  selectedLayerId: string | null;
  onLayerSelect: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onDelete: (id: string) => void;
}

export function FashionLayers({
  layers,
  selectedLayerId,
  onLayerSelect,
  onToggleVisibility,
  onDelete,
}: FashionLayersProps) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <h2 className="panel-title">Layers</h2>
        <span className="panel-note">{layers.length} total</span>
      </div>

      <div className="layer-list">
        {layers.map((layer) => (
          <div
            key={layer.id}
            className={`layer-item${selectedLayerId === layer.id ? " selected" : ""}`}
          >
            <button
              type="button"
              className="icon-button"
              onClick={() => onToggleVisibility(layer.id)}
              aria-label={layer.visible ? "Hide layer" : "Show layer"}
            >
              {layer.visible ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
            <button
              type="button"
              className="layer-main"
              onClick={() => onLayerSelect(layer.id)}
            >
              <span className="layer-name">{layer.name}</span>
              <span className="layer-visibility">
                {layer.visible ? "Visible on canvas" : "Hidden from canvas"}
              </span>
            </button>
            <button
              type="button"
              className="icon-button destructive"
              onClick={() => onDelete(layer.id)}
              aria-label={`Delete ${layer.name}`}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
