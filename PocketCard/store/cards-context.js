import { createContext, useContext, useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { notifyLimitReached, syncDueReminders } from '../services/notifications';
import { getInvoice } from '../utils/invoice';

const CardsContext = createContext(null);

export function CardsProvider({ children }) {
  const [cards, setCards] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tempo real: qualquer mudança no Firestore atualiza as telas
  useEffect(() => {
    const unsubCards = onSnapshot(
      query(collection(db, 'cards'), orderBy('createdAt', 'asc')),
      (snap) => {
        setCards(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (e) => {
        setError(e.message);
        setLoading(false);
      }
    );
    const unsubTx = onSnapshot(
      collection(db, 'transactions'),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setTransactions(list.sort((a, b) => b.date - a.date));
      },
      (e) => setError(e.message)
    );
    return () => {
      unsubCards();
      unsubTx();
    };
  }, []);

  // Reagenda os avisos de vencimento sempre que cartões ou gastos mudam
  useEffect(() => {
    if (loading) return;
    const items = cards.map((card) => ({ card, invoice: getInvoice(card, transactions) }));
    syncDueReminders(items).catch(() => {});
  }, [cards, transactions, loading]);

  const addCard = (data) =>
    addDoc(collection(db, 'cards'), { ...data, used: 0, createdAt: Date.now() });

  // Lança a despesa e desconta do limite do cartão escolhido (tudo em um único batch)
  const addExpense = async ({ cardId, description, amount, date }) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card) throw new Error('Cartão não encontrado.');
    const batch = writeBatch(db);
    batch.set(doc(collection(db, 'transactions')), {
      cardId,
      description,
      amount,
      date: date.getTime(),
      paid: false,
      createdAt: Date.now(),
    });
    batch.update(doc(db, 'cards', cardId), { used: increment(amount) });
    await batch.commit();
    if ((card.used || 0) + amount >= card.limit) {
      await notifyLimitReached(card).catch(() => {});
    }
  };

  // Excluir a despesa devolve o valor ao limite
  const removeExpense = async (tx) => {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'transactions', tx.id));
    if (!tx.paid) {
      batch.update(doc(db, 'cards', tx.cardId), { used: increment(-tx.amount) });
    }
    await batch.commit();
  };

  // Pagar a fatura libera o limite e marca as despesas como pagas
  const payInvoice = async (card, items) => {
    const total = items.reduce((sum, t) => sum + t.amount, 0);
    const batch = writeBatch(db);
    items.forEach((t) => batch.update(doc(db, 'transactions', t.id), { paid: true }));
    batch.update(doc(db, 'cards', card.id), { used: increment(-total) });
    await batch.commit();
  };

  const removeCard = async (card) => {
    const batch = writeBatch(db);
    transactions
      .filter((t) => t.cardId === card.id)
      .forEach((t) => batch.delete(doc(db, 'transactions', t.id)));
    batch.delete(doc(db, 'cards', card.id));
    await batch.commit();
  };

  return (
    <CardsContext.Provider
      value={{
        cards,
        transactions,
        loading,
        error,
        addCard,
        addExpense,
        removeExpense,
        payInvoice,
        removeCard,
      }}
    >
      {children}
    </CardsContext.Provider>
  );
}

export const useCards = () => useContext(CardsContext);