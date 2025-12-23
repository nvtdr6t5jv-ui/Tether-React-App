import React from 'react';
import { View, Text, Image } from 'react-native';

interface UserAvatarProps {
  name?: string | null;
  photo?: string | null;
  size: number;
  isPremium?: boolean;
  fontSize?: number;
  backgroundColor?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  photo,
  size,
  isPremium = false,
  fontSize,
  backgroundColor = '#E07A5F',
}) => {
  const borderWidth = isPremium ? 3 : 2;
  const borderColor = isPremium ? '#FFD700' : '#FFF';
  const actualFontSize = fontSize || size * 0.4;
  const innerSize = size - (borderWidth * 2);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: borderWidth,
        borderColor: borderColor,
        backgroundColor: borderColor,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: isPremium ? '#FFD700' : 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: isPremium ? 0.5 : 0,
        shadowRadius: isPremium ? 6 : 0,
        elevation: isPremium ? 4 : 0,
      }}
    >
      {photo ? (
        <Image
          source={{ uri: photo }}
          style={{
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
          }}
        />
      ) : (
        <View
          style={{
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            backgroundColor: backgroundColor,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: 'Fraunces_600SemiBold',
              fontSize: actualFontSize,
              color: '#FFF',
            }}
          >
            {name?.charAt(0)?.toUpperCase() || 'A'}
          </Text>
        </View>
      )}
    </View>
  );
};
