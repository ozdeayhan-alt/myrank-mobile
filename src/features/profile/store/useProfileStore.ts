import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { FilterFieldKey } from "@/features/filters/config/filterFields";
import {
  EMPTY_BIO_CATEGORY_VISIBILITY,
  type BioCategoryVisibility,
} from "../utils/bioCategoryVisibility";
import {
  EMPTY_METADATA,
  isMetadataComplete,
  type UserMetadata,
} from "../types";

type ProfileState = {
  metadata: UserMetadata;
  displayName: string;
  photoURL: string;
  bio: string;
  bioCategoryVisibility: BioCategoryVisibility;
  totalScore: number;
  /** Persist edilen metadata hangi kullanıcıya ait */
  profileOwnerId: string | null;
  isRemoteLoaded: boolean;
  /** İlk profil çözümlemesi (cache + remote) tamamlandı mı */
  isProfileBootstrapSettled: boolean;
  isSyncing: boolean;
  /** Firestore users/{uid} kaydı mevcut ve metadata sunucuda tam. */
  profileSavedOnServer: boolean;
  setMetadata: (partial: Partial<UserMetadata>) => void;
  setDisplayName: (displayName: string) => void;
  setPhotoURL: (photoURL: string) => void;
  setBio: (bio: string) => void;
  toggleBioCategoryVisibility: (key: FilterFieldKey) => void;
  hydrateFromFirestore: (
    metadata: UserMetadata,
    totalScore?: number,
    displayName?: string,
    photoURL?: string,
    bio?: string,
    bioCategoryVisibility?: BioCategoryVisibility
  ) => void;
  setTotalScore: (totalScore: number) => void;
  setRemoteLoaded: (loaded: boolean) => void;
  setSyncing: (syncing: boolean) => void;
  setProfileSavedOnServer: (saved: boolean) => void;
  beginProfileBootstrap: () => void;
  finishProfileBootstrap: () => void;
  reset: () => void;
  isComplete: () => boolean;
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      metadata: { ...EMPTY_METADATA },
      displayName: "",
      photoURL: "",
      bio: "",
      bioCategoryVisibility: { ...EMPTY_BIO_CATEGORY_VISIBILITY },
      totalScore: 0,
      profileOwnerId: null,
      isRemoteLoaded: false,
      isProfileBootstrapSettled: false,
      isSyncing: false,
      profileSavedOnServer: false,

      setMetadata: (partial) =>
        set((state) => ({
          metadata: { ...state.metadata, ...partial },
        })),

      setDisplayName: (displayName) => set({ displayName }),

      setPhotoURL: (photoURL) => set({ photoURL }),

      setBio: (bio) => set({ bio }),

      toggleBioCategoryVisibility: (key) =>
        set((state) => ({
          bioCategoryVisibility: {
            ...state.bioCategoryVisibility,
            [key]: !state.bioCategoryVisibility[key],
          },
        })),

      hydrateFromFirestore: (
        metadata,
        totalScore = 0,
        displayName = "",
        photoURL = "",
        bio = "",
        bioCategoryVisibility = EMPTY_BIO_CATEGORY_VISIBILITY
      ) =>
        set((state) => ({
          metadata,
          displayName,
          photoURL,
          bio,
          bioCategoryVisibility,
          totalScore,
          profileOwnerId: state.profileOwnerId,
        })),

      setTotalScore: (totalScore) => set({ totalScore }),

      setRemoteLoaded: (loaded) => set({ isRemoteLoaded: loaded }),

      setSyncing: (syncing) => set({ isSyncing: syncing }),

      setProfileSavedOnServer: (saved) => set({ profileSavedOnServer: saved }),

      beginProfileBootstrap: () =>
        set({ isRemoteLoaded: false, isProfileBootstrapSettled: false }),

      finishProfileBootstrap: () =>
        set({ isRemoteLoaded: true, isProfileBootstrapSettled: true }),

      reset: () =>
        set({
          metadata: { ...EMPTY_METADATA },
          displayName: "",
          photoURL: "",
          bio: "",
          bioCategoryVisibility: { ...EMPTY_BIO_CATEGORY_VISIBILITY },
          totalScore: 0,
          profileOwnerId: null,
          isRemoteLoaded: false,
          isProfileBootstrapSettled: false,
          isSyncing: false,
          profileSavedOnServer: false,
        }),

      isComplete: () => isMetadataComplete(get().metadata),
    }),
    {
      name: "@myrank/profile",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        metadata: state.metadata,
        displayName: state.displayName,
        photoURL: state.photoURL,
        bio: state.bio,
        bioCategoryVisibility: state.bioCategoryVisibility,
        profileOwnerId: state.profileOwnerId,
        profileSavedOnServer: state.profileSavedOnServer,
      }),
    }
  )
);
