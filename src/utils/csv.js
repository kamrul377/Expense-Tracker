import { formatDate } from './format';

const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export const buildCsv = (transactions, getCategory) => {
  const header = ['Date', 'Type', 'Title', 'Category', 'Payment Method', 'Amount'];
  const rows = transactions.map((t) =>
    [
      formatDate(t.date),
      t.type,
      t.title,
      getCategory(t.categoryId, t.categoryName).name,
      t.paymentMethod,
      t.amount.toFixed(2),
    ].map(esc).join(',')
  );
  return [header.map(esc).join(','), ...rows].join('\n');
};
