import React, { useEffect, useState } from 'react';
import { Button, Space, Table } from 'antd';
import { DeleteOutlined, InfoOutlined } from '@ant-design/icons';
const ManagerFace = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [dataFace, setDataFace] = useState('');
  const onSelectChange = (newSelectedRowKeys) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return `${date.toLocaleTimeString()} ${date.toLocaleDateString('vi-VN')}`;
  };
  const columns = [
    {
      title: 'Mã Số Sinh Viên',
      dataIndex: 'mssv',
      sorter: (a, b) => a.mssv.localeCompare(b.mssv),
      width: '20%',
    },
    {
      title: 'Lớp',
      dataIndex: 'lop',
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
      onFilter: (value, record) => record.lop.includes(value),
      with: '20%',
    },

    {
      title: 'Họ Tên Sinh Viên',
      dataIndex: 'ten',
      width: '30%',
    },
    {
      title: 'Thời gian đăng ký',
      dataIndex: 'createdAt',
      with: '20%',
      render: (text) => formatDate(text),
    },
    {
      title: 'Action',
      key: 'action',
      render: () => (
        <Space size="middle">
          <Button type="default">
            <InfoOutlined />
            Thông Tin
          </Button>
          <Button type="primary" danger>
            <DeleteOutlined />
            Xoá
          </Button>
        </Space>
      ),
      with: '30%',
    },
  ];
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

  useEffect(() => {
    try {
      const fetchData = async () => {
        const res = await fetch(
          'https://kps9v5scs9.execute-api.ap-southeast-1.amazonaws.com/pord/getFaces',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        ).then((data) => data.json());
        const data = await res;
        const formatData = data.data.map((item) => ({
          ...item,
          key: item.mssv,
        }));
        setDataFace(formatData);
      };
      fetchData();
    } catch (error) {
      console.log(error);
    }
  }, []);
  return (
    <Table
      width="100%"
      rowSelection={rowSelection}
      columns={columns}
      dataSource={dataFace}
    />
  );
};

export default ManagerFace;
