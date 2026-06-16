import AsyncStorage from "@react-native-async-storage/async-storage";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { queryClient } from "@/lib/queryClient";
import { recordError } from "@/lib/crashReporting";

const REACT_QUERY_CACHE_KEY = "REACT_QUERY_OFFLINE_CACHE";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[ErrorBoundary]", error.message, info.componentStack);
    recordError(error, "ErrorBoundary");
  }

  private handleReset = async (): Promise<void> => {
    try {
      queryClient.clear();
      await AsyncStorage.removeItem(REACT_QUERY_CACHE_KEY);
    } catch {
      // Best-effort cache clear before retry.
    }

    this.setState({ error: null });
  };

  render(): ReactNode {
    if (this.state.error) {
      return (
        <View className="flex-1 items-center justify-center bg-white px-6">
          <Text className="mb-2 text-lg font-semibold text-gray-900">
            Bir sorun oluştu
          </Text>
          <Text className="mb-6 text-center text-sm text-gray-600">
            Uygulama beklenmedik bir hatayla karşılaştı. Önbelleği temizleyip
            yeniden deneyebilirsiniz.
          </Text>
          {this.state.error?.message ? (
            <Text className="mb-6 text-center text-xs text-gray-400">
              {this.state.error.message}
            </Text>
          ) : null}
          <Pressable
            onPress={() => {
              void this.handleReset();
            }}
            className="rounded-xl bg-gray-900 px-6 py-3"
            accessibilityRole="button"
            accessibilityLabel="Yeniden dene"
          >
            <Text className="text-sm font-semibold text-white">Yeniden dene</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}
