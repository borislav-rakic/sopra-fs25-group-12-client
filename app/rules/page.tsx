"use client";

import { Button, Table, Typography } from "antd";
import { useRouter } from "next/navigation";
import "@/styles/globals.css";
import styles from "@/styles/page.module.css";

const { Title, Paragraph } = Typography;

const scoringData = [
  { key: "1", card: "Each Heart", points: "1 point" },
  { key: "2", card: "Queen of Spades", points: "13 points" },
  { key: "3", card: "Other cards", points: "0 points" },
];

const scoringColumns = [
  {
    title: "Card",
    dataIndex: "card",
    key: "card",
  },
  {
    title: "Points",
    dataIndex: "points",
    key: "points",
  },
];

const RulesPage: React.FC = () => {
  const router = useRouter();

  return (
      <div className="contentContainer" style={{ textAlign: "left" }}>
        <Title level={2} style={{ color: "white" }}>💡 How to Play Hearts</Title>
        <Paragraph style={{ color: "white" }}>
          Welcome to <strong>Hearts Attack!</strong> If you&apos;re new to the game, here&apos;s everything you need to know.
        </Paragraph>
  
        <Title level={3} style={{ color: "white" }}>🎮 Gameplay</Title>
        <Paragraph style={{ color: "white" }}>
          Hearts is a trick-taking card game played with 4 players. The <strong>GOAL</strong> is to avoid gaining points by <strong>NOT COLLECTING HEARTS ♥ </strong> or the <strong>QUEEN OF SPADES ♠</strong>.
        </Paragraph>

        <Paragraph style={{ color: "white" }}>
          At the start of each match, every player receives <strong>13 CARDS</strong>. Matches are played over <strong>13 ROUNDS</strong>, and in each round, players take turns playing one card at a time.
        </Paragraph>
  
        <Paragraph style={{ color: "white" }}>
          Before the <strong>FIRST ROUND</strong> begins, each player selects <strong>3 CARDS</strong> from their hand to pass to another player:
          <br />
          <strong>Round 1</strong> → Pass to the player on your right
          <br />
          <strong>Round 2</strong> → Pass to the next player clockwise
          <br />
          <strong>Round 3</strong> → Continue rotating...
          <br />
          After passing, you&apos;ll receive 3 cards from another player.
        </Paragraph>
  
        <Paragraph style={{ color: "white" }}>
          The player holding the <strong>TWO OF CLUBS ♣ </strong> always starts the first round by playing that card. The other players must follow suit (play a club ♣) if they can. If they don&apos;t have that suit, they can play any other card.
        </Paragraph>
  
        <Paragraph style={{ color: "white" }}>
          This group of four played cards is called a <strong>TRICK</strong>. The player who plays the <strong> HIGHEST CARD</strong> in the lead suit (the suit of the first card played) <strong>WINS THE TRICK</strong> and <strong>COLLECTS</strong> the 4 cards.
        </Paragraph>
  
        <Paragraph style={{ color: "white" }}>
          The <strong> WINNER</strong> of the trick leads the next round with a card of their choice — unless that card is a heart and Hearts haven&apos;t been &quot;broken&quot; yet.
        </Paragraph>
  
        <Paragraph style={{ color: "white" }}>
          <strong>💔 BREAKING HEARTS:</strong> You cannot lead a trick with a Heart card until someone has already played a Heart in a previous trick (because they couldn&apos;t follow suit). This is known as “breaking hearts”.
        </Paragraph>
  
        <Paragraph style={{ color: "white" }}>
          After each of the 13 rounds, the cards a player has won in tricks are counted. Any Hearts in those tricks are worth <strong>1 point</strong>, and the Queen of Spades is worth <strong>13 points</strong>. Your total score increases by this amount.
        </Paragraph>
  
        <Paragraph style={{ color: "white" }}>
          The match continues until all 13 rounds are played. The player with the <strong>LOWEST TOTAL SCORE</strong> at the end is the winner.
        </Paragraph>
  
        <Paragraph style={{ color: "white" }}>
          <strong>🌙 SHOOTING THE MOON:</strong> If you manage to collect <strong>ALL 13 HEARTS</strong> and the <strong>QUEEN OF SPADES</strong> in a single round, you &quot;shoot the moon&quot;! Instead of getting 26 points, you get <strong>0</strong> and everyone else gets 26 points. It&apos;s a bold and risky move — but it can turn the game around!
        </Paragraph>
  
        <Title level={3} style={{ color: "white" }}>📊 Scoring</Title>
        <Table
          columns={scoringColumns}
          dataSource={scoringData}
          pagination={false}
          bordered
          size="small"
          className="rules-table"
        />
  
        <div style={{ display: "flex", justifyContent: "center", marginTop: "24px" }}>
          <Button block className={styles.whiteButton}
            onClick={() => router.back()}
          >
            Back
          </Button>
        </div>
      </div>
  );
}  

export default RulesPage;
