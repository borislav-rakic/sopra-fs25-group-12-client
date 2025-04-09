"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering
import "@ant-design/v5-patch-for-react-19";
import { useParams/*, useRouter */ } from "next/navigation";
import Image from "next/image";
import { Button /* , Row, Col, Space */ } from "antd";
// import { BookOutlined, CodeOutlined, GlobalOutlined } from "@ant-design/icons";
import styles from "@/styles/page.module.css";
import { useApi } from "@/hooks/useApi";
// import { Match } from "@/types/match";
import { useEffect, useState } from "react";
import { PlayerMatchInformation } from "@/types/playerMatchInformation";
import SettingsPopup from "@/components/SettingsPopup";
import Card, { cardProps } from "@/components/card";

const MatchPage: React.FC = () => {
  //const router = useRouter();
  const params = useParams();
  const apiService = useApi();

  const matchId = params?.id?.toString();

  const [cardsInHand, setCardsInHand] = useState<cardProps[]>([]);
  const [opponent1Cards, setOpponent1Cards] = useState<cardProps[]>([]);
  const [opponent2Cards, setOpponent2Cards] = useState<cardProps[]>([]);
  const [opponent3Cards, setOpponent3Cards] = useState<cardProps[]>([]);
  const [players, setPlayers] = useState<Array<string | null>>([
    null,
    null,
    null,
    null,
  ]);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [playmat, setPlaymat] = useState("");
  const [cardback, setCardback] = useState("");

  // let playerHand = document.getElementById("hand-0");

  useEffect(() => {
    // This function runs every 5 seconds to receive the current match information.
    const matchRefreshIntervalId = setInterval(async () => {
      console.log("Requesting match update...");

      try {
        const response = await apiService.post<PlayerMatchInformation>(
          `/matches/${matchId}/logic`,
          {},
        );

        console.log(response);

        if (response.matchPlayers) {
          setPlayers(response.matchPlayers);
        }
      } catch (error) {
        console.error(
          `Failed to fetch match data for matchId ${matchId}:`,
          error,
        );
      }
    }, 5000);

    // When the component unmounts, this stops the function mapped to matchRefreshIntervalId from running every 5 seconds.
    return () => {
      clearInterval(matchRefreshIntervalId);
      console.log("Interval cleared.");
    };
  }, [apiService, matchId]);


  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };


  // sets default settings and sets them to local storage, unless they already exist
  useEffect(() => {
    if (localStorage.getItem("playmat")) {
      setPlaymat(localStorage.getItem("playmat") || "");
    } else {
        setPlaymat("Green"); // Default playmat
        localStorage.setItem("playmat", "Green");
        }
    if (localStorage.getItem("cardback")) {
      setCardback(localStorage.getItem("cardback") || "");
    } else {
        setCardback("Default"); // Default cardback
        localStorage.setItem("cardback", "Default");
        }   
  }, []);

  useEffect(() => {
    console.log(`Playmat changed to: ${playmat}`);
    const gameboard = document.getElementsByClassName("gameboard")[0] as HTMLElement;
    if (gameboard) {
      gameboard.style.backgroundColor = playmat.toLowerCase();
    }
  }, [playmat]);

