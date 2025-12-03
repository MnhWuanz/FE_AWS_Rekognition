import React, { useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Table,
  Tag,
} from 'antd';
import {
  DeleteOutlined,
  InfoOutlined,
  PlusCircleFilled,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
const { Column, ColumnGroup } = Table;
import userAPI from '../../api/apiUser/UserAPI';
import lecturerAPI from '../../api/apiUser/LectureAPI';
import Loading from '../../components/UI/Loading';
import ThongBao from '../../components/function/ThongBao';

const AddUser = () => {
  const [dataUser, setDataUser] = useState([]);
  const [open, setOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const columns = [
    {
      title: 'Id',
      dataIndex: 'id',
      key: 'id',
      width: '10%',
    },
    {
      title: 'EMAIL',
      dataIndex: 'email',
      key: 'email',
      width: '20%',
    },
    {
      title: 'CHỨC VỤ',
      dataIndex: 'role',
      key: 'role',
      width: '15%',
    },
    {
      title: 'Action',
      key: 'action',
      render: () => (
        <Space direction="vertical" className="action-buttons">
          <Button type="default" block>
            <InfoOutlined />
            Thông Tin
          </Button>
          <Button type="primary" danger block>
            <DeleteOutlined />
            Xoá
          </Button>
        </Space>
      ),
      width: '15%',
    },
  ];
  const showModal = () => {
    setOpen(true);
  };
  const handleCancel = () => {
    form.resetFields();
    setOpen(false);
  };
  const onFinish = async (values) => {
    let userId;
    try {
      // Tạo user trước
      const userRes = await userAPI.createUser({
        email: values.email,
        password: window.btoa(values.password),
        role: values.rule,
      });
      console.log(userRes);
      userId = userRes.data.data;
      console.log('Created user with ID:', userId);
      console.log('User role:', values.rule);

      // Nếu là giảng viên thì thêm vào bảng lecturer
      if (values.rule === 'lecturer') {
        console.log('Adding lecturer with data:', {
          id: userId,
          name: values.username,
          email: values.email,
          phone: values.phone,
        });

        await lecturerAPI.createLecturer({
          id: userId,
          name: values.username,
          email: values.email,
          phone: values.phone,
        });

        console.log('Lecturer added successfully');
        messageApi.success(
          `Đã tạo user và giảng viên cho ${values.username} thành công!`
        );
      } else {
        messageApi.success(`Đã tạo user cho ${values.username} thành công!`);
      }

      setTimeout(() => {
        handleCancel();
        fetchData();
      }, 1000);
    } catch (error) {
      console.error('Failed to add user: ', error);
      console.error('Error details:', error.response?.data);
      messageApi.error(
        'Tạo user thất bại: ' + (error.response?.data?.message || error.message)
      );
    }
  };
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getAll();
      setDataUser(response.data.data);
    } catch (error) {
      console.log('Failed to fetch users: ', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  return (
    <div>
      {contextHolder}
      <div className="w-full text-end font-bold text-2xl mb-4">
        <Button
          type="primary"
          shape="round"
          size="large"
          style={{ fontWeight: 'bold', padding: '0 24px' }}
          icon={<PlusCircleFilled />}
          onClick={showModal}
        >
          ADD USER
        </Button>
      </div>
      <div style={{ marginBottom: 10, textAlign: 'right' }}>
        <Button icon={<ReloadOutlined />} onClick={fetchData}>
          Refresh
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={dataUser}
        loading={loading ? <Loading tip="Đang tải" /> : false}
      />
      <Modal
        title={
          <div className="font-bold text-xl text-center pb-2">
            THÊM NGƯỜI DÙNG
          </div>
        }
        open={open}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button
            key="save"
            type="primary"
            onClick={() => form.submit()}
            style={{ fontWeight: 'bold', padding: '6px 24px' }}
          >
            Lưu lại
          </Button>,
        ]}
        width={650}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onCancel={handleCancel}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4"
        >
          <Form.Item
            label={<span className="font-semibold">Tên người dùng</span>}
            name="username"
            rules={[
              { required: true, message: 'Vui lòng nhập tên!' },
              {
                validator(_, value) {
                  if (!value) return Promise.resolve();
                  const work = value.trim().split(/\s+/);
                  if (work.length < 2) {
                    return Promise.reject(
                      new Error('Tên người dùng phải có ít nhất 2 từ!')
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input size="large" placeholder="Nhập tên user" />
          </Form.Item>

          <Form.Item
            label={<span className="font-semibold">Email</span>}
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' },
            ]}
          >
            <Input size="large" placeholder="example@gmail.com" />
          </Form.Item>
          <Form.Item
            label={<span className="font-semibold">Mật khẩu</span>}
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              {
                pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
                message:
                  'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ cái và số!',
              },
            ]}
          >
            <Input.Password size="large" placeholder="********" />
          </Form.Item>

          {/* Nhập lại */}
          <Form.Item
            label={<span className="font-semibold">Nhập lại mật khẩu</span>}
            name="confirmPassword"
            dependencies={['password']} //kiểm tra khi password trên thay đổi
            hasFeedback
            rules={[
              { required: true, message: 'Vui lòng nhập lại mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password size="large" placeholder="********" />
          </Form.Item>
          <Form.Item
            name="rule"
            label={<span className="font-semibold">Vai trò</span>}
            rules={[{ required: true }]}
          >
            <Select
              allowClear
              placeholder="Chọn vai trò"
              options={[
                { label: 'Quản trị Viên', value: 'admin' },
                { label: 'Giáo Viên', value: 'lecturer' },
                { label: 'Khác', value: 'other' },
              ]}
            />
          </Form.Item>
          <Form.Item
            label={<span className="font-semibold">Số điện thoại</span>}
            name="phone"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại!' },
              {
                pattern: /^0\d{9}$/,
                message: 'Số điện thoại không hợp lệ!',
              },
            ]}
          >
            <Input size="large" placeholder="********" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
export default AddUser;
