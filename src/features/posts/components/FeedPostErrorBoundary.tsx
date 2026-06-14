import { Component, type ErrorInfo, type ReactNode } from "react";
import { Text, View } from "react-native";
import type { Post } from "../types";
import { FeedPostCellLite } from "./FeedPostCellLite";

type FeedPostErrorBoundaryProps = {
  post: Post;
  children: ReactNode;
};

type FeedPostErrorBoundaryState = {
  failed: boolean;
};

export class FeedPostErrorBoundary extends Component<
  FeedPostErrorBoundaryProps,
  FeedPostErrorBoundaryState
> {
  state: FeedPostErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): FeedPostErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(
      `[FeedPostErrorBoundary] post=${this.props.post.id}`,
      error.message,
      info.componentStack
    );
  }

  render(): ReactNode {
    if (this.state.failed) {
      return (
        <View>
          <FeedPostCellLite post={this.props.post} />
          <Text className="px-4 pb-2 text-xs text-amber-600">
            Bu gönderi tam yüklenemedi.
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}
