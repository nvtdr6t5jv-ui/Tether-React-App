import React from 'react';
import { View, Text, TouchableOpacity, Modal, Linking, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp, SlideInUp } from 'react-native-reanimated';

export type PermissionType = 'contacts' | 'calendar' | 'notifications';

interface PermissionRequestModalProps {
  visible: boolean;
  type: PermissionType;
  onAllow: () => void;
  onDeny: () => void;
  onClose: () => void;
  isDenied?: boolean;
}

const permissionInfo: Record<PermissionType, {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description: string;
  benefits: string[];
  color: string;
}> = {
  contacts: {
    icon: 'contacts',
    title: 'Access Your Contacts',
    description: 'Tether needs access to your contacts to help you find and add friends quickly.',
    benefits: [
      'Quickly import friends from your phone',
      'Auto-fill contact details',
      'Never stored on our servers',
    ],
    color: '#E07A5F',
  },
  calendar: {
    icon: 'calendar',
    title: 'Sync Your Calendar',
    description: 'Connect your calendar to schedule meetups and never miss important dates.',
    benefits: [
      'See friend events at a glance',
      'Schedule hangouts easily',
      'Birthday reminders',
    ],
    color: '#6366F1',
  },
  notifications: {
    icon: 'bell-ring',
    title: 'Enable Notifications',
    description: 'Get gentle nudges to stay connected with the people who matter most.',
    benefits: [
      'Daily connection reminders',
      'Birthday alerts',
      'Streak notifications',
    ],
    color: '#81B29A',
  },
};

export const PermissionRequestModal: React.FC<PermissionRequestModalProps> = ({
  visible,
  type,
  onAllow,
  onDeny,
  onClose,
  isDenied = false,
}) => {
  const info = permissionInfo[type];

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <Animated.View
          entering={SlideInUp.duration(400).springify()}
          style={{
            backgroundColor: '#FFF',
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            paddingTop: 12,
            paddingBottom: 40,
          }}
        >
          <View style={{ width: 40, height: 4, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 2, alignSelf: 'center', marginBottom: 24 }} />

          <View style={{ paddingHorizontal: 24 }}>
            <Animated.View
              entering={FadeInUp.delay(100).duration(400)}
              style={{
                width: 80,
                height: 80,
                borderRadius: 24,
                backgroundColor: `${info.color}15`,
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: 'center',
                marginBottom: 24,
              }}
            >
              <MaterialCommunityIcons name={info.icon} size={40} color={info.color} />
            </Animated.View>

            <Animated.Text
              entering={FadeInUp.delay(200).duration(400)}
              style={{
                fontFamily: 'Fraunces_600SemiBold',
                fontSize: 28,
                color: '#3D405B',
                textAlign: 'center',
                marginBottom: 12,
              }}
            >
              {info.title}
            </Animated.Text>

            <Animated.Text
              entering={FadeInUp.delay(300).duration(400)}
              style={{
                fontFamily: 'PlusJakartaSans_400Regular',
                fontSize: 16,
                color: 'rgba(61, 64, 91, 0.7)',
                textAlign: 'center',
                marginBottom: 24,
                lineHeight: 24,
              }}
            >
              {info.description}
            </Animated.Text>

            <Animated.View
              entering={FadeInUp.delay(400).duration(400)}
              style={{
                backgroundColor: '#F4F1DE',
                borderRadius: 16,
                padding: 16,
                marginBottom: 32,
              }}
            >
              {info.benefits.map((benefit, index) => (
                <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: index < info.benefits.length - 1 ? 12 : 0 }}>
                  <MaterialCommunityIcons name="check-circle" size={20} color="#81B29A" />
                  <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14, color: '#3D405B', flex: 1 }}>
                    {benefit}
                  </Text>
                </View>
              ))}
            </Animated.View>

            {isDenied ? (
              <>
                <Text style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, color: 'rgba(61, 64, 91, 0.6)', textAlign: 'center', marginBottom: 16 }}>
                  Permission was previously denied. Please enable it in Settings.
                </Text>
                <TouchableOpacity
                  onPress={openSettings}
                  style={{
                    height: 56,
                    backgroundColor: info.color,
                    borderRadius: 9999,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12,
                  }}
                >
                  <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#FFF' }}>
                    Open Settings
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onClose}
                  style={{
                    height: 56,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 16, color: 'rgba(61, 64, 91, 0.6)' }}>
                    Maybe Later
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  onPress={onAllow}
                  style={{
                    height: 56,
                    backgroundColor: info.color,
                    borderRadius: 9999,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: info.color,
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 16,
                    elevation: 6,
                    marginBottom: 12,
                  }}
                >
                  <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#FFF' }}>
                    Allow Access
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onDeny}
                  style={{
                    height: 56,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 16, color: 'rgba(61, 64, 91, 0.6)' }}>
                    Not Now
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};
