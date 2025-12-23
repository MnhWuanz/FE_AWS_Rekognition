import React, { useEffect, useState } from 'react';
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Row,
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
import userAPI from '../../api/apiUser/UserAPI';
import dayjs from 'dayjs';

const SessionManagement = () => {
  const [form] = Form.useForm();
  const [courses, setCourses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();
  const { RangePicker } = DatePicker;
  const { Option } = Select;
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
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
      dataIndex: 'startTime',
      key: 'startTime',
      render: (time) =>
        time ? new Date(time).toLocaleDateString('vi-VN') : '-',
      width: '15%',
    },
    {
      title: 'Thời gian kết thúc',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (time) =>
        time ? new Date(time).toLocaleDateString('vi-VN') : '-',
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
          <Popconfirm
            title="Delete the Course"
            description="Bạn có muốn xóa khoa hoc này ?"
            onConfirm={() => handleDeleteCourse(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="primary" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  const handleDeleteCourse = async (id) => {
    setLoading(true);
    try {
      await courseAPI.deleteCourse(id);
      messageApi.success('Xóa môn học thành công');
      fetchCourses();
    } catch (errorr) {
      console.log(errorr);
      messageApi.error('Xóa môn học thất bại');
    } finally {
      setLoading(false);
    }
  };
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
      const res = await userAPI.getAll();
      const data = res.data.data;
      const result = data.filter((user) => user.role === 'lecturer');
      setLecturers(result);
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
      starttime: [dayjs(record.startTime), dayjs(record.endTime)],
    });
    setOpenModal(true);
  };

  // Handle form submit
  const handleSubmit = async (values) => {
    setLoading(true);
    const data = values.starttime;
    try {
      if (editingCourse) {
        // Update course
        await courseAPI.updateCourse({
          id: editingCourse.id,
          code: values.code,
          name: values.name,
          startTime: data[0].toISOString(),
          endTime: data[1].toISOString(),
        });
        messageApi.success('Cập nhật môn học thành công');
      } else {
        await courseAPI.createCourse({
          code: values.code,
          name: values.name,
          userId: values.userId,
          startTime: data[0].toISOString(),
          endTime: data[1].toISOString(),
        });
        messageApi.success('Thêm ca học thành công');
        form.resetFields();
      }
      setOpenModal(false);
      fetchCourses();
    } catch (error) {
      console.error('Error saving course:', error);
      messageApi.error(
        editingCourse ? 'Cập nhật môn học thất bại' : 'Thêm ca học thất bại'
      );
    } finally {
      setLoading(false);
    }
  };

  //Ngay trong tuan
  const days = [
    {
      id: 1,
      name: 'Thứ 2',
    },
    {
      id: 2,
      name: 'Thứ 3',
    },
    {
      id: 3,
      name: 'Thứ 4',
    },
    {
      id: 4,
      name: 'Thứ 5',
    },
    {
      id: 5,
      name: 'Thứ 6',
    },
    {
      id: 6,
      name: 'Thứ 7',
    },
  ];

  //Ca hoc
  const class_periods = [
    // --- CA SÁNG ---
    {
      id: 1,
      name: 'Tiết 1 (07h00 - 07h50)',
      time: '07h50',
    },
    {
      id: 2,
      name: 'Tiết 2 (07h50 - 08h40)',
      time: '08h40',
    },
    {
      id: 3,
      name: 'Tiết 3 (08h40 - 09h30)',
      time: '09h30',
    },
    {
      id: 4,
      name: 'Tiết 4 (09h35 - 10h25)', // Nghỉ 5p sau tiết 3
      time: '10h25',
    },
    {
      id: 5,
      name: 'Tiết 5 (10h25 - 11h15)',
      time: '11h15',
    },
    {
      id: 6,
      name: 'Tiết 6 (11h15 - 12h05)',
      time: '12h05',
    },

    // --- CA CHIỀU ---
    {
      id: 7,
      name: 'Tiết 7 (12h35 - 13h25)', // Nghỉ trưa 30p sau tiết 6
      time: '13h25',
    },
    {
      id: 8,
      name: 'Tiết 8 (13h25 - 14h15)',
      time: '14h15',
    },
    {
      id: 9,
      name: 'Tiết 9 (14h15 - 15h05)',
      time: '15h05',
    },
    {
      id: 10,
      name: 'Tiết 10 (15h10 - 16h00)', // Nghỉ 5p sau tiết 9
      time: '16h00',
    },
    {
      id: 11,
      name: 'Tiết 11 (16h00 - 16h50)',
      time: '16h50',
    },
    {
      id: 12,
      name: 'Tiết 12 (16h50 - 17h40)',
      time: '17h40',
    },

    // --- CA TỐI ---
    {
      id: 13,
      name: 'Tiết 13 (17h45 - 18h35)', // Nghỉ 5p sau tiết 12
      time: '18h35',
    },
    {
      id: 14,
      name: 'Tiết 14 (18h35 - 19h25)',
      time: '19h25',
    },
    {
      id: 15,
      name: 'Tiết 15 (19h25 - 20h15)',
      time: '20h15',
    },
  ];

  //Toa hoc
  const campusData = [
    {
      name: 'Khu C',
      floors: [
        {
          id: 'C7',
          name: 'Tầng 7',
          rooms: [
            'C701',
            'C702',
            'C703',
            'C704',
            'C705',
            'C706',
            'C707',
            'C708',
            'C709',
          ],
        },
        {
          id: 'C6',
          name: 'Tầng 6',
          rooms: [
            'C601',
            'C602',
            'C603',
            'C604',
            'C605',
            'C606',
            'C607',
            'C608',
            'C609',
          ],
        },
        {
          id: 'C5',
          name: 'Tầng 5',
          rooms: ['C501', 'C502', 'C503', 'C504', 'C505'], // Ví dụ ít phòng hơn
        },
      ],
    },
    {
      name: 'Khu A',
      floors: [
        {
          id: 'A3',
          name: 'Tầng 3',
          rooms: ['A301', 'A302', 'A303'],
        },
      ],
    },
  ];
  // 1. Khi chọn KHU
  const handleBlockChange = (value) => {
    // Tìm khu vực tương ứng trong data
    const selectedBlockData = campusData.find((block) => block.name === value);

    // Cập nhật danh sách tầng
    setFloors(selectedBlockData ? selectedBlockData.floors : []);
    setRooms([]); // Reset phòng

    // Reset giá trị trên Form để tránh hiển thị rác
    form.setFieldsValue({ floor: undefined, room: undefined });
  };

  // 2. Khi chọn TẦNG
  const handleFloorChange = (value) => {
    // Tìm tầng tương ứng trong danh sách tầng đang có
    const selectedFloorData = floors.find((floor) => floor.id === value);

    // Cập nhật danh sách phòng
    setRooms(selectedFloorData ? selectedFloorData.rooms : []);

    // Reset giá trị phòng trên Form
    form.setFieldsValue({ room: undefined });
  };
  //Thay doi chon khoa hoc
  const handleCourseChange = (courseId) => {
    setSelectedCourseId(courseId);
    const selectedCourse = courses.find((c) => c.id === courseId);
    if (selectedCourse) {
      form.setFieldsValue({
        name: selectedCourse.name,
        userId: selectedCourse.userId,
      });
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
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchCourses}>
            Làm mới
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Thêm ca học
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
        title={editingCourse ? 'Cập nhật ca học' : 'Thêm ca học mới'}
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
            label="Môn học"
            name="code"
            rules={[{ required: true, message: 'Vui lòng chọn môn học' }]}
          >
            <Select
              placeholder="Chọn môn học"
              showSearch
              onChange={handleCourseChange}
              filterOption={(input, option) =>
                (option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={courses.map((course) => ({
                label: `${course.code} (${course.name})`,
                value: course.id,
              }))}
            />
          </Form.Item>
          <Form.Item
            label="Giảng viên phụ trách"
            name="userId"
            rules={[{ required: true, message: 'Vui lòng chọn giảng viên' }]}
          >
            <Select
              placeholder="Chọn giảng viên"
              showSearch
              disabled={!selectedCourseId}
              filterOption={(input, option) =>
                (option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={lecturers
                .filter((lecturer) => {
                  if (!selectedCourseId) return false;
                  const selectedCourse = courses.find(
                    (c) => c.id === selectedCourseId
                  );
                  return (
                    selectedCourse && lecturer.id === selectedCourse.userId
                  );
                })
                .map((lecturer) => ({
                  label: lecturer.name,
                  value: lecturer.id,
                }))}
            />
          </Form.Item>

          <Form.Item
            label="Ngày "
            name="Day"
            rules={[
              { required: true, message: 'Vui lòng nhập chọn ngày trong tuần' },
            ]}
          >
            <Select
              placeholder="Chọn ngày"
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={days.map((day) => ({
                label: `${day.name}`,
                value: day.id,
              }))}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Bắt đầu"
                name="start_period"
                rules={[
                  { required: true, message: 'Vui lòng chọn tiết bắt đầu!' },
                ]}
              >
                <Select
                  placeholder="Chọn tiết bắt đầu"
                  showSearch
                  optionFilterProp="children"
                >
                  {class_periods.map((period) => (
                    <Option key={period.id} value={period.id}>
                      {period.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* --- SELECT TIẾT KẾT THÚC --- */}
            <Col span={12}>
              <Form.Item
                label="Kết thúc"
                name="end_period"
                dependencies={['start_period']} // Phụ thuộc vào ô start_period
                rules={[
                  { required: true, message: 'Vui lòng chọn tiết kết thúc!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('start_period') <= value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error('Tiết kết thúc phải lớn hơn tiết bắt đầu!')
                      );
                    },
                  }),
                ]}
              >
                <Select
                  placeholder="Chọn tiết kết thúc"
                  showSearch
                  optionFilterProp="children"
                >
                  {class_periods.map((period) => (
                    <Option key={period.id} value={period.id}>
                      {period.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            {/* --- SELECT 1: CHỌN KHU (DÃY) --- */}
            <Col span={8}>
              <Form.Item
                label="Khu vực"
                name="block"
                rules={[{ required: true, message: 'Chọn khu!' }]}
              >
                <Select placeholder="Dãy nhà" onChange={handleBlockChange}>
                  {campusData.map((block) => (
                    <Option key={block.name} value={block.name}>
                      {block.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* --- SELECT 2: CHỌN TẦNG --- */}
            <Col span={8}>
              <Form.Item
                label="Tầng"
                name="floor"
                rules={[{ required: true, message: 'Chọn tầng!' }]}
              >
                <Select
                  placeholder="Chọn tầng"
                  onChange={handleFloorChange}
                  disabled={floors.length === 0} // Khóa nếu chưa chọn Khu
                >
                  {floors.map((floor) => (
                    <Option key={floor.id} value={floor.id}>
                      {floor.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* --- SELECT 3: CHỌN PHÒNG (9 LỚP) --- */}
            <Col span={8}>
              <Form.Item
                label="Phòng học"
                name="room"
                rules={[{ required: true, message: 'Chọn phòng!' }]}
              >
                <Select
                  placeholder="Số phòng"
                  disabled={rooms.length === 0} // Khóa nếu chưa chọn Tầng
                >
                  {rooms.map((roomName) => (
                    <Option key={roomName} value={roomName}>
                      {roomName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
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

export default SessionManagement;
