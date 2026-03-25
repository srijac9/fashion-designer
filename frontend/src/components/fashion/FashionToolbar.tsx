import { CircleDot, Eraser, Move, PaintBucket, Pencil, Scissors } from "lucide-react";

export type Tool = "move" | "sketch" | "seam" | "cut" | "fill" | "eraser";

interface FashionToolbarProps {
  selectedTool: Tool;
  onToolSelect: (tool: Tool) => void;
}

const tools: { id: Tool; label: string; Icon: typeof Move }[] = [
  { id: "move", label: "Move", Icon: Move },
  { id: "sketch", label: "Sketch", Icon: Pencil },
  { id: "seam", label: "Seam", Icon: CircleDot },
  { id: "cut", label: "Cut", Icon: Scissors },
  { id: "fill", label: "Fill", Icon: PaintBucket },
  { id: "eraser", label: "Eraser", Icon: Eraser },
];

export function FashionToolbar({
  selectedTool,
  onToolSelect,
}: FashionToolbarProps) {
  return (
    <aside className="toolbar" aria-label="Design tools">
      {tools.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          className={`tool-button${selectedTool === id ? " active" : ""}`}
          onClick={() => onToolSelect(id)}
          title={label}
          aria-pressed={selectedTool === id}
        >
          <Icon size={18} />
          <span className="tool-label">{label}</span>
        </button>
      ))}
    </aside>
  );
}
