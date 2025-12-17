import React, { useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../../components/UI/Logo';
import {
  CalendarOutlined,
  PoweroffOutlined,
  TeamOutlined,
  UserAddOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Modal, Layout, Menu, theme, Button } from 'antd';
import { logout } from '../../utils/auth';
const { Header, Content, Footer, Sider } = Layout;
const value = JSON.parse(localStorage.getItem('user'));

function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}
//Nội dung menu
const items = [
  getItem('Hồ Sơ Cá Nhân', 'User', <UserOutlined />),
  getItem('Quản Lý Khuôn Mặt ', 'FaceManagement', <TeamOutlined />, [
    getItem('Danh Sách Khuôn Mặt', 'ListStudentsFaces'),
    getItem('Đăng ký khuôn mặt', 'addFace'),
  ]),
  getItem('Quản Lý Người Dùng ', 'UserManagement', <TeamOutlined />, [
    getItem('Danh sách ', 'addUser'),
  ]),
  getItem('Điểm Danh', 'FaceRollCall', <UserAddOutlined />),
  getItem('Quản lý môn học', 'CourseManagement', <UserAddOutlined />),
  getItem('Quản lý ca học', 'SessionManagement', <UserAddOutlined />),
  getItem('Logout', 'Logout', <PoweroffOutlined />),
];
const AdminPage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { borderRadiusLG },
  } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const selectKey = useMemo(() => {
    const p = location.pathname.replace('/admin/', '');
    console.log(p);
    if (p == '/admin') return 'User';
    return p;
  }, [location.pathname]);
  const [open, setOpen] = useState(false);
  const showModal = () => {
    setOpen(true);
  };
  const handleOk = () => {
    logout();
    navigate('/');
  };
  const handleCancel = () => {
    setOpen(false);
  };
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={260}
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <Logo name="" imgSrc={'/logo.png'} height={'50'} width={'full'} />
        <Menu
          theme="dark"
          mode="inline"
          items={items}
          selectedKeys={selectKey ? [selectKey] : []}
          onClick={(e) => {
            if (e.key === 'Logout') {
              {
                showModal();
              }
            } else {
              navigate(`/admin/${e.key}`);
            }
          }}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: '#0C2B4E' }}>
          <h1 style={{ float: 'left', color: 'white', marginLeft: '20px' }}>
            Xin Chào {value.name}
          </h1>
          <div style={{ float: 'right', marginRight: '20px' }}>
            <CalendarOutlined style={{ color: 'white' }} />
            <span style={{ color: 'white', marginLeft: '10px' }}>
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </Header>
        <Modal
          title="Bạn có chắc muốn đăng xuất?"
          open={open}
          onOk={handleOk}
          onCancel={handleCancel}
        ></Modal>
        <Content style={{ margin: '0 16px' }}>
          <div
            style={{
              padding: 10,
              minHeight: '100vh',
              background: '#EFECE3',
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          STU ©{new Date().getFullYear()} Created by MnhWua
        </Footer>
      </Layout>
    </Layout>
  );
};
export default AdminPage;
