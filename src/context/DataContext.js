


// import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
// import { Alert } from 'react-native';
// import {
//   addDoc,
//   collection,
//   deleteDoc,
//   doc,
//   onSnapshot,
//   orderBy,
//   query,
//   serverTimestamp,
//   setDoc,
//   Timestamp,
//   updateDoc,
// } from 'firebase/firestore';
// import { db } from '../firebase';
// import {
//   CURRENCIES,
//   DEFAULT_EXPENSE_CATEGORIES,
//   DEFAULT_INCOME_CATEGORIES,
// } from '../constants/categories';

// const DataContext = createContext(null);
// export const useData = () => useContext(DataContext);

// const FALLBACK = { icon: 'dots-horizontal', color: '#64748B' };

// const run = (promise) =>
//   promise.catch((e) => Alert.alert('Error', e?.message || 'Could not save data.'));

// export function DataProvider({ uid, currency = 'BDT', children }) {
//   const [transactions, setTransactions] = useState([]);
//   const [customCategories, setCustomCategories] = useState([]);
//   const [budgets, setBudgets] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [refreshKey, setRefreshKey] = useState(0);

//   const col = (name) => collection(db, 'users', uid, name);

//   useEffect(() => {
//     if (!uid) {
//       setTransactions([]);
//       setCustomCategories([]);
//       setBudgets({});
//       setLoading(false);
//       return undefined;
//     }

//     setLoading(true);

//     const unsubs = [
//       onSnapshot(
//         query(col('transactions'), orderBy('date', 'desc')),
//         (snap) => {
//           setTransactions(
//             snap.docs.map((d) => {
//               const x = d.data();
//               return { id: d.id, ...x, date: x.date?.toDate ? x.date.toDate() : new Date() };
//             })
//           );
//           setLoading(false);
//         },
//         (err) => {
//           console.log('Transactions listener error:', err);
//           setLoading(false);
//         }
//       ),
//       onSnapshot(
//         col('categories'),
//         (snap) => setCustomCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
//         (err) => console.log('Categories listener error:', err)
//       ),
//       onSnapshot(
//         col('budgets'),
//         (snap) => {
//           const map = {};
//           snap.docs.forEach((d) => (map[d.id] = d.data().limit));
//           setBudgets(map);
//         },
//         (err) => console.log('Budgets listener error:', err)
//       ),
//     ];

//     return () => unsubs.forEach((u) => u());
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [uid, refreshKey]);

//   // Pull-to-refresh: listener gulo abar chalu kore server theke notun data ane
//   const refresh = useCallback(
//     () =>
//       new Promise((resolve) => {
//         setRefreshKey((k) => k + 1);
//         setTimeout(resolve, 900);
//       }),
//     []
//   );

//   const symbol = CURRENCIES.find((c) => c.code === currency)?.symbol || '৳';

//   const categories = useMemo(
//     () => [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES, ...customCategories],
//     [customCategories]
//   );

//   const getCategory = (id, fallbackName) =>
//     categories.find((c) => c.id === id) || { id, name: fallbackName || 'Other', ...FALLBACK };

//   const categoriesOfType = (type) => categories.filter((c) => c.type === type);

//   const toDoc = (t) => ({
//     type: t.type,
//     amount: t.amount,
//     title: t.title,
//     categoryId: t.categoryId,
//     categoryName: t.categoryName,
//     paymentMethod: t.paymentMethod,
//     date: Timestamp.fromDate(t.date instanceof Date ? t.date : new Date(t.date)),
//   });

//   // Optimistic update + Firestore write যাতে প্রথমবার সাইনআপের পরও সাথে সাথে দেখায়
//   const addTransaction = (t) => {
//     const tempId = 'temp_' + Date.now();
//     const optimisticItem = {
//       id: tempId,
//       ...t,
//       date: t.date instanceof Date ? t.date : new Date(t.date),
//     };
//     setTransactions((prev) =>
//       [optimisticItem, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date))
//     );

//     run(
//       addDoc(col('transactions'), { ...toDoc(t), createdAt: serverTimestamp() }).then((docRef) => {
//         setTransactions((prev) =>
//           prev.map((item) => (item.id === tempId ? { ...item, id: docRef.id } : item))
//         );
//       })
//     );
//   };

//   const updateTransaction = (id, t) => {
//     setTransactions((prev) =>
//       prev
//         .map((item) =>
//           item.id === id
//             ? { ...item, ...t, date: t.date instanceof Date ? t.date : new Date(t.date) }
//             : item
//         )
//         .sort((a, b) => new Date(b.date) - new Date(a.date))
//     );
//     if (!id.startsWith('temp_')) {
//       run(updateDoc(doc(db, 'users', uid, 'transactions', id), toDoc(t)));
//     }
//   };

//   const removeTransaction = (id) => {
//     setTransactions((prev) => prev.filter((item) => item.id !== id));
//     if (!id.startsWith('temp_')) {
//       run(deleteDoc(doc(db, 'users', uid, 'transactions', id)));
//     }
//   };

//   const addCategory = (c) => run(addDoc(col('categories'), c));
//   const removeCategory = (id) => run(deleteDoc(doc(db, 'users', uid, 'categories', id)));

//   const setBudget = (categoryId, limit) => {
//     setBudgets((prev) => ({ ...prev, [categoryId]: limit }));
//     run(setDoc(doc(db, 'users', uid, 'budgets', categoryId), { limit }));
//   };

