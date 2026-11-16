import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCards } from '../../store/cards-context';
import { getInvoice } from '../../utils/invoice';
import { brl, fmtDate } from '../../utils/format';
import { colors } from '../../utils/theme';
import { confirmAction, showAlert } from '../../utils/alert';
import CardItem from '../../components/CardItem';
import { PrimaryButton } from '../../components/ui';

export default function CardDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { cards, transactions, payInvoice, removeCard } = useCards();

  const card = cards.find((c) => String(c.id) === String(id));

  if (!card) {
    return (
      <View style={s.center}>
        <Text style={s.muted}>Cartão não encontrado.</Text>
        <PrimaryButton title="Voltar" onPress={() => router.back()} />
      </View>
    );
  }

  const invoice = getInvoice(card, transactions);

  const handlePay = () => {
    if (invoice.total <= 0 || invoice.items.length === 0) {
      showAlert('Fatura sem pendências', 'Não há compras em aberto nesta fatura.');
      return;
    }

    confirmAction({
      title: 'Pagar fatura',
      message: `Deseja pagar a fatura de ${brl(invoice.total)} do cartão ${card.bank}? As despesas serão marcadas como pagas e o limite será liberado imediatamente.`,
      confirmText: 'Pagar fatura',
      onConfirm: () => {
        try {
          payInvoice(card, invoice.items);
          showAlert('Sucesso', 'Fatura paga e limite restabelecido!');
        } catch (e) {
          showAlert('Erro ao pagar fatura', e?.message || String(e));
        }
      },
    });
  };

  const handleRemove = () => {
    confirmAction({
      title: 'Excluir cartão',
      message: `Tem certeza que deseja excluir o cartão ${card.bank}? O cartão e todas as despesas vinculadas a ele serão apagados permanentemente.`,
      confirmText: 'Excluir cartão',
      destructive: true,
      onConfirm: () => {
        try {
          router.back();
          removeCard(card);
        } catch (e) {
          showAlert('Erro ao excluir cartão', e?.message || String(e));
        }
      },
    });
  };

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
        onPress={handlePay}
        disabled={invoice.total <= 0}
      />

      <Text style={s.section}>
        Compras da fatura ({fmtDate(invoice.start)} a {fmtDate(invoice.end)})
      </Text>
      {invoice.items.length === 0 ? (
        <Text style={s.muted}>Nenhuma compra nesta fatura.</Text>
      ) : (
        invoice.items.map((t) => (
          <View key={String(t.id)} style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>{t.description}</Text>
              <Text style={s.sub}>{fmtDate(t.date)}</Text>
            </View>
            <Text style={s.title}>{brl(t.amount)}</Text>
          </View>
        ))
      )}

      <View style={{ marginTop: 16 }}>
        <PrimaryButton
          title="Excluir cartão"
          variant="danger"
          onPress={handleRemove}
        />
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
