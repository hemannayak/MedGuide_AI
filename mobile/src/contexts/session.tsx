import { createContext, useContext, useState, PropsWithChildren } from "react";
import { Profile } from "../services/api";
const Context = createContext<{
  signedIn: boolean;
  profile: Profile | null;
  language: string;
  draft: string;
  setDraft: (v: string) => void;
  setLanguage: (v: string) => void;
  signIn: () => void;
  save: (p: Profile) => void;
  signOut: () => void;
}>({
  signedIn: false,
  profile: null,
  language: "English",
  draft: "",
  setDraft: () => {},
  setLanguage: () => {},
  signIn: () => {},
  save: () => {},
  signOut: () => {},
});
export function SessionProvider({ children }: PropsWithChildren) {
  const [signedIn, setSignedIn] = useState(false),
    [profile, setProfile] = useState<Profile | null>(null),
    [language, setLanguage] = useState("English"),
    [draft, setDraft] = useState("");
  return (
    <Context.Provider
      value={{
        signedIn,
        profile,
        language,
        setLanguage,
        draft,
        setDraft,
        signIn: () => setSignedIn(true),
        save: (p) => {
          setProfile(p);
          setLanguage(p.language);
        },
        signOut: () => {
          setSignedIn(false);
          setProfile(null);
          setDraft("");
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useSession = () => useContext(Context);
