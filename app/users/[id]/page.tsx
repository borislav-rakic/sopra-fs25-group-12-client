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
  }, [api, id]);

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
    if (!friendStatus) return null;
    const { status, initiatedByCurrentUser } = friendStatus;

    switch (status) {
      case "ACCEPTED":
        return (
          <div>
            <p>✅ You are friends</p>
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
                Cancel Request
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
              type="primary"
              onClick={() => handleFriendAction("add")}
              loading={loadingAction}
            >
              Reconnect
            </Button>
          </div>
        );

      case "UNDEFINED":
      default:
        return (
          <Button
            type="primary"
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

  const avatarUrl = `/avatars_118x118/r${100 + user.avatar}.png`;

  return (
    <div className="user-profile-view">
      <Image
        src={avatarUrl}
        alt={`${user.username}'s Avatar`}
        width={80}
        height={80}
        className="user-avatar"
      />
      <h2>{user.username}</h2>
      <p>Status: {user.status}</p>
      <p>Birthday: {formattedBirthday}</p>
      <p>Rating: {user.rating}</p>

      <div className="friend-action-block" style={{ marginTop: "1.5rem" }}>
        {renderFriendActions()}
      </div>

      <Button
        type="default"
        onClick={() => router.back()}
        style={{ marginTop: "2rem" }}
      >
        Go Back
      </Button>
    </div>
  );
};

export default UserProfileView;