/* 
  useEffect(() => {
    console.log(`Cardback changed to: ${cardback}`);
    const cardbacks = document.getElementsByClassName("playingcard-back") as HTMLCollectionOf<HTMLElement>;
    for (let i = 0; i < cardbacks.length; i++) {
      cardbacks[i].style.backgroundImage = `url(${cardback})`;
    }
  }, [cardback]);

 */  // let playerHand = document.getElementById("hand-0");

  return (
    <div className={`${styles.page} matchPage`}>
      <div className="gear-icon">
        <Image
          src="/setting-gear.svg"
          alt="Settings"
          width={100}
          height={100}
          onClick={() => {toggleSettings()}}
        />
      </div>

      <SettingsPopup 
      isOpen={isSettingsOpen} 
      onClose={toggleSettings} 
      playmat={playmat}
      setPlaymat={setPlaymat}
      cardback={cardback}
      setCardback={setCardback}
      />

      <div
        className="matchtester"
        draggable={true}
        style={{
          width: "100px",
          height: "100px",
          position: "absolute",
          top: "100px",
          left: "10px",
        }}
      >
        <Button
        onClick={() =>
        setCardsInHand([
          ...cardsInHand, // Keep the existing cards
          {
            code: "2H", // Example: Two of Hearts
            suit: "Hearts",
            value: BigInt(2),
            image: "https://deckofcardsapi.com/static/img/2H.png", // Example image URL
            flipped: true,
            backimage: cardback,
            onClick: (code: string) => {
              console.log(`Card clicked: ${code}`);
            },
          },
        ])
      }
        >
          test
        </Button>

        <Button
        onClick={() =>
        setOpponent1Cards([
          ...opponent1Cards, // Keep the existing cards
          {
            code: "2H", // Example: Two of Hearts
            suit: "Hearts",
            value: BigInt(2),
            image: "https://deckofcardsapi.com/static/img/2H.png", // Example image URL
            flipped: false,
            backimage: cardback,
            onClick: (code: string) => {
              console.log(`Card clicked: ${code}`);
            },
          },
        ])
      }
        >
          testAddOpponent1Card
        </Button>

        <Button
        onClick={() =>
        setOpponent2Cards([
          ...opponent2Cards, // Keep the existing cards
          {
            code: "2H", // Example: Two of Hearts
            suit: "Hearts",
            value: BigInt(2),
            image: "https://deckofcardsapi.com/static/img/2H.png", // Example image URL
            flipped: false,
            backimage: cardback,
            onClick: (code: string) => {
              console.log(`Card clicked: ${code}`);
            },
          },
        ])
      }
        >
          testAddOpponent2Card
        </Button>

                <Button
        onClick={() =>
        setOpponent3Cards([
          ...opponent3Cards, // Keep the existing cards
          {
            code: "2H", // Example: Two of Hearts
            suit: "Hearts",
            value: BigInt(2),
            image: "https://deckofcardsapi.com/static/img/2H.png", // Example image URL
            flipped: false,
            backimage: cardback,
            onClick: (code: string) => {
              console.log(`Card clicked: ${code}`);
            },
          },
        ])
      }
        >
          testAddOpponent3Card
        </Button>        
      </div>

      <div className="gameboard">
        <div className="score-table">
          <table>
            <thead>
              <tr>
                <th>Player</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{players[0] ? players[0] : "AI Player"}</td>
                <td>10</td>
              </tr>
              <tr>
                <td>{players[1] ? players[1] : "AI Player"}</td>
                <td>15</td>
              </tr>
              <tr>
                <td>{players[2] ? players[2] : "AI Player"}</td>
                <td>20</td>
              </tr>
              <tr>
                <td>{players[3] ? players[3] : "AI Player"}</td>
                <td>25</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="hand-0">
          {cardsInHand.map((card, index) => (
            <Card
            key={index}
            code={card.code}
            suit={card.suit}
            value={card.value}
            image={card.image}
            backimage={cardback}
            flipped={true}
            onClick={card.onClick}
          />))}
        </div>

        <div className="hand-1">
        {opponent1Cards.map((card, index) => (
            <Card
            key={index}
            code={card.code}
            suit={card.suit}
            value={card.value}
            image={card.image}
            backimage={cardback}
            flipped={false}
            onClick={card.onClick}
          />))}
        </div>

        <div className="hand-2">
        {opponent2Cards.map((card, index) => (
            <Card
            key={index}
            code={card.code}
            suit={card.suit}
            value={card.value}
            image={card.image}
            backimage={cardback}
            flipped={false}
            onClick={card.onClick}
          />))}
        </div>

        <div className="hand-3">
        {opponent3Cards.map((card, index) => (
            <Card
            key={index}
            code={card.code}
            suit={card.suit}
            value={card.value}
            image={card.image}
            backimage={cardback}
            flipped={false}
            onClick={card.onClick}
          />))}
        </div>

        <div className="pile">
          <Image
            className="playingcard-pile-0"
            src="https://deckofcardsapi.com/static/img/AS.png"
            alt="PLACEHOLDER"
            width={113}
            height={157}
          />
          <Image
            className="playingcard-pile-1"
            src="https://deckofcardsapi.com/static/img/AS.png"
            alt="PLACEHOLDER"
            width={113}
            height={157}
          />
          <Image
            className="playingcard-pile-2"
            src="https://deckofcardsapi.com/static/img/AS.png"
            alt="PLACEHOLDER"
            width={113}
            height={157}
          />
          <Image
            className="playingcard-pile-3"
            src="https://deckofcardsapi.com/static/img/AS.png"
            alt="PLACEHOLDER"
            width={113}
            height={157}
          />
        </div>

        <div className="game-playerscore0">
          <div className="game-avatarbox">
            <Image
              className="player-avatar"
              src="/avatars/actor-chaplin-comedy.png"
              alt="avatar"
              width={72}
              height={72}
            />
          </div>
          <div className="game-playername">
            {players[0] ? players[0] : "AI Player"}
          </div>
          <div className="game-playerscore">Score: 10</div>
        </div>

        <div className="game-playerscore1">
          <div className="game-avatarbox">
            <Image
              className="player-avatar"
              src="/avatars/addicted-draw-love.png"
              alt="avatar"
              width={72}
              height={72}
            />
          </div>
          <div className="game-playername">
            {players[1] ? players[1] : "AI Player"}
          </div>
          <div className="game-playerscore">Score: 15</div>
        </div>

        <div className="game-playerscore2">
          <div className="game-avatarbox">
            <Image
              className="player-avatar"
              src="/avatars/afro-avatar-male.png"
              alt="avatar"
              width={72}
              height={72}
            />
          </div>
          <div className="game-playername">
            {players[2] ? players[2] : "AI Player"}
          </div>
          <div className="game-playerscore">Score: 20</div>
        </div>

        <div className="game-playerscore3">
          <div className="game-avatarbox">
            <Image
              className="player-avatar"
              src="/avatars/alien-avatar-space.png"
              alt="avatar"
              width={72}
              height={72}
            />
          </div>
          <div className="game-playername">
            {players[3] ? players[3] : "AI Player"}
          </div>
          <div className="game-playerscore">Score: 25</div>
        </div>
      </div>
    </div>
  );
};

export default MatchPage;
