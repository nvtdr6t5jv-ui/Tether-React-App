import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  FadeInDown,
} from "react-native-reanimated";
import { TetheredFriend } from "../context/AppContext";
import { getAvatarColor } from "../constants/mockData";

interface LogConnectionModalProps {
  visible: boolean;
  onClose: () => void;
  friends: TetheredFriend[];
  onLogConnection: (friendId: string, type: string, note: string) => void;
}

const connectionTypes = [
  { id: "call", label: "Call", icon: "phone" as const },
  { id: "text", label: "Text", icon: "chat" as const },
  { id: "meetup", label: "Met Up", icon: "account-group" as const },
];

export const LogConnectionModal: React.FC<LogConnectionModalProps> = ({
  visible,
  onClose,
  friends,
  onLogConnection,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFriend, setSelectedFriend] = useState<TetheredFriend | null>(null);
  const [selectedType, setSelectedType] = useState("call");
  const [note, setNote] = useState("");
  const [followUp, setFollowUp] = useState(false);

  const filteredFriends = friends.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDone = () => {
    if (selectedFriend) {
      onLogConnection(selectedFriend.id, selectedType, note);
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setSearchQuery("");
    setSelectedFriend(null);
    setSelectedType("call");
    setNote("");
    setFollowUp(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const today = new Date();
  const dateString = `Today, ${today.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <View style={{ flex: 1 }}>
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.2)",
          }}
        />

        <Animated.View
          entering={SlideInDown.duration(400)}
          exiting={SlideOutDown.duration(300)}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "92%",
            backgroundColor: "#F4F1DE",
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
          }}
        >
          <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 }}>
              <TouchableOpacity onPress={handleClose}>
                <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold", fontSize: 16, color: "#81B29A" }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <Text style={{ fontFamily: "Fraunces_600SemiBold", fontSize: 22, color: "#3D405B" }}>
                Log Connection
              </Text>
              <TouchableOpacity onPress={handleDone} disabled={!selectedFriend}>
                <View
                  style={{
                    backgroundColor: selectedFriend ? "#E07A5F" : "rgba(224, 122, 95, 0.4)",
                    paddingHorizontal: 20,
                    paddingVertical: 8,
                    borderRadius: 9999,
                  }}
                >
                  <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 14, color: "#FFF" }}>
                    Done
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={{ flex: 1 }}
            >
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32, gap: 32 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <Animated.View entering={FadeInDown.delay(100).duration(400)} style={{ gap: 12 }}>
                  <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 18, color: "#3D405B" }}>
                    Who did you connect with?
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#FFF",
                      borderRadius: 9999,
                      paddingHorizontal: 16,
                      shadowColor: "#3D405B",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 8,
                      elevation: 2,
                    }}
                  >
                    <MaterialCommunityIcons name="magnify" size={24} color="rgba(61, 64, 91, 0.4)" />
                    <TextInput
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      placeholder="Search friend..."
                      placeholderTextColor="rgba(61, 64, 91, 0.4)"
                      style={{
                        flex: 1,
                        fontFamily: "PlusJakartaSans_500Medium",
                        fontSize: 16,
                        color: "#3D405B",
                        paddingVertical: 14,
                        paddingHorizontal: 12,
                      }}
                    />
                  </View>

                  {searchQuery.length > 0 && filteredFriends.length > 0 && !selectedFriend && (
                    <View style={{ backgroundColor: "#FFF", borderRadius: 16, overflow: "hidden" }}>
                      {filteredFriends.slice(0, 4).map((friend, index) => (
                        <TouchableOpacity
                          key={friend.id}
                          onPress={() => {
                            setSelectedFriend(friend);
                            setSearchQuery(friend.name);
                          }}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 12,
                            padding: 12,
                            borderBottomWidth: index < filteredFriends.length - 1 ? 1 : 0,
                            borderBottomColor: "rgba(61, 64, 91, 0.1)",
                          }}
                        >
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
                            <Text style={{ fontFamily: "Fraunces_600SemiBold", fontSize: 16, color: "#FFF" }}>
                              {friend.initials}
                            </Text>
                          </View>
                          <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold", fontSize: 16, color: "#3D405B" }}>
                            {friend.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(200).duration(400)} style={{ gap: 12 }}>
                  <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 18, color: "#3D405B" }}>
                    How did you connect?
                  </Text>
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    {connectionTypes.map((type) => {
                      const isSelected = selectedType === type.id;
                      return (
                        <TouchableOpacity
                          key={type.id}
                          onPress={() => setSelectedType(type.id)}
                          activeOpacity={0.8}
                          style={{
                            flex: 1,
                            aspectRatio: 1,
                            backgroundColor: isSelected ? "#E07A5F" : "#F4F1DE",
                            borderRadius: 20,
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            borderWidth: isSelected ? 0 : 2,
                            borderColor: "rgba(224, 122, 95, 0.2)",
                            shadowColor: isSelected ? "#E07A5F" : "transparent",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: isSelected ? 0.3 : 0,
                            shadowRadius: 8,
                            elevation: isSelected ? 4 : 0,
                          }}
                        >
                          <MaterialCommunityIcons
                            name={type.icon}
                            size={32}
                            color={isSelected ? "#FFF" : "#E07A5F"}
                          />
                          <Text
                            style={{
                              fontFamily: "PlusJakartaSans_700Bold",
                              fontSize: 14,
                              color: isSelected ? "#FFF" : "#3D405B",
                            }}
                          >
                            {type.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(300).duration(400)}>
                  <View
                    style={{
                      backgroundColor: "#FFF",
                      borderRadius: 20,
                      overflow: "hidden",
                      shadowColor: "#3D405B",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 8,
                      elevation: 2,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingHorizontal: 20,
                        paddingVertical: 16,
                        borderBottomWidth: 1,
                        borderBottomColor: "rgba(61, 64, 91, 0.1)",
                      }}
                    >
                      <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 16, color: "#3D405B" }}>
                        Date
                      </Text>
                      <Text style={{ fontFamily: "PlusJakartaSans_500Medium", fontSize: 14, color: "#81B29A" }}>
                        {dateString}
                      </Text>
                    </View>

                    <View
                      style={{
                        paddingHorizontal: 20,
                        paddingVertical: 16,
                        borderBottomWidth: 1,
                        borderBottomColor: "rgba(61, 64, 91, 0.1)",
                      }}
                    >
                      <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 16, color: "#3D405B", marginBottom: 8 }}>
                        Quick Note
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
                          fontSize: 14,
                          color: "#3D405B",
                          lineHeight: 22,
                          minHeight: 80,
                          textAlignVertical: "top",
                        }}
                      />
                    </View>

                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingHorizontal: 20,
                        paddingVertical: 16,
                      }}
                    >
                      <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 16, color: "#3D405B" }}>
                        Set specific follow-up?
                      </Text>
                      <TouchableOpacity
                        onPress={() => setFollowUp(!followUp)}
                        style={{
                          width: 48,
                          height: 28,
                          backgroundColor: followUp ? "#81B29A" : "rgba(61, 64, 91, 0.2)",
                          borderRadius: 14,
                          padding: 2,
                        }}
                      >
                        <View
                          style={{
                            width: 24,
                            height: 24,
                            backgroundColor: "#FFF",
                            borderRadius: 12,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.2,
                            shadowRadius: 2,
                            elevation: 2,
                            transform: [{ translateX: followUp ? 20 : 0 }],
                          }}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Animated.View>
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
};
