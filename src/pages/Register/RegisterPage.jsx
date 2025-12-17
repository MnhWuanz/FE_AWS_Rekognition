import React, { useEffect, useState } from 'react';
import Logo from '../../components/UI/Logo';
import { Button, Flex, Form, Input, Select, Upload, message, Spin } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { CameraOutlined, PlusOutlined } from '@ant-design/icons';
import { fileToBase64 } from 'file64';
import CameraModal from '../../components/function/CameraModal';
import { get_token } from '../../api/tokenAPI';
import './css/RegisterPage.css';
import { checkMSSV } from './utils/checkmssv';
import studentApi from '../../api/apiUser/StudentAPI';

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
    {
      label: 'D22_TH10',
      value: 'D22_TH10',
    },
    {
      label: 'D22_TH11',
      value: 'D22_TH11',
    },
    {
      label: 'D22_TH12',
      value: 'D22_TH12',
    },
    {
      label: 'D23_TH01',
      value: 'D23_TH01',
    },
    {
      label: 'D23_TH02',
      value: 'D23_TH02',
    },
    {
      label: 'D23_TH03',
      value: 'D23_TH03',
    },
    {
      label: 'D23_TH04',
      value: 'D23_TH04',
    },
    {
      label: 'D23_TH05',
      value: 'D23_TH05',
    },
    {
      label: 'D23_TH06',
      value: 'D23_TH06',
    },
    {
      label: 'D23_TH07',
      value: 'D23_TH07',
    },
    {
      label: 'D23_TH08',
      value: 'D23_TH08',
    },
    {
      label: 'D23_TH09',
      value: 'D23_TH09',
    },
  ];

  const success = (desp) => {
    messageApi.open({
      type: 'success',
      content: desp,
    });
  };

  const errorr = (desp) => {
    messageApi.open({
      type: 'error',
      content: desp,
    });
  };
  //Giảm kích thước ảnh
  const resizeBase64 = (base64Str, maxWidth = 400, maxHeight = 400) => {
    return new Promise((resolve) => {
      let img = new Image();
      img.src = base64Str;

      img.onload = function () {
        let canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        let ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', 0.8)); // nén 80%
      };
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
  // const now = new Date();
  // const formattedDateTime = now.toLocaleString('vi-VN', {
  //   hour: '2-digit',
  //   minute: '2-digit',
  //   second: '2-digit',
  //   day: '2-digit',
  //   month: '2-digit',
  //   year: 'numeric',
  // });
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
    if (await checkMSSV(values.mssv)) {
      errorr('Mã sinh viên đã đăng ký!');
      setLoading(false);
      return;
    }
    // Lấy file upload
    const file = values.hinhanh[0].originFileObj;
    let imageBase64 = await fileToBase64(file);
    imageBase64 = await resizeBase64(imageBase64);
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
            email: values.email,
            imageBase64: imageBase64,
          }),
        }
      );
      const data = await res.json();
      if (data.success) {
        console.log(data.imageUrl);
        await studentApi.createStudent({
          code: values.mssv,
          name: values.ten,
          email: values.email,
          class: values.lop,
          faceId: data.imageUrl,
          faceUrl: null,
        });
        form.resetFields();
        success(data.message);
      } else {
        errorr(data.message);
      }
    } catch (error) {
      errorr('Gửi thất bại');
      console.log(error);
    } finally {
      setLoading(false);
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

        <div className="bg-cyan-100 min-h-screen flex justify-center py-8">
          <div className="bg-white w-full max-w-2xl mx-4 rounded-lg shadow-lg h-fit">
            <h1 className="bg-sky-600 p-4 text-2xl text-white font-bold rounded-t-lg text-center">
              Đăng ký khuôn mặt
            </h1>
            <div className="p-6">
              <Form layout="vertical" form={form} onFinish={handleSubmit}>
                <Form.Item
                  label="Nhập Mã Số Sinh Viên"
                  name="mssv"
                  rules={[
                    { required: true, message: 'Nhập mã số sinh viên' },
                    {
                      pattern: /^DH[0-9]{8}$/,
                      message:
                        'Mã sinh viên phải bắt đầu bằng DH và theo sau là 8 chữ số (VD: DH52201294)',
                    },
                  ]}
                >
                  <Input
                    placeholder="DH123456768"
                    maxLength={10}
                    style={{ textTransform: 'uppercase' }}
                  />
                </Form.Item>
                <Form.Item
                  label="Nhập Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Nhập Email' },
                    { type: 'email', message: 'Email không hợp lệ' },
                    {
                      pattern: /^[a-zA-Z0-9._%+-]+@student\.stu\.edu\.vn$/,
                      message: 'Email phải có định dạng @student.stu.edu.vn',
                    },
                  ]}
                >
                  <Input placeholder="example@student.stu.edu.vn" />
                </Form.Item>
                <Form.Item
                  label="Nhập Họ Tên"
                  name="ten"
                  rules={[{ required: true, message: 'Nhập họ tên' }]}
                >
                  <Input placeholder="Nguyễn Văn A" />
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
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    className="w-full"
                    block
                  >
                    GỬI ĐĂNG KÝ
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
