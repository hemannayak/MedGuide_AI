import { useState } from "react";
import { Redirect, router } from "expo-router";
import { Screen, Field, Button, Note, colors, s } from "../components/ui";
import { Text, Pressable, View } from "react-native";
import { useSession } from "../contexts/session";
export default function Profile() {
  const session = useSession();
  const [name, setName] = useState(session.profile?.name || ""),
    [age, setAge] = useState(session.profile?.age || ""),
    [message, setMessage] = useState("");
  if (!session.signedIn) return <Redirect href="/login" />;
  if (!session.profile) return <Redirect href="/setup" />;
  function save() {
    if (!name.trim()) {
      setMessage("Please enter a sample name.");
      return;
    }
    if (age && (!/^\d+$/.test(age) || Number(age) > 120)) {
      setMessage("Enter a valid age, or leave it blank.");
      return;
    }
    session.save({
      ...session.profile!,
      name: name.trim(),
      age,
      language: session.language,
    });
    setMessage("Sample profile updated for this app session.");
  }
  return (
    <Screen
      title="Your profile"
      subtitle="A few details to make the experience familiar."
      tab="profile"
    >
      <Field label="Your name" value={name} onChangeText={setName} />
      <Field label="Age (optional)" value={age} onChangeText={setAge} numeric />
      <Text style={s.fieldLabel}>Language preference</Text>
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
        {["English", "हिंदी", "తెలుగు"].map((l) => (
          <Pressable
            key={l}
            accessibilityRole="button"
            accessibilityState={{ selected: session.language === l }}
            onPress={() => session.setLanguage(l)}
            style={{
              flex: 1,
              minHeight: 48,
              borderWidth: 1,
              borderRadius: 24,
              borderColor: colors.line,
              backgroundColor:
                l === session.language ? colors.forest : colors.paper,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                color: l === session.language ? colors.paper : colors.forest,
              }}
            >
              {l}
            </Text>
          </Pressable>
        ))}
      </View>
      <Note>
        Language selection saves a preference. Full interface translation and
        voice services are not connected in this preview.
      </Note>
      <Button label="Save changes" onPress={save} />
      {!!message && (
        <Text accessibilityRole="alert" style={s.note}>
          {message}
        </Text>
      )}
      <Button
        label="Sign out"
        secondary
        icon="log-out-outline"
        onPress={() => {
          session.signOut();
          router.replace("/");
        }}
      />
      <Note>
        Use sample details only. Profile information stays in memory and clears
        when the app restarts or you sign out.
      </Note>
    </Screen>
  );
}
