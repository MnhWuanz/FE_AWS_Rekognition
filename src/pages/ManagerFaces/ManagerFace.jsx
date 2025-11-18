import React, { useState } from 'react';
import { Button, Space, Table } from 'antd';
import { DeleteOutlined, InfoOutlined } from '@ant-design/icons';
const ManagerFace = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const onSelectChange = (newSelectedRowKeys) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
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
      dataIndex: 'name',
      width: '30%',
    },
    {
      title: 'Thời gian đăng ký',
      dataIndex: 'time',
      with: '20%',
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
  const data = Array.from({ length: 20 }).map((_, index) => ({
    key: index + 1,
    mssv: `MSSV${index + 1}`,
    lop: `D22_TH0${index % 10}`,
    name: `Nguyen Van  ${index + 1}`,
  }));

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
  const onChange = (pagination, filters, sorter, extra) => {
    console.log('params', pagination, filters, sorter, extra);
  };
  return (
    <Table
      width="100%"
      rowSelection={rowSelection}
      columns={columns}
      dataSource={data}
      onChange={onChange}
    />
  );
};

export default ManagerFace;
