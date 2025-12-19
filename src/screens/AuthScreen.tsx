import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Animated, { FadeInDown, FadeInUp, Layout } from "react-native-reanimated";
import { useRoute, RouteProp } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "../navigation/AppNavigator";

type AuthScreenRouteProp = RouteProp<RootStackParamList, "Auth">;

export const AuthScreen = () => {
  const route = useRoute<AuthScreenRouteProp>();
  const [isLogin, setIsLogin] = useState(route.params?.mode === "login");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow justify-between px-6 py-8"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            entering={FadeInDown.duration(600)}
            className="items-center pt-8 pb-6"
          >
            <Text className="text-primary font-serif-semibold text-[40px] tracking-tight text-center">
              Tether
            </Text>
            <Text className="text-text-main/80 font-serif text-lg text-center mt-2">
              Cultivate better connections.
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(200).duration(500)}
            className="flex-1 justify-center"
          >
            <View className="bg-secondary/10 p-1.5 rounded-full flex-row mb-6">
              <TouchableOpacity
                onPress={() => setIsLogin(false)}
                className={`flex-1 py-3 px-6 rounded-full items-center justify-center ${
                  !isLogin ? "bg-primary shadow-md" : ""
                }`}
              >
                <Text
                  className={`font-display-bold text-sm tracking-wide ${
                    !isLogin ? "text-surface-light" : "text-secondary"
                  }`}
                >
                  Create Account
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsLogin(true)}
                className={`flex-1 py-3 px-6 rounded-full items-center justify-center ${
                  isLogin ? "bg-primary shadow-md" : ""
                }`}
              >
                <Text
                  className={`font-display-bold text-sm tracking-wide ${
                    isLogin ? "text-surface-light" : "text-secondary"
                  }`}
                >
                  Log In
                </Text>
              </TouchableOpacity>
            </View>

            <Animated.View layout={Layout.springify()} className="gap-4">
              {!isLogin && (
                <Animated.View
                  entering={FadeInDown.duration(300)}
                  className="relative"
                >
                  <View className="absolute left-5 top-0 bottom-0 justify-center z-10">
                    <Text className="text-secondary text-xl">👤</Text>
                  </View>
                  <TextInput
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Full Name"
                    placeholderTextColor="rgba(61, 64, 91, 0.4)"
                    className="w-full bg-surface-light rounded-full py-4 pl-14 pr-4 text-text-main text-base border border-secondary/20"
                  />
                </Animated.View>
              )}

              <View className="relative">
                <View className="absolute left-5 top-0 bottom-0 justify-center z-10">
                  <Text className="text-secondary text-xl">✉️</Text>
                </View>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email Address"
                  placeholderTextColor="rgba(61, 64, 91, 0.4)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="w-full bg-surface-light rounded-full py-4 pl-14 pr-4 text-text-main text-base border border-secondary/20"
                />
              </View>

              <View className="relative">
                <View className="absolute left-5 top-0 bottom-0 justify-center z-10">
                  <Text className="text-secondary text-xl">🔒</Text>
                </View>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  placeholderTextColor="rgba(61, 64, 91, 0.4)"
                  secureTextEntry={!showPassword}
                  className="w-full bg-surface-light rounded-full py-4 pl-14 pr-14 text-text-main text-base border border-secondary/20"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-0 bottom-0 justify-center"
                >
                  <Text className="text-secondary text-xl">
                    {showPassword ? "🙈" : "👁️"}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            <View className="mt-6 gap-4">
              <TouchableOpacity
                activeOpacity={0.9}
                className="w-full h-14 bg-primary rounded-full items-center justify-center shadow-lg"
                style={{
                  shadowColor: "#E07A5F",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <Text className="text-surface-light font-display-bold text-lg">
                  {isLogin ? "Log In" : "Get Started"}
                </Text>
              </TouchableOpacity>

              {isLogin && (
                <TouchableOpacity className="items-center">
                  <Text className="text-sm font-display-medium text-text-main/70">
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View className="my-6">
              <View className="flex-row items-center">
                <View className="flex-1 h-px bg-text-main/10" />
                <Text className="px-4 text-sm text-text-main/60 font-display-medium">
                  Or continue with
                </Text>
                <View className="flex-1 h-px bg-text-main/10" />
              </View>
            </View>

            <View className="flex-row gap-4">
              <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-3 bg-surface-light rounded-full py-3.5 border border-text-main/10">
                <Text className="text-xl">🍎</Text>
                <Text className="font-display-semibold text-sm text-text-main">
                  Apple
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-3 bg-surface-light rounded-full py-3.5 border border-text-main/10">
                <Text className="text-xl">🔵</Text>
                <Text className="font-display-semibold text-sm text-text-main">
                  Google
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(800).duration(400)}
            className="pt-6"
          >
            <Text className="text-xs text-text-main/50 font-display-medium text-center">
              By continuing, you agree to our{" "}
              <Text className="text-primary">Terms</Text> &{" "}
              <Text className="text-primary">Privacy Policy</Text>.
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
