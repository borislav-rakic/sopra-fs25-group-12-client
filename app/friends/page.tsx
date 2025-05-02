"use client";

import React, { useEffect, useState } from "react";
import { Button, message } from "antd";
import "@ant-design/v5-patch-for-react-19";
import { useApi } from "@/hooks/useApi";
import "./friends.css";
import FriendCard from "@/components/FriendCard";
import UserSearchPanel from "@/components/UserSearchPanel";
import { useRouter } from "next/navigation";
import "@/styles/globals.css";
import styles from "@/styles/page.module.css";

type UserSummary = {
  id: number;
  username: string;
  avatar: number;
};

const FriendsPage: React.FC = () => {
  const apiService = useApi();
  const [acceptedRequests, setAcceptedRequests] = useState<UserSummary[]>([]);
  const [pendingRequests, setPendingRequests] = useState<UserSummary[]>([]);
  const [declinedRequests, setDeclinedRequests] = useState<UserSummary[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const friendList = await apiService.get<UserSummary[]>(
          "/users/me/friends",
        );
        const pendingList = await apiService.get<UserSummary[]>(
          "/users/me/friends/pending",
        );
        const declinedList = await apiService.get<UserSummary[]>(
          "/users/me/friends/declined",
        );
        setAcceptedRequests(friendList);
        setPendingRequests(pendingList);
        setDeclinedRequests(declinedList);
      } catch (error) {
        console.error("Failed to load friends list:", error);
        message.open({
          type: "error",
          content: "Failed to load friends list.",
          duration: 2,
        });
      }
    };

    fetchFriends();
  }, [apiService]);

  const renderFriendSection = (
    title: string,
    users: UserSummary[],
    emptyMessage: string,
  ) => (
    <div className="friend-section">
      <h3 style={{ color: "white", fontWeight: "bold" }}>{title}</h3>
      <div className="friend-scroll-wrapper">
        {users.length > 0
          ? (
            <div className="friend-scroll">
              {users.map((user) => (
                <div className="friend-card-slot" key={user.id}>
                  <FriendCard {...user} />
                </div>
              ))}
            </div>
          )
          : <div className="friend-placeholder">{emptyMessage}</div>}
      </div>
    </div>
  );

  return (
    <div className="contentContainer">
      <div className="friends-page">
        {renderFriendSection(
          "My Friends",
          acceptedRequests,
          "No accepted friends yet.",
        )}
        {renderFriendSection(
          "Incoming Friend Requests",
          pendingRequests,
          "No incoming requests.",
        )}
        {renderFriendSection(
          "Declined Friend Requests",
          declinedRequests,
          "No declined requests.",
        )}
        <h3 style={{ color: "white", fontWeight: "bold" }}>
          Search for new friends:
        </h3>
        <UserSearchPanel />

        <Button
          block
          className={styles.whiteButton}
          style={{ width: 200, marginTop: "10px" }}
          onClick={() => router.push("/landingpageuser")}
        >
          Back to Home Page
        </Button>
      </div>
    </div>
  );
};

export default FriendsPage;
