import React, { useEffect, useCallback, useState } from "react";
import { View, Text, TouchableOpacity, Modal, Dimensions, ScrollView, Linking, Platform } from "react-native";
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
import { MESSAGE_TEMPLATES } from "../types";
import { useApp } from "../context/AppContext";

interface MessageTemplatesModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectTemplate: (text: string) => void;
  friendName?: string;
  onPremiumRequired: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'catch-up', label: 'Catch Up' },
  { id: 'birthday', label: 'Birthday' },
  { id: 'congrats', label: 'Congrats' },
  { id: 'thinking', label: 'Thinking of You' },
  { id: 'support', label: 'Support' },
];

export const MessageTemplatesModal: React.FC<MessageTemplatesModalProps> = ({
  visible,
  onClose,
  onSelectTemplate,
  friendName,
  onPremiumRequired,
}) => {
  const { premiumStatus } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      if (!premiumStatus.isPremium) {
        onClose();
        onPremiumRequired();
        return;
      }
      translateY.value = withTiming(0, { duration: 300 });
      backdropOpacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = SCREEN_HEIGHT;
      backdropOpacity.value = 0;
    }
  }, [visible, premiumStatus.isPremium]);

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

  const filteredTemplates = selectedCategory === 'all' 
    ? MESSAGE_TEMPLATES 
    : MESSAGE_TEMPLATES.filter(t => t.category === selectedCategory);

  const handleSelect = (text: string) => {
    const personalizedText = friendName ? text.replace(/\{name\}/g, friendName) : text;
    onSelectTemplate(personalizedText);
    closeDrawer();
  };

  if (!visible || !premiumStatus.isPremium) return null;

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
                height: "70%",
                backgroundColor: "#F4F1DE",
                borderTopLeftRadius: 40,
                borderTopRightRadius: 40,
              },
              animatedSheetStyle,
            ]}
          >
            <View style={{ width: 40, height: 4, backgroundColor: "rgba(61, 64, 91, 0.2)", borderRadius: 2, alignSelf: "center", marginTop: 12, marginBottom: 20 }} />

            <View style={{ paddingHorizontal: 24 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <TouchableOpacity onPress={closeDrawer}>
                  <MaterialCommunityIcons name="close" size={24} color="rgba(61, 64, 91, 0.4)" />
                </TouchableOpacity>
                <Text style={{ fontFamily: "Fraunces_600SemiBold", fontSize: 20, color: "#3D405B" }}>
                  Message Templates
                </Text>
                <View style={{ width: 24 }} />
              </View>

              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 20 }}
                contentContainerStyle={{ gap: 8 }}
              >
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setSelectedCategory(cat.id)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 9999,
                      backgroundColor: selectedCategory === cat.id ? "#81B29A" : "#FFF",
                    }}
                  >
                    <Text style={{ 
                      fontFamily: "PlusJakartaSans_600SemiBold", 
                      fontSize: 14, 
                      color: selectedCategory === cat.id ? "#FFF" : "#3D405B" 
                    }}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <ScrollView 
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, gap: 12 }}
              showsVerticalScrollIndicator={false}
            >
              {filteredTemplates.map((template, index) => (
                <Animated.View key={template.id} entering={FadeInUp.delay(index * 50).duration(300)}>
                  <TouchableOpacity
                    onPress={() => handleSelect(template.text)}
                    style={{
                      backgroundColor: "#FFF",
                      padding: 16,
                      borderRadius: 16,
                      shadowColor: "#3D405B",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.04,
                      shadowRadius: 8,
                      elevation: 2,
                    }}
                  >
                    <Text style={{ fontFamily: "PlusJakartaSans_500Medium", fontSize: 15, color: "#3D405B", lineHeight: 22 }}>
                      {template.text}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
                      <View style={{ 
                        paddingHorizontal: 10, 
                        paddingVertical: 4, 
                        backgroundColor: "rgba(129, 178, 154, 0.1)", 
                        borderRadius: 9999 
                      }}>
                        <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold", fontSize: 11, color: "#81B29A", textTransform: "capitalize" }}>
                          {template.category.replace('-', ' ')}
                        </Text>
                      </View>
                      <MaterialCommunityIcons name="chevron-right" size={20} color="rgba(61, 64, 91, 0.3)" />
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </ScrollView>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
};
