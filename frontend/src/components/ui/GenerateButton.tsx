/**
 * Generate button - triggers the garment pipeline.
 */

import { Pressable, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { palette } from "../../theme";

interface GenerateButtonProps {
  onPress: () => void;
  disabled?: boolean;
  isGenerating?: boolean;
}

export function GenerateButton({ onPress, disabled = false, isGenerating = false }: GenerateButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || isGenerating}
      style={[
        styles.button,
        (disabled || isGenerating) && styles.buttonDisabled,
      ]}
    >
      {isGenerating ? (
        <View style={styles.buttonContent}>
          <ActivityIndicator size="small" color={palette.white} />
          <Text style={[styles.buttonText, styles.buttonTextGenerating]}>
            Generating...
          </Text>
        </View>
      ) : (
        <Text style={styles.buttonText}>Generate Preview</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: palette.accent,
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: palette.border,
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    color: palette.white,
    fontSize: 15,
    fontWeight: "700",
  },
  buttonTextGenerating: {
    fontSize: 14,
  },
});
