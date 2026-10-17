import { Redirect, router } from "expo-router";
import { View, Text } from "react-native";
import { Screen, Button, Note, Row, colors, s } from "../components/ui";
import { useSession } from "../contexts/session";
export default function Information() {
  const session = useSession();
  if (!session.signedIn) return <Redirect href="/login" />;
  if (!session.profile) return <Redirect href="/setup" />;
  return (
    <Screen tab="information">
      <Row
        label={session.profile.name}
        detail="Manage your health information"
        icon="person-circle-outline"
        onPress={() => router.push("/profile")}
      />
      {(
        [
          {
            name: "Symptoms",
            label: "Symptom input",
            detail: "Put what you noticed into words",
            icon: "pulse-outline",
          },
          {
            name: "Documents",
            label: "Documents",
            detail: "View your document workspace",
            icon: "document-text-outline",
          },
          {
            name: "Medicines",
            label: "Medicines",
            detail: "Understand your medication information",
            icon: "bandage-outline",
          },
          {
            name: "Saved conversations",
            label: "Saved conversations",
            detail: "Revisit your questions",
            icon: "chatbubble-outline",
          },
          {
            name: "Health profile",
            label: "Health profile",
            detail: "Basic information about you",
            icon: "person-outline",
          },
        ] as const
      ).map((item) => (
        <Row
          key={item.name}
          label={item.label}
          detail={item.detail}
          icon={item.icon}
          onPress={() =>
            item.name === "Health profile"
              ? router.push("/profile")
              : router.push({ pathname: "/tool", params: { name: item.name } })
          }
        />
      ))}
      <View
        style={{
          borderWidth: 1,
          borderColor: colors.line,
          borderRadius: 20,
          padding: 18,
          marginTop: 10,
          marginBottom: 12,
        }}
      >
        <Text style={s.note}>Document workspace</Text>
        <Row
          label="Sample document"
          detail="Preview only · No prescription data"
          icon="document-outline"
          onPress={() =>
            router.push({ pathname: "/tool", params: { name: "Documents" } })
          }
        />
      </View>
      <Row
        label="Language preference"
        detail={session.language + " · interface preview"}
        icon="globe-outline"
        onPress={() => router.push("/profile")}
      />
      <Button
        label="Ask MedGuide"
        icon="mic-outline"
        onPress={() => router.replace("/ask")}
      />
      <Note>UI preview · No live health records are connected.</Note>
    </Screen>
  );
}
