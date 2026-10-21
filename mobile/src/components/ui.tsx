import { PropsWithChildren } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Svg, { Path } from "react-native-svg";
export const colors = {
  forest: "#073d37",
  paper: "#fbf8f1",
  coral: "#df8566",
  muted: "#596762",
  line: "#e4e1d6",
  sage: "#e8ecdf",
};
export type IconName = string;
export function Icon({
  name,
  size = 25,
  color = colors.forest,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  const glyphMap: Record<string, string> = {
    "mic-outline": "🎙",
    "chatbubble-outline": "💬",
    "document-text-outline": "📄",
    "medkit-outline": "💊",
    "home-outline": "⌂",
    "calendar-outline": "📅",
    "time-outline": "⏱",
    "settings-outline": "⚙",
    "person-outline": "👤",
    "chevron-forward": "❯",
    "chevron-back": "❮",
    "arrow-back": "←",
    "play-outline": "▶",
    "checkmark-circle": "✓",
    "alert-circle": "⚠️",
    "shield-checkmark-outline": "🛡",
  };
  const symbol = glyphMap[name] || "●";
  return (
    <Text
      style={{ fontSize: size * 0.85, color, textAlign: "center" }}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {symbol}
    </Text>
  );
}
export function Mark() {
  return (
    <Svg
      width={34}
      height={34}
      viewBox="0 0 40 40"
      accessibilityLabel="MedGuide"
    >
      <Path
        d="M5 33C1 22 5 9 12 4c8 5 12 14 10 27L11 16l3 18Z"
        fill={colors.forest}
      />
      <Path
        d="M22 34C18 23 24 9 35 7c5 11 1 22-7 28l3-17Z"
        fill={colors.coral}
      />
    </Svg>
  );
}
export function Brand({ center = false }: { center?: boolean }) {
  return (
    <View style={[s.brand, center && { justifyContent: "center" }]}>
      <Mark />
      <Text style={s.brandText}>MedGuide AI</Text>
    </View>
  );
}
export function BottomNav({
  active,
}: {
  active: "ask" | "information" | "profile";
}) {
  return (
    <View style={s.nav}>
      {(
        [
          { key: "ask", label: "Ask", icon: "mic-outline" },
          {
            key: "information",
            label: "My information",
            icon: "document-text-outline",
          },
          { key: "profile", label: "Profile", icon: "person-outline" },
        ] as const
      ).map((item) => (
        <Pressable
          key={item.key}
          accessibilityRole="tab"
          accessibilityState={{ selected: active === item.key }}
          accessibilityLabel={item.label}
          onPress={() => router.replace(`/${item.key}`)}
          style={({ pressed }) => [s.navItem, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Icon name={item.icon} size={23} />
          <Text
            style={[s.navText, active === item.key && { fontWeight: "700" }]}
          >
            {item.label}
          </Text>
          <View
            style={[
              s.navLine,
              active !== item.key && { backgroundColor: "transparent" },
            ]}
          />
        </Pressable>
      ))}
    </View>
  );
}
export function Screen({
  title,
  subtitle,
  children,
  tab,
  back,
  header = true,
}: PropsWithChildren<{
  title?: string;
  subtitle?: string;
  tab?: "ask" | "information" | "profile";
  back?: () => void;
  header?: boolean;
}>) {
  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={s.safe}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={s.frame}>
          {header && (
            <View style={s.header}>
              {back ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Go back"
                  onPress={back}
                  style={s.touch}
                >
                  <Icon name="arrow-back" />
                </Pressable>
              ) : (
                <Brand />
              )}
              {tab && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Open profile"
                  onPress={() => router.push("/profile")}
                  style={s.avatar}
                >
                  <Icon name="person-outline" size={20} />
                </Pressable>
              )}
            </View>
          )}
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={s.screen}
          >
            {title && (
              <Text accessibilityRole="header" style={s.title}>
                {title}
              </Text>
            )}
            {subtitle && <Text style={s.copy}>{subtitle}</Text>}
            {children}
          </ScrollView>
          {tab && <BottomNav active={tab} />}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
export function Button({
  label,
  onPress,
  secondary = false,
  disabled = false,
  icon,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  icon?: IconName;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        secondary && s.secondary,
        { opacity: disabled ? 0.45 : pressed ? 0.8 : 1 },
      ]}
    >
      {icon && (
        <Icon
          name={icon}
          size={21}
          color={secondary ? colors.forest : colors.paper}
        />
      )}
      <Text style={[s.buttonText, secondary && { color: colors.forest }]}>
        {label}
      </Text>
    </Pressable>
  );
}
export function Field({
  label,
  value,
  onChangeText,
  secure = false,
  numeric = false,
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  secure?: boolean;
  numeric?: boolean;
  multiline?: boolean;
}) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secure}
        multiline={multiline}
        keyboardType={
          numeric
            ? "number-pad"
            : label.toLowerCase().includes("email")
              ? "email-address"
              : "default"
        }
        autoCapitalize={secure ? "none" : "sentences"}
        style={[
          s.input,
          multiline && { minHeight: 110, textAlignVertical: "top" },
        ]}
      />
    </View>
  );
}
export function Note({ children }: PropsWithChildren) {
  return <Text style={s.note}>{children}</Text>;
}
export function Row({
  label,
  detail,
  icon,
  onPress,
}: {
  label: string;
  detail?: string;
  icon: IconName;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        s.row,
        { backgroundColor: pressed ? colors.sage : "#fffdf7" },
      ]}
    >
      <Icon name={icon} />
      <View style={{ flex: 1 }}>
        <Text style={s.rowTitle}>{label}</Text>
        {detail && <Text style={s.rowDetail}>{detail}</Text>}
      </View>
      <Icon name="chevron-forward" size={18} />
    </Pressable>
  );
}
export const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  frame: { flex: 1, width: "100%", maxWidth: 640, alignSelf: "center" },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 8 },
  brandText: { fontFamily: "Display", fontSize: 23, color: colors.forest },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 22,
    backgroundColor: colors.sage,
    alignItems: "center",
    justifyContent: "center",
  },
  touch: { minHeight: 48, minWidth: 48, justifyContent: "center" },
  screen: {
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 24,
    flexGrow: 1,
  },
  title: {
    fontFamily: "Display",
    fontSize: 34,
    color: colors.forest,
    lineHeight: 41,
    marginBottom: 10,
  },
  copy: {
    fontFamily: "Body",
    fontSize: 16,
    lineHeight: 24,
    color: colors.muted,
    marginBottom: 24,
  },
  button: {
    minHeight: 54,
    padding: 15,
    borderRadius: 18,
    backgroundColor: colors.forest,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#bdc6b7",
  },
  buttonText: {
    fontFamily: "Body",
    color: colors.paper,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  fieldLabel: {
    fontFamily: "Body",
    fontSize: 14,
    color: colors.forest,
    marginBottom: 8,
  },
  input: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    padding: 15,
    color: colors.forest,
    backgroundColor: "#fffdf8",
    fontSize: 16,
    fontFamily: "Body",
  },
  note: {
    fontFamily: "Body",
    fontSize: 12,
    color: colors.muted,
    lineHeight: 19,
    marginVertical: 12,
  },
  nav: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: colors.line,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: colors.paper,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 58,
    gap: 4,
  },
  navText: { fontFamily: "Body", fontSize: 11, color: colors.forest },
  navLine: {
    width: 30,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.forest,
    marginTop: 3,
  },
  row: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 19,
    padding: 18,
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
    marginBottom: 9,
  },
  rowTitle: {
    fontFamily: "Body",
    fontSize: 16,
    fontWeight: "600",
    color: colors.forest,
  },
  rowDetail: {
    fontFamily: "Body",
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
    lineHeight: 18,
  },
});
