"use client";

import { useEffect, useState } from "react";
import { message, Modal } from "antd";
import { useApi } from "@/hooks/useApi";
import { useRouter } from "next/navigation";
import { User } from "@/types/user";

interface Invite {
  matchId: number;
  playerSlot: number;
  fromUsername: string;
  userId: number;
}

export const InviteHandler: React.FC = () => {
  const [invite, setInvite] = useState<Invite | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const apiService = useApi();
  const router = useRouter();

  useEffect(() => {
    const pollInvites = async () => {
      const token = localStorage.getItem("token");
      if (!token) return; // no token means not logged in

      try {
        const currentUser = await apiService.get<User>("/users/me");
        if (!currentUser?.id) return;

        const invites = await apiService.get<Invite[]>("/users/me/invites");
        const personalInvite = invites.find((i) =>
          Number(i.userId) === Number(currentUser.id)
        );

        if (personalInvite) {
          setInvite(personalInvite);
          setModalVisible(true);
        } else {
          setInvite(null);
          setModalVisible(false);
        }
      } catch (error) {
        if (
          typeof error === "object" && error !== null && "status" in error &&
          (error.status === 403 || error.status === 401)
        ) {
          localStorage.removeItem("token");
          setInvite(null);
          setModalVisible(false);
          console.warn(
            "Token invalid or expired, removed token and skipping invite check.",
          );
        } else {
          console.error("Unexpected error fetching invites:", error);
        }
      }
    };

    const interval = setInterval(pollInvites, 5000);
    pollInvites();

    return () => clearInterval(interval);
  }, [apiService]);

  const respondToInvite = async (accepted: boolean) => {
    if (!invite) return;

    console.log("Responding to invite:", {
      gameId: invite.matchId,
      accepted,
    });

    try {
      await apiService.post(`/matches/${invite.matchId}/invite/respond`, {
        accepted,
      });

      if (accepted) {
        message.open({
          type: "success",
          content: "Joining game...",
        });
        router.push(`/start/${invite.matchId}`);
      } else {
        message.open({
          type: "info",
          content: "Invite declined.",
        });
      }
    } catch {
      message.open({
        type: "error",
        content: "Failed to respond to invite.",
      });
    } finally {
      setInvite(null);
      setModalVisible(false);
    }
  };

  return (
    <Modal
      title="Game Invitation"
      open={modalVisible && !!invite}
      onOk={() => respondToInvite(true)}
      onCancel={() => respondToInvite(false)}
      okText="Accept"
      cancelText="Decline"
      closable={false}
      maskClosable={false}
      styles={{
        body: { backgroundColor: "white", color: "black" },
        header: { backgroundColor: "white", color: "black" },
      }}
    >
      {invite
        ? (
          <p  style={{color:"black"}}>
            <strong style={{color:"black"}}>{invite.fromUsername}</strong> invited you to join game{" "}
            <strong style={{color:"black"}}>{invite.matchId}</strong>.
          </p>
        )
        : <p>No invite available.</p>}
    </Modal>
  );
};
