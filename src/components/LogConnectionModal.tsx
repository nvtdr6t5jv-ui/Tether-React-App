import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Keyboard,
  Image,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  runOnJS,
  interpolate,
  Easing,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Friend } from "../context/AppContext";
import { getAvatarColor } from "../constants/mockData";
import { LinearGradient } from "expo-linear-gradient";

interface LogConnectionModalProps {
  visible: boolean;
  onClose: () => void;
  friends: Friend[];
  onLogConnection: (friendId: string, type: string, note: string, date?: Date) => void;
  preselectedFriendId?: string;
}

const connectionTypes = [
  { id: "call", label: "Call", icon: "phone" as const, filledIcon: "phone" as const },
  { id: "text", label: "Text", icon: "chat-outline" as const, filledIcon: "chat" as const },
  { id: "meetup", label: "Met Up", icon: "account-group-outline" as const, filledIcon: "account-group" as const },
];

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const getRecentDays = () => {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    days.push(date);
  }
  return days;
};

const formatDateLabel = (date: Date) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  }
};

export const LogConnectionModal: React.FC<LogConnectionModalProps> = ({
  visible,
  onClose,
  friends,
  onLogConnection,
  preselectedFriendId,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [selectedType, setSelectedType] = useState("call");
  const [note, setNote] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  const recentDays = getRecentDays();

  const resetForm = useCallback(() => {
    setSearchQuery("");
    setSelectedFriend(null);
    setSelectedType("call");
    setNote("");
    setSelectedDate(new Date());
    setShowDropdown(false);
    setShowDatePicker(false);
    setIsSubmitting(false);
  }, []);

  useEffect(() => {
    if (visible) {
      setIsClosing(false);
      translateY.value = withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) });
      backdropOpacity.value = withTiming(1, { duration: 300 });
      if (preselectedFriendId) {
        const friend = friends.find((f) => f.id === preselectedFriendId);
        if (friend) {
          setSelectedFriend(friend);
          setSearchQuery("");
        }
      }
    } else {
      translateY.value = SCREEN_HEIGHT;
      backdropOpacity.value = 0;
      resetForm();
    }
  }, [visible, preselectedFriendId, friends, resetForm]);

  const handleCloseComplete = useCallback(() => {
    setIsClosing(false);
    onClose();
  }, [onClose]);

  const closeDrawer = useCallback(() => {
    if (isClosing) return;
    Keyboard.dismiss();
    setIsClosing(true);
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 280, easing: Easing.in(Easing.cubic) });
    backdropOpacity.value = withTiming(0, { duration: 250 }, (finished) => {
      if (finished) {
        runOnJS(handleCloseComplete)();
      }
    });
  }, [isClosing, handleCloseComplete]);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
        backdropOpacity.value = interpolate(event.translationY, [0, 300], [1, 0]);
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
        translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
        backdropOpacity.value = withTiming(1, { duration: 200 });
      }
    });

  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDone = async () => {
    if (selectedFriend && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await onLogConnection(selectedFriend.id, selectedType, note, selectedDate);
        closeDrawer();
      } catch (error) {
        setIsSubmitting(false);
      }
    }
  };

  const handleSelectFriend = (friend: Friend) => {
    setSelectedFriend(friend);
    setSearchQuery("");
    setShowDropdown(false);
    Keyboard.dismiss();
  };

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const dateString = formatDateLabel(selectedDate) + 
    (selectedDate.toDateString() === new Date().toDateString() ? "" : 
      `, ${selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`);

  if (!visible) return null;

  return (
    <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, elevation: 9999 }}>
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
              height: "92%",
              backgroundColor: "#F4F1DE",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -10 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
              elevation: 20,
            },
            animatedSheetStyle,
          ]}
        >
          <View
            style={{
              width: 48,
              height: 5,
              backgroundColor: "rgba(61, 64, 91, 0.15)",
              borderRadius: 3,
              alignSelf: "center",
              marginTop: 12,
            }}
          />

          <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 20,
                paddingTop: 16,
                paddingBottom: 12,
              }}
            >
              <TouchableOpacity onPress={closeDrawer} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold", fontSize: 16, color: "#81B29A" }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <Text style={{ fontFamily: "Fraunces_700Bold", fontSize: 20, color: "#3D405B", letterSpacing: -0.3 }}>
                Log Connection
              </Text>
              <TouchableOpacity
                onPress={handleDone}
                disabled={!selectedFriend || isSubmitting}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={selectedFriend && !isSubmitting ? ["#E07A5F", "#D66A4F"] : ["rgba(224,122,95,0.4)", "rgba(214,106,79,0.4)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: 9999,
                    shadowColor: selectedFriend && !isSubmitting ? "#E07A5F" : "transparent",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: selectedFriend && !isSubmitting ? 0.3 : 0,
                    shadowRadius: 8,
                    elevation: selectedFriend && !isSubmitting ? 4 : 0,
                  }}
                >
                  <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 14, color: "#FFF" }}>
                    {isSubmitting ? "Saving..." : "Done"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 28 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <Animated.View entering={FadeInDown.delay(50).duration(350)} style={{ gap: 12 }}>
                  <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 15, color: "#3D405B", letterSpacing: -0.2 }}>
                    Who did you connect with?
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#FFF",
                      borderRadius: 16,
                      paddingHorizontal: 14,
                      shadowColor: "#3D405B",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.06,
                      shadowRadius: 12,
                      elevation: 3,
                    }}
                  >
                    <MaterialCommunityIcons name="magnify" size={22} color="rgba(61, 64, 91, 0.35)" />
                    <TextInput
                      value={selectedFriend ? "" : searchQuery}
                      onChangeText={(text) => {
                        setSearchQuery(text);
                        setShowDropdown(text.length > 0);
                      }}
                      onFocus={() => {
                        if (searchQuery.length > 0) setShowDropdown(true);
                      }}
                      placeholder={selectedFriend ? "" : "Search friend..."}
                      placeholderTextColor="rgba(61, 64, 91, 0.35)"
                      editable={!selectedFriend}
                      style={{
                        flex: 1,
                        fontFamily: "PlusJakartaSans_500Medium",
                        fontSize: 15,
                        color: "#3D405B",
                        paddingVertical: 14,
                        paddingHorizontal: 10,
                        opacity: selectedFriend ? 0 : 1,
                      }}
                    />
                  </View>

                  {selectedFriend && (
                    <Animated.View entering={FadeIn.duration(200)} style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor: "#FFF",
                          borderRadius: 9999,
                          paddingLeft: 6,
                          paddingRight: 12,
                          paddingVertical: 6,
                          gap: 10,
                          shadowColor: "#3D405B",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.06,
                          shadowRadius: 8,
                          elevation: 2,
                          borderWidth: 1,
                          borderColor: "rgba(61, 64, 91, 0.06)",
                        }}
                      >
                        {selectedFriend.avatarUri ? (
                          <Image
                            source={{ uri: selectedFriend.avatarUri }}
                            style={{ width: 32, height: 32, borderRadius: 16 }}
                          />
                        ) : (
                          <View
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 16,
                              backgroundColor: getAvatarColor(friends.indexOf(selectedFriend)),
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Text style={{ fontFamily: "Fraunces_600SemiBold", fontSize: 12, color: "#FFF" }}>
                              {selectedFriend.initials}
                            </Text>
                          </View>
                        )}
                        <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 14, color: "#3D405B" }}>
                          {selectedFriend.name}
                        </Text>
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedFriend(null);
                            setSearchQuery("");
                          }}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          style={{
                            marginLeft: 2,
                            width: 22,
                            height: 22,
                            borderRadius: 11,
                            backgroundColor: "rgba(61, 64, 91, 0.08)",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <MaterialCommunityIcons name="close" size={14} color="rgba(61, 64, 91, 0.5)" />
                        </TouchableOpacity>
                      </View>
                    </Animated.View>
                  )}

                  {showDropdown && !selectedFriend && filteredFriends.length > 0 && (
                    <Animated.View
                      entering={FadeInDown.duration(200)}
                      style={{
                        backgroundColor: "#FFF",
                        borderRadius: 16,
                        overflow: "hidden",
                        shadowColor: "#3D405B",
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.08,
                        shadowRadius: 16,
                        elevation: 4,
                        marginTop: -4,
                      }}
                    >
                      {filteredFriends.slice(0, 5).map((friend, index) => (
                        <TouchableOpacity
                          key={friend.id}
                          onPress={() => handleSelectFriend(friend)}
                          activeOpacity={0.7}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 12,
                            paddingHorizontal: 14,
                            paddingVertical: 12,
                            borderBottomWidth: index < Math.min(filteredFriends.length, 5) - 1 ? 1 : 0,
                            borderBottomColor: "rgba(61, 64, 91, 0.06)",
                          }}
                        >
                          {friend.avatarUri ? (
                            <Image
                              source={{ uri: friend.avatarUri }}
                              style={{ width: 40, height: 40, borderRadius: 20 }}
                            />
                          ) : (
                            <View
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                backgroundColor: getAvatarColor(index),
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Text style={{ fontFamily: "Fraunces_600SemiBold", fontSize: 15, color: "#FFF" }}>
                                {friend.initials}
                              </Text>
                            </View>
                          )}
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold", fontSize: 15, color: "#3D405B" }}>
                              {friend.name}
                            </Text>
                            {friend.tier && (
                              <Text style={{ fontFamily: "PlusJakartaSans_500Medium", fontSize: 12, color: "rgba(61, 64, 91, 0.5)", marginTop: 1 }}>
                                {friend.tier}
                              </Text>
                            )}
                          </View>
                          <MaterialCommunityIcons name="chevron-right" size={20} color="rgba(61, 64, 91, 0.25)" />
                        </TouchableOpacity>
                      ))}
                    </Animated.View>
                  )}
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(100).duration(350)} style={{ gap: 12 }}>
                  <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 15, color: "#3D405B", letterSpacing: -0.2 }}>
                    How did you connect?
                  </Text>
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    {connectionTypes.map((type) => {
                      const isSelected = selectedType === type.id;
                      return (
                        <TouchableOpacity
                          key={type.id}
                          onPress={() => setSelectedType(type.id)}
                          activeOpacity={0.85}
                          style={{ flex: 1 }}
                        >
                          <Animated.View
                            style={{
                              aspectRatio: 1,
                              backgroundColor: isSelected ? "#E07A5F" : "#F4F1DE",
                              borderRadius: 20,
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 8,
                              borderWidth: isSelected ? 0 : 2,
                              borderColor: "rgba(224, 122, 95, 0.15)",
                              shadowColor: isSelected ? "#E07A5F" : "transparent",
                              shadowOffset: { width: 0, height: isSelected ? 8 : 0 },
                              shadowOpacity: isSelected ? 0.35 : 0,
                              shadowRadius: isSelected ? 16 : 0,
                              elevation: isSelected ? 8 : 0,
                              transform: [{ scale: isSelected ? 1.02 : 1 }],
                            }}
                          >
                            {isSelected && (
                              <View
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  borderRadius: 20,
                                  borderWidth: 3,
                                  borderColor: "#E07A5F",
                                  shadowColor: "#E07A5F",
                                  shadowOffset: { width: 0, height: 0 },
                                  shadowOpacity: 0.5,
                                  shadowRadius: 0,
                                }}
                              />
                            )}
                            <MaterialCommunityIcons
                              name={isSelected ? type.filledIcon : type.icon}
                              size={34}
                              color={isSelected ? "#FFF" : "#E07A5F"}
                            />
                            <Text
                              style={{
                                fontFamily: "PlusJakartaSans_700Bold",
                                fontSize: 13,
                                color: isSelected ? "#FFF" : "#3D405B",
                              }}
                            >
                              {type.label}
                            </Text>
                          </Animated.View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(150).duration(350)} style={{ gap: 12 }}>
                  <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 15, color: "#3D405B", letterSpacing: -0.2 }}>
                    Details
                  </Text>
                  <View
                    style={{
                      backgroundColor: "#FFF",
                      borderRadius: 20,
                      overflow: "hidden",
                      shadowColor: "#3D405B",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.05,
                      shadowRadius: 12,
                      elevation: 3,
                    }}
                  >
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setShowDatePicker(true)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingHorizontal: 18,
                        paddingVertical: 16,
                        borderBottomWidth: 1,
                        borderBottomColor: "rgba(61, 64, 91, 0.06)",
                      }}
                    >
                      <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 15, color: "#3D405B" }}>
                        Date
                      </Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold", fontSize: 14, color: "#E07A5F" }}>
                          {dateString}
                        </Text>
                        <MaterialCommunityIcons name="chevron-down" size={20} color="#E07A5F" />
                      </View>
                    </TouchableOpacity>

                    <View
                      style={{
                        paddingHorizontal: 18,
                        paddingTop: 14,
                        paddingBottom: 16,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "PlusJakartaSans_700Bold",
                          fontSize: 11,
                          color: "rgba(61, 64, 91, 0.45)",
                          letterSpacing: 0.8,
                          textTransform: "uppercase",
                          marginBottom: 10,
                        }}
                      >
                        Quick Note (Optional)
                      </Text>
                      <TextInput
                        value={note}
                        onChangeText={setNote}
                        placeholder="What did you talk about?"
                        placeholderTextColor="rgba(61, 64, 91, 0.3)"
                        multiline
                        numberOfLines={3}
                        style={{
                          fontFamily: "PlusJakartaSans_400Regular",
                          fontSize: 15,
                          color: "#3D405B",
                          lineHeight: 22,
                          minHeight: 70,
                          textAlignVertical: "top",
                        }}
                      />
                    </View>
                  </View>
                </Animated.View>

                {selectedFriend && (
                  <Animated.View entering={FadeInDown.delay(200).duration(350)}>
                    <View
                      style={{
                        backgroundColor: "rgba(129, 178, 154, 0.1)",
                        borderRadius: 16,
                        padding: 16,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: "rgba(129, 178, 154, 0.2)",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <MaterialCommunityIcons name="lightbulb-outline" size={22} color="#81B29A" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: "PlusJakartaSans_500Medium", fontSize: 13, color: "#3D405B", lineHeight: 18 }}>
                          Logging connections helps you remember when you last talked and strengthens your relationships.
                        </Text>
                      </View>
                    </View>
                  </Animated.View>
                )}
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </Animated.View>
      </GestureDetector>

      <Modal
        visible={showDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowDatePicker(false)}
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}
        >
          <View style={{ backgroundColor: "#FFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40 }}>
            <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: "rgba(61, 64, 91, 0.1)" }}>
              <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 18, color: "#3D405B", textAlign: "center" }}>
                Select Date
              </Text>
            </View>
            <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
              {recentDays.map((date, index) => {
                const isSelected = date.toDateString() === selectedDate.toDateString();
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setSelectedDate(date);
                      setShowDatePicker(false);
                    }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingHorizontal: 20,
                      paddingVertical: 16,
                      backgroundColor: isSelected ? "rgba(224, 122, 95, 0.1)" : "transparent",
                    }}
                  >
                    <View>
                      <Text style={{ 
                        fontFamily: isSelected ? "PlusJakartaSans_700Bold" : "PlusJakartaSans_600SemiBold", 
                        fontSize: 16, 
                        color: isSelected ? "#E07A5F" : "#3D405B" 
                      }}>
                        {formatDateLabel(date)}
                      </Text>
                      {date.toDateString() !== new Date().toDateString() && (
                        <Text style={{ 
                          fontFamily: "PlusJakartaSans_400Regular", 
                          fontSize: 13, 
                          color: "rgba(61, 64, 91, 0.5)",
                          marginTop: 2,
                        }}>
                          {date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </Text>
                      )}
                    </View>
                    {isSelected && (
                      <MaterialCommunityIcons name="check-circle" size={24} color="#E07A5F" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};
