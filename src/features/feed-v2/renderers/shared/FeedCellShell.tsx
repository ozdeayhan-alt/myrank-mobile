import { Platform, View, type ViewProps } from "react-native";
import { ui } from "@/lib/uiClasses";

type FeedCellShellProps = ViewProps & {
  children: React.ReactNode;
};

export function FeedCellShell({ children, style, ...rest }: FeedCellShellProps) {
  return (
    <View
      className={ui.postCard}
      style={[
        Platform.OS === "android" ? { elevation: 2 } : undefined,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
