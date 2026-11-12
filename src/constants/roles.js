// export const ROLES = { ADMIN: 'admin', MANAGER: 'manager', USER: 'user' };

// export const ROLE_LABELS = { admin: 'Admin', manager: 'Manager', user: 'User' };
// export const ROLE_COLORS = { admin: '#F87171', manager: '#FBBF24', user: '#38BDF8' };

// export const isAdmin = (role) => role === ROLES.ADMIN;
// export const isStaff = (role) => role === ROLES.ADMIN || role === ROLES.MANAGER;


export const ROLES = { ADMIN: 'admin', USER: 'user' };

export const ROLE_LABELS = { admin: 'Admin', user: 'User' };
export const ROLE_COLORS = { admin: '#F87171', user: '#38BDF8' };

export const isAdmin = (role) => role === ROLES.ADMIN;
// kept so other files keep working: only admin has staff access now
export const isStaff = (role) => role === ROLES.ADMIN;