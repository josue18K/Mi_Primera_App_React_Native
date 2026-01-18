import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Switch,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { TURN_LABELS, TURN_EMOJIS, PAY_TYPES } from '../constants';
import { hapticLight, hapticSuccess } from '../utils/haptics';

const { width } = Dimensions.get('window');

const TurnModal = ({ visible, turn, turnType, onSave, onClose }) => {
  const { colors } = useTheme();
  const [isExtra, setIsExtra] = useState(turn?.payType === PAY_TYPES.EXTRA);
  const [note, setNote] = useState(turn?.note || '');

  const handleSave = () => {
    hapticSuccess();
    onSave({
      payType: isExtra ? PAY_TYPES.EXTRA : PAY_TYPES.NORMAL,
      note: note.trim(),
    });
    onClose();
  };

  const handleCancel = () => {
    hapticLight();
    onClose();
  };

  const styles = createStyles(colors);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerTitle}>
              <Text style={styles.emoji}>{TURN_EMOJIS[turnType]}</Text>
              <Text style={styles.title}>Turno {TURN_LABELS[turnType]}</Text>
            </View>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.gray} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              {/* Tipo de pago */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tipo de pago</Text>
                <View style={styles.payTypeCard}>
                  <View style={styles.payTypeInfo}>
                    <View style={styles.payTypeIconContainer}>
                      <Text style={styles.payTypeIcon}>
                        {isExtra ? '⚡' : '⏰'}
                      </Text>
                    </View>
                    <View style={styles.payTypeText}>
                      <Text style={styles.payTypeTitle}>
                        {isExtra ? 'Horas Extra' : 'Horas Normal'}
                      </Text>
                      <Text style={styles.payTypeSubtitle}>
                        {isExtra ? 'Pago: +50% por hora' : 'Pago: estándar por hora'}
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={isExtra}
                    onValueChange={(value) => {
                      hapticLight();
                      setIsExtra(value);
                    }}
                    trackColor={{ false: colors.border, true: colors.warning }}
                    thumbColor={colors.white}
                  />
                </View>

                {isExtra && (
                  <View style={styles.infoBox}>
                    <Ionicons name="information-circle" size={20} color={colors.info} />
                    <Text style={styles.infoText}>
                      Las horas extra se pagan con un 50% adicional
                    </Text>
                  </View>
                )}
              </View>

              {/* Notas */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Nota (opcional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Reemplazo, turno doble..."
                  placeholderTextColor={colors.placeholder}
                  value={note}
                  onChangeText={setNote}
                  multiline
                  numberOfLines={3}
                  maxLength={200}
                />
                <Text style={styles.charCount}>{note.length}/200</Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Ionicons name="checkmark" size={24} color={colors.white} />
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emoji: {
    fontSize: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.dark,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 12,
  },
  payTypeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  payTypeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  payTypeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payTypeIcon: {
    fontSize: 24,
  },
  payTypeText: {
    flex: 1,
  },
  payTypeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 2,
  },
  payTypeSubtitle: {
    fontSize: 13,
    color: colors.gray,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.info}15`,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    gap: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.darkSecondary,
    lineHeight: 18,
  },
  input: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: colors.dark,
    borderWidth: 2,
    borderColor: colors.border,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: colors.gray,
    textAlign: 'right',
    marginTop: 6,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: colors.backgroundSecondary,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.dark,
  },
  saveButton: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
});

export default TurnModal;
