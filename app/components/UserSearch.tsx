"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Input, List, Spin } from "antd";
import { useApi } from "@/hooks/useApi";
import { useRouter } from "next/navigation";
import "./UserSearch.css"; // Optional for styling

type User = {
  id: number;
  username: string;
  avatar: number;
};

const UserSearch: React.FC = () => {
  const [query, setQuery] = useState("");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const apiService = useApi();
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await apiService.get<User[]>("/users");
        setAllUsers(users);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [apiService]);

  const filteredUsers = useMemo(() => {
    if (!query.trim()) return [];
    return allUsers.filter((user) =>
      user.username.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, allUsers]);

  const handleSelectUser = (userId: number) => {
    router.push(`/users/${userId}`);
    setQuery(""); // Clear search after navigating (optional)
  };

  return (
    <div className="user-search-container">
      <Input
        placeholder="Search users..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        allowClear
      />
      {loading && <Spin size="small" style={{ marginTop: "0.5em" }} />}
      {!loading && query && (
        <List
          className="user-search-results"
          bordered
          dataSource={filteredUsers}
          size="small"
          renderItem={(user) => (
            <List.Item
              key={user.id}
              onClick={() => handleSelectUser(user.id)}
              className="user-search-item"
            >
              <span>{user.username}</span>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default UserSearch;
