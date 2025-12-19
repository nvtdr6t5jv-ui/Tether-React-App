import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useApp } from '../context/AppContext';
import { NotificationFrequency } from '../types';

interface NotificationsScreenProps {
  onBack: () => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ onBack }) => {
  const { userSettings, updateUserSettings } = useApp();

  const frequencies: { value: NotificationFrequency; label: string; description: string }[] = [
    { value: 'realtime', label: 'Real-time', description: 'Get notified immediately' },
    { value: 'daily', label: 'Daily Digest', description: 'One summary each day' },
    { value: 'weekly', label: 'Weekly Digest', description: 'One summary each week' },
    { value: 'off', label: 'Off', description: 'No notifications' },
  ];

  const times = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '18:00', '20:00', '21:00'];

  const handleToggle = async (value: boolean) => {
    await updateUserSettings({ notificationsEnabled: value });
  };

  const handleFrequencyChange = async (frequency: NotificationFrequency) => {
    await updateUserSettings({ notificationFrequency: frequency });
  };

  const handleTimeChange = async (time: string) => {
    await updateUserSettings({ notificationTime: time });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7F8F6' }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 12 }}>
        <TouchableOpacity
          onPress={onBack}
          style={{ padding: 8, marginLeft: -8, borderRadius: 20 }}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#3D405B" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: '#3D405B' }}>
          Notifications
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={{
            backgroundColor: '#FFF',
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            shadowColor: '#3D405B',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.06,
            shadowRadius: 12,
            elevation: 3,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(224, 122, 95, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MaterialCommunityIcons name="bell" size={20} color="#E07A5F" />
              </View>
              <View>
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#3D405B' }}>
                  Enable Notifications
                </Text>
                <Text style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: 'rgba(61, 64, 91, 0.6)' }}>
                  Get reminded to connect
                </Text>
              </View>
            </View>
            <Switch
              value={userSettings.notificationsEnabled}
              onValueChange={handleToggle}
              trackColor={{ false: 'rgba(0,0,0,0.1)', true: '#81B29A' }}
              thumbColor="#FFF"
            />
          </View>
        </Animated.View>

        {userSettings.notificationsEnabled && (
          <>
            <Animated.View entering={FadeInUp.delay(200).duration(400)}>
              <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: 'rgba(61, 64, 91, 0.5)', textTransform: 'uppercase', letterSpacing: 1, marginLeft: 8, marginBottom: 12 }}>
                Frequency
              </Text>
              <View
                style={{
                  backgroundColor: '#FFF',
                  borderRadius: 16,
                  overflow: 'hidden',
                  shadowColor: '#3D405B',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.06,
                  shadowRadius: 12,
                  elevation: 3,
                  marginBottom: 24,
                }}
              >
                {frequencies.map((freq, index) => (
                  <TouchableOpacity
                    key={freq.value}
                    onPress={() => handleFrequencyChange(freq.value)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 16,
                      borderBottomWidth: index < frequencies.length - 1 ? 1 : 0,
                      borderBottomColor: 'rgba(0,0,0,0.05)',
                    }}
                  >
                    <View>
                      <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 15, color: '#3D405B' }}>
                        {freq.label}
                      </Text>
                      <Text style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: 'rgba(61, 64, 91, 0.5)', marginTop: 2 }}>
                        {freq.description}
                      </Text>
                    </View>
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor: userSettings.notificationFrequency === freq.value ? '#81B29A' : 'rgba(61, 64, 91, 0.2)',
                        backgroundColor: userSettings.notificationFrequency === freq.value ? '#81B29A' : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {userSettings.notificationFrequency === freq.value && (
                        <MaterialCommunityIcons name="check" size={14} color="#FFF" />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>

            {(userSettings.notificationFrequency === 'daily' || userSettings.notificationFrequency === 'weekly') && (
              <Animated.View entering={FadeInUp.delay(300).duration(400)}>
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: 'rgba(61, 64, 91, 0.5)', textTransform: 'uppercase', letterSpacing: 1, marginLeft: 8, marginBottom: 12 }}>
                  Delivery Time
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}
                >
                  {times.map((time) => (
                    <TouchableOpacity
                      key={time}
                      onPress={() => handleTimeChange(time)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        borderRadius: 12,
                        backgroundColor: userSettings.notificationTime === time ? '#E07A5F' : '#FFF',
                        shadowColor: userSettings.notificationTime === time ? '#E07A5F' : '#3D405B',
                        shadowOffset: { width: 0, height: userSettings.notificationTime === time ? 4 : 2 },
                        shadowOpacity: userSettings.notificationTime === time ? 0.3 : 0.06,
                        shadowRadius: userSettings.notificationTime === time ? 8 : 4,
                        elevation: userSettings.notificationTime === time ? 4 : 2,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: 'PlusJakartaSans_700Bold',
                          fontSize: 14,
                          color: userSettings.notificationTime === time ? '#FFF' : '#3D405B',
                        }}
                      >
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </Animated.View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
