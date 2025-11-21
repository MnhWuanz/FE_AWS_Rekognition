import React, { useEffect } from 'react';
import { useState } from 'react';
import Logo from '../../components/UI/Logo';
import Field from '../../components/UI/Field';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
import { notification } from 'antd';
import './LoginPage.css';
import { useNavigate } from 'react-router-dom';
import { login } from '../../utils/auth';
function LoginPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ email: '', password: '' });
  const [rememberLogin, setRememberLogin] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  //Xử lý đăng nhập
  const handleLogin = async () => {
    const u = await login(user.email, user.password);
    if (u) {
      if (rememberLogin) {
        localStorage.setItem('rememberLogin', JSON.stringify(user));
        setRememberLogin(true);
      } else {
        localStorage.removeItem('rememberLogin');
      }
      openNotificationWithIcon(
        'success',
        'Đăng nhập thành công',
        'Chào mừng đến với hệ thống!'
      );
      setTimeout(() => {
        u.role === 'admin' ? navigate('/admin') : navigate('/home');
      }, 1500);
    } else {
      openNotificationWithIcon(
        'error',
        'Đăng nhập thất bại',
        'Vui lòng kiểm tra lại thông tin đăng nhập!'
      );
    }
  };
  //Hàm hiển thị thông báo
  const openNotificationWithIcon = (type, msg, descrip, placement) => {
    api[type]({
      message: msg,
      description: descrip,
      placement: placement,
    });
  };
  useEffect(() => {
    document.title = 'Đăng nhập';
    const remember = JSON.parse(localStorage.getItem('rememberLogin'));
    if (remember) {
      setUser({ username: remember.username, password: remember.password });
      setRememberLogin(true);
    }
  }, []);
  return (
    <div className="flex items-center justify-center h-screen  bg-blue-600/20">
      {contextHolder}
      <div className="min-h-[520px] grid md:grid-cols-2 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 w-3/4 ">
        <div className="p-8 md:p-12 bg-gray-50 dark:bg-gray-800 flex flex-col">
          <Logo name="Saigon Technology University" imgSrc="/logo.png" />
          <div className="mt-8 space-y-3">
            <h3 className="text-gray-900 dark:text-gray-100 font-semibold text-xl">
              Thông báo mới
            </h3>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 text-sm space-y-1">
              <li>
                Đang trong quá trình bảo trì hệ thống, vui lòng quay lại sau.
              </li>
            </ul>
          </div>
          <div className="mt-auto pt-10 text-xs text-gray-500">
            © 2025 STU. All rights reserved.
          </div>
        </div>
        <div className="p-8 md:p-12 border-b-gray-600">
          <h3 className="text-4xl font-semibold text-gray-900 dark:text-gray-100">
            Đăng nhập
          </h3>
          <form className="mt-6 space-y-4 max-w-md">
            <Field label="Email" required>
              <Input
                placeholder="••••••••"
                value={user.username}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
              />
            </Field>
            <Field label="Mật khẩu" required>
              <Input
                type="password"
                placeholder="••••••••"
                onChange={(e) => setUser({ ...user, password: e.target.value })}
              />
            </Field>
            <div className="flex items-center gap-2">
              <input
                id="remember2"
                type="checkbox"
                className="h-4 w-4"
                onChange={(e) => setRememberLogin(e.target.checked)}
                checked={rememberLogin}
              />
              <label
                htmlFor="remember2"
                className="text-sm text-gray-600 dark:text-gray-300"
              >
                Ghi nhớ đăng nhập
              </label>
            </div>
            <Button type="button" onClick={handleLogin}>
              Đăng nhập
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
export default LoginPage;