//   const removeBudget = (categoryId) => {
//     setBudgets((prev) => {
//       const next = { ...prev };
//       delete next[categoryId];
//       return next;
//     });
//     run(deleteDoc(doc(db, 'users', uid, 'budgets', categoryId)));
//   };

//   const value = {
//     loading,
//     symbol,
//     transactions,
//     categories,
//     customCategories,
//     budgets,
//     refresh,
//     getCategory,
//     categoriesOfType,
//     addTransaction,
//     updateTransaction,
//     removeTransaction,
//     addCategory,
//     removeCategory,
//     setBudget,
//     removeBudget,
//   };

//   return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
// }







import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
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
import CustomAlert from '../components/CustomAlert'; // Import your custom alert component

const DataContext = createContext(null);
export const useData = () => useContext(DataContext);

const FALLBACK = { icon: 'dots-horizontal', color: '#64748B' };

export function DataProvider({ uid, currency = 'BDT', children }) {
  const [transactions, setTransactions] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'error',
    showCancel: false,
    confirmText: 'Okay, Got it',
    cancelText: 'Cancel',
    onConfirm: null,
    onCancel: null,
  });

  const showAlert = (title, message, type = 'error', options = {}) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
      showCancel: options.showCancel || false,
      confirmText: options.confirmText || 'Okay, Got it',
      cancelText: options.cancelText || 'Cancel',
      onConfirm: options.onConfirm || null,
      onCancel: options.onCancel || null,
    });
  };

  const hideAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  const run = (promise) =>
    promise.catch((e) => showAlert('Error', e?.message || 'Could not save data.', 'error'));

  const col = (name) => collection(db, 'users', uid, name);

  useEffect(() => {
    if (!uid) {
      setTransactions([]);
      setCustomCategories([]);
      setBudgets({});
      setLoading(false);
      return undefined;
    }

    setLoading(true);

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
        (err) => {
          console.log('Transactions listener error:', err);
          setLoading(false);
        }
      ),
      onSnapshot(
        col('categories'),
        (snap) => setCustomCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
        (err) => console.log('Categories listener error:', err)
      ),
      onSnapshot(
        col('budgets'),
        (snap) => {
          const map = {};
          snap.docs.forEach((d) => (map[d.id] = d.data().limit));
          setBudgets(map);
        },
        (err) => console.log('Budgets listener error:', err)
      ),
    ];

    return () => unsubs.forEach((u) => u());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, refreshKey]);

  // Pull-to-refresh: restarts listeners and fetches fresh data from the server
  const refresh = useCallback(
    () =>
      new Promise((resolve) => {
        setRefreshKey((k) => k + 1);
        setTimeout(resolve, 900);
      }),
    []
  );

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
    date: Timestamp.fromDate(t.date instanceof Date ? t.date : new Date(t.date)),
  });

  // Optimistic update + Firestore write so data appears immediately even right after signup
  const addTransaction = (t) => {
    const tempId = 'temp_' + Date.now();
    const optimisticItem = {
      id: tempId,
      ...t,
      date: t.date instanceof Date ? t.date : new Date(t.date),
    };
    setTransactions((prev) =>
      [optimisticItem, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date))
    );

    run(
      addDoc(col('transactions'), { ...toDoc(t), createdAt: serverTimestamp() }).then((docRef) => {
        setTransactions((prev) =>
          prev.map((item) => (item.id === tempId ? { ...item, id: docRef.id } : item))
        );
      })
    );
  };

  const updateTransaction = (id, t) => {
    setTransactions((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, ...t, date: t.date instanceof Date ? t.date : new Date(t.date) }
            : item
        )
        .sort((a, b) => new Date(b.date) - new Date(a.date))
    );
    if (!id.startsWith('temp_')) {
      run(updateDoc(doc(db, 'users', uid, 'transactions', id), toDoc(t)));
    }
  };

  const removeTransaction = (id) => {
    setTransactions((prev) => prev.filter((item) => item.id !== id));
    if (!id.startsWith('temp_')) {
      run(deleteDoc(doc(db, 'users', uid, 'transactions', id)));
    }
  };

  const addCategory = (c) => run(addDoc(col('categories'), c));
  const removeCategory = (id) => run(deleteDoc(doc(db, 'users', uid, 'categories', id)));

  const setBudget = (categoryId, limit) => {
    setBudgets((prev) => ({ ...prev, [categoryId]: limit }));
    run(setDoc(doc(db, 'users', uid, 'budgets', categoryId), { limit }));
  };

  const removeBudget = (categoryId) => {
    setBudgets((prev) => {
      const next = { ...prev };
      delete next[categoryId];
      return next;
    });
    run(deleteDoc(doc(db, 'users', uid, 'budgets', categoryId)));
  };

  const value = {
    loading,
    symbol,
    transactions,
    categories,
    customCategories,
    budgets,
    refresh,
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

  return (
    <DataContext.Provider value={value}>
      {children}
      {/* Global Custom Alert Component */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        showCancel={alertConfig.showCancel}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        onClose={hideAlert}
        onConfirm={alertConfig.onConfirm || hideAlert}
        onCancel={alertConfig.onCancel || hideAlert}
      />
    </DataContext.Provider>
  );
}







