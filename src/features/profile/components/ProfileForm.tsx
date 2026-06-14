import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "@/features/auth";
import { FilterModal } from "@/features/filters/components/FilterModal";
import {
  FILTER_FIELDS,
  formatFilterChipValue,
  getFieldConfig,
  isCityFieldDisabled,
  type FilterFieldKey,
} from "@/features/filters/config/filterFields";
import { applyFieldValue } from "@/features/filters/utils/applyFieldValue";
import { withTimeout } from "@/lib/firestoreErrors";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";
import { saveProfile } from "../api/saveProfile";
import { BIO_MAX_LENGTH } from "../constants";
import { useProfileStore } from "../store/useProfileStore";
import { ui } from "@/lib/uiClasses";
import { isMetadataComplete } from "../types";
import { normalizeBio } from "../utils/normalizeBio";
import { normalizeUserMetadata } from "../utils/normalizeMetadata";

type ProfileFormProps = {
  onSaved?: () => void;
  variant?: "onboarding" | "edit";
};

function MetadataFieldRow({
  label,
  value,
  onPress,
  disabled,
  showBioToggle,
  showInBio,
  onToggleShowInBio,
}: {
  label: string;
  value: string;
  onPress: () => void;
  disabled: boolean;
  showBioToggle?: boolean;
  showInBio?: boolean;
  onToggleShowInBio?: () => void;
}) {
  const hasValue = value !== "—";

  return (
    <View className="mb-4">
      <View className="mb-1 flex-row items-center justify-between">
        <Text className="text-sm font-medium text-gray-700">{label}</Text>
        {showBioToggle ? (
          <Pressable
            onPress={onToggleShowInBio}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={
              showInBio
                ? `${label} bio alanından gizle`
                : `${label} bio alanında göster`
            }
            className={`rounded-lg px-2.5 py-1 ${
              showInBio ? "bg-gray-900" : "bg-gray-100"
            } ${disabled ? "opacity-60" : ""}`}
          >
            <Text
              className={`text-[10px] font-semibold ${
                showInBio ? "text-white" : "text-gray-600"
              }`}
            >
              {showInBio ? "Bio'da" : "Bio'da göster"}
            </Text>
          </Pressable>
        ) : null}
      </View>
      <Pressable
        className={`rounded-xl border px-4 py-3 ${
          hasValue
            ? "border-gray-200 bg-gray-50"
            : "border-dashed border-gray-300 bg-white"
        } ${disabled ? "opacity-60" : ""}`}
        onPress={onPress}
        disabled={disabled}
      >
        <Text
          className={`text-base ${
            hasValue ? "text-gray-900" : "text-gray-400"
          }`}
        >
          {hasValue ? value : "Seçin…"}
        </Text>
      </Pressable>
    </View>
  );
}

