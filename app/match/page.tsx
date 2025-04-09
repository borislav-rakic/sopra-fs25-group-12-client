"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering
import "@ant-design/v5-patch-for-react-19";
import { useRouter /*useParams*/ } from "next/navigation";
import Image from "next/image";
import { Button /* , Row, Col, Space */ } from "antd";
// import { BookOutlined, CodeOutlined, GlobalOutlined } from "@ant-design/icons";
import styles from "@/styles/page.module.css";
// import { useApi } from "@/hooks/useApi";
// import { Match } from "@/types/match";
import { JSX, useEffect, useState } from "react";
import SettingsPopup from "../components/SettingsPopup";
import Card from "../components/card";

const MatchPage: React.FC = () => {
  const router = useRouter();
  // const apiService = useApi();

  const [cardsInHand, setCardsInHand] = useState([
    {
      code: "AS",
      suit: "Spades",
      value: BigInt(1),
      image: "https://deckofcardsapi.com/static/img/AS.png",
      onClick: (code: string) => {
        console.log(`Card clicked: ${code}`);
      },
    },
    {
      code: "KH",
      suit: "Hearts",
      value: BigInt(13),
      image: "https://deckofcardsapi.com/static/img/KH.png",
      onClick: (code: string) => {
        console.log(`Card clicked: ${code}`);
      },
    },
  ]);


  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [playmat, setPlaymat] = useState("");
  const [cardback, setCardback] = useState("");

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
            onClick: (code: string) => {
              console.log(`Card clicked: ${code}`);
            },
          },
        ])
      }
        >
          test
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
                <td>Player 1</td>
                <td>10</td>
              </tr>
              <tr>
                <td>Player 2</td>
                <td>15</td>
              </tr>
              <tr>
                <td>Player 3</td>
                <td>20</td>
              </tr>
              <tr>
                <td>Player 4</td>
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
            onClick={card.onClick}
          />))}
        </div>

        <div className="hand-1">
          <Image
            className="playingcard-back"
            src="https://deckofcardsapi.com/static/img/back.png"
            alt="playingcard-back"
            width={113}
            height={157}
          />
          <Image
            className="playingcard-back"
            src="https://deckofcardsapi.com/static/img/back.png"
            alt="playingcard-back"
            width={113}
            height={157}
          />
          <Image
            className="playingcard-back"
            src="https://deckofcardsapi.com/static/img/back.png"
            alt="playingcard-back"
            width={113}
            height={157}
          />
          <Image
            className="playingcard-back"
            src="https://deckofcardsapi.com/static/img/back.png"
            alt="playingcard-back"
            width={113}
            height={157}
          />
          <Image
            className="playingcard-back"
            src="https://deckofcardsapi.com/static/img/back.png"
            alt="playingcard-back"
            width={113}
            height={157}
          />
          <Image
            className="playingcard-back"
            src="https://deckofcardsapi.com/static/img/back.png"
            alt="playingcard-back"
            width={113}
            height={157}
          />
          <Image
            className="playingcard-back"
            src="https://deckofcardsapi.com/static/img/back.png"
            alt="playingcard-back"
            width={113}
            height={157}
          />
          <Image
            className="playingcard-back"
            src="https://deckofcardsapi.com/static/img/back.png"
            alt="playingcard-back"
            width={113}
            height={157}
          />
          <Image
            className="playingcard-back"
            src="https://deckofcardsapi.com/static/img/back.png"
            alt="playingcard-back"
            width={113}
            height={157}
          />
          <Image
            className="playingcard-back"
            src="https://deckofcardsapi.com/static/img/back.png"
            alt="playingcard-back"
            width={113}
            height={157}
          />
          <Image
            className="playingcard-back"
            src="https://deckofcardsapi.com/static/img/back.png"
            alt="playingcard-back"
            width={113}
            height={157}
          />
          <Image
            className="playingcard-back"
            src="https://deckofcardsapi.com/static/img/back.png"
            alt="playingcard-back"
            width={113}
            height={157}
          />
          <Image
            className="playingcard-back"
            src="https://deckofcardsapi.com/static/img/back.png"
            alt="playingcard-back"
            width={113}
            height={157}
          />
        </div>

        <div className="hand-2">
          <Image
            className="playingcard-back"
            src="https://deckofcardsapi.com/static/img/back.png"
            alt="playingcard-back"
            width={113}
            height={157}
          />
          <Image
            className="playingcard-back"
            src="https://deckofcardsapi.com/static/img/back.png"
            alt="playingcard-back"
            width={113}
            height={157}
          />
          <Image
            className="playingcard-back"
            src="https://deckofcardsapi.com/static/img/back.png"
            alt="playingcard-back"
            width={113}
            height={157}
          />
          <Image
            className="playingcard-back"
            src="https://deckofcardsapi.com/static/img/back.png"
            alt="playingcard-back"
            width={113}
            height={157}
          />
          <Image
            className="playingcard-back"
            src="https://deckofcardsapi.com/static/img/back.png"
            alt="playingcard-back"
            width={113}
            height={157}
          />
          <Image
            className="playingcard-back"
            src="https://deckofcardsapi.com/static/img/back.png"
            alt="playingcard-back"
            width={113}
            height={157}
          />
          <Image
            className="playingcard-back"
            src="https://deckofcardsapi.com/static/img/back.png"
            alt="playingcard-back"
            width={113}
            height={157}
          />
          <Image
            className="playingcard-back"
            src="https://deckofcardsapi.com/static/img/back.png"
            alt="playingcard-back"
            width={113}
            height={157}
          />
          <Image
            className="playingcard-back"
            src="https://deckofcardsapi.com/static/img/back.png"
            alt="playingcard-back"
            width={113}
            height={157}
          />
          <Image
            className="playingcard-back"
            src="https://deckofcardsapi.com/static/img/back.png"
            alt="playingcard-back"
            width={113}
            height={157}
          />
          <Image
            className="playingcard-back"
            src="https://deckofcardsapi.com/static/img/back.png"
            alt="playingcard-back"
            width={113}
            height={157}
          />
          <Image
            className="playingcard-back"
            src="https://deckofcardsapi.com/static/img/back.png"
            alt="playingcard-back"
            width={113}
            height={157}
          />
          <Image
            className="playingcard-back"
            src="https://deckofcardsapi.com/static/img/back.png"
            alt="playingcard-back"
            width={113}
            height={157}
          />
        </div>

        <div className="hand-3">
          <Image
            className="playingcard-back"
            src="https://deckofcardsapi.com/static/img/back.png"
            alt="playingcard-back"
            width={113}
            height={157}
          />
          <Image
            className="playingcard-back"
            src="https://deckofcardsapi.com/static/img/back.png"
            alt="playingcard-back"
            width={113}
            height={157}
          />
          <Image
            className="playingcard-back"
            src="https://deckofcardsapi.com/static/img/back.png"
            alt="playingcard-back"
            width={113}
            height={157}
          />
          <Image
            className="playingcard-back"
            src="https://deckofcardsapi.com/static/img/back.png"
            alt="playingcard-back"
            width={113}
            height={157}
          />
          <Image
            className="playingcard-back"
            src="https://deckofcardsapi.com/static/img/back.png"
            alt="playingcard-back"
            width={113}
            height={157}
          />
          <Image
            className="playingcard-back"
            src="https://deckofcardsapi.com/static/img/back.png"
            alt="playingcard-back"
            width={113}
            height={157}
          />
          <Image
            className="playingcard-back"
            src="https://deckofcardsapi.com/static/img/back.png"
            alt="playingcard-back"
            width={113}
            height={157}
          />
          <Image
            className="playingcard-back"
            src="https://deckofcardsapi.com/static/img/back.png"
            alt="playingcard-back"
            width={113}
            height={157}
          />
          <Image
            className="playingcard-back"
            src="https://deckofcardsapi.com/static/img/back.png"
            alt="playingcard-back"
            width={113}
            height={157}
          />
          <Image
            className="playingcard-back"
            src="https://deckofcardsapi.com/static/img/back.png"
            alt="playingcard-back"
            width={113}
            height={157}
          />
          <Image
            className="playingcard-back"
            src="https://deckofcardsapi.com/static/img/back.png"
            alt="playingcard-back"
            width={113}
            height={157}
          />
          <Image
            className="playingcard-back"
            src="https://deckofcardsapi.com/static/img/back.png"
            alt="playingcard-back"
            width={113}
            height={157}
          />
          <Image
            className="playingcard-back"
            src="https://deckofcardsapi.com/static/img/back.png"
            alt="playingcard-back"
            width={113}
            height={157}
          />
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
          <div className="game-playername">Player 1</div>
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
          <div className="game-playername">Player 2</div>
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
          <div className="game-playername">Player 3</div>
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
          <div className="game-playername">Player 4</div>
          <div className="game-playerscore">Score: 25</div>
        </div>
      </div>
    </div>
  );
};

export default MatchPage;
