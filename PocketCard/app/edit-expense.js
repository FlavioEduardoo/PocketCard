import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCards } from '../store/cards-context';
import { useTheme } from '../utils/theme';
import { fmtDate, parseAmount } from '../utils/format';
import { showAlert } from '../utils/alert';
import { Chip, Field, PrimaryButton, GlassCard } from '../components/ui';
import { DatePickerModal } from '../components/CustomDatePicker';

export default function EditExpense() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { cards, transactions, editExpense } = useCards();
  const { colors } = useTheme();

  const tx = transactions.find((t) => String(t.id) === String(params.id));

  const [cardId, setCardId] = useState(tx?.cardId || cards[0]?.id || null);
  const [description, setDescription] = useState(tx?.description || '');
  const [amount, setAmount] = useState(tx ? String(tx.amount) : '');
  const [date, setDate] = useState(tx ? new Date(tx.date) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  if (!tx) {
    return (
      <View style={[s.center, { backgroundColor: colors.bg }]}>
        <Text style={{ color: colors.muted }}>Despesa não encontrada.</Text>
        <PrimaryButton title="Voltar" onPress={() => router.back()} />
      </View>
    );
  }

  const handleUpdate = () => {
    const val = parseAmount(amount);
    if (!description.trim()) return showAlert('Atenção', 'Informe uma descrição.');
    if (!(val > 0)) return showAlert('Atenção', 'Informe um valor maior que zero.');

    try {
      editExpense(tx.id, {
        cardId,
        description: description.trim(),
        amount: val,
        date,
      });
      router.back();
    } catch (e) {
      showAlert('Erro', e?.message || 'Falha ao atualizar despesa.');
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[s.container, { backgroundColor: colors.bg }]}
      keyboardShouldPersistTaps="handled"
    >
      <GlassCard glow style={s.card}>
        <Text style={[s.label, { color: colors.muted }]}>CARTÃO VINCULADO</Text>
        <View style={s.chips}>
          {cards.map((c) => (
            <Chip
              key={String(c.id)}
              label={c.bank}
              color={c.color}
              selected={String(c.id) === String(cardId)}
              onPress={() => setCardId(c.id)}
            />
          ))}
        </View>

        <Field
          label="Descrição da Compra"
          value={description}
          onChangeText={setDescription}
          placeholder="Ex.: Almoço de negócios"
        />

        <Field
          label="Valor (R$)"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="0,00"
        />

        <Text style={[s.label, { color: colors.muted }]}>DATA DA COMPRA</Text>
        <Pressable
          style={[
            s.dateBtn,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={() => setShowDatePicker(true)}
        >
          <View style={[s.btnIconBox, { backgroundColor: 'rgba(124, 92, 252, 0.15)' }]}>
            <Ionicons name="calendar-outline" size={18} color={colors.primary} />
          </View>
          <View>
            <Text style={[s.dateBtnSub, { color: colors.muted }]}>Data Selecionada</Text>
            <Text style={[s.dateBtnText, { color: colors.ink }]}>{fmtDate(date)}</Text>
          </View>
        </Pressable>

        <DatePickerModal
          visible={showDatePicker}
          onClose={() => setShowDatePicker(false)}
          onSelect={(d) => setDate(d)}
          currentDate={date}
          title="Data da Despesa"
        />

        <View style={{ marginTop: 8 }}>
          <PrimaryButton title="Salvar Alterações" onPress={handleUpdate} />
        </View>
      </GlassCard>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 14 },
  card: { gap: 10 },
  label: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, marginBottom: 8 },
  chips: { flexDirection: 'row', gap: 10, marginBottom: 14, flexWrap: 'wrap' },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  btnIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
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
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
});
