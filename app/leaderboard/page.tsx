"use client";

import "@ant-design/v5-patch-for-react-19";

import { useEffect, useState } from "react";
import { Table, Button, Space } from "antd";
import { useApi } from "@/hooks/useApi";
import "@/styles/globals.css";

type User = {
  id: number;
  username: string;
  rating: number;
};

type LeaderboardRow = {
  key: number;
  username: string;
  points: number;
  rank: number;
};
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

const LeaderboardPage: React.FC = () => {
  const apiService = useApi();

  const [data, setData] = useState<LeaderboardRow[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          pageSize,
          sortBy: "rating",
          order: "desc",
        };

        const response = await apiService.get<{
          content: User[];
          totalElements: number;
        }>("/leaderboard", params);

        const ranked = response.content.map((user, index) => ({
          key: user.id,
          username: user.username,
          points: user.rating,
          rank: page * pageSize + index + 1,
        }));

        setData(ranked);
        setTotal(response.totalElements);
      } catch (error) {
        console.error("Failed to load leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [page, apiService, pageSize]);

  return (
    <div className="login-container">
      <div style={{ width: "100%", maxWidth: "800px" }}>
        <Space direction="vertical" size="middle" style={{ width: "100%", marginBottom: "16px" }}>
          <Space style={{ justifyContent: "flex-end", width: "100%" }}>
            <Button className="login-button">Search</Button>
            <Button className="login-button">Filter</Button>
          </Space>

          <Table
            columns={columns}
            dataSource={data}
            pagination={false}
            bordered
            loading={loading}
          />

          <Space style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <Button
              className="back-button"
              onClick={() => {
                if (page > 0) setPage(page - 1);
              }}
              disabled={page === 0}
            >
              Back
            </Button>
            <Button
              className="login-button"
              onClick={() => {
                if ((page + 1) * pageSize < total) setPage(page + 1);
              }}
              disabled={(page + 1) * pageSize >= total}
            >
              Next
            </Button>
          </Space>
        </Space>
      </div>
    </div>
  );
};

export default LeaderboardPage;