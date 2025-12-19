import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Contacts from 'expo-contacts';
import { useApp } from '../context/AppContext';
import { OrbitId, ORBITS } from '../types';
import { SwipeableScreen } from '../components/SwipeableScreen';

interface NewConnectionScreenProps {
  onBack: () => void;
  onSave: (friendId: string) => void;
  onPremiumRequired?: () => void;
}

interface DeviceContact {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  photo?: string | null;
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export const NewConnectionScreen: React.FC<NewConnectionScreenProps> = ({
  onBack,
  onSave,
  onPremiumRequired,
}) => {
  const { addFriend, canAddMoreFriends, getRemainingFreeSlots, premiumStatus } = useApp();
  
  React.useEffect(() => {
    if (!canAddMoreFriends() && onPremiumRequired) {
      onBack();
      setTimeout(() => onPremiumRequired(), 100);
    }
  }, []);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [photo, setPhoto] = useState<string | undefined>();
  const [birthday, setBirthday] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedOrbit, setSelectedOrbit] = useState<OrbitId>('close');
  const [lastSpoken, setLastSpoken] = useState<'today' | 'week' | 'month' | 'longer'>('today');
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [deviceContacts, setDeviceContacts] = useState<DeviceContact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [contactSearch, setContactSearch] = useState('');

  const canSave = name.trim().length > 0;

  const getLastContactDate = (): Date | null => {
    const now = new Date();
    switch (lastSpoken) {
      case 'today':
        return now;
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case 'longer':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      default:
        return now;
    }
  };

  const getNextNudgeDate = (): Date => {
    const orbit = ORBITS.find(o => o.id === selectedOrbit);
    const days = orbit?.daysInterval || 14;
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  };

  const handleSave = async () => {
    if (!canSave) return;

    try {
      const friend = await addFriend({
        name: name.trim(),
        initials: getInitials(name),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        photo: photo,
        birthday: birthday.trim() || undefined,
        orbitId: selectedOrbit,
        lastContact: getLastContactDate(),
        nextNudge: getNextNudgeDate(),
        isFavorite: selectedOrbit === 'inner',
        tags: [],
      });

      onSave(friend.id);
    } catch (error) {
      Alert.alert('Error', 'Failed to add connection. Please try again.');
    }
  };

