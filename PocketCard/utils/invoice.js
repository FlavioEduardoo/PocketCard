// Dia do mês limitado ao tamanho do mês (ex.: dia 31 em fevereiro vira 28/29)
const clampDay = (y, m, d) => new Date(y, m, Math.min(d, new Date(y, m + 1, 0).getDate()));
const endOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

// Período da fatura aberta: do dia seguinte ao último fechamento até o próximo fechamento
export function getCycle(closingDay, ref = new Date()) {
  const y = ref.getFullYear();
  const m = ref.getMonth();
  const closeThis = endOfDay(clampDay(y, m, closingDay));
  let start;
  let end;
  if (ref <= closeThis) {
    end = closeThis;
    const prev = clampDay(y, m - 1, closingDay);
    start = new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 1);
  } else {
    start = new Date(closeThis.getFullYear(), closeThis.getMonth(), closeThis.getDate() + 1);
    end = endOfDay(clampDay(y, m + 1, closingDay));
  }
  return { start, end };
}

export function getDueDate(card, ref = new Date()) {
  const { end } = getCycle(card.closingDay, ref);
  const offset = card.dueDay > card.closingDay ? 0 : 1;
  return clampDay(end.getFullYear(), end.getMonth() + offset, card.dueDay);
}

export function getInvoice(card, transactions, ref = new Date()) {
  const { start, end } = getCycle(card.closingDay, ref);
  const items = transactions.filter(
    (t) =>
      t.cardId === card.id &&
      !t.paid &&
      t.date >= start.getTime() &&
      t.date <= end.getTime()
  );
  const total = items.reduce((sum, t) => sum + t.amount, 0);
  return { items, total, start, end, dueDate: getDueDate(card, ref) };
}