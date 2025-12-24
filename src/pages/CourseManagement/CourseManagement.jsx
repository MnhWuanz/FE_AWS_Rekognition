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
  Upload,
  Descriptions,
  Spin,
  Progress,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  UploadOutlined,
  DownloadOutlined,
  UsergroupAddOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import courseAPI from '../../api/apiUser/CourseAPI';
import userAPI from '../../api/apiUser/UserAPI';
import studentApi from '../../api/apiUser/StudentAPI';
import enrolmentApi from '../../api/apiUser/EnrolmentAPI';
import sessionApi from '../../api/apiUser/SessionAPI';
import dayjs from 'dayjs';

const CourseManagement = () => {
  const [form] = Form.useForm();
  const [courses, setCourses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const { RangePicker } = DatePicker;

  // States cho import sinh viên
  const [openStudentModal, setOpenStudentModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [excelData, setExcelData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [allStudents, setAllStudents] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);

  // States cho loading import
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState('');

  // Columns cho bảng môn học
  const columns = [
    {
      title: 'Mã môn học',
      dataIndex: 'code',
      key: 'code',
      sorter: (a, b) => a.code.localeCompare(b.code),
      render: (value) => <Tag color="cyan">{value}</Tag>,
    },
    {
      title: 'Tên môn học',
      dataIndex: 'name',
      key: 'name',
      render: (value) => <Tag color="geekblue">{value}</Tag>,
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
    },
    {
      title: 'Thời gian',
      key: 'time',
      render: (_, record) => {
        if (record.startTime && record.endTime) {
          const start = new Date(record.startTime).toLocaleDateString('vi-VN');
          const end = new Date(record.endTime).toLocaleDateString('vi-VN');
          return (
            <span>
              <Tag color="green">{start}</Tag>
              <span> → </span>
              <Tag color="orange">{end}</Tag>
            </span>
          );
        }
        return <Tag>-</Tag>;
      },
      width: '50%',
    },
    {
      title: 'Phòng Học',
      dataIndex: 'room',
      align: 'center',
      key: 'room',
      render: (value) => <Tag color="orange">{value}</Tag>,
    },
    {
      title: 'Ngày',
      align: 'center',
      dataIndex: 'day',
      key: 'day',
      render: (value) => <Tag color="green">{value}</Tag>,
    },
    {
      title: 'Tiết học',
      align: 'center',
      dataIndex: 'class_period',
      key: 'class_period',
      render: (value) => <Tag color="purple">{value}</Tag>,
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            type="primary"
            icon={<UsergroupAddOutlined />}
            onClick={() => handleManageStudents(record)}
          >
            Quản lý SV
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Delete the Session"
            description="Bạn có muốn xóa môn học này?"
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

  const days = [
    { id: 1, name: 'Thứ 2' },
    { id: 2, name: 'Thứ 3' },
    { id: 3, name: 'Thứ 4' },
    { id: 4, name: 'Thứ 5' },
    { id: 5, name: 'Thứ 6' },
    { id: 6, name: 'Thứ 7' },
  ];

  const class_periods = [
    { id: 1, name: 'Tiết 1 (07h00 - 07h50)', time: '07h50' },
    { id: 2, name: 'Tiết 2 (07h50 - 08h40)', time: '08h40' },
    { id: 3, name: 'Tiết 3 (08h40 - 09h30)', time: '09h30' },
    { id: 4, name: 'Tiết 4 (09h35 - 10h25)', time: '10h25' },
    { id: 5, name: 'Tiết 5 (10h25 - 11h15)', time: '11h15' },
    { id: 6, name: 'Tiết 6 (11h15 - 12h05)', time: '12h05' },
    { id: 7, name: 'Tiết 7 (12h35 - 13h25)', time: '13h25' },
    { id: 8, name: 'Tiết 8 (13h25 - 14h15)', time: '14h15' },
    { id: 9, name: 'Tiết 9 (14h15 - 15h05)', time: '15h05' },
    { id: 10, name: 'Tiết 10 (15h10 - 16h00)', time: '16h00' },
    { id: 11, name: 'Tiết 11 (16h00 - 16h50)', time: '16h50' },
    { id: 12, name: 'Tiết 12 (16h50 - 17h40)', time: '17h40' },
    { id: 13, name: 'Tiết 13 (17h45 - 18h35)', time: '18h35' },
    { id: 14, name: 'Tiết 14 (18h35 - 19h25)', time: '19h25' },
    { id: 15, name: 'Tiết 15 (19h25 - 20h15)', time: '20h15' },
  ];

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
          rooms: ['C501', 'C502', 'C503', 'C504', 'C505'],
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

  const handleDeleteCourse = async (id) => {
    setLoading(true);
    try {
      await courseAPI.deleteCourse(id);
      messageApi.success('Xóa môn học thành công');
      fetchCourses();
    } catch (error) {
      console.log(error);
      messageApi.error('Xóa môn học thất bại');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await courseAPI.getAll();
      const data = res.data.data || res.data;
      const formattedData = data.map((item) => {
        let parsedCode = item.code;
        let day = '';
        let classPeriod = '';
        let room = '';
        const getDay = (valueDay) => {
          const day = days.find((value) => value.id == valueDay);
          return day ? day.name : 'Chưa xác định';
        };

        if (item.code && item.code.includes('|')) {
          const parts = item.code.split('|');
          parsedCode = parts[0] || item.code;
          day = getDay(parts[1]) || '';
          classPeriod = parts[2] || '';
          room = parts[3] || '';
        }

        return {
          ...item,
          key: item.courseid,
          originalCode: item.code,
          code: parsedCode,
          day: day,
          class_period: classPeriod,
          room: room,
        };
      });
      setCourses(formattedData);
    } catch (error) {
      console.error('Error fetching courses:', error);
      messageApi.error('Không thể tải danh sách môn học');
    } finally {
      setLoading(false);
    }
  };

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

  const fetchAllStudents = async () => {
    try {
      const res = await studentApi.getAll();
      const data = res.data.data || res.data;
      setAllStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchLecturers();
    fetchAllStudents();
  }, []);

  const handleAdd = () => {
    setEditingCourse(null);
    form.resetFields();
    setOpenModal(true);
  };

  const handleEdit = (record) => {
    setEditingCourse(record);
    let parsedCode = record.code;
    let day = undefined;
    let startPeriod = undefined;
    let endPeriod = undefined;
    let room = undefined;
    let block = undefined;
    let floor = undefined;

    const originalCode = record.originalCode || record.code;

    if (originalCode && originalCode.includes('|')) {
      const parts = originalCode.split('|');
      parsedCode = parts[0];
      day = parts[1] ? parseInt(parts[1]) : undefined;

      if (parts[2] && parts[2].includes('-')) {
        const periods = parts[2].split('-');
        startPeriod = periods[0] ? parseInt(periods[0]) : undefined;
        endPeriod = periods[1] ? parseInt(periods[1]) : undefined;
      }

      room = parts[3];

      if (room) {
        block = `Khu ${room.charAt(0)}`;
        floor = `${room.charAt(0)}${room.charAt(1)}`;

        const selectedBlockData = campusData.find((b) => b.name === block);
        if (selectedBlockData) {
          setFloors(selectedBlockData.floors);
          const selectedFloorData = selectedBlockData.floors.find(
            (f) => f.id === floor
          );
          if (selectedFloorData) {
            setRooms(selectedFloorData.rooms);
          }
        }
      }
    }

    form.setFieldsValue({
      code: parsedCode,
      name: record.name,
      userId: record.userId,
      starttime: [
        dayjs(record.startTime).startOf('day'),
        dayjs(record.endTime).startOf('day'),
      ],
      day: day,
      start_period: startPeriod,
      end_period: endPeriod,
      block: block,
      floor: floor,
      room: room,
    });

    setOpenModal(true);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    const data = values.starttime;
    const start = dayjs(data[0]);
    const end = dayjs(data[1]);
    const daysDiff = end.diff(start, 'day');
    const weeks = Math.ceil(daysDiff / 7);

    const formattedCode = `${values.code}|${values.day}|${values.start_period}-${values.end_period}|${values.room}`;
    const startTime = data[0].format('YYYY-MM-DD');
    const endTime = data[1].format('YYYY-MM-DD');

    const dayOfWeekMap = {
      1: 1,
      2: 2,
      3: 3,
      4: 4,
      5: 5,
      6: 6,
      0: 0,
    };

    try {
      let courseId;

      if (editingCourse) {
        await courseAPI.updateCourse({
          id: editingCourse.id,
          code: formattedCode,
          name: values.name,
          startTime: startTime,
          endTime: endTime,
        });
        courseId = editingCourse.id;
        messageApi.success('Cập nhật môn học thành công');
      } else {
        const createRes = await courseAPI.createCourse({
          code: formattedCode,
          name: values.name,
          userId: values.userId,
          startTime: startTime,
          endTime: endTime,
        });
        courseId = createRes.data.data;
        messageApi.success('Thêm môn học thành công');
      }

      if (courseId && weeks > 0) {
        messageApi.info(`Đang tạo ${weeks} tuần học...`);

        let successCount = 0;
        let failCount = 0;

        const targetDayOfWeek = dayOfWeekMap[values.day];

        if (targetDayOfWeek === undefined) {
          messageApi.error('Ngày trong tuần không hợp lệ!');
          setLoading(false);
          return;
        }

        let firstClassDate = start.clone();
        while (firstClassDate.day() !== targetDayOfWeek) {
          firstClassDate = firstClassDate.add(1, 'day');
        }

        for (let i = 1; i <= weeks; i++) {
          try {
            const classDate = firstClassDate.clone().add((i - 1) * 7, 'day');
            const formattedDate = classDate.format('DD/MM/YYYY');

            await sessionApi.createSession({
              name: `Tuần ${i} (${formattedDate})`,
              courseId: courseId,
            });
            successCount++;
          } catch (error) {
            console.error(`Lỗi khi tạo Tuần ${i}:`, error);
            failCount++;
          }
        }

        if (successCount > 0) {
          messageApi.success(`Đã tạo ${successCount} tuần học thành công!`);
        }
        if (failCount > 0) {
          messageApi.warning(`Có ${failCount} tuần học tạo thất bại`);
        }
      }

      form.resetFields();
      setOpenModal(false);
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

  const handleBlockChange = (value) => {
    const selectedBlockData = campusData.find((block) => block.name === value);
    setFloors(selectedBlockData ? selectedBlockData.floors : []);
    setRooms([]);
    form.setFieldsValue({ floor: undefined, room: undefined });
  };

  const handleFloorChange = (value) => {
    const selectedFloorData = floors.find((floor) => floor.id === value);
    setRooms(selectedFloorData ? selectedFloorData.rooms : []);
    form.setFieldsValue({ room: undefined });
  };

  const fetchEnrolledStudents = async (courseId) => {
    setLoading(true);
    try {
      const res = await enrolmentApi.getAll();
      const allEnrolments = res.data.data || res.data || [];
      const enrolments = allEnrolments.filter(
        (enrol) => enrol.courseId === courseId || enrol.course_id === courseId
      );

      const studentsWithInfo = enrolments.map((enrol) => {
        const student = allStudents.find(
          (s) => s.id === enrol.studentId || s.id === enrol.student_id
        );
        return {
          ...enrol,
          code: student?.code || 'N/A',
          name: student?.name || 'N/A',
          email: student?.email || 'N/A',
          class: student?.class || '',
          faceId: student?.faceId || null,
          faceUrl: student?.faceUrl || null,
        };
      });
      setEnrolledStudents(studentsWithInfo);

      if (studentsWithInfo.length === 0) {
        messageApi.info('Chưa có sinh viên nào đăng ký môn học này');
      }
    } catch (error) {
      console.error('Error fetching enrolled students:', error);
      messageApi.error(
        'Không thể tải danh sách sinh viên: ' +
          (error.response?.data?.message || error.message)
      );
      setEnrolledStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleManageStudents = (course) => {
    setSelectedCourse(course);
    setExcelData([]);
    setSearchText('');
    setEnrolledStudents([]);
    setImportProgress(0);
    setImportStatus('');
    setOpenStudentModal(true);

    if (course && course.id) {
      fetchEnrolledStudents(course.id);
    }
  };

  const handleDownloadTemplate = () => {
    const template = [
      {
        'Mã sinh viên': 'DH52200999',
        'Họ lót': 'Nguyễn Văn',
        Tên: 'A',
        Email: 'dh52200999@student.stu.edu.vn',
        'Mã lớp': 'DH21IT01',
        'ĐT liên lạc': '0123456789',
      },
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DanhSachSinhVien');
    XLSX.writeFile(wb, 'Template_DanhSachSinhVien_STU.xlsx');
    messageApi.success('Đã tải template thành công');
  };

  const handleUploadExcel = async (file) => {
    if (!selectedCourse || !selectedCourse.id) {
      messageApi.error('Vui lòng chọn môn học trước khi import!');
      return false;
    }

    setIsImporting(true); // ✅ Bật loading
    setImportProgress(0);
    setImportStatus('Đang đọc file Excel...');

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          messageApi.warning('File Excel không có dữ liệu!');
          setIsImporting(false);
          return;
        }

        setImportProgress(10);
        setImportStatus('Đang xử lý dữ liệu...');

        // Format data
        const formattedData = jsonData.map((row) => {
          const studentCode = row['Mã sinh viên']?.toString().trim() || '';
          const hoLot = row['Họ lót']?.toString().trim() || '';
          const ten = row['Tên']?.toString().trim() || '';
          const fullName = `${hoLot} ${ten}`.trim();
          const email =
            row['Email']?.toString().trim() ||
            `${studentCode}@student.stu.edu.vn`;
          const maLop = row['Mã lớp']?.toString().trim() || '';
          return {
            code: studentCode,
            name: fullName,
            email: email,
            class: maLop,
            faceId: null,
            faceUrl: null,
          };
        });

        setExcelData(formattedData);
        setImportProgress(20);

        // Lấy enrolments hiện tại
        const enrolledRes = await enrolmentApi.getAll();
        const allEnrolments = enrolledRes.data.data || enrolledRes.data || [];
        const currentEnrolments = allEnrolments.filter(
          (enrol) =>
            enrol.courseId === selectedCourse.id ||
            enrol.course_id === selectedCourse.id
        );

        const createdStudents = [];
        const existingStudents = [];
        const duplicateStudents = [];
        const enrolmentRecords = [];
        const failedStudents = [];

        const totalStudents = formattedData.length;
        let processedCount = 0;

        // ✅ Xử lý từng sinh viên với progress bar
        for (const row of formattedData) {
          const { code, name, email, class: className } = row;

          if (!code || !name || !email) {
            failedStudents.push(
              `${code || 'N/A'} - ${name || 'N/A'} (Thiếu thông tin bắt buộc)`
            );
            processedCount++;
            continue;
          }

          try {
            setImportStatus(
              `Đang xử lý sinh viên ${
                processedCount + 1
              }/${totalStudents}: ${name}`
            );
            setImportProgress(20 + (processedCount / totalStudents) * 40);
            let student = allStudents.find(
              (s) => s.code === code || s.email === email
            );

            if (!student) {
              const newStudentData = {
                code: code,
                name: name,
                email: email,
                phone: '',
                class: className,
                face_id: null,
              };
              const createRes = await studentApi.createStudent(newStudentData);
              student = createRes.data.data || createRes.data;
              createdStudents.push(`${code} - ${name}`);
              setAllStudents((prev) => [...prev, student]);
            } else {
              existingStudents.push(`${code} - ${name}`);
            }

            if (student && student.id) {
              const alreadyEnrolled = currentEnrolments.some(
                (enrol) =>
                  enrol.studentId === student.id ||
                  enrol.student_id === student.id
              );

              if (alreadyEnrolled) {
                duplicateStudents.push(`${code} - ${name}`);
              } else {
                enrolmentRecords.push({
                  courseId: selectedCourse.id,
                  studentId: student.id,
                });
              }
            }
          } catch (error) {
            console.error(`❌ Lỗi khi xử lý sinh viên ${code}:`, error);
            failedStudents.push(
              `${code} - ${name} (${
                error.response?.data?.message || error.message
              })`
            );
          }

          processedCount++;
        }

        setImportProgress(60);
        setImportStatus('Đang thêm sinh viên vào môn học...');

        // ✅ Tạo enrolments với progress
        if (enrolmentRecords.length > 0) {
          let successCount = 0;
          let failCount = 0;
          const totalEnrolments = enrolmentRecords.length;

          for (let i = 0; i < enrolmentRecords.length; i++) {
            const record = enrolmentRecords[i];
            try {
              await enrolmentApi.createEnrolment(record);
              successCount++;
              setImportProgress(60 + ((i + 1) / totalEnrolments) * 35);
              setImportStatus(
                `Đang enrol ${i + 1}/${totalEnrolments} sinh viên...`
              );
            } catch (error) {
              failCount++;
              console.error('Lỗi khi tạo enrolment:', error, record);
            }
          }

          // Hiển thị kết quả
          if (createdStudents.length > 0) {
            messageApi.success(
              `✅ Đã tạo mới ${createdStudents.length} sinh viên`
            );
          }
          if (existingStudents.length > 0) {
            messageApi.info(
              `ℹ️ ${existingStudents.length} sinh viên đã có trong hệ thống`
            );
          }
          if (duplicateStudents.length > 0) {
            messageApi.warning(
              `⚠️ ${duplicateStudents.length} sinh viên đã có trong môn học (bỏ qua)`
            );
          }
          if (successCount > 0) {
            messageApi.success(
              `✅ Đã thêm ${successCount} sinh viên vào môn học thành công!`
            );
          }
          if (failCount > 0) {
            messageApi.error(
              `❌ Có ${failCount} sinh viên thêm vào enrolment thất bại`
            );
          }
          if (failedStudents.length > 0) {
            messageApi.warning(
              `⚠️ Không thể xử lý ${failedStudents.length} sinh viên. Kiểm tra console`
            );
          }

          fetchAllStudents();
          if (selectedCourse && selectedCourse.id) {
            fetchEnrolledStudents(selectedCourse.id);
          }
        } else {
          if (duplicateStudents.length > 0) {
            messageApi.info(
              `Tất cả ${duplicateStudents.length} sinh viên đã có trong môn học`
            );
          } else {
            messageApi.info('Không có sinh viên mới để thêm vào môn học');
          }
        }

        setImportProgress(100);
        setImportStatus('Hoàn thành!');

        // ✅ Tắt loading sau 1.5s
        setTimeout(() => {
          setIsImporting(false);
          setImportProgress(0);
          setImportStatus('');
        }, 1500);
      } catch (error) {
        console.error('Error processing Excel:', error);
        messageApi.error('Lỗi khi xử lý file Excel: ' + error.message);
        setIsImporting(false);
      }
    };

    reader.readAsArrayBuffer(file);
    return false;
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
            label="Thời gian bắt đầu - kết thúc"
            name="starttime"
            rules={[
              { required: true, message: 'Vui lòng nhập thời gian bắt đầu' },
            ]}
          >
            <RangePicker />
          </Form.Item>
          <Form.Item
            label="Ngày "
            name="day"
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
                label="Tiết bắt đầu"
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
                label="Tiết kết thúc"
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

      {/* Modal Import Sinh Viên */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UsergroupAddOutlined style={{ fontSize: 20 }} />
            <span>Quản lý sinh viên - {selectedCourse?.name}</span>
            {isImporting && (
              <Tag color="processing" icon={<LoadingOutlined />}>
                Đang import...
              </Tag>
            )}
          </div>
        }
        open={openStudentModal}
        onCancel={() => {
          if (isImporting) {
            messageApi.warning('Vui lòng đợi quá trình import hoàn tất!');
            return;
          }
          setOpenStudentModal(false);
          setExcelData([]);
        }}
        closable={!isImporting} // ẩn nút X khi đang import
        maskClosable={!isImporting} // Không cho click overlay đóng
        footer={null}
        width={900}
      >
        {/* ✅ HIỂN THỊ LOADING OVERLAY */}
        {isImporting && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(255, 255, 255, 0.95)',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '40px',
            }}
          >
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
              size="large"
            />
            <div
              style={{
                marginTop: 24,
                fontSize: 16,
                fontWeight: 600,
                color: '#1890ff',
              }}
            >
              {importStatus}
            </div>
            <Progress
              percent={importProgress}
              status="active"
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
              style={{ width: '400px', marginTop: 16 }}
            />
            <div style={{ marginTop: 16, color: '#999', fontSize: 14 }}>
              Vui lòng không đóng cửa sổ này...
            </div>
          </div>
        )}

        {/* VÔ HIỆU HÓA CÁC NÚT KHI ĐANG IMPORT */}
        <Space
          style={{
            marginBottom: 16,
            width: '100%',
            justifyContent: 'space-between',
          }}
        >
          <Upload
            accept=".xlsx,.xls"
            beforeUpload={handleUploadExcel}
            showUploadList={false}
            disabled={isImporting} // Disable khi đang import
          >
            <Button
              type="primary"
              icon={<UploadOutlined />}
              disabled={isImporting}
              loading={isImporting}
            >
              Import Excel
            </Button>
          </Upload>

          <Button
            icon={<DownloadOutlined />}
            onClick={handleDownloadTemplate}
            disabled={isImporting}
          >
            Tải Template
          </Button>

          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              if (isImporting) {
                messageApi.warning('Vui lòng đợi import hoàn tất!');
                return;
              }
              setExcelData([]);
              setSearchText('');
            }}
            disabled={isImporting}
          >
            Làm mới
          </Button>
        </Space>

        {/* Thông tin môn học */}
        {selectedCourse && (
          <Descriptions
            bordered
            column={2}
            size="small"
            style={{ marginBottom: 16 }}
          >
            <Descriptions.Item label="Mã môn học">
              <Tag color="cyan">{selectedCourse.code}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Tên môn học">
              <Tag color="geekblue">{selectedCourse.name}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Phòng học">
              <Tag color="orange">{selectedCourse.room}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày học">
              <Tag color="green">{selectedCourse.day}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Tiết học" span={2}>
              <Tag color="purple">{selectedCourse.class_period}</Tag>
            </Descriptions.Item>
          </Descriptions>
        )}

        {/* Danh sách sinh viên đã đăng ký môn học */}
        {enrolledStudents.length > 0 && excelData.length === 0 && (
          <>
            <div style={{ marginBottom: 12 }}>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 'bold' }}>
                  Danh sách sinh viên đã đăng ký (
                  {
                    enrolledStudents.filter((student) => {
                      const search = searchText.toLowerCase();
                      return (
                        student.code.toLowerCase().includes(search) ||
                        student.name.toLowerCase().includes(search) ||
                        student.email.toLowerCase().includes(search) ||
                        student.class.toLowerCase().includes(search)
                      );
                    }).length
                  }
                  /{enrolledStudents.length})
                </div>
                <Input.Search
                  placeholder="Tìm theo mã SV, họ tên, email, lớp..."
                  allowClear
                  style={{ width: 350 }}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </Space>
            </div>
            <Table
              dataSource={enrolledStudents.filter((student) => {
                const search = searchText.toLowerCase();
                return (
                  student.code.toLowerCase().includes(search) ||
                  student.name.toLowerCase().includes(search) ||
                  student.email.toLowerCase().includes(search) ||
                  student.class.toLowerCase().includes(search)
                );
              })}
              columns={[
                {
                  title: 'STT',
                  key: 'index',
                  width: 60,
                  render: (_, __, index) => index + 1,
                },
                {
                  title: 'Mã SV',
                  dataIndex: 'code',
                  key: 'code',
                  render: (value) => <Tag color="blue">{value}</Tag>,
                },
                {
                  title: 'Họ tên',
                  dataIndex: 'name',
                  key: 'name',
                },
                {
                  title: 'Email',
                  dataIndex: 'email',
                  key: 'email',
                },
                {
                  title: 'Lớp',
                  dataIndex: 'class',
                  key: 'class',
                  render: (value) => <Tag color="green">{value}</Tag>,
                },
                {
                  title: 'Face ID',
                  dataIndex: 'faceId',
                  key: 'faceId',
                  align: 'center',
                  render: (value) =>
                    value ? (
                      <Tag color="success">Có</Tag>
                    ) : (
                      <Tag color="default">Chưa có</Tag>
                    ),
                },
              ]}
              rowKey={(record) => record.id || record.code}
              pagination={{ pageSize: 10 }}
              size="small"
            />
          </>
        )}

        {/* Danh sách sinh viên từ Excel */}
        {excelData.length > 0 && (
          <>
            <div style={{ marginBottom: 12 }}>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 'bold' }}>
                  📋 Danh sách sinh viên (
                  {
                    excelData.filter((student) => {
                      const search = searchText.toLowerCase();
                      return (
                        student.code.toLowerCase().includes(search) ||
                        student.name.toLowerCase().includes(search) ||
                        student.email.toLowerCase().includes(search) ||
                        student.class.toLowerCase().includes(search)
                      );
                    }).length
                  }
                  /{excelData.length})
                </div>
                <Input.Search
                  placeholder="Tìm theo mã SV, họ tên, email, lớp..."
                  allowClear
                  style={{ width: 350 }}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </Space>
            </div>
            <Table
              dataSource={excelData.filter((student) => {
                const search = searchText.toLowerCase();
                return (
                  student.code.toLowerCase().includes(search) ||
                  student.name.toLowerCase().includes(search) ||
                  student.email.toLowerCase().includes(search) ||
                  student.class.toLowerCase().includes(search)
                );
              })}
              columns={[
                {
                  title: 'STT',
                  key: 'index',
                  width: 60,
                  render: (_, __, index) => index + 1,
                },
                {
                  title: 'Mã SV',
                  dataIndex: 'code',
                  key: 'code',
                },
                {
                  title: 'Họ tên',
                  dataIndex: 'name',
                  key: 'name',
                },
                {
                  title: 'Email',
                  dataIndex: 'email',
                  key: 'email',
                },
                {
                  title: 'Lớp',
                  dataIndex: 'class',
                  key: 'class',
                },
              ]}
              rowKey="code"
              pagination={{ pageSize: 10 }}
              size="small"
            />
          </>
        )}

        {excelData.length === 0 && enrolledStudents.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            <UsergroupAddOutlined style={{ fontSize: 48, marginBottom: 16 }} />
            <div>Chưa có sinh viên nào. Vui lòng import file Excel</div>
          </div>
        )}
      </Modal>

      {/* Ghi chú tiết học */}
      <div
        style={{
          backgroundColor: '#f0f2f5',
          padding: '12px 16px',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          fontSize: 12,
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: 8, fontSize: 14 }}>
          📚 Ghi chú tiết học
        </div>
        <div
          style={{
            lineHeight: '20px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          <div>• Tiết 1: 07h00 - 07h50</div>
          <div>• Tiết 2: 08h00 - 08h50</div>
          <div>• Tiết 3: 09h00 - 09h50</div>
          <div>• Tiết 4: 10h00 - 10h50</div>
          <div>• Tiết 5: 11h00 - 11h50</div>
          <div>• Tiết 6: 13h00 - 13h50</div>
          <div>• Tiết 7: 14h00 - 14h50</div>
          <div>• Tiết 8: 15h00 - 15h50</div>
          <div>• Tiết 9: 16h00 - 16h50</div>
          <div>• Tiết 10: 17h00 - 17h50</div>
        </div>
      </div>
    </div>
  );
};

export default CourseManagement;
