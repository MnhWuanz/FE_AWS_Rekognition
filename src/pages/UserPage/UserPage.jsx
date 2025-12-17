import { Button, Form, Input, Spin, message } from 'antd';
import React, { useState } from 'react';
import Loading from '../../components/UI/Loading';
import userAPI from '../../api/apiUser/UserAPI';
import CryptoJS from 'crypto-js';
const UserPage = () => {
  const [loading, setLoading] = useState(false);
  const UserInfo = JSON.parse(localStorage.getItem('user'));
  const idUser = UserInfo.id;
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const success = () => {
    messageApi.open({
      type: 'success',
      content: 'Cập nhật thành công',
    });
  };
  const errorMes = () => {
    messageApi.open({
      type: 'error',
      content: 'Cập nhật thất bại',
    });
  };
  const onFinishned = async (values) => {
    setLoading(true);
    console.log(UserInfo);
    try {
      await userAPI.updateUser({
        id: idUser,
        email: values.email,
        password: CryptoJS.MD5(values.newpassword).toString(),
        role: values.role,
        name: values.name,
        phone: values.phone,
      });
      success();
      localStorage.setItem(
        'user',
        JSON.stringify({
          id: idUser,
          email: values.email,
          role: values.role,
          name: values.name,
          phone: values.phone,
        })
      );
      form.resetFields();
      setLoading(false);
    } catch (error) {
      errorMes();
      console.log(error);
      setLoading(false);
    }
  };
  return (
    <div>
      {contextHolder}
      <div
        className="text-3xl font-bold text-center text-blue-600 font-sans
"
      >
        THÔNG TIN CÁ NHÂN
      </div>
      <Spin tip="Loading..." spinning={loading} size="large">
        <div className="w-3xl mx-auto mt-5  relative">
          <Form
            form={form}
            layout="vertical"
            initialValues={UserInfo}
            onFinish={onFinishned}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4"
          >
            <Form.Item
              label={<span className="font-semibold">Tên người dùng</span>}
              name="name"
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
              <Input size="large" value={UserInfo.name} />
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
            <Form.Item
              label={<span className="font-semibold">Vai trò</span>}
              name="role"
            >
              <Input size="large" readOnly />
            </Form.Item>
            <Form.Item
              label={<span className="font-semibold">Mật khẩu</span>}
              name="newpassword"
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
                    if (!value || getFieldValue('newpassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu không khớp!'));
                  },
                }),
              ]}
            >
              <Input.Password size="large" placeholder="********" />
            </Form.Item>
          </Form>
        </div>
        <div className="w-25 mx-auto">
          <Button
            className="w-full"
            type="primary"
            size="large"
            onClick={form.submit}
          >
            Lưu
          </Button>
        </div>
      </Spin>
    </div>
  );
};
export default UserPage;
