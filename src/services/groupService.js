// services/groupService.js
// Firestore e group + group expense er shob kaj ekhane.
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase'; // <-- apnar firebase config er path/ naam onujayi thik korun

const GROUPS = 'groups';
const INVITES = 'groupInvites';

export const norm = (email) => (email || '').trim().toLowerCase();

export function genCode(len = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < len; i += 1) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export function displayName(user, profile) {
  return profile?.name || profile?.displayName || user?.displayName || (user?.email ? user.email.split('@')[0] : 'Member');
}

/* ---------- Groups ---------- */

// Je group e ami member
export function subscribeMyGroups(uid, cb, onError) {
  const q = query(collection(db, GROUPS), where('memberUids', 'array-contains', uid));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      cb(list);
    },
    onError
  );
}

// Amake je group e invite kora hoyeche (email diye)
export function subscribeMyInvites(email, cb, onError) {
  const q = query(collection(db, GROUPS), where('invitedEmails', 'array-contains', norm(email)));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), onError);
}

export function subscribeGroup(groupId, cb, onError) {
  return onSnapshot(
    doc(db, GROUPS, groupId),
    (snap) => cb(snap.exists() ? { id: snap.id, ...snap.data() } : null),
    onError
  );
}

export async function createGroup({ name, user, profile, photoURL = null }) {
  const inviteCode = genCode();
  const ref = await addDoc(collection(db, GROUPS), {
    name: name.trim(),
    photoURL,
    deposits: {},
    createdBy: user.uid,
    memberUids: [user.uid],
    members: { [user.uid]: { name: displayName(user, profile), email: norm(user.email) } },
    invitedEmails: [],
    inviteCode,
    createdAt: serverTimestamp(),
  });
  await setDoc(doc(db, INVITES, inviteCode), { groupId: ref.id, groupName: name.trim(), createdBy: user.uid });
  return ref.id;
}

export async function inviteByEmail(groupId, email) {
  await updateDoc(doc(db, GROUPS, groupId), { invitedEmails: arrayUnion(norm(email)) });
}

export async function cancelInvite(groupId, email) {
  await updateDoc(doc(db, GROUPS, groupId), { invitedEmails: arrayRemove(norm(email)) });
}

export async function acceptInvite(groupId, user, profile) {
  await updateDoc(doc(db, GROUPS, groupId), {
    memberUids: arrayUnion(user.uid),
    [`members.${user.uid}`]: { name: displayName(user, profile), email: norm(user.email) },
    invitedEmails: arrayRemove(norm(user.email)),
  });
}

export async function declineInvite(groupId, email) {
  await updateDoc(doc(db, GROUPS, groupId), { invitedEmails: arrayRemove(norm(email)) });
}

// Invite code / link diye join
export async function joinByCode(code, user, profile) {
  const c = (code || '').trim().toUpperCase();
  const inv = await getDoc(doc(db, INVITES, c));
  if (!inv.exists()) throw new Error('Invalid invite code');
  const { groupId } = inv.data();
  await updateDoc(doc(db, GROUPS, groupId), {
    memberUids: arrayUnion(user.uid),
    [`members.${user.uid}`]: { name: displayName(user, profile), email: norm(user.email) },
    invitedEmails: arrayRemove(norm(user.email)),
  });
  return groupId;
}

export async function leaveGroup(groupId, uid) {
  await updateDoc(doc(db, GROUPS, groupId), { memberUids: arrayRemove(uid) });
}

export async function deleteGroup(group) {
  // age shob expense muche, tarpor group (nahole expense gulo theke jabe)
  const snap = await getDocs(collection(db, GROUPS, group.id, 'expenses'));
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
  await deleteDoc(doc(db, GROUPS, group.id));
  if (group.inviteCode) await deleteDoc(doc(db, INVITES, group.inviteCode)).catch(() => { });
}

/* ---------- Group expenses ---------- */

export function subscribeExpenses(groupId, cb, onError) {
  const q = query(collection(db, GROUPS, groupId, 'expenses'), orderBy('date', 'desc'));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), onError);
}

export async function saveExpense(groupId, data, expenseId) {
  if (expenseId) {
    await updateDoc(doc(db, GROUPS, groupId, 'expenses', expenseId), data);
    return expenseId;
  }
  const ref = await addDoc(collection(db, GROUPS, groupId, 'expenses'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteExpense(groupId, expenseId) {
  await deleteDoc(doc(db, GROUPS, groupId, 'expenses', expenseId));
}