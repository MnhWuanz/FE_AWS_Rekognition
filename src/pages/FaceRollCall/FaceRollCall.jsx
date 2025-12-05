import React, { useEffect, useRef, useState } from 'react';
import './FaceRollCall.css';
import { postFaceCheck } from '../../api/check';
import { Button, notification, Select } from 'antd';
import courseAPI from '../../api/apiUser/CourseAPI';
import lecturerAPI from '../../api/apiUser/LectureAPI';

const FaceRollCall = () => {
  const [api, contextHolder] = notification.useNotification();
  const [courses, setCourses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedShift, setSelectedShift] = useState(null);
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);

  const shifts = [
    { value: '1', label: 'Ca 1 (7:00 - 9:00)' },
    { value: '2', label: 'Ca 2 (9:00 - 11:00)' },
    { value: '3', label: 'Ca 3 (13:00 - 15:00)' },
    { value: '4', label: 'Ca 4 (15:00 - 17:00)' },
    { value: '5', label: 'Ca 5 (17:00 - 19:00)' },
  ];

  const openNotification = (level, message, description) => {
    api[level]({
      message,
      description,
      placement: 'topRight',
    });
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
    if (!selectedCourse) {
      openNotification(
        'warning',
        'Chưa chọn môn học',
        'Vui lòng chọn môn học trước khi điểm danh'
      );
      return;
    }
    if (!selectedShift) {
      openNotification(
        'warning',
        'Chưa chọn ca học',
        'Vui lòng chọn ca học trước khi điểm danh'
      );
      return;
    }
    if (!selectedLecturer) {
      openNotification(
        'warning',
        'Chưa chọn giảng viên',
        'Vui lòng chọn giảng viên trước khi điểm danh'
      );
      return;
    }

    setLoading(true);
    const zip = await resizeBase64(base64);
    const res = await postFaceCheck(zip);

    if (res.valid) {
      const text = `
        MSSV: ${res.data.mssv}
        Họ tên: ${res.data.ten}
        Lớp: ${res.data.lop}
        Môn học: ${
          courses.find((c) => c.value === selectedCourse)?.label ||
          selectedCourse
        }
        Ca học: ${
          shifts.find((s) => s.value === selectedShift)?.label || selectedShift
        }
        Giảng viên: ${
          lecturers.find((l) => l.value === selectedLecturer)?.label ||
          selectedLecturer
        }
      `;
      openNotification('success', 'Điểm danh thành công', text);
    } else {
      openNotification('error', 'Điểm danh thất bại', res.message);
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
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch courses
        const coursesResponse = (await courseAPI.getAll()).data.data;
        const courseOptions = coursesResponse.map((course) => ({
          value: course.id || course._id,
          label: course.name || course.ten || course.tenMonHoc,
        }));
        setCourses(courseOptions);

        // Fetch lecturers
        const lecturersResponse = (await lecturerAPI.getAll()).data.data;
        const lecturerOptions = lecturersResponse.map((lecturer) => ({
          value: lecturer.id || lecturer._id,
          label: lecturer.name || lecturer.ten || lecturer.hoTen,
        }));
        setLecturers(lecturerOptions);
      } catch (error) {
        console.error('Error fetching data:', error);
        openNotification('error', 'Lỗi tải dữ liệu', error.message);
      }
    };

    fetchData();
    // Không tự động bật camera, người dùng sẽ bật thủ công
    return () => stopCam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  console.log(courses);
  return (
    <div className="face-container">
      {contextHolder}

      <div
        style={{
          marginBottom: '20px',
          display: 'flex',
          gap: '10px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <Select
          style={{ width: 250 }}
          placeholder="Chọn môn học"
          value={selectedCourse}
          onChange={setSelectedCourse}
          options={courses}
          showSearch
          optionFilterProp="label"
        />
        <Select
          style={{ width: 200 }}
          placeholder="Chọn ca học"
          value={selectedShift}
          onChange={setSelectedShift}
          options={shifts}
        />
        <Select
          style={{ width: 250 }}
          placeholder="Chọn giảng viên"
          value={selectedLecturer}
          onChange={setSelectedLecturer}
          options={lecturers}
          showSearch
          optionFilterProp="label"
        />
      </div>

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
        }}
      >
        <Button
          className="face-button"
          type={isCameraOn ? 'default' : 'primary'}
          onClick={toggleCamera}
          danger={isCameraOn}
        >
          {isCameraOn ? '📹 Tắt Camera' : '📷 Bật Camera'}
        </Button>
        <Button
          className="face-button"
          type="primary"
          onClick={takePhoto}
          loading={loading}
          disabled={
            !selectedCourse ||
            !selectedShift ||
            !selectedLecturer ||
            !isCameraOn
          }
        >
          📸 Chụp ảnh
        </Button>
      </div>
    </div>
  );
};

export default FaceRollCall;
