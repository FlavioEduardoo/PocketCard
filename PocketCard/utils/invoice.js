// Dia do mês limitado ao tamanho do mês (ex.: dia 31 em fevereiro vira 28/29)
const clampDay = (y, m, d) => new Date(y, m, Math.min(d, new Date(y, m + 1, 0).getDate()));
const endOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

// Período da fatura aberta: do dia seguinte ao último fechamento até o próximo fechamento
export function getCycle(closingDay, ref = new Date()) {
  const safeClosing = Math.max(1, Math.min(31, Number(closingDay) || 1));
  const y = ref.getFullYear();
  const m = ref.getMonth();
  const closeThis = endOfDay(clampDay(y, m, safeClosing));
  let start;
  let end;
  if (ref <= closeThis) {
    end = closeThis;
    const prev = clampDay(y, m - 1, safeClosing);
    start = new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 1);
  } else {
    start = new Date(closeThis.getFullYear(), closeThis.getMonth(), closeThis.getDate() + 1);
    end = endOfDay(clampDay(y, m + 1, safeClosing));
  }
  return { start, end };
}

export function getDueDate(card, ref = new Date()) {
  const { end } = getCycle(card.closingDay, ref);
  const closing = Number(card.closingDay) || 1;
  const due = Number(card.dueDay) || 1;
  const offset = due > closing ? 0 : 1;
  return clampDay(end.getFullYear(), end.getMonth() + offset, due);
}

export function getInvoice(card, transactions, ref = new Date()) {
  if (!card) {
    return { items: [], total: 0, start: new Date(), end: new Date(), dueDate: new Date() };
  }
  const { start, end } = getCycle(card.closingDay, ref);
  const items = (transactions || []).filter(
    (t) =>
      String(t.cardId) === String(card.id) &&
      !t.paid &&
      t.date >= start.getTime() &&
      t.date <= end.getTime()
  );
  const total = items.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  return { items, total, start, end, dueDate: getDueDate(card, ref) };
}
