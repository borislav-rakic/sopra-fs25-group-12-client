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
import "@/styles/globals.css";
import { handleApiError } from "@/utils/errorHandlers";

const StartPage: React.FC = () => {
  const params = useParams();
  const gameId = params?.id?.toString();
  const router = useRouter();
  const apiService = useApi();
  const TOTAL_SLOTS = 4;
  const frontendPlayerIndices = Array.from(
    { length: TOTAL_SLOTS },
    (_, i) => i,
  );

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
  const [selectedPoints, setSelectedPoints] = useState<number | null>(100);
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
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/"); // No token = send back to home
      return;
    }
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
        const result = await apiService.get<User[]>(
          `/matches/${gameId}/eligibleusers`,
        );
        setUsers(result);
        setFilteredUsers(result);
        usersRef.current = result;
      } catch {
        message.open({
          type: "error",
          content: "Could not load eligible users.",
        });
      }
    };

    const loadMatch = async () => {
      try {
        const match = await apiService.get<Match>(`/matches/${gameId}`);
        console.log(match);
        const playerIdList = [
          match.player1Id,
          match.player2Id,
          match.player3Id,
          match.player4Id,
        ].filter((id): id is number => id !== null);

        setPlayerIds(playerIdList);
        setHostUsername(match.hostUsername);

        const updatedSelectedPlayers = [...selectedPlayers];
        const updatedInviteStatus = [...inviteStatus];
        const updatedPendingInvites = [...pendingInvites];
        const updatedDifficulties = [...selectedDifficulties];

        for (let i = 0; i < TOTAL_SLOTS; i++) {
          updatedSelectedPlayers[i] = "";
          updatedInviteStatus[i] = null;
          updatedPendingInvites[i] = null;
          updatedDifficulties[i] = 0;
        }

        const playerIdsArray = [
          match.player1Id,
          match.player2Id,
          match.player3Id,
          match.player4Id,
        ];

        for (let i = 0; i < playerIdsArray.length; i++) {
          const pid = playerIdsArray[i];

          if (pid === null || pid === undefined) {
            updatedSelectedPlayers[i] = "";
            continue;
          }

          if (AI_PLAYER_INFO[pid]) {
            const { difficulty } = AI_PLAYER_INFO[pid];

            updatedSelectedPlayers[i] = "computer";
            updatedDifficulties[i] = difficulty;
          } else {
            // It's a real user
            const user = usersRef.current.find((u) => Number(u.id) === pid);
            updatedSelectedPlayers[i] = match.playerNames[i] ?? user?.username ?? "";
          }
        }

        Object.entries(match.invites || {}).forEach(([slotStr, userId]) => {
          const slot = (Number(slotStr) - 1) % 4;
          const index = slot;

          const user = usersRef.current.find((u) => Number(u.id) === userId);
          updatedSelectedPlayers[index] = user?.username ?? "Waiting...";
          updatedInviteStatus[index] = "waiting";
          updatedPendingInvites[index] = userId;
        });

        setSelectedPlayers(updatedSelectedPlayers);
        setInviteStatus(updatedInviteStatus);
        setPendingInvites(updatedPendingInvites);
        setSelectedDifficulties(updatedDifficulties);

        if (match.started) {
          router.push(`/match/${gameId}`);
        }
      } catch (error) {
        console.log("Error caught:", error); // Inspect the error structure

        // Check if the error has a `response` property (e.g., Axios errors)
        if (
          typeof error === "object" && error !== null && "status" in error &&
          error.status === 403
        ) {
          message.open({
            type: "error",
            content: "You are not authorized to view this match.",
          });
          router.push("/landingpageuser");
        } else if (
          typeof error === "object" && error !== null && "status" in error &&
          error.status === 409
        ) {
          message.open({
            type: "error",
            content: "You are not authorized to view this match.",
          });
          router.push("/landingpageuser");
        } else if ( 
          typeof error === "object" && error !== null && "status" in error &&
          error.status === 404
        ) {
          message.open({
            type: "error",
            content: "This no longer exists. It was cancelled by the host or never existed.",
          });
          router.push("/landingpageuser");
        } else if (error instanceof Error) {
          // Handle standard Error objects
          handleApiError(error, "Failed to fetch match data.");
        } else {
          // Fallback for unexpected error structures
          console.error("Unexpected error structure:", error);
          message.open({
            type: "error",
            content: "An unexpected error occurred. Please try again.",
          });
        }
      }
    };

    const loadCurrentUser = async () => {
      try {
        const me = await apiService.get<User>("/users/me");
        setCurrentUsername(me.username);
      } catch {
        message.open({
          type: "error",
          content: "Session expired. Please log in again.",
        });
        router.push("/login"); // or your auth page
      }
    };

    const fetchJoinRequests = async () => {
      try {
        const joinRequestsObject: JoinRequest[] = await apiService.get(
          `/matches/${gameId}/joinRequests`,
        );

        const filteredRequests = joinRequestsObject
          .filter((request) => request.status === "pending")
          .map((request) => ({
            userId: request.userId,
            status: request.status,
          }));

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
    }, 2000);

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

      const toggleInviteCopy = [...showInvite];
      toggleInviteCopy[index] = false; // Close the invite window
      setShowInvite(toggleInviteCopy);

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

  const handleCancelInvite = async (index: number) => {
    if (!gameId) return;
    const shiftedIndex = (index + 1) % 4;
    try {
      console.log("Cancelling invite for index:", shiftedIndex);
      await apiService.delete(`/matches/${gameId}/invite/${shiftedIndex}`);

      const updatedPlayers = [...selectedPlayers];
      updatedPlayers[index] = "";
      setSelectedPlayers(updatedPlayers);

      const updatedStatuses = [...inviteStatus];
      updatedStatuses[index] = null;
      setInviteStatus(updatedStatuses);

      const updatedPending = [...pendingInvites];
      updatedPending[index] = null;
      setPendingInvites(updatedPending);

      message.open({
        type: "info",
        content: `Invite for slot ${index} has been cancelled.`,
      });
    } catch {
      message.open({
        type: "error",
        content: "Could not cancel invite.",
      });
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

  const AI_PLAYER_INFO: Record<number, { slot: number; difficulty: number }> = {
    1: { slot: 1, difficulty: 1 },
    2: { slot: 2, difficulty: 1 },
    3: { slot: 3, difficulty: 1 },
    4: { slot: 1, difficulty: 2 },
    5: { slot: 2, difficulty: 2 },
    6: { slot: 3, difficulty: 2 },
    7: { slot: 1, difficulty: 3 },
    8: { slot: 2, difficulty: 3 },
    9: { slot: 3, difficulty: 3 },
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
        backgroundColor: "white",
        padding: "10px",
        textAlign: "center",
        width: 240,
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
    const isFilled = player && player !== "computer" && player !== "invite";
    const difficultyLabel = ["", "Easy", "Medium", "Difficult"];

    const handleDifficultySelect = async (difficulty: number) => {
      const updated = [...selectedPlayers];
      updated[index] = "computer";
      setSelectedPlayers(updated);

      const toggle = [...showDifficulty];
      toggle[index] = true;
      setShowDifficulty(toggle);

      const toggleInviteCopy = [...showInvite];
      toggleInviteCopy[index] = false; // Close the invite window
      setShowInvite(toggleInviteCopy);

      const difficulties = [...selectedDifficulties];
      difficulties[index] = difficulty;
      setSelectedDifficulties(difficulties);

      try {
        await apiService.post(`/matches/${gameId}/ai`, {
          difficulty: difficulty,
          playerSlot: index,
        });
        message.open({
          type: "success",
          content: `Computer added at position ${index}`,
        });
      } catch {
        message.open({
          type: "error",
          content: "Failed to add computer opponent.",
        });
      }
    };

    const handleRemoveAi = async (index: number) => {
      if (!gameId) return;

      try {
        await apiService.post(`/matches/${gameId}/ai/remove`, {
          playerSlot: index,
        });

        const updatedPlayers = [...selectedPlayers];
        updatedPlayers[index] = "";
        setSelectedPlayers(updatedPlayers);

        const updatedDiffs = [...selectedDifficulties];
        updatedDiffs[index] = 0;
        setSelectedDifficulties(updatedDiffs);

        message.open({
          type: "success",
          content: `AI player removed from slot ${index}`,
        });
      } catch {
        message.open({
          type: "error",
          content: "Could not remove AI player.",
        });
      }
    };

    const handleRemovePlayer = async (index: number) => {
      if (!gameId) return;

      try {
        await apiService.delete(`/matches/${gameId}/player/${index}`);

        const updatedPlayers = [...selectedPlayers];
        updatedPlayers[index] = "";
        setSelectedPlayers(updatedPlayers);

        const updatedStatuses = [...inviteStatus];
        updatedStatuses[index] = null;
        setInviteStatus(updatedStatuses);

        const updatedPending = [...pendingInvites];
        updatedPending[index] = null;
        setPendingInvites(updatedPending);

        message.open({
          type: "info",
          content: `Player removed from slot ${index}`,
        });
      } catch {
        message.open({
          type: "error",
          content: "Could not remove player.",
        });
      }
    };

    const handleLeaveMatch = async () => {
      if (!gameId) return;

      try {
        await apiService.delete(`/matches/${gameId}/leave`);
        message.open({
          type: "info",
          content: "You left the match.",
        });
        router.push("/landingpageuser");
      } catch {
        message.open({
          type: "error",
          content: "Could not leave the match.",
        });
      }
    };

    const difficultyItems = [
      { label: <span style={{ color: "black" }}>Easy</span>, key: "1" },
      { label: <span style={{ color: "black" }}>Medium</span>, key: "2" },
      { label: <span style={{ color: "black" }}>Difficult</span>, key: "3" },
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
          backgroundColor: "white",
          padding: "6px",
          textAlign: "center",
          width: 240,
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
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <p
                  style={{
                    fontWeight: "bold",
                    fontSize: "16px",
                    color: "black",
                  }}
                >
                  Waiting...
                </p>
                {isHost && (
                  <Button
                    danger
                    size="small"
                    type="link"
                    onClick={() => handleCancelInvite(index)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            )
            : isComputer
            ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <p
                  style={{
                    fontWeight: "bold",
                    fontSize: "16px",
                    color: "black",
                    marginBottom: 0,
                  }}
                >
                  AI Player: {difficultyLabel[selectedDifficulties[index]]}
                </p>
                {isHost && (
                  <Button
                    size="small"
                    danger
                    type="link"
                    onClick={() => handleRemoveAi(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            )
            : isFilled
            ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <p
                  style={{
                    fontWeight: "bold",
                    fontSize: "16px",
                    color: "black",
                  }}
                >
                  {player}
                </p>
                {isHost && (
                  <Button
                    size="small"
                    danger
                    type="link"
                    onClick={() => handleRemovePlayer(index)}
                  >
                    Remove
                  </Button>
                )}
                {player === currentUsername && !isHost && (
                  <Button
                    size="small"
                    danger
                    type="link"
                    onClick={handleLeaveMatch}
                  >
                    Leave
                  </Button>
                )}
              </div>
            )
            : !isHost
            ? (
              <p style={{ fontSize: "16px", color: "black" }}>
                Waiting for other players...
              </p>
            )
            : (
              <>
                <Button
                  block
                  className={styles.whiteButton}
                  onClick={() => {
                    const updated = [...selectedPlayers];
                    const toggleInviteCopy = [...showInvite];
                    const toggleDiff = [...showDifficulty];

                    const isOpen = toggleInviteCopy[index]; // Check if the invite window is open

                    if (isOpen) {
                      updated[index] = ""; // Clear the slot if the invite window is being closed
                      toggleInviteCopy[index] = false;
                    } else {
                      updated[index] = "invite"; // Mark the slot as "invite"
                      toggleInviteCopy[index] = true;

                      setFilteredUsers(users.filter(
                        (u) =>
                          u.status === "ONLINE" &&
                          !playerIds.includes(Number(u.id)),
                      ));
                    }

                    toggleDiff[index] = false; // Ensure difficulty selection is closed

                    setSelectedPlayers(updated);
                    setShowInvite(toggleInviteCopy);
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
                    block
                    className={styles.whiteButton}
                  >
                    {isComputer
                      ? `Computer (${
                        difficultyLabel[selectedDifficulties[index]]
                      })`
                      : "Computer Opponent"}
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

    return joinRequests.map((request) => (
      <Modal
        key={request.userId}
        title={`Join Request`}
        open
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
    <div className="contentContainer" style={{ textAlign: "center" }}>
      <main className={styles.main}>
        {renderJoinRequestModal()}
        <p
          style={{
            marginBottom: "2px",
            fontWeight: "bold",
            fontSize: "20px",
            color: "white",
          }}
        >
          MATCH ID:{" "}
          <span style={{ color: "white" }}>
            {gameId}
          </span>
        </p>

        <Row gutter={[16, 16]} justify="center">
          {frontendPlayerIndices.map((i) => (
            <Col xs={24} sm={12} md={12} lg={12} xl={12} key={i}>
              {i === 0 ? renderHostCard() : renderPlayerCard(i)}
            </Col>
          ))}
        </Row>

        {isHost && (
          <>
            <div
              style={{
                marginTop: "5",
                marginBottom: "10px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  color: "white",
                  fontWeight: "bold",
                  marginBottom: "10px",
                  fontSize: "20px",
                }}
              >
                Amount of points to be reached until the end:
              </p>
              <Row gutter={[8, 8]} justify="center">
                {[50, 75, 100, 150, 200].map((points) => (
                  <Col key={points}>
                    <Button
                      type="default"
                      onClick={async () => {
                        setSelectedPoints(points);
                        try {
                          await apiService.post(
                            `/matches/${gameId}/matchGoal`,
                            {
                              matchGoal: points,
                            },
                          );
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
                          ? "green"
                          : "white",
                        width: "60px",
                        transition: "background-color 0.2s ease-in-out",
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
                marginTop: 10,
                display: "flex",
                justifyContent: "center",
                gap: "20px",
              }}
            >
              <Button
                block
                className={styles.whiteButton}
                onClick={handleCancelMatch}
              >
                Cancel Match
              </Button>
              <Button
                block
                className={styles.whiteButton}
                onClick={handleStart}
              >
                Start
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default StartPage;
