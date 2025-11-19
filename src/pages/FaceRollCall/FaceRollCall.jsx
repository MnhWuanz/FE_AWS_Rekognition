import React, { useEffect, useRef } from 'react';
import './FaceRollCall.css';
import { postFaceCheck } from '../../api/check';
import { Button, notification } from 'antd';

const FaceRollCall = () => {
  const [api, contextHolder] = notification.useNotification();

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
    const zip = await resizeBase64(base64);
    const res = await postFaceCheck(zip);

    if (res.valid) {
      const text = `
MSSV: ${res.data.mssv}
Họ tên: ${res.data.ten}
Lớp: ${res.data.lop}
      `;
      openNotification('success', 'Điểm danh thành công', text);
    } else {
      openNotification('error', 'Điểm danh thất bại', res.message);
    }
  };

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const isMobile = () => {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  };
  const startCam = async () => {
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
  };

  const stopCam = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) stream.getTracks().forEach((t) => t.stop());
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
    startCam();
    return () => stopCam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="face-container">
      {contextHolder}

      <video
        ref={videoRef}
        className="face-video"
        playsInline // không fullscreen trên ios
        muted
      />

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div style={{ textAlign: 'center' }}>
        <Button className="face-button" type="primary" onClick={takePhoto}>
          📸 Chụp ảnh
        </Button>
      </div>
    </div>
  );
};

export default FaceRollCall;
