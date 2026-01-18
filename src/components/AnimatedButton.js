import React from 'react';
import { TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { hapticLight } from '../utils/haptics';

const AnimatedButton = ({ children, onPress, style, disabled, ...props }) => {
  const scaleAnim = new Animated.Value(1);

  const handlePressIn = () => {
    if (!disabled) {
      hapticLight();
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled}
      {...props}
    >
      <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default AnimatedButton;
