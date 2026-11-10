    import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useCards } from '../../store/cards-context';
import { getInvoice } from '../../utils/invoice';
import { brl } from '../../utils/format';
import { colors } from '../../utils/theme';
import CardItem from '../../components/CardItem';
import FadeIn from '../../components/FadeIn';
import { PrimaryButton } from '../../components/ui';

export default function CardsScreen() {
  const router = useRouter();
  const { cards, transactions, loading, error } = useCards();

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={s.center}>
        <Text style={s.error}>Erro ao conectar ao Firebase: {error}</Text>
      </View>
    );
  }

  const data = cards.map((card) => ({ card, invoice: getInvoice(card, transactions) }));
  const available = cards.reduce((sum, c) => sum + (c.limit - (c.used || 0)), 0);

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.card.id}
      contentContainerStyle={{ padding: 16, gap: 14, flexGrow: 1 }}
      ListHeaderComponent={
        <View style={{ gap: 12, marginBottom: 4 }}>
          {cards.length > 0 && (
            <View>
              <Text style={s.muted}>Limite disponível em todos os cartões</Text>
              <Text style={s.big}>{brl(available)}</Text>
            </View>
          )}
          <PrimaryButton title="Novo cartão" onPress={() => router.push('/new-card')} />
        </View>
      }
      ListEmptyComponent={
        <Text style={s.empty}>Nenhum cartão ainda. Cadastre o primeiro para começar a lançar despesas.</Text>
      }
      renderItem={({ item, index }) => (
        <FadeIn delay={index * 80}>
          <CardItem
            card={item.card}
            invoice={item.invoice}
            onPress={() => router.push(`/card/${item.card.id}`)}
          />
        </FadeIn>
      )}
    />
  );
}

const s = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  error: { color: colors.danger, textAlign: 'center' },
  muted: { color: colors.muted, fontSize: 13 },
  big: { fontSize: 32, fontWeight: '800', color: colors.ink },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40 },
});