import { addMonths, sameMonth, shortMonth } from './format';

export const totals = (list) =>
  list.reduce(
    (acc, t) => {
      if (t.type === 'income') acc.income += t.amount;
      else acc.expense += t.amount;
      return acc;
    },
    { income: 0, expense: 0 }
  );

// [{ id, name, total }] for expenses, biggest first
export const expenseByCategory = (list) => {
  const map = {};
  list.forEach((t) => {
    if (t.type !== 'expense') return;
    if (!map[t.categoryId]) map[t.categoryId] = { id: t.categoryId, name: t.categoryName, total: 0 };
    map[t.categoryId].total += t.amount;
  });
  return Object.values(map).sort((a, b) => b.total - a.total);
};

// last n months ending at endDate: [{ label, income, expense }]
export const lastMonths = (list, endDate, n = 6) => {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const m = addMonths(endDate, -i);
    const t = totals(list.filter((x) => sameMonth(x.date, m)));
    out.push({ label: shortMonth(m), income: t.income, expense: t.expense });
  }
  return out;
};
