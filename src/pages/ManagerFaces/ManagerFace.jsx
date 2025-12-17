import React, { useEffect, useState } from 'react';
import { Button, Image, message, Modal, Popconfirm, Space, Table } from 'antd';
import {
  DeleteOutlined,
  ExclamationCircleFilled,
  InfoOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import studentApi from '../../api/apiUser/StudentAPI';
import Loading from '../../components/UI/Loading';
import { deleteFaceS3 } from '../../api/deleteFaceS3';
const ManagerFace = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [dataFace, setDataFace] = useState('');
  const [openmodal, setOpenmodal] = useState(false);
  const [openmodaldelete, setOpenmodalDelete] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const columns = [
    {
      title: 'Mã Số Sinh Viên',
      dataIndex: 'code',
      sorter: (a, b) => a.code.localeCompare(b.code),
      width: '20%',
    },
    {
      title: 'Lớp',
      dataIndex: 'class',
      filters: [
        {
          text: 'D22_TH01',
          value: 'D22_TH01',
        },
        {
          text: 'D22_TH02',
          value: 'D22_TH02',
        },
        {
          text: 'D22_TH03',
          value: 'D22_TH03',
        },
        {
          text: 'D22_TH04',
          value: 'D22_TH04',
        },
        {
          text: 'D22_TH05',
          value: 'D22_TH05',
        },
        {
          text: 'D22_TH06',
          value: 'D22_TH06',
        },
        {
          text: 'D22_TH07',
          value: 'D22_TH07',
        },
        {
          text: 'D22_TH08',
          value: 'D22_TH08',
        },
        {
          text: 'D22_TH09',
          value: 'D22_TH09',
        },
      ],
      sorter: (a, b) => a.age - b.age,
      onFilter: (value, record) => record.class.includes(value),
      with: '20%',
    },
    {
      title: 'Họ Tên Sinh Viên',
      dataIndex: 'name',
      width: '30%',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      with: '20%',
    },
    {
      title: 'Xác minh',
      dataIndex: 'faceId',
      key: 'faceId',
      align: 'center',
      render: (faceId) => (
        <span
          style={{
            color: faceId && faceId !== '' ? '#52c41a' : '#ff4d4f',
            fontWeight: 'bold',
          }}
        >
          {faceId && faceId !== '' ? '✓ Đã có ảnh' : '✗ Chưa có ảnh'}
        </span>
      ),
      filters: [
        {
          text: 'Đã có ảnh',
          value: true,
        },
        {
          text: 'Chưa có ảnh',
          value: false,
        },
      ],
      onFilter: (value, record) => {
        const hasFaceId = record.faceId && record.faceId !== '';
        return value ? hasFaceId : !hasFaceId;
      },
      width: '15%',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space direction="vertical" className="action-buttons">
          <Button type="default" block onClick={() => handleView(record)}>
            <InfoOutlined />
            Thông Tin
          </Button>
          <Popconfirm
            title="Delete the User"
            description="Bạn có muốn xóa sinh viên này ?"
            onConfirm={() => handleDelet(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="primary" danger block>
              <DeleteOutlined />
              Xoá
            </Button>
          </Popconfirm>
        </Space>
      ),
      with: '30%',
    },
  ];
  const success = (desp) => {
    messageApi.open({
      type: 'success',
      content: desp,
    });
  };

  const errorr = (desp) => {
    messageApi.open({
      type: 'error',
      content: desp,
    });
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
      {
        key: 'odd',
        text: 'Select Odd Row',
        onSelect: (changeableRowKeys) => {
          let newSelectedRowKeys = [];
          newSelectedRowKeys = changeableRowKeys.filter((_, index) => {
            if (index % 2 !== 0) {
              return false;
            }
            return true;
          });
          setSelectedRowKeys(newSelectedRowKeys);
        },
      },
      {
        key: 'even',
        text: 'Select Even Row',
        onSelect: (changeableRowKeys) => {
          let newSelectedRowKeys = [];
          newSelectedRowKeys = changeableRowKeys.filter((_, index) => {
            if (index % 2 !== 0) {
              return true;
            }
            return false;
          });
          setSelectedRowKeys(newSelectedRowKeys);
        },
      },
    ],
  };
  const handleView = (record) => {
    setSelectedStudent(record);
    setOpenmodal(true);
  };
  const handleDelet = async (id) => {
    setLoading(true);
    try {
      const user = await studentApi.getById(id);
      const data = user.data.data;
      await studentApi.deleteStudent(id);
      await deleteFaceS3(data.class, data.code);
      success(`Xóa ${id} thành công`);
      fetchData();
    } catch (error) {
      console.log(error);
      errorr(`Xóa ${id} thất bại`);
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteSelected = async () => {
    setOpenmodalDelete(false);
    selectedRowKeys.forEach((element) => {
      handleDelet(element);
      setSelectedRowKeys([]);
    });
  };
  const fetchData = async () => {
    setLoading(true);
    const res = await studentApi.getAll();

    const data = await res.data.data;
    const formatData = data.map((item) => ({
      ...item,
      key: item.id,
    }));
    setDataFace(formatData);
    setLoading(false);
  };
  useEffect(() => {
    try {
      fetchData();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);
  return (
    <>
      {contextHolder}
      <div
        style={{
          marginBottom: 10,
          textAlign: 'right',
          gap: '20px',
          display: 'flex',
        }}
      >
        <Button
          icon={<DeleteOutlined />}
          size="large"
          danger
          type="primary"
          onClick={() => setOpenmodalDelete(true)}
          disabled={selectedRowKeys.length === 0}
        >
          Xóa ({selectedRowKeys.length})
        </Button>
        <Button icon={<ReloadOutlined />} type="primary" onClick={fetchData}>
          Refresh
        </Button>
      </div>
      <Table
        scroll={{ x: 600 }}
        size="small"
        width="100%"
        rowSelection={rowSelection}
        columns={columns}
        dataSource={dataFace}
        loading={loading ? <Loading tip="Đang tải" /> : false}
      />
      <Modal
        open={openmodal}
        title={`Thông tin sinh viên`}
        footer={null}
        onCancel={() => setOpenmodal(false)}
      >
        {selectedStudent && (
          <>
            <p>
              <b>MSSV:</b> {selectedStudent.code}
            </p>
            <p>
              <b>Họ Tên:</b> {selectedStudent.name}
            </p>
            <p>
              <b>Lớp:</b> {selectedStudent.class}
            </p>
            <p>
              <b>Email:</b> {selectedStudent.email}
            </p>

            <p>
              <b>Ảnh đăng ký:</b>
            </p>
            <Image
              width={300}
              src={selectedStudent.faceId}
              alt="Student Face"
              style={{ borderRadius: 8 }}
            />
          </>
        )}
      </Modal>
      <Modal
        open={openmodaldelete}
        title={`Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} mục đã chọn không?`}
        content={'Hành động này không thể hoàn tác.'}
        icon={<ExclamationCircleFilled />}
        onOk={handleDeleteSelected}
        okType={'danger'}
        onCancel={() => setOpenmodalDelete(false)}
      ></Modal>
    </>
  );
};

export default ManagerFace;
