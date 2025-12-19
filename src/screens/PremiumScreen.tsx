import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
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
import { useApp } from '../context/AppContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PremiumScreenProps {
  onClose: () => void;
  trigger?: 'contact_limit' | 'deep_link' | 'templates' | 'analytics' | 'history' | 'bulk_actions' | 'general';
}

const PremiumFeature: React.FC<{
  icon: string;
  title: string;
  description: string;
  delay: number;
  highlighted?: boolean;
}> = ({ icon, title, description, delay, highlighted }) => (
  <Animated.View 
    entering={FadeInUp.delay(delay).duration(400)}
    style={{ 
      flexDirection: 'row', 
      alignItems: 'flex-start', 
      gap: 12,
      backgroundColor: highlighted ? 'rgba(255,255,255,0.15)' : 'transparent',
      padding: highlighted ? 12 : 0,
      borderRadius: 12,
      marginHorizontal: highlighted ? -12 : 0,
    }}
  >
    <View
      style={{
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: highlighted ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
      }}
    >
      <MaterialCommunityIcons name={icon as any} size={14} color="#FFF" />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: '#FFF', marginBottom: 2 }}>
        {title}
      </Text>
      <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 16 }}>
        {description}
      </Text>
    </View>
  </Animated.View>
);

const FEATURES = [
  { id: 'contacts', icon: 'account-group', title: 'Unlimited Contacts', description: 'Track more than 5 people in your orbit.' },
  { id: 'deep_link', icon: 'link-variant', title: 'Quick Actions', description: 'Tap to message or call directly from the app.' },
  { id: 'templates', icon: 'text-box-multiple', title: 'Message Templates', description: 'Suggested conversation starters for any occasion.' },
  { id: 'analytics', icon: 'chart-line', title: 'Full Analytics', description: 'Unlock the complete Social Pulse dashboard.' },
  { id: 'history', icon: 'history', title: 'Unlimited History', description: 'See all your interactions, not just 30 days.' },
  { id: 'suggestions', icon: 'lightbulb', title: 'Smart Suggestions', description: 'AI-powered insights on when to reach out.' },
  { id: 'bulk_actions', icon: 'checkbox-multiple-marked', title: 'Bulk Actions', description: 'Mark multiple friends as contacted at once.' },
  { id: 'frequencies', icon: 'clock-edit', title: 'Custom Frequencies', description: 'Set personalized nudge schedules per friend.' },
];

const TRIGGER_HEADLINES: Record<string, { title: string; subtitle: string }> = {
  contact_limit: { title: "You've Hit Your Limit", subtitle: 'Upgrade to add unlimited friends to your orbit.' },
  deep_link: { title: 'One-Tap Messaging', subtitle: 'Upgrade to message or call directly from Tether.' },
  templates: { title: 'Never Run Out of Words', subtitle: 'Unlock message templates for every occasion.' },
  analytics: { title: 'See the Full Picture', subtitle: 'Unlock complete Social Pulse analytics.' },
  history: { title: 'Your Full History Awaits', subtitle: 'See all your interactions, not just 30 days.' },
  bulk_actions: { title: 'Save Time', subtitle: 'Mark multiple friends as contacted at once.' },
  general: { title: 'Unlock Your Full Potential', subtitle: 'Become a master of your social orbit.' },
};

