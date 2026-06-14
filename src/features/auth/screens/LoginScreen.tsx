import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { Link } from "expo-router";
import { AuthLegalFooter } from "../components/AuthLegalFooter";
import {
  AuthDivider,
  GoogleSignInButton,
} from "../components/GoogleSignInButton";
import { useAuth } from "../context/AuthContext";

function getAuthErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    const code = String((error as { code: string }).code);
    switch (code) {
      case "auth/invalid-email":
        return "Geçersiz e-posta adresi.";
      case "auth/user-disabled":
        return "Bu hesap devre dışı bırakılmış.";
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "E-posta veya şifre hatalı.";
      case "auth/operation-not-allowed":
        return "E-posta/şifre girişi Firebase Console'da kapalı.";
      case "auth/invalid-api-key":
      case "auth/api-key-not-valid.-please-pass-a-valid-api-key":
        return "Firebase API anahtarı geçersiz. .env dosyasını kontrol edin.";
      case "auth/network-request-failed":
        return "Ağ hatası. İnternet bağlantınızı kontrol edin.";
      default:
        return "Giriş yapılamadı. Lütfen tekrar deneyin.";
    }
  }
  return "Beklenmeyen bir hata oluştu.";
}

function getResetPasswordErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    const code = String((error as { code: string }).code);
    switch (code) {
      case "auth/invalid-email":
        return "Geçersiz e-posta adresi.";
      case "auth/user-not-found":
        return "Bu e-posta adresiyle kayıtlı hesap bulunamadı.";
      case "auth/network-request-failed":
        return "Ağ hatası. İnternet bağlantınızı kontrol edin.";
      default:
        return "Şifre sıfırlama e-postası gönderilemedi.";
    }
  }
  return "Beklenmeyen bir hata oluştu.";
}

export function LoginScreen() {
  const { signIn, resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Uyarı", "E-posta ve şifre zorunludur.");
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error) {
      Alert.alert("Giriş başarısız", getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email.trim()) {
      Alert.alert(
        "E-posta gerekli",
        "Şifre sıfırlama bağlantısı için önce e-posta adresinizi girin."
      );
      return;
    }

    Alert.alert(
      "Şifremi unuttum",
      `${email.trim()} adresine şifre sıfırlama bağlantısı gönderilsin mi?`,
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Gönder",
          onPress: () => {
            setResetLoading(true);
            void (async () => {
              try {
                await resetPassword(email);
                Alert.alert(
                  "E-posta gönderildi",
                  "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi."
                );
              } catch (error) {
                Alert.alert("Hata", getResetPasswordErrorMessage(error));
              } finally {
                setResetLoading(false);
              }
            })();
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <View className="flex-1 justify-center px-6">
        <Text className="mb-2 text-center text-3xl font-bold text-gray-900">
          MyRank
        </Text>
        <Text className="mb-8 text-center text-base text-gray-500">
          Hesabına giriş yap
        </Text>

        <TextInput
          className="mb-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
          placeholder="E-posta"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          editable={!loading && !resetLoading}
        />

        <TextInput
          className="mb-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
          placeholder="Şifre"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          autoComplete="password"
          value={password}
          onChangeText={setPassword}
          editable={!loading && !resetLoading}
        />

        <Pressable
          className="mb-6 self-end"
          onPress={handleForgotPassword}
          disabled={loading || resetLoading}
        >
          {resetLoading ? (
            <ActivityIndicator size="small" color="#374151" />
          ) : (
            <Text className="text-sm font-medium text-gray-700">
              Şifremi unuttum
            </Text>
          )}
        </Pressable>

        <Pressable
          className={`items-center rounded-xl border border-gray-200 bg-white py-4 ${loading ? "opacity-60" : ""}`}
          onPress={handleLogin}
          disabled={loading || resetLoading}
        >
          {loading ? (
            <ActivityIndicator color="#374151" />
          ) : (
            <Text className="text-base font-semibold text-gray-900">
              Giriş Yap
            </Text>
          )}
        </Pressable>

        <AuthDivider />
        <GoogleSignInButton disabled={loading || resetLoading} />

        <View className="mt-6 flex-row justify-center">
          <Text className="text-gray-500">Hesabın yok mu? </Text>
          <Link href="/(auth)/register" asChild>
            <Pressable disabled={loading || resetLoading}>
              <Text className="font-semibold text-gray-800">Kayıt Ol</Text>
            </Pressable>
          </Link>
        </View>

        <AuthLegalFooter />
      </View>
    </KeyboardAvoidingView>
  );
}
