"use client";

import { useParams, useRouter } from "next/navigation";
import { Button, Form, Input, message, Modal, Table } from "antd";
import { useEffect, useRef, useState } from "react";
import { Match } from "@/types/match";
import { User } from "@/types/user";
import { JoinRequest } from "@/types/joinRequest";
import { useApi } from "@/hooks/useApi";
import type { TableProps } from "antd";

const { useModal } = Modal;

const JoinPage: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const params = useParams();
  const gameId = params?.id?.toString();

  const [matches, setMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  const [modal, contextHolder] = useModal();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/"); // No token = send back to home
      return;
    }
    const fetchMatches = async () => {
      try {
        const fetchedMatches = await apiService.get<Match[]>("/matches");
        setMatches(fetchedMatches);
        setFilteredMatches(fetchedMatches);
      } catch {
        message.open({
          type: "error",
          content: "Could not fetch matches.",
        });
      }
    };

    const loadCurrentUser = async () => {
      try {
        const me = await apiService.get<User>("/users/me");
        setUserId(Number(me.id)); // Store userId in the state
        localStorage.setItem("userId", me.id.toString()); // Store in localStorage
      } catch {
        message.open({
          type: "error",
          content: "Could not load current user.",
        });
      }
    };

    loadCurrentUser();
    fetchMatches();
  }, [apiService, gameId, userId, router]);

  const checkJoinRequestStatus = async (matchId: number, userId: number) => {
    try {
      const joinRequestsObject: JoinRequest[] = await apiService.get(
        `/matches/${matchId}/joinRequests`,
      );

      const myRequest = joinRequestsObject.find((req) => req.userId === userId);

      if (!myRequest) {
        return;
      }

      const status = myRequest.status;

      if (status === "accepted") {
        message.open({
          type: "success",
          content: "Your request has been accepted. Redirecting...",
        });
        clearInterval(pollingInterval.current!);
        router.push(`/start/${matchId}`);
      } else if (status === "declined") {
        message.open({
          type: "info",
          content: "Your join request was declined.",
        });
        clearInterval(pollingInterval.current!);
      } else {
        console.log("Join request still pending...");
      }
    } catch (error) {
      console.error(
        `Failed to check join request status for matchId=${matchId}, userId=${userId}:`,
        error,
      );
    }
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setFilteredMatches(
      matches.filter(
        (match) =>
          match.matchId !== null &&
          match.matchId.toString().includes(value),
      ),
    );
  };

  const handleJoin = async (matchId: number) => {
    const modalInstance = modal.info({
      title: <span style={{ color: "black" }}>Join Request Sent</span>,
      content: (
        <div style={{ color: "black" }}>
          Waiting for host to accept your join request...
        </div>
      ),
    });

    const userId = localStorage.getItem("userId");

    if (!userId) {
      modalInstance.destroy();
      message.open({
        type: "error",
        content: "User not logged in.",
      });
      return;
    }

    const parsedUserId = Number(userId);

    if (isNaN(parsedUserId)) {
      modalInstance.destroy();
      message.open({
        type: "error",
        content: "Invalid user ID.",
      });
      return;
    }
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
    }

    try {
      await apiService.post(`/matches/${matchId}/join`, {
        userId: parsedUserId,
      });

      pollingInterval.current = setInterval(() => {
        checkJoinRequestStatus(matchId, parsedUserId);
      }, 3000);
    } catch {
      modalInstance.destroy();
      message.open({
        type: "error",
        content: "Could not send join request.",
      });
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
            record.matchId !== null && handleJoin(Number(record.matchId))}
        >
          Join
        </Button>
      ),
    },
  ];

  return (
    <div className="contentContainer">
      {contextHolder}
      <Form layout="vertical" size="large">
        <Form.Item label="Enter Match ID:">
          <Input
            placeholder=" Search Match ID..."
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </Form.Item>

        <Table
          dataSource={filteredMatches}
          columns={columns}
          rowKey={(record) => record.matchId?.toString() ?? ""}
          pagination={{
            pageSize: 5,
            showSizeChanger: false,
          }}
          bordered
        />

        <Form.Item style={{ marginTop: "1.5rem" }}>
          <Button
            onClick={() => {
              localStorage.removeItem("userId");

              router.push("/landingpageuser");
            }}
          >
            Back
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default JoinPage;
