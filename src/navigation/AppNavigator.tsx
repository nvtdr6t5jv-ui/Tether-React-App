import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { AuthScreen } from "../screens/AuthScreen";
import { OnboardingSyncScreen } from "../screens/OnboardingSyncScreen";
import { OnboardingSelectFriendsScreen } from "../screens/OnboardingSelectFriendsScreen";
import { OnboardingManualAddScreen } from "../screens/OnboardingManualAddScreen";
import { OnboardingAssignOrbitsScreen } from "../screens/OnboardingAssignOrbitsScreen";
import { OnboardingCompleteScreen } from "../screens/OnboardingCompleteScreen";

export type RootStackParamList = {
  Onboarding: undefined;
  Auth: { mode: "login" | "signup" };
  OnboardingSync: undefined;
  OnboardingSelectFriends: undefined;
  OnboardingManualAdd: undefined;
  OnboardingAssignOrbits: undefined;
  OnboardingComplete: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Onboarding"
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: "#F4F1DE" },
        }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="OnboardingSync" component={OnboardingSyncScreen} />
        <Stack.Screen name="OnboardingSelectFriends" component={OnboardingSelectFriendsScreen} />
        <Stack.Screen name="OnboardingManualAdd" component={OnboardingManualAddScreen} />
        <Stack.Screen name="OnboardingAssignOrbits" component={OnboardingAssignOrbitsScreen} />
        <Stack.Screen name="OnboardingComplete" component={OnboardingCompleteScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