export function ProfileForm({ onSaved, variant = "onboarding" }: ProfileFormProps) {
  const { user } = useAuth();
  const metadata = useProfileStore((s) => s.metadata);
  const displayName = useProfileStore((s) => s.displayName);
  const bio = useProfileStore((s) => s.bio);
  const bioCategoryVisibility = useProfileStore((s) => s.bioCategoryVisibility);
  const setMetadata = useProfileStore((s) => s.setMetadata);
  const setDisplayName = useProfileStore((s) => s.setDisplayName);
  const setBio = useProfileStore((s) => s.setBio);
  const toggleBioCategoryVisibility = useProfileStore(
    (s) => s.toggleBioCategoryVisibility
  );
  const setSyncing = useProfileStore((s) => s.setSyncing);
  const isSyncing = useProfileStore((s) => s.isSyncing);

  const [activeField, setActiveField] = useState<FilterFieldKey | null>(null);

  useEffect(() => {
    if (!displayName.trim() && user?.displayName?.trim()) {
      setDisplayName(user.displayName.trim());
    }
  }, [displayName, setDisplayName, user?.displayName]);

  const isEdit = variant === "edit";
  const activeConfig = getFieldConfig(activeField);

  const handleApplyField = (value: string | number | null) => {
    if (!activeField) return;
    setMetadata(applyFieldValue(metadata, activeField, value));
    setActiveField(null);
  };

  const handleSave = async () => {
    if (!user?.uid || !user.email) {
      Alert.alert("Hata", "Oturum bilgisi bulunamadı.");
      return;
    }

    const trimmedName = displayName.trim();
    if (!trimmedName) {
      Alert.alert("Eksik bilgi", "Lütfen Ad Soyad alanını doldurun.");
      return;
    }

    const draft = normalizeUserMetadata(metadata);

    if (!isMetadataComplete(draft)) {
      Alert.alert(
        "Eksik bilgi",
        "Lütfen tüm kategorileri listeden seçin (yaş dahil)."
      );
      return;
    }

    const trimmedBio = normalizeBio(bio);

    setSyncing(true);
    try {
      await withTimeout(
        saveProfile(
          user.uid,
          user.email,
          draft,
          trimmedName,
          trimmedBio,
          bioCategoryVisibility
        )
      );
      useProfileStore
        .getState()
        .hydrateFromFirestore(
          draft,
          useProfileStore.getState().totalScore,
          trimmedName,
          useProfileStore.getState().photoURL,
          trimmedBio,
          bioCategoryVisibility
        );
      useProfileStore.setState({ profileOwnerId: user.uid });
      onSaved?.();
    } catch (error) {
      Alert.alert("Hata", getUserFacingErrorMessage(error));
    } finally {
      setSyncing(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 py-8"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="mb-2 text-2xl font-bold text-gray-900">
          {isEdit ? "Profili Düzenle" : "Profilini tamamla"}
        </Text>
        <Text className="mb-6 text-base text-gray-500">
          {isEdit
            ? "Kimlik ve sıralama bilgilerini güncelleyebilirsin."
            : "Keşfet ve sıralama için kategorileri listeden seç. Tüm alanlar zorunlu."}
        </Text>

        <Text className="mb-1 text-sm font-medium text-gray-700">Ad Soyad</Text>
        <TextInput
          className="mb-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
          placeholder="Ad Soyad"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="words"
          value={displayName}
          onChangeText={setDisplayName}
          editable={!isSyncing}
        />

        <Text className="mb-1 text-sm font-medium text-gray-700">
          Bio{" "}
          <Text className="font-normal text-gray-400">(isteğe bağlı)</Text>
        </Text>
        <TextInput
          className="mb-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
          placeholder="Kısa bir cümle…"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="sentences"
          value={bio}
          onChangeText={setBio}
          maxLength={BIO_MAX_LENGTH}
          editable={!isSyncing}
        />

        <Text className="mb-2 text-sm font-medium text-gray-700">
          Kategoriler
        </Text>

        {FILTER_FIELDS.map(({ key, label }) => (
          <MetadataFieldRow
            key={key}
            label={label}
            value={formatFilterChipValue(key, metadata)}
            onPress={() => {
              if (key === "city" && isCityFieldDisabled(metadata)) {
                return;
              }
              setActiveField(key);
            }}
            disabled={
              isSyncing || (key === "city" && isCityFieldDisabled(metadata))
            }
            showBioToggle={isEdit}
            showInBio={bioCategoryVisibility[key]}
            onToggleShowInBio={() => toggleBioCategoryVisibility(key)}
          />
        ))}

        <Pressable
          className={`mt-2 ${ui.btnPrimary} ${isSyncing ? "opacity-60" : ""}`}
          onPress={handleSave}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator color="#374151" />
          ) : (
            <Text className={ui.btnPrimaryText}>Kaydet</Text>
          )}
        </Pressable>
      </ScrollView>

      <FilterModal
        visible={activeField !== null}
        field={activeField}
        filterType={activeConfig?.filterType ?? "static"}
        title={activeConfig?.label ?? ""}
        filters={metadata}
        onApply={handleApplyField}
        onClose={() => setActiveField(null)}
        allowCustomValue={false}
      />
    </KeyboardAvoidingView>
  );
}
