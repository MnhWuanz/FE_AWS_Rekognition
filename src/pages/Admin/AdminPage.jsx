import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/UI/Logo';
import {
  CalendarOutlined,
  PoweroffOutlined,
  TeamOutlined,
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
  getItem('Lịch', 'Calendar', <CalendarOutlined />),

  getItem('Logout', 'Logout', <PoweroffOutlined />),
];
const AdminPage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { borderRadiusLG },
  } = theme.useToken();
  const navigate = useNavigate();
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
        <Logo name="" imgSrc={'./logo.png'} height={'20'} width={'full'} />
        <Menu
          theme="dark"
          defaultSelectedKeys={['1']}
          mode="inline"
          items={items}
          onClick={(e) => {
            if (e.key === 'Logout') {
              {
                showModal();
              }
            }
          }}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: '#001529' }} />
        <Modal
          title="Bạn có chắc muốn đăng xuất?"
          open={open}
          onOk={handleOk}
          onCancel={handleCancel}
        ></Modal>
        <Content style={{ margin: '0 16px' }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: '#fff',
              borderRadius: borderRadiusLG,
            }}
          >
            Bill is a cat.
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
