import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackParamList } from "../navigation/AppNavigator";
import { AppleLogo, GoogleLogo } from "../components/SocialIcons";
import { useAuth } from "../context/AuthContext";

type AuthScreenRouteProp = RouteProp<RootStackParamList, "Auth">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const AuthScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AuthScreenRouteProp>();
  const { signUpWithEmail, signInWithEmail, signInWithApple, signInWithGoogle, isAuthenticated } = useAuth();
  
  const [isLogin, setIsLogin] = useState(route.params?.mode === "login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  useEffect(() => {
    if (isAuthenticated) {
      navigation.replace("OnboardingValuePreview");
    }
  }, [isAuthenticated, navigation]);

  const clearErrors = () => {
    setError(null);
    setFieldErrors({});
  };

  const validate = (): boolean => {
    const errors: typeof fieldErrors = {};
    
    if (!isLogin && !fullName.trim()) {
      errors.fullName = "Name is required";
    }
    
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(email)) {
      errors.email = "Invalid email format";
    }
    
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    
    if (!isLogin) {
      if (!confirmPassword) {
        errors.confirmPassword = "Please confirm your password";
      } else if (password !== confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    clearErrors();
    
    if (!validate()) return;
    
    setIsLoading(true);
    
    try {
      if (isLogin) {
        const { error: authError } = await signInWithEmail(email, password);
        if (authError) {
          setError(authError);
        }
      } else {
        const { error: authError } = await signUpWithEmail(email, password, fullName.trim());
        if (authError) {
          setError(authError);
        }
      }
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    clearErrors();
    setIsLoading(true);
    try {
      const { error: authError } = await signInWithApple();
      if (authError) {
        setError(authError);
      }
    } catch (e: any) {
      setError(e.message || "Apple sign in failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    clearErrors();
    setIsLoading(true);
    try {
      const { error: authError } = await signInWithGoogle();
      if (authError) {
        setError(authError);
      }
    } catch (e: any) {
      setError(e.message || "Google sign in failed");
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (login: boolean) => {
    clearErrors();
    setIsLogin(login);
  };

  const renderInput = (
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    icon: string,
    options?: {
      keyboardType?: "email-address" | "default";
      autoCapitalize?: "none" | "sentences" | "words";
      secureTextEntry?: boolean;
      showToggle?: boolean;
      toggleValue?: boolean;
      onToggle?: () => void;
      error?: string;
    }
  ) => (
    <View>
      <View style={{ position: "relative" }}>
        <View style={{ position: "absolute", left: 20, top: 0, bottom: 0, justifyContent: "center", zIndex: 10 }}>
          <MaterialCommunityIcons name={icon as any} size={20} color="#81B29A" />
        </View>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(61, 64, 91, 0.4)"
          keyboardType={options?.keyboardType || "default"}
          autoCapitalize={options?.autoCapitalize || "sentences"}
          secureTextEntry={options?.secureTextEntry}
          editable={!isLoading}
          style={{
            width: "100%",
            backgroundColor: "#FDFCF8",
            borderRadius: 9999,
            paddingVertical: 16,
            paddingLeft: 52,
            paddingRight: options?.showToggle ? 52 : 16,
            color: "#3D405B",
            fontSize: 16,
            borderWidth: 1,
            borderColor: options?.error ? "#E07A5F" : "rgba(129, 178, 154, 0.2)",
          }}
        />
        {options?.showToggle && (
          <TouchableOpacity
            onPress={options.onToggle}
            style={{ position: "absolute", right: 20, top: 0, bottom: 0, justifyContent: "center" }}
          >
            <MaterialCommunityIcons
              name={options.toggleValue ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#81B29A"
            />
          </TouchableOpacity>
        )}
      </View>
      {options?.error && (
        <Text style={{ color: "#E07A5F", fontSize: 12, marginTop: 4, marginLeft: 16, fontFamily: "PlusJakartaSans_500Medium" }}>
          {options.error}
        </Text>
      )}
    </View>
  );

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
                onPress={() => switchMode(false)}
                disabled={isLoading}
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
                onPress={() => switchMode(true)}
                disabled={isLoading}
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

            {error && (
              <View style={{ 
                backgroundColor: "rgba(224, 122, 95, 0.1)", 
                borderRadius: 12, 
                padding: 12, 
                marginBottom: 16,
                borderWidth: 1,
                borderColor: "rgba(224, 122, 95, 0.3)",
              }}>
                <Text style={{ color: "#E07A5F", fontSize: 14, fontFamily: "PlusJakartaSans_500Medium", textAlign: "center" }}>
                  {error}
                </Text>
              </View>
            )}

            <View style={{ gap: 16 }}>
              {!isLogin && (
                renderInput(fullName, setFullName, "Full Name", "account-outline", {
                  autoCapitalize: "words",
                  error: fieldErrors.fullName,
                })
              )}
              
              {isLogin && <View style={{ height: 0 }} />}

              {renderInput(email, setEmail, "Email Address", "email-outline", {
                keyboardType: "email-address",
                autoCapitalize: "none",
                error: fieldErrors.email,
              })}

              {renderInput(password, setPassword, "Password", "lock-outline", {
                secureTextEntry: !showPassword,
                showToggle: true,
                toggleValue: showPassword,
                onToggle: () => setShowPassword(!showPassword),
                error: fieldErrors.password,
              })}

              {!isLogin && (
                renderInput(confirmPassword, setConfirmPassword, "Confirm Password", "lock-check-outline", {
                  secureTextEntry: !showConfirmPassword,
                  showToggle: true,
                  toggleValue: showConfirmPassword,
                  onToggle: () => setShowConfirmPassword(!showConfirmPassword),
                  error: fieldErrors.confirmPassword,
                })
              )}
            </View>

            <View style={{ marginTop: 24, gap: 16 }}>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isLoading}
                activeOpacity={0.9}
                style={{
                  width: "100%",
                  height: 56,
                  backgroundColor: isLoading ? "rgba(224, 122, 95, 0.6)" : "#E07A5F",
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
                {isLoading ? (
                  <ActivityIndicator color="#FDFCF8" />
                ) : (
                  <Text style={{ color: "#FDFCF8", fontFamily: "PlusJakartaSans_700Bold", fontSize: 18 }}>
                    {isLogin ? "Log In" : "Get Started"}
                  </Text>
                )}
              </TouchableOpacity>

              {isLogin && (
                <TouchableOpacity 
                  style={{ alignItems: "center" }}
                  disabled={isLoading}
                >
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
                onPress={handleAppleSignIn}
                disabled={isLoading}
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
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                <AppleLogo size={20} color="#3D405B" />
                <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold", fontSize: 14, color: "#3D405B" }}>
                  Apple
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleGoogleSignIn}
                disabled={isLoading}
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
                  opacity: isLoading ? 0.6 : 1,
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
