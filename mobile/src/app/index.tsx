import { router } from "expo-router";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import { Screen, Button, Mark, colors } from "../components/ui";
import { useSession } from "../contexts/session";
export default function Welcome() {
  const session = useSession();
  return (
    <Screen header={false}>
      <View style={st.top}>
        <Mark />
        <Text style={st.brand}>MedGuide AI</Text>
        <Text style={st.heading}>
          Healthcare{"\n"}guidance,{"\n"}closer to home.
        </Text>
        <Text style={st.copy}>
          Health information,{"\n"}in a language you’re comfortable with.
        </Text>
        <View style={st.languages}>
          {["English", "हिंदी", "తెలుగు"].map((l) => (
            <Pressable
              key={l}
              accessibilityRole="button"
              accessibilityState={{ selected: session.language === l }}
              onPress={() => session.setLanguage(l)}
              style={[
                st.pill,
                session.language === l && {
                  backgroundColor: colors.forest,
                  borderColor: colors.forest,
                },
              ]}
            >
              <Text
                style={{
                  fontFamily: "Body",
                  color: session.language === l ? colors.paper : colors.forest,
                  fontSize: 15,
                }}
              >
                {l}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={st.scene}>
        <Image
          source={require("../../assets/welcome-rural.webp")}
          accessibilityLabel="An older villager and a young woman looking at a smartphone outside a rural Indian home"
          style={st.photo}
        />
      </View>
      <View style={st.actions}>
        <Button label="Get started  →" onPress={() => router.push("/signup")} />
        <Button
          label="Sign in"
          secondary
          onPress={() => router.push("/login")}
        />
      </View>
    </Screen>
  );
}
const st = StyleSheet.create({
  top: { alignItems: "center", paddingTop: 10 },
  brand: {
    fontFamily: "Display",
    fontSize: 16,
    color: colors.forest,
    marginTop: 2,
  },
  heading: {
    fontFamily: "Display",
    fontSize: 40,
    lineHeight: 43,
    textAlign: "center",
    color: colors.forest,
    marginTop: 18,
  },
  copy: {
    fontFamily: "Body",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    color: colors.muted,
    marginTop: 12,
  },
  languages: {
    flexDirection: "row",
    gap: 8,
    width: "100%",
    marginTop: 20,
    marginBottom: 8,
  },
  pill: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d4d8ca",
    borderRadius: 25,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  scene: {
    height: 280,
    overflow: "hidden",
    marginHorizontal: -24,
    marginTop: 6,
  },
  photo: {
    position: "absolute",
    bottom: -12,
    width: "100%",
    height: 620,
    resizeMode: "cover",
  },
  actions: {
    marginTop: -12,
    padding: 12,
    paddingBottom: 0,
    backgroundColor: colors.paper,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
});
