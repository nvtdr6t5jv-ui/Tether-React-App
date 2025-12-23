import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useApp } from '../context/AppContext';
import { exportService } from '../services/ExportService';

interface SettingsScreenProps {
  onNavigateToNotifications: () => void;
  onNavigateToAppearance: () => void;
  onNavigateToAnalytics: () => void;
  onNavigateToEditProfile: () => void;
  onNavigateToPremium: () => void;
  onNavigateToOrbitSettings: () => void;
  onLogout: () => void;
}

const SettingsRow: React.FC<{
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle?: string;
  value?: string;
  showChevron?: boolean;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}> = ({ icon, iconBg, iconColor, title, subtitle, value, showChevron = true, onPress, rightElement }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={onPress ? 0.7 : 1}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
    }}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: iconBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MaterialCommunityIcons name={icon as any} size={18} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 15, color: '#3D405B' }}>
          {title}
        </Text>
        {subtitle && (
          <Text style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 10, color: 'rgba(61, 64, 91, 0.4)', marginTop: 2 }}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
    {rightElement || (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {value && (
          <Text style={{ fontFamily: value.includes('%') ? 'PlusJakartaSans_700Bold' : 'PlusJakartaSans_500Medium', fontSize: 14, color: value.includes('%') ? '#81B29A' : 'rgba(61, 64, 91, 0.5)' }}>
            {value}
          </Text>
        )}
        {showChevron && (
          <MaterialCommunityIcons name="chevron-right" size={20} color="rgba(61, 64, 91, 0.3)" />
        )}
      </View>
    )}
  </TouchableOpacity>
);

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onNavigateToNotifications,
  onNavigateToAppearance,
  onNavigateToAnalytics,
  onNavigateToEditProfile,
  onNavigateToPremium,
  onNavigateToOrbitSettings,
  onLogout,
}) => {
  const { userProfile, userSettings, updateUserSettings, getSocialHealthStats, resetApp, logout, premiumStatus } = useApp();
  const [isExporting, setIsExporting] = useState(false);

  const stats = getSocialHealthStats();

  const handleVacationToggle = async (value: boolean) => {
    await updateUserSettings({ vacationMode: value });
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const success = await exportService.shareExport();
      if (!success) {
        Alert.alert('Export', 'Export feature is not available on this device.');
      }
    } catch (error) {
      Alert.alert('Export Failed', 'There was an error exporting your data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            await logout();
            onLogout();
          },
        },
      ]
    );
  };

  const handleResetApp = () => {
    Alert.alert(
      'Reset App',
      'This will delete all your data and return you to the welcome screen. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetApp();
            onLogout();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F4F1DE' }} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(400)} style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <Text style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 28, color: '#3D405B' }}>
              Settings
            </Text>
            <TouchableOpacity onPress={handleLogout}>
              <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14, color: 'rgba(61, 64, 91, 0.4)', marginBottom: 4 }}>
                Log Out
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(200).duration(400)} style={{ alignItems: 'center', marginTop: 16, marginBottom: 32 }}>
          <View
            style={{
              width: 112,
              height: 112,
              borderRadius: 56,
              backgroundColor: '#FFF',
              padding: 4,
              shadowColor: '#3D405B',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.08,
              shadowRadius: 24,
              elevation: 4,
            }}
          >
            {userProfile?.photo ? (
              <Image
                source={{ uri: userProfile.photo }}
                style={{ width: '100%', height: '100%', borderRadius: 52 }}
              />
            ) : (
              <View
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 52,
                  backgroundColor: '#E07A5F',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 36, color: '#FFF' }}>
                  {userProfile?.name?.charAt(0) || 'A'}
                </Text>
              </View>
            )}
          </View>
          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 24, color: '#3D405B', marginTop: 16 }}>
            {userProfile?.name || 'Alex Rivera'}
          </Text>
          <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: 'rgba(61, 64, 91, 0.5)', marginTop: 4 }}>
            Member since {userProfile?.memberSince ? new Date(userProfile.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'September 2024'}
          </Text>
          {premiumStatus.isPremium && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, backgroundColor: 'rgba(129, 178, 154, 0.15)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 9999 }}>
              <MaterialCommunityIcons name="crown" size={16} color="#FFD700" />
              <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: '#81B29A' }}>Premium Member</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={onNavigateToEditProfile}
            style={{
              marginTop: 16,
              paddingHorizontal: 24,
              paddingVertical: 10,
              backgroundColor: 'rgba(255,255,255,0.8)',
              borderRadius: 9999,
              borderWidth: 1,
              borderColor: 'rgba(61, 64, 91, 0.05)',
            }}
          >
            <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: '#3D405B' }}>
              Edit Profile
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).duration(400)} style={{ paddingHorizontal: 20 }}>
          <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, color: 'rgba(61, 64, 91, 0.4)', textTransform: 'uppercase', letterSpacing: 1.5, marginLeft: 8, marginBottom: 8 }}>
            My Orbit
          </Text>
          <View
            style={{
              backgroundColor: '#FFF',
              borderRadius: 16,
              overflow: 'hidden',
              shadowColor: '#3D405B',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <SettingsRow
              icon="chart-pie"
              iconBg="rgba(99, 102, 241, 0.1)"
              iconColor="#6366F1"
              title="My Social Stats"
              value={`${stats.overallScore}% Healthy`}
              onPress={onNavigateToAnalytics}
            />
            <View style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.03)', marginHorizontal: 16 }} />
            <SettingsRow
              icon="bell"
              iconBg="rgba(224, 122, 95, 0.1)"
              iconColor="#E07A5F"
              title="Notifications"
              value={userSettings.notificationsEnabled ? `Daily Digest @ ${userSettings.notificationTime}` : 'Off'}
              onPress={onNavigateToNotifications}
            />
            <View style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.03)', marginHorizontal: 16 }} />
            <SettingsRow
              icon="airplane"
              iconBg="rgba(59, 130, 246, 0.1)"
              iconColor="#3B82F6"
              title="Vacation Mode"
              subtitle="Pause all nudges."
              showChevron={false}
              rightElement={
                <Switch
                  value={userSettings.vacationMode}
                  onValueChange={handleVacationToggle}
                  trackColor={{ false: 'rgba(0,0,0,0.1)', true: '#81B29A' }}
                  thumbColor="#FFF"
                />
              }
            />
            <View style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.03)', marginHorizontal: 16 }} />
            <SettingsRow
              icon="weather-night"
              iconBg="rgba(61, 64, 91, 0.1)"
              iconColor="#3D405B"
              title="Appearance"
              value={userSettings.theme === 'system' ? 'System Default' : userSettings.theme === 'dark' ? 'Dark' : 'Light'}
              onPress={onNavigateToAppearance}
            />
            {premiumStatus.isPremium && (
              <>
                <View style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.03)', marginHorizontal: 16 }} />
                <SettingsRow
                  icon="orbit"
                  iconBg="rgba(224, 122, 95, 0.1)"
                  iconColor="#E07A5F"
                  title="Orbit Settings"
                  subtitle="Customize reminder frequencies"
                  onPress={onNavigateToOrbitSettings}
                />
              </>
            )}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400).duration(400)} style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, color: 'rgba(61, 64, 91, 0.4)', textTransform: 'uppercase', letterSpacing: 1.5, marginLeft: 8, marginBottom: 8 }}>
            Data & Sync
          </Text>
          <View
            style={{
              backgroundColor: '#FFF',
              borderRadius: 16,
              overflow: 'hidden',
              shadowColor: '#3D405B',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <SettingsRow
              icon="sync"
              iconBg="rgba(129, 178, 154, 0.1)"
              iconColor="#81B29A"
              title="Sync Contacts"
              value={userSettings.contactsSynced ? 'On' : 'Off'}
              showChevron={false}
            />
            <View style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.03)', marginHorizontal: 16 }} />
            <SettingsRow
              icon="plus-circle"
              iconBg="rgba(249, 115, 22, 0.1)"
              iconColor="#F97316"
              title="Import New Friends"
              showChevron={true}
              onPress={() => Alert.alert('Coming Soon', 'Contact import will be available in a future update.')}
            />
            <View style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.03)', marginHorizontal: 16 }} />
            <SettingsRow
              icon="download"
              iconBg="rgba(0,0,0,0.05)"
              iconColor="rgba(61, 64, 91, 0.6)"
              title="Export My Data"
              showChevron={!isExporting}
              onPress={handleExport}
              rightElement={isExporting ? <ActivityIndicator size="small" color="#81B29A" /> : undefined}
            />
          </View>
        </Animated.View>

        {premiumStatus.isPremium ? (
          <Animated.View entering={FadeInUp.delay(500).duration(400)} style={{ paddingHorizontal: 20, marginTop: 24 }}>
            <View
              style={{
                backgroundColor: '#81B29A',
                borderRadius: 16,
                padding: 20,
                overflow: 'hidden',
                shadowColor: '#81B29A',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2,
                shadowRadius: 16,
                elevation: 4,
              }}
            >
              <View style={{ position: 'absolute', top: -40, right: -40, width: 128, height: 128, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 64 }} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MaterialCommunityIcons name="crown" size={26} color="#FFD700" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 20, color: '#FFF' }}>
                      Premium Active
                    </Text>
                    <View style={{ backgroundColor: 'rgba(255,215,0,0.3)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                      <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, color: '#FFD700' }}>PRO</Text>
                    </View>
                  </View>
                  <Text style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>
                    Thank you for supporting Tether!
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInUp.delay(500).duration(400)} style={{ paddingHorizontal: 20, marginTop: 24 }}>
            <View
              style={{
                backgroundColor: '#81B29A',
                borderRadius: 16,
                padding: 20,
                overflow: 'hidden',
                shadowColor: '#81B29A',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2,
                shadowRadius: 16,
                elevation: 4,
              }}
            >
              <View style={{ position: 'absolute', top: -40, right: -40, width: 128, height: 128, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 64 }} />
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MaterialCommunityIcons name="star" size={20} color="#FFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 18, color: '#FFF', marginBottom: 4 }}>
                    Unlock Unlimited History
                  </Text>
                  <Text style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.9)', lineHeight: 20, marginBottom: 12 }}>
                    View your full relationship timeline and never miss a memory.
                  </Text>
                  <TouchableOpacity
                    onPress={onNavigateToPremium}
                    style={{
                      alignSelf: 'flex-start',
                      backgroundColor: '#FFF',
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                      borderRadius: 9999,
                    }}
                  >
                    <Text style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 12, color: '#81B29A', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Upgrade
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Animated.View>
        )}


        <Animated.View entering={FadeInUp.delay(600).duration(400)} style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 10, color: "rgba(224, 122, 95, 0.6)", textTransform: "uppercase", letterSpacing: 1.5, marginLeft: 8, marginBottom: 8 }}>
            Danger Zone
          </Text>
          <View
            style={{
              backgroundColor: "#FFF",
              borderRadius: 16,
              overflow: "hidden",
              shadowColor: "#3D405B",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <SettingsRow
              icon="delete-forever"
              iconBg="rgba(224, 122, 95, 0.1)"
              iconColor="#E07A5F"
              title="Reset App"
              subtitle="Delete all data and start fresh"
              onPress={handleResetApp}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(600).duration(400)} style={{ alignItems: 'center', marginTop: 32 }}>
          <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 10, color: 'rgba(61, 64, 91, 0.3)', letterSpacing: 0.5 }}>
            Tether v1.0.2 - Made with Love
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};
