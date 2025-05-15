"use client";

import { Button, Typography } from "antd";
import { useRouter } from "next/navigation";
import "@/styles/globals.css";
import styles from "@/styles/page.module.css";
import ScoringRules from "@/components/ScoringRules";

const { Title, Paragraph } = Typography;

// const _scoringData = [
//   { key: "1", card: "Each Heart", points: "1 point" },
//   { key: "2", card: "Queen of Spades", points: "13 points" },
//   { key: "3", card: "All other cards", points: "0 points" },
// ];

// const _scoringColumns = [
//   {
//     title: "Card",
//     dataIndex: "card",
//     key: "card",
//   },
//   {
//     title: "Points",
//     dataIndex: "points",
//     key: "points",
//   },
// ];

const RulesPage: React.FC = () => {
  const router = useRouter();

  return (
    <div
      className="contentContainer"
      style={{ maxWidth: 750, textAlign: "left" }}
    >
      <Title level={2} style={{ color: "white" }}>💡 How to Play Hearts</Title>
      <Paragraph style={{ color: "white" }}>
        Welcome to <strong>Hearts Attack!</strong>{" "}
        If you&apos;re new to the game, here&apos;s everything you need to know.
      </Paragraph>

      <Title level={3} style={{ color: "white" }}>🎮 Gameplay</Title>
      <Paragraph style={{ color: "white" }}>
        Hearts is a trick-taking card game played with 4 players. The{" "}
        <strong>GOAL</strong> is to avoid gaining points by{" "}
        <strong>NOT COLLECTING HEARTS ♥</strong> or the{" "}
        <strong>QUEEN OF SPADES ♠</strong>.
      </Paragraph>

      <Paragraph style={{ color: "white" }}>
        At the start of each match, every player receives{" "}
        <strong>13 CARDS</strong>. Matches are played over{" "}
        <strong>13 ROUNDS</strong>, and in each round, players take turns
        playing one card at a time.
      </Paragraph>

      <Paragraph style={{ color: "white" }}>
        Before the <strong>first round</strong> begins, each player selects{" "}
        <strong>3 cards</strong> from their hand to pass to another player.
      </Paragraph>

      <Paragraph style={{ color: "white", marginBottom: "0.5em" }}>
        <strong>Round 1:</strong> Pass to the player on your{" "}
        <strong>left</strong>.
        <br />
        <strong>Round 2:</strong> Pass to the player seated{" "}
        <strong>across</strong> from you.
        <br />
        <strong>Round 3:</strong> Pass to the player on your{" "}
        <strong>right</strong>.
        <br />
        <strong>Round 4:</strong> <em>No passing</em>.
      </Paragraph>

      <Paragraph style={{ color: "white" }}>
        From Round 5 onward, this pattern repeats. After passing, you&apos;ll receive
        {" "}
        <strong>3 cards</strong>{" "}
        from another player, so you&apos;ll hold a full hand of{" "}
        <strong>13 cards</strong>.
      </Paragraph>

      <Paragraph style={{ color: "white" }}>
        The player holding the <strong>Two of Clubs ♣</strong>{" "}
        must start the first trick by playing that card. All other players must
        follow suit (i.e., play a Club ♣) if they can.
      </Paragraph>

      <Paragraph style={{ color: "white" }}>
        <strong>Hearts</strong> and the <strong>Queen of Spades ♠</strong>{" "}
        cannot be played during the first round — even if a player has no Clubs.
      </Paragraph>

      <Paragraph style={{ color: "white" }}>
        In all other rounds, players must follow suit if possible. If they
        cannot, they may play any other card.
      </Paragraph>

      <Paragraph style={{ color: "white" }}>
        This group of four played cards is called a{" "}
        <strong>TRICK</strong>. The player who plays the{" "}
        <strong>HIGHEST CARD</strong>{" "}
        in the lead suit (the suit of the first card played){" "}
        <strong>WINS THE TRICK</strong> and <strong>COLLECTS</strong>{" "}
        the 4 cards.
      </Paragraph>

      <Paragraph style={{ color: "white" }}>
        The <strong>WINNER</strong>{" "}
        of the trick leads the next round with a card of their choice — unless
        that card is a heart and Hearts haven&apos;t been &quot;broken&quot;
        yet.
      </Paragraph>

      <Paragraph style={{ color: "white" }}>
        <strong>💔 BREAKING HEARTS:</strong>{" "}
        You cannot lead a trick with a Heart card until someone has already
        played a Heart in a previous trick (because they couldn&apos;t follow
        suit). This is known as “breaking hearts”.
      </Paragraph>

      <Paragraph style={{ color: "white" }}>
        After all 13 tricks in a round are completed, each player counts the
        cards they have won.
        <br />
        - Every <strong>Heart</strong> is worth <strong>1 point</strong>.
        <br />
        - The <strong>Queen of Spades</strong> is worth{" "}
        <strong>13 points</strong>.
        <br />
        These points are added to your total score for the game.
      </Paragraph>

      <Paragraph style={{ color: "white" }}>
        The match continues until all 13 rounds are played. The player with the
        {" "}
        <strong>LOWEST TOTAL SCORE</strong> at the end is the winner.
      </Paragraph>

      <Paragraph style={{ color: "white" }}>
        <strong>🌙 SHOOTING THE MOON:</strong> If you manage to collect{" "}
        <strong>ALL 13 HEARTS</strong> and the <strong>QUEEN OF SPADES</strong>
        {" "}
        in a single round, you &quot;shoot the moon&quot;! Instead of getting 26
        points, you get <strong>0</strong>{" "}
        and everyone else gets 26 points. It&apos;s a bold and risky move — but
        it can turn the game around!
      </Paragraph>

      <Title level={2} style={{ color: "white" }}>📊 Scoring</Title>
      <Paragraph
        style={{ color: "white", fontSize: "1rem", marginBottom: "0.5rem" }}
      >
        In <strong>Hearts Attack</strong>, you generally want to{" "}
        <strong>avoid scoring during the game</strong>. However, for Player
        Stats and leaderboards, you can earn points for various accomplishments.
        These achievements — like{" "}
        <strong>winning games or matches, shooting the moon,</strong>{" "}
        and more — are detailed below.
      </Paragraph>

      <ScoringRules />

      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "12px" }}
      >
        <Button
          block
          className={styles.whiteButton}
          onClick={() => router.back()}
        >
          Back
        </Button>
      </div>
    </div>
  );
};

export default RulesPage;
