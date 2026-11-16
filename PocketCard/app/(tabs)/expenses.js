import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCards } from '../../store/cards-context';
import { brl, fmtDate } from '../../utils/format';
import { colors } from '../../utils/theme';
import { confirmAction, showAlert } from '../../utils/alert';
import FadeIn from '../../components/FadeIn';
import { PrimaryButton } from '../../components/ui';

export default function ExpensesScreen() {
  const router = useRouter();
  const { cards, transactions, removeExpense } = useCards();

  const confirmDelete = (tx) => {
    confirmAction({
      title: 'Excluir despesa',
      message: `Remover "${tx.description}"? O valor de ${brl(tx.amount)} volta para o limite.`,
      confirmText: 'Excluir',
      destructive: true,
      onConfirm: () => {
        try {
          removeExpense(tx);
        } catch (e) {
          showAlert('Erro ao excluir', e?.message || String(e));
        }
      },
    });
  };

  return (
    <FlatList
      data={transactions}
      keyExtractor={(t) => String(t.id)}
      contentContainerStyle={{ padding: 16, gap: 10, flexGrow: 1 }}
      ListHeaderComponent={
        <View style={{ marginBottom: 6 }}>
          <PrimaryButton title="Nova despesa" onPress={() => router.push('/new-expense')} />
        </View>
      }
      ListEmptyComponent={<Text style={s.empty}>Nenhuma despesa lançada.</Text>}
      renderItem={({ item, index }) => {
        const card = cards.find((c) => String(c.id) === String(item.cardId));
        return (
          <FadeIn delay={Math.min(index, 8) * 50} style={s.row}>
            <View style={[s.dot, { backgroundColor: card?.color || colors.muted }]} />
            <View style={{ flex: 1 }}>
              <Text style={s.title}>{item.description}</Text>
              <Text style={s.sub}>
                {card?.bank || 'Cartão não encontrado'} · {fmtDate(item.date)}
                {item.paid ? ' · paga' : ''}
              </Text>
            </View>
            <Text style={s.amount}>{brl(item.amount)}</Text>
            <Pressable
              onPress={() => confirmDelete(item)}
              hitSlop={12}
              style={({ pressed }) => [{ padding: 6 }, pressed && { opacity: 0.6 }]}
            >
              <Ionicons name="trash-outline" size={22} color={colors.danger} />
            </Pressable>
          </FadeIn>
        );
      }}
    />
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  title: { fontSize: 16, fontWeight: '600', color: colors.ink },
  sub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  amount: { fontSize: 16, fontWeight: '700', color: colors.ink },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40 },
});
