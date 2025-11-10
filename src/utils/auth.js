const arrUsers = [
  { username: 'admin', password: 'admin', role: 'admin' },
  { username: 'user', password: 'user123', role: 'user' },
];

export function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function login(username, password) {
  const matchedUser = arrUsers.find(
    (u) => u.username === username && u.password === password
  );
  if (matchedUser.role === 'admin') {
    localStorage.setItem('user', JSON.stringify(matchedUser));
    return matchedUser;
  }
  return false;
}
export function logout() {
  localStorage.removeItem('user');
}
