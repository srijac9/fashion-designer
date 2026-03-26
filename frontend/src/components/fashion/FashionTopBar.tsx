import { Pressable, StyleSheet, Text, View } from "react-native";
import { palette } from "../../theme";
import type { Tool } from "./types";

interface FashionTopBarProps {
  selectedTool: Tool;
  activeLayerName: string;
  currentView: "front" | "back";
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onAction: (message: string) => void;
}

export function FashionTopBar({
  selectedTool,
  activeLayerName,
  currentView,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onAction,
}: FashionTopBarProps) {
  return (
    <View style={styles.topBar}>
      <View style={styles.identityCluster}>
        <View style={styles.brandBlock}>
          <Text style={styles.brandTitle}>ATELIER</Text>
          <Text style={styles.brandSubtitle}>Digital fashion sketch studio</Text>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.chip}>
            <Text style={styles.chipLabel}>Tool</Text>
            <Text style={styles.chipValue}>{selectedTool}</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipLabel}>Layer</Text>
            <Text style={styles.chipValue}>{activeLayerName}</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipLabel}>View</Text>
            <Text style={styles.chipValue}>{currentView}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          disabled={!canUndo}
          style={[styles.actionButton, !canUndo && styles.actionButtonDisabled]}
          onPress={onUndo}
        >
          <Text style={styles.actionText}>Undo</Text>
        </Pressable>
        <Pressable
          disabled={!canRedo}
          style={[styles.actionButton, !canRedo && styles.actionButtonDisabled]}
          onPress={onRedo}
        >
          <Text style={styles.actionText}>Redo</Text>
        </Pressable>
        <Pressable
          style={styles.actionButton}
          onPress={() =>
            onAction("Save is currently a UI placeholder, but the workspace is organized and running.")
          }
        >
          <Text style={styles.actionText}>Save</Text>
        </Pressable>
        <Pressable
          style={styles.actionButton}
          onPress={() =>
            onAction("Export is the next feature to wire once you decide on PNG, SVG, or PDF output.")
          }
        >
          <Text style={styles.actionText}>Export</Text>
        </Pressable>
        <Pressable
          style={[styles.actionButton, styles.primaryAction]}
          onPress={() =>
            onAction(
              "Model generation is not connected yet, but the control is in place for the future workflow.",
            )
          }
        >
          <Text style={[styles.actionText, styles.primaryActionText]}>Generate on Model</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 18,
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    backgroundColor: "rgba(252, 248, 243, 0.96)",
    flexWrap: "wrap",
  },
  identityCluster: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    flexWrap: "wrap",
    flexShrink: 1,
  },
  brandBlock: {
    gap: 2,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 2.8,
    color: palette.text,
  },
  brandSubtitle: {
    fontSize: 13,
    color: palette.muted,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.panelStrong,
  },
  chipLabel: {
    color: palette.muted,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  chipValue: {
    color: palette.text,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "flex-end",
  },
  actionButton: {
    minHeight: 48,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.panelStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonDisabled: {
    opacity: 0.45,
  },
  actionText: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "600",
  },
  primaryAction: {
    backgroundColor: palette.accent,
    borderColor: palette.accent,
  },
  primaryActionText: {
    color: palette.white,
  },
});
