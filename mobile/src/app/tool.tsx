import { useState } from "react";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { View, Text } from "react-native";
import { Screen, Button, Note, Field, Icon, colors, s } from "../components/ui";
import { useSession } from "../contexts/session";
const copy: Record<string, string> = {
  Symptoms:
    "Describe what you have noticed. This preview does not assess symptoms or assign a clinical risk level.",
  Documents:
    "Your documents, in one place. Upload and prescription OCR will be available after the document service is connected.",
  Medicines:
    "Your medicine information will appear here when records are connected. Do not change prescribed treatment based on this preview.",
  "Saved conversations":
    "Your saved conversations will appear here when conversation storage is connected.",
  "Using MedGuide":
    "Ask → Understand → Guide → Act. MedGuide supports healthcare understanding and conversations with qualified professionals.",
};
export default function Tool() {
  const { name = "Documents" } = useLocalSearchParams<{ name: string }>();
  const session = useSession();
  const [input, setInput] = useState(""),
    [notice, setNotice] = useState("");
  if (!session.signedIn) return <Redirect href="/login" />;
  return (
    <Screen
      title={name}
      subtitle={copy[name] || "This tool is not available yet."}
      tab="information"
      back={() => router.replace("/information")}
    >
      <View
        style={{
          alignItems: "center",
          padding: 32,
          backgroundColor: colors.sage,
          borderRadius: 24,
          marginBottom: 24,
        }}
      >
        <Icon
          name={
            name === "Medicines" ? "bandage-outline" : "document-text-outline"
          }
          size={48}
        />
        <Text style={[s.rowTitle, { marginTop: 16 }]}>
          Ready for your next step
        </Text>
      </View>
      {name === "Symptoms" && (
        <>
          <Field
            label="What have you noticed?"
            value={input}
            onChangeText={setInput}
            multiline
          />
          <Button
            label="Review in Ask MedGuide"
            disabled={!input.trim()}
            onPress={() => {
              session.setDraft(input);
              router.replace("/ask");
            }}
          />
        </>
      )}
      {name === "Documents" && (
        <Button
          label="Document upload availability"
          secondary
          onPress={() =>
            setNotice(
              "Document upload and OCR are not connected. No file has been uploaded.",
            )
          }
        />
      )}
      <Text accessibilityRole="alert" style={s.note}>
        {notice}
      </Text>
      <Button label="Ask MedGuide" onPress={() => router.replace("/ask")} />
      <Button
        secondary
        label="Back to my information"
        onPress={() => router.replace("/information")}
      />
      <Note>Mobile UI preview · No live medical records.</Note>
    </Screen>
  );
}
