import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { PendingAction } from '../context/PendingActionContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CompleteActionModalProps {
  visible: boolean;
  onClose: () => void;
  pendingAction: PendingAction | null;
  onComplete: (type: string, note: string, outcome: 'completed' | 'no_response' | 'voicemail') => void;
  onDiscard: () => void;
}

const OUTCOMES = [
  { id: 'completed', label: 'Connected', icon: 'check-circle', color: '#81B29A' },
  { id: 'no_response', label: 'No Response', icon: 'phone-missed', color: '#E07A5F' },
  { id: 'voicemail', label: 'Left Voicemail', icon: 'voicemail', color: '#6366F1' },
];

const QUICK_NOTES = [
  'Quick check-in',
  'Made plans',
  'Caught up',
  'Birthday wishes',
  'Good news shared',
  'Support call',
];

export const CompleteActionModal: React.FC<CompleteActionModalProps> = ({
  visible,
  onClose,
  pendingAction,
  onComplete,
  onDiscard,
}) => {
  const [note, setNote] = useState('');
  const [outcome, setOutcome] = useState<'completed' | 'no_response' | 'voicemail'>('completed');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const translateY = useSharedValue(SCREEN_HEIGHT);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 300 });
      setNote('');
      setOutcome('completed');
      setIsSubmitting(false);
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
    }
  }, [visible]);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 100) {
        translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 }, () => {
          runOnJS(onClose)();
        });
      } else {
        translateY.value = withTiming(0, { duration: 200 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleComplete = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onComplete(pendingAction?.type || 'call', note, outcome);
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  const getTimeSinceAction = () => {
    if (!pendingAction) return '';
    const started = new Date(pendingAction.startedAt).getTime();
    const now = Date.now();
    const minutes = Math.floor((now - started) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    return 'Earlier today';
  };

  if (!visible || !pendingAction) return null;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}>
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      >
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
      </Animated.View>

      <GestureDetector gesture={gesture}>
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
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
              elevation: 10,
            },
            animatedStyle,
          ]}
        >
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}>
                <View style={{ width: 40, height: 4, backgroundColor: 'rgba(0, 0, 0, 0.1)', borderRadius: 2 }} />
              </View>

              <View style={{ padding: 24 }}>
                <View style={{ alignItems: 'center', marginBottom: 24 }}>
                  <View
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 36,
                      backgroundColor: pendingAction.type === 'call' ? '#81B29A' : '#6366F1',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 16,
                    }}
                  >
                    {pendingAction.friendPhoto ? (
                      <Image
                        source={{ uri: pendingAction.friendPhoto }}
                        style={{ width: 68, height: 68, borderRadius: 34 }}
                      />
                    ) : (
                      <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 24, color: '#FFF' }}>
                        {pendingAction.friendInitials}
                      </Text>
                    )}
                  </View>

                  <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 20, color: '#3D405B', marginBottom: 4 }}>
                    {pendingAction.type === 'call' ? 'Call' : 'Message'} with {pendingAction.friendName}
                  </Text>
                  <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14, color: 'rgba(61, 64, 91, 0.5)' }}>
                    Started {getTimeSinceAction()}
                  </Text>
                </View>

                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: '#3D405B', marginBottom: 12 }}>
                  How did it go?
                </Text>
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
                  {OUTCOMES.map((o) => (
                    <TouchableOpacity
                      key={o.id}
                      onPress={() => setOutcome(o.id as any)}
                      style={{
                        flex: 1,
                        paddingVertical: 14,
                        paddingHorizontal: 8,
                        borderRadius: 12,
                        backgroundColor: outcome === o.id ? o.color : 'rgba(61, 64, 91, 0.05)',
                        alignItems: 'center',
                        borderWidth: 2,
                        borderColor: outcome === o.id ? o.color : 'transparent',
                      }}
                    >
                      <MaterialCommunityIcons
                        name={o.icon as any}
                        size={22}
                        color={outcome === o.id ? '#FFF' : 'rgba(61, 64, 91, 0.5)'}
                      />
                      <Text
                        style={{
                          fontFamily: 'PlusJakartaSans_600SemiBold',
                          fontSize: 11,
                          color: outcome === o.id ? '#FFF' : 'rgba(61, 64, 91, 0.6)',
                          marginTop: 6,
                          textAlign: 'center',
                        }}
                      >
                        {o.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {outcome === 'completed' && (
                  <>
                    <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: '#3D405B', marginBottom: 12 }}>
                      Quick tags
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                      {QUICK_NOTES.map((qn) => (
                        <TouchableOpacity
                          key={qn}
                          onPress={() => setNote(qn)}
                          style={{
                            paddingHorizontal: 14,
                            paddingVertical: 8,
                            backgroundColor: note === qn ? '#81B29A' : 'rgba(61, 64, 91, 0.05)',
                            borderRadius: 20,
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: 'PlusJakartaSans_600SemiBold',
                              fontSize: 13,
                              color: note === qn ? '#FFF' : 'rgba(61, 64, 91, 0.7)',
                            }}
                          >
                            {qn}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: '#3D405B', marginBottom: 12 }}>
                      Add a note (optional)
                    </Text>
                    <TextInput
                      value={note}
                      onChangeText={setNote}
                      placeholder="What did you talk about?"
                      placeholderTextColor="rgba(61, 64, 91, 0.3)"
                      multiline
                      style={{
                        backgroundColor: 'rgba(61, 64, 91, 0.05)',
                        borderRadius: 12,
                        padding: 16,
                        minHeight: 80,
                        fontFamily: 'PlusJakartaSans_500Medium',
                        fontSize: 15,
                        color: '#3D405B',
                        textAlignVertical: 'top',
                      }}
                    />
                  </>
                )}

                <View style={{ flexDirection: 'row', gap: 12, marginTop: 24, marginBottom: 16 }}>
                  <TouchableOpacity
                    onPress={onDiscard}
                    style={{
                      flex: 1,
                      paddingVertical: 16,
                      borderRadius: 12,
                      borderWidth: 1.5,
                      borderColor: 'rgba(61, 64, 91, 0.15)',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15, color: 'rgba(61, 64, 91, 0.6)' }}>
                      Discard
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleComplete}
                    disabled={isSubmitting}
                    style={{
                      flex: 2,
                      paddingVertical: 16,
                      borderRadius: 12,
                      backgroundColor: isSubmitting ? 'rgba(129, 178, 154, 0.5)' : '#81B29A',
                      alignItems: 'center',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    <MaterialCommunityIcons name={isSubmitting ? "loading" : "check"} size={20} color="#FFF" />
                    <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15, color: '#FFF' }}>
                      {isSubmitting ? 'Saving...' : 'Log Connection'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};
