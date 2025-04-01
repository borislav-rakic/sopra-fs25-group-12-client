"use client";

import "@ant-design/v5-patch-for-react-19";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, Col, Row } from "antd";
import styles from "@/styles/page.module.css";
//import { difficultyLevels } from "@/app/constants/difficultyLevels";

const StartPage: React.FC = () => {
  const router = useRouter();
  const { id: gameId } = useParams(); // this came from backend match.getId()

  const [selectedPlayers, setSelectedPlayers] = useState(["", "", ""]);
  const [showDifficulty, setShowDifficulty] = useState([false, false, false]);
  //const [selectedDifficulty, setSelectedDifficulty] = useState<number[]>([null, null, null]);
  const [selectedPoints, setSelectedPoints] = useState<number | null>(null);

  const handleStart = () => {
    // TODO: Send selected config to backend for match start
    console.log({
      gameId,
      selectedPlayers,
      //selectedDifficulty,
      selectedPoints,
    });

    if (gameId) {
      router.push(`/match/${gameId}`);
    }
  };

  const renderPlayerCard = (index: number) => (
    <Card
      key={index}
      style={{
        backgroundColor: "#f0f0f0",
        padding: "10px",
        textAlign: "center",
        width: 180,
        height: "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <Button
          style={{
            backgroundColor: selectedPlayers[index] === "invite"
              ? "#b2f2bb"
              : "#d9d9d9",
            border: "none",
            width: "100%",
          }}
          onClick={() => {
            const updated = [...selectedPlayers];
            updated[index] = "invite";
            setSelectedPlayers(updated);
            const toggle = [...showDifficulty];
            toggle[index] = false;
            setShowDifficulty(toggle);
          }}
        >
          Invite Player
        </Button>

        <Button
          style={{
            backgroundColor: selectedPlayers[index] === "computer"
              ? "#b2f2bb"
              : "#d9d9d9",
            border: "none",
            width: "100%",
            whiteSpace: "normal",
          }}
          onClick={() => {
            const updated = [...selectedPlayers];
            updated[index] = "computer";
            setSelectedPlayers(updated);
            const toggle = [...showDifficulty];
            toggle[index] = true;
            setShowDifficulty(toggle);
          }}
        >
          Computer opponent
        </Button>

        {
          /*         {showDifficulty[index] && (
          <>
            <p style={{ color: "black", fontWeight: "bold", fontSize: 12, margin: "6px 0 2px" }}>
              Computer difficulty:
            </p>
            {difficultyLevels.map(({ label, value }) => (
              <Button
                key={label}
                style={{
                  backgroundColor: selectedDifficulty[index] === value ? "#b2f2bb" : "#d9d9d9",
                  border: "none",
                  width: "100%",
                }}
                onClick={() => {
                  const updated = [...selectedDifficulty];
                  updated[index] = value;
                  setSelectedDifficulty(updated);
                }}
              >
                {label}
              </Button>
            ))}
          </>
        )} */
        }
      </div>
    </Card>
  );

  const renderSelfCard = () => (
    <Card
      style={{
        backgroundColor: "#f0f0f0",
        padding: "10px",
        textAlign: "center",
        width: 180,
        height: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <p style={{ color: "black", fontWeight: "bold", margin: 0 }}>You</p>
    </Card>
  );

  return (
    <div
      className={styles.page}
      style={{ backgroundColor: "white", padding: "40px" }}
    >
      <main className={styles.main}>
        <p
          style={{ marginBottom: "20px", fontWeight: "bold", fontSize: "16px" }}
        >
          Game ID: <span style={{ fontFamily: "monospace" }}>{gameId}</span>
        </p>

        <Row gutter={[12, 12]} justify="center">
          {[0, 1, 2].map((i) => <Col key={i}>{renderPlayerCard(i)}</Col>)}
          <Col>{renderSelfCard()}</Col>
        </Row>

        <div style={{ marginTop: 40, textAlign: "center" }}>
          <p style={{ color: "black", fontWeight: "bold" }}>
            Amount of points to be reached until the end:
          </p>
          <Row gutter={[8, 8]} justify="center">
            {[50, 75, 100, 150, 200].map((points) => (
              <Col key={points}>
                <Button
                  onClick={() => setSelectedPoints(points)}
                  style={{
                    backgroundColor: selectedPoints === points
                      ? "#b2f2bb"
                      : "#d9d9d9",
                    border: "none",
                    color: "black",
                    width: "60px",
                  }}
                >
                  {points}
                </Button>
              </Col>
            ))}
          </Row>
        </div>

        <div
          style={{
            marginTop: 40,
            display: "flex",
            justifyContent: "center",
            gap: "20px",
          }}
        >
          <Button className="login-button" onClick={handleStart}>
            Start
          </Button>
          <Button
            className="back-button"
            onClick={() => router.push("/landingpageuser")}
          >
            Cancel Match
          </Button>
        </div>
      </main>
    </div>
  );
};

export default StartPage;
