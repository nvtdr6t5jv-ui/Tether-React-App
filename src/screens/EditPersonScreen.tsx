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
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useApp } from '../context/AppContext';
import { OrbitId, ORBITS } from '../types';
import { SwipeableScreen } from '../components/SwipeableScreen';

interface EditPersonScreenProps {
  friendId: string;
  onBack: () => void;
  onSave: () => void;
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export const EditPersonScreen: React.FC<EditPersonScreenProps> = ({
  friendId,
  onBack,
  onSave,
}) => {
  const { getFriendById, updateFriend } = useApp();
  const friend = getFriendById(friendId);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [selectedOrbit, setSelectedOrbit] = useState<OrbitId>('close');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (friend) {
      setName(friend.name);
      setPhone(friend.phone || '');
      setBirthday(friend.birthday || '');
      setSelectedOrbit(friend.orbitId);
      setIsFavorite(friend.isFavorite);
    }
  }, [friend]);

  if (!friend) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F4F1DE', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 16, color: '#3D405B' }}>
          Friend not found
        </Text>
        <TouchableOpacity onPress={onBack} style={{ marginTop: 16, padding: 12 }}>
          <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', color: '#E07A5F' }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const canSave = name.trim().length > 0;

  const handleSave = async () => {
    if (!canSave) return;

    try {
      await updateFriend(friendId, {
        name: name.trim(),
        initials: getInitials(name),
        phone: phone.trim() || undefined,
        birthday: birthday.trim() || undefined,
        orbitId: selectedOrbit,
        isFavorite,
      });
      onSave();
    } catch (error) {
      Alert.alert('Error', 'Failed to update connection. Please try again.');
    }
  };

  return (
    <SwipeableScreen onSwipeBack={onBack}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F4F1DE' }} edges={['top']}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 24,
            paddingVertical: 12,
            backgroundColor: 'rgba(244, 241, 222, 0.95)',
            zIndex: 10,
          }}
        >
          <TouchableOpacity onPress={onBack}>
            <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#81B29A' }}>
              Cancel
            </Text>
          </TouchableOpacity>
          <Text style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 18, color: '#3D405B' }}>
            Edit
          </Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={!canSave}
          style={{
            backgroundColor: canSave ? '#E07A5F' : 'rgba(224, 122, 95, 0.4)',
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 9999,
          }}
        >
          <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: '#FFF' }}>
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={{
            backgroundColor: '#FFF',
            borderRadius: 24,
            padding: 32,
            alignItems: 'center',
            shadowColor: '#3D405B',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.06,
            shadowRadius: 12,
            elevation: 3,
          }}
        >
          <TouchableOpacity
            onPress={() => setIsFavorite(!isFavorite)}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
            }}
          >
            <MaterialCommunityIcons
              name={isFavorite ? 'star' : 'star-outline'}
              size={28}
              color={isFavorite ? '#E9C46A' : 'rgba(61, 64, 91, 0.3)'}
            />
          </TouchableOpacity>

          <View
            style={{
              width: 128,
              height: 128,
              borderRadius: 64,
              backgroundColor: ORBITS.find(o => o.id === selectedOrbit)?.color || '#81B29A',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 16,
            }}
          >
            <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 40, color: '#FFF' }}>
              {getInitials(name || friend.name)}
            </Text>
          </View>

          <View style={{ width: '100%', marginTop: 32 }}>
            <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, color: 'rgba(61, 64, 91, 0.4)', textTransform: 'uppercase', letterSpacing: 1.5, textAlign: 'center', marginBottom: 8 }}>
              Name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter name"
              placeholderTextColor="rgba(61, 64, 91, 0.3)"
              style={{
                fontFamily: 'PlusJakartaSans_700Bold',
                fontSize: 24,
                color: '#3D405B',
                textAlign: 'center',
                paddingVertical: 8,
              }}
            />
          </View>

          <View style={{ width: '100%', marginTop: 24 }}>
            <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, color: 'rgba(61, 64, 91, 0.4)', textTransform: 'uppercase', letterSpacing: 1.5, textAlign: 'center', marginBottom: 8 }}>
              Phone
            </Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="+1 (555) 000-0000"
              placeholderTextColor="rgba(61, 64, 91, 0.3)"
              keyboardType="phone-pad"
              style={{
                fontFamily: 'PlusJakartaSans_700Bold',
                fontSize: 18,
                color: '#3D405B',
                textAlign: 'center',
                paddingVertical: 8,
              }}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(400)} style={{ marginTop: 24 }}>
          <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: 'rgba(61, 64, 91, 0.8)', textTransform: 'uppercase', letterSpacing: 1, marginLeft: 8, marginBottom: 12 }}>
            Orbit
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {ORBITS.map((orbit) => (
              <TouchableOpacity
                key={orbit.id}
                onPress={() => setSelectedOrbit(orbit.id)}
                style={{
                  flex: 1,
                  backgroundColor: selectedOrbit === orbit.id ? '#E07A5F' : '#FFF',
                  padding: 12,
                  borderRadius: 16,
                  alignItems: 'center',
                  gap: 4,
                  shadowColor: selectedOrbit === orbit.id ? '#E07A5F' : '#3D405B',
                  shadowOffset: { width: 0, height: selectedOrbit === orbit.id ? 8 : 4 },
                  shadowOpacity: selectedOrbit === orbit.id ? 0.3 : 0.06,
                  shadowRadius: selectedOrbit === orbit.id ? 16 : 12,
                  elevation: selectedOrbit === orbit.id ? 8 : 3,
                  transform: [{ scale: selectedOrbit === orbit.id ? 1.05 : 1 }],
                }}
              >
                <Text
                  style={{
                    fontFamily: 'PlusJakartaSans_700Bold',
                    fontSize: 14,
                    color: selectedOrbit === orbit.id ? '#FFF' : '#3D405B',
                  }}
                >
                  {orbit.name}
                </Text>
                <Text
                  style={{
                    fontFamily: 'PlusJakartaSans_600SemiBold',
                    fontSize: 10,
                    color: selectedOrbit === orbit.id ? 'rgba(255,255,255,0.9)' : 'rgba(61, 64, 91, 0.5)',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  {orbit.frequency}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(300).duration(400)}
          style={{
            marginTop: 24,
            backgroundColor: '#FFF',
            borderRadius: 24,
            overflow: 'hidden',
            shadowColor: '#3D405B',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.06,
            shadowRadius: 12,
            elevation: 3,
          }}
        >
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 20,
            }}
          >
            <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: '#3D405B' }}>
              Birthday
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <TextInput
                value={birthday}
                onChangeText={setBirthday}
                placeholder="Add Date"
                placeholderTextColor="rgba(61, 64, 91, 0.4)"
                style={{
                  fontFamily: 'PlusJakartaSans_500Medium',
                  fontSize: 14,
                  color: '#3D405B',
                }}
              />
              <MaterialCommunityIcons name="calendar" size={20} color="#E07A5F" />
            </View>
          </TouchableOpacity>
        </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </SwipeableScreen>
  );
};
