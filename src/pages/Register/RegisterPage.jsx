import React, { useEffect, useState } from 'react';
import Logo from '../../components/UI/Logo';
import { Button, Flex, Form, Input, Select, Upload, message, Spin } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { CameraOutlined, PlusOutlined } from '@ant-design/icons';
import { fileToBase64 } from 'file64';
import CameraModal from '../../components/function/CameraModal';
import { get_token } from '../../api/tokenAPI';
import './css/RegisterPage.css';

const RegisterPage = () => {
  const [form] = useForm();
  const [fileList, setFileList] = useState([]);
  const [openCam, setOpenCam] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchToken = async () => {
      try {
        const data = await get_token();
        setIsActive(data.active);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchToken();
  }, []);

  const classList = [
    {
      label: 'D22_TH01',
      value: 'D22_TH01',
    },
    {
      label: 'D22_TH02',
      value: 'D22_TH02',
    },
    {
      label: 'D22_TH03',
      value: 'D22_TH03',
    },
    {
      label: 'D22_TH04',
      value: 'D22_TH04',
    },
    {
      label: 'D22_TH05',
      value: 'D22_TH05',
    },
    {
      label: 'D22_TH06',
      value: 'D22_TH06',
    },
    {
      label: 'D22_TH07',
      value: 'D22_TH07',
    },
    {
      label: 'D22_TH08',
      value: 'D22_TH08',
    },
    {
      label: 'D22_TH09',
      value: 'D22_TH09',
    },
  ];

  const success = (desp) => {
    messageApi.open({
      type: 'success',
      content: desp,
    });
  };

  const error = (desp) => {
    messageApi.open({
      type: 'error',
      content: desp,
    });
  };

  // xử lý ảnh chụp từ camera
  const handleCapture = (base64) => {
    fetch(base64)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], 'camera.png', { type: 'image/png' });

        const camFile = [
          {
            uid: '-1',
            name: 'camera.png',
            status: 'done',
            url: base64,
            originFileObj: file,
          },
        ];

        setFileList(camFile);

        form.setFieldsValue({
          hinhanh: camFile,
        });
      });
  };

  const handleChange = ({ fileList: newList }) => {
    // Chỉ cho tối đa 1 ảnh
    const oneFileList = newList.slice(-1);
    setFileList(oneFileList);
    form.setFieldsValue({
      hinhanh: oneFileList, // ⬅ Inject vào form đúng chuẩn
    });
  };

  const handleSubmit = async (values) => {
    setLoading(true);

    // Lấy file upload
    const file = values.hinhanh[0].originFileObj;
    const imageBase64 = await fileToBase64(file);

    try {
      const res = await fetch(
        'https://dggnfsz809.execute-api.ap-southeast-1.amazonaws.com/prod/checkFaceImg',
        {
          method: 'POST',
          body: JSON.stringify({ imageBase64 }),
        }
      );
      setLoading(false);
      const data = await res.json();
      if (data.valid === false) {
        error(data.message);
        return;
      }
      try {
        const res = await fetch(
          'https://kprcrwvl1d.execute-api.ap-southeast-1.amazonaws.com/prod/uploadFace',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ten: values.ten,
              mssv: values.mssv,
              lop: values.lop,
              imageBase64: imageBase64,
            }),
          }
        );
        const data = await res.json();
        if (data.success === false) {
          error(data.message);
          return;
        }
        success('Đã gửi thành công!');
      } catch (error) {
        error('Gửi thất bại!');
        console.log(error);
      }
    } catch (error) {
      error('Gửi thất bại!');
      console.error(error);
    }
  };

  if (!isActive) {
    return (
      <>
        <Spin spinning={loading}>
          {contextHolder}
          <div className="flex justify-center items-center h-screen">
            <p className="text-red-500 font-semibold text-lg">
              Mã QR không còn hiệu lực. Vui lòng liên hệ quản trị viên để kích
              hoạt lại.
            </p>
          </div>
        </Spin>
      </>
    );
  }

  return (
    <>
      <Spin spinning={loading}>
        {contextHolder}
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
              <Form layout="vertical" form={form} onFinish={handleSubmit}>
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
                <Form.Item
                  label="Upload hình ảnh khuôn mặt"
                  name="hinhanh"
                  rules={[{ required: true, message: 'Hãy chọn 1 hình' }]}
                >
                  <Flex gap="middle" wrap>
                    {/* Khi chưa có ảnh → Hiện 2 nút */}
                    {fileList.length === 0 && (
                      <>
                        {/* Upload ảnh từ thư viện */}
                        <Upload
                          listType="picture-card"
                          fileList={[]}
                          onChange={handleChange}
                          maxCount={1}
                          beforeUpload={() => false}
                        >
                          <div>
                            <PlusOutlined />
                            <div style={{ marginTop: 8 }}>Upload</div>
                          </div>
                        </Upload>

                        {/* Chụp hình từ camera */}
                        <div
                          onClick={() => setOpenCam(true)}
                          className="w-[104px] h-[104px] border border-dashed border-[#d9d9d9] hover:border-[#1677FF] flex justify-center items-center rounded-[8px] cursor-pointer bg-[#FAFAFA] transition-all duration-300 "
                        >
                          <div className="text-center">
                            <CameraOutlined style={{ fontSize: 24 }} />
                            <div style={{ marginTop: 8 }}>Camera</div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Khi đã chọn ảnh → chỉ hiện preview 1 hình */}
                    {fileList.length === 1 && (
                      <Upload
                        listType="picture-card"
                        fileList={fileList}
                        onChange={handleChange}
                        maxCount={1}
                        beforeUpload={() => false}
                      />
                    )}
                  </Flex>
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    GỬI
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </div>
        </div>
        <CameraModal
          open={openCam}
          onClose={() => setOpenCam(false)}
          onCapture={handleCapture}
        />
      </Spin>
    </>
  );
};

export default RegisterPage;
