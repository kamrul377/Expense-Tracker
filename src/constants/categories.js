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

export const ICON_CHOICES = [
  'food', 'coffee', 'bus', 'car', 'airplane', 'cart', 'tshirt-crew', 'home',
  'lightning-bolt', 'cellphone', 'laptop', 'school', 'heart-pulse', 'dumbbell',
  'movie', 'gift', 'paw', 'bank', 'wallet', 'cash',
];

export const COLOR_CHOICES = [
  '#F59E0B', '#3B82F6', '#EF4444', '#EC4899', '#10B981',
  '#8B5CF6', '#F97316', '#06B6D4', '#22D3EE', '#A3E635',
];
