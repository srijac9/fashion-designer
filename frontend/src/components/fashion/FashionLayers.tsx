import { Pressable, StyleSheet, Text, View } from "react-native";
import { palette } from "../../theme";
import type { Layer } from "./types";

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
    <View style={styles.panel}>
      <View style={styles.panelHeading}>
        <Text style={styles.panelTitle}>Layers</Text>
        <Text style={styles.panelNote}>{layers.length} total</Text>
      </View>

      <View style={styles.layerList}>
        {layers.map((layer) => (
          <View
            key={layer.id}
            style={[
              styles.layerItem,
              selectedLayerId === layer.id && styles.layerItemSelected,
            ]}
          >
            <Pressable
              onPress={() => onToggleVisibility(layer.id)}
              style={styles.sideAction}
            >
              <Text style={styles.sideActionText}>
                {layer.visible ? "Hide" : "Show"}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => onLayerSelect(layer.id)}
              style={styles.layerMain}
            >
              <Text style={styles.layerName}>{layer.name}</Text>
              <Text style={styles.layerVisibility}>
                {layer.visible ? "Visible on canvas" : "Hidden from canvas"}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => onDelete(layer.id)}
              style={[styles.sideAction, styles.deleteAction]}
            >
              <Text style={[styles.sideActionText, styles.deleteActionText]}>Delete</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
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
  layerList: {
    gap: 10,
  },
  layerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#eadbcc",
    backgroundColor: "#fff9f2",
  },
  layerItemSelected: {
    borderColor: "#efbec8",
    backgroundColor: "#fff1f3",
  },
  sideAction: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.pageBg,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  sideActionText: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  deleteAction: {
    backgroundColor: "#fdecef",
    borderColor: "#f4c6cf",
  },
  deleteActionText: {
    color: palette.accentStrong,
  },
  layerMain: {
    flex: 1,
    gap: 4,
  },
  layerName: {
    color: palette.text,
    fontSize: 14,
    fontWeight: "700",
  },
  layerVisibility: {
    color: palette.muted,
    fontSize: 12,
  },
});
