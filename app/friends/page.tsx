"use client";

import React, { useEffect, useState } from "react";
import { message } from "antd";
import "@ant-design/v5-patch-for-react-19";
import { useApi } from "@/hooks/useApi";
import "./friends.css";
import FriendCard from "@/components/FriendCard";
import UserSearchPanel from "@/components/UserSearchPanel";

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
      <h3>{title}</h3>
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
    <div className="friends-page">
      <h2>My Friends</h2>
      {renderFriendSection(
        "My Friend List",
        acceptedRequests,
        "No accepted friends yet.",
      )}
      {renderFriendSection(
        "Incoming Friend Requests",
        pendingRequests,
        "No incoming requests.",
      )}
      {renderFriendSection(
        "Friend Requests You Declined",
        declinedRequests,
        "No declined requests.",
      )}
      <h3>Search for New Friends</h3>
      <UserSearchPanel />
    </div>
  );
};

export default FriendsPage;
