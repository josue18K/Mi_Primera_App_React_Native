import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';

const { width } = Dimensions.get('window');

const CustomAlert = ({ visible, type = 'info', title, message, buttons = [], onClose }) => {
  const getIcon = () => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'close-circle';
      case 'warning': return 'warning';
      case 'info': return 'information-circle';
      default: return 'information-circle';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success': return COLORS.success;
      case 'error': return COLORS.danger;
      case 'warning': return COLORS.warning;
      case 'info': return COLORS.primary;
      default: return COLORS.primary;
    }
  };

  const defaultButtons = [{ text: 'OK', onPress: () => {}, style: 'default' }];
  const buttonsList = buttons.length > 0 ? buttons : defaultButtons;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { maxWidth: width * 0.85 }]}>
          <View style={[styles.iconContainer, { backgroundColor: `${getColor()}20` }]}>
            <Ionicons name={getIcon()} size={48} color={getColor()} />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonsContainer}>
            {buttonsList.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  button.style === 'cancel' && styles.buttonCancel,
                  button.style === 'destructive' && styles.buttonDestructive,
                  buttonsList.length === 1 && styles.buttonFull,
                ]}
                onPress={() => {
                  button.onPress();
                  onClose();
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.buttonText,
                    button.style === 'cancel' && styles.buttonTextCancel,
                    button.style === 'destructive' && styles.buttonTextDestructive,
                  ]}
                >
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonsContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonFull: {
    flex: 1,
  },
  buttonCancel: {
    backgroundColor: COLORS.backgroundSecondary,
  },
  buttonDestructive: {
    backgroundColor: COLORS.danger,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  buttonTextCancel: {
    color: COLORS.dark,
  },
  buttonTextDestructive: {
    color: COLORS.white,
  },
});

export default CustomAlert;
