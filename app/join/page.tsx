"use client";

import { useRouter } from "next/navigation";
import { Button, Form, Input, Table, Modal, message, App } from "antd";
import { useEffect, useState, useRef } from "react";
import { Match } from "@/types/match";
import { useApi } from "@/hooks/useApi";
import type { TableProps } from "antd";

const { useModal } = Modal;

const JoinPage: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();

  const [matches, setMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  const [modal, contextHolder] = useModal();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const fetchedMatches = await apiService.get<Match[]>("/matches");
        setMatches(fetchedMatches);
        setFilteredMatches(fetchedMatches);
      } catch (error) {
        message.error("Could not fetch matches.");
      }
    };

    fetchMatches();
  }, [apiService]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setFilteredMatches(
      matches.filter(
        (match) =>
          match.matchId !== null &&
          match.matchId.toString().includes(value)
      )
    );
  };

  const checkMatchStatusAndRedirect = async (matchId: number, modalInstance: any) => {
    try {
      const match: Match = await apiService.get<Match>(`/matches/${matchId}`);
      if (match.started) {
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current);
        }
        modalInstance.destroy();
        router.push(`/start/${matchId}`);
      }
    } catch {
      message.error("Failed to check match status.");
    }
  };

  const handleJoin = async (matchId: number) => {
    const modalInstance = modal.info({
      title: "Join Request Sent",
      content: "Waiting for host to accept your join request...",
      okButtonProps: { disabled: true },
    });

    try {
      await apiService.post(`/matches/${matchId}/join`, {});
      pollingInterval.current = setInterval(() => {
        checkMatchStatusAndRedirect(matchId, modalInstance);
      }, 3000);
    } catch {
      modalInstance.destroy();
      message.error("Could not send join request.");
    }
  };

  const columns: TableProps<Match>["columns"] = [
    { title: "MatchID", dataIndex: "matchId", key: "matchId" },
    { title: "Host", dataIndex: "host", key: "host" },
    { title: "Length", dataIndex: "length", key: "length" },
    {
      title: "",
      key: "action",
      render: (_, record) => (
        <Button
          onClick={() =>
            record.matchId !== null && handleJoin(Number(record.matchId))
          }
        >
          Join
        </Button>
      ),
    },
  ];

  return (
    <div
      className="login-container"
      style={{ paddingTop: "40px", maxWidth: 600, margin: "0 auto" }}
    >
      {contextHolder}
      <Form layout="vertical" size="large">
        <Form.Item label="MatchID">
          <Input
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </Form.Item>

        <Table
          dataSource={filteredMatches}
          columns={columns}
          rowKey={(record) => record.matchId?.toString() ?? ""}
          pagination={false}
          bordered
        />

        <Form.Item style={{ marginTop: "1.5rem" }}>
          <Button onClick={() => router.back()}>Back</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default JoinPage;
