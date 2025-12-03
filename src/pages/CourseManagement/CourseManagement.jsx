import React, { useEffect, useState } from 'react';
import {
  Button,
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
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import courseAPI from '../../api/apiUser/CourseAPI';
import lecturerAPI from '../../api/apiUser/LectureAPI';

const CourseManagement = () => {
  const [form] = Form.useForm();
  const [courses, setCourses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();
  // Columns cho bảng môn học
  const columns = [
    {
      title: 'Mã môn học',
      dataIndex: 'code',
      key: 'code',
      width: '15%',
      sorter: (a, b) => a.code.localeCompare(b.code),
    },
    {
      title: 'Tên môn học',
      dataIndex: 'name',
      key: 'name',
      width: '30%',
    },
    {
      title: 'Giảng viên phụ trách',
      dataIndex: 'userId',
      key: 'userId',
      render: (userId) => {
        const lecturer = lecturers.find((l) => l.id === userId);
        return lecturer ? (
          <Tag color="blue">{lecturer.name}</Tag>
        ) : (
          <Tag color="default">Chưa phân công</Tag>
        );
      },
      width: '25%',
    },
    {
      title: 'Thời gian bắt đầu',
      dataIndex: 'starttime',
      key: 'starttime',
      render: (time) => (time ? new Date(time).toLocaleString('vi-VN') : '-'),
      width: '15%',
    },
    {
      title: 'Thời gian kết thúc',
      dataIndex: 'endtime',
      key: 'endtime',
      render: (time) => (time ? new Date(time).toLocaleString('vi-VN') : '-'),
      width: '15%',
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  // Fetch courses
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await courseAPI.getAll();
      const data = res.data.data || res.data;
      const formattedData = data.map((item) => ({
        ...item,
        key: item.courseid,
      }));
      setCourses(formattedData);
    } catch (error) {
      console.error('Error fetching courses:', error);
      messageApi.error('Không thể tải danh sách môn học');
    } finally {
      setLoading(false);
    }
  };

  // Fetch lecturers
  const fetchLecturers = async () => {
    try {
      const res = await lecturerAPI.getAll();
      const data = res.data.data || res.data;
      setLecturers(data);
    } catch (error) {
      console.error('Error fetching lecturers:', error);
      messageApi.error('Không thể tải danh sách giảng viên');
    }
  };
  useEffect(() => {
    fetchCourses();
    fetchLecturers();
  }, []);

  // Handle add new course
  const handleAdd = () => {
    setEditingCourse(null);
    form.resetFields();
    setOpenModal(true);
  };

  // Handle edit course
  const handleEdit = (record) => {
    setEditingCourse(record);
    form.setFieldsValue({
      code: record.code,
      name: record.name,
      userId: record.userId,
      starttime: record.starttime,
      endtime: record.endtime,
    });
    setOpenModal(true);
  };

  // Handle delete course
  const handleDelete = async (record) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa môn học "${record.name}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await courseAPI.deleteCourse(record.courseid);
          messageApi.success('Xóa môn học thành công');
          fetchCourses();
        } catch (error) {
          console.error('Error deleting course:', error);
          messageApi.error('Xóa môn học thất bại');
        }
      },
    });
  };

  // Handle form submit
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (editingCourse) {
        // Update course
        await courseAPI.updateCourse(editingCourse.courseid, values);
        messageApi.success('Cập nhật môn học thành công');
      } else {
        // Create new course
        await courseAPI.createCourse(values);
        messageApi.success('Thêm môn học thành công');
      }
      setOpenModal(false);
      form.resetFields();
      fetchCourses();
    } catch (error) {
      console.error('Error saving course:', error);
      messageApi.error(
        editingCourse ? 'Cập nhật môn học thất bại' : 'Thêm môn học thất bại'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      {contextHolder}
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <h2>Quản lý môn học</h2>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchCourses}>
            Làm mới
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Thêm môn học
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={courses}
        loading={loading}
        pagination={{ pageSize: 10 }}
        bordered
      />

      <Modal
        title={editingCourse ? 'Cập nhật môn học' : 'Thêm môn học mới'}
        open={openModal}
        onCancel={() => {
          setOpenModal(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 24 }}
        >
          <Form.Item
            label="Mã môn học"
            name="code"
            rules={[
              { required: true, message: 'Vui lòng nhập mã môn học' },
              { max: 50, message: 'Mã môn học tối đa 50 ký tự' },
            ]}
          >
            <Input placeholder="VD: CS101" />
          </Form.Item>

          <Form.Item
            label="Tên môn học"
            name="name"
            rules={[
              { required: true, message: 'Vui lòng nhập tên môn học' },
              { max: 100, message: 'Tên môn học tối đa 100 ký tự' },
            ]}
          >
            <Input placeholder="VD: Lập trình hướng đối tượng" />
          </Form.Item>

          <Form.Item
            label="Giảng viên phụ trách"
            name="userId"
            rules={[{ required: true, message: 'Vui lòng chọn giảng viên' }]}
          >
            <Select
              placeholder="Chọn giảng viên"
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={lecturers.map((lecturer) => ({
                label: `${lecturer.name} (${lecturer.email})`,
                value: lecturer.id,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Thời gian bắt đầu"
            name="starttime"
            rules={[
              { required: true, message: 'Vui lòng nhập thời gian bắt đầu' },
            ]}
          >
            <Input type="datetime-local" />
          </Form.Item>

          <Form.Item
            label="Thời gian kết thúc"
            name="endtime"
            rules={[
              { required: true, message: 'Vui lòng nhập thời gian kết thúc' },
            ]}
          >
            <Input type="datetime-local" />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  setOpenModal(false);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingCourse ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CourseManagement;
