import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { COLORS, TURN_EMOJIS, TURN_LABELS } from '../constants';
import { hapticLight, hapticSuccess } from '../utils/haptics';

const { width } = Dimensions.get('window');
const buttonWidth = (width - 64) / 3;

const TurnButton = ({ type, hours, isActive, onPress }) => {
  const getColor = () => {
    switch (type) {
      case 'M': return COLORS.turnM;
      case 'T': return COLORS.turnT;
      case 'N': return COLORS.turnN;
      default: return COLORS.primary;
    }
  };

  const handlePress = () => {
    if (isActive) {
      hapticLight();
    } else {
      hapticSuccess();
    }
    onPress();
  };

  const color = getColor();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { 
          backgroundColor: isActive ? color : COLORS.backgroundSecondary,
          borderColor: isActive ? color : COLORS.border,
          width: buttonWidth,
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text style={styles.emoji}>{TURN_EMOJIS[type]}</Text>
      <Text style={[styles.label, isActive && styles.labelActive]}>
        {TURN_LABELS[type]}
      </Text>
      <Text style={[styles.hours, isActive && styles.hoursActive]}>
        {hours}h
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 110,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray,
    marginBottom: 4,
  },
  labelActive: {
    color: COLORS.white,
  },
  hours: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  hoursActive: {
    color: COLORS.white,
  },
});

export default TurnButton;