export const PremiumScreen: React.FC<PremiumScreenProps> = ({ onClose, trigger = 'general' }) => {
  const { upgradeToPremium } = useApp();
  const [selectedPlan, setSelectedPlan] = React.useState<'yearly' | 'monthly'>('yearly');
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  const headline = TRIGGER_HEADLINES[trigger] || TRIGGER_HEADLINES.general;

  const getHighlightedFeature = () => {
    switch (trigger) {
      case 'contact_limit': return 'contacts';
      case 'deep_link': return 'deep_link';
      case 'templates': return 'templates';
      case 'analytics': return 'analytics';
      case 'history': return 'history';
      case 'bulk_actions': return 'bulk_actions';
      default: return null;
    }
  };

  const highlightedFeature = getHighlightedFeature();

  useEffect(() => {
    translateY.value = withTiming(0, { duration: 300 });
    backdropOpacity.value = withTiming(1, { duration: 300 });
  }, []);

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

  const handleUpgrade = async () => {
    await upgradeToPremium(selectedPlan);
    closeDrawer();
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

  const sortedFeatures = [...FEATURES].sort((a, b) => {
    if (a.id === highlightedFeature) return -1;
    if (b.id === highlightedFeature) return 1;
    return 0;
  });

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
        <Animated.View style={[animatedSheetStyle, { maxHeight: SCREEN_HEIGHT * 0.9 }]}>
          <LinearGradient
            colors={['#3D405B', '#4A4E69', '#3D405B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderTopLeftRadius: 40,
              borderTopRightRadius: 40,
              paddingTop: 16,
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

            <View style={{ width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, alignSelf: 'center', marginBottom: 20 }} />

            <ScrollView 
              style={{ maxHeight: SCREEN_HEIGHT * 0.7 }}
              contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
            >
              <Animated.View entering={FadeInDown.delay(200).duration(400)} style={{ alignItems: 'center', marginBottom: 24 }}>
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                  }}
                >
                  <MaterialCommunityIcons name="diamond-stone" size={28} color="#FFF" />
                </View>
                <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 24, color: '#FFF', textAlign: 'center', marginBottom: 6 }}>
                  {headline.title}
                </Text>
                <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14, color: 'rgba(255,255,255,0.9)', textAlign: 'center' }}>
                  {headline.subtitle}
                </Text>
              </Animated.View>

              <View style={{ gap: 12, marginBottom: 24 }}>
                {sortedFeatures.slice(0, 4).map((feature, index) => (
                  <PremiumFeature
                    key={feature.id}
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                    delay={300 + index * 50}
                    highlighted={feature.id === highlightedFeature}
                  />
                ))}
              </View>

              <Animated.View entering={FadeIn.delay(500).duration(400)} style={{ flexDirection: 'row', gap: 12, marginBottom: 20, marginTop: 12 }}>
                <View style={{ flex: 1, position: 'relative' }}>
                  <View
                    style={{
                      position: 'absolute',
                      top: -10,
                      right: 8,
                      backgroundColor: '#E07A5F',
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 9999,
                      zIndex: 1,
                    }}
                  >
                    <Text style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 9, color: '#FFF' }}>
                      SAVE 30%
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setSelectedPlan('yearly')}
                    style={{
                      flex: 1,
                      backgroundColor: selectedPlan === 'yearly' ? '#FFF' : 'rgba(255,255,255,0.05)',
                      borderRadius: 16,
                      padding: 14,
                      paddingTop: 20,
                      borderWidth: selectedPlan === 'yearly' ? 0 : 1,
                      borderColor: 'rgba(255,255,255,0.4)',
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, color: selectedPlan === 'yearly' ? 'rgba(61, 64, 91, 0.5)' : 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>
                      Yearly
                    </Text>
                    <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 22, color: selectedPlan === 'yearly' ? '#3D405B' : '#FFF', marginBottom: 2 }}>
                      $29.99
                    </Text>
                    <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, color: selectedPlan === 'yearly' ? 'rgba(61, 64, 91, 0.5)' : 'rgba(255,255,255,0.7)' }}>
                      per year
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={() => setSelectedPlan('monthly')}
                  style={{
                    flex: 1,
                    backgroundColor: selectedPlan === 'monthly' ? '#FFF' : 'rgba(255,255,255,0.05)',
                    borderRadius: 16,
                    padding: 14,
                    paddingTop: 20,
                    borderWidth: selectedPlan === 'monthly' ? 0 : 1,
                    borderColor: 'rgba(255,255,255,0.4)',
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, color: selectedPlan === 'monthly' ? 'rgba(61, 64, 91, 0.5)' : 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>
                    Monthly
                  </Text>
                  <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 22, color: selectedPlan === 'monthly' ? '#3D405B' : '#FFF', marginBottom: 2 }}>
                    $3.99
                  </Text>
                  <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, color: selectedPlan === 'monthly' ? 'rgba(61, 64, 91, 0.5)' : 'rgba(255,255,255,0.7)' }}>
                    per month
                  </Text>
                </TouchableOpacity>
              </Animated.View>

              <Animated.View entering={FadeInUp.delay(600).duration(400)}>
                <TouchableOpacity
                  onPress={handleUpgrade}
                  style={{
                    backgroundColor: '#E07A5F',
                    paddingVertical: 16,
                    borderRadius: 16,
                    alignItems: 'center',
                    shadowColor: '#E07A5F',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.25,
                    shadowRadius: 16,
                    marginBottom: 16,
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 17, color: '#FFF' }}>
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
            </ScrollView>
          </LinearGradient>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};
