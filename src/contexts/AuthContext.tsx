import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/firebase";

interface AuthContextType {
  user: User | null;
  role: "manufacturer" | "recycler" | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<"manufacturer" | "recycler" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // 🔴 Not logged in
      if (!firebaseUser) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const uid = firebaseUser.uid;

        // 1️⃣ Check manufacturer
        const manuSnap = await getDoc(doc(db, "manufacturers", uid));
        if (manuSnap.exists()) {
          setRole("manufacturer");
          setUser(firebaseUser);
          setLoading(false);
          return;
        }

        // 2️⃣ Check recycler
        const recyclerSnap = await getDoc(doc(db, "recyclers", uid));
        if (recyclerSnap.exists()) {
          setRole("recycler");
          setUser(firebaseUser);
          setLoading(false);
          return;
        }

        // 3️⃣ Logged in but no profile
        setRole(null);
        setUser(firebaseUser);
        setLoading(false);
      } catch (error) {
        console.error("AuthContext error:", error);
        setUser(firebaseUser);
        setRole(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
