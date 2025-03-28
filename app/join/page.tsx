"use client";

import { useRouter } from "next/navigation";
import { Form, Input, Button, Table } from "antd";
import "@/styles/globals.css";
import { useState } from "react";

const JoinPage: React.FC = () => {
  const router = useRouter();

  const [mockData, setMockData] = useState([
    // TODO: data retrievement
    { id: 1, host: "user1", length: 100 },
    { id: 2, host: "user2", length: 150 },
  ]);

  const handleSearch = (value: string) => {
    // TODO: search functionality
    console.log("Searching match ID:", value);
  };

  const handleJoin = (matchId: number) => {
    // TODO: join match functionality
    console.log("Joining match:", matchId);
  };

  const columns = [
    {
      title: "MatchID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Host",
      dataIndex: "host",
      key: "host",
    },
    {
      title: "Length",
      dataIndex: "length",
      key: "length",
    },
    {
      title: "",
      key: "action",
      render: (_: any, record: any) => (
        <Button
          className="login-button"
          onClick={() => handleJoin(record.id)}
        >
          Join
        </Button>
      ),
    },
  ];

  return (
    <div className="login-container" style={{ paddingTop: "40px", maxWidth: 600, margin: "0 auto" }}>
      <Form name="join" layout="vertical" size="large" variant="outlined">
        <Form.Item label="MatchID" name="matchId">
          <Input
            placeholder="Search..."
            onChange={(e) => handleSearch(e.target.value)}
          />
        </Form.Item>

        <Table
          dataSource={mockData}
          columns={columns}
          rowKey="id"
          pagination={false}
          bordered
          className="white-bordered-table"
        />

        <Form.Item style={{ marginTop: "1.5rem" }}>
          <Button className="back-button" onClick={() => router.back()}>
            Back
          </Button>
        </Form.Item>
      </Form>

    </div>
  );
};

export default JoinPage;
