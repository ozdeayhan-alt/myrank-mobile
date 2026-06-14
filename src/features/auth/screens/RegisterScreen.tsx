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
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
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
      case "auth/email-already-in-use":
        return "Bu e-posta adresi zaten kullanılıyor.";
      case "auth/invalid-email":
        return "Geçersiz e-posta adresi.";
      case "auth/weak-password":
        return "Şifre en az 6 karakter olmalıdır.";
      case "auth/operation-not-allowed":
        return "E-posta/şifre girişi Firebase Console'da kapalı. Authentication > Sign-in method bölümünden açın.";
      case "auth/invalid-api-key":
      case "auth/api-key-not-valid.-please-pass-a-valid-api-key":
        return "Firebase API anahtarı geçersiz. .env dosyasındaki EXPO_PUBLIC_FIREBASE_* değerlerini kontrol edin.";
      case "auth/network-request-failed":
        return "Ağ hatası. İnternet bağlantınızı kontrol edin.";
      default:
        return "Kayıt oluşturulamadı. Lütfen tekrar deneyin.";
    }
  }
  return "Beklenmeyen bir hata oluştu.";
}

export function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Uyarı", "E-posta ve şifre zorunludur.");
      return;
    }

    if (!acceptedTerms) {
      Alert.alert(
        "Uyarı",
        "Kayıt olmak için Kullanım Koşulları ve Gizlilik Politikası'nı kabul etmelisiniz."
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Uyarı", "Şifreler eşleşmiyor.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Uyarı", "Şifre en az 6 karakter olmalıdır.");
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password);
    } catch (error) {
      Alert.alert("Kayıt başarısız", getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
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
          Yeni hesap oluştur
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
          editable={!loading}
        />

        <TextInput
          className="mb-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
          placeholder="Şifre (min. 6 karakter)"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          autoComplete="new-password"
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />

        <TextInput
          className="mb-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
          placeholder="Şifre tekrar"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          autoComplete="new-password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          editable={!loading}
        />

        <Pressable
          className="mb-6 flex-row items-start gap-3"
          onPress={() => setAcceptedTerms((value) => !value)}
          disabled={loading}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: acceptedTerms }}
        >
          <Ionicons
            name={acceptedTerms ? "checkbox" : "square-outline"}
            size={22}
            color={acceptedTerms ? "#111827" : "#9CA3AF"}
          />
          <Text className="flex-1 text-sm leading-5 text-gray-600">
            18 yaşından büyük olduğumu,{" "}
            <Text
              className="font-semibold text-gray-900"
              onPress={() => router.push("/legal/terms")}
            >
              Kullanım Koşulları
            </Text>{" "}
            ve{" "}
            <Text
              className="font-semibold text-gray-900"
              onPress={() => router.push("/legal/privacy")}
            >
              Gizlilik Politikası
            </Text>
            {"'"}nı kabul ediyorum.
          </Text>
        </Pressable>

        <Pressable
          className={`items-center rounded-xl border border-gray-200 bg-white py-4 ${loading ? "opacity-60" : ""}`}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#374151" />
          ) : (
            <Text className="text-base font-semibold text-gray-900">
              Kayıt Ol
            </Text>
          )}
        </Pressable>

        <AuthDivider />
        <GoogleSignInButton
          disabled={loading || !acceptedTerms}
          label="Google ile kayıt ol"
        />

        <View className="mt-6 flex-row justify-center">
          <Text className="text-gray-500">Zaten hesabın var mı? </Text>
          <Link href="/(auth)/login" asChild>
            <Pressable disabled={loading}>
              <Text className="font-semibold text-gray-800">Giriş Yap</Text>
            </Pressable>
          </Link>
        </View>

        <AuthLegalFooter />
      </View>
    </KeyboardAvoidingView>
  );
}
