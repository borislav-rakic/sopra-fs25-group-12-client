"use client";

import "@ant-design/v5-patch-for-react-19";
import { useRouter } from "next/navigation";
import { Button, Select, Space, Typography } from "antd";
import styles from "@/styles/page.module.css";
import { useState } from "react";

const { Title } = Typography;

const SettingsPage: React.FC = () => {
  const router = useRouter();

  const [deckDesign, setDeckDesign] = useState<string | undefined>();
  const [surfaceStyle, setSurfaceStyle] = useState<string | undefined>();
  const [cardMat, setCardMat] = useState<string | undefined>();

  const handleSave = () => {
    // TODO: Send selected values to backend
    console.log("Saved settings:", { deckDesign, surfaceStyle, cardMat });
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Title level={4} style={{ color: "black" }}>Deck Design:</Title>
        <Select
          placeholder="Choose deck style"
          value={deckDesign}
          onChange={(value) => setDeckDesign(value)}
          style={{ width: 250 }}
          options={[]} // TODO: Add deck design options here
        />

        <div style={{ height: 32 }} />

        <Title level={4} style={{ color: "black" }}>Playing Surface:</Title>
        <Select
          placeholder="Choose surface type"
          value={surfaceStyle}
          onChange={(value) => setSurfaceStyle(value)}
          style={{ width: 250 }}
          options={[]} // TODO: Add playing surface options here
        />

        <div style={{ height: 32 }} />

        <Title level={4} style={{ color: "black" }}>Card Mat:</Title>
        <Select
          placeholder="Choose mat pattern"
          value={cardMat}
          onChange={(value) => setCardMat(value)}
          style={{ width: 250 }}
          options={[]} // TODO: Add card mat options here
        />

        <Space style={{ marginTop: 40 }}>
          <Button className="back-button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button className="login-button" onClick={handleSave}>
            Save
          </Button>
        </Space>
      </main>
    </div>
  );
};

export default SettingsPage;
