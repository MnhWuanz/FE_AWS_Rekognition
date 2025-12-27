import React, { useEffect, useState } from 'react';
import { Button, Col, message, Row, Select, Space, Table, Tag, Input } from 'antd';
import { ReloadOutlined, SearchOutlined, FileExcelOutlined } from '@ant-design/icons';
import ExcelJS from 'exceljs';
import courseAPI from '../../api/apiUser/CourseAPI';
import sessionApi from '../../api/apiUser/SessionAPI';
import studentApi from '../../api/apiUser/StudentAPI';
import attendanceApi from '../../api/apiUser/AttendanceAPI';
import enrolmentApi from '../../api/apiUser/EnrolmentAPI';
import { getUser } from '../../utils/auth';

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

  // State cho tìm kiếm
  const [searchText, setSearchText] = useState('');

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
      let data = res.data.data || res.data;
      
      const currentUser = getUser();
      if(currentUser && currentUser.role === 'lecturer'){
        data = data.filter(c => c.userId === currentUser.id);
      }
      
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
    } else if (diffMinutes >= 30) {
      return { status: 'absent', label: '✗ Vắng', color: 'error' };
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
      const startPeriod = courseInfo?.startPeriod || null;

      // Lấy tất cả enrolments của môn học
      const enrolRes = await enrolmentApi.getAll();
      const allEnrolments = enrolRes.data.data;
      const courseEnrolments = allEnrolments.filter(
        (enrol) => enrol.courseId === courseId 
      );

      // Lấy tất cả attendance của session
      const attRes = await attendanceApi.getAll();
      const allAttendance = attRes.data.data;
      const sessionAttendance = allAttendance.filter(
        (att) => att.sessionId === sessionId
      );

      // Lấy tất cả students
      const studentsRes = await studentApi.getAll();
      const allStudentsData = studentsRes.data.data ;

      // Map tất cả sinh viên enrolled với attendance của họ
      const attendanceWithInfo = courseEnrolments.map((enrol) => {
        const studentId = enrol.studentId;
        const student = allStudentsData.find((s) => s.id === studentId);
        // Tìm attendance record của sinh viên này trong session
        const attendanceRecord = sessionAttendance.find(
          (att) => (att.studentId === studentId)
        );
        const checkInTime = attendanceRecord?.date; 
        const statusInfo = getAttendanceStatus(checkInTime, startPeriod);
        return {
          id: attendanceRecord?.id || `enrol-${enrol.id}`,
          studentId: studentId,
          code: student?.code || 'N/A',
          name: student?.name || 'N/A',
          email: student?.email || 'N/A',
          class: student?.class || '',
          faceId: student?.faceId || null,
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

  // Hàm chuyển đổi URL ảnh thành base64
  const getBase64FromUrl = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error fetching image:', error);
      return null;
    }
  };

  // Hàm xuất Excel
  const handleExportExcel = async () => {
    if (!selectedCourseSchedule) {
      messageApi.warning('Vui lòng chọn môn học để xuất');
      return;
    }

    setLoading(true);
    messageApi.loading('Đang tạo file Excel cho tất cả tuần...');

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Bảng Điểm Danh');

      // Lấy thông tin môn học
      const courseName = selectedCourseInfo?.name || '';
      const courseCode = selectedCourseInfo?.parsedCode || '';
      const startPeriod = selectedCourseInfo?.startPeriod || null;

      // Lấy tất cả sessions của môn học
      const allSessions = filteredSessions.sort((a, b) => {
        // Sắp xếp theo tuần
        const weekA = parseInt(a.name.match(/\d+/)?.[0] || 0);
        const weekB = parseInt(b.name.match(/\d+/)?.[0] || 0);
        return weekA - weekB;
      });

      // Lấy danh sách sinh viên enrolled
      const enrolRes = await enrolmentApi.getAll();
      const allEnrolments = enrolRes.data.data;
      const courseEnrolments = allEnrolments.filter(
        (enrol) => enrol.courseId === selectedCourseSchedule
      );

      // Lấy tất cả students
      const studentsRes = await studentApi.getAll();
      const allStudentsData = studentsRes.data.data;

      // Lấy tất cả attendance
      const attRes = await attendanceApi.getAll();
      const allAttendance = attRes.data.data;

      // Tạo danh sách sinh viên với thông tin
      const students = courseEnrolments.map((enrol) => {
        const student = allStudentsData.find((s) => s.id === enrol.studentId);
        return {
          studentId: enrol.studentId,
          code: student?.code || 'N/A',
          name: student?.name || 'N/A',
          class: student?.class || '',
          faceId: student?.faceId || null,
        };
      });

      // Số cột cố định + số tuần + ghi chú
      const fixedCols = 5; // STT, Ảnh, MSSV, Họ tên, Lớp
      const totalCols = fixedCols + allSessions.length + 1; // + Ghi chú
      // Tiêu đề
      worksheet.mergeCells(1, 1, 1, totalCols);
      const titleCell = worksheet.getCell('A1');
      titleCell.value = `BẢNG ĐIỂM DANH - ${courseName} (${courseCode})`;
      titleCell.font = { bold: true, size: 16 };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

      worksheet.mergeCells(2, 1, 2, totalCols);
      const subtitleCell = worksheet.getCell('A2');
      subtitleCell.value = `${selectedCourseInfo?.dayName || ''}, Tiết ${selectedCourseInfo?.classPeriod || ''}, Phòng ${selectedCourseInfo?.room || ''}`;
      subtitleCell.font = { size: 12, italic: true };
      subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };

      // Header row
      const headers = ['STT', 'Ảnh', 'MSSV', 'Họ và tên', 'Lớp'];
      allSessions.forEach((session, idx) => {
        headers.push(String(idx + 1).padStart(2, '0')); // 01, 02, 03...
      });
      headers.push('Ghi chú');

      const headerRow = worksheet.addRow(headers);
      headerRow.height = 30;
      headerRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      // Set column widths
      worksheet.getColumn(1).width = 5;   // STT
      worksheet.getColumn(2).width = 10;  // Ảnh
      worksheet.getColumn(3).width = 14;  // MSSV
      worksheet.getColumn(4).width = 22;  // Họ tên
      worksheet.getColumn(5).width = 10;  // Lớp
      for (let i = 0; i < allSessions.length; i++) {
        worksheet.getColumn(fixedCols + i + 1).width = 5; // Các cột tuần
      }
      worksheet.getColumn(totalCols).width = 12; // Ghi chú

      // Add data rows
      for (let i = 0; i < students.length; i++) {
        const student = students[i];
        const rowNumber = i + 4; // Start from row 4

        // Dữ liệu cơ bản
        const rowData = [
          i + 1,
          '', // Ảnh
          student.code,
          student.name,
          student.class,
        ];

        // Thêm dữ liệu điểm danh cho từng tuần
        let totalAbsent = 0;
        for (const session of allSessions) {
          const attendance = allAttendance.find(
            (att) => att.sessionId === session.id && att.studentId === student.studentId
          );
          
          if (attendance) {
            const statusInfo = getAttendanceStatus(attendance.date, startPeriod);
            if (statusInfo.status === 'on-time') {
              rowData.push('✓');
            } else if (statusInfo.status === 'late') {
              rowData.push('T'); // Trễ
            } else {
              rowData.push('');
              totalAbsent++;
            }
          } else {
            rowData.push('');
            totalAbsent++;
          }
        }

        // Ghi chú (số buổi vắng)
        rowData.push(totalAbsent > 0 ? `Vắng: ${totalAbsent}` : '');

        const row = worksheet.addRow(rowData);
        row.height = 55;

        // Style
        row.eachCell((cell, colNumber) => {
          cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };

          // Màu cho các ô điểm danh
          if (colNumber > fixedCols && colNumber < totalCols) {
            const value = cell.value;
            if (value === '✓') {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD4EDDA' } };
            } else if (value === 'T') {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } };
            }
          }
        });

        // Thêm ảnh nếu có faceId
        if (student.faceId) {
          try {
            const base64Image = await getBase64FromUrl(student.faceId);
            if (base64Image) {
              const imageId = workbook.addImage({
                base64: base64Image,
                extension: 'jpeg',
              });
              worksheet.addImage(imageId, {
                tl: { col: 1, row: rowNumber - 1 },
                ext: { width: 45, height: 50 },
              });
            }
          } catch (error) {
            console.error('Error adding image for', student.code, error);
          }
        }
      }

      // Thêm chú thích
      const legendRow = worksheet.addRow([]);
      worksheet.addRow(['Chú thích:', '✓ = Đúng giờ', 'T = Đi trễ', '(trống) = Vắng']);

      // Tạo file và download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `DiemDanh_${courseCode}_TatCaTuan.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);

      messageApi.success('Xuất Excel thành công!');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      messageApi.error('Lỗi khi xuất Excel: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

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
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
              📋 Bảng điểm danh -{' '}
              {
                filteredSessions.find((s) => s.id === selectedSessionFilter)
                  ?.name
              }
            </h3>
            
            {/* /* Ô tìm kiếm */ }
            <Input
              placeholder=" Tìm theo tên sinh viên hoặc lớp..."
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              allowClear
              style={{ 
                width: '300px', 
                borderRadius: '6px',
              }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            
            {/* Nút xuất Excel */}
            <Button
              type="primary"
              icon={<FileExcelOutlined />}
              onClick={handleExportExcel}
              loading={loading}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              Xuất Excel
            </Button>
            
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
                 filters: [
         {
        text: 'Đúng giờ',
        value: 'on-time',
      },
      {
        text: 'Đi trễ',
        value: 'late',
      },
      {
        text: 'Vắng',
        value: 'absent',
      },
    ],
    onFilter: (value, record) => record.status.indexOf(value) === 0,
                render: (_, record) => (
                  <Tag color={record.statusColor}>{record.statusLabel}</Tag>
                ),
              },
              {
                title: 'Thời gian vào',
                dataIndex: 'checkInTime',
                key: 'checkInTime',
                width: '16%',
                align: 'center',
                render: (value) =>
                  value ? new Date(value).toLocaleString('vi-VN') : '-',
              },
            ]}
            dataSource={attendanceRecords.filter(record => {
              if (!searchText) return true;
              const search = searchText.toLowerCase();
              return (
                record.name?.toLowerCase().includes(search) ||
                record.class?.toLowerCase().includes(search) ||
                record.code?.toLowerCase().includes(search)
              );
            })}
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
