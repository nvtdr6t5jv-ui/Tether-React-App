import "./global.css";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import {
  Fraunces_400Regular,
  Fraunces_600SemiBold,
} from "@expo-google-fonts/fraunces";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { OnboardingProvider } from "./src/context/OnboardingContext";
import { AppProvider } from "./src/context/AppContext";
import { GamificationProvider } from "./src/context/GamificationContext";
import { AuthProvider } from "./src/context/AuthContext";
import { WidgetProvider } from "./src/context/WidgetContext";
import { PendingActionProvider } from "./src/context/PendingActionContext";

export default function App() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    Fraunces_400Regular,
    Fraunces_600SemiBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F4F1DE" }}>
        <ActivityIndicator size="large" color="#E07A5F" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <AppProvider>
            <GamificationProvider>
              <WidgetProvider>
                <PendingActionProvider>
                  <OnboardingProvider>
                    <StatusBar style="dark" />
                    <AppNavigator />
                  </OnboardingProvider>
                </PendingActionProvider>
              </WidgetProvider>
            </GamificationProvider>
          </AppProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
