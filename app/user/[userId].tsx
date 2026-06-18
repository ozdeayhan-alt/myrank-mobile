import { Redirect, useLocalSearchParams } from "expo-router";

/** Eski stack rotası; tab bar ile açılsın diye (tabs) altına yönlendirir. */
export default function UserProfileRedirect() {
  const { userId, displayName, photoURL } = useLocalSearchParams<{
    userId?: string;
    displayName?: string;
    photoURL?: string;
  }>();

  if (!userId || typeof userId !== "string") {
    return <Redirect href="/(tabs)/" />;
  }

  return (
    <Redirect
      href={{
        pathname: "/(tabs)/user/[userId]",
        params: {
          userId,
          displayName: typeof displayName === "string" ? displayName : "",
          photoURL: typeof photoURL === "string" ? photoURL : "",
        },
      }}
    />
  );
}
