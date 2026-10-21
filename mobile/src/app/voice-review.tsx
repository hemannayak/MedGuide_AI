import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Redirect, router } from "expo-router";
import { Screen, Button, Field, Note, Icon, colors, s } from "../components/ui";
import { useSession } from "../contexts/session";
export default function VoiceReview() {
  const session = useSession();
  const [text, setText] = useState(
      "I would like to understand my prescription.",
    ),
    [editing, setEditing] = useState(false),
    [notice, setNotice] = useState("");
  if (!session.signedIn) return <Redirect href="/login" />;
  return (
    <Screen tab="ask" back={() => router.back()}>
      <View style={st.progress}>
        <Text style={s.rowTitle}>Review your words</Text>
        <Text style={s.note}>Sample transcript</Text>
      </View>
      <View style={st.steps}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[st.dot, i === 2 && { backgroundColor: colors.forest }]}
          />
        ))}
      </View>
      <Text style={[s.title, { textAlign: "center", marginTop: 30 }]}>
        Is this what you said?
      </Text>
      <Text style={[s.copy, { textAlign: "center" }]}>
        Please check the text below and make any changes if needed.
      </Text>
      <View style={st.voice}>
        <View style={st.wave}>
          {[12, 24, 17, 34, 23, 13, 27].map((h, i) => (
            <View key={i} style={[st.bar, { height: h }]} />
          ))}
        </View>
        <View style={st.circle}>
          <Icon name="mic-outline" size={38} />
        </View>
        <View style={st.wave}>
          {[27, 13, 23, 34, 17, 24, 12].map((h, i) => (
            <View key={i} style={[st.bar, { height: h }]} />
          ))}
        </View>
      </View>
      <View style={st.transcript}>
        {editing ? (
          <Field
            label="Edit sample transcript"
            value={text}
            onChangeText={setText}
            multiline
          />
        ) : (
          <>
            <Text style={s.note}>Sample transcript</Text>
            <Text style={st.words}>{text}</Text>
          </>
        )}
      </View>
      <Button
        label={editing ? "Done editing" : "Edit text"}
        icon="create-outline"
        secondary
        onPress={() => setEditing(!editing)}
      />
      <Button
        label="Continue  →"
        disabled={!text.trim()}
        onPress={() => {
          session.setDraft(text.trim());
          router.replace("/ask");
        }}
      />
      <Button
        label="Record again"
        secondary
        icon="refresh-outline"
        onPress={() =>
          setNotice(
            "Recording is not connected yet. You can edit this sample transcript instead.",
          )
        }
      />
      {!!notice && (
        <Text accessibilityRole="alert" style={s.note}>
          {notice}
        </Text>
      )}
      <Note>
        Voice preview · No microphone is recording. Speech processing will be
        connected separately.
      </Note>
    </Screen>
  );
}
const st = StyleSheet.create({
  progress: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  steps: { flexDirection: "row", gap: 42, alignSelf: "center", marginTop: 18 },
  dot: {
    height: 14,
    width: 14,
    borderWidth: 1,
    borderColor: "#9aad98",
    borderRadius: 8,
  },
  voice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    marginBottom: 32,
    marginTop: 12,
  },
  wave: { flexDirection: "row", gap: 4, alignItems: "center" },
  bar: { width: 3, backgroundColor: "#a5b8a3", borderRadius: 2 },
  circle: {
    width: 90,
    height: 90,
    borderRadius: 50,
    backgroundColor: "#dce2d1",
    alignItems: "center",
    justifyContent: "center",
  },
  transcript: {
    borderWidth: 1,
    borderColor: colors.line,
    padding: 20,
    borderRadius: 22,
    marginBottom: 16,
  },
  words: {
    fontFamily: "Display",
    fontSize: 24,
    lineHeight: 32,
    color: colors.forest,
  },
});
