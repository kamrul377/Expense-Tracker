const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const formatMoney = (amount, symbol = '৳') => {
  const v = Number(amount) || 0;
  const [int, dec] = Math.abs(v).toFixed(2).split('.');
  const withCommas = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${v < 0 ? '-' : ''}${symbol}${withCommas}.${dec}`;
};

export const formatDate = (d) =>
  `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

export const monthLabel = (d) => `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
export const shortMonth = (d) => MONTHS[d.getMonth()];

export const sameMonth = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

export const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);
