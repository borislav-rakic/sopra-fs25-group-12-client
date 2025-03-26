"use client";

import { useRouter } from "next/navigation";
import { Table, Button, Space } from "antd";
import "@/styles/globals.css";
import styles from "@/styles/page.module.css";

const columns = [
  {
    title: "Rank",
    dataIndex: "rank",
    key: "rank",
  },
  {
    title: "Username",
    dataIndex: "username",
    key: "username",
  },
  {
    title: "Points",
    dataIndex: "points",
    key: "points",
  },
];

const data = [
];

const LeaderboardPage: React.FC = () => {
  const router = useRouter();

  return (
    <div className="login-container">
      <div style={{ width: "100%", maxWidth: "800px" }}>
        <Space
          direction="vertical"
          size="middle"
          style={{ width: "100%", marginBottom: "16px" }}
        >
          <Space style={{ justifyContent: "flex-end", width: "100%" }}>
            <Button className="login-button">Search</Button>
            <Button className="login-button">Filter</Button>
          </Space>

          <Table
            columns={columns}
            pagination={false}
            bordered
          />

          <Space
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Button className="back-button" onClick={() => router.back()}>
              Back
            </Button>
            <Button className="login-button">Next</Button>
          </Space>
        </Space>
      </div>
    </div>
  );
};

export default LeaderboardPage;
