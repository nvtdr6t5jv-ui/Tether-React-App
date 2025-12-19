import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Clipboard,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  SlideInDown,
} from 'react-native-reanimated';

interface PlanModalProps {
  visible: boolean;
  personName: string;
  onSave: (date: string, time: string, description: string, addToCalendar: boolean) => void;
  onCancel: () => void;
}

export const PlanModal: React.FC<PlanModalProps> = ({
  visible,
  personName,
  onSave,
  onCancel,
}) => {
  const [date, setDate] = useState('Sat, Oct 20');
  const [time, setTime] = useState('10:00 AM');
  const [description, setDescription] = useState('');
  const [addToCalendar, setAddToCalendar] = useState(true);

  if (!visible) return null;

  const handleSave = () => {
    onSave(date, time, description, addToCalendar);
  };

  const handleCopyInvite = () => {
    const inviteText = `Hey! Want to meet up on ${date} at ${time}? ${description ? `(${description})` : ''}`;
    Clipboard.setString(inviteText);
    Alert.alert('Copied!', 'Invite text copied to clipboard');
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
          backgroundColor: 'rgba(61, 64, 91, 0.4)',
        }}
        activeOpacity={1}
        onPress={onCancel}
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
            paddingBottom: 32,
            overflow: 'hidden',
          }}
        >
          <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}>
            <View style={{ width: 48, height: 6, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 3 }} />
          </View>

          <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <TouchableOpacity onPress={onCancel}>
                <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 16, color: '#81B29A' }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 24, color: '#3D405B' }}>
                Plan with {personName}
              </Text>
              <TouchableOpacity
                onPress={handleSave}
                style={{
                  backgroundColor: '#81B29A',
                  paddingHorizontal: 24,
                  paddingVertical: 8,
                  borderRadius: 9999,
                  shadowColor: '#81B29A',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                }}
              >
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: '#FFF' }}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                backgroundColor: '#FFF',
                borderRadius: 24,
                overflow: 'hidden',
                marginBottom: 16,
                shadowColor: '#3D405B',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
              }}
            >
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: 'rgba(0,0,0,0.05)',
                }}
              >
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: '#3D405B' }}>
                  Date
                </Text>
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: '#81B29A' }}>
                  {date}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: 'rgba(0,0,0,0.05)',
                }}
              >
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: '#3D405B' }}>
                  Time
                </Text>
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: '#81B29A' }}>
                  {time}
                </Text>
              </TouchableOpacity>

              <View style={{ padding: 16, gap: 8 }}>
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: '#3D405B' }}>
                  Description
                </Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Add details..."
                  placeholderTextColor="rgba(61, 64, 91, 0.4)"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.03)',
                    borderRadius: 12,
                    padding: 12,
                    fontFamily: 'PlusJakartaSans_400Regular',
                    fontSize: 14,
                    color: '#3D405B',
                  }}
                />
              </View>
            </View>

            <View
              style={{
                backgroundColor: '#FFF',
                borderRadius: 24,
                padding: 20,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 24,
                shadowColor: '#3D405B',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
              }}
            >
              <View style={{ flex: 1, paddingRight: 16 }}>
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: '#3D405B' }}>
                  Add to Device Calendar
                </Text>
                <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 11, color: 'rgba(61, 64, 91, 0.5)', marginTop: 2, lineHeight: 16 }}>
                  We'll create an event in your main calendar.
                </Text>
              </View>
              <Switch
                value={addToCalendar}
                onValueChange={setAddToCalendar}
                trackColor={{ false: 'rgba(0,0,0,0.1)', true: '#81B29A' }}
                thumbColor="#FFF"
              />
            </View>

            <View style={{ gap: 12 }}>
              <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: 'rgba(61, 64, 91, 0.4)', textTransform: 'uppercase', letterSpacing: 1, marginLeft: 8 }}>
                Need to invite them?
              </Text>
              <TouchableOpacity
                onPress={handleCopyInvite}
                style={{
                  borderWidth: 2,
                  borderColor: '#81B29A',
                  borderRadius: 16,
                  paddingVertical: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <MaterialCommunityIcons name="content-copy" size={20} color="#81B29A" />
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#81B29A' }}>
                  Copy Invite Text
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};
