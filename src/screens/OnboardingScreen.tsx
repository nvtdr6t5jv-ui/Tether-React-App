import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  FadeInUp,
  withSpring,
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
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
  const currentIndex = useRef(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleNext = () => {
    if (currentIndex.current < onboardingSlides.length - 1) {
      currentIndex.current += 1;
      flatListRef.current?.scrollToIndex({
        index: currentIndex.current,
        animated: true,
      });
    } else {
      navigation.navigate("Auth", { mode: "signup" });
    }
  };

  const handleLogin = () => {
    navigation.navigate("Auth", { mode: "login" });
  };

  const handleCreateAccount = () => {
    navigation.navigate("Auth", { mode: "signup" });
  };

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    currentIndex.current = index;
  };

  const isLastSlide = currentIndex.current === onboardingSlides.length - 1;

  return (
    <View className="flex-1 bg-background-light">
      <View className="absolute top-[-10%] left-[-10%] w-[80%] h-[40%] bg-secondary/10 rounded-full blur-3xl" />
      <View className="absolute bottom-[-5%] right-[-10%] w-[60%] h-[30%] bg-primary/10 rounded-full blur-2xl" />

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
        className="absolute bottom-0 left-0 right-0 px-6 pb-8"
      >
        <View className="items-center">
          <PaginationDots totalSlides={onboardingSlides.length} scrollX={scrollX} />

          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.9}
            className="w-full h-16 bg-primary rounded-full items-center justify-center flex-row gap-2 shadow-lg"
            style={{
              shadowColor: "#E07A5F",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4,
              shadowRadius: 20,
              elevation: 8,
            }}
          >
            <Text className="text-surface-light text-lg font-display-bold">
              {isLastSlide ? "Create Account" : currentIndex.current === 0 ? "Get Started" : "Next"}
            </Text>
            {!isLastSlide && (
              <Text className="text-surface-light text-lg">→</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogin} className="mt-6">
            <Text className="text-sm font-display text-text-main/50">
              Already have an account?{" "}
              <Text className="font-display-semibold text-primary">Log in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};
