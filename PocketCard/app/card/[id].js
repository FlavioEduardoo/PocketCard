import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCards } from '../../store/cards-context';
import { useTheme } from '../../utils/theme';
import { getInvoice } from '../../utils/invoice';
import { brl, fmtDate } from '../../utils/format';
import { confirmAction, showAlert } from '../../utils/alert';
import CardItem from '../../components/CardItem';
import { PrimaryButton, GlassCard } from '../../components/ui';

export default function CardDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { cards, transactions, payInvoice, removeCard } = useCards();
  const { colors } = useTheme();

  const card = cards.find((c) => String(c.id) === String(id));

  if (!card) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <Text style={{ color: colors.muted }}>Cartão não encontrado.</Text>
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
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: colors.bg }]}
    >
      {/* Visual do Cartão com botão de edição */}
      <CardItem
        card={card}
        invoice={invoice}
        onEdit={() => router.push({ pathname: '/edit-card', params: { id: card.id } })}
      />

      {/* Botões de Ação Principais */}
      <View style={styles.actionRow}>
        <View style={{ flex: 1 }}>
          <PrimaryButton
            title="Nova Despesa"
            icon={<Ionicons name="add" size={18} color="#FFF" />}
            onPress={() => router.push({ pathname: '/new-expense', params: { cardId: card.id } })}
          />
        </View>
        <View style={{ flex: 1 }}>
          <PrimaryButton
            title="Editar Cartão"
            variant="outline"
            icon={<Ionicons name="pencil" size={16} color={colors.ink} />}
            onPress={() => router.push({ pathname: '/edit-card', params: { id: card.id } })}
          />
        </View>
      </View>

      <PrimaryButton
        title={invoice.total > 0 ? `Pagar Fatura (${brl(invoice.total)})` : 'Fatura sem pendências'}
        variant="secondary"
        onPress={handlePay}
        disabled={invoice.total <= 0}
        icon={<Ionicons name="checkmark-circle-outline" size={18} color="#080B12" />}
      />

      {/* Seção das Compras da Fatura */}
      <Text style={[styles.sectionTitle, { color: colors.muted }]}>
        COMPRAS DA FATURA ({fmtDate(invoice.start)} a {fmtDate(invoice.end)})
      </Text>

      {invoice.items.length === 0 ? (
        <GlassCard style={styles.emptyCard}>
          <Ionicons name="receipt-outline" size={32} color={colors.subtle} />
          <Text style={[styles.muted, { color: colors.muted }]}>Nenhuma compra nesta fatura.</Text>
        </GlassCard>
      ) : (
        invoice.items.map((t) => (
          <GlassCard key={String(t.id)} style={styles.txRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.txTitle, { color: colors.ink }]}>{t.description}</Text>
              <Text style={[styles.txDate, { color: colors.muted }]}>{fmtDate(t.date)}</Text>
            </View>
            <Text style={[styles.txAmount, { color: colors.ink }]}>{brl(t.amount)}</Text>
          </GlassCard>
        ))
      )}

      {/* Área Destrutiva */}
      <View style={{ marginTop: 24 }}>
        <PrimaryButton
          title="Excluir este Cartão"
          variant="danger"
          onPress={handleRemove}
          icon={<Ionicons name="trash-outline" size={18} color={colors.danger} />}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 24,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 10,
    marginLeft: 4,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  muted: {
    fontSize: 13,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
  },
  txTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  txDate: {
    fontSize: 12,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 16,
    fontWeight: '850',
    letterSpacing: -0.3,
  },
});
