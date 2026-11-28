export const DEFAULT_EXPENSE_CATEGORIES = [
  { id: 'food', name: 'Food', icon: 'food', color: '#F59E0B', type: 'expense' },
  { id: 'transport', name: 'Transport', icon: 'bus', color: '#3B82F6', type: 'expense' },
  { id: 'bills', name: 'Bills', icon: 'receipt', color: '#EF4444', type: 'expense' },
  { id: 'shopping', name: 'Shopping', icon: 'cart', color: '#EC4899', type: 'expense' },
  { id: 'health', name: 'Health', icon: 'heart-pulse', color: '#10B981', type: 'expense' },
  { id: 'education', name: 'Education', icon: 'school', color: '#8B5CF6', type: 'expense' },
  { id: 'entertainment', name: 'Entertainment', icon: 'movie', color: '#F97316', type: 'expense' },
  { id: 'rent', name: 'Rent', icon: 'home', color: '#06B6D4', type: 'expense' },
  { id: 'other', name: 'Other', icon: 'dots-horizontal', color: '#64748B', type: 'expense' },
];

export const DEFAULT_INCOME_CATEGORIES = [
  { id: 'salary', name: 'Salary', icon: 'cash', color: '#34D399', type: 'income' },
  { id: 'business', name: 'Business', icon: 'briefcase', color: '#22D3EE', type: 'income' },
  { id: 'gift', name: 'Gift', icon: 'gift', color: '#F472B6', type: 'income' },
  { id: 'investment', name: 'Investment', icon: 'chart-line', color: '#A78BFA', type: 'income' },
  { id: 'other_income', name: 'Other Income', icon: 'dots-horizontal', color: '#64748B', type: 'income' },
];

export const PAYMENT_METHODS = ['Cash', 'Card', 'bKash', 'Nagad', 'Bank', 'Other'];

export const CURRENCIES = [
  { code: 'BDT', symbol: '৳' },
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'INR', symbol: '₹' },
];

// export const ICON_CHOICES = [
//   'food', 'coffee', 'bus', 'car', 'airplane', 'cart', 'tshirt-crew', 'home',
//   'lightning-bolt', 'cellphone', 'laptop', 'school', 'heart-pulse', 'dumbbell',
//   'movie', 'gift', 'paw', 'bank', 'wallet', 'cash',
// ];
export const ICON_CHOICES = [
  // Existing icons
  'food', 'coffee', 'bus', 'car', 'airplane', 'cart', 'tshirt-crew', 'home',
  'lightning-bolt', 'cellphone', 'laptop', 'school', 'heart-pulse', 'dumbbell',
  'movie', 'gift', 'paw', 'bank', 'wallet', 'cash',

  // Extra 30 icons
  'shopping', 'shopping-bag', 'bike', 'train',
  'taxi', 'fuel', 'hospital', 'pill', 'doctor',
  'book', 'music', 'gamepad-variant', 'television', 'camera',
  'tools', 'wrench', 'hammer', 'briefcase', 'office-building',
  'credit-card', 'receipt', 'chart-line', 'piggy-bank', 'currency-usd',
  'baby-carriage', 'flower', 'tree', 'beach',
];

// export const COLOR_CHOICES = [
//   '#3B82F6', '#EF4444', '#EC4899', '#10B981', '#F59E0B',
//   '#8B5CF6', '#F97316', '#06B6D4', '#22D3EE', '#A3E635',
// ];


export const COLOR_CHOICES = [
  // Original colors
  '#3B82F6', '#EF4444', '#EC4899', '#10B981', '#F59E0B',
  '#8B5CF6', '#F97316', '#06B6D4', '#22D3EE', '#A3E635',

  // Extra vibrant colors 🔥
  '#6366F1', '#14B8A6', '#D946EF', '#FB7185', '#84CC16',
  '#0EA5E9', '#E11D48', '#7C3AED', '#2DD4BF', '#FACC15',

  // Premium / modern colors ✨
  '#1D4ED8', '#BE123C', '#9333EA', '#059669', '#EA580C',
  '#0891B2', '#4F46E5', '#C026D3', '#65A30D', '#DC2626',

  // Soft pastel colors 🎨
  '#93C5FD', '#FCA5A5', '#6EE7B7', '#FDE68A',
  '#C4B5FD', '#FDBA74', '#67E8F9', '#D9F99D', '#E9D5FF',

  // Deep / dark shades 🌙
  '#1E40AF', '#991B1B', '#9D174D', '#065F46', '#92400E',
  '#5B21B6', '#9A3412', '#155E75', '#4D7C0F', '#312E81',
];