export const authMessage = (e) => {
  switch (e?.code) {
    case 'auth/invalid-email': return 'Invalid email address.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential': return 'Email or password is incorrect.';
    case 'auth/email-already-in-use': return 'This email is already registered.';
    case 'auth/weak-password': return 'Password must be at least 6 characters.';
    case 'auth/network-request-failed': return 'Network error. Check your internet connection.';
    case 'auth/too-many-requests': return 'Too many attempts. Please try again later.';
    case 'auth/requires-recent-login': return 'Please log in again and retry.';
    default: return e?.message || 'Something went wrong.';
  }
};
