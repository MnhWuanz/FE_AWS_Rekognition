import React, { useEffect, useRef, useState } from 'react';
import './FaceRollCall.css';
import { postFaceCheck } from '../../api/check';
import { Button, notification, Select, Tag, Row, Col, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import courseAPI from '../../api/apiUser/CourseAPI';
import sessionApi from '../../api/apiUser/SessionAPI';
import attendanceApi from '../../api/apiUser/AttendanceAPI';
import studentApi from '../../api/apiUser/StudentAPI';

const FaceRollCall = () => {
  const [api, contextHolder] = notification.useNotification();
  const [courses, setCourses] = useState([]);
  const [coursesWithSchedule, setCoursesWithSchedule] = useState([]); // Môn học với thông tin lịch
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  
  // States cho filter - giống SessionManagement
  const [selectedCourseSchedule, setSelectedCourseSchedule] = useState(null); // Chọn môn + lịch
  const [selectedSessionFilter, setSelectedSessionFilter] = useState(null); // Chọn tuần học
  
  const [loading, setLoading] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);

  // Map thứ - giống SessionManagement
  const daysMap = {
    1: 'Thứ 2',
    2: 'Thứ 3',
    3: 'Thứ 4',
    4: 'Thứ 5',
    5: 'Thứ 6',
    6: 'Thứ 7',
    0: 'Chủ nhật',
  };

  const openNotification = (level, message, description) => {
    api[level]({
      message,
      description,
      placement: 'topRight',
    });
  };
const getClassPeriodStartTime = (period) => {
    const periodTimes = {
      1: '07:00',
      2: '07:50',
      3: '08:40',
      4: '09:35',
      5: '10:25',
      6: '11:15',
      7: '12:35',
      8: '13:25',
      9: '14:15',
      10: '15:15',
      11: '16:00',
      12: '16:50',
      13: '17:45',
      14: '18:35',
      15: '19:25',
    };
    return periodTimes[period];
  };

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

        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
    });
  };

  const handleCapture = async (base64) => {
    if (!selectedCourseSchedule) {
      openNotification(
        'warning',
        'Chưa chọn môn học',
        'Vui lòng chọn môn học trước khi điểm danh'
      );
      return;
    }
    if (!selectedSessionFilter) {
      openNotification(
        'warning',
        'Chưa chọn tuần học',
        'Vui lòng chọn tuần học trước khi điểm danh'
      );
      return;
    }

    setLoading(true);
    const zip = await resizeBase64(base64);
    
    // Lấy thông tin môn học và session đã chọn
    const courseInfo = coursesWithSchedule.find(c => c.id === selectedCourseSchedule);
    const sessionInfo = filteredSessions.find(s => s.id === selectedSessionFilter);
    
    try {
      const res = await postFaceCheck(zip);

      if (res.valid) {
        const mssv = res.data.mssv;
        
        // Tìm studentId từ mssv
        const studentsRes = await studentApi.getAll();
        const allStudents = studentsRes.data.data || studentsRes.data || [];
        const student = allStudents.find(s => s.code === mssv || s.mssv === mssv);
        
        if (!student) {
          openNotification('error', 'Không tìm thấy sinh viên', `Không tìm thấy sinh viên với MSSV: ${mssv} trong hệ thống`);
          setLoading(false);
          return;
        }

        // Hàm tạo ISO string với múi giờ địa phương
        const getLocalISOString = () => {
          const now = new Date();
          const offset = now.getTimezoneOffset() * 60000; // offset in milliseconds
          const localTime = new Date(now.getTime() - offset);
          return localTime.toISOString().slice(0, -1); // bỏ 'Z' cuối để không hiểu nhầm là UTC
        };

        // Post attendance với sessionId đã chọn
        const attendanceData = {
          studentId: student.id,
          sessionId: selectedSessionFilter,
          date: getLocalISOString(),
        };
        
        console.log('Attendance Data:', attendanceData);
        console.log('Student:', student);
        
        await attendanceApi.createAttendance(attendanceData);
        
        const text = `
          MSSV: ${res.data.mssv}
          Họ tên: ${res.data.ten}
          Lớp: ${res.data.lop}
          Môn học: ${courseInfo?.name || 'N/A'} (${courseInfo?.parsedCode || ''})
          Tuần học: ${sessionInfo?.name || 'N/A'}
          Lịch học: ${courseInfo?.dayName || ''}, Tiết ${courseInfo?.classPeriod || ''}, Phòng ${courseInfo?.room || ''}
        `;
        openNotification('success', 'Điểm danh thành công', text);
      } else {
        openNotification('error', 'Điểm danh thất bại', res.message);
      }
    } catch (error) {
      console.error('Error during attendance:', error);
      openNotification('error', 'Lỗi điểm danh', error.message || 'Có lỗi xảy ra khi điểm danh');
    }
    setLoading(false);
  };

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const isMobile = () => {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  };
  
  const startCam = async () => {
    try {
      let facingMode = 'user'; // mặc định máy tính dùng camera trước

      if (isMobile()) {
        facingMode = 'environment'; // điện thoại dùng camera sau
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode, // chọn camera
          height: { ideal: 720 },
        },
      });

      videoRef.current.srcObject = stream;
      videoRef.current.play();
      setIsCameraOn(true);
    } catch (error) {
      console.error('Error starting camera:', error);
      openNotification('error', 'Lỗi bật camera', 'Không thể truy cập camera');
    }
  };

  const stopCam = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  };

  const toggleCamera = () => {
    if (isCameraOn) {
      stopCam();
    } else {
      startCam();
    }
  };

  const takePhoto = () => {
    // Kiểm tra đã chọn môn học và tuần học chưa
    if (!selectedCourseSchedule || !selectedSessionFilter) {
      openNotification('warning', 'Chưa chọn đủ thông tin', 'Vui lòng chọn môn học và tuần học trước');
      return;
    }

    // Lấy thông tin môn học đã chọn
    const courseInfo = coursesWithSchedule.find(c => c.id === selectedCourseSchedule);
    
    if (!courseInfo) {
      openNotification('error', 'Lỗi', 'Không tìm thấy thông tin môn học');
      return;
    }

    const now = new Date();
    const currentDay = now.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ...

    // Kiểm tra ngày học có khớp không
    if (courseInfo.dayId !== null && courseInfo.dayId !== currentDay) {
      const dayNames = {
        0: 'Chủ nhật',
        1: 'Thứ 2',
        2: 'Thứ 3',
        3: 'Thứ 4',
        4: 'Thứ 5',
        5: 'Thứ 6',
        6: 'Thứ 7',
      };
      openNotification(
        'error',
        'Không đúng ngày học',
        `Ngày điểm danh môn học này không khớp với ngày hiện tại`
      );
      return;
    }

    // Kiểm tra khung giờ điểm danh
    if (courseInfo.startPeriod) {
      const startTime = getClassPeriodStartTime(courseInfo.startPeriod);
      if (startTime) {
        const [hours, minutes] = startTime.split(':').map(Number);
        
        // Thời gian bắt đầu tiết
        const classStart = new Date();
        classStart.setHours(hours, minutes, 0, 0);
        
        // Thời gian kết thúc điểm danh (bắt đầu + 15 phút)
        const attendanceEnd = new Date(classStart.getTime() + 15 * 60 * 1000);
        
        // Kiểm tra nếu chưa đến giờ học
        if (now < classStart) {
          const diffMinutes = Math.ceil((classStart - now) / (1000 * 60));
          openNotification(
            'warning',
            'Chưa đến giờ điểm danh',
            `Tiết học bắt đầu lúc ${startTime}. Còn ${diffMinutes} phút nữa mới được điểm danh.`
          );
          return;
        }
        
        // Kiểm tra nếu quá giờ điểm danh
        if (now > attendanceEnd) {
          openNotification(
            'error',
            'Hết thời gian điểm danh',
            `Thời gian điểm danh đã kết thúc lúc ${attendanceEnd.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} (15 phút sau khi bắt đầu tiết).`
          );
          return;
        }
      }
    }

    // Nếu tất cả validation OK, tiến hành chụp ảnh
    const v = videoRef.current;
    const c = canvasRef.current;

    c.width = v.videoWidth;
    c.height = v.videoHeight;

    const ctx = c.getContext('2d');

    // camera trước thường bị lật → chỉnh lại
    ctx.translate(c.width, 0);
    ctx.scale(-1, 1);

    ctx.drawImage(v, 0, 0);

    const imgBase64 = c.toDataURL('image/png');
    handleCapture(imgBase64);
  };

  // Fetch courses và parse schedule - giống SessionManagement
  const fetchCourses = async () => {
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
      openNotification('error', 'Lỗi tải dữ liệu', 'Không thể tải danh sách môn học');
    }
  };

  // Fetch sessions
  const fetchSessions = async () => {
    if (courses.length === 0) return;
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
      console.error('Error fetching sessions:', error);
      openNotification('error', 'Lỗi tải dữ liệu', 'Không thể tải danh sách tuần học');
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

  // Render đầu tiên
  useEffect(() => {
    fetchCourses();
    return () => stopCam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch sessions khi có courses
  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return (
    <div className="face-container">
      {contextHolder}

      {/* Filter Section - giống SessionManagement */}
      <div
        style={{
          background: 'white',
          padding: '20px 24px',
          borderRadius: '8px',
          marginBottom: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12}>
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

          <Col xs={24} md={6}>
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

          <Col xs={24} md={6}>
            {/* Cột trống để căn chỉnh layout */}
          </Col>
        </Row>

        {/* Nút reset */}
        <Row style={{ marginTop: '16px' }}>
          <Col>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleResetFilters}
              disabled={!selectedCourseSchedule && !selectedSessionFilter}
            >
              Xóa bộ lọc
            </Button>
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

      {/* Camera Section */}
      <div
        style={{
          background: 'white',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <video
          ref={videoRef}
          className="face-video"
          playsInline // không fullscreen trên ios
          muted
        />

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <div
          style={{
            textAlign: 'center',
            display: 'flex',
            gap: '10px',
            justifyContent: 'center',
            marginTop: '16px',
          }}
        >
          <Button
            className="face-button"
            type={isCameraOn ? 'default' : 'primary'}
            onClick={toggleCamera}
            danger={isCameraOn}
            size="large"
          >
            {isCameraOn ? '📹 Tắt Camera' : '📷 Bật Camera'}
          </Button>
          <Button
            className="face-button"
            type="primary"
            onClick={takePhoto}
            loading={loading}
            size="large"
            disabled={
              !selectedCourseSchedule ||
              !selectedSessionFilter ||
              !isCameraOn
            }
          >
            📸 Chụp ảnh điểm danh
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FaceRollCall;
