import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { 
  FadeInDown, 
  FadeInUp,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PremiumScreenProps {
  onClose: () => void;
}

const PremiumFeature: React.FC<{
  icon: string;
  title: string;
  description: string;
  delay: number;
}> = ({ icon, title, description, delay }) => (
  <Animated.View 
    entering={FadeInUp.delay(delay).duration(400)}
    style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}
  >
    <View
      style={{
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
      }}
    >
      <MaterialCommunityIcons name={icon as any} size={14} color="#FFF" />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15, color: '#FFF', marginBottom: 2 }}>
        {title}
      </Text>
      <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 18 }}>
        {description}
      </Text>
    </View>
  </Animated.View>
);

export const PremiumScreen: React.FC<PremiumScreenProps> = ({ onClose }) => {
  const [selectedPlan, setSelectedPlan] = React.useState<'yearly' | 'monthly'>('yearly');
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withTiming(0, { duration: 300 });
    backdropOpacity.value = withTiming(1, { duration: 300 });
  }, []);

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

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  return (
    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(61, 64, 91, 0.4)',
          },
          animatedBackdropStyle,
        ]}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={closeDrawer}
        />
      </Animated.View>
      
      <GestureDetector gesture={panGesture}>
        <Animated.View style={animatedSheetStyle}>
          <LinearGradient
            colors={['#81B29A', '#457262']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderTopLeftRadius: 40,
              borderTopRightRadius: 40,
              paddingHorizontal: 24,
              paddingTop: 16,
              paddingBottom: 40,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                marginLeft: -96,
                width: 192,
                height: 192,
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: 96,
                transform: [{ translateY: -96 }],
              }}
            />

            <View style={{ width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, alignSelf: 'center', marginBottom: 24 }} />

            <Animated.View entering={FadeInDown.delay(200).duration(400)} style={{ alignItems: 'center', marginBottom: 32 }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                  shadowColor: '#FFF',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.3,
                  shadowRadius: 25,
                }}
              >
                <MaterialCommunityIcons name="diamond-stone" size={32} color="#FFF" />
              </View>
              <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 28, color: '#FFF', textAlign: 'center', marginBottom: 8 }}>
                Unlock Your Full History
              </Text>
              <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 15, color: 'rgba(255,255,255,0.9)', textAlign: 'center' }}>
                Become a master of your social orbit.
              </Text>
            </Animated.View>

            <View style={{ gap: 20, marginBottom: 36, paddingHorizontal: 12 }}>
              <PremiumFeature
                icon="history"
                title="Unlimited History"
                description="See every conversation from years ago."
                delay={300}
              />
              <PremiumFeature
                icon="chart-line"
                title="Advanced Insights"
                description="Full access to the Social Health stats page."
                delay={400}
              />
              <PremiumFeature
                icon="account-group"
                title="Unlimited Contacts"
                description="Add more than 50 people to your universe."
                delay={500}
              />
            </View>

            <Animated.View entering={FadeIn.delay(600).duration(400)} style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
              <TouchableOpacity
                onPress={() => setSelectedPlan('yearly')}
                style={{
                  flex: 1,
                  backgroundColor: selectedPlan === 'yearly' ? '#FFF' : 'rgba(255,255,255,0.05)',
                  borderRadius: 16,
                  padding: 16,
                  paddingTop: 24,
                  borderWidth: selectedPlan === 'yearly' ? 0 : 1,
                  borderColor: 'rgba(255,255,255,0.4)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                activeOpacity={0.8}
              >
                {selectedPlan === 'yearly' && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: 12,
                      backgroundColor: '#E07A5F',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 9999,
                    }}
                  >
                    <Text style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 10, color: '#FFF' }}>
                      SAVE 30%
                    </Text>
                  </View>
                )}
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, color: selectedPlan === 'yearly' ? 'rgba(61, 64, 91, 0.5)' : 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>
                  Yearly
                </Text>
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 24, color: selectedPlan === 'yearly' ? '#3D405B' : '#FFF', marginBottom: 2 }}>
                  $29.99
                </Text>
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, color: selectedPlan === 'yearly' ? 'rgba(61, 64, 91, 0.5)' : 'rgba(255,255,255,0.7)' }}>
                  per year
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSelectedPlan('monthly')}
                style={{
                  flex: 1,
                  backgroundColor: selectedPlan === 'monthly' ? '#FFF' : 'rgba(255,255,255,0.05)',
                  borderRadius: 16,
                  padding: 16,
                  paddingTop: 24,
                  borderWidth: selectedPlan === 'monthly' ? 0 : 1,
                  borderColor: 'rgba(255,255,255,0.4)',
                }}
                activeOpacity={0.8}
              >
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, color: selectedPlan === 'monthly' ? 'rgba(61, 64, 91, 0.5)' : 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>
                  Monthly
                </Text>
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 24, color: selectedPlan === 'monthly' ? '#3D405B' : '#FFF', marginBottom: 2 }}>
                  $3.99
                </Text>
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, color: selectedPlan === 'monthly' ? 'rgba(61, 64, 91, 0.5)' : 'rgba(255,255,255,0.7)' }}>
                  per month
                </Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(700).duration(400)}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#E07A5F',
                  paddingVertical: 18,
                  borderRadius: 16,
                  alignItems: 'center',
                  shadowColor: '#E07A5F',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.25,
                  shadowRadius: 16,
                  marginBottom: 20,
                }}
                activeOpacity={0.8}
              >
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: '#FFF' }}>
                  Start 7-Day Free Trial
                </Text>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16 }}>
                <TouchableOpacity>
                  <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Restore Purchases
                  </Text>
                </TouchableOpacity>
                <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>-</Text>
                <TouchableOpacity>
                  <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Terms of Service
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </LinearGradient>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};
