import React from 'react';
import { Modal, Button } from 'antd';
import { useRef } from 'react';

const CameraModal = ({ open = true, onClose = false, onCapture }) => {
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
    onCapture(imgBase64);

    stopCam();
    onClose();
  };
  return (
    <Modal
      open={open}
      footer={null}
      centered
      onCancel={() => {
        stopCam();
        onClose();
      }}
      afterOpenChange={(o) => o && startCam()}
    >
      <video
        ref={videoRef}
        style={{
          width: '100%',
          borderRadius: 10,
          transform: 'scaleX(-1)', // Lật video preview
        }}
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div style={{ textAlign: 'center', marginTop: 15 }}>
        <Button type="primary" onClick={takePhoto}>
          📸 Chụp ảnh
        </Button>
      </div>
    </Modal>
  );
};

export default CameraModal;
