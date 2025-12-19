import React from 'react';
import { Keyboard, TouchableWithoutFeedback, View, ViewStyle } from 'react-native';

interface DismissKeyboardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const DismissKeyboard: React.FC<DismissKeyboardProps> = ({ children, style }) => {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={[{ flex: 1 }, style]}>{children}</View>
    </TouchableWithoutFeedback>
  );
};
