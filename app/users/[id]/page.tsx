"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import Image from "next/image";
import { Button, message } from "antd";
import "@ant-design/v5-patch-for-react-19";
import "./userProfileView.css";

type FriendshipStatus = "UNDEFINED" | "PENDING" | "ACCEPTED" | "DECLINED";

type FriendStatusResponse = {
  status: FriendshipStatus;
  initiatedByCurrentUser: boolean;
};

type UserPublicProfile = {
  id: number;
  username: string;
  status: string;
  avatar: number;
  birthday: string;
  rating: number;
  scoreTotal: number;
  gamesPlayed: number;
  matchesPlayed: number;
  avgGameRanking: number;
  avgMatchRanking: number;
  moonShots: number;
  perfectGames: number;
  perfectMatches: number;
  currentGameStreak: number;
  longestGameStreak: number;
  currentMatchStreak: number;
  longestMatchStreak: number;
  me: boolean;
};

const UserProfileView: React.FC = () => {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const router = useRouter();
  const api = useApi();

  const [user, setUser] = useState<UserPublicProfile | null>(null);
  const [friendStatus, setFriendStatus] = useState<FriendStatusResponse | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/"); // No token = send back to home
      return;
    }
    if (!id) return;

    const fetchData = async () => {
      try {
        const userRes = await api.get<UserPublicProfile>(`/users/${id}`);
        setUser(userRes);

        const statusRes = await api.get<FriendStatusResponse>(
          `/users/${id}/friends/status`,
        );
        setFriendStatus(statusRes);
      } catch (err) {
        console.error("Failed to load user or friendship status", err);
        setError("Could not load user profile");
      }
    };

    fetchData();
  }, [api, id, router]);

  const refreshFriendStatus = async () => {
    try {
      const res = await api.get<FriendStatusResponse>(
        `/users/${id}/friends/status`,
      );
      setFriendStatus(res);
    } catch (err) {
      console.error("Failed to refresh friend status", err);
    }
  };

  const handleFriendAction = async (
    action: "add" | "accept" | "decline" | "remove",
  ) => {
    if (!id) return;

    setLoadingAction(true);
    try {
      switch (action) {
        case "add":
          await api.post(`/users/${id}/friends`, {});
          break;
        case "accept":
          await api.put(`/users/${id}/friends`, { status: "ACCEPTED" });
          break;
        case "decline":
          await api.put(`/users/${id}/friends`, { status: "DECLINED" });
          break;
        case "remove":
          await api.delete(`/users/${id}/friends`);
          break;
      }

      message.open({
        type: "success",
        content: "Action completed successfully.",
        duration: 2,
      });

      await refreshFriendStatus();
    } catch (err: unknown) {
      console.error("Friend action failed:", err);

      let errorMessage = "Friend action failed.";

      if (
        typeof err === "object" &&
        err !== null &&
        "message" in err &&
        typeof (err as { message?: string }).message === "string"
      ) {
        errorMessage = (err as { message: string }).message;
      }

      message.open({
        type: "error",
        content: errorMessage,
        duration: 2,
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const renderFriendActions = () => {
    if (!friendStatus || !user|| user.me) return null;
    const { status, initiatedByCurrentUser } = friendStatus;

    switch (status) {
      case "ACCEPTED":
        return (
          <div>
            <p>✅ You are friends!</p>
            <Button
              danger
              onClick={() => handleFriendAction("remove")}
              loading={loadingAction}
            >
              Remove Friend
            </Button>
          </div>
        );

      case "PENDING":
        return initiatedByCurrentUser
          ? (
            <div>
              <p>⏳ Friend request sent</p>
              <Button
                danger
                onClick={() => handleFriendAction("remove")}
                loading={loadingAction}
              >
                Cancel
              </Button>
            </div>
          )
          : (
            <div>
              <p>📩 Friend request received</p>
              <Button
                type="primary"
                onClick={() => handleFriendAction("accept")}
                loading={loadingAction}
              >
                Accept
              </Button>
              <Button
                onClick={() => handleFriendAction("decline")}
                loading={loadingAction}
                style={{ marginLeft: 8 }}
              >
                Decline
              </Button>
            </div>
          );

      case "DECLINED":
        return (
          <div>
            <p>❌ Friend request was declined</p>
            <Button
              type="default"
              onClick={() => handleFriendAction("add")}
              loading={loadingAction}
            >
              Add Friend
            </Button>
          </div>
        );

      case "UNDEFINED":
      default:
        return (
          <Button
            type="default"
            onClick={() => handleFriendAction("add")}
            loading={loadingAction}
          >
            Add Friend
          </Button>
        );
    }
  };

  if (error) return <div className="error">{error}</div>;
  if (!user) return <div className="loading">Loading user profile...</div>;

  const formattedBirthday = user.birthday
    ? new Date(user.birthday).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : "";

  const avatarUrl = `/avatars_118x118/a${user.avatar}.png`;

  return (
    <div className="user-profile-view">
      <Image
        src={avatarUrl}
        alt={`${user.username}'s Avatar`}
        width={80}
        height={80}
        className="user-avatar"
      />
      <h2 style={{ color: "white" }}>{user.username}</h2>
      <p>Status: {user.status}</p>
      <p>Birthday: {formattedBirthday || "Unknown"}</p>

      <table
        className="user-stats-table"
        style={{
          margin: "2rem auto",
          background: "#f8f8f8",
          color: "black",
          borderRadius: 8,
          minWidth: 320,
        }}
      >
        <tbody>
          <tr>
            <th
              colSpan={2}
              style={{
                textAlign: "center",
                fontSize: "1.5rem",
                background: "#d0ffd0",
              }}
            >
              Stats
            </th>
          </tr>
          <tr>
            <th>Total Score</th>
            <td>{user.scoreTotal}</td>
          </tr>
          <tr>
            <th>Games Played</th>
            <td>{user.gamesPlayed}</td>
          </tr>
          <tr>
            <th>Matches Played</th>
            <td>{user.matchesPlayed}</td>
          </tr>
          <tr>
            <th>Avg. Game Ranking</th>
            <td>{user.avgGameRanking?.toFixed(2)}</td>
          </tr>
          <tr>
            <th>Avg. Match Ranking</th>
            <td>{user.avgMatchRanking?.toFixed(2)}</td>
          </tr>
          <tr>
            <th>Moon Shots</th>
            <td>{user.moonShots}</td>
          </tr>
          <tr>
            <th>Perfect Games</th>
            <td>{user.perfectGames}</td>
          </tr>
          <tr>
            <th>Perfect Matches</th>
            <td>{user.perfectMatches}</td>
          </tr>
          <tr>
            <th>Current Game Streak</th>
            <td>{user.currentGameStreak}</td>
          </tr>
          <tr>
            <th>Longest Game Streak</th>
            <td>{user.longestGameStreak}</td>
          </tr>
          <tr>
            <th>Current Match Streak</th>
            <td>{user.currentMatchStreak}</td>
          </tr>
          <tr>
            <th>Longest Match Streak</th>
            <td>{user.longestMatchStreak}</td>
          </tr>
        </tbody>
      </table>

      <div className="friend-action-block" style={{ marginTop: "1.5rem" }}>
        {renderFriendActions()}
      </div>

      <Button
        type="default"
        onClick={() => router.back()}
        style={{ marginTop: "2rem" }}
      >
        Back
      </Button>
    </div>
  );
};

export default UserProfileView;
