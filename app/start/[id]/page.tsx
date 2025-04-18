"use client";

import "@ant-design/v5-patch-for-react-19";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  Col,
  Dropdown,
  Input,
  message,
  Modal,
  Row,
  Table,
} from "antd";
import styles from "@/styles/page.module.css";
import { useApi } from "@/hooks/useApi";
import { Match } from "@/types/match";
import { User } from "@/types/user";

const StartPage: React.FC = () => {
  const params = useParams();
  const gameId = params?.id?.toString();
  const router = useRouter();
  const apiService = useApi();

  const [selectedPlayers, setSelectedPlayers] = useState(["", "", "", ""]);
  const [showDifficulty, setShowDifficulty] = useState([
    false,
    false,
    false,
    false,
  ]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<number[]>([
    0,
    0,
    0,
    0,
  ]);
  const [showInvite, setShowInvite] = useState([false, false, false, false]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchValues, setSearchValues] = useState(["", "", "", ""]);
  const [selectedPoints, setSelectedPoints] = useState<number | null>(null);
  const [inviteStatus, setInviteStatus] = useState<(null | "waiting")[]>([
    null,
    null,
    null,
    null,
  ]);
  const [playerIds, setPlayerIds] = useState<number[]>([]);
  const [pendingInvites, setPendingInvites] = useState<(number | null)[]>([
    null,
    null,
    null,
    null,
  ]);
  const [hostUsername, setHostUsername] = useState<string>("");
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [joinRequests, setJoinRequests] = useState<
    { userId: string; status: string }[]
  >([]);

  interface JoinRequest {
    userId: string;
    status: string;
  }

  const usersRef = useRef<User[]>([]);

  useEffect(() => {
    if (!gameId) {
      message.open({
        type: "error",
        content: "Invalid game ID.",
      });
      router.push("/landingpageuser"); // Or handle the case appropriately
      return;
    }

    const loadUsers = async () => {
      try {
        const result = await apiService.get<User[]>("/users");
        const onlineUsers = result.filter((user) =>
          user.status === "ONLINE" &&
          !user.isAiPlayer
        );
        setUsers(onlineUsers);
        setFilteredUsers(onlineUsers);
        usersRef.current = onlineUsers;
      } catch {
        message.open({
          type: "error",
          content: "Could not load user list.",
        });
      }
    };

    const loadMatch = async () => {
      try {
        const match = await apiService.get<Match>(`/matches/${gameId}`);
        const playerIdList = [
          match.player1Id,
          match.player2Id,
          match.player3Id,
          match.player4Id,
        ].filter((id): id is number => id !== null);

        setPlayerIds(playerIdList);
        setHostUsername(match.host);

        const updatedSelectedPlayers = [...selectedPlayers];
        const updatedInviteStatus = [...inviteStatus];
        const updatedPendingInvites = [...pendingInvites];
        const updatedDifficulties = [...selectedDifficulties];

        for (let i = 0; i < 4; i++) {
          updatedSelectedPlayers[i] = "";
          updatedInviteStatus[i] = null;
          updatedPendingInvites[i] = null;
          updatedDifficulties[i] = 0;
        }

        // Fill user players
        playerIdList.forEach((playerId, index) => {
          const user = usersRef.current.find((u) => Number(u.id) === playerId);
          if (user) {
            updatedSelectedPlayers[index] = user.username;
          } else {
            updatedSelectedPlayers[index] = "Waiting...";
          }
        });

        // Fill invites
        Object.entries(match.invites || {}).forEach(([slotStr, userId]) => {
          const slot = Number(slotStr);
          const user = usersRef.current.find((u) => Number(u.id) === userId);
          updatedSelectedPlayers[slot] = user?.username ?? "Waiting...";
          updatedInviteStatus[slot] = "waiting";
          updatedPendingInvites[slot] = userId;
        });

        // Fill AI players in remaining slots
        let slotIndex = 0;
        match.aiPlayers?.forEach((difficulty) => {
          // Skip over already-filled slots
          while (
            updatedSelectedPlayers[slotIndex] &&
            slotIndex < updatedSelectedPlayers.length
          ) {
            slotIndex++;
          }
          if (slotIndex < 4) {
            updatedSelectedPlayers[slotIndex] = "computer";
            updatedDifficulties[slotIndex] = difficulty;
          }
        });

        setSelectedPlayers(updatedSelectedPlayers);
        setInviteStatus(updatedInviteStatus);
        setPendingInvites(updatedPendingInvites);
        setSelectedDifficulties(updatedDifficulties);
      } catch {
        message.open({
          type: "error",
          content: "Could not load match info.",
        });
        router.push("/landingpageuser");
      }
    };

    const loadCurrentUser = async () => {
      try {
        const me = await apiService.get<User>("/users/me");
        setCurrentUsername(me.username);
      } catch {
        message.open({
          type: "error",
          content: "Could not load current user.",
        });
      }
    };

    const fetchJoinRequests = async () => {
      try {
        const joinRequestsObject: JoinRequest[] = await apiService.get(
          `/matches/${gameId}/joinRequests`,
        );

        message.open({
          type: "info",
          content: `All join requests: ${JSON.stringify(joinRequestsObject)}`,
        });

        const filteredRequests = joinRequestsObject
          .filter((request) => request.status === "pending")
          .map((request) => ({
            userId: request.userId,
            status: request.status,
          }));

        message.open({
          type: "info",
          content: `Filtered join requests: ${
            JSON.stringify(filteredRequests)
          }`,
        });
        setJoinRequests(filteredRequests);
      } catch {
        message.open({
          type: "error",
          content: "Failed to fetch join requests.",
        });
      }
    };

    loadUsers();
    loadCurrentUser();
    loadMatch();
    fetchJoinRequests();

    const interval = setInterval(() => {
      loadMatch();
      fetchJoinRequests();
    }, 5000);

    return () => clearInterval(interval);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiService, gameId, router]);

  const isHost = currentUsername === hostUsername;

  const handleSearch = (index: number, value: string) => {
    const updatedSearch = [...searchValues];
    updatedSearch[index] = value;
    setSearchValues(updatedSearch);

    const filtered = users.filter((user) =>
      user.username.toLowerCase().includes(value.toLowerCase()) &&
      !playerIds.includes(Number(user.id))
    );
    setFilteredUsers(filtered);
  };

  const handleInvite = async (index: number, username: string) => {
    const user = users.find((u) => u.username === username);
    if (!user || !gameId) {
      message.open({
        type: "error",
        content: "User not found or invalid match.",
      });
      return;
    }

    try {
      const currentUser = await apiService.get<User>("/users/me");
      if (user.id === currentUser.id) {
        message.open({
          type: "warning",
          content: "You cannot invite yourself.",
        });
        return;
      }
      await apiService.post(`/matches/${gameId}/invite`, {
        userId: user.id,
        playerSlot: index,
      });

      const updated = [...selectedPlayers];
      updated[index] = user.username;
      setSelectedPlayers(updated);

      const statusUpdate = [...inviteStatus];
      statusUpdate[index] = "waiting";
      setInviteStatus(statusUpdate);

      const updatedPending = [...pendingInvites];
      updatedPending[index] = Number(user.id);
      setPendingInvites(updatedPending);

      message.open({
        type: "success",
        content: `Invitation sent to ${username}`,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.open({
          type: "error",
          content: `Failed to send invite: ${error.message}`,
          duration: 3,
        });
      } else {
        console.error("Unknown error when sending invitation:", error);
        message.open({
          type: "error",
          content: "An unknown error occurred when trying to send invitation.",
          duration: 3,
        });
      }
    }
  };

  const handleStart = async () => {
    try {
      await apiService.post(`/matches/${gameId}/start`, {});
      router.push(`/match/${gameId}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.open({
          type: "error",
          content: `Failed to start match: ${error.message}`,
          duration: 3,
        });
      } else {
        console.error("Unknown error during match start:", error);
        message.open({
          type: "error",
          content: "An unknown error occurred while starting the match.",
          duration: 3,
        });
      }
    }
  };

  const handleCancelMatch = async () => {
    try {
      await apiService.delete(`/matches/${gameId}`);
      message.open({
        type: "info",
        content: "Match has been cancelled.",
      });
      router.push("/landingpageuser");
    } catch {
      message.open({
        type: "error",
        content: "Could not cancel the match.",
      });
    }
  };

  const renderHostCard = () => (
    <Card
      style={{
        backgroundColor: "#f0f0f0",
        padding: "10px",
        textAlign: "center",
        width: 260,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <p style={{ fontWeight: "bold", fontSize: "16px", color: "black" }}>
        {hostUsername}
      </p>
    </Card>
  );

  const renderPlayerCard = (index: number) => {
    const player = selectedPlayers[index];
    const isComputer = player === "computer";
    const isInvited = player === "invite";
    const isFilled = player && player !== "computer" && player !== "invite";
    const difficultyLabel = ["Easy", "Medium", "Difficult"];

    const handleDifficultySelect = async (difficulty: number) => {
      const updated = [...selectedPlayers];
      updated[index] = "computer";
      setSelectedPlayers(updated);

      const toggle = [...showDifficulty];
      toggle[index] = true;
      setShowDifficulty(toggle);

      const toggleInvite = [...showInvite];
      toggleInvite[index] = false;
      setShowInvite(toggleInvite);

      const difficulties = [...selectedDifficulties];
      difficulties[index] = difficulty;
      setSelectedDifficulties(difficulties);

      try {
        await apiService.post(`/matches/${gameId}/ai`, {
          difficulty: difficulty,
        });
        message.open({
          type: "success",
          content: `Computer added at position ${index + 1}`,
        });
      } catch {
        message.open({
          type: "error",
          content: "Failed to add computer opponent.",
        });
      }
    };

    const difficultyItems = [
      { label: <span style={{ color: "black" }}>Easy</span>, key: "0" },
      { label: <span style={{ color: "black" }}>Medium</span>, key: "1" },
      { label: <span style={{ color: "black" }}>Difficult</span>, key: "2" },
    ];

    const columns = [
      {
        title: "Username",
        dataIndex: "username",
        key: "username",
      },
      {
        title: "",
        key: "action",
        render: (record: User) => (
          <Button
            size="small"
            onClick={() => handleInvite(index, record.username)}
          >
            Invite
          </Button>
        ),
      },
    ];

    return (
      <Card
        key={index}
        style={{
          backgroundColor: "#f0f0f0",
          padding: "10px",
          textAlign: "center",
          width: 260,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            width: "100%",
          }}
        >
          {inviteStatus[index] === "waiting"
            ? (
              <p
                style={{ fontWeight: "bold", fontSize: "16px", color: "gray" }}
              >
                Waiting...
              </p>
            )
            : isComputer
            ? (
              <p
                style={{ fontWeight: "bold", fontSize: "16px", color: "black" }}
              >
                AI Player: {difficultyLabel[selectedDifficulties[index]]}
              </p>
            )
            : isFilled
            ? (
              <p
                style={{ fontWeight: "bold", fontSize: "16px", color: "black" }}
              >
                {player}
              </p>
            )
            : !isHost
            ? (
              <p style={{ fontSize: "16px", color: "gray" }}>
                Waiting for other players...
              </p>
            )
            : (
              <>
                <Button
                  style={{
                    backgroundColor: isInvited ? "#b2f2bb" : "#d9d9d9",
                    border: "none",
                    width: "100%",
                  }}
                  onClick={() => {
                    const updated = [...selectedPlayers];
                    const toggleInvite = [...showInvite];
                    const toggleDiff = [...showDifficulty];

                    const isOpen = updated[index] === "invite" &&
                      toggleInvite[index];

                    if (isOpen) {
                      updated[index] = "";
                      toggleInvite[index] = false;
                    } else {
                      updated[index] = "invite";
                      toggleInvite[index] = true;

                      setFilteredUsers(users.filter(
                        (u) =>
                          u.status === "ONLINE" &&
                          !playerIds.includes(Number(u.id)),
                      ));
                    }

                    toggleDiff[index] = false;

                    setSelectedPlayers(updated);
                    setShowInvite(toggleInvite);
                    setShowDifficulty(toggleDiff);
                  }}
                >
                  Invite Player
                </Button>

                <Dropdown
                  menu={{
                    items: difficultyItems,
                    onClick: ({ key }) => handleDifficultySelect(Number(key)),
                  }}
                  trigger={["click"]}
                >
                  <Button
                    style={{
                      backgroundColor: isComputer ? "#b2f2bb" : "#d9d9d9",
                      border: "none",
                      width: "100%",
                    }}
                  >
                    {isComputer
                      ? `Computer (${
                        difficultyLabel[selectedDifficulties[index]]
                      })`
                      : "Computer opponent"}
                  </Button>
                </Dropdown>

                {showInvite[index] && (
                  <div style={{ marginTop: 8 }}>
                    <Input
                      placeholder="Search user..."
                      size="small"
                      value={searchValues[index]}
                      onChange={(e) => handleSearch(index, e.target.value)}
                    />
                    <Table
                      size="small"
                      dataSource={filteredUsers}
                      columns={columns}
                      rowKey="id"
                      pagination={{ pageSize: 3 }}
                      style={{ marginTop: 8 }}
                    />
                  </div>
                )}
              </>
            )}
        </div>
      </Card>
    );
  };

  const handleAcceptJoin = async (userId: number, matchId: number) => {
    try {
      await apiService.post(`/matches/${matchId}/join/accept`, { userId });
      message.open({
        type: "success",
        content: "User joined the game.",
      });
      setJoinRequests((prevRequests) => {
        const updatedRequests = [...prevRequests]; // Create a copy of the array
        return updatedRequests.filter((request) =>
          Number(request.userId) !== userId
        ); // Remove the accepted request
      });
    } catch {
      message.open({
        type: "error",
        content: "Failed to accept the join request.",
      });
    }
  };

  const handleDeclineJoin = async (userId: number, matchId: number) => {
    try {
      await apiService.post(`/matches/${matchId}/join/decline`, { userId });
      message.open({
        type: "info",
        content: "User's join request declined.",
      });
      setJoinRequests((prevRequests) => {
        const updatedRequests = [...prevRequests]; // Create a copy of the array
        return updatedRequests.filter((request) =>
          Number(request.userId) !== userId
        ); // Remove the declined request
      });
    } catch {
      message.open({
        type: "error",
        content: "Failed to decline the join request.",
      });
    }
  };

  const renderJoinRequestModal = () => {
    if (joinRequests.length === 0) {
      return null;
    }

    message.open({
      type: "info",
      content: `Pending join requests: ${JSON.stringify(joinRequests)}`,
    });

    return joinRequests.map((request) => (
      <Modal
        key={request.userId}
        title={`Join Request`}
        open={true}
        onOk={() => handleAcceptJoin(Number(request.userId), Number(gameId))}
        onCancel={() =>
          handleDeclineJoin(Number(request.userId), Number(gameId))}
        okText="Accept"
        cancelText="Decline"
        closable={false}
        maskClosable={false}
      >
        <p style={{ color: "black" }}>
          {`User with ID ${request.userId} has requested to join your game.`}
        </p>
      </Modal>
    ));
  };

  return (
    <div
      className={styles.page}
      style={{ backgroundColor: "white", padding: "40px" }}
    >
      <main className={styles.main}>
        {renderJoinRequestModal()}
        <p
          style={{
            marginBottom: "20px",
            fontWeight: "bold",
            fontSize: "16px",
            color: "black",
          }}
        >
          Game ID:{" "}
          <span style={{ fontFamily: "monospace", color: "black" }}>
            {gameId}
          </span>
        </p>

        <Row gutter={[12, 12]} justify="center">
          <Col>{renderHostCard()}</Col>
          {[1, 2, 3].map((i) => <Col key={i}>{renderPlayerCard(i)}</Col>)}
        </Row>

        {isHost && (
          <>
            <div style={{ marginTop: 40, textAlign: "center" }}>
              <p style={{ color: "black", fontWeight: "bold" }}>
                Amount of points to be reached until the end:
              </p>
              <Row gutter={[8, 8]} justify="center">
                {[50, 75, 100, 150, 200].map((points) => (
                  <Col key={points}>
                    <Button
                      onClick={async () => {
                        setSelectedPoints(points);
                        try {
                          await apiService.post(`/matches/${gameId}/length`, {
                            length: points,
                          });
                          message.open({
                            type: "success",
                            content: `Points set to ${points}`,
                          });
                        } catch {
                          message.open({
                            type: "error",
                            content: "Could not set match points.",
                          });
                        }
                      }}
                      style={{
                        backgroundColor: selectedPoints === points
                          ? "#b2f2bb"
                          : "#d9d9d9",
                        border: "none",
                        color: "black",
                        width: "60px",
                      }}
                    >
                      {points}
                    </Button>
                  </Col>
                ))}
              </Row>
            </div>

            <div
              style={{
                marginTop: 40,
                display: "flex",
                justifyContent: "center",
                gap: "20px",
              }}
            >
              <Button className="login-button" onClick={handleStart}>
                Start
              </Button>
              <Button className="back-button" onClick={handleCancelMatch}>
                Cancel Match
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default StartPage;
