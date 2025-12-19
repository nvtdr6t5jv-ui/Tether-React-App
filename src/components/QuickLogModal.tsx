import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp, SlideInRight } from 'react-native-reanimated';
import { DrawerModal } from './DrawerModal';
import { Friend, InteractionType, QUICK_TAGS, QuickTag } from '../types';

interface QuickLogModalProps {
  visible: boolean;
  onClose: () => void;
  friend: Friend;
  onLog: (type: InteractionType, tag: string, note?: string) => void;
}

const INTERACTION_TYPES: { type: InteractionType; icon: string; label: string; color: string }[] = [
  { type: 'call', icon: 'phone', label: 'Call', color: '#3B82F6' },
  { type: 'text', icon: 'chat', label: 'Text', color: '#81B29A' },
  { type: 'video_call', icon: 'video', label: 'Video', color: '#8B5CF6' },
  { type: 'in_person', icon: 'account-group', label: 'In Person', color: '#E07A5F' },
];

export const QuickLogModal: React.FC<QuickLogModalProps> = ({
  visible,
  onClose,
  friend,
  onLog,
}) => {
  const [selectedType, setSelectedType] = useState<InteractionType>('text');
  const [selectedTag, setSelectedTag] = useState<QuickTag | null>(null);
  const [note, setNote] = useState('');

  const handleLog = () => {
    onLog(selectedType, selectedTag || '', note);
    setSelectedType('text');
    setSelectedTag(null);
    setNote('');
  };

  return (
    <DrawerModal visible={visible} onClose={onClose} title={`Log with ${friend.name}`}>
      <View style={{ gap: 20 }}>
        <Animated.View entering={FadeIn.delay(100).duration(300)}>
          <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: '#3D405B', marginBottom: 12 }}>
            How did you connect?
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {INTERACTION_TYPES.map((item, index) => (
              <Animated.View key={item.type} entering={SlideInRight.delay(150 + index * 50).duration(300)} style={{ flex: 1 }}>
                <TouchableOpacity
                  onPress={() => setSelectedType(item.type)}
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    alignItems: 'center',
                    backgroundColor: selectedType === item.type ? item.color : '#F4F1DE',
                  }}
                >
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={24}
                    color={selectedType === item.type ? '#FFF' : '#3D405B'}
                  />
                  <Text
                    style={{
                      fontFamily: 'PlusJakartaSans_600SemiBold',
                      fontSize: 11,
                      color: selectedType === item.type ? '#FFF' : '#3D405B',
                      marginTop: 6,
                    }}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).duration(300)}>
          <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: '#3D405B', marginBottom: 12 }}>
            Quick tag (optional)
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {QUICK_TAGS.map((tag, index) => (
              <Animated.View key={tag.id} entering={SlideInRight.delay(350 + index * 30).duration(300)}>
                <TouchableOpacity
                  onPress={() => setSelectedTag(selectedTag === tag.id ? null : tag.id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 9999,
                    backgroundColor: selectedTag === tag.id ? tag.color : '#F4F1DE',
                  }}
                >
                  <MaterialCommunityIcons
                    name={tag.icon as any}
                    size={16}
                    color={selectedTag === tag.id ? '#FFF' : tag.color}
                  />
                  <Text
                    style={{
                      fontFamily: 'PlusJakartaSans_600SemiBold',
                      fontSize: 13,
                      color: selectedTag === tag.id ? '#FFF' : '#3D405B',
                    }}
                  >
                    {tag.label}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(500).duration(300)}>
          <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: '#3D405B', marginBottom: 8 }}>
            Add a note (optional)
          </Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="What did you talk about?"
            placeholderTextColor="rgba(61, 64, 91, 0.4)"
            multiline
            numberOfLines={3}
            style={{
              backgroundColor: '#F4F1DE',
              padding: 16,
              borderRadius: 12,
              fontFamily: 'PlusJakartaSans_500Medium',
              fontSize: 15,
              color: '#3D405B',
              minHeight: 80,
              textAlignVertical: 'top',
            }}
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(600).duration(300)}>
          <TouchableOpacity
            onPress={handleLog}
            style={{
              backgroundColor: '#81B29A',
              padding: 18,
              borderRadius: 12,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <MaterialCommunityIcons name="check" size={20} color="#FFF" />
            <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#FFF' }}>
              Log Connection
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </DrawerModal>
  );
};