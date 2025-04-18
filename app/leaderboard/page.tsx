"use client";

import "@ant-design/v5-patch-for-react-19";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Dropdown, Space, Table } from "antd";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import Link from "next/link";
import "@/styles/globals.css";

type LeaderboardRow = {
  key: string;
  username: string;
  score_total: number | string | boolean | null;
  rank: number;
};

const filterOptions = [
  { key: "scoreTotal", label: "Score Total" },
  { key: "gamesPlayed", label: "Games Played" },
  { key: "avgPlacement", label: "Avg. Placement" },
  { key: "moonShots", label: "Moon Shots" },
  { key: "perfectGames", label: "Perfect Games" },
  { key: "perfectMatches", label: "Perfect Matches" },
  { key: "currentStreak", label: "Current Streak" },
  { key: "longestStreak", label: "Longest Streak" },
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
  const [selectedFilter, setSelectedFilter] = useState<string>("scoreTotal");

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
      render: (_: unknown, record: LeaderboardRow) => (
        <Link href={`/users/${record.key}`} style={{ color: "#1890ff" }}>
          {record.username}
        </Link>
      ),
    },
    {
      title: filterOptions.find((f) => f.key === selectedFilter)?.label ||
        selectedFilter,
      dataIndex: "score_total",
      key: "score_total",
      render: (value: number) => value?.toFixed?.(3) ?? value, // Format number if possible
    },
  ];

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const params = {
          page: searchValue ? 0 : page, // fetch all when searching
          pageSize: searchValue ? 9999 : pageSize, // arbitrarily large page to get everything
          sortBy: selectedFilter,
          order: "desc",
        };

        const response = await apiService.get<{
          content: User[];
          totalElements: number;
        }>("/leaderboard", params);

        const ranked = response.content.map((user, index) => ({
          key: user.id,
          username: user.username,
          score_total: user[selectedFilter as keyof User],
          rank: searchValue ? index + 1 : page * pageSize + index + 1,
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
  }, [page, apiService, pageSize, searchValue, selectedFilter]);

  const filteredData = data.filter((user) =>
    user.username.toLowerCase().includes(searchValue.toLowerCase())
  );

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
            <Dropdown
              menu={{
                items: filterOptions,
                onClick: ({ key }) => setSelectedFilter(key),
              }}
              trigger={["click"]}
            >
              <Button className="login-button">
                Filter:{" "}
                {filterOptions.find((item) => item.key === selectedFilter)
                  ?.label}
              </Button>
            </Dropdown>
          </Space>

          {/* Leaderboard Table */}
          <Table
            columns={columns}
            dataSource={filteredData}
            pagination={searchValue ? false : {
              current: page + 1,
              pageSize,
              total,
              onChange: (newPage) => setPage(newPage - 1),
              showSizeChanger: false,
            }}
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
              style={{ maxWidth: "fit-content" }}
              onClick={() => router.push("/landingpageuser")}
            >
              Back To Home Page
            </Button>
          </div>
        </Space>
      </div>
    </div>
  );
};

export default LeaderboardPage;
