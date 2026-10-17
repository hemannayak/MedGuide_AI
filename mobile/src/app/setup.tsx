import { useState } from "react";
import { Redirect, router } from "expo-router";
import { Screen, Field, Button, Note } from "../components/ui";
import { useSession } from "../contexts/session";
export default function Setup() {
  const session = useSession();
  const [name, setName] = useState(""),
    [language, setLanguage] = useState(session.language),
    [age, setAge] = useState(""),
    [health, setHealth] = useState(""),
    [error, setError] = useState("");
  if (!session.signedIn) return <Redirect href="/login" />;
  function finish() {
    if (!name.trim()) {
      setError("Enter a sample name.");
      return;
    }
    if (age && (!/^\d+$/.test(age) || Number(age) > 120)) {
      setError("Enter a valid age or leave it blank.");
      return;
    }
    session.save({ name: name.trim(), language, age, healthNotes: health });
    router.replace("/ask");
  }
  return (
    <Screen
      title="Make it feel familiar"
      subtitle="Only your name is required. Use sample details."
    >
      <Field label="Your name" value={name} onChangeText={setName} />
      <Note>Preferred language: {language}</Note>
      {["English", "हिंदी", "తెలుగు"].map((l) => (
        <Button
          key={l}
          secondary
          label={l === language ? `${l} · selected` : l}
          onPress={() => setLanguage(l)}
        />
      ))}
      <Field label="Age (optional)" value={age} onChangeText={setAge} numeric />
      <Field
        label="Health context (optional sample details)"
        value={health}
        onChangeText={setHealth}
      />
      {!!error && <Note>{error}</Note>}
      <Button label="Save and ask MedGuide" onPress={finish} />
      <Note>
        Sample profile stays only in memory and clears on sign-out or app
        restart. Live profile storage is not connected.
      </Note>
    </Screen>
  );
}
