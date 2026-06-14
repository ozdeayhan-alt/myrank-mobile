import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { signInWithGoogleCredential } from "../lib/googleSignIn";
import { deleteAccount as deleteAccountApi } from "@/features/account";
import { getFirebaseAuth } from "@/lib/firebase";
import { useProfileStore } from "@/features/profile/store/useProfileStore";

type AuthContextValue = {
  user: User | null;
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    try {
      const auth = getFirebaseAuth();
      unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);
        setInitializing(false);
      });
    } catch (error) {
      console.error("Firebase Auth başlatılamadı:", error);
      setInitializing(false);
    }

    return () => unsubscribe?.();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    await signInWithEmailAndPassword(auth, email.trim(), password);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    await createUserWithEmailAndPassword(auth, email.trim(), password);
  }, []);

  const signOut = useCallback(async () => {
    const auth = getFirebaseAuth();
    await firebaseSignOut(auth);
    useProfileStore.getState().reset();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    await signInWithGoogleCredential();
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const auth = getFirebaseAuth();
    await sendPasswordResetEmail(auth, email.trim());
  }, []);

  const deleteAccount = useCallback(async () => {
    await deleteAccountApi();
    const auth = getFirebaseAuth();
    await firebaseSignOut(auth);
    useProfileStore.getState().reset();
  }, []);

  const value = useMemo(
    () => ({
      user,
      initializing,
      signIn,
      signUp,
      signOut,
      signInWithGoogle,
      resetPassword,
      deleteAccount,
    }),
    [
      user,
      initializing,
      signIn,
      signUp,
      signOut,
      signInWithGoogle,
      resetPassword,
      deleteAccount,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
