export type UserRole = 'manager' | 'user';

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
};

export type Session = Pick<User, 'id' | 'name' | 'email' | 'role'>;

const USERS_KEY = 'sales_management_users';
const SESSION_KEY = 'sales_management_session';

const defaultUsers: User[] = [
  {
    id: 'mgr-1',
    name: 'Quản lý Sales',
    email: 'manager@sales.com',
    password: '123456',
    role: 'manager',
    active: true,
    createdAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'usr-1',
    name: 'Nhân viên Sales',
    email: 'user@sales.com',
    password: '123456',
    role: 'user',
    active: true,
    createdAt: '2026-08-01T00:00:00.000Z',
  },
];

function safeParseUsers(raw: string | null): User[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as Partial<User>[];
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(Boolean)
      .map((user, index) => ({
        id: user.id || `usr-${index + 1}`,
        name: user.name || 'Người dùng',
        email: user.email || '',
        password: user.password || '',
        role: user.role === 'manager' ? 'manager' : 'user',
        active: typeof user.active === 'boolean' ? user.active : true,
        createdAt: user.createdAt || new Date().toISOString(),
      }));
  } catch {
    return [];
  }
}

export function seedUsers() {
  const currentUsers = safeParseUsers(localStorage.getItem(USERS_KEY));

  if (currentUsers.length === 0) {
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  }

  const merged = [...currentUsers];
  for (const user of defaultUsers) {
    const exists = merged.some((item) => item.email.toLowerCase() === user.email.toLowerCase());
    if (!exists) merged.push(user);
  }

  localStorage.setItem(USERS_KEY, JSON.stringify(merged));
  return merged;
}

export function getUsers() {
  return seedUsers();
}

export function getUserById(id: string) {
  return getUsers().find((user) => user.id === id) ?? null;
}

export function createUser(input: Omit<User, 'id' | 'createdAt'>) {
  const users = getUsers();
  const emailExists = users.some((user) => user.email.toLowerCase() === input.email.toLowerCase());
  if (emailExists) return null;

  const user: User = {
    id: `usr-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...input,
  };

  localStorage.setItem(USERS_KEY, JSON.stringify([...users, user]));
  return user;
}

export function updateUser(id: string, patch: Partial<Omit<User, 'id' | 'createdAt'>>) {
  const users = getUsers();
  const index = users.findIndex((user) => user.id === id);
  if (index < 0) return null;

  const updatedEmail = patch.email?.trim().toLowerCase();
  if (updatedEmail) {
    const emailExists = users.some(
      (user) => user.id !== id && user.email.toLowerCase() === updatedEmail,
    );
    if (emailExists) return null;
  }

  const updated: User = {
    ...users[index],
    ...patch,
    email: patch.email?.trim() || users[index].email,
    name: patch.name?.trim() || users[index].name,
    role: patch.role ?? users[index].role,
    active: typeof patch.active === 'boolean' ? patch.active : users[index].active,
  };

  users[index] = updated;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return updated;
}

export function deleteUser(id: string) {
  const users = getUsers();
  const next = users.filter((user) => user.id !== id);
  if (next.length === users.length) return false;

  localStorage.setItem(USERS_KEY, JSON.stringify(next));
  return true;
}

export function login(email: string, password: string) {
  const matchedUser = getUsers().find(
    (user) =>
      user.active &&
      user.email.toLowerCase() === email.trim().toLowerCase() &&
      user.password === password,
  );

  if (!matchedUser) return null;

  const session: Session = {
    id: matchedUser.id,
    name: matchedUser.name,
    email: matchedUser.email,
    role: matchedUser.role,
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function register(input: Omit<User, 'id' | 'createdAt'>) {
  return createUser(input);
}

export function getSession() {
  try {
    const rawSession = localStorage.getItem(SESSION_KEY);
    return rawSession ? (JSON.parse(rawSession) as Session) : null;
  } catch {
    return null;
  }
}

export function getHomePath(role: UserRole) {
  return role === 'manager' ? '/manager' : '/user';
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}
