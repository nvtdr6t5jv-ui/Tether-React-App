import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator, NativeStackNavigationOptions } from "@react-navigation/native-stack";
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

const screenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  animation: "fade_from_bottom",
  animationDuration: 300,
  contentStyle: { backgroundColor: "#F4F1DE" },
};

const onboardingFlowOptions: NativeStackNavigationOptions = {
  headerShown: false,
  animation: "slide_from_right",
  animationDuration: 350,
  contentStyle: { backgroundColor: "#F4F1DE" },
};

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Onboarding"
        screenOptions={screenOptions}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen 
          name="Auth" 
          component={AuthScreen}
          options={{ animation: "fade_from_bottom" }}
        />
        <Stack.Screen 
          name="OnboardingSync" 
          component={OnboardingSyncScreen}
          options={onboardingFlowOptions}
        />
        <Stack.Screen 
          name="OnboardingSelectFriends" 
          component={OnboardingSelectFriendsScreen}
          options={onboardingFlowOptions}
        />
        <Stack.Screen 
          name="OnboardingManualAdd" 
          component={OnboardingManualAddScreen}
          options={onboardingFlowOptions}
        />
        <Stack.Screen 
          name="OnboardingAssignOrbits" 
          component={OnboardingAssignOrbitsScreen}
          options={onboardingFlowOptions}
        />
        <Stack.Screen 
          name="OnboardingComplete" 
          component={OnboardingCompleteScreen}
          options={{ animation: "fade", animationDuration: 400 }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
