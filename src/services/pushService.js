// services/pushService.js
// Expo push token Firestore e rakha + onno user ke notification pathano (Cloud Function lagbe na)
import { arrayRemove, arrayUnion, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const COL = 'pushTokens';
const norm = (e) => (e || '').trim().toLowerCase();

let currentToken = null; // ei phone er token (logout e muchte lagbe)

export async function savePushToken(email, uid, token) {
    currentToken = token;
    await setDoc(
        doc(db, COL, norm(email)),
        { uid, tokens: arrayUnion(token), updatedAt: serverTimestamp() },
        { merge: true }
    );
}

// Logout er age call korun, jate ei phone e ar onner notification na ashe
export async function unregisterPush(email) {
    if (!email || !currentToken) return;
    await setDoc(doc(db, COL, norm(email)), { tokens: arrayRemove(currentToken) }, { merge: true });
    currentToken = null;
}

// emails: jader notification pathabo. Fail korleo app er kaj atkabe na.
export async function sendPush(emails, { title, body, data }) {
    try {
        const tokens = [];
        await Promise.all(
            emails.map(async (e) => {
                try {
                    const snap = await getDoc(doc(db, COL, norm(e)));
                    if (snap.exists()) tokens.push(...(snap.data().tokens || []));
                } catch (err) {
                    // ignore
                }
            })
        );
        const unique = [...new Set(tokens)];
        if (!unique.length) return;

        const messages = unique.map((to) => ({
            to,
            title,
            body,
            data,
            sound: 'default',
            channelId: 'default',
            priority: 'high',
        }));

        await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify(messages),
        });
    } catch (e) {
        console.log('sendPush failed:', e?.message);
    }
}