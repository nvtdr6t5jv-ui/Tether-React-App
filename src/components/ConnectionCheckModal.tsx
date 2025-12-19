import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInUp,
  SlideInDown,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface ConnectionCheckModalProps {
  visible: boolean;
  personName: string;
  personPhoto?: string;
  onYesLog: () => void;
  onNoAnswer: () => void;
  onDidntCall: () => void;
  onClose: () => void;
}

export const ConnectionCheckModal: React.FC<ConnectionCheckModalProps> = ({
  visible,
  personName,
  personPhoto,
  onYesLog,
  onNoAnswer,
  onDidntCall,
  onClose,
}) => {
  if (!visible) return null;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 }}>
      <Animated.View
        entering={FadeIn.duration(300)}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(61, 64, 91, 0.6)',
        }}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={onClose}
        />
      </Animated.View>

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
            paddingBottom: 40,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -10 },
            shadowOpacity: 0.15,
            shadowRadius: 40,
            elevation: 8,
          }}
        >
          <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}>
            <View style={{ width: 48, height: 6, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 3 }} />
          </View>

          <View style={{ paddingHorizontal: 32, paddingTop: 16, alignItems: 'center' }}>
            <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: 'rgba(61, 64, 91, 0.5)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 24 }}>
              Connection Check
            </Text>

            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  borderWidth: 5,
                  borderColor: '#FFF',
                  overflow: 'hidden',
                  backgroundColor: '#E9E9E9',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 12,
                  elevation: 4,
                }}
              >
                {personPhoto ? (
                  <Image
                    source={{ uri: personPhoto }}
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <View
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#E07A5F',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 28, color: '#FFF' }}>
                      {personName.charAt(0)}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 27, color: '#3D405B', textAlign: 'center', marginTop: 20, maxWidth: 280, lineHeight: 34 }}>
                Did you get a hold of <Text style={{ color: '#81B29A' }}>{personName}</Text>?
              </Text>
            </View>

            <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 15, color: 'rgba(61, 64, 91, 0.6)', textAlign: 'center', lineHeight: 22, marginBottom: 40, maxWidth: 280 }}>
              We can't track calls automatically, so help us keep your orbit updated.
            </Text>

            <View style={{ width: '100%', gap: 14 }}>
              <TouchableOpacity
                onPress={onYesLog}
                style={{
                  backgroundColor: '#81B29A',
                  paddingVertical: 16,
                  borderRadius: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  shadowColor: '#81B29A',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.25,
                  shadowRadius: 16,
                  elevation: 4,
                }}
              >
                <MaterialCommunityIcons name="check-circle" size={20} color="#FFF" />
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: '#FFF' }}>
                  Yes, Log Interaction
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onNoAnswer}
                style={{
                  backgroundColor: 'transparent',
                  paddingVertical: 16,
                  borderRadius: 16,
                  borderWidth: 2.5,
                  borderColor: '#E07A5F',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: '#E07A5F' }}>
                  No Answer / Left Voicemail
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onDidntCall}
                style={{
                  paddingVertical: 8,
                  alignItems: 'center',
                  marginTop: 4,
                }}
              >
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: 'rgba(61, 64, 91, 0.4)', textDecorationLine: 'underline' }}>
                  Didn't Call
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};
