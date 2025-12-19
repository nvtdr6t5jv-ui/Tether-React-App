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
      <View style={{ position: "absolute", top: 16, left: 16, right: 16, bottom: 16, backgroundColor: "rgba(255,255,255,0.4)", borderRadius: 32, transform: [{ rotate: "-3deg" }] }} />

      <View style={{
        width: 176,
        height: 272,
        backgroundColor: "#FDFCF8",
        borderRadius: 32,
        borderWidth: 5,
        borderColor: "#FFF",
        shadowColor: "#3D405B",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 32,
        elevation: 5,
        overflow: "hidden",
      }}>
        <View style={{ width: "100%", height: 20, flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 12, alignItems: "center", marginTop: 6, opacity: 0.3 }}>
          <View style={{ width: 26, height: 3, backgroundColor: "#3D405B", borderRadius: 2 }} />
          <View style={{ flexDirection: "row", gap: 3 }}>
            <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: "#3D405B" }} />
            <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: "#3D405B" }} />
          </View>
        </View>

        <View style={{ flex: 1, alignItems: "center", paddingTop: 24, paddingHorizontal: 10 }}>
          <View style={{ position: "absolute", top: 64, right: -16, width: 102, height: 102, backgroundColor: "rgba(129, 178, 154, 0.05)", borderRadius: 51 }} />

          <Animated.View
            entering={SlideInRight.delay(400).duration(500)}
            style={{
              width: "100%",
              backgroundColor: "#FFF",
              borderRadius: 12,
              padding: 12,
              shadowColor: "#3D405B",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.08,
              shadowRadius: 20,
              elevation: 3,
              borderWidth: 1,
              borderColor: "rgba(129, 178, 154, 0.1)",
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <View style={{ width: 20, height: 20, borderRadius: 6, backgroundColor: "rgba(224, 122, 95, 0.1)", alignItems: "center", justifyContent: "center" }}>
                  <MaterialCommunityIcons name="infinity" size={10} color="#E07A5F" />
                </View>
                <Text style={{ fontSize: 8, fontFamily: "PlusJakartaSans_700Bold", color: "rgba(61, 64, 91, 0.5)", letterSpacing: 1, textTransform: "uppercase" }}>
                  Tether
                </Text>
              </View>
              <Text style={{ fontSize: 8, color: "rgba(61, 64, 91, 0.4)" }}>2m ago</Text>
            </View>

            <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: "#E8E1D3", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#FFF" }}>
                <Text style={{ fontFamily: "Fraunces_600SemiBold", color: "#3D405B", fontSize: 12 }}>M</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: "Fraunces_600SemiBold", color: "#3D405B", fontSize: 11 }}>
                  Say hi to Mark?
                </Text>
                <Text style={{ fontSize: 8, color: "rgba(61, 64, 91, 0.7)", marginTop: 1 }}>
                  It's been a while since you connected.
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 6, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.03)" }}>
              <View style={{ height: 22, paddingHorizontal: 10, backgroundColor: "rgba(129, 178, 154, 0.1)", borderRadius: 11, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 3 }}>
                <MaterialCommunityIcons name="hand-wave-outline" size={10} color="#81B29A" />
                <Text style={{ fontSize: 8, fontFamily: "PlusJakartaSans_700Bold", color: "#81B29A" }}>
                  Wave
                </Text>
              </View>
              <View style={{ height: 22, paddingHorizontal: 10, borderWidth: 1, borderColor: "rgba(0,0,0,0.05)", borderRadius: 11, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 8, fontFamily: "PlusJakartaSans_500Medium", color: "rgba(61, 64, 91, 0.6)" }}>
                  Snooze
                </Text>
              </View>
            </View>
          </Animated.View>

          <View style={{ width: "90%", height: 12, backgroundColor: "rgba(255,255,255,0.5)", borderBottomLeftRadius: 10, borderBottomRightRadius: 10, marginTop: -3 }} />
        </View>
      </View>
    </Animated.View>
  );
};
