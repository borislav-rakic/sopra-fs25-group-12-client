"use client";
import { Table, Typography } from "antd";
import styles from "@/styles/page.module.css";

const { Paragraph, Title } = Typography;

const inGameScoringData = [
  { key: "heart", card: "Each Heart (♥)", points: "+1 point" },
  { key: "queen", card: "Queen of Spades (♠Q)", points: "+13 points" },
  { key: "other", card: "All Other Cards", points: "0 points" },
];

const matchPlacementData = [
  { key: "1", place: "1st Place", points: "+10 points" },
  { key: "2", place: "2nd Place", points: "+6 points" },
  { key: "3", place: "3rd Place", points: "+3 points" },
  { key: "4", place: "4th Place", points: "-1 point" },
];

const inGameColumns = [
  { title: "Card", dataIndex: "card", key: "card" },
  { title: "Points", dataIndex: "points", key: "points", align: "right" },
];

const matchColumns = [
  { title: "Placement", dataIndex: "place", key: "place" },
  { title: "Points", dataIndex: "points", key: "points", align: "right" },
];

export default function ScoringRules() {
  return (
    <div style={{ margin: "2rem auto", padding: "1rem" }}>
      <Title level={2} style={{ color: "white", textAlign: "center" }}>
        Scoring Overview
      </Title>

      <Paragraph style={{ color: "white", fontSize: "1rem", marginBottom: "1.5rem" }}>
        In <strong>Hearts Attack</strong>, you generally want to <strong>avoid scoring during the game</strong>.
        However, for Player Stats and leaderboards, you can earn points for various accomplishments.
        These achievements — like <strong>winning games or matches, shooting the moon</strong>, and more — are detailed below.
      </Paragraph>

      {/* In-Game Scoring */}
      <Title level={4} style={{ color: "white", marginTop: "2rem" }}>
        In-Game Scoring
      </Title>
      <Paragraph style={{ color: "white" }}>
        During each round, players accumulate penalty points by taking certain cards in tricks.
        The goal is to avoid gaining points.
      </Paragraph>
      <Table
        columns={inGameColumns}
        dataSource={inGameScoringData}
        pagination={false}
        bordered
        size="small"
      />
      <Paragraph style={{ color: "white" }}>
        <strong>Shooting the Moon:</strong> If you collect all 13 Hearts and the Queen of Spades in a round,
        you score <strong>0 points</strong>, and each other player scores <strong>+26 points</strong>.
      </Paragraph>

      {/* Game-Level Bonuses */}
      <Title level={4} style={{ color: "white", marginTop: "2rem" }}>
        Game-Level Bonuses
      </Title>
      <Paragraph style={{ color: "white" }}>
        After each 13-round game, bonus points are awarded based on performance:
      </Paragraph>
      <ul className={styles.bonusList}>
        <li><span className={styles.emoji}>🏆</span> +1 for game winners (lowest score)</li>
        <li><span className={styles.emoji}>❌</span> -1 for game losers (highest score)</li>
        <li><span className={styles.emoji}>⚖️</span> Neutral (0) for others</li>
        <li><span className={styles.emoji}>🌙</span> +3 for shooting the moon</li>
        <li><span className={styles.emoji}>🎯</span> +1 for a perfect game (0 points, no moon shot)</li>
      </ul>
      <Paragraph style={{ color: "white" }}>
        <em>
          Game stats tracked include: <strong>games played</strong>, <strong>average game ranking</strong>, and <strong>streaks</strong>.
        </em>
      </Paragraph>

      {/* Match-Level Scoring */}
      <Title level={4} style={{ color: "white", marginTop: "2rem" }}>
        Match-Level Scoring
      </Title>
      <Paragraph style={{ color: "white" }}>
        After a match (multiple games), players receive points based on their overall rank:
      </Paragraph>
      <Table
        columns={matchColumns}
        dataSource={matchPlacementData}
        pagination={false}
        bordered
        size="small"
      />
      <Paragraph style={{ color: "white" }}>
        Bonus points are also awarded for defeating AI opponents or achieving a perfect match:
      </Paragraph>
      <ul className={styles.bonusList}>
        <li><span className={styles.emoji}>🤖</span> +4 for 1st place vs at least one hard AI</li>
        <li><span className={styles.emoji}>🤖</span> +2 for 1st place vs at least one medium AI</li>
        <li><span className={styles.emoji}>🌟</span> +20 for a perfect match (0 points across all games)</li>
      </ul>
      <Paragraph style={{ color: "white" }}>
        <em>
          Match stats tracked include: <strong>matches played</strong> and <strong>average match ranking</strong>.
        </em>
      </Paragraph>
    </div>
  );
}
