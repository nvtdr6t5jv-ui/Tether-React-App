import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Alert,
  Linking,
  Platform,
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
import { purchasesService } from '../services/purchases';

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
  { id: 'contacts', icon: 'account-group', title: 'Unlimited Contacts', description: 'Track all the people in your life, not just 5.' },
  { id: 'deep_link', icon: 'link-variant', title: 'Quick Actions', description: 'Call or text directly from the app with one tap.' },
  { id: 'templates', icon: 'text-box-multiple', title: 'Message Templates', description: 'Never struggle with what to say again.' },
  { id: 'analytics', icon: 'chart-line', title: 'Full Analytics', description: 'See detailed insights into your social health.' },
  { id: 'history', icon: 'history', title: 'Unlimited History', description: 'Access your complete connection history, forever.' },
  { id: 'suggestions', icon: 'lightbulb', title: 'Smart Suggestions', description: 'AI-powered tips on when and how to reach out.' },
  { id: 'bulk_actions', icon: 'checkbox-multiple-marked', title: 'Bulk Actions', description: 'Mark multiple people as contacted at once.' },
  { id: 'frequencies', icon: 'clock-edit', title: 'Custom Frequencies', description: 'Set personalized reminder schedules per friend.' },
  { id: 'orbits', icon: 'orbit', title: 'Custom Orbits', description: 'Rename and customize your orbit categories.' },
  { id: 'themes', icon: 'palette', title: 'Premium Themes', description: 'Personalize your app with exclusive themes.' },
  { id: 'export', icon: 'export', title: 'Data Export', description: 'Export your connection history anytime.' },
  { id: 'priority', icon: 'star-circle', title: 'Priority Support', description: 'Get faster help when you need it.' },
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
  const { upgradeToPremium, premiumStatus } = useApp();
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('yearly');
  const [isRestoring, setIsRestoring] = useState(false);
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  const isPremiumUser = premiumStatus.isPremium;
  const headline = isPremiumUser 
    ? { title: 'Your Premium Membership', subtitle: 'Thank you for being a premium member!' }
    : (TRIGGER_HEADLINES[trigger] || TRIGGER_HEADLINES.general);

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

  const highlightedFeature = isPremiumUser ? null : getHighlightedFeature();

  const formatExpiryDate = (date?: Date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const getDaysUntilExpiry = () => {
    if (!premiumStatus.expiresAt) return null;
    const now = new Date();
    const expiry = new Date(premiumStatus.expiresAt);
    const diff = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getPlanDisplayName = () => {
    if (premiumStatus.plan === 'yearly') return 'Annual Plan';
    if (premiumStatus.plan === 'monthly') return 'Monthly Plan';
    return 'Premium Plan';
  };

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

  const handleManageSubscription = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('https://apps.apple.com/account/subscriptions');
    } else {
      Linking.openURL('https://play.google.com/store/account/subscriptions');
    }
  };

  const handleRestorePurchases = async () => {
    setIsRestoring(true);
    try {
      const result = await purchasesService.restorePurchases();
      if (result.success && result.isPremium) {
        Alert.alert('Restored!', 'Your premium subscription has been restored.');
      } else if (result.success) {
        Alert.alert('No Subscription Found', 'We could not find an active subscription for this account.');
      } else {
        Alert.alert('Error', result.error || 'Failed to restore purchases.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to restore purchases. Please try again.');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleChangePlan = async (newPlan: 'yearly' | 'monthly') => {
    if (newPlan === premiumStatus.plan) {
      Alert.alert('Same Plan', 'You are already on this plan.');
      return;
    }
    Alert.alert(
      'Change Plan',
      `Switch to the ${newPlan === 'yearly' ? 'Annual' : 'Monthly'} plan? Changes will take effect at your next billing date.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Change Plan', 
          onPress: async () => {
            await upgradeToPremium(newPlan);
            Alert.alert('Plan Updated', 'Your subscription plan has been updated.');
          }
        },
      ]
    );
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

  const daysUntilExpiry = getDaysUntilExpiry();

  const renderPremiumUserContent = () => (
    <>
      <Animated.View entering={FadeInDown.delay(200).duration(400)} style={{ alignItems: 'center', marginBottom: 24 }}>
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: 'rgba(255,255,255,0.2)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            borderWidth: 3,
            borderColor: '#FFD700',
          }}
        >
          <MaterialCommunityIcons name="crown" size={36} color="#FFD700" />
        </View>
        <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 24, color: '#FFF', textAlign: 'center', marginBottom: 6 }}>
          {headline.title}
        </Text>
        <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14, color: 'rgba(255,255,255,0.9)', textAlign: 'center' }}>
          {headline.subtitle}
        </Text>
      </Animated.View>

      <Animated.View entering={FadeIn.delay(300).duration(400)} style={{ marginBottom: 24 }}>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,215,0,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <MaterialCommunityIcons name="diamond-stone" size={24} color="#FFD700" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: '#FFF' }}>
                {getPlanDisplayName()}
              </Text>
              <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                Active Subscription
              </Text>
            </View>
            <View style={{ backgroundColor: '#81B29A', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
              <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11, color: '#FFF' }}>ACTIVE</Text>
            </View>
          </View>

          <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 16 }} />

          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
                Renewal Date
              </Text>
              <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: '#FFF' }}>
                {formatExpiryDate(premiumStatus.expiresAt)}
              </Text>
            </View>
            {daysUntilExpiry !== null && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
                  Days Remaining
                </Text>
                <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: daysUntilExpiry <= 7 ? '#E07A5F' : '#FFF' }}>
                  {daysUntilExpiry} days
                </Text>
              </View>
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
                Price
              </Text>
              <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: '#FFF' }}>
                {premiumStatus.plan === 'yearly' ? '$29.99/year' : '$3.99/month'}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeIn.delay(400).duration(400)} style={{ marginBottom: 24 }}>
        <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
          Your Premium Features
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {FEATURES.map((feature) => (
            <View
              key={feature.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: 'rgba(255,255,255,0.1)',
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 20,
              }}
            >
              <MaterialCommunityIcons name="check-circle" size={14} color="#81B29A" />
              <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: '#FFF' }}>
                {feature.title}
              </Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {premiumStatus.plan === 'monthly' && (
        <Animated.View entering={FadeIn.delay(450).duration(400)} style={{ marginBottom: 20 }}>
          <View style={{ backgroundColor: 'rgba(224,122,95,0.2)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(224,122,95,0.3)' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <MaterialCommunityIcons name="tag" size={18} color="#E07A5F" style={{ marginRight: 8 }} />
              <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: '#FFF' }}>
                Save 30% with Annual Plan
              </Text>
            </View>
            <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 12 }}>
              Switch to yearly billing and save $17.89 per year!
            </Text>
            <TouchableOpacity
              onPress={() => handleChangePlan('yearly')}
              style={{
                backgroundColor: '#E07A5F',
                paddingVertical: 10,
                borderRadius: 12,
                alignItems: 'center',
              }}
              activeOpacity={0.8}
            >
              <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: '#FFF' }}>
                Switch to Annual
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      <Animated.View entering={FadeInUp.delay(500).duration(400)}>
        <TouchableOpacity
          onPress={handleManageSubscription}
          style={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            paddingVertical: 16,
            borderRadius: 16,
            alignItems: 'center',
            marginBottom: 12,
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
          }}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="cog" size={20} color="#FFF" />
          <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 15, color: '#FFF' }}>
            Manage Subscription
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={closeDrawer}
          style={{
            backgroundColor: '#FFF',
            paddingVertical: 16,
            borderRadius: 16,
            alignItems: 'center',
          }}
          activeOpacity={0.8}
        >
          <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 17, color: '#5A8F7B' }}>
            Done
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );

  const renderUpgradeContent = () => (
    <>
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
        {sortedFeatures.slice(0, 6).map((feature, index) => (
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

      {sortedFeatures.length > 6 && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 12, textAlign: 'center' }}>
            Plus {sortedFeatures.length - 6} more premium features
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
            {sortedFeatures.slice(6).map((feature) => (
              <View
                key={feature.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 9999,
                }}
              >
                <MaterialCommunityIcons name={feature.icon as any} size={12} color="rgba(255,255,255,0.8)" />
                <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>
                  {feature.title}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

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
          <TouchableOpacity onPress={handleRestorePurchases} disabled={isRestoring}>
            <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>
              {isRestoring ? 'Restoring...' : 'Restore Purchases'}
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
    </>
  );

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
            colors={['#5A8F7B', '#81B29A', '#5A8F7B']}
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
              {isPremiumUser ? renderPremiumUserContent() : renderUpgradeContent()}
            </ScrollView>
          </LinearGradient>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};
