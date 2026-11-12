import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  CURRENCIES,
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
} from '../constants/categories';

const DataContext = createContext(null);
export const useData = () => useContext(DataContext);

const FALLBACK = { icon: 'dots-horizontal', color: '#64748B' };

// Firestore writes are not awaited on purpose: the snapshot listener updates the UI instantly
// (even offline) and errors are shown in an alert.
const run = (promise) =>
  promise.catch((e) => Alert.alert('Error', e?.message || 'Could not save data.'));

export function DataProvider({ uid, currency = 'BDT', children }) {
  const [transactions, setTransactions] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [budgets, setBudgets] = useState({}); // { categoryId | 'overall': limit }
  const [loading, setLoading] = useState(true);

  const col = (name) => collection(db, 'users', uid, name);

  useEffect(() => {
    const unsubs = [
      onSnapshot(
        query(col('transactions'), orderBy('date', 'desc')),
        (snap) => {
          setTransactions(
            snap.docs.map((d) => {
              const x = d.data();
              return { id: d.id, ...x, date: x.date?.toDate ? x.date.toDate() : new Date() };
            })
          );
          setLoading(false);
        },
        () => setLoading(false)
      ),
      onSnapshot(col('categories'), (snap) =>
        setCustomCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      ),
      onSnapshot(col('budgets'), (snap) => {
        const map = {};
        snap.docs.forEach((d) => (map[d.id] = d.data().limit));
        setBudgets(map);
      }),
    ];
    return () => unsubs.forEach((u) => u());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  const symbol = CURRENCIES.find((c) => c.code === currency)?.symbol || '৳';

  const categories = useMemo(
    () => [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES, ...customCategories],
    [customCategories]
  );

  const getCategory = (id, fallbackName) =>
    categories.find((c) => c.id === id) || { id, name: fallbackName || 'Other', ...FALLBACK };

  const categoriesOfType = (type) => categories.filter((c) => c.type === type);

  const toDoc = (t) => ({
    type: t.type,
    amount: t.amount,
    title: t.title,
    categoryId: t.categoryId,
    categoryName: t.categoryName,
    paymentMethod: t.paymentMethod,
    date: Timestamp.fromDate(t.date),
  });

  const addTransaction = (t) =>
    run(addDoc(col('transactions'), { ...toDoc(t), createdAt: serverTimestamp() }));
  const updateTransaction = (id, t) => run(updateDoc(doc(db, 'users', uid, 'transactions', id), toDoc(t)));
  const removeTransaction = (id) => run(deleteDoc(doc(db, 'users', uid, 'transactions', id)));

  const addCategory = (c) => run(addDoc(col('categories'), c));
  const removeCategory = (id) => run(deleteDoc(doc(db, 'users', uid, 'categories', id)));

  const setBudget = (categoryId, limit) =>
    run(setDoc(doc(db, 'users', uid, 'budgets', categoryId), { limit }));
  const removeBudget = (categoryId) => run(deleteDoc(doc(db, 'users', uid, 'budgets', categoryId)));

  const value = {
    loading,
    symbol,
    transactions,
    categories,
    customCategories,
    budgets,
    getCategory,
    categoriesOfType,
    addTransaction,
    updateTransaction,
    removeTransaction,
    addCategory,
    removeCategory,
    setBudget,
    removeBudget,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
