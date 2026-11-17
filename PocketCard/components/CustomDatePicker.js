import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/theme';

/**
 * Seletor de Dia do Mês (1 a 31) ou Data Completa 100% multiplataforma
 * (funciona no Android, iOS, Expo Go e Web sem depender de bibliotecas nativas quebradas).
 */
export function DayPickerModal({
  visible,
  onClose,
  onSelect,
  title = 'Selecione o dia',
  currentDay = 1,
}) {
  const { colors } = useTheme();
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose}>
        <Pressable
          style={[
            s.modalGlass,
            {
              backgroundColor: colors.surface,
              borderColor: colors.borderHighlight,
            },
          ]}
          onPress={(e) => e.stopPropagation?.()}
        >
          {/* Cabeçalho */}
          <View style={s.modalHeader}>
            <View>
              <Text style={[s.modalTitle, { color: colors.ink }]}>{title}</Text>
              <Text style={[s.modalSub, { color: colors.muted }]}>
                Escolha o dia do mês (1 a 31)
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={10} style={s.closeBtn}>
              <Ionicons name="close" size={20} color={colors.muted} />
            </TouchableOpacity>
          </View>

          {/* Grid de Dias (1 a 31) */}
          <ScrollView contentContainerStyle={s.gridContainer} showsVerticalScrollIndicator={false}>
            {days.map((d) => {
              const isSelected = Number(currentDay) === d;
              return (
                <TouchableOpacity
                  key={d}
                  onPress={() => {
                    onSelect(d);
                    onClose();
                  }}
                  style={[
                    s.dayCell,
                    {
                      backgroundColor: isSelected ? colors.primary : 'rgba(255, 255, 255, 0.04)',
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      s.dayText,
                      {
                        color: isSelected ? '#FFF' : colors.ink,
                        fontWeight: isSelected ? '800' : '600',
                      },
                    ]}
                  >
                    {d}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/**
 * Seletor de Data de Compra (Dia, Mês e Ano) cross-platform
 */
export function DatePickerModal({
  visible,
  onClose,
  onSelect,
  title = 'Data da compra',
  currentDate = new Date(),
}) {
  const { colors } = useTheme();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth()); // 0-11
  const [selectedDay, setSelectedDay] = useState(currentDate.getDate());

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleConfirm = () => {
    const finalDate = new Date(selectedYear, selectedMonth, Math.min(selectedDay, daysInMonth), 12, 0, 0);
    onSelect(finalDate);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose}>
        <Pressable
          style={[
            s.modalGlass,
            {
              backgroundColor: colors.surface,
              borderColor: colors.borderHighlight,
            },
          ]}
          onPress={(e) => e.stopPropagation?.()}
        >
          {/* Header */}
          <View style={s.modalHeader}>
            <View>
              <Text style={[s.modalTitle, { color: colors.ink }]}>{title}</Text>
              <Text style={[s.modalSub, { color: colors.muted }]}>
                {selectedDay} de {months[selectedMonth]} de {selectedYear}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={10} style={s.closeBtn}>
              <Ionicons name="close" size={20} color={colors.muted} />
            </TouchableOpacity>
          </View>

          {/* Navegação de Mês */}
          <View style={s.monthNav}>
            <TouchableOpacity
              onPress={() => {
                if (selectedMonth === 0) {
                  setSelectedMonth(11);
                  setSelectedYear((y) => y - 1);
                } else {
                  setSelectedMonth((m) => m - 1);
                }
              }}
              style={s.navBtn}
            >
              <Ionicons name="chevron-back" size={20} color={colors.primary} />
            </TouchableOpacity>

            <Text style={[s.monthTitle, { color: colors.ink }]}>
              {months[selectedMonth]} {selectedYear}
            </Text>

            <TouchableOpacity
              onPress={() => {
                if (selectedMonth === 11) {
                  setSelectedMonth(0);
                  setSelectedYear((y) => y + 1);
                } else {
                  setSelectedMonth((m) => m + 1);
                }
              }}
              style={s.navBtn}
            >
              <Ionicons name="chevron-forward" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Grid de Dias */}
          <ScrollView contentContainerStyle={s.gridContainer} showsVerticalScrollIndicator={false}>
            {days.map((d) => {
              const isSelected = selectedDay === d;
              return (
                <TouchableOpacity
                  key={d}
                  onPress={() => setSelectedDay(d)}
                  style={[
                    s.dayCell,
                    {
                      backgroundColor: isSelected ? colors.primary : 'rgba(255, 255, 255, 0.04)',
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      s.dayText,
                      {
                        color: isSelected ? '#FFF' : colors.ink,
                        fontWeight: isSelected ? '800' : '600',
                      },
                    ]}
                  >
                    {d}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Botão de Confirmar */}
          <TouchableOpacity
            onPress={handleConfirm}
            style={[s.confirmBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={s.confirmBtnText}>Confirmar Data</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalGlass: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 20,
    maxHeight: 520,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  modalSub: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  closeBtn: {
    padding: 4,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  navBtn: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 15,
    fontWeight: '750',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 4,
  },
  dayCell: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 15,
  },
  confirmBtn: {
    marginTop: 16,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
