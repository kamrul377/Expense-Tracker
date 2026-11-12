# Expense Tracker (React Native / Expo + Firebase)

Built with **Expo SDK 58** (use the latest Expo Go app). Personal expense management app with 3 roles (**admin**, **manager**, **user**).

## Features
**Everyone (user)**
- Register / Login / Forgot password / Change password
- Add, edit, delete **expenses & income** (title, amount, category, payment method, date)
- Dashboard: total balance, this month income/expense, top categories, recent transactions
- Search + filter (type, month, all-time)
- Monthly **budgets** (overall + per category) with progress bars & warnings
- **Reports**: monthly summary, category breakdown, 6-month income vs expense chart
- **Export CSV** (share/save)
- Custom categories (name, type, icon, color)
- Currency selection (BDT, USD, EUR, GBP, INR, ...)
- Data syncs in real time via Firestore

**Manager** - everything above + Admin panel (view all users, enable/disable normal users)

**Admin** - everything above + Admin panel (change roles, enable/disable anyone)

> Admin/Manager can see the user list only. They can NOT see anyone's transactions (privacy).

## Setup
1. `npm install`
2. Firebase Console (project `expenses-management-58ec6`):
   - **Authentication -> Sign-in method -> Email/Password -> Enable**
   - **Firestore Database -> Create database** (production mode)
   - **Firestore -> Rules** -> paste everything from `firestore.rules` -> Publish
3. `npx expo start` and scan the QR with Expo Go.

## Make your first Admin
1. Register normally in the app.
2. Firebase Console -> Firestore -> `users` -> your document -> change `role` from `user` to `admin`.
3. Reopen the app. After that, admin can promote others from inside the app (Profile -> Admin Panel).

## Structure
```
App.js
src/
  firebase.js            Firebase init (Auth + Firestore)
  constants/             theme, roles, default categories
  context/               AuthContext (login/role), DataContext (transactions/budgets/categories)
  utils/                 format, stats, csv
  components/            UI pieces
  navigation/            RootNavigator, MainTabs
  screens/               Dashboard, Transactions, AddTransaction, Budgets, Reports, Profile, Categories
  screens/auth/          Login, Register, ForgotPassword, Blocked
  screens/admin/         AdminScreen
firestore.rules          Security rules
```
