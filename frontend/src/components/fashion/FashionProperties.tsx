import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { palette } from "../../theme";

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

const brushPresets = [
  { label: "Fine", size: 2, opacity: 0.7 },
  { label: "Studio", size: 4, opacity: 1 },
  { label: "Marker", size: 8, opacity: 0.85 },
];

export function FashionProperties({
  selectedColor,
  onColorChange,
  brushSize,
  onBrushSizeChange,
  opacity,
  onOpacityChange,
}: FashionPropertiesProps) {
  const [customColor, setCustomColor] = useState(selectedColor);

  useEffect(() => {
    setCustomColor(selectedColor);
  }, [selectedColor]);

  const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

  const commitCustomColor = () => {
    const normalized = normalizeHexColor(customColor);
    if (normalized) {
      setCustomColor(normalized);
      onColorChange(normalized);
      return;
    }

    setCustomColor(selectedColor);
  };

  return (
    <View style={styles.panel}>
      <View style={styles.panelHeading}>
        <Text style={styles.panelTitle}>Properties</Text>
        <Text style={styles.panelNote}>Brush controls</Text>
      </View>

      <View style={styles.pencilNote}>
        <Text style={styles.pencilNoteTitle}>Apple Pencil workflow</Text>
        <Text style={styles.pencilNoteBody}>
          Keep the canvas open and draw directly on the form. The iPad layout avoids
          page scrolling so strokes stay locked to the board.
        </Text>
      </View>

      <View style={styles.fieldGroup}>
        <View style={styles.fieldLabel}>
          <Text style={styles.fieldLabelText}>Quick presets</Text>
        </View>
        <View style={styles.presetRow}>
          {brushPresets.map((preset) => (
            <Pressable
              key={preset.label}
              onPress={() => {
                onBrushSizeChange(preset.size);
                onOpacityChange(preset.opacity);
              }}
              style={styles.presetChip}
            >
              <Text style={styles.presetChipTitle}>{preset.label}</Text>
              <Text style={styles.presetChipText}>
                {preset.size}px · {Math.round(preset.opacity * 100)}%
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <View style={styles.fieldLabel}>
          <Text style={styles.fieldLabelText}>Brush size</Text>
          <Text style={styles.fieldValue}>{brushSize}px</Text>
        </View>
        <View style={styles.stepperRow}>
          <Pressable
            style={styles.stepperButton}
            onPress={() => onBrushSizeChange(clamp(brushSize - 1, 1, 30))}
          >
            <Text style={styles.stepperText}>-</Text>
          </Pressable>
          <View style={styles.stepperValue}>
            <Text style={styles.stepperValueText}>{brushSize}</Text>
          </View>
          <Pressable
            style={styles.stepperButton}
            onPress={() => onBrushSizeChange(clamp(brushSize + 1, 1, 30))}
          >
            <Text style={styles.stepperText}>+</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <View style={styles.fieldLabel}>
          <Text style={styles.fieldLabelText}>Opacity</Text>
          <Text style={styles.fieldValue}>{Math.round(opacity * 100)}%</Text>
        </View>
        <View style={styles.stepperRow}>
          <Pressable
            style={styles.stepperButton}
            onPress={() => onOpacityChange(clamp(opacity - 0.05, 0.05, 1))}
          >
            <Text style={styles.stepperText}>-</Text>
          </Pressable>
          <View style={styles.stepperValue}>
            <Text style={styles.stepperValueText}>{Math.round(opacity * 100)}%</Text>
          </View>
          <Pressable
            style={styles.stepperButton}
            onPress={() => onOpacityChange(clamp(opacity + 0.05, 0.05, 1))}
          >
            <Text style={styles.stepperText}>+</Text>
          </Pressable>
        </View>
      </View>

      {palettes.map((paletteGroup) => (
        <View style={styles.fieldGroup} key={paletteGroup.name}>
          <View style={styles.fieldLabel}>
            <Text style={styles.fieldLabelText}>{paletteGroup.name}</Text>
          </View>
          <View style={styles.paletteGrid}>
            {paletteGroup.colors.map((color) => (
              <Pressable
                key={color}
                accessibilityLabel={`Select ${color}`}
                onPress={() => onColorChange(color)}
                style={[
                  styles.colorSwatch,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorSwatchSelected,
                ]}
              />
            ))}
          </View>
        </View>
      ))}

      <View style={styles.fieldGroup}>
        <View style={styles.fieldLabel}>
          <Text style={styles.fieldLabelText}>Custom color</Text>
        </View>
        <View style={styles.customColorRow}>
          <View style={[styles.colorPreview, { backgroundColor: selectedColor }]} />
          <TextInput
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={7}
            onBlur={commitCustomColor}
            onChangeText={setCustomColor}
            onSubmitEditing={commitCustomColor}
            placeholder="#2C2C2C"
            placeholderTextColor={palette.muted}
            style={styles.colorInput}
            value={customColor.toUpperCase()}
          />
        </View>
      </View>
    </View>
  );
}

function normalizeHexColor(value: string) {
  const trimmed = value.trim();
  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;

  if (/^#[0-9A-Fa-f]{6}$/.test(withHash)) {
    return withHash.toUpperCase();
  }

  if (/^#[0-9A-Fa-f]{3}$/.test(withHash)) {
    const [, r, g, b] = withHash;
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }

  return null;
}

const styles = StyleSheet.create({
  panel: {
    minWidth: 0,
    padding: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: "rgba(252, 248, 243, 0.96)",
    gap: 18,
  },
  panelHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  panelTitle: {
    color: palette.text,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  panelNote: {
    color: palette.muted,
    fontSize: 11,
  },
  pencilNote: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#f6eee6",
    borderWidth: 1,
    borderColor: "#e8d9ca",
    gap: 6,
  },
  pencilNoteTitle: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "700",
  },
  pencilNoteBody: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  fieldGroup: {
    gap: 10,
  },
  fieldLabel: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  fieldLabelText: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  fieldValue: {
    color: palette.text,
    fontSize: 12,
    fontWeight: "700",
  },
  presetRow: {
    gap: 10,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#eadbcc",
    backgroundColor: "#f8f1e9",
    gap: 2,
  },
  presetChipTitle: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "700",
  },
  presetChipText: {
    color: palette.muted,
    fontSize: 12,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stepperButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.panelStrong,
  },
  stepperText: {
    color: palette.text,
    fontSize: 20,
    fontWeight: "700",
  },
  stepperValue: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.panelStrong,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  stepperValueText: {
    color: palette.text,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  paletteGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  colorSwatch: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(34, 27, 23, 0.08)",
  },
  colorSwatchSelected: {
    borderColor: palette.accent,
    borderWidth: 3,
  },
  customColorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  colorPreview: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
  },
  colorInput: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.panelStrong,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: palette.text,
    fontSize: 14,
    fontWeight: "700",
  },
});
