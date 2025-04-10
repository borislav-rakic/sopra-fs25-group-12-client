"use client";

import "@ant-design/v5-patch-for-react-19";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Space, Table } from "antd";
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
  const router = useRouter();

  const [data, setData] = useState<LeaderboardRow[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(5);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");


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

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };


  return (
    <div className="login-container">
      <div style={{ width: "100%", maxWidth: "800px" }}>
        <Space
          direction="vertical"
          size="middle"
          style={{ width: "100%", marginBottom: "16px" }}
        >
          {/* Top-right controls */}
          <Space style={{ justifyContent: "flex-end", width: "100%" }}>
                    <input
            type="text"
            placeholder="Search username..."
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              height: "36px", // Match AntD small button height
              padding: "0 8px", // Tight horizontal space
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "14px",
              width: "200px",
              lineHeight: "24px", // vertically centers text
            }}
          />
            <Button className="login-button">Filter</Button>
          </Space>
  
          {/* Leaderboard Table */}
          <Table
            columns={columns}
            dataSource={data.filter((user) =>
                        user.username.toLowerCase().includes(searchValue.toLowerCase())
                        )}
            pagination={false}
            bordered
            loading={loading}
          />
  
          {/* Below-table buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            {/* Back to Home */}
            <Button
              className="back-button"
              style={{maxWidth: "fit-content" }}
              onClick={() => router.push("/landingpageuser")}
            >
              Back To Home Page
            </Button>
  
            {/* Pagination Buttons */}
            <Space>
              <Button
                className="back-button"
                onClick={() => {
                  if (page > 0) setPage(page - 1);
                }}
                disabled={page === 0}
              >
                Back Page
              </Button>
              <Button
                className="login-button"
                onClick={() => {
                  if ((page + 1) * pageSize < total) setPage(page + 1);
                }}
                disabled={(page + 1) * pageSize >= total}
              >
                Next Page
              </Button>
            </Space>
          </div>
        </Space>
      </div>
    </div>
  );
  
};

export default LeaderboardPage;
