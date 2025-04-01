"use client";

import { useRouter } from "next/navigation";
import { Button, Form, Input, Table } from "antd";
import "@/styles/globals.css";
import { useEffect, useState } from "react";
import { Match } from "@/types/match";
import { useApi } from "@/hooks/useApi";
import type { TableProps } from "antd";

const JoinPage: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [matches, setMatches] = useState<Match[] | null>(null);

  const [mockData, setMockData] = useState([
    // TODO: data retrievement
    { id: 1, host: "user1", length: 100 },
    { id: 2, host: "user2", length: 150 },
  ]);

  const columns: TableProps<Match>["columns"] = [
    {
      title: "MatchID",
      dataIndex: "matchId",
      key: "matchId",
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
          onClick={() => handleJoin(record.matchId)}
        >
          Join
        </Button>
      ),
    },
  ];

  const handleSearch = (value: string) => {
    // TODO: search functionality
    console.log("Searching match ID:", value);
  };

  const handleJoin = (matchId: number) => {
    // TODO: join match functionality
    console.log("Joining match:", matchId);
  };

  // const columns = [
  //   {
  //     title: "MatchID",
  //     dataIndex: "id",
  //     key: "id",
  //   },
  //   {
  //     title: "Host",
  //     dataIndex: "host",
  //     key: "host",
  //   },
  //   {
  //     title: "Length",
  //     dataIndex: "length",
  //     key: "length",
  //   },
  //   {
  //     title: "",
  //     key: "action",
  //     render: (_: any, record: any) => (
  //       <Button
  //         className="login-button"
  //         onClick={() => handleJoin(record.id)}
  //       >
  //         Join
  //       </Button>
  //     ),
  //   },
  // ];

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        // apiService.get<Match[]> returns the parsed JSON object directly,
        // thus we can simply assign it to our matches variable.
        const matches: Match[] = await apiService.get<Match[]>("/matches");
        setMatches(matches);
        console.log("Fetched users:", matches);
      } catch (error) {
        if (error instanceof Error) {
          alert(
            `Something went wrong while fetching matches:\n${error.message}`,
          );
        } else {
          console.error("An unknown error occurred while fetching matches.");
        }
      }
    };

    fetchMatches();
  }, [apiService]);

  return (
    <div
      className="login-container"
      style={{ paddingTop: "40px", maxWidth: 600, margin: "0 auto" }}
    >
      <Form name="join" layout="vertical" size="large" variant="outlined">
        <Form.Item label="MatchID" name="matchId">
          <Input
            placeholder="Search..."
            onChange={(e) => handleSearch(e.target.value)}
          />
        </Form.Item>

        {matches && (
          <Table<Match>
            dataSource={matches}
            columns={columns}
            rowKey="matchId"
            pagination={false}
            bordered
            className="white-bordered-table"
          />
        )}

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
