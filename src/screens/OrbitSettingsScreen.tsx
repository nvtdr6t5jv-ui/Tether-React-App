import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useApp } from '../context/AppContext';
import { Orbit, ORBITS } from '../types';

interface OrbitSettingsScreenProps {
  onBack: () => void;
}

const FREQUENCY_OPTIONS = [
  { label: 'Daily', days: 1 },
  { label: 'Every 3 days', days: 3 },
  { label: 'Weekly', days: 7 },
  { label: 'Bi-weekly', days: 14 },
  { label: 'Monthly', days: 30 },
  { label: 'Bi-monthly', days: 60 },
  { label: 'Quarterly', days: 90 },
  { label: 'Semi-annually', days: 180 },
];

const getFrequencyLabel = (days: number): string => {
  const option = FREQUENCY_OPTIONS.find(o => o.days === days);
  if (option) return option.label;
  if (days === 1) return 'Daily';
  if (days < 7) return `Every ${days} days`;
  if (days === 7) return 'Weekly';
  if (days < 30) return `Every ${Math.round(days / 7)} weeks`;
  if (days === 30) return 'Monthly';
  if (days < 90) return `Every ${Math.round(days / 30)} months`;
  return `Every ${Math.round(days / 30)} months`;
};

export const OrbitSettingsScreen: React.FC<OrbitSettingsScreenProps> = ({ onBack }) => {
  const { getOrbits, updateCustomOrbits, premiumStatus } = useApp();
  const [orbits, setOrbits] = useState<Orbit[]>(getOrbits());
  const [editingOrbit, setEditingOrbit] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setOrbits(getOrbits());
  }, []);

  const handleUpdateOrbit = (orbitId: string, updates: Partial<Orbit>) => {
    setOrbits(prev => prev.map(o => o.id === orbitId ? { ...o, ...updates } : o));
    setHasChanges(true);
  };

  const handleSave = async () => {
    await updateCustomOrbits(orbits);
    setHasChanges(false);
    Alert.alert('Saved', 'Your orbit settings have been updated.');
  };

  const handleReset = () => {
    Alert.alert(
      'Reset to Default',
      'This will reset all orbits to their default settings. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setOrbits(ORBITS);
            await updateCustomOrbits(ORBITS);
            setHasChanges(false);
          },
        },
      ]
    );
  };

  if (!premiumStatus.isPremium) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F7F8F6' }} edges={['top']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <MaterialCommunityIcons name="lock" size={64} color="rgba(61, 64, 91, 0.3)" />
          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 24, color: '#3D405B', marginTop: 24, textAlign: 'center' }}>
            Premium Feature
          </Text>
          <Text style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 16, color: 'rgba(61, 64, 91, 0.6)', marginTop: 12, textAlign: 'center' }}>
            Upgrade to Premium to customize your orbit settings.
          </Text>
          <TouchableOpacity
            onPress={onBack}
            style={{ marginTop: 32, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#81B29A', borderRadius: 9999 }}
          >
            <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#FFF' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7F8F6' }} edges={['top']}>
      <Animated.View entering={FadeInDown.duration(400)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
        <TouchableOpacity onPress={onBack} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <MaterialCommunityIcons name="chevron-left" size={24} color="#3D405B" />
          <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 16, color: '#3D405B' }}>Back</Text>
        </TouchableOpacity>
        <Text style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 20, color: '#3D405B' }}>
          Orbit Settings
        </Text>
        <TouchableOpacity onPress={handleReset}>
          <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14, color: '#E07A5F' }}>Reset</Text>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(100).duration(400)}>
          <Text style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, color: 'rgba(61, 64, 91, 0.6)', marginBottom: 24 }}>
            Customize how often you want to connect with people in each orbit. These settings help Tether remind you at the right time.
          </Text>
        </Animated.View>

        {orbits.map((orbit, index) => (
          <Animated.View
            key={orbit.id}
            entering={FadeInUp.delay(150 + index * 100).duration(400)}
            style={{
              backgroundColor: '#FFF',
              borderRadius: 20,
              padding: 20,
              marginBottom: 16,
              shadowColor: '#3D405B',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.06,
              shadowRadius: 12,
              elevation: 3,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: orbit.color,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MaterialCommunityIcons
                  name={orbit.id === 'inner' ? 'heart' : orbit.id === 'close' ? 'account-group' : 'account-multiple'}
                  size={24}
                  color="#FFF"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: '#3D405B' }}>
                  {orbit.name}
                </Text>
                <Text style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, color: 'rgba(61, 64, 91, 0.5)' }}>
                  {orbit.description}
                </Text>
              </View>
            </View>

            <View style={{ gap: 16 }}>
              <View>
                <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12, color: 'rgba(61, 64, 91, 0.5)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Name
                </Text>
                <TextInput
                  value={orbit.name}
                  onChangeText={(text) => handleUpdateOrbit(orbit.id, { name: text })}
                  style={{
                    backgroundColor: '#F7F8F6',
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontFamily: 'PlusJakartaSans_500Medium',
                    fontSize: 16,
                    color: '#3D405B',
                  }}
                />
              </View>

              <View>
                <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12, color: 'rgba(61, 64, 91, 0.5)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Reminder Frequency
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {FREQUENCY_OPTIONS.map((option) => {
                    const isSelected = orbit.daysInterval === option.days;
                    return (
                      <TouchableOpacity
                        key={option.days}
                        onPress={() => handleUpdateOrbit(orbit.id, { daysInterval: option.days, frequency: option.label })}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 10,
                          borderRadius: 9999,
                          backgroundColor: isSelected ? orbit.color : '#F7F8F6',
                          borderWidth: isSelected ? 0 : 1,
                          borderColor: 'rgba(61, 64, 91, 0.1)',
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: isSelected ? 'PlusJakartaSans_700Bold' : 'PlusJakartaSans_500Medium',
                            fontSize: 13,
                            color: isSelected ? '#FFF' : '#3D405B',
                          }}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 }}>
                <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14, color: 'rgba(61, 64, 91, 0.6)' }}>
                  Current: {getFrequencyLabel(orbit.daysInterval)}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <MaterialCommunityIcons name="bell-outline" size={16} color={orbit.color} />
                  <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13, color: orbit.color }}>
                    Every {orbit.daysInterval} days
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        ))}
      </ScrollView>

      {hasChanges && (
        <Animated.View
          entering={FadeInUp.duration(300)}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 24,
            paddingBottom: 40,
            backgroundColor: '#FFF',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <TouchableOpacity
            onPress={handleSave}
            style={{
              backgroundColor: '#81B29A',
              paddingVertical: 16,
              borderRadius: 16,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#FFF' }}>
              Save Changes
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};
