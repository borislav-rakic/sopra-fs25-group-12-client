"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering
import "@ant-design/v5-patch-for-react-19";
import { useParams /*, useRouter */ } from "next/navigation";
import Image from "next/image";
import { Button /* , Row, Col, Space */ } from "antd";
// import { BookOutlined, CodeOutlined, GlobalOutlined } from "@ant-design/icons";
import styles from "@/styles/page.module.css";
import { useApi } from "@/hooks/useApi";
// import { Match } from "@/types/match";
import { use, useEffect, useState } from "react";
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
  const [trickSlot0, setTrickSlot0] = useState<cardProps[]>([]);
  const [trickSlot1, setTrickSlot1] = useState<cardProps[]>([]);
  const [trickSlot2, setTrickSlot2] = useState<cardProps[]>([]);
  const [trickSlot3, setTrickSlot3] = useState<cardProps[]>([]);

  const [currentTrick, setCurrentTrick] = useState("");
  const [currentPlayer, setCurrentPlayer] = useState("");
  const [currentGamePhase, setCurrentGamePhase] = useState("");
  const [cardsToPass, setCardsToPass] = useState<cardProps[]>([]);
  const [opponentToPassTo, setOpponentToPassTo] = useState("");

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
    const gameboard = document.getElementsByClassName(
      "gameboard",
    )[0] as HTMLElement;
    if (gameboard) {
      gameboard.style.backgroundColor = playmat.toLowerCase();
    }
  }, [playmat]);

  const handlePlayCard = (card: cardProps) => {
    console.log("Selected card in Match Page:", card.code);

    if (currentGamePhase === "passing"){
      if (cardsToPass.find((c) => c.code === card.code)) {
        setCardsToPass(cardsToPass.filter((c) => c.code !== card.code));
        console.log("removed card from cardsToPass: ", card.code);
        console.log("cardsToPass: ", cardsToPass);
      } else if(cardsToPass.length < 3) {
        setCardsToPass([...cardsToPass, card]);
        console.log("added card to cardsToPass: ", card.code);
        console.log("cardsToPass: ", cardsToPass);
      } else {
        console.log("You may not pass more than 3 cards.");
      }

    } else if (currentGamePhase === "playing") {
      if (currentPlayer === "User1") {
        const updatedCardsInHand = cardsInHand.filter((c) => c.code !== card.code);
        const updatedTrick0 = [card];
    
        setCardsInHand(updatedCardsInHand);
        setTrickSlot0(updatedTrick0);

      } else {
        console.log("You may not play cards while it is not your turn.");
      }

    } else {
      console.log("currently unused game phase option")
    }
  }

  const handlePassCards = () => {
    if(cardsToPass.length < 3) {
      console.log("You must pass 3 cards.");
    } else {
      const updatedCardsInHand = cardsInHand.filter((c) => !cardsToPass.some((card) => card.code === c.code));
      
      if (opponentToPassTo === "Opponent1") {
        const updatedEnemyHand = opponent1Cards.concat(cardsToPass);
        setOpponent1Cards(updatedEnemyHand);
      } else if(opponentToPassTo === "Opponent2") {
        const updatedEnemyHand = opponent2Cards.concat(cardsToPass);
        setOpponent2Cards(updatedEnemyHand);
      } else if(opponentToPassTo === "Opponent3") {
        const updatedEnemyHand = opponent3Cards.concat(cardsToPass);
        setOpponent3Cards(updatedEnemyHand);
      } 
      
      setCardsInHand(updatedCardsInHand);
      setCardsToPass([]);
      setCurrentGamePhase("playing");
    }
  }

  const handleClearTrick = () => {
    setTrickSlot0([]);
    setTrickSlot1([]);
    setTrickSlot2([]);
    setTrickSlot3([]);
  };

  const sortCards = (cards: cardProps[]) => {
    return cards.sort((a, b) => {
      console.log("Comparing cards:", a.code, " | ", b.code);
      if (a.suit < b.suit) {return -1;}
      if (a.suit > b.suit) {return 1;}

      if (a.value < b.value) {return -1;}
      if (a.value > b.value) {return 1;}

      return 0;
    });
  }

  useEffect(() => {
    const sortedCards = sortCards(cardsInHand);
    setCardsInHand(sortedCards);
  }, [cardsInHand]);

  return (
    <div className={`${styles.page} matchPage`}>
      <div className="gear-icon">
        <Image
          src="/setting-gear.svg"
          alt="Settings"
          width={100}
          height={100}
          onClick={() => {
            toggleSettings();
          }}
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
                onClick: () => {},
              },
            ])}
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
            ])}
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
            ])}
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
            ])}
        >
          testAddOpponent3Card
        </Button>

        <Button
          onClick={() =>
            setTrickSlot1([
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
            ])}
        >
          testAddTrick1Card
        </Button>

        <Button
          onClick={() =>
            setTrickSlot2([
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
            ])}
        >
          testAddTrick2Card
        </Button>

        <Button
          onClick={() =>
            setTrickSlot3([
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
            ])}
        >
          testAddTrick3Card
        </Button>

        <Button
          onClick={() => handleClearTrick()}
        >
          EmptyTrick
        </Button>

        <Button
          onClick={() =>
            setCardsInHand([
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
              {
                code: "5H", // Example: Two of Hearts
                suit: "Hearts",
                value: BigInt(5),
                image: "https://deckofcardsapi.com/static/img/5H.png", // Example image URL
                flipped: false,
                backimage: cardback,
                onClick: (code: string) => {
                  console.log(`Card clicked: ${code}`);
                },
              },
              {
                code: "QS", // Example: Two of Hearts
                suit: "Spades",
                value: BigInt(12),
                image: "https://deckofcardsapi.com/static/img/QS.png", // Example image URL
                flipped: false,
                backimage: cardback,
                onClick: (code: string) => {
                  console.log(`Card clicked: ${code}`);
                },
              },
              {
                code: "3H", // Example: Two of Hearts
                suit: "Hearts",
                value: BigInt(3),
                image: "https://deckofcardsapi.com/static/img/3H.png", // Example image URL
                flipped: false,
                backimage: cardback,
                onClick: (code: string) => {
                  console.log(`Card clicked: ${code}`);
                },
              },
              {
                code: "4H", // Example: Two of Hearts
                suit: "Hearts",
                value: BigInt(4),
                image: "https://deckofcardsapi.com/static/img/4H.png", // Example image URL
                flipped: false,
                backimage: cardback,
                onClick: (code: string) => {
                  console.log(`Card clicked: ${code}`);
                },
              },
              {
                code: "7S", // Example: Two of Hearts
                suit: "Spades",
                value: BigInt(7),
                image: "https://deckofcardsapi.com/static/img/7S.png", // Example image URL
                flipped: false,
                backimage: cardback,
                onClick: (code: string) => {
                  console.log(`Card clicked: ${code}`);
                },
              },
              {
                code: "6H", // Example: Two of Hearts
                suit: "Hearts",
                value: BigInt(6),
                image: "https://deckofcardsapi.com/static/img/6H.png", // Example image URL
                flipped: false,
                backimage: cardback,
                onClick: (code: string) => {
                  console.log(`Card clicked: ${code}`);
                },
              },
              {
                code: "7C", 
                suit: "Clubs",
                value: BigInt(7),
                image: "https://deckofcardsapi.com/static/img/7C.png", 
                flipped: false,
                backimage: cardback,
                onClick: (code: string) => {
                  console.log(`Card clicked: ${code}`);
                },
              },
              {
                code: "3C", 
                suit: "Clubs",
                value: BigInt(3),
                image: "https://deckofcardsapi.com/static/img/3C.png", 
                flipped: false,
                backimage: cardback,
                onClick: (code: string) => {
                  console.log(`Card clicked: ${code}`);
                },
              },
              

            ])}
        >
          testAddVariousCards
        </Button>

        <Button
          onClick={() => {setCurrentGamePhase("passing"), console.log("Game phase set to passing")}}
        >
          setGamePhasePassing
        </Button>

        <Button
          onClick={() => {setCurrentGamePhase("playing"), console.log("Game phase set to playing")}}
        >
          setGamePhasePlaying
        </Button>

        <Button
          onClick={() => {setCurrentPlayer("User1"), console.log("Player set to User1")}}
        >
          setPlayerUser1
        </Button>

        <Button
          onClick={() => console.log("current cardsToPass: ", cardsToPass)}
        >
          logCardsToPass
          
        </Button>

        <Button
          onClick={() => {handlePassCards()}}
        >
          PassCardsToOpponent
          
        </Button>

        <Button
          onClick={() => {setOpponentToPassTo("Opponent1"), console.log("Opponent to pass to set to Opponent1")}}
        >
          SetOpponentToPassTo1
          
        </Button>

        <Button
          onClick={() => {setOpponentToPassTo("Opponent2"), console.log("Opponent to pass to set to Opponent2")}}
        >
          SetOpponentToPassTo2
          
        </Button>

        <Button
          onClick={() => {setOpponentToPassTo("Opponent3"), console.log("Opponent to pass to set to Opponent3")}}
        >
          SetOpponentToPassTo3
          
        </Button>

        <Button
          onClick={() => console.log(BigInt("7") > BigInt("13"))}
        >
          SetOpponentToPassTo3
          
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
              onClick={() => handlePlayCard(card)}
              isSelected={cardsToPass.some((c) => c.code === card.code)}
            />
          ))}
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
            />
          ))}
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
            />
          ))}
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
            />
          ))}
        </div>

        <div className="pile">
          <div className="playingcard-pile-0">
            {trickSlot0.map((card, index) => ( 
              <Card
                key={index}
                code={card.code}
                suit={card.suit}
                value={card.value}
                image={card.image}
                backimage={cardback}
                flipped={true}
                onClick={card.onClick}/>
            ))}
          </div>

          <div className="playingcard-pile-1">
            {trickSlot1.map((card, index) => ( 
              <Card
                key={index}
                code={card.code}
                suit={card.suit}
                value={card.value}
                image={card.image}
                backimage={cardback}
                flipped={true}
                onClick={card.onClick}/>
            ))}
          </div>
          <div className="playingcard-pile-2">
            {trickSlot2.map((card, index) => ( 
              <Card
                key={index}
                code={card.code}
                suit={card.suit}
                value={card.value}
                image={card.image}
                backimage={cardback}
                flipped={true}
                onClick={card.onClick}/>
            ))}
          </div>
          <div className="playingcard-pile-3">
            {trickSlot3.map((card, index) => ( 
              <Card
                key={index}
                code={card.code}
                suit={card.suit}
                value={card.value}
                image={card.image}
                backimage={cardback}
                flipped={true}
                onClick={card.onClick}/>
            ))}
          </div>
        </div>

        <div className="game-playerscore0">
          <div className="game-avatarbox">
            <Image
              className="player-avatar"
              src="/avatars_118x118/a101.png"
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
              src="/avatars_118x118/a102.png"
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
              src="/avatars_118x118/a103.png"
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
              src="/avatars_118x118/a104.png"
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
