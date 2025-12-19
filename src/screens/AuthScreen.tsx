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
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp, Layout } from "react-native-reanimated";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackParamList } from "../navigation/AppNavigator";
import { AppleLogo, GoogleLogo } from "../components/SocialIcons";

type AuthScreenRouteProp = RouteProp<RootStackParamList, "Auth">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const AuthScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AuthScreenRouteProp>();
  const [isLogin, setIsLogin] = useState(route.params?.mode === "login");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    if (isLogin) {
      navigation.navigate("MainTabs");
    } else {
      navigation.navigate("OnboardingValuePreview");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F4F1DE" }} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, justifyContent: "space-between", paddingHorizontal: 24, paddingVertical: 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            entering={FadeInDown.duration(600)}
            style={{ alignItems: "center", paddingTop: 32, paddingBottom: 24 }}
          >
            <Text style={{ color: "#E07A5F", fontFamily: "Fraunces_600SemiBold", fontSize: 40, textAlign: "center" }}>
              Tether
            </Text>
            <Text style={{ color: "rgba(61, 64, 91, 0.8)", fontFamily: "Fraunces_400Regular", fontSize: 18, textAlign: "center", marginTop: 8 }}>
              Cultivate better connections.
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(200).duration(500)}
            style={{ flex: 1, justifyContent: "center" }}
          >
            <View style={{ backgroundColor: "rgba(129, 178, 154, 0.1)", padding: 6, borderRadius: 9999, flexDirection: "row", marginBottom: 24 }}>
              <TouchableOpacity
                onPress={() => setIsLogin(false)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  borderRadius: 9999,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: !isLogin ? "#E07A5F" : "transparent",
                }}
              >
                <Text style={{
                  fontFamily: "PlusJakartaSans_700Bold",
                  fontSize: 14,
                  color: !isLogin ? "#FDFCF8" : "#81B29A",
                }}>
                  Create Account
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsLogin(true)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  borderRadius: 9999,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isLogin ? "#E07A5F" : "transparent",
                }}
              >
                <Text style={{
                  fontFamily: "PlusJakartaSans_700Bold",
                  fontSize: 14,
                  color: isLogin ? "#FDFCF8" : "#81B29A",
                }}>
                  Log In
                </Text>
              </TouchableOpacity>
            </View>

            <Animated.View layout={Layout.springify()} style={{ gap: 16 }}>
              {!isLogin && (
                <Animated.View entering={FadeInDown.duration(300)} style={{ position: "relative" }}>
                  <View style={{ position: "absolute", left: 20, top: 0, bottom: 0, justifyContent: "center", zIndex: 10 }}>
                    <MaterialCommunityIcons name="account-outline" size={20} color="#81B29A" />
                  </View>
                  <TextInput
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Full Name"
                    placeholderTextColor="rgba(61, 64, 91, 0.4)"
                    style={{
                      width: "100%",
                      backgroundColor: "#FDFCF8",
                      borderRadius: 9999,
                      paddingVertical: 16,
                      paddingLeft: 52,
                      paddingRight: 16,
                      color: "#3D405B",
                      fontSize: 16,
                      borderWidth: 1,
                      borderColor: "rgba(129, 178, 154, 0.2)",
                    }}
                  />
                </Animated.View>
              )}

              <View style={{ position: "relative" }}>
                <View style={{ position: "absolute", left: 20, top: 0, bottom: 0, justifyContent: "center", zIndex: 10 }}>
                  <MaterialCommunityIcons name="email-outline" size={20} color="#81B29A" />
                </View>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email Address"
                  placeholderTextColor="rgba(61, 64, 91, 0.4)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={{
                    width: "100%",
                    backgroundColor: "#FDFCF8",
                    borderRadius: 9999,
                    paddingVertical: 16,
                    paddingLeft: 52,
                    paddingRight: 16,
                    color: "#3D405B",
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: "rgba(129, 178, 154, 0.2)",
                  }}
                />
              </View>

              <View style={{ position: "relative" }}>
                <View style={{ position: "absolute", left: 20, top: 0, bottom: 0, justifyContent: "center", zIndex: 10 }}>
                  <MaterialCommunityIcons name="lock-outline" size={20} color="#81B29A" />
                </View>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  placeholderTextColor="rgba(61, 64, 91, 0.4)"
                  secureTextEntry={!showPassword}
                  style={{
                    width: "100%",
                    backgroundColor: "#FDFCF8",
                    borderRadius: 9999,
                    paddingVertical: 16,
                    paddingLeft: 52,
                    paddingRight: 52,
                    color: "#3D405B",
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: "rgba(129, 178, 154, 0.2)",
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: 20, top: 0, bottom: 0, justifyContent: "center" }}
                >
                  <MaterialCommunityIcons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#81B29A"
                  />
                </TouchableOpacity>
              </View>
            </Animated.View>

            <View style={{ marginTop: 24, gap: 16 }}>
              <TouchableOpacity
                onPress={handleSubmit}
                activeOpacity={0.9}
                style={{
                  width: "100%",
                  height: 56,
                  backgroundColor: "#E07A5F",
                  borderRadius: 9999,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#E07A5F",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <Text style={{ color: "#FDFCF8", fontFamily: "PlusJakartaSans_700Bold", fontSize: 18 }}>
                  {isLogin ? "Log In" : "Get Started"}
                </Text>
              </TouchableOpacity>

              {isLogin && (
                <TouchableOpacity style={{ alignItems: "center" }}>
                  <Text style={{ fontSize: 14, fontFamily: "PlusJakartaSans_500Medium", color: "rgba(61, 64, 91, 0.7)" }}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={{ marginVertical: 24 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ flex: 1, height: 1, backgroundColor: "rgba(61, 64, 91, 0.1)" }} />
                <Text style={{ paddingHorizontal: 16, fontSize: 14, color: "rgba(61, 64, 91, 0.6)", fontFamily: "PlusJakartaSans_500Medium" }}>
                  Or continue with
                </Text>
                <View style={{ flex: 1, height: 1, backgroundColor: "rgba(61, 64, 91, 0.1)" }} />
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 16 }}>
              <TouchableOpacity
                onPress={handleSubmit}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  backgroundColor: "#FDFCF8",
                  borderRadius: 9999,
                  paddingVertical: 14,
                  borderWidth: 1,
                  borderColor: "rgba(61, 64, 91, 0.1)",
                }}
              >
                <AppleLogo size={20} color="#3D405B" />
                <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold", fontSize: 14, color: "#3D405B" }}>
                  Apple
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  backgroundColor: "#FDFCF8",
                  borderRadius: 9999,
                  paddingVertical: 14,
                  borderWidth: 1,
                  borderColor: "rgba(61, 64, 91, 0.1)",
                }}
              >
                <GoogleLogo size={20} />
                <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold", fontSize: 14, color: "#3D405B" }}>
                  Google
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(800).duration(400)}
            style={{ paddingTop: 24 }}
          >
            <Text style={{ fontSize: 12, color: "rgba(61, 64, 91, 0.5)", fontFamily: "PlusJakartaSans_500Medium", textAlign: "center" }}>
              By continuing, you agree to our{" "}
              <Text style={{ color: "#E07A5F" }}>Terms</Text> &{" "}
              <Text style={{ color: "#E07A5F" }}>Privacy Policy</Text>.
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
