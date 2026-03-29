/**
 * Pipeline progress indicator - shows current step and progress.
 */

import { StyleSheet, Text, View } from "react-native";
import { palette } from "../../theme";
import type { PipelineState } from "../../pipeline/GarmentPipeline";

interface PipelineProgressProps {
  state: PipelineState;
}

export function PipelineProgress({ state }: PipelineProgressProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Generating Preview</Text>
        <Text style={styles.progress}>{state.progress}%</Text>
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${state.progress}%` }
          ]}
        />
      </View>

      <View style={styles.stepIndicator}>
        <StepDot active={state.status === "validate"} completed={isStepCompleted(state.status, "validate")} />
        <StepDot active={state.status === "process"} completed={isStepCompleted(state.status, "process")} />
        <StepDot active={state.status === "prepare"} completed={isStepCompleted(state.status, "prepare")} />
        <StepDot active={state.status === "complete"} completed={state.status === "complete"} />
      </View>

      <Text style={styles.message}>{state.message}</Text>
    </View>
  );
}

interface StepDotProps {
  active: boolean;
  completed: boolean;
}

function StepDot({ active, completed }: StepDotProps) {
  return (
    <View
      style={[
        styles.stepDot,
        completed && styles.stepDotCompleted,
        active && styles.stepDotActive,
      ]}
    />
  );
}

function isStepCompleted(currentStatus: PipelineState["status"], step: PipelineState["status"]): boolean {
  const order: PipelineState["status"][] = ["validate", "process", "prepare", "complete", "error"];
  const currentIndex = order.indexOf(currentStatus);
  const stepIndex = order.indexOf(step);
  return currentIndex > stepIndex;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.panelBg,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: palette.text,
    fontSize: 14,
    fontWeight: "700",
  },
  progress: {
    color: palette.accent,
    fontSize: 14,
    fontWeight: "700",
  },
  progressBar: {
    height: 6,
    backgroundColor: palette.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: palette.accent,
    borderRadius: 3,
  },
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: palette.border,
  },
  stepDotCompleted: {
    backgroundColor: palette.accent,
  },
  stepDotActive: {
    backgroundColor: palette.accent,
    opacity: 0.7,
  },
  message: {
    color: palette.muted,
    fontSize: 13,
    textAlign: "center",
  },
});
