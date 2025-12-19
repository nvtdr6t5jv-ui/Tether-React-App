import React from "react";
import { View, Text, TouchableOpacity, Modal, Dimensions } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  FadeInUp,
} from "react-native-reanimated";
import { Friend } from "../context/AppContext";
import Svg, { Circle } from "react-native-svg";

interface HealthStatusModalProps {
  visible: boolean;
  onClose: () => void;
  friends: Friend[];
  onViewAnalytics: () => void;
}

const { width } = Dimensions.get("window");

const CircularProgress: React.FC<{ percentage: number; size: number }> = ({ percentage, size }) => {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(61, 64, 91, 0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#81B29A"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={{ position: "absolute", alignItems: "center" }}>
        <Text style={{ fontFamily: "PlusJakartaSans_800ExtraBold", fontSize: 40, color: "#3D405B" }}>
          {percentage}%
        </Text>
        <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 14, color: "#81B29A", textTransform: "uppercase", letterSpacing: 1 }}>
          Healthy
        </Text>
      </View>
    </View>
  );
};

interface StatCardProps {
  label: string;
  value: string | number;
  subtext: string;
  color: string;
  index: number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, subtext, color, index }) => (
  <Animated.View
    entering={FadeInUp.delay(200 + index * 100).duration(400)}
    style={{
      flex: 1,
      backgroundColor: "#FFF",
      padding: 16,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 112,
      borderWidth: 1,
      borderColor: "rgba(61, 64, 91, 0.05)",
      shadowColor: "#3D405B",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    }}
  >
    <Text
      style={{
        fontFamily: "PlusJakartaSans_700Bold",
        fontSize: 10,
        color: "rgba(61, 64, 91, 0.4)",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 4,
      }}
    >
      {label}
    </Text>
    <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 24, color, lineHeight: 28 }}>
      {value}
    </Text>
    <Text style={{ fontFamily: "PlusJakartaSans_500Medium", fontSize: 14, color, opacity: 0.8 }}>
      {subtext}
    </Text>
  </Animated.View>
);

export const HealthStatusModal: React.FC<HealthStatusModalProps> = ({
  visible,
  onClose,
  friends,
  onViewAnalytics,
}) => {
  const innerCircleFriends = friends.filter(f => f.orbitId === "inner");
  const closeFriends = friends.filter(f => f.orbitId === "close");
  
  const overdueFriends = friends.filter(f => {
    if (!f.nextNudge) return true;
    return new Date() > f.nextNudge;
  });

  const healthPercentage = friends.length > 0
    ? Math.round(((friends.length - overdueFriends.length) / friends.length) * 100)
    : 100;

  const innerCircleActive = innerCircleFriends.length > 0
    ? Math.round(((innerCircleFriends.length - innerCircleFriends.filter(f => !f.nextNudge || new Date() > f.nextNudge).length) / innerCircleFriends.length) * 100)
    : 100;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
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
            backgroundColor: "rgba(61, 64, 91, 0.4)",
          }}
        >
          <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
        </Animated.View>

        <Animated.View
          entering={SlideInDown.duration(500).springify()}
          exiting={SlideOutDown.duration(300)}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "#F4F1DE",
            borderTopLeftRadius: 40,
            borderTopRightRadius: 40,
            padding: 24,
            paddingBottom: 40,
          }}
        >
          <View style={{ width: 48, height: 6, backgroundColor: "rgba(61, 64, 91, 0.2)", borderRadius: 3, alignSelf: "center", marginBottom: 24 }} />

          <Animated.View entering={FadeIn.delay(100).duration(500)} style={{ alignItems: "center", marginBottom: 32 }}>
            <CircularProgress percentage={healthPercentage} size={176} />
            
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 16 }}>
              <MaterialCommunityIcons name="trending-up" size={18} color="#81B29A" />
              <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 12, color: "#81B29A", textTransform: "uppercase", letterSpacing: 0.5 }}>
                +5% from last week
              </Text>
            </View>
          </Animated.View>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
            <View style={{ flexDirection: "row", gap: 16, width: "100%" }}>
              <StatCard
                label="Inner Circle"
                value={`${innerCircleActive}%`}
                subtext="Active"
                color="#81B29A"
                index={0}
              />
              <StatCard
                label="Close Friends"
                value={overdueFriends.filter(f => f.orbitId === "close").length}
                subtext="Overdue"
                color="#E07A5F"
                index={1}
              />
            </View>
            <View style={{ flexDirection: "row", gap: 16, width: "100%" }}>
              <StatCard
                label="New Memories"
                value={4}
                subtext="logged"
                color="#81B29A"
                index={2}
              />
              <StatCard
                label="Streak"
                value={3}
                subtext="Weeks"
                color="#81B29A"
                index={3}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={onViewAnalytics}
            style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 8 }}
          >
            <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 14, color: "#81B29A" }}>
              View Full Analytics
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#81B29A" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};
