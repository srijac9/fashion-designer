import { Pressable, StyleSheet, Text, View } from "react-native";
import { palette } from "../../theme";
import type { Tool } from "./types";

interface FashionToolbarProps {
  selectedTool: Tool;
  orientation: "horizontal" | "vertical";
  onToolSelect: (tool: Tool) => void;
}

const tools: { id: Tool; label: string; shortLabel: string }[] = [
  { id: "move", label: "Move", shortLabel: "MV" },
  { id: "sketch", label: "Sketch", shortLabel: "SK" },
  { id: "seam", label: "Seam", shortLabel: "SM" },
  { id: "cut", label: "Cut", shortLabel: "CT" },
  { id: "fill", label: "Fill", shortLabel: "FL" },
  { id: "eraser", label: "Eraser", shortLabel: "ER" },
];

export function FashionToolbar({
  selectedTool,
  orientation,
  onToolSelect,
}: FashionToolbarProps) {
  const isVertical = orientation === "vertical";

  return (
    <View
      accessibilityLabel="Design tools"
      style={[
        styles.toolbar,
        isVertical ? styles.toolbarVertical : styles.toolbarHorizontal,
      ]}
    >
      {isVertical ? null : <Text style={styles.toolbarCaption}>Tools</Text>}
      {tools.map(({ id, label, shortLabel }) => (
        <Pressable
          key={id}
          accessibilityState={{ selected: selectedTool === id }}
          onPress={() => onToolSelect(id)}
          style={[
            styles.toolButton,
            selectedTool === id && styles.toolButtonActive,
            !isVertical && styles.toolButtonHorizontal,
            isVertical && styles.toolButtonVertical,
          ]}
        >
          <Text
            style={[
              styles.toolBadge,
              selectedTool === id && styles.toolBadgeActive,
            ]}
          >
            {shortLabel}
          </Text>
          {isVertical ? null : (
            <Text
              style={[
                styles.toolLabel,
                selectedTool === id && styles.toolLabelActive,
              ]}
            >
              {label}
            </Text>
          )}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: "rgba(252, 248, 243, 0.96)",
  },
  toolbarVertical: {
    width: 54,
    paddingHorizontal: 4,
    paddingVertical: 8,
    gap: 6,
  },
  toolbarHorizontal: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  toolbarCaption: {
    color: palette.muted,
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingHorizontal: 2,
    marginBottom: 4,
    textAlign: "center",
  },
  toolButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    paddingVertical: 9,
    borderRadius: 16,
    backgroundColor: "#f6eee5",
    borderWidth: 1,
    borderColor: "#eadbcc",
    gap: 4,
  },
  toolButtonHorizontal: {
    minWidth: 92,
  },
  toolButtonVertical: {
    minHeight: 46,
    borderRadius: 14,
    paddingHorizontal: 2,
    paddingVertical: 8,
  },
  toolButtonActive: {
    backgroundColor: "#fff4f6",
    borderColor: "#eab3bf",
  },
  toolBadge: {
    minWidth: 28,
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: "hidden",
    textAlign: "center",
    backgroundColor: palette.panelStrong,
    color: palette.muted,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  toolBadgeActive: {
    backgroundColor: palette.accentSoft,
    color: palette.accentStrong,
  },
  toolLabel: {
    color: palette.muted,
    fontSize: 9,
    fontWeight: "600",
    textAlign: "center",
  },
  toolLabelActive: {
    color: palette.accentStrong,
  },
});
