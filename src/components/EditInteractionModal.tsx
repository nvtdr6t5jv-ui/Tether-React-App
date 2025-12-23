import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
  interpolate,
  FadeIn,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Interaction, InteractionType, INTERACTION_ICONS } from '../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface EditInteractionModalProps {
  visible: boolean;
  interaction: Interaction | null;
  friendName: string;
  onClose: () => void;
  onSave: (interaction: Interaction) => void;
  onDelete: (interactionId: string) => void;
}

const INTERACTION_TYPES: { type: InteractionType; label: string; icon: string }[] = [
  { type: 'call', label: 'Call', icon: 'phone' },
  { type: 'text', label: 'Text', icon: 'chat' },
  { type: 'video_call', label: 'Video Call', icon: 'video' },
  { type: 'in_person', label: 'In Person', icon: 'coffee' },
  { type: 'email', label: 'Email', icon: 'email' },
  { type: 'social_media', label: 'Social Media', icon: 'share-variant' },
];

export const EditInteractionModal: React.FC<EditInteractionModalProps> = ({
  visible,
  interaction,
  friendName,
  onClose,
  onSave,
  onDelete,
}) => {
  const [selectedType, setSelectedType] = useState<InteractionType>('call');
  const [note, setNote] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible && interaction) {
      setSelectedType(interaction.type);
      setNote(interaction.note || '');
      setSelectedDate(new Date(interaction.date));
      translateY.value = withTiming(0, { duration: 300 });
      backdropOpacity.value = withTiming(1, { duration: 300 });
    } else if (!visible) {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
      backdropOpacity.value = withTiming(0, { duration: 250 });
    }
  }, [visible, interaction]);

  const closeModal = () => {
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
    backdropOpacity.value = withTiming(0, { duration: 250 }, (finished) => {
      if (finished) {
        runOnJS(onClose)();
      }
    });
  };

  const handleSave = () => {
    if (!interaction) return;
    onSave({
      ...interaction,
      type: selectedType,
      note: note.trim() || undefined,
      date: selectedDate,
    });
    closeModal();
  };

  const handleDelete = () => {
    if (!interaction) return;
    onDelete(interaction.id);
    closeModal();
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
        backdropOpacity.value = interpolate(event.translationY, [0, 300], [1, 0]);
      }
    })
    .onEnd((event) => {
      if (event.translationY > 100 || event.velocityY > 500) {
        translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
        backdropOpacity.value = withTiming(0, { duration: 250 }, (finished) => {
          if (finished) {
            runOnJS(onClose)();
          }
        });
      } else {
        translateY.value = withTiming(0, { duration: 200 });
        backdropOpacity.value = withTiming(1, { duration: 200 });
      }
    });

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const formatDate = (date: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  if (!visible) return null;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(61, 64, 91, 0.4)',
          },
          animatedBackdropStyle,
        ]}
      >
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={closeModal} />
      </Animated.View>

      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: '#FFF',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: SCREEN_HEIGHT * 0.85,
            },
            animatedSheetStyle,
          ]}
        >
          <View style={{ width: 40, height: 4, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 8 }} />

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' }}>
            <TouchableOpacity onPress={closeModal}>
              <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 16, color: 'rgba(61, 64, 91, 0.5)' }}>Cancel</Text>
            </TouchableOpacity>
            <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: '#3D405B' }}>Edit Log</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#81B29A' }}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            <View style={{ backgroundColor: 'rgba(129, 178, 154, 0.1)', padding: 16, borderRadius: 12, marginBottom: 24 }}>
              <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14, color: 'rgba(61, 64, 91, 0.6)' }}>Connection with</Text>
              <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: '#3D405B', marginTop: 4 }}>{friendName}</Text>
            </View>

            <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: '#3D405B', marginBottom: 12 }}>Type</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {INTERACTION_TYPES.map((item) => (
                <TouchableOpacity
                  key={item.type}
                  onPress={() => setSelectedType(item.type)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 9999,
                    backgroundColor: selectedType === item.type ? '#81B29A' : 'rgba(0,0,0,0.05)',
                  }}
                >
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={18}
                    color={selectedType === item.type ? '#FFF' : '#3D405B'}
                  />
                  <Text
                    style={{
                      fontFamily: 'PlusJakartaSans_600SemiBold',
                      fontSize: 14,
                      color: selectedType === item.type ? '#FFF' : '#3D405B',
                    }}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: '#3D405B', marginBottom: 12 }}>Date</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'rgba(0,0,0,0.05)',
                padding: 16,
                borderRadius: 12,
                marginBottom: 24,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <MaterialCommunityIcons name="calendar" size={20} color="#3D405B" />
                <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 16, color: '#3D405B' }}>
                  {formatDate(selectedDate)}
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="rgba(61, 64, 91, 0.4)" />
            </TouchableOpacity>

            {showDatePicker && (
              <Animated.View entering={FadeIn.duration(200)} style={{ marginBottom: 24 }}>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, date) => {
                    if (Platform.OS === 'android') {
                      setShowDatePicker(false);
                    }
                    if (date) {
                      setSelectedDate(date);
                    }
                  }}
                  maximumDate={new Date()}
                  textColor="#3D405B"
                />
                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(false)}
                    style={{ alignSelf: 'center', marginTop: 8 }}
                  >
                    <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: '#81B29A' }}>Done</Text>
                  </TouchableOpacity>
                )}
              </Animated.View>
            )}

            <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: '#3D405B', marginBottom: 12 }}>Note (optional)</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Add details about this interaction..."
              placeholderTextColor="rgba(61, 64, 91, 0.4)"
              multiline
              numberOfLines={4}
              style={{
                backgroundColor: 'rgba(0,0,0,0.05)',
                padding: 16,
                borderRadius: 12,
                fontFamily: 'PlusJakartaSans_500Medium',
                fontSize: 16,
                color: '#3D405B',
                minHeight: 100,
                textAlignVertical: 'top',
                marginBottom: 32,
              }}
            />

            <TouchableOpacity
              onPress={handleDelete}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: 'rgba(224, 122, 95, 0.3)',
              }}
            >
              <MaterialCommunityIcons name="delete-outline" size={20} color="#E07A5F" />
              <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 16, color: '#E07A5F' }}>Delete This Log</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};
