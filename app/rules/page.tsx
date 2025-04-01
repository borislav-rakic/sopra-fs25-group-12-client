"use client";

import { Button, Card, Table, Typography } from "antd";
import { useRouter } from "next/navigation";

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
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <Card variant="borderless">
        <Title level={2}>💡 How to Play Hearts</Title>
        <Paragraph>
          Welcome to <strong>Hearts Attack!</strong>{" "}
          If you&apos;re new to the game, here&apos;s everything you need to
          know.
        </Paragraph>

        <Title level={3}>🎮 Gameplay</Title>
        <Paragraph>
          Hearts is a trick-taking card game played with 4 players. The goal is
          to avoid gaining points by **not collecting Hearts** or the **Queen of
          Spades**.
        </Paragraph>

        <Paragraph>
          At the start of each match, every player receives{" "}
          <strong>13 cards</strong>. Matches are played over{" "}
          <strong>13 rounds</strong>, and in each round, players take turns
          playing one card at a time.
        </Paragraph>

        <Paragraph>
          Before the first round begins, each player selects{" "}
          <strong>3 cards</strong> from their hand to pass to another player:
          <br />
          <strong>Round 1</strong> → Pass to the player on your right
          <br />
          <strong>Round 2</strong> → Pass to the next player clockwise
          <br />
          <strong>Round 3</strong> → Continue rotating
          <br />
          After passing, you&apos;ll receive 3 cards from another player.
        </Paragraph>

        <Paragraph>
          The player holding the <strong>2♣ (Two of Clubs)</strong>{" "}
          always starts the first round by playing that card. The other players
          must follow suit (play a ♣ club) if they can. If they don&apos;t have
          that suit, they can play any other card.
        </Paragraph>

        <Paragraph>
          This group of four played cards is called a{" "}
          <strong>trick</strong>. The player who plays the highest card in the
          lead suit (the suit of the first card played){" "}
          <strong>wins the trick</strong> and collects the 4 cards.
        </Paragraph>

        <Paragraph>
          The winner of the trick leads the next round with a card of their
          choice — unless that card is a Heart and Hearts haven&apos;t been
          &quot;broken&quot; yet.
        </Paragraph>

        <Paragraph>
          <strong>💔 Breaking Hearts:</strong>{" "}
          You cannot lead a trick with a Heart card until someone has already
          played a Heart in a previous trick (because they couldn&apos;t follow
          suit). This is known as “breaking hearts”.
        </Paragraph>

        <Paragraph>
          After each of the 13 rounds, the cards a player has won in tricks are
          counted. Any Hearts in those tricks are worth{" "}
          <strong>1 point</strong>, and the Queen of Spades is worth{" "}
          <strong>13 points</strong>. Your total score increases by this amount.
        </Paragraph>

        <Paragraph>
          The match continues until all 13 rounds are played. The player with
          the <strong>lowest total score</strong> at the end is the winner.
        </Paragraph>

        <Paragraph>
          <strong>🌙 Shooting the Moon:</strong> If you manage to collect{" "}
          <strong>all 13 Hearts</strong> and the{" "}
          <strong>Queen of Spades</strong>{" "}
          in a single round, you &quot;shoot the moon&quot;! Instead of getting
          26 points, you get <strong>0</strong> and{" "}
          <strong>everyone else gets 26 points</strong>. It&apos;s a bold and
          risky move — but it can turn the game around!
        </Paragraph>

        <Title level={3}>📊 Scoring</Title>
        <Table
          columns={scoringColumns}
          dataSource={scoringData}
          pagination={false}
          bordered
          size="small"
          style={{ fontSize: "14px" }}
        />

        <Title level={3}>📈 Track Your Progress</Title>
        <Paragraph>
          Logged-in players can view their:
          <br />- Win/loss history
          <br />- Average score
          <br />- Leaderboard rank
          <br />
          Guest players can play, but their stats are not saved.
        </Paragraph>
      </Card>
      <Button
        className="back-button"
        onClick={() => router.back()}
      >
        Back
      </Button>
    </div>
  );
};

export default RulesPage;
