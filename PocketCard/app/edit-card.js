import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCards } from '../store/cards-context';
import { useTheme, cardColors } from '../utils/theme';
import { parseAmount } from '../utils/format';
import { showAlert } from '../utils/alert';
import { Chip, Field, PrimaryButton, GlassCard } from '../components/ui';
import { DayPickerModal } from '../components/CustomDatePicker';

export default function EditCard() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { cards, editCard } = useCards();
  const { colors } = useTheme();

  const card = cards.find((c) => String(c.id) === String(params.id));

  const [bank, setBank] = useState(card?.bank || '');
  const [type, setType] = useState(card?.type || 'fisico');
  const [limit, setLimit] = useState(card ? String(card.limit) : '');
  const [closingDay, setClosingDay] = useState(card?.closingDay || 25);
  const [dueDay, setDueDay] = useState(card?.dueDay || 5);
  const [color, setColor] = useState(card?.color || cardColors[0]);

  const [showClosingModal, setShowClosingModal] = useState(false);
  const [showDueModal, setShowDueModal] = useState(false);

  if (!card) {
    return (
      <View style={[s.center, { backgroundColor: colors.bg }]}>
        <Text style={{ color: colors.muted }}>Cartão não encontrado.</Text>
        <PrimaryButton title="Voltar" onPress={() => router.back()} />
      </View>
    );
  }

  const handleUpdate = () => {
    const lim = parseAmount(limit);

    if (!bank.trim()) return showAlert('Atenção', 'Informe o nome do banco.');
    if (!(lim > 0)) return showAlert('Atenção', 'Informe um limite maior que zero.');

    try {
      editCard(card.id, {
        bank: bank.trim(),
        type,
        limit: lim,
        closingDay: Number(closingDay),
        dueDay: Number(dueDay),
        color,
      });
      router.back();
    } catch (e) {
      showAlert('Erro', e?.message || 'Falha ao salvar cartão.');
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[s.container, { backgroundColor: colors.bg }]}
      keyboardShouldPersistTaps="handled"
    >
      <GlassCard glow style={s.card}>
        <Field label="Nome do Banco / Instituição" value={bank} onChangeText={setBank} placeholder="Ex.: Nubank Ultra" />

        <Text style={[s.label, { color: colors.muted }]}>TIPO DE CARTÃO</Text>
        <View style={s.chips}>
          <Chip label="Físico" selected={type === 'fisico'} onPress={() => setType('fisico')} />
          <Chip label="Virtual" selected={type === 'virtual'} onPress={() => setType('virtual')} />
        </View>

        <Field
          label="Limite Total (R$)"
          value={limit}
          onChangeText={setLimit}
          keyboardType="decimal-pad"
          placeholder="0,00"
        />

        {/* Seletores Interativos de Dia */}
        <View style={s.rowFields}>
          {/* Dia de Fechamento */}
          <View style={{ flex: 1 }}>
            <Text style={[s.label, { color: colors.muted }]}>DIA FECHAMENTO</Text>
            <Pressable
              style={[
                s.dateBtn,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setShowClosingModal(true)}
            >
              <View style={[s.btnIconBox, { backgroundColor: 'rgba(124, 92, 252, 0.15)' }]}>
                <Ionicons name="calendar" size={16} color={colors.primary} />
              </View>
              <View>
                <Text style={[s.dateBtnSub, { color: colors.muted }]}>Fechamento</Text>
                <Text style={[s.dateBtnText, { color: colors.ink }]}>Dia {closingDay}</Text>
              </View>
            </Pressable>
          </View>

          {/* Dia de Vencimento */}
          <View style={{ flex: 1 }}>
            <Text style={[s.label, { color: colors.muted }]}>DIA VENCIMENTO</Text>
            <Pressable
              style={[
                s.dateBtn,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setShowDueModal(true)}
            >
              <View style={[s.btnIconBox, { backgroundColor: 'rgba(0, 212, 170, 0.15)' }]}>
                <Ionicons name="alarm" size={16} color={colors.secondary} />
              </View>
              <View>
                <Text style={[s.dateBtnSub, { color: colors.muted }]}>Vencimento</Text>
                <Text style={[s.dateBtnText, { color: colors.ink }]}>Dia {dueDay}</Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Modal de Fechamento */}
        <DayPickerModal
          visible={showClosingModal}
          onClose={() => setShowClosingModal(false)}
          onSelect={(d) => setClosingDay(d)}
          title="Dia de Fechamento"
          currentDay={closingDay}
        />

        {/* Modal de Vencimento */}
        <DayPickerModal
          visible={showDueModal}
          onClose={() => setShowDueModal(false)}
          onSelect={(d) => setDueDay(d)}
          title="Dia de Vencimento"
          currentDay={dueDay}
        />

        <Text style={[s.label, { color: colors.muted }]}>COR DO CARTÃO</Text>
        <View style={s.swatches}>
          {cardColors.map((c) => (
            <Pressable
              key={c}
              onPress={() => setColor(c)}
              style={[
                s.swatch,
                { backgroundColor: c },
                color === c && { borderColor: '#FFF', borderWidth: 2.5, transform: [{ scale: 1.1 }] },
              ]}
            />
          ))}
        </View>

        <PrimaryButton title="Salvar Alterações" onPress={handleUpdate} />
      </GlassCard>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 14 },
  card: { gap: 8 },
  label: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, marginBottom: 8 },
  chips: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  rowFields: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  btnIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateBtnSub: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  dateBtnText: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  swatches: { flexDirection: 'row', gap: 10, marginBottom: 24, flexWrap: 'wrap' },
  swatch: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
});
