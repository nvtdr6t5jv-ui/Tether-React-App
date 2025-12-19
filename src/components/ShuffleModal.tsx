import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Dimensions, Image, Modal } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
  runOnJS,
  interpolate,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Friend } from "../context/AppContext";
import { getAvatarColor } from "../constants/mockData";

interface ShuffleModalProps {
  visible: boolean;
  onClose: () => void;
  friends: Friend[];
  onMessage: (friend: Friend) => void;
}

const { width, height: SCREEN_HEIGHT } = Dimensions.get("window");

export const ShuffleModal: React.FC<ShuffleModalProps> = ({
  visible,
  onClose,
  friends,
  onMessage,
}) => {
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 300 });
      backdropOpacity.value = withTiming(1, { duration: 300 });
      if (friends.length > 0) {
        spinAndSelect();
      }
    } else {
      translateY.value = SCREEN_HEIGHT;
      backdropOpacity.value = 0;
    }
  }, [visible]);

  const closeDrawer = () => {
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
    backdropOpacity.value = withTiming(0, { duration: 250 }, () => {
      runOnJS(onClose)();
    });
  };

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
        backdropOpacity.value = withTiming(0, { duration: 250 }, () => {
          runOnJS(onClose)();
        });
      } else {
        translateY.value = withTiming(0, { duration: 200 });
        backdropOpacity.value = withTiming(1, { duration: 200 });
      }
    });

  const spinAndSelect = () => {
    if (friends.length === 0) return;
    
    setIsSpinning(true);
    scale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withSpring(1, { damping: 10 })
    );
    
    rotation.value = withSequence(
      withTiming(360, { duration: 600, easing: Easing.out(Easing.cubic) }),
      withTiming(0, { duration: 0 })
    );

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * friends.length);
      setSelectedFriend(friends[randomIndex]);
      setIsSpinning(false);
    }, 600);
  };

  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
  }));

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!visible || (!selectedFriend && friends.length === 0)) {
    return null;
  }

  const getTimeSince = (friend: Friend) => {
    if (!friend.lastContact) return "You haven't connected yet.";
    const diff = Date.now() - friend.lastContact.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days < 7) return `You spoke ${days} days ago.`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `You haven't spoken in ${weeks} week${weeks > 1 ? "s" : ""}.`;
    const months = Math.floor(days / 30);
    return `You haven't spoken in ${months} month${months > 1 ? "s" : ""}.`;
  };

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
              backgroundColor: "rgba(61, 64, 91, 0.6)",
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
                padding: 24,
                paddingBottom: 40,
              },
              animatedSheetStyle,
            ]}
          >
            <View style={{ width: 48, height: 6, backgroundColor: "rgba(61, 64, 91, 0.2)", borderRadius: 3, alignSelf: "center", marginBottom: 24 }} />

            <View style={{ alignItems: "center", paddingTop: 8 }}>
              <View style={{ position: "absolute", top: 0, right: "20%", width: 24, height: 24 }}>
                <MaterialCommunityIcons name="star-four-points" size={24} color="#E07A5F" />
              </View>
              <View style={{ position: "absolute", top: "20%", left: "15%" }}>
                <MaterialCommunityIcons name="shimmer" size={20} color="#81B29A" />
              </View>

              <Animated.View style={[avatarStyle, { marginBottom: 24 }]}>
                <View
                  style={{
                    width: 128,
                    height: 128,
                    borderRadius: 64,
                    borderWidth: 6,
                    borderColor: "#FFF",
                    overflow: "hidden",
                    shadowColor: "#E07A5F",
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 16,
                    elevation: 8,
                  }}
                >
                  {selectedFriend?.photo ? (
                    <Image source={{ uri: selectedFriend.photo }} style={{ width: "100%", height: "100%" }} />
                  ) : (
                    <View
                      style={{
                        width: "100%",
                        height: "100%",
                        backgroundColor: getAvatarColor(0),
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ fontFamily: "Fraunces_600SemiBold", fontSize: 48, color: "#FFF" }}>
                        {selectedFriend?.initials || "?"}
                      </Text>
                    </View>
                  )}
                </View>
              </Animated.View>

              <Text
                style={{
                  fontFamily: "Fraunces_600SemiBold",
                  fontSize: 28,
                  color: "#3D405B",
                  textAlign: "center",
                  lineHeight: 34,
                  marginBottom: 8,
                }}
              >
                Why not say hi{"\n"}to {selectedFriend?.name.split(" ")[0] || "someone"}?
              </Text>
              <Text
                style={{
                  fontFamily: "PlusJakartaSans_500Medium",
                  fontSize: 14,
                  color: "rgba(61, 64, 91, 0.6)",
                  textAlign: "center",
                }}
              >
                {selectedFriend ? getTimeSince(selectedFriend) : ""}
              </Text>
            </View>

            <View style={{ gap: 12, marginTop: 32 }}>
              <TouchableOpacity
                onPress={() => selectedFriend && onMessage(selectedFriend)}
                activeOpacity={0.9}
                style={{
                  height: 64,
                  backgroundColor: "#E07A5F",
                  borderRadius: 20,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  shadowColor: "#E07A5F",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                  elevation: 6,
                }}
              >
                <MaterialCommunityIcons name="chat" size={24} color="#FFF" />
                <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 18, color: "#FFF" }}>
                  Message {selectedFriend?.name.split(" ")[0] || "Friend"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={spinAndSelect}
                disabled={isSpinning}
                activeOpacity={0.9}
                style={{
                  height: 64,
                  backgroundColor: "transparent",
                  borderRadius: 20,
                  borderWidth: 2,
                  borderColor: "#81B29A",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  opacity: isSpinning ? 0.6 : 1,
                }}
              >
                <MaterialCommunityIcons name="refresh" size={24} color="#81B29A" />
                <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 18, color: "#81B29A" }}>
                  Spin Again
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
};
