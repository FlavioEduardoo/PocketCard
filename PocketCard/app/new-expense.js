import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCards } from '../store/cards-context';
import { useTheme } from '../utils/theme';
import { brl, fmtDate, parseAmount } from '../utils/format';
import { showAlert } from '../utils/alert';
import { Chip, Field, PrimaryButton, GlassCard } from '../components/ui';
import { DatePickerModal } from '../components/CustomDatePicker';

export default function NewExpense() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { cards, addExpense } = useCards();
  const { colors } = useTheme();

  const [cardId, setCardId] = useState(params.cardId || cards[0]?.id || null);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  if (cards.length === 0) {
    return (
      <View style={[s.center, { backgroundColor: colors.bg }]}>
        <Text style={[s.muted, { color: colors.muted }]}>
          Cadastre um cartão antes de lançar despesas.
        </Text>
        <Link href="/new-card" style={[s.link, { color: colors.primary }]}>
          Novo cartão
        </Link>
      </View>
    );
  }

  const card = cards.find((c) => String(c.id) === String(cardId));
  const value = parseAmount(amount);
  const remaining = card ? card.limit - (card.used || 0) : 0;
  const exceeds = card && value > 0 && value > remaining;

  const save = () => {
    if (!card) return showAlert('Atenção', 'Escolha um cartão.');
    if (!description.trim()) return showAlert('Atenção', 'Informe uma descrição.');
    if (!(value > 0)) return showAlert('Atenção', 'Informe um valor maior que zero.');

    try {
      addExpense({ cardId, description: description.trim(), amount: value, date });
      router.back();
    } catch (e) {
      showAlert('Erro ao salvar', e?.message || String(e));
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[s.container, { backgroundColor: colors.bg }]}
      keyboardShouldPersistTaps="handled"
    >
      <GlassCard glow style={s.card}>
        <Text style={[s.label, { color: colors.muted }]}>SELECIONE O CARTÃO</Text>
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
          placeholder="Ex.: Supermercado, Uber"
        />

        <Field
          label="Valor (R$)"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="0,00"
        />

        <Text style={[s.label, { color: colors.muted }]}>DATA DA TRANSAÇÃO</Text>
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

        {card && (
          <View style={[s.limitWarning, { borderColor: exceeds ? colors.danger : colors.border }]}>
            <Text style={[s.preview, { color: exceeds ? colors.danger : colors.muted }]}>
              {exceeds
                ? `Essa compra estoura o limite de ${card.bank} (restam ${brl(remaining)}).`
                : `Limite restante em ${card.bank}: ${brl(remaining - (value > 0 ? value : 0))}`}
            </Text>
          </View>
        )}

        <View style={{ marginTop: 8 }}>
          <PrimaryButton title="Lançar Despesa" onPress={save} />
        </View>
      </GlassCard>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 24 },
  muted: { textAlign: 'center', fontSize: 14 },
  link: { fontSize: 16, fontWeight: '700' },
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
    marginBottom: 14,
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
  limitWarning: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    marginBottom: 10,
  },
  preview: { fontSize: 13, fontWeight: '500' },
});