  const handleImportContacts = async () => {
    setLoadingContacts(true);
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to contacts to import.');
        setLoadingContacts(false);
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Emails,
          Contacts.Fields.Image,
        ],
        sort: Contacts.SortTypes.FirstName,
      });

      const contacts: DeviceContact[] = data
        .filter(c => c.name && c.name.trim().length > 0)
        .map(c => {
          let photoUri = c.image?.uri || null;
          if (photoUri && !photoUri.startsWith('file://')) {
            photoUri = `file://${photoUri}`;
          }
          return {
            id: c.id || `${Date.now()}-${Math.random()}`,
            name: c.name || '',
            phone: c.phoneNumbers?.[0]?.number,
            email: c.emails?.[0]?.email,
            photo: photoUri,
          };
        });

      setDeviceContacts(contacts);
      setShowContactPicker(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to load contacts.');
    } finally {
      setLoadingContacts(false);
    }
  };

  const handleSelectContact = (contact: DeviceContact) => {
    setName(contact.name);
    setPhone(contact.phone || '');
    setEmail(contact.email || '');
    setPhoto(contact.photo || undefined);
    setShowContactPicker(false);
    setContactSearch('');
  };

  const filteredContacts = contactSearch.trim()
    ? deviceContacts.filter(c => c.name.toLowerCase().includes(contactSearch.toLowerCase()))
    : deviceContacts;

  const renderContactItem = ({ item }: { item: DeviceContact }) => (
    <TouchableOpacity
      onPress={() => handleSelectContact(item)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
      }}
    >
      {item.photo ? (
        <Image
          source={{ uri: item.photo }}
          style={{ width: 48, height: 48, borderRadius: 24 }}
        />
      ) : (
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: 'rgba(129, 178, 154, 0.2)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#81B29A' }}>
            {getInitials(item.name)}
          </Text>
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 16, color: '#3D405B' }}>
          {item.name}
        </Text>
        {item.phone && (
          <Text style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: 'rgba(61, 64, 91, 0.5)' }}>
            {item.phone}
          </Text>
        )}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="rgba(61, 64, 91, 0.3)" />
    </TouchableOpacity>
  );

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
            New Connection
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
            onPress={handleImportContacts}
            disabled={loadingContacts}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {loadingContacts ? (
              <ActivityIndicator size="small" color="#81B29A" />
            ) : (
              <>
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, color: '#81B29A', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Import from Contacts
                </Text>
                <MaterialCommunityIcons name="import" size={16} color="#81B29A" />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              width: 128,
              height: 128,
              borderRadius: 64,
              backgroundColor: 'rgba(0,0,0,0.02)',
              borderWidth: photo ? 0 : 2,
              borderStyle: 'dashed',
              borderColor: 'rgba(61, 64, 91, 0.15)',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 16,
              overflow: 'hidden',
            }}
          >
            {photo ? (
              <Image source={{ uri: photo }} style={{ width: 128, height: 128, borderRadius: 64 }} />
            ) : name.trim() ? (
              <View
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 64,
                  backgroundColor: ORBITS.find(o => o.id === selectedOrbit)?.color || '#81B29A',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 40, color: '#FFF' }}>
                  {getInitials(name)}
                </Text>
              </View>
            ) : (
              <>
                <MaterialCommunityIcons name="camera-plus" size={36} color="rgba(61, 64, 91, 0.3)" />
                <View
                  style={{
                    position: 'absolute',
                    bottom: 4,
                    right: 4,
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: '#81B29A',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 4,
                    borderColor: '#FFF',
                  }}
                >
                  <MaterialCommunityIcons name="plus" size={14} color="#FFF" />
                </View>
              </>
            )}
          </TouchableOpacity>

          <View style={{ width: '100%', marginTop: 32 }}>
            <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, color: 'rgba(61, 64, 91, 0.4)', textTransform: 'uppercase', letterSpacing: 1.5, textAlign: 'center', marginBottom: 8 }}>
              Name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g., Sarah J."
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
            Assign Orbit
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
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(0,0,0,0.05)',
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

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 20,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(0,0,0,0.05)',
            }}
          >
            <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: '#3D405B' }}>
              Last Spoken
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['today', 'week', 'month'] as const).map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => setLastSpoken(option)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 9999,
                    backgroundColor: lastSpoken === option ? '#81B29A' : 'rgba(0,0,0,0.05)',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'PlusJakartaSans_700Bold',
                      fontSize: 12,
                      color: lastSpoken === option ? '#FFF' : '#3D405B',
                      textTransform: 'capitalize',
                    }}
                  >
                    {option === 'week' ? '1w' : option === 'month' ? '1mo' : option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ padding: 20 }}>
            <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: '#3D405B', marginBottom: 12 }}>
              Notes
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Gift ideas, job details, hobbies..."
              placeholderTextColor="rgba(61, 64, 91, 0.3)"
              multiline
              style={{
                fontFamily: 'PlusJakartaSans_400Regular',
                fontSize: 14,
                color: '#3D405B',
                lineHeight: 20,
                minHeight: 80,
              }}
              textAlignVertical="top"
            />
          </View>
        </Animated.View>
        </ScrollView>

        <Modal
          visible={showContactPicker}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowContactPicker(false)}
        >
          <SafeAreaView style={{ flex: 1, backgroundColor: '#F4F1DE' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 }}>
              <TouchableOpacity onPress={() => { setShowContactPicker(false); setContactSearch(''); }}>
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#81B29A' }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <Text style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 18, color: '#3D405B' }}>
                Select Contact
              </Text>
              <View style={{ width: 60 }} />
            </View>

            <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#FFF',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                }}
              >
                <MaterialCommunityIcons name="magnify" size={20} color="rgba(61, 64, 91, 0.4)" />
                <TextInput
                  value={contactSearch}
                  onChangeText={setContactSearch}
                  placeholder="Search contacts..."
                  placeholderTextColor="rgba(61, 64, 91, 0.4)"
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    paddingHorizontal: 12,
                    fontFamily: 'PlusJakartaSans_500Medium',
                    fontSize: 16,
                    color: '#3D405B',
                  }}
                />
              </View>
            </View>

            <FlatList
              data={filteredContacts}
              keyExtractor={item => item.id}
              renderItem={renderContactItem}
              contentContainerStyle={{ backgroundColor: '#FFF' }}
              ItemSeparatorComponent={() => null}
            />
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </SwipeableScreen>
  );
};
