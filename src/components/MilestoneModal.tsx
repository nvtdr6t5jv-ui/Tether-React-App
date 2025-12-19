import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
  withRepeat,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface MilestoneModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  description: string;
}

const Confetti: React.FC<{ delay: number; startX: number }> = ({ delay, startX }) => {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(startX);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withTiming(height + 100, { duration: 3000, easing: Easing.out(Easing.quad) })
    );
    translateX.value = withDelay(
      delay,
      withSequence(
        withTiming(startX + (Math.random() - 0.5) * 100, { duration: 1000 }),
        withTiming(startX + (Math.random() - 0.5) * 150, { duration: 1000 }),
        withTiming(startX + (Math.random() - 0.5) * 200, { duration: 1000 })
      )
    );
    rotate.value = withDelay(
      delay,
      withRepeat(withTiming(360, { duration: 1000 }), 3, false)
    );
    opacity.value = withDelay(
      delay + 2000,
      withTiming(0, { duration: 1000 })
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  const colors = ['#81B29A', '#E07A5F', '#F2CC8F', '#6366F1', '#EC4899', '#F97316'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: 10,
          height: 10,
          backgroundColor: color,
          borderRadius: 2,
        },
        style,
      ]}
    />
  );
};

export const MilestoneModal: React.FC<MilestoneModalProps> = ({
  visible,
  onClose,
  title,
  description,
}) => {
  const scale = useSharedValue(0);
  const starScale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 10, stiffness: 100 });
      starScale.value = withDelay(300, withSpring(1, { damping: 8, stiffness: 80 }));
    } else {
      scale.value = 0;
      starScale.value = 0;
    }
  }, [visible]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const starStyle = useAnimatedStyle(() => ({
    transform: [{ scale: starScale.value }],
  }));

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" statusBarTranslucent>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {[...Array(30)].map((_, i) => (
          <Confetti
            key={i}
            delay={i * 100}
            startX={Math.random() * width}
          />
        ))}

        <Animated.View
          style={[
            {
              backgroundColor: '#FFF',
              borderRadius: 24,
              padding: 32,
              width: width - 64,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 20 },
              shadowOpacity: 0.3,
              shadowRadius: 30,
              elevation: 20,
            },
            cardStyle,
          ]}
        >
          <Animated.View
            style={[
              {
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
              },
              starStyle,
            ]}
          >
            <MaterialCommunityIcons name="star" size={56} color="#F97316" />
          </Animated.View>

          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 28, color: '#3D405B', textAlign: 'center', marginBottom: 8 }}>
            {title}
          </Text>

          <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 16, color: 'rgba(61, 64, 91, 0.7)', textAlign: 'center', lineHeight: 24, marginBottom: 24 }}>
            {description}
          </Text>

          <TouchableOpacity
            onPress={onClose}
            style={{
              backgroundColor: '#81B29A',
              paddingHorizontal: 32,
              paddingVertical: 16,
              borderRadius: 9999,
              width: '100%',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#FFF' }}>
              Keep Going!
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};