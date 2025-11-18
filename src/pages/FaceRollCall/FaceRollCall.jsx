import React, { useEffect, useRef, useState } from 'react';
import './FaceRollCall.css';
import CameraModal from '../../components/function/CameraModal';
import { CameraOutlined } from '@ant-design/icons';
import { Button } from 'antd';
const FaceRollCall = () => {
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
  const handleCapture = (base64) => {
    console.log(base64);
  };
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const startCam = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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
    c.getContext('2d').drawImage(v, 0, 0);

    const imgBase64 = c.toDataURL('image/png');
    handleCapture(imgBase64);
  };
  useEffect(() => {
    startCam();
    return () => stopCam();
  }, []);
  return (
    <div className="w-full h-full flex justify-center flex-col">
      <div className="flex justify-center">
        <div className="w-[800px] h-[1000px]  ">
          <div className="text-center">
            <video ref={videoRef} style={{ width: '100%', borderRadius: 10 }} />
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <div style={{ textAlign: 'center', marginTop: 15 }}>
              <Button type="primary" onClick={takePhoto} size={'large'}>
                📸 Chụp ảnh
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceRollCall;
