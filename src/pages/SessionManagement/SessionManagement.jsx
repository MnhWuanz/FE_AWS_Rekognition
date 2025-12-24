import React, { useEffect, useState } from 'react';
import { Button, Col, message, Row, Select, Space, Table, Tag } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import courseAPI from '../../api/apiUser/CourseAPI';
import sessionApi from '../../api/apiUser/SessionAPI';
import studentApi from '../../api/apiUser/StudentAPI';
import attendanceApi from '../../api/apiUser/AttendanceAPI';
import enrolmentApi from '../../api/apiUser/EnrolmentAPI';

const SessionManagement = () => {
  const [courses, setCourses] = useState([]);
  const [coursesWithSchedule, setCoursesWithSchedule] = useState([]); // Môn học với thông tin lịch
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  // States cho filter
  const [selectedCourseSchedule, setSelectedCourseSchedule] = useState(null); // Chọn môn + lịch
  const [selectedSessionFilter, setSelectedSessionFilter] = useState(null);
  const [filteredSessions, setFilteredSessions] = useState([]);

  // State cho danh sách điểm danh
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  // Map thứ
  const daysMap = {
    1: 'Thứ 2',
    2: 'Thứ 3',
    3: 'Thứ 4',
    4: 'Thứ 5',
    5: 'Thứ 6',
    6: 'Thứ 7',
    0: 'Chủ nhật',
  };

  // Fetch courses và parse schedule
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await courseAPI.getAll();
      const data = res.data.data || res.data;
      setCourses(data);

      // Parse code để lấy thông tin lịch học
      const coursesWithInfo = data.map((course) => {
        let parsedCode = course.code;
        let dayId = null;
        let dayName = '';
        let startPeriod = null;
        let endPeriod = null;
        let room = '';
        let classPeriod = '';

        // Parse: code|id thứ|tiết bd - tiết kết thúc|room
        if (course.code && course.code.includes('|')) {
          const parts = course.code.split('|');
          parsedCode = parts[0]; // Mã môn thật
          dayId = parts[1] ? parseInt(parts[1]) : null;
          dayName = dayId !== null ? daysMap[dayId] || '' : '';

          // Parse tiết học
          if (parts[2] && parts[2].includes('-')) {
            const periods = parts[2].split('-');
            startPeriod = periods[0] ? parseInt(periods[0]) : null;
            endPeriod = periods[1] ? parseInt(periods[1]) : null;
            classPeriod = parts[2];
          }

          room = parts[3] || '';
        }

        return {
          ...course,
          parsedCode: parsedCode,
          dayId: dayId,
          dayName: dayName,
          startPeriod: startPeriod,
          endPeriod: endPeriod,
          classPeriod: classPeriod,
          room: room,
          // Tạo label hiển thị: "LTDD - Lập trình di động (Thứ 2, 1-3, C708)"
          scheduleLabel: `${parsedCode} - ${course.name} (${dayName}, Tiết ${classPeriod}, ${room})`,
        };
      });

      setCoursesWithSchedule(coursesWithInfo);
    } catch (error) {
      console.error('Error fetching courses:', error);
      messageApi.error('Không thể tải danh sách môn học');
    } finally {
      setLoading(false);
    }
  };

  // Fetch sessions
  const fetchSession = async () => {
    if (courses.length === 0) return;
    setLoading(true);
    try {
      const res = await sessionApi.getAll();
      const rawData = res.data.data;
      const formattedData = rawData.map((item) => ({
        id: item.id,
        courseId: item.courseId,
        name: item.name,
      }));
      setSessions(formattedData);
    } catch (error) {
      console.error(error);
      messageApi.error('Load ca học thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Render đầu tiên
  useEffect(() => {
    fetchCourses();
  }, []);

  // Fetch sessions khi có courses
  useEffect(() => {
    fetchSession();
  }, [courses]);

  // Filter sessions theo course schedule đã chọn
  useEffect(() => {
    let filtered = [...sessions];

    if (selectedCourseSchedule) {
      // selectedCourseSchedule = course.id
      filtered = filtered.filter(
        (session) => session.courseId === selectedCourseSchedule
      );
    }

    setFilteredSessions(filtered);
  }, [sessions, selectedCourseSchedule]);

  // Fetch attendance khi chọn session
  useEffect(() => {
    if (selectedSessionFilter && selectedCourseSchedule) {
      fetchAttendance(selectedSessionFilter, selectedCourseSchedule);
    } else {
      setAttendanceRecords([]);
    }
  }, [selectedSessionFilter]);

  // Hàm lấy giờ bắt đầu tiết học (format: HH:mm)
  const getClassPeriodStartTime = (period) => {
    const periodTimes = {
      1: '07:00',
      2: '07:50',
      3: '08:40',
      4: '09:40',
      5: '10:30',
      6: '11:20',
      7: '12:30',
      8: '13:20',
      9: '14:10',
      10: '15:10',
      11: '16:00',
      12: '16:50',
      13: '17:45',
      14: '18:35',
      15: '19:25',
    };
    return periodTimes[period] || '07:00';
  };

  // Hàm xét trạng thái điểm danh
  const getAttendanceStatus = (checkInTime, startPeriod) => {
    if (!checkInTime) {
      return { status: 'absent', label: '✗ Vắng', color: 'error' };
    }

    const checkIn = new Date(checkInTime);
    const startTime = getClassPeriodStartTime(startPeriod);
    const [hours, minutes] = startTime.split(':').map(Number);

    const classStart = new Date(checkIn);
    classStart.setHours(hours, minutes, 0, 0);

    const diffMinutes = (checkIn - classStart) / (1000 * 60);

    if (diffMinutes <= 15) {
      return { status: 'on-time', label: '✓ Đúng giờ', color: 'success' };
    } else {
      return { status: 'late', label: '⚠ Đi trễ', color: 'warning' };
    }
  };

  // Fetch attendance của session
  const fetchAttendance = async (sessionId, courseId) => {
    setLoading(true);
    try {
      // Lấy thông tin course để biết startPeriod
      const courseInfo = coursesWithSchedule.find((c) => c.id === courseId);
      const startPeriod = courseInfo?.startPeriod || 1;

      // Lấy tất cả enrolments của môn học
      const enrolRes = await enrolmentApi.getAll();
      const allEnrolments = enrolRes.data.data || enrolRes.data || [];
      const courseEnrolments = allEnrolments.filter(
        (enrol) => enrol.courseId === courseId || enrol.course_id === courseId
      );

      // Lấy tất cả attendance của session
      const attRes = await attendanceApi.getAll();
      const allAttendance = attRes.data.data || attRes.data || [];
      const sessionAttendance = allAttendance.filter(
        (att) => att.sessionId === sessionId || att.session_id === sessionId
      );

      // Lấy tất cả students
      const studentsRes = await studentApi.getAll();
      const allStudentsData = studentsRes.data.data || studentsRes.data || [];

      // Map tất cả sinh viên enrolled với attendance của họ
      const attendanceWithInfo = courseEnrolments.map((enrol) => {
        const studentId = enrol.studentId || enrol.student_id;
        const student = allStudentsData.find((s) => s.id === studentId);

        // Tìm attendance record của sinh viên này trong session
        const attendanceRecord = sessionAttendance.find(
          (att) => (att.studentId || att.student_id) === studentId
        );

        const checkInTime =
          attendanceRecord?.checkInTime ||
          attendanceRecord?.check_in_time ||
          null;
        const statusInfo = getAttendanceStatus(checkInTime, startPeriod);

        return {
          id: attendanceRecord?.id || `enrol-${enrol.id}`,
          studentId: studentId,
          code: student?.code || 'N/A',
          name: student?.name || 'N/A',
          email: student?.email || 'N/A',
          class: student?.class || '',
          status: statusInfo.status,
          statusLabel: statusInfo.label,
          statusColor: statusInfo.color,
          checkInTime: checkInTime,
        };
      });

      setAttendanceRecords(attendanceWithInfo);

      if (attendanceWithInfo.length === 0) {
        messageApi.info('Chưa có sinh viên nào đăng ký môn học này');
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      messageApi.error('Không thể tải dữ liệu điểm danh');
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSelectedCourseSchedule(null);
    setSelectedSessionFilter(null);
  };

  // Lấy thông tin môn học đã chọn để hiển thị
  const getSelectedCourseInfo = () => {
    if (!selectedCourseSchedule) return null;
    return coursesWithSchedule.find((c) => c.id === selectedCourseSchedule);
  };

  const selectedCourseInfo = getSelectedCourseInfo();

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {contextHolder}

      {/* Filter Section */}
      <div
        style={{
          background: 'white',
          padding: '20px 24px',
          borderRadius: '8px',
          marginBottom: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <Row gutter={16} align="middle">
          <Col span={12}>
            <div
              style={{ marginBottom: '8px', fontWeight: '500', color: '#666' }}
            >
              🎓 Môn học (Thứ, Tiết, Phòng)
            </div>
            <Select
              placeholder="Chọn môn học và lịch học"
              style={{ width: '100%' }}
              size="large"
              allowClear
              showSearch
              value={selectedCourseSchedule}
              onChange={(value) => {
                setSelectedCourseSchedule(value);
                setSelectedSessionFilter(null); // Reset session khi đổi môn
              }}
              filterOption={(input, option) =>
                (option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={coursesWithSchedule.map((course) => ({
                label: course.scheduleLabel,
                value: course.id,
              }))}
            />
          </Col>

          <Col span={6}>
            <div
              style={{ marginBottom: '8px', fontWeight: '500', color: '#666' }}
            >
              📚 Tuần học
            </div>
            <Select
              placeholder="Chọn tuần học"
              style={{ width: '100%' }}
              size="large"
              allowClear
              disabled={!selectedCourseSchedule}
              value={selectedSessionFilter}
              onChange={setSelectedSessionFilter}
              options={filteredSessions.map((session) => ({
                label: session.name,
                value: session.id,
              }))}
            />
          </Col>

          <Col span={4}>
            <div style={{ marginBottom: '8px', opacity: 0 }}>.</div>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleResetFilters}
                size="large"
                disabled={!selectedCourseSchedule && !selectedSessionFilter}
              >
                Xóa bộ lọc
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Hiển thị thông tin môn học đã chọn */}
        {selectedCourseInfo && (
          <div
            style={{
              marginTop: '16px',
              padding: '12px',
              background: '#f5f5f5',
              borderRadius: '6px',
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <Tag color="cyan" style={{ fontSize: '14px', padding: '4px 12px' }}>
              Mã: {selectedCourseInfo.parsedCode}
            </Tag>
            <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
              Tên: {selectedCourseInfo.name}
            </Tag>
            <Tag
              color="green"
              style={{ fontSize: '14px', padding: '4px 12px' }}
            >
              Ngày: {selectedCourseInfo.dayName}
            </Tag>
            <Tag
              color="purple"
              style={{ fontSize: '14px', padding: '4px 12px' }}
            >
              Tiết: {selectedCourseInfo.classPeriod}
            </Tag>
            <Tag
              color="orange"
              style={{ fontSize: '14px', padding: '4px 12px' }}
            >
              Phòng: {selectedCourseInfo.room}
            </Tag>
          </div>
        )}
      </div>

      {/* Bảng điểm danh */}
      {selectedSessionFilter && (
        <div
          style={{
            background: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <div
            style={{
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
              📋 Bảng điểm danh -{' '}
              {
                filteredSessions.find((s) => s.id === selectedSessionFilter)
                  ?.name
              }
            </h3>
            <Space>
              <Tag
                color="blue"
                style={{ fontSize: '14px', padding: '6px 12px' }}
              >
                Tổng: {attendanceRecords.length} sinh viên
              </Tag>
              <Tag
                color="green"
                style={{ fontSize: '14px', padding: '6px 12px' }}
              >
                Đúng giờ:{' '}
                {attendanceRecords.filter((r) => r.status === 'on-time').length}
              </Tag>
              <Tag
                color="orange"
                style={{ fontSize: '14px', padding: '6px 12px' }}
              >
                Đi trễ:{' '}
                {attendanceRecords.filter((r) => r.status === 'late').length}
              </Tag>
              <Tag
                color="red"
                style={{ fontSize: '14px', padding: '6px 12px' }}
              >
                Vắng:{' '}
                {attendanceRecords.filter((r) => r.status === 'absent').length}
              </Tag>
            </Space>
          </div>
          <Table
            columns={[
              {
                title: 'STT',
                key: 'index',
                width: '5%',
                align: 'center',
                render: (_, __, index) => index + 1,
              },
              {
                title: 'Mã sinh viên',
                dataIndex: 'code',
                key: 'code',
                width: '12%',
                render: (value) => <Tag color="cyan">{value}</Tag>,
              },
              {
                title: 'Họ và tên',
                dataIndex: 'name',
                key: 'name',
                width: '20%',
                render: (value) => <strong>{value}</strong>,
              },
              {
                title: 'Email',
                dataIndex: 'email',
                key: 'email',
                width: '20%',
              },
              {
                title: 'Lớp',
                dataIndex: 'class',
                key: 'class',
                width: '10%',
                align: 'center',
                render: (value) => <Tag color="geekblue">{value}</Tag>,
              },
              {
                title: 'Trạng thái',
                key: 'status',
                width: '12%',
                align: 'center',
                render: (_, record) => (
                  <Tag color={record.statusColor}>{record.statusLabel}</Tag>
                ),
              },
              {
                title: 'Thời gian check-in',
                dataIndex: 'checkInTime',
                key: 'checkInTime',
                width: '16%',
                align: 'center',
                render: (value) =>
                  value ? new Date(value).toLocaleString('vi-VN') : '-',
              },
            ]}
            dataSource={attendanceRecords}
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} bản ghi`,
            }}
            bordered
            size="middle"
            rowKey={(record) => record.id}
          />
        </div>
      )}

      {/* Empty state */}
      {!selectedSessionFilter && (
        <div
          style={{
            background: 'white',
            padding: '60px 24px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <h3 style={{ color: '#666', fontSize: '16px', fontWeight: '400' }}>
            Vui lòng chọn môn học (với thông tin lịch học) và tuần học để xem
            bảng điểm danh
          </h3>
        </div>
      )}
    </div>
  );
};

export default SessionManagement;
