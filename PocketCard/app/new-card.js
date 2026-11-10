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