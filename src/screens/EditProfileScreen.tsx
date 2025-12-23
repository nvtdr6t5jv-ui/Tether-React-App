import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { SwipeableScreen } from '../components/SwipeableScreen';
import { UserAvatar } from '../components/UserAvatar';

interface EditProfileScreenProps {
  onBack: () => void;
  onSave: () => void;
}

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ onBack, onSave }) => {
  const { userProfile, updateUserProfile, premiumStatus } = useApp();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [photo, setPhoto] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setPhoto(userProfile.photo);
    }
  }, [userProfile]);

  const canSave = name.trim().length > 0;

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library to change your profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!canSave) return;

    try {
      await updateUserProfile({
        name: name.trim(),
        photo: photo,
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
            onPress={handlePickImage}
            style={{
              marginBottom: 24,
              position: 'relative',
            }}
          >
            {photo ? (
              <View style={{ position: 'relative' }}>
                <Image
                  source={{ uri: photo }}
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    borderWidth: premiumStatus.isPremium ? 3 : 2,
                    borderColor: premiumStatus.isPremium ? '#FFD700' : '#FFF',
                  }}
                />
              </View>
            ) : (
              <UserAvatar
                name={name.trim() || userProfile?.name}
                photo={undefined}
                size={120}
                isPremium={premiumStatus.isPremium}
                fontSize={40}
              />
            )}
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
              Email
            </Text>
            <View
              style={{
                backgroundColor: 'rgba(0,0,0,0.04)',
                borderRadius: 12,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 16, color: 'rgba(61, 64, 91, 0.6)' }}>
                {user?.email || 'Not available'}
              </Text>
              <MaterialCommunityIcons name="lock" size={16} color="rgba(61, 64, 91, 0.3)" />
            </View>
            <Text style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 11, color: 'rgba(61, 64, 91, 0.4)', marginTop: 6, marginLeft: 4 }}>
              Email is linked to your account and cannot be changed
            </Text>
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
