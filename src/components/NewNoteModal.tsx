import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { useApp } from '../context/AppContext';
import { NoteType, NOTE_TYPE_CONFIG } from '../types';

interface NewNoteModalProps {
  visible: boolean;
  onClose: () => void;
  friendId: string;
  friendName: string;
  friendPhoto?: string;
  friendInitials: string;
}

export const NewNoteModal: React.FC<NewNoteModalProps> = ({
  visible,
  onClose,
  friendId,
  friendName,
  friendPhoto,
  friendInitials,
}) => {
  const { addNote } = useApp();
  const [selectedType, setSelectedType] = useState<NoteType>('draft');
  const [content, setContent] = useState('');

  const handleSave = async () => {
    if (!content.trim()) return;
    await addNote(friendId, selectedType, content.trim());
    setContent('');
    setSelectedType('draft');
    onClose();
  };

  const handleClose = () => {
    setContent('');
    setSelectedType('draft');
    onClose();
  };

  const noteTypes: { type: NoteType; icon: string; label: string; color: string }[] = [
    { type: 'draft', icon: 'note-text', label: 'Draft', color: '#E9C46A' },
    { type: 'memory', icon: 'archive', label: 'Memory', color: '#81B29A' },
    { type: 'gift_idea', icon: 'gift', label: 'Gift Idea', color: '#E07A5F' },
  ];

  return (
    <Modal visible={visible} animationType="none" transparent statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Animated.View
          entering={FadeIn.duration(200)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'flex-end',
          }}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={handleClose}
          />
          <Animated.View
            entering={SlideInUp.duration(300).springify()}
            style={{
              backgroundColor: '#F4F1DE',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: '85%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 24,
                paddingVertical: 20,
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(0,0,0,0.05)',
              }}
            >
              <TouchableOpacity onPress={handleClose}>
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#81B29A' }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 20, color: '#3D405B' }}>
                New Note
              </Text>
              <TouchableOpacity
                onPress={handleSave}
                disabled={!content.trim()}
                style={{
                  backgroundColor: content.trim() ? '#E07A5F' : 'rgba(224, 122, 95, 0.4)',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 9999,
                }}
              >
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: '#FFF' }}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
              <View style={{ alignItems: 'center', marginBottom: 32 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#FFF',
                    paddingLeft: 6,
                    paddingRight: 12,
                    paddingVertical: 6,
                    borderRadius: 9999,
                    gap: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                  }}
                >
                  {friendPhoto ? (
                    <Image
                      source={{ uri: friendPhoto }}
                      style={{ width: 32, height: 32, borderRadius: 16 }}
                    />
                  ) : (
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: '#81B29A',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: '#FFF' }}>
                        {friendInitials}
                      </Text>
                    </View>
                  )}
                  <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: '#3D405B' }}>
                    {friendName}
                  </Text>
                </View>
              </View>

              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: '#3D405B', marginBottom: 16 }}>
                  What kind of note?
                </Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  {noteTypes.map((item) => (
                    <TouchableOpacity
                      key={item.type}
                      onPress={() => setSelectedType(item.type)}
                      style={{
                        flex: 1,
                        aspectRatio: 1,
                        borderRadius: 16,
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        backgroundColor: selectedType === item.type ? item.color : '#F4F1DE',
                        borderWidth: selectedType === item.type ? 0 : 2,
                        borderColor: item.color,
                      }}
                    >
                      <MaterialCommunityIcons
                        name={item.icon as any}
                        size={32}
                        color={selectedType === item.type ? '#FFF' : item.color}
                      />
                      <Text
                        style={{
                          fontFamily: 'PlusJakartaSans_700Bold',
                          fontSize: 14,
                          color: selectedType === item.type ? '#FFF' : item.color,
                        }}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View
                style={{
                  backgroundColor: '#FFF',
                  borderRadius: 16,
                  padding: 20,
                  minHeight: 150,
                  marginBottom: 32,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                }}
              >
                <TextInput
                  value={content}
                  onChangeText={setContent}
                  placeholder="Write your thought here... (e.g. Send her the link to that podcast)"
                  placeholderTextColor="rgba(61, 64, 91, 0.4)"
                  multiline
                  style={{
                    fontFamily: 'PlusJakartaSans_400Regular',
                    fontSize: 16,
                    color: '#3D405B',
                    lineHeight: 24,
                    flex: 1,
                  }}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
