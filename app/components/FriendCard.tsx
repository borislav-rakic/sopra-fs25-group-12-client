"use client";

import React from "react";
import { Card } from "antd";
import Link from "next/link";
import Image from "next/image"; // <-- import from next/image

type FriendCardProps = {
  id: number;
  username: string;
  avatar: number;
};

const FriendCard: React.FC<FriendCardProps> = ({ id, username, avatar }) => {
  return (
    <Link href={`/users/${id}`} passHref>
      <Card
        hoverable
        style={{
          width: 100,
          height: 140,
          textAlign: "center",
          overflow: "hidden",
          backgroundColor: "white",
        }}
        styles={{
          body: {
            padding: 8,
          },
        }}
        cover={
          <div
            style={{ display: "flex", justifyContent: "center", paddingTop: 5 }}
          >
            <Image
              alt="avatar"
              src={`/avatars_118x118/r${100 + avatar}.png`}
              width={90}
              height={90}
              style={{ objectFit: "cover", borderRadius: 4 }}
            />
          </div>
        }
      >
        <Card.Meta
          title={
            <span style={{ fontSize: 14, color: "black", lineHeight: "1.2em" }}>
              {username}
            </span>
          }
        />
      </Card>
    </Link>
  );
};

export default FriendCard;
