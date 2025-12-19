import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useApp } from '../context/AppContext';
import { ThemeMode } from '../types';
import { SwipeableScreen } from '../components/SwipeableScreen';

interface AppearanceScreenProps {
  onBack: () => void;
}

export const AppearanceScreen: React.FC<AppearanceScreenProps> = ({ onBack }) => {
  const { userSettings, updateUserSettings } = useApp();

  const themes: { value: ThemeMode; label: string; icon: string; description: string }[] = [
    { value: 'light', label: 'Light', icon: 'white-balance-sunny', description: 'Always use light mode' },
    { value: 'dark', label: 'Dark', icon: 'weather-night', description: 'Always use dark mode' },
    { value: 'system', label: 'System', icon: 'cellphone', description: 'Follow system settings' },
  ];

  const handleThemeChange = async (theme: ThemeMode) => {
    await updateUserSettings({ theme });
  };

  return (
    <SwipeableScreen onSwipeBack={onBack}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F7F8F6' }} edges={['top']}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 12 }}>
          <TouchableOpacity
            onPress={onBack}
            style={{ padding: 8, marginLeft: -8, borderRadius: 20 }}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#3D405B" />
          </TouchableOpacity>
          <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: '#3D405B' }}>
            Appearance
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
        >
        <Animated.View entering={FadeInDown.duration(400)}>
          <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: 'rgba(61, 64, 91, 0.5)', textTransform: 'uppercase', letterSpacing: 1, marginLeft: 8, marginBottom: 12 }}>
            Theme
          </Text>
          <View style={{ gap: 12 }}>
            {themes.map((theme, index) => (
              <Animated.View
                key={theme.value}
                entering={FadeIn.delay(index * 100).duration(300)}
              >
                <TouchableOpacity
                  onPress={() => handleThemeChange(theme.value)}
                  activeOpacity={0.9}
                  style={{
                    backgroundColor: '#FFF',
                    borderRadius: 16,
                    padding: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 16,
                    borderWidth: 2,
                    borderColor: userSettings.theme === theme.value ? '#81B29A' : 'transparent',
                    shadowColor: userSettings.theme === theme.value ? '#81B29A' : '#3D405B',
                    shadowOffset: { width: 0, height: userSettings.theme === theme.value ? 8 : 4 },
                    shadowOpacity: userSettings.theme === theme.value ? 0.2 : 0.06,
                    shadowRadius: userSettings.theme === theme.value ? 16 : 12,
                    elevation: userSettings.theme === theme.value ? 6 : 3,
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: userSettings.theme === theme.value ? '#81B29A' : 'rgba(61, 64, 91, 0.1)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MaterialCommunityIcons
                      name={theme.icon as any}
                      size={24}
                      color={userSettings.theme === theme.value ? '#FFF' : '#3D405B'}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#3D405B' }}>
                      {theme.label}
                    </Text>
                    <Text style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, color: 'rgba(61, 64, 91, 0.6)', marginTop: 2 }}>
                      {theme.description}
                    </Text>
                  </View>
                  {userSettings.theme === theme.value && (
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: '#81B29A',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <MaterialCommunityIcons name="check" size={14} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(400).duration(400)} style={{ marginTop: 32 }}>
          <View
            style={{
              backgroundColor: '#F4F1DE',
              borderRadius: 16,
              padding: 20,
              alignItems: 'center',
            }}
          >
            <MaterialCommunityIcons name="information-outline" size={24} color="rgba(61, 64, 91, 0.4)" />
            <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14, color: 'rgba(61, 64, 91, 0.6)', textAlign: 'center', marginTop: 12, lineHeight: 20 }}>
              Dark mode support is coming soon. For now, the app will use light mode regardless of your selection.
            </Text>
          </View>
        </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </SwipeableScreen>
  );
};
