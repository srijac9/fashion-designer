import { Layers3, Redo2, Save, Share2, Sparkles, Undo2, Wand2 } from "lucide-react";
import type { Tool } from "./FashionToolbar";

interface FashionTopBarProps {
  selectedTool: Tool;
  activeLayerName: string;
  onAction: (message: string) => void;
}

export function FashionTopBar({
  selectedTool,
  activeLayerName,
  onAction,
}: FashionTopBarProps) {
  return (
    <header className="top-bar">
      <div className="brand-block">
        <span className="brand-title">ATELIER</span>
        <span className="brand-subtitle">Digital fashion sketch studio</span>
      </div>

      <div className="top-meta">
        <span className="chip">
          <Wand2 size={14} />
          Tool: {selectedTool}
        </span>
        <span className="chip">
          <Layers3 size={14} />
          Layer: {activeLayerName}
        </span>
      </div>

      <div className="top-actions">
        <button
          type="button"
          className="action-button icon-only"
          onClick={() => onAction("Undo is ready to be wired into drawing history next.")}
          aria-label="Undo"
        >
          <Undo2 size={16} />
        </button>
        <button
          type="button"
          className="action-button icon-only"
          onClick={() => onAction("Redo is ready to be wired into drawing history next.")}
          aria-label="Redo"
        >
          <Redo2 size={16} />
        </button>
        <button
          type="button"
          className="action-button"
          onClick={() => onAction("Save is currently a UI placeholder, but the workspace is organized and running.")}
        >
          <Save size={16} />
          Save
        </button>
        <button
          type="button"
          className="action-button"
          onClick={() => onAction("Export is the next feature to wire once you decide on PNG, SVG, or PDF output.")}
        >
          <Share2 size={16} />
          Export
        </button>
        <button
          type="button"
          className="action-button primary"
          onClick={() => onAction("Model generation is not connected yet, but the control is in place for the future workflow.")}
        >
          <Sparkles size={16} />
          Generate on Model
        </button>
      </div>
    </header>
  );
}
