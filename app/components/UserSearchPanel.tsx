"use client";

import React, { useEffect, useRef, useState } from "react";
import { Col, Input, Row, Spin } from "antd";
import { useApi } from "@/hooks/useApi";
import FriendCard from "@/components/FriendCard";

type UserSummary = {
  id: number;
  username: string;
  avatar: number;
};

function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay: number,
): (...args: Args) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

const UserSearchPanel: React.FC = () => {
  const apiService = useApi();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const debouncedSearchRef = useRef(
    debounce(async (text: string) => {
      if (!text.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const users = await apiService.get<UserSummary[]>(
          `/users/search?username=${encodeURIComponent(text)}`,
        );
        setResults(users);
      } catch (err) {
        console.error("Search failed", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400),
  );

  useEffect(() => {
    debouncedSearchRef.current(query);
  }, [query]);

  return (
    <div style={{ width: "100%", maxWidth: 1200 }}>
     <Input
      placeholder="Search username..."
      size="large"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      allowClear
      style={{ backgroundColor: "white", width: "260px" }}
      />{" "}
      {query.trim() && (
        <div>
          {loading
            ? <Spin />
            : results.length === 0
            ? <div style={{ color: "#999" }}>No users found</div>
            : (
              <Row
                gutter={[12, 12]}
                wrap
                style={{ maxHeight: 300, overflowY: "auto" }}
              >
                {results.map((user) => (
                  <Col key={user.id} style={{ flex: "0 0 auto" }}>
                    <FriendCard {...user} />
                  </Col>
                ))}
              </Row>
            )}
        </div>
      )}
    </div>
  );
};

export default UserSearchPanel;
