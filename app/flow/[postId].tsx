import { Stack } from "expo-router";
import { FlowDetailContent } from "@/features/flow/components/FlowDetailContent";

export default function FlowDetailScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          contentStyle: { backgroundColor: "#000000" },
        }}
      />
      <FlowDetailContent />
    </>
  );
}
