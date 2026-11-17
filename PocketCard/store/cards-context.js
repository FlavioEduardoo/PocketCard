import { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './auth-context';
import { notifyLimitReached, syncDueReminders } from '../services/notifications';
import { getInvoice } from '../utils/invoice';
import { showAlert } from '../utils/alert';

const CardsContext = createContext(null);

const reportError = (e) => showAlert('Erro no Firebase', e?.message || String(e));

export function CardsProvider({ children }) {
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [offline, setOffline] = useState(false);

  // Escuta dados do Firestore em tempo real
  useEffect(() => {
    if (!user) {
      setCards([]);
      setTransactions([]);
      setLoading(false);
      return;
    }

    const unsubCards = onSnapshot(
      query(collection(db, 'cards'), orderBy('createdAt', 'asc')),
      { includeMetadataChanges: true },
      (snap) => {
        setCards(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setOffline(snap.metadata.fromCache);
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
        setTransactions(list.sort((a, b) => (b.date || 0) - (a.date || 0)));
      },
      (e) => setError(e.message)
    );

    return () => {
      unsubCards();
      unsubTx();
    };
  }, [user]);

  // Reagenda os avisos de vencimento sempre que cartões ou gastos mudam
  useEffect(() => {
    if (loading || !user) return;
    const items = cards.map((card) => ({ card, invoice: getInvoice(card, transactions) }));
    syncDueReminders(items).catch(() => {});
  }, [cards, transactions, loading, user]);

  /**
   * Adiciona o cartão imediatamente na UI e sincroniza em background
   */
  const addCard = (data) => {
    const cardRef = doc(collection(db, 'cards'));
    const newCard = {
      ...data,
      used: 0,
      userId: user?.uid || null,
      createdAt: Date.now(),
    };

    setCards((prev) => [...prev, { id: cardRef.id, ...newCard }]);
    setDoc(cardRef, newCard).catch(reportError);
    return cardRef.id;
  };

  /**
   * Edita os dados de um cartão existente
   */
  const editCard = (cardId, updatedData) => {
    setCards((prev) =>
      prev.map((c) => (String(c.id) === String(cardId) ? { ...c, ...updatedData } : c))
    );
    const cardRef = doc(db, 'cards', String(cardId));
    updateDoc(cardRef, updatedData).catch(reportError);
  };

  /**
   * Lança a despesa atualizando a interface e enviando o batch ao Firestore
   */
  const addExpense = ({ cardId, description, amount, date }) => {
    const card = cards.find((c) => String(c.id) === String(cardId));
    if (!card) throw new Error('Cartão não encontrado.');

    const timestamp = date instanceof Date ? date.getTime() : new Date(date).getTime();
    const txRef = doc(collection(db, 'transactions'));
    const newTx = {
      id: txRef.id,
      cardId,
      description,
      amount,
      date: timestamp,
      paid: false,
      userId: user?.uid || null,
      createdAt: Date.now(),
    };

    setTransactions((prev) => [newTx, ...prev]);
    setCards((prev) =>
      prev.map((c) => (String(c.id) === String(cardId) ? { ...c, used: (c.used || 0) + amount } : c))
    );

    const batch = writeBatch(db);
    batch.set(txRef, {
      cardId,
      description,
      amount,
      date: timestamp,
      paid: false,
      userId: user?.uid || null,
      createdAt: Date.now(),
    });
    batch.update(doc(db, 'cards', String(cardId)), { used: increment(amount) });
    batch.commit().catch(reportError);

    if ((card.used || 0) + amount >= card.limit) {
      notifyLimitReached(card).catch(() => {});
    }
  };

  /**
   * Edita uma despesa existente (recalculando diferença de valor se houver)
   */
  const editExpense = (txId, { cardId, description, amount, date }) => {
    const oldTx = transactions.find((t) => String(t.id) === String(txId));
    if (!oldTx) return;

    const timestamp = date instanceof Date ? date.getTime() : new Date(date).getTime();
    const diff = amount - oldTx.amount;

    setTransactions((prev) =>
      prev.map((t) =>
        String(t.id) === String(txId)
          ? { ...t, cardId, description, amount, date: timestamp }
          : t
      )
    );

    if (!oldTx.paid && diff !== 0) {
      setCards((prev) =>
        prev.map((c) =>
          String(c.id) === String(cardId) ? { ...c, used: (c.used || 0) + diff } : c
        )
      );
    }

    const batch = writeBatch(db);
    const txRef = doc(db, 'transactions', String(txId));
    batch.update(txRef, {
      cardId,
      description,
      amount,
      date: timestamp,
    });

    if (!oldTx.paid && diff !== 0) {
      batch.update(doc(db, 'cards', String(cardId)), { used: increment(diff) });
    }

    batch.commit().catch(reportError);
  };

  /**
   * Exclui despesa estornando o valor do limite imediatamente
   */
  const removeExpense = (tx) => {
    setTransactions((prev) => prev.filter((t) => String(t.id) !== String(tx.id)));
    if (!tx.paid) {
      setCards((prev) =>
        prev.map((c) =>
          String(c.id) === String(tx.cardId) ? { ...c, used: Math.max(0, (c.used || 0) - tx.amount) } : c
        )
      );
    }

    const batch = writeBatch(db);
    batch.delete(doc(db, 'transactions', String(tx.id)));
    if (!tx.paid) {
      batch.update(doc(db, 'cards', String(tx.cardId)), { used: increment(-tx.amount) });
    }
    batch.commit().catch(reportError);
  };

  /**
   * Paga fatura liberando o limite e marcando itens como pagos imediatamente
   */
  const payInvoice = (card, items) => {
    if (!items || items.length === 0) return;
    const total = items.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const itemIds = new Set(items.map((t) => String(t.id)));

    setTransactions((prev) =>
      prev.map((t) => (itemIds.has(String(t.id)) ? { ...t, paid: true } : t))
    );
    setCards((prev) =>
      prev.map((c) =>
        String(c.id) === String(card.id) ? { ...c, used: Math.max(0, (c.used || 0) - total) } : c
      )
    );

    const batch = writeBatch(db);
    items.forEach((t) => {
      batch.update(doc(db, 'transactions', String(t.id)), { paid: true });
    });
    batch.update(doc(db, 'cards', String(card.id)), { used: increment(-total) });
    batch.commit().catch(reportError);
  };

  /**
   * Exclui o cartão e suas transações vinculadas
   */
  const removeCard = (card) => {
    setCards((prev) => prev.filter((c) => String(c.id) !== String(card.id)));
    setTransactions((prev) => prev.filter((t) => String(t.cardId) !== String(card.id)));

    const batch = writeBatch(db);
    transactions
      .filter((t) => String(t.cardId) === String(card.id))
      .forEach((t) => batch.delete(doc(db, 'transactions', String(t.id))));
    batch.delete(doc(db, 'cards', String(card.id)));
    batch.commit().catch(reportError);
  };

  return (
    <CardsContext.Provider
      value={{
        cards,
        transactions,
        loading,
        error,
        offline,
        addCard,
        editCard,
        addExpense,
        editExpense,
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
