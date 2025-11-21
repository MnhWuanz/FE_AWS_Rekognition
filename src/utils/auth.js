import userAPI from '../api/apiUser/UserAPI';
export const arrUsers = async () => {
  const res = await userAPI.getAll();
  return res.data.data;
};

export function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}
export async function login(email, password) {
  const users = await arrUsers();
  const matchedUser = users.find(
    (u) => u.email === email && u.password === window.btoa(password)
  );
  // if (matchedUser.role === 'admin') {
  //   localStorage.setItem('user', JSON.stringify(matchedUser));
  //   return matchedUser;
  // }
  if (matchedUser) {
    localStorage.setItem('user', JSON.stringify(matchedUser));
    return matchedUser;
  }
  return false;
}
export function logout() {
  localStorage.removeItem('user');
}
