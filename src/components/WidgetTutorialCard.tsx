import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const STORAGE_KEY = 'widget_tutorial_dismissed';

interface WidgetTutorialCardProps {
  onDismiss?: () => void;
  compact?: boolean;
}

export const WidgetTutorialCard: React.FC<WidgetTutorialCardProps> = ({ onDismiss, compact = false }) => {
  const [visible, setVisible] = useState(false);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    checkDismissed();
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const checkDismissed = async () => {
    try {
      const dismissed = await AsyncStorage.getItem(STORAGE_KEY);
      if (dismissed !== 'true') {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  };

  const handleDismiss = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, 'true');
    } catch {}
    setVisible(false);
    onDismiss?.();
  };

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  if (!visible) return null;

  if (compact) {
    return (
      <Animated.View entering={FadeInDown.duration(400)} exiting={FadeOut.duration(300)}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={{
            backgroundColor: '#FFF',
            borderRadius: 16,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            shadowColor: '#3D405B',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.06,
            shadowRadius: 12,
            elevation: 3,
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: 'rgba(129, 178, 154, 0.15)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons name="widgets" size={22} color="#81B29A" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: '#3D405B' }}>
              Add Tether Widgets
            </Text>
            <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: 'rgba(61, 64, 91, 0.6)', marginTop: 2 }}>
              Quick access from your home screen
            </Text>
          </View>
          <TouchableOpacity onPress={handleDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialCommunityIcons name="close" size={20} color="rgba(61, 64, 91, 0.3)" />
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeInDown.duration(400)} exiting={FadeOut.duration(300)}>
      <View
        style={{
          backgroundColor: '#FFF',
          borderRadius: 20,
          overflow: 'hidden',
          shadowColor: '#3D405B',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 16,
          elevation: 4,
        }}
      >
        <View
          style={{
            backgroundColor: '#81B29A',
            paddingVertical: 16,
            paddingHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Animated.View style={pulseStyle}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MaterialCommunityIcons name="widgets" size={20} color="#FFF" />
              </View>
            </Animated.View>
            <View>
              <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#FFF' }}>
                Add Widgets
              </Text>
              <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 11, color: 'rgba(255, 255, 255, 0.8)' }}>
                Track connections from your home screen
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleDismiss}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons name="close" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={{ padding: 20 }}>
          <View style={{ gap: 16 }}>
            <StepItem
              number={1}
              title="Long-press your home screen"
              description="Hold until apps start jiggling"
              icon="gesture-tap-hold"
            />
            <StepItem
              number={2}
              title={Platform.OS === 'ios' ? "Tap the + button" : "Tap Widgets"}
              description={Platform.OS === 'ios' ? "Top left corner of your screen" : "Select from the menu"}
              icon="plus-circle-outline"
            />
            <StepItem
              number={3}
              title="Search for Tether"
              description="Find our widgets in the list"
              icon="magnify"
            />
            <StepItem
              number={4}
              title="Choose your widget"
              description="Streak, Garden, Today's Focus & more"
              icon="check-circle-outline"
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(129, 178, 154, 0.1)', paddingVertical: 10, borderRadius: 10 }}>
              <MaterialCommunityIcons name="fire" size={16} color="#E07A5F" />
              <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11, color: '#3D405B' }}>Streak</Text>
            </View>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(129, 178, 154, 0.1)', paddingVertical: 10, borderRadius: 10 }}>
              <MaterialCommunityIcons name="leaf" size={16} color="#81B29A" />
              <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11, color: '#3D405B' }}>Garden</Text>
            </View>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(129, 178, 154, 0.1)', paddingVertical: 10, borderRadius: 10 }}>
              <MaterialCommunityIcons name="account-heart" size={16} color="#6366F1" />
              <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11, color: '#3D405B' }}>Focus</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleDismiss}
            style={{
              marginTop: 16,
              paddingVertical: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13, color: 'rgba(61, 64, 91, 0.5)' }}>
              Got it, don't show again
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const StepItem: React.FC<{
  number: number;
  title: string;
  description: string;
  icon: string;
}> = ({ number, title, description, icon }) => (
  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
    <View
      style={{
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#81B29A',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13, color: '#FFF' }}>
        {number}
      </Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: '#3D405B' }}>
        {title}
      </Text>
      <Text style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: 'rgba(61, 64, 91, 0.6)', marginTop: 2 }}>
        {description}
      </Text>
    </View>
    <MaterialCommunityIcons name={icon as any} size={20} color="rgba(61, 64, 91, 0.3)" />
  </View>
);

export const resetWidgetTutorial = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {}
};
