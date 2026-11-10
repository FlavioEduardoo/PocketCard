import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useCards } from '../store/cards-context';
import { parseAmount } from '../utils/format';
import { cardColors, colors } from '../utils/theme';
import { Chip, Field, PrimaryButton } from '../components/ui';

const validDay = (n) => Number.isInteger(n) && n >= 1 && n <= 31;

export default function NewCard() {
  const router = useRouter();
  const { addCard } = useCards();
  const [bank, setBank] = useState('');
  const [type, setType] = useState('fisico');
  const [limit, setLimit] = useState('');
  const [closingDay, setClosingDay] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [color, setColor] = useState(cardColors[0]);

  const save = () => {
    const lim = parseAmount(limit);
    const closing = parseInt(closingDay, 10);
    const due = parseInt(dueDay, 10);
    if (!bank.trim()) return Alert.alert('Atenção', 'Informe o nome do banco.');
    if (!(lim > 0)) return Alert.alert('Atenção', 'Informe um limite maior que zero.');
    if (!validDay(closing) || !validDay(due)) {
      return Alert.alert('Atenção', 'Fechamento e vencimento devem ser dias de 1 a 31.');
    }
    addCard({
      bank: bank.trim(),
      type,
      limit: lim,
      closingDay: closing,
      dueDay: due,
      color,
    });
    router.back();
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
      <Field label="Banco" value={bank} onChangeText={setBank} placeholder="Ex.: Nubank" />

      <Text style={s.label}>Tipo</Text>
      <View style={s.chips}>
        <Chip label="Físico" selected={type === 'fisico'} onPress={() => setType('fisico')} />
        <Chip label="Virtual" selected={type === 'virtual'} onPress={() => setType('virtual')} />
      </View>

      <Field
        label="Limite total (R$)"
        value={limit}
        onChangeText={setLimit}
        keyboardType="decimal-pad"
        placeholder="0,00"
      />
      <Field
        label="Dia de fechamento"
        value={closingDay}
        onChangeText={setClosingDay}
        keyboardType="number-pad"
        placeholder="Ex.: 25"
      />
      <Field
        label="Dia de vencimento"
        value={dueDay}
        onChangeText={setDueDay}
        keyboardType="number-pad"
        placeholder="Ex.: 5"
      />

      <Text style={s.label}>Cor do cartão</Text>
      <View style={[s.chips, { marginBottom: 24 }]}>
        {cardColors.map((c) => (
          <Pressable
            key={c}
            onPress={() => setColor(c)}
            style={[s.swatch, { backgroundColor: c }, color === c && s.swatchOn]}
          />
        ))}
      </View>

      <PrimaryButton title="Salvar cartão" onPress={save} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  label: { fontSize: 13, color: colors.muted, marginBottom: 6 },
  chips: { flexDirection: 'row', gap: 10, marginBottom: 14, flexWrap: 'wrap' },
  swatch: { width: 36, height: 36, borderRadius: 18, borderWidth: 3, borderColor: 'transparent' },
  swatchOn: { borderColor: colors.primary },
});