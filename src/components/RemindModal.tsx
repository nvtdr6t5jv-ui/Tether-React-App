import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  SlideInDown,
} from 'react-native-reanimated';

type RemindOption = 'later_today' | 'tomorrow' | 'next_week' | 'custom';

interface RemindModalProps {
  visible: boolean;
  onSelect: (option: RemindOption) => void;
  onPickDate: () => void;
  onClose: () => void;
}

const RemindOption: React.FC<{
  icon: string;
  label: string;
  selected?: boolean;
  onPress: () => void;
}> = ({ icon, label, selected, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      gap: 20,
      padding: 16,
      borderRadius: 24,
      backgroundColor: selected ? 'rgba(129, 178, 154, 0.2)' : 'transparent',
      transform: [{ scale: selected ? 0.98 : 1 }],
    }}
    activeOpacity={0.7}
  >
    <View style={{ width: 32, alignItems: 'center' }}>
      <MaterialCommunityIcons
        name={icon as any}
        size={28}
        color={selected ? '#3D405B' : 'rgba(61, 64, 91, 0.8)'}
      />
    </View>
    <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 20, color: '#3D405B', letterSpacing: -0.5 }}>
      {label}
    </Text>
  </TouchableOpacity>
);

export const RemindModal: React.FC<RemindModalProps> = ({
  visible,
  onSelect,
  onPickDate,
  onClose,
}) => {
  const [selected, setSelected] = useState<RemindOption | null>(null);

  if (!visible) return null;

  const handleSelect = (option: RemindOption) => {
    setSelected(option);
    setTimeout(() => {
      onSelect(option);
    }, 200);
  };

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 60 }}>
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(61, 64, 91, 0.2)',
        }}
        activeOpacity={1}
        onPress={onClose}
      />

      <Animated.View
        entering={SlideInDown.springify().damping(20)}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <View
          style={{
            backgroundColor: '#F4F1DE',
            borderTopLeftRadius: 40,
            borderTopRightRadius: 40,
            paddingHorizontal: 24,
            paddingBottom: 48,
            paddingTop: 16,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -10 },
            shadowOpacity: 0.1,
            shadowRadius: 40,
            elevation: 8,
          }}
        >
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <View style={{ width: 48, height: 6, backgroundColor: 'rgba(61, 64, 91, 0.1)', borderRadius: 3 }} />
          </View>

          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 32, color: '#3D405B', textAlign: 'center', marginBottom: 32 }}>
            Remind me...
          </Text>

          <View style={{ gap: 12 }}>
            <RemindOption
              icon="white-balance-sunny"
              label="Later Today"
              selected={selected === 'later_today'}
              onPress={() => handleSelect('later_today')}
            />
            <RemindOption
              icon="coffee"
              label="Tomorrow Morning"
              selected={selected === 'tomorrow'}
              onPress={() => handleSelect('tomorrow')}
            />
            <RemindOption
              icon="calendar-month"
              label="Next Week"
              selected={selected === 'next_week'}
              onPress={() => handleSelect('next_week')}
            />

            <TouchableOpacity
              onPress={onPickDate}
              style={{
                paddingVertical: 20,
                alignItems: 'center',
                marginTop: 8,
              }}
            >
              <Text
                style={{
                  fontFamily: 'PlusJakartaSans_700Bold',
                  fontSize: 18,
                  color: '#E07A5F',
                  textDecorationLine: 'underline',
                  textDecorationColor: '#E07A5F',
                }}
              >
                Pick Date...
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};
