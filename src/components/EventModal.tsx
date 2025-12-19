import React, { useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, Modal, Dimensions } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
  interpolate,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

interface EventModalProps {
  visible: boolean;
  onClose: () => void;
  event?: {
    id: string;
    title: string;
    date: string;
    subtitle?: string;
    type: "birthday" | "reminder" | "event";
  };
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export const EventModal: React.FC<EventModalProps> = ({
  visible,
  onClose,
  event,
}) => {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 300 });
      backdropOpacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = SCREEN_HEIGHT;
      backdropOpacity.value = 0;
    }
  }, [visible]);

  const handleCloseComplete = useCallback(() => {
    onClose();
  }, [onClose]);

  const closeDrawer = useCallback(() => {
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
    backdropOpacity.value = withTiming(0, { duration: 250 }, (finished) => {
      if (finished) {
        runOnJS(handleCloseComplete)();
      }
    });
  }, [handleCloseComplete]);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
        backdropOpacity.value = interpolate(
          event.translationY,
          [0, 300],
          [1, 0]
        );
      }
    })
    .onEnd((event) => {
      if (event.translationY > 100 || event.velocityY > 500) {
        translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
        backdropOpacity.value = withTiming(0, { duration: 250 }, (finished) => {
          if (finished) {
            runOnJS(handleCloseComplete)();
          }
        });
      } else {
        translateY.value = withTiming(0, { duration: 200 });
        backdropOpacity.value = withTiming(1, { duration: 200 });
      }
    });

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const defaultEvent = event || {
    id: "1",
    title: "Mark's Birthday",
    date: "Tomorrow, Oct 15",
    subtitle: "Turning 28.",
    type: "birthday" as const,
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "birthday":
        return "cake-variant";
      case "reminder":
        return "bell";
      default:
        return "calendar";
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={closeDrawer}>
      <View style={{ flex: 1 }}>
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(61, 64, 91, 0.4)",
            },
            animatedBackdropStyle,
          ]}
        >
          <TouchableOpacity style={{ flex: 1 }} onPress={closeDrawer} activeOpacity={1} />
        </Animated.View>

        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              {
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: "#F4F1DE",
                borderTopLeftRadius: 40,
                borderTopRightRadius: 40,
                overflow: "hidden",
              },
              animatedSheetStyle,
            ]}
          >
            <View style={{ width: 40, height: 4, backgroundColor: "rgba(61, 64, 91, 0.2)", borderRadius: 2, alignSelf: "center", marginTop: 12 }} />

            <View style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <TouchableOpacity onPress={closeDrawer}>
                  <MaterialCommunityIcons name="close" size={24} color="rgba(61, 64, 91, 0.3)" />
                </TouchableOpacity>
                <Text style={{ fontFamily: "Fraunces_600SemiBold", fontSize: 18, color: "#3D405B" }}>
                  Upcoming Event
                </Text>
                <TouchableOpacity>
                  <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 16, color: "#81B29A" }}>
                    Edit
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{ alignItems: "center", marginBottom: 32 }}>
                <Animated.View
                  entering={FadeIn.delay(200).duration(400)}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: "#FFF",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                    borderWidth: 4,
                    borderColor: "#FFF",
                    shadowColor: "#3D405B",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    elevation: 4,
                  }}
                >
                  <MaterialCommunityIcons
                    name={getIcon(defaultEvent.type)}
                    size={40}
                    color="#E07A5F"
                  />
                </Animated.View>

                <Animated.Text
                  entering={FadeInUp.delay(300).duration(400)}
                  style={{
                    fontFamily: "Fraunces_600SemiBold",
                    fontSize: 28,
                    color: "#3D405B",
                    textAlign: "center",
                    marginBottom: 8,
                  }}
                >
                  {defaultEvent.title}
                </Animated.Text>

                <Animated.View entering={FadeInUp.delay(400).duration(400)} style={{ alignItems: "center" }}>
                  <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 18, color: "#E07A5F" }}>
                    {defaultEvent.date}
                  </Text>
                  {defaultEvent.subtitle && (
                    <Text style={{ fontFamily: "PlusJakartaSans_500Medium", fontSize: 14, color: "rgba(61, 64, 91, 0.6)", marginTop: 4 }}>
                      {defaultEvent.subtitle}
                    </Text>
                  )}
                </Animated.View>
              </View>

              <View style={{ gap: 12 }}>
                <Animated.View entering={FadeInUp.delay(500).duration(400)}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={{
                      backgroundColor: "#FFF",
                      padding: 16,
                      borderRadius: 16,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 16,
                      shadowColor: "#3D405B",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.04,
                      shadowRadius: 8,
                      elevation: 2,
                    }}
                  >
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: "rgba(224, 122, 95, 0.1)",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <MaterialCommunityIcons name="gift" size={22} color="#E07A5F" />
                    </View>
                    <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 16, color: "#3D405B" }}>
                      Log Gift Idea
                    </Text>
                  </TouchableOpacity>
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(600).duration(400)}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={{
                      backgroundColor: "#FFF",
                      padding: 16,
                      borderRadius: 16,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 16,
                      shadowColor: "#3D405B",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.04,
                      shadowRadius: 8,
                      elevation: 2,
                    }}
                  >
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: "rgba(129, 178, 154, 0.1)",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <MaterialCommunityIcons name="bell-ring" size={22} color="#81B29A" />
                    </View>
                    <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 16, color: "#3D405B" }}>
                      Set Reminder for 10 AM
                    </Text>
                  </TouchableOpacity>
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(700).duration(400)}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={{
                      backgroundColor: "#FFF",
                      padding: 16,
                      borderRadius: 16,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 16,
                      shadowColor: "#3D405B",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.04,
                      shadowRadius: 8,
                      elevation: 2,
                    }}
                  >
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: "rgba(93, 115, 126, 0.1)",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <MaterialCommunityIcons name="chat" size={22} color="#5D737E" />
                    </View>
                    <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 16, color: "#3D405B" }}>
                      Draft Birthday Text
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
};
