"use client";

import { useRouter, useParams } from "next/navigation";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useState } from "react";
import { Button, Input, Typography, Row, Col, Space } from "antd";
import "@/styles/globals.css";

const { Title } = Typography;

const UserProfilePage: React.FC = () => {
  const router = useRouter();
  const { id } = useParams();
  const { value: userId } = useLocalStorage("userId", "");
  const isOwnProfile = id === userId;

  const [requestSent, setRequestSent] = useState(false); // toggles green/grey

  const friends = ["user1", "user2", "user3"]; // mock for layout

  const handleFriendRequestToggle = async () => {
    // 📝 Leave this empty for now as requested
    setRequestSent((prev) => !prev);
  };

  return (
    <div
      className="login-container"
      style={{
        maxWidth: 400,
        margin: "0 auto",
        paddingTop: "40px",
        textAlign: "center",
      }}
    >
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <div>
          <Title level={4} style={{ color: "black", marginBottom: 4 }}>
            Username
          </Title>
          <Input value={`user${id}`} disabled style={{ marginBottom: 8 }} />
        </div>

        {isOwnProfile && (
          <div>
            <Title level={4} style={{ color: "black", marginBottom: 4 }}>
              Password
            </Title>
            <Input.Password placeholder="Password" disabled style={{ marginBottom: 8 }} />
          </div>
        )}

        {!isOwnProfile && (
          <Button
            onClick={handleFriendRequestToggle}
            style={{
              backgroundColor: requestSent ? "#b2f2bb" : "#d9d9d9",
              border: "none",
              color: "black",
              width: "100%",
            }}
          >
            {requestSent ? "Sent. Cancel friend request?" : "Send friend request"}
          </Button>
        )}

        {isOwnProfile && (
          <Button
            style={{
              backgroundColor: "#b2f2bb",
              border: "none",
              color: "black",
              width: "100%",
            }}
          >
            Friend requests
          </Button>
        )}

        <div style={{ marginTop: 24 }}>
          <Title level={5} style={{ color: "black", textAlign: "left" }}>
            Friends
          </Title>
          <Row gutter={[12, 12]} justify="center">
            {friends.map((friend) => (
              <Col key={friend}>
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    backgroundColor: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "black",
                  }}
                >
                  {friend}
                </div>
              </Col>
            ))}
          </Row>
        </div>

        <Button className="back-button" onClick={() => router.back()}>
          Back
        </Button>
      </Space>
    </div>
  );
};

export default UserProfilePage;
