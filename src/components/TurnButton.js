import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Dimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TURN_EMOJIS, TURN_LABELS, PAY_TYPES } from '../constants';
import { hapticLight, hapticSuccess } from '../utils/haptics';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
const buttonWidth = (width - 64) / 3;

const TurnButton = ({ type, hours, isActive, turn, onPress, onLongPress }) => {
  const { colors } = useTheme();

  const getColor = () => {
    switch (type) {
      case 'M': return colors.turnM;
      case 'T': return colors.turnT;
      case 'N': return colors.turnN;
      default: return colors.primary;
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

  const handleLongPress = () => {
    if (isActive) {
      hapticSuccess();
      onLongPress();
    }
  };

  const color = getColor();
  const isExtra = turn?.payType === PAY_TYPES.EXTRA;
  const hasNote = turn?.note && turn.note.length > 0;
  const styles = createStyles(colors, color, isActive);

  return (
    <TouchableOpacity
      style={[styles.container, { width: buttonWidth }]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
      delayLongPress={500}
    >
      {isActive && isExtra && (
        <View style={styles.extraBadge}>
          <Ionicons name="flash" size={12} color={colors.white} />
        </View>
      )}
      
      <Text style={styles.emoji}>{TURN_EMOJIS[type]}</Text>
      <Text style={styles.label}>
        {TURN_LABELS[type]}
      </Text>
      <Text style={styles.hours}>
        {hours}h
      </Text>
      
      {isActive && hasNote && (
        <View style={styles.noteIndicator}>
          <Ionicons name="document-text" size={14} color={colors.white} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (colors, buttonColor, isActive) => StyleSheet.create({
  container: {
    backgroundColor: isActive ? buttonColor : colors.backgroundSecondary,
    borderColor: isActive ? buttonColor : colors.border,
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
    position: 'relative',
  },
  extraBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.warning,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.warning,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
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
    color: isActive ? colors.white : colors.gray,
    marginBottom: 4,
  },
  hours: {
    fontSize: 15,
    fontWeight: 'bold',
    color: isActive ? colors.white : colors.dark,
  },
  noteIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TurnButton;
