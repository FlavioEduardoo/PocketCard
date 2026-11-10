import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useCards } from '../store/cards-context';
import { brl, fmtDate, parseAmount } from '../utils/format';
import { colors } from '../utils/theme';
import { Chip, Field, PrimaryButton } from '../components/ui';

export default function NewExpense() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { cards, addExpense } = useCards();
  const [cardId, setCardId] = useState(params.cardId || cards[0]?.id || null);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  if (cards.length === 0) {
    return (
      <View style={s.center}>
        <Text style={s.muted}>Cadastre um cartão antes de lançar despesas.</Text>
        <Link href="/new-card" style={s.link}>
          Novo cartão
        </Link>
      </View>
    );
  }

  const card = cards.find((c) => c.id === cardId);
  const value = parseAmount(amount);
  const remaining = card ? card.limit - (card.used || 0) : 0;
  const exceeds = card && value > 0 && value > remaining;

  const save = () => {
    if (!card) return Alert.alert('Atenção', 'Escolha um cartão.');
    if (!description.trim()) return Alert.alert('Atenção', 'Informe uma descrição.');
    if (!(value > 0)) return Alert.alert('Atenção', 'Informe um valor maior que zero.');
    try {
      addExpense({ cardId, description: description.trim(), amount: value, date });
      router.back();
    } catch (e) {
      Alert.alert('Erro ao salvar', e.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
      <Text style={s.label}>Cartão</Text>
      <View style={s.chips}>
        {cards.map((c) => (
          <Chip
            key={c.id}
            label={c.bank}
            color={c.color}
            selected={c.id === cardId}
            onPress={() => setCardId(c.id)}
          />
        ))}
      </View>

      <Field
        label="Descrição"
        value={description}
        onChangeText={setDescription}
        placeholder="Ex.: Mercado"
      />
      <Field
        label="Valor (R$)"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        placeholder="0,00"
      />

      <Text style={s.label}>Data da compra</Text>
      <Pressable style={s.dateBtn} onPress={() => setShowPicker(true)}>
        <Text style={s.dateText}>{fmtDate(date)}</Text>
      </Pressable>
      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          maximumDate={new Date()}
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(_, selected) => {
            setShowPicker(Platform.OS === 'ios');
            if (selected) setDate(selected);
          }}
        />
      )}

      {card && (
        <Text style={[s.preview, exceeds && { color: colors.danger }]}>
          {exceeds
            ? `Essa compra estoura o limite de ${card.bank} (restam ${brl(remaining)}).`
            : `Limite restante em ${card.bank}: ${brl(remaining - (value > 0 ? value : 0))}`}
        </Text>
      )}

      <PrimaryButton title="Salvar despesa" onPress={save} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 24 },
  muted: { color: colors.muted, textAlign: 'center' },
  link: { color: colors.primary, fontSize: 16, fontWeight: '700' },
  label: { fontSize: 13, color: colors.muted, marginBottom: 6 },
  chips: { flexDirection: 'row', gap: 10, marginBottom: 14, flexWrap: 'wrap' },
  dateBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
  },
  dateText: { fontSize: 16, color: colors.ink },
  preview: { fontSize: 14, color: colors.muted, marginVertical: 14 },
});