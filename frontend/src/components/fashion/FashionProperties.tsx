interface FashionPropertiesProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  opacity: number;
  onOpacityChange: (opacity: number) => void;
}

const palettes = [
  {
    name: "Pastel",
    colors: ["#ffb3ba", "#ffdfba", "#ffffba", "#baffc9", "#bae1ff", "#e0bbe4", "#fec8d8", "#ffdfd3"],
  },
  {
    name: "Vibrant",
    colors: ["#ff6b6b", "#4ecdc4", "#45b7d1", "#ffa07a", "#98d8c8", "#f7dc6f", "#bb8fce", "#85c1e2"],
  },
  {
    name: "Earth",
    colors: ["#c9a78a", "#a67b5b", "#8b7355", "#d4c5b9", "#b5a397", "#997a62", "#e8ddd1", "#bfa286"],
  },
  {
    name: "Mono",
    colors: ["#000000", "#2c2c2c", "#555555", "#7f7f7f", "#a8a8a8", "#d1d1d1", "#eeeeee", "#ffffff"],
  },
];

export function FashionProperties({
  selectedColor,
  onColorChange,
  brushSize,
  onBrushSizeChange,
  opacity,
  onOpacityChange,
}: FashionPropertiesProps) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <h2 className="panel-title">Properties</h2>
        <span className="panel-note">Brush controls</span>
      </div>

      <div className="field-group">
        <label className="field-label" htmlFor="brush-size">
          <span>Brush size</span>
          <span>{brushSize}px</span>
        </label>
        <input
          id="brush-size"
          className="range-input"
          type="range"
          min={1}
          max={30}
          step={1}
          value={brushSize}
          onChange={(event) => onBrushSizeChange(Number(event.target.value))}
        />
      </div>

      <div className="field-group">
        <label className="field-label" htmlFor="opacity">
          <span>Opacity</span>
          <span>{Math.round(opacity * 100)}%</span>
        </label>
        <input
          id="opacity"
          className="range-input"
          type="range"
          min={5}
          max={100}
          step={5}
          value={Math.round(opacity * 100)}
          onChange={(event) => onOpacityChange(Number(event.target.value) / 100)}
        />
      </div>

      {palettes.map((palette) => (
        <div className="field-group" key={palette.name}>
          <div className="field-label">
            <span>{palette.name}</span>
          </div>
          <div className="palette-grid">
            {palette.colors.map((color) => (
              <button
                key={color}
                type="button"
                className={`color-swatch${selectedColor === color ? " selected" : ""}`}
                style={{ backgroundColor: color }}
                onClick={() => onColorChange(color)}
                aria-label={`Select ${color}`}
              />
            ))}
          </div>
        </div>
      ))}

      <div className="field-group">
        <span className="field-label">
          <span>Custom color</span>
        </span>
        <div className="custom-color-row">
          <input
            className="color-input"
            type="color"
            value={selectedColor}
            onChange={(event) => onColorChange(event.target.value)}
          />
          <p className="color-code">{selectedColor.toUpperCase()}</p>
        </div>
      </div>
    </section>
  );
}
