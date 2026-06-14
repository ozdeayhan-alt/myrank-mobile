import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { isGoogleSignInConfigured } from "../lib/googleSignIn";
import { useAuth } from "../context/AuthContext";

function getGoogleErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    const code = String((error as { code: string }).code);
    if (code === "auth/account-exists-with-different-credential") {
      return "Bu e-posta farklı bir giriş yöntemiyle kayıtlı.";
    }
    if (code === "auth/network-request-failed") {
      return "Ağ hatası. İnternet bağlantınızı kontrol edin.";
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Google ile giriş yapılamadı.";
}

type GoogleSignInButtonProps = {
  disabled?: boolean;
  label?: string;
};

export function GoogleSignInButton({
  disabled = false,
  label = "Google ile devam et",
}: GoogleSignInButtonProps) {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!isGoogleSignInConfigured()) {
    return null;
  }

  const handlePress = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      Alert.alert("Google girişi", getGoogleErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Pressable
      className={`mt-4 flex-row items-center justify-center rounded-xl border border-gray-200 bg-white py-4 ${
        disabled || loading ? "opacity-60" : ""
      }`}
      onPress={() => void handlePress()}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {loading ? (
        <ActivityIndicator color="#374151" />
      ) : (
        <>
          <Ionicons name="logo-google" size={20} color="#4285F4" />
          <Text className="ml-2 text-base font-semibold text-gray-900">
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

export function AuthDivider() {
  return (
    <View className="my-5 flex-row items-center">
      <View className="h-px flex-1 bg-gray-200" />
      <Text className="mx-3 text-xs font-medium text-gray-400">veya</Text>
      <View className="h-px flex-1 bg-gray-200" />
    </View>
  );
}
