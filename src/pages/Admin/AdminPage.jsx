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
const { Header, Content, Footer, Sider } = Layout;
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
  getItem('Quản Lý Sinh Viên', 'StudentManagement', <TeamOutlined />, [
    getItem('Danh Sách Sinh Viên', 'ListStudents'),
    getItem('Thêm Sinh Viên', 'addStudent'),
  ]),
  getItem('Đăng ký khuôn mặt', 'addFace', <UserAddOutlined />),

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
    const p = location.pathname;
    if (p === '/admin') return null;
    if (p.startsWith('/admin/addFace')) return 'addFace';
    return 'admin';
  }, [location.pathname]);
  const [open, setOpen] = useState(false);
  const showModal = () => {
    setOpen(true);
  };
  const handleOk = () => {
    navigate('/');
  };
  const handleCancel = () => {
    setOpen(false);
  };
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <Logo name="" imgSrc={'/logo.png'} height={'20'} width={'full'} />
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
        <Header style={{ padding: 0, background: '#001529' }}>
          <h1 style={{ float: 'left', color: 'white', marginLeft: '20px' }}>
            Xin Chào
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
              height: '100vh',
              background: '#fff',
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
