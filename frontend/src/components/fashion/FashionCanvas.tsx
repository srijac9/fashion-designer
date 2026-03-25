import { useEffect, useRef, useState } from "react";
import { MannequinBack } from "./MannequinBack";
import { MannequinFront } from "./MannequinFront";
import type { Tool } from "./FashionToolbar";

type View = "front" | "back";

interface FashionCanvasProps {
  selectedTool: Tool;
  selectedColor: string;
  brushSize: number;
  opacity: number;
  onStatusChange: (message: string) => void;
}

export function FashionCanvas({
  selectedTool,
  selectedColor,
  brushSize,
  opacity,
  onStatusChange,
}: FashionCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentView, setCurrentView] = useState<View>("front");
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    canvas.width = 600;
    canvas.height = 900;
  }, []);

  const getPosition = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return null;
    }

    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool !== "sketch" && selectedTool !== "eraser") {
      onStatusChange(
        `${selectedTool} is selected. Only sketch and eraser draw on the canvas right now.`,
      );
      return;
    }

    const nextPosition = getPosition(event);
    if (!nextPosition) {
      return;
    }

    setIsDrawing(true);
    setLastPosition(nextPosition);
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPosition) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const nextPosition = getPosition(event);

    if (!canvas || !ctx || !nextPosition) {
      return;
    }

    ctx.beginPath();
    ctx.moveTo(lastPosition.x, lastPosition.y);
    ctx.lineTo(nextPosition.x, nextPosition.y);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (selectedTool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = brushSize * 3;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = brushSize;
      ctx.globalAlpha = opacity;
    }

    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    setLastPosition(nextPosition);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      onStatusChange("Stroke captured on the canvas.");
    }

    setIsDrawing(false);
    setLastPosition(null);
  };

  return (
    <main className="canvas-panel">
      <div className="canvas-header">
        <div>
          <div className="canvas-title">Design Canvas</div>
          <p className="canvas-subtitle">
            Use the mannequin as a construction guide and sketch directly over it.
          </p>
        </div>

        <div className="view-toggle" role="tablist" aria-label="Mannequin view">
          {(["front", "back"] as const).map((view) => (
            <button
              key={view}
              type="button"
              className={`view-button${currentView === view ? " active" : ""}`}
              onClick={() => {
                setCurrentView(view);
                onStatusChange(`Switched to the ${view} mannequin view.`);
              }}
            >
              {view} view
            </button>
          ))}
        </div>
      </div>

      <div className="canvas-frame">
        <div className="canvas-stage">
          {currentView === "front" ? (
            <MannequinFront className="mannequin" />
          ) : (
            <MannequinBack className="mannequin" />
          )}
          <canvas
            ref={canvasRef}
            className="drawing-canvas"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>
      </div>
    </main>
  );
}
