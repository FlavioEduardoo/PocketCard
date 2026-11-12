import { Pressable, StyleSheet, Text, View } from 'react-native';
import { brl, fmtDate } from '../utils/format';

// Cartão estilo "plástico": fatura atual x limite restante
export default function CardItem({ card, invoice, onPress }) {
  const used = card.used || 0;
  const remaining = card.limit - used;
  const pct = Math.min(used / card.limit, 1);
  const barColor = pct >= 1 ? '#FF6B5E' : pct >= 0.8 ? '#FFC93C' : '#7CF0B8';

  return (
    <Pressable onPress={onPress} disabled={!onPress} style={[s.card, { backgroundColor: card.color }]}>
      <View style={s.row}>
        <Text style={s.bank}>{card.bank}</Text>
        <Text style={s.tag}>{card.type === 'virtual' ? 'Virtual' : 'Físico'}</Text>
      </View>

      <Text style={s.label}>Fatura atual</Text>
      <Text style={s.invoice}>{brl(invoice.total)}</Text>

      <View style={s.track}>
        <View style={[s.fill, { width: `${pct * 100}%`, backgroundColor: barColor }]} />
      </View>

      <View style={s.row}>
        <View>
          <Text style={s.label}>Limite restante</Text>
          <Text style={[s.value, remaining <= 0 && { color: '#FF9C94' }]}>{brl(remaining)}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={s.label}>Limite total</Text>
          <Text style={s.value}>{brl(card.limit)}</Text>
        </View>
      </View>

      <Text style={s.footer}>
        Fecha dia {card.closingDay} · vence em {fmtDate(invoice.dueDate)}
      </Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: 18, padding: 18, gap: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bank: { color: '#fff', fontSize: 18, fontWeight: '700' },
  tag: {
    color: '#fff',
    fontSize: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
  },
  label: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 10 },
  invoice: { color: '#fff', fontSize: 30, fontWeight: '800' },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginTop: 10,
    overflow: 'hidden',
  },
  fill: { height: 8, borderRadius: 4 },
  value: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 12 },
});