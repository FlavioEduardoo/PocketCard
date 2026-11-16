import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../store/auth-context';
import { useCards } from '../../store/cards-context';
import { getInvoice } from '../../utils/invoice';
import { brl } from '../../utils/format';
import { colors } from '../../utils/theme';
import { confirmAction, showAlert } from '../../utils/alert';
import CardItem from '../../components/CardItem';
import FadeIn from '../../components/FadeIn';
import { PrimaryButton } from '../../components/ui';

export default function CardsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { cards, transactions, loading, error } = useCards();

  const handleLogout = () => {
    confirmAction({
      title: 'Sair da conta',
      message: 'Deseja realmente encerrar a sessão?',
      confirmText: 'Sair',
      destructive: true,
      onConfirm: async () => {
        try {
          await logout();
          router.replace('/login');
        } catch (e) {
          showAlert('Erro ao sair', e?.message || String(e));
        }
      },
    });
  };

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
  const available = cards.reduce((sum, c) => sum + ((Number(c.limit) || 0) - (Number(c.used) || 0)), 0);

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => String(item.card.id)}
      contentContainerStyle={{ padding: 16, gap: 14, flexGrow: 1 }}
      ListHeaderComponent={
        <View style={{ gap: 12, marginBottom: 4 }}>
          <View style={s.userBar}>
            <View style={{ flex: 1 }}>
              <Text style={s.greeting}>Olá, {user?.email?.split('@')[0] || 'Usuário'}</Text>
              <Text style={s.userEmail}>{user?.email}</Text>
            </View>
            <Pressable
              onPress={handleLogout}
              style={({ pressed }) => [s.logoutBtn, pressed && { opacity: 0.6 }]}
              hitSlop={8}
            >
              <Ionicons name="log-out-outline" size={20} color={colors.danger} />
              <Text style={s.logoutText}>Sair</Text>
            </Pressable>
          </View>

          {cards.length > 0 && (
            <View style={s.limitBox}>
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
  userBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
  },
  userEmail: {
    fontSize: 12,
    color: colors.muted,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#FFE5E5',
  },
  logoutText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.danger,
  },
  limitBox: {
    marginTop: 4,
  },
  muted: { color: colors.muted, fontSize: 13 },
  big: { fontSize: 32, fontWeight: '800', color: colors.ink },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40 },
});
