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
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useApp } from '../context/AppContext';
import { SwipeableScreen } from '../components/SwipeableScreen';

interface EditProfileScreenProps {
  onBack: () => void;
  onSave: () => void;
}

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ onBack, onSave }) => {
  const { userProfile, updateUserProfile } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setEmail(userProfile.email || '');
    }
  }, [userProfile]);

  const canSave = name.trim().length > 0;

  const handleSave = async () => {
    if (!canSave) return;

    try {
      await updateUserProfile({
        name: name.trim(),
        email: email.trim() || undefined,
      });
      onSave();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
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
          }}
        >
          <TouchableOpacity onPress={onBack}>
          <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#81B29A' }}>
            Cancel
          </Text>
        </TouchableOpacity>
        <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: '#3D405B' }}>
          Edit Profile
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
        contentContainerStyle={{ padding: 20 }}
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
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: '#E07A5F',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
            }}
          >
            <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 40, color: '#FFF' }}>
              {name.trim() ? name.trim().charAt(0).toUpperCase() : 'A'}
            </Text>
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: '#81B29A',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 4,
                borderColor: '#FFF',
              }}
            >
              <MaterialCommunityIcons name="camera" size={16} color="#FFF" />
            </View>
          </TouchableOpacity>

          <View style={{ width: '100%', marginBottom: 20 }}>
            <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: 'rgba(61, 64, 91, 0.5)', marginBottom: 8 }}>
              Name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor="rgba(61, 64, 91, 0.3)"
              style={{
                backgroundColor: 'rgba(0,0,0,0.02)',
                borderRadius: 12,
                padding: 16,
                fontFamily: 'PlusJakartaSans_600SemiBold',
                fontSize: 16,
                color: '#3D405B',
              }}
            />
          </View>

          <View style={{ width: '100%' }}>
            <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: 'rgba(61, 64, 91, 0.5)', marginBottom: 8 }}>
              Email (optional)
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor="rgba(61, 64, 91, 0.3)"
              keyboardType="email-address"
              autoCapitalize="none"
              style={{
                backgroundColor: 'rgba(0,0,0,0.02)',
                borderRadius: 12,
                padding: 16,
                fontFamily: 'PlusJakartaSans_600SemiBold',
                fontSize: 16,
                color: '#3D405B',
              }}
            />
          </View>
        </Animated.View>

        <View style={{ marginTop: 32, alignItems: 'center' }}>
          <Text style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: 'rgba(61, 64, 91, 0.4)', textAlign: 'center', lineHeight: 18 }}>
            Member since {userProfile?.memberSince ? new Date(userProfile.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'September 2024'}
          </Text>
        </View>
        </ScrollView>
      </SafeAreaView>
    </SwipeableScreen>
  );
};
