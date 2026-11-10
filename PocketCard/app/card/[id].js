import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCards } from '../../store/cards-context';
import { getInvoice } from '../../utils/invoice';
import { brl, fmtDate } from '../../utils/format';
import { colors } from '../../utils/theme';
import CardItem from '../../components/CardItem';
import { PrimaryButton } from '../../components/ui';

export default function CardDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { cards, transactions, payInvoice, removeCard } = useCards();
  const card = cards.find((c) => c.id === id);

  if (!card) {
    return (
      <View style={s.center}>
        <Text style={s.muted}>Cartão não encontrado.</Text>
        <PrimaryButton title="Voltar" onPress={() => router.back()} />
      </View>
    );
  }

  const invoice = getInvoice(card, transactions);

  const pay = () =>
    Alert.alert('Pagar fatura', `Marcar ${brl(invoice.total)} como pago e liberar o limite?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Pagar',
        onPress: () => payInvoice(card, invoice.items).catch((e) => Alert.alert('Erro', e.message)),
      },
    ]);

  const remove = () =>
    Alert.alert('Excluir cartão', 'O cartão e todas as despesas dele serão apagados.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          router.back();
          removeCard(card).catch((e) => Alert.alert('Erro', e.message));
        },
      },
    ]);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
      <CardItem card={card} invoice={invoice} />

      <PrimaryButton
        title="Nova despesa neste cartão"
        onPress={() => router.push({ pathname: '/new-expense', params: { cardId: card.id } })}
      />
      <PrimaryButton
        title="Pagar fatura"
        variant="outline"
        onPress={pay}
        disabled={invoice.total <= 0}
      />

      <Text style={s.section}>
        Compras da fatura ({fmtDate(invoice.start)} a {fmtDate(invoice.end)})
      </Text>
      {invoice.items.length === 0 ? (
        <Text style={s.muted}>Nenhuma compra nesta fatura.</Text>
      ) : (
        invoice.items.map((t) => (
          <View key={t.id} style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>{t.description}</Text>
              <Text style={s.sub}>{fmtDate(t.date)}</Text>
            </View>
            <Text style={s.title}>{brl(t.amount)}</Text>
          </View>
        ))
      )}

      <View style={{ marginTop: 16 }}>
        <PrimaryButton title="Excluir cartão" variant="danger" onPress={remove} />
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 24 },
  muted: { color: colors.muted },
  section: { fontSize: 15, fontWeight: '700', color: colors.ink, marginTop: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { fontSize: 16, fontWeight: '600', color: colors.ink },
  sub: { fontSize: 12, color: colors.muted, marginTop: 2 },
});