import React, { useEffect, useState } from 'react';
import Logo from '../../components/UI/Logo';
import { Button, Form, Input, Select, Upload } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { PlusOutlined } from '@ant-design/icons';

const RegisterPage = () => {
  const [form] = useForm();
  const classList = [
    {
      label: 'D22_TH01',
      value: 'class1',
    },
    {
      label: 'D22_TH02',
      value: 'class2',
    },
    {
      label: 'D22_TH03',
      value: 'class3',
    },
    {
      label: 'D22_TH04',
      value: 'class4',
    },
    {
      label: 'D22_TH05',
      value: 'class5',
    },
    {
      label: 'D22_TH06',
      value: 'class6',
    },
    {
      label: 'D22_TH07',
      value: 'class7',
    },
    {
      label: 'D22_TH08',
      value: 'class8',
    },
    {
      label: 'D22_TH09',
      value: 'class9',
    },
  ];
  const [isActive, setIsActive] = useState(false);
  useEffect(() => {
    fetch('https://stu.mnhwua.id.vn/api/get_token.php')
      .then((res) => res.json())
      .then((data) => setIsActive(data.active))
      .catch(() => setIsActive(false));
  }, []);
  if (!isActive) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 font-semibold text-lg">
          Mã QR không còn hiệu lực. Vui lòng liên hệ quản trị viên để kích hoạt
          lại.
        </p>
      </div>
    );
  }
  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  return (
    <>
      <div className="bg-blue-950 p-4 text-white flex justify-center">
        <Logo
          name="STU FACE"
          imgSrc="./logo.png"
          style={{
            borderRight: '3px solid white',
            marginRight: ' 20px',
            paddingRight: '20px',
          }}
        />
      </div>
      <div className="bg-cyan-100 h-screen flex justify-center">
        <div className="bg-white  w-100 mt-6 rounded-md h-fit text-center  ">
          <h1
            className="bg-sky-600 p-3 text-2xl text-white font-bold
"
          >
            Đăng ký khuôn mặt
          </h1>
          <div className="p-6">
            <Form layout="vertical">
              <Form.Item
                label="Nhập họ tên"
                name="ten"
                rules={[{ required: true, message: 'Nhập họ tên' }]}
              >
                <Input required />
              </Form.Item>
              <Form.Item
                label="Nhập mã số sinh viên"
                name="mssv"
                rules={[{ required: true, message: 'Nhập mã số sinh viên' }]}
              >
                <Input placeholder="DHXXXXX" />
              </Form.Item>
              <Form.Item
                label="Chọn lớp học"
                name="lop"
                rules={[{ required: true, message: 'Chọn lớp' }]}
              >
                <Select placeholder="Chọn lớp" options={classList} />
              </Form.Item>
              <Form.Item label="Upload hình ảnh khuôn mặt">
                <Upload
                  action="/upload.do"
                  listType="picture-card"
                  maxCount={1}
                  multiple={false}
                  accept="image/*"
                >
                  <button
                    style={{
                      color: 'inherit',
                      cursor: 'inherit',
                      border: 0,
                      background: 'none',
                    }}
                    type="button"
                  >
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </button>
                </Upload>
              </Form.Item>
              <Form.Item>
                <Button type="primary">GỬI</Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
