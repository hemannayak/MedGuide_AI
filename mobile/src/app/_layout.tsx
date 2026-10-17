import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AccessibilityInfo, ActivityIndicator, View } from "react-native";
import { SessionProvider } from "../contexts/session";
export default function Layout() {
  const [reducedMotion,setReducedMotion]=useState(true);
  useEffect(()=>{let mounted=true;AccessibilityInfo.isReduceMotionEnabled().then(value=>{if(mounted)setReducedMotion(value);});const subscription=AccessibilityInfo.addEventListener("reduceMotionChanged",setReducedMotion);return()=>{mounted=false;subscription.remove();};},[]);
  const [loaded, error] = useFonts({
    Display: require("../../assets/fonts/dm-serif-display.ttf"),
    Body: require("../../assets/fonts/dm-sans-variable.ttf"),
  });
  if (!loaded && !error)
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#fbf8f1",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator
          color="#073d37"
          accessibilityLabel="Loading MedGuide"
        />
      </View>
    );
  return (
    <SafeAreaProvider>
      <SessionProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#fbf8f1" },
            animation: reducedMotion ? "none" : "fade",
          }}
        />
      </SessionProvider>
    </SafeAreaProvider>
  );
}
