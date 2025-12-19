import React from "react";
import { View, Text } from "react-native";
import Animated, { FadeIn, SlideInRight } from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export const NudgeCard = () => {
  return (
    <Animated.View
      entering={FadeIn.delay(200).duration(600)}
      style={{ width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}
    >
      <View style={{ position: "absolute", top: 16, left: 16, right: 16, bottom: 16, backgroundColor: "rgba(255,255,255,0.4)", borderRadius: 40, transform: [{ rotate: "-3deg" }] }} />

      <View style={{
        width: 220,
        height: 340,
        backgroundColor: "#FDFCF8",
        borderRadius: 40,
        borderWidth: 6,
        borderColor: "#FFF",
        shadowColor: "#3D405B",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 40,
        elevation: 5,
        overflow: "hidden",
      }}>
        <View style={{ width: "100%", height: 24, flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, alignItems: "center", marginTop: 8, opacity: 0.3 }}>
          <View style={{ width: 32, height: 4, backgroundColor: "#3D405B", borderRadius: 2 }} />
          <View style={{ flexDirection: "row", gap: 4 }}>
            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: "#3D405B" }} />
            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: "#3D405B" }} />
          </View>
        </View>

        <View style={{ flex: 1, alignItems: "center", paddingTop: 32, paddingHorizontal: 12 }}>
          <View style={{ position: "absolute", top: 80, right: -20, width: 128, height: 128, backgroundColor: "rgba(129, 178, 154, 0.05)", borderRadius: 64 }} />

          <Animated.View
            entering={SlideInRight.delay(400).duration(500)}
            style={{
              width: "100%",
              backgroundColor: "#FFF",
              borderRadius: 16,
              padding: 16,
              shadowColor: "#3D405B",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.08,
              shadowRadius: 24,
              elevation: 3,
              borderWidth: 1,
              borderColor: "rgba(129, 178, 154, 0.1)",
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View style={{ width: 24, height: 24, borderRadius: 8, backgroundColor: "rgba(224, 122, 95, 0.1)", alignItems: "center", justifyContent: "center" }}>
                  <MaterialCommunityIcons name="infinity" size={12} color="#E07A5F" />
                </View>
                <Text style={{ fontSize: 10, fontFamily: "PlusJakartaSans_700Bold", color: "rgba(61, 64, 91, 0.5)", letterSpacing: 1, textTransform: "uppercase" }}>
                  Tether
                </Text>
              </View>
              <Text style={{ fontSize: 10, color: "rgba(61, 64, 91, 0.4)" }}>2m ago</Text>
            </View>

            <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#E8E1D3", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#FFF" }}>
                <Text style={{ fontFamily: "Fraunces_600SemiBold", color: "#3D405B", fontWeight: "bold" }}>M</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: "Fraunces_600SemiBold", color: "#3D405B", fontSize: 14 }}>
                  Say hi to Mark?
                </Text>
                <Text style={{ fontSize: 10, color: "rgba(61, 64, 91, 0.7)", marginTop: 2 }}>
                  It's been a while since you connected.
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.03)" }}>
              <View style={{ height: 28, paddingHorizontal: 12, backgroundColor: "rgba(129, 178, 154, 0.1)", borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 }}>
                <MaterialCommunityIcons name="hand-wave-outline" size={12} color="#81B29A" />
                <Text style={{ fontSize: 10, fontFamily: "PlusJakartaSans_700Bold", color: "#81B29A" }}>
                  Wave
                </Text>
              </View>
              <View style={{ height: 28, paddingHorizontal: 12, borderWidth: 1, borderColor: "rgba(0,0,0,0.05)", borderRadius: 14, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 10, fontFamily: "PlusJakartaSans_500Medium", color: "rgba(61, 64, 91, 0.6)" }}>
                  Snooze
                </Text>
              </View>
            </View>
          </Animated.View>

          <View style={{ width: "90%", height: 16, backgroundColor: "rgba(255,255,255,0.5)", borderBottomLeftRadius: 12, borderBottomRightRadius: 12, marginTop: -4 }} />
        </View>
      </View>
    </Animated.View>
  );
};
