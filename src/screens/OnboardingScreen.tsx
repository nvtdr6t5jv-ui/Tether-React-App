import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  FadeInUp,
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { OnboardingSlide } from "../components/OnboardingSlide";
import { PaginationDots } from "../components/PaginationDots";
import { onboardingSlides } from "../constants/theme";
import { RootStackParamList } from "../navigation/AppNavigator";

const { width } = Dimensions.get("window");

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Onboarding">;

export const OnboardingScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const scrollX = useSharedValue(0);
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleNext = () => {
    if (currentIndex < onboardingSlides.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    } else {
      navigation.navigate("Auth", { mode: "signup" });
    }
  };

  const handleLogin = () => {
    navigation.navigate("Auth", { mode: "login" });
  };

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const isLastSlide = currentIndex === onboardingSlides.length - 1;
  const isFirstSlide = currentIndex === 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F4F1DE" }} edges={["top", "bottom"]}>
      <View style={{ position: "absolute", top: "-10%", left: "-10%", width: "80%", height: "40%", backgroundColor: "rgba(129, 178, 154, 0.1)", borderRadius: 9999 }} />
      <View style={{ position: "absolute", bottom: "-5%", right: "-10%", width: "60%", height: "30%", backgroundColor: "rgba(224, 122, 95, 0.1)", borderRadius: 9999 }} />

      <AnimatedFlatList
        ref={flatListRef}
        data={onboardingSlides}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={({ item, index }: { item: any; index: number }) => (
          <OnboardingSlide slide={item} index={index} scrollX={scrollX} />
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onMomentumScrollEnd}
        bounces={false}
      />

      <Animated.View
        entering={FadeInUp.delay(600).duration(500)}
        style={{ paddingHorizontal: 24, paddingBottom: 32 }}
      >
        <View style={{ alignItems: "center" }}>
          <PaginationDots totalSlides={onboardingSlides.length} scrollX={scrollX} />

          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.9}
            style={{
              width: "100%",
              height: 64,
              backgroundColor: "#E07A5F",
              borderRadius: 9999,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 8,
              shadowColor: "#E07A5F",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4,
              shadowRadius: 20,
              elevation: 8,
            }}
          >
            <Text style={{ color: "#FDFCF8", fontSize: 18, fontFamily: "PlusJakartaSans_700Bold" }}>
              {isLastSlide ? "Create Account" : isFirstSlide ? "Get Started" : "Next"}
            </Text>
            {!isLastSlide && (
              <MaterialCommunityIcons name="arrow-right" size={20} color="#FDFCF8" />
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogin} style={{ marginTop: 24 }}>
            <Text style={{ fontSize: 14, fontFamily: "PlusJakartaSans_400Regular", color: "rgba(61, 64, 91, 0.5)" }}>
              Already have an account?{" "}
              <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold", color: "#E07A5F" }}>Log in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};
