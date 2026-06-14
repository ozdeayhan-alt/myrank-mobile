import type { ComponentProps } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
type TabIconProps = {
  name: ComponentProps<typeof Ionicons>["name"];
  color: string;
  size?: number;
};

function TabIcon({ name, color, size = 24 }: TabIconProps) {
  return <Ionicons name={name} size={size} color={color} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        lazy: true,
        freezeOnBlur: true,
        tabBarActiveTintColor: "#111827",
        tabBarInactiveTintColor: "#9CA3AF",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Ana Sayfa",
          tabBarIcon: ({ color }) => (
            <TabIcon name="home-outline" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Keşfet",
          tabBarIcon: ({ color }) => (
            <TabIcon name="compass-outline" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="share"
        options={{
          title: "Paylaş",
          tabBarIcon: ({ color }) => (
            <TabIcon name="add-circle" color={color} size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="ranking"
        options={{
          title: "Sıralama",
          tabBarIcon: ({ color }) => (
            <TabIcon name="trophy-outline" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => (
            <TabIcon name="person-outline" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
