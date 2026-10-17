import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Redirect, router } from "expo-router";
import { Screen, Note, Icon, colors, s } from "../components/ui";
import { useSession } from "../contexts/session";
import { sendMessage } from "../services/api";
export default function Ask() {
  const session = useSession();
  const [response, setResponse] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  if (!session.signedIn) return <Redirect href="/login" />;
  if (!session.profile) return <Redirect href="/setup" />;
  async function send() {
    if (!session.draft.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      setResponse(await sendMessage(session.draft));
      session.setDraft("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Screen
      title="How can we help?"
      subtitle="Ask a question about your health, medicines or documents."
      tab="ask"
    >
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push("/voice-review")}
        style={({ pressed }) => [st.voice, { opacity: pressed ? 0.85 : 1 }]}
      >
        <View style={st.mic}>
          <Icon name="mic-outline" size={34} />
        </View>
        <Text style={st.voiceTitle}>Tap to speak</Text>
        <Text style={st.voiceCopy}>Or type your question</Text>
      </Pressable>
      <View style={st.two}>
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            session.setDraft("How can I prepare my health question?")
          }
          style={st.mini}
        >
          <Icon name="chatbubble-outline" />
          <Text style={st.miniText}>Ask a health{"\n"}question</Text>
          <Icon name="chevron-forward" size={15} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.push({ pathname: "/tool", params: { name: "Documents" } })
          }
          style={st.mini}
        >
          <Icon name="document-text-outline" />
          <Text style={st.miniText}>Understand{"\n"}a prescription</Text>
        </Pressable>
      </View>
      <View style={st.composer}>
        <TextInput
          style={st.question}
          accessibilityLabel="Your health question"
          placeholder="Type your question here…"
          placeholderTextColor="#89918a"
          multiline
          value={session.draft}
          onChangeText={session.setDraft}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send question"
          accessibilityState={{ disabled: busy || !session.draft.trim() }}
          disabled={busy || !session.draft.trim()}
          onPress={send}
          style={[st.send, { opacity: session.draft.trim() ? 1 : 0.45 }]}
        >
          {busy ? (
            <ActivityIndicator color={colors.paper} />
          ) : (
            <Icon name="arrow-up" color={colors.paper} size={23} />
          )}
        </Pressable>
      </View>
      {!!error && (
        <Text accessibilityRole="alert" style={s.note}>
          {error}
        </Text>
      )}
      {!!response && (
        <View style={st.response}>
          <Text style={s.rowTitle}>Sample response</Text>
          <Text style={s.copy}>{response}</Text>
        </View>
      )}
      <View style={st.two}>
        {(
          [
            {
              name: "Documents",
              label: "My documents",
              icon: "document-text-outline",
            },
            {
              name: "Medicines",
              label: "My medicines",
              icon: "bandage-outline",
            },
          ] as const
        ).map((item) => (
          <Pressable
            key={item.name}
            accessibilityRole="button"
            onPress={() =>
              router.push({ pathname: "/tool", params: { name: item.name } })
            }
            style={st.tile}
          >
            <Icon name={item.icon} size={28} />
            <Text style={st.miniText}>{item.label} ›</Text>
          </Pressable>
        ))}
      </View>
      <Note>ⓘ Information and support, not a diagnosis.</Note>
      <Note>UI preview · Sample responses only.</Note>
    </Screen>
  );
}
const st = StyleSheet.create({
  voice: {
    backgroundColor: colors.forest,
    borderRadius: 23,
    padding: 24,
    alignItems: "center",
    marginBottom: 18,
  },
  mic: {
    width: 65,
    height: 65,
    borderRadius: 35,
    backgroundColor: colors.paper,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  voiceTitle: {
    fontFamily: "Body",
    fontWeight: "600",
    color: colors.paper,
    fontSize: 22,
  },
  voiceCopy: {
    fontFamily: "Body",
    color: "#e4e9df",
    fontSize: 14,
    marginTop: 5,
  },
  two: { flexDirection: "row", gap: 10, marginBottom: 18 },
  mini: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 19,
    padding: 12,
    minHeight: 78,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  miniText: {
    fontFamily: "Body",
    fontSize: 13,
    color: colors.forest,
    fontWeight: "600",
    flexShrink: 1,
    lineHeight: 19,
  },
  composer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 20,
    padding: 12,
    gap: 8,
    alignItems: "center",
    minHeight: 70,
    marginBottom: 20,
  },
  question: {
    flex: 1,
    fontFamily: "Body",
    fontSize: 16,
    minHeight: 40,
    color: colors.forest,
    maxHeight: 130,
  },
  send: {
    backgroundColor: colors.forest,
    width: 43,
    height: 43,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  tile: {
    flex: 1,
    minHeight: 104,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 20,
    padding: 18,
    gap: 13,
  },
  response: {
    borderLeftWidth: 3,
    borderColor: colors.coral,
    paddingLeft: 16,
    marginBottom: 16,
    gap: 10,
  },
});
