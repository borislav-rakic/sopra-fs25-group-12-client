"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering
import "@ant-design/v5-patch-for-react-19";
import Image from "next/image";
// import { BookOutlined, CodeOutlined, GlobalOutlined } from "@ant-design/icons";
import styles from "@/styles/page.module.css";
import { useApi } from "@/hooks/useApi";
// import { Match } from "@/types/match";
import { useEffect, useState } from "react";
import SettingsPopup from "@/components/SettingsPopup";
import Card, { cardProps } from "@/components/card";

const MatchTestPage: React.FC = () => {
  //const router = useRouter();
  const apiService = useApi();
  const [matchId, setMatchId] = useState<string | null>(null);

  const [cardsInHand, setCardsInHand] = useState<cardProps[]>([]);
  const [opponent1Cards, setOpponent1Cards] = useState<cardProps[]>([]);
  const [opponent2Cards, setOpponent2Cards] = useState<cardProps[]>([]);
  const [opponent3Cards, setOpponent3Cards] = useState<cardProps[]>([]);
  const [matchCreated, setMatchCreated] = useState(false);
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
  const [heartsBroken, setHeartsBroken] = useState(false);
  const [firstCardPlayed, setFirstCardPlayed] = useState(false);
  const [isFirstRound, setIsFirstRound] = useState(true);
  const [myTurn, setMyTurn] = useState(false); 

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [playmat, setPlaymat] = useState("");
  const [cardback, setCardback] = useState("");

  interface MatchResponse {
    matchId: number;
  }

  const resolveCardBackImage = (name: string) => {
    switch (name) {
      case "Default":
        return "/cards/back/default.png";
      case "Red":
        return "/cards/back/red.png";
      case "Blue":
        return "/cards/back/blue.png";
      // add other themes here
      default:
        return "/cards/back/default.png";
    }
  };

  interface PlayerCardDTO {
    code: string;
    suit: string;
    value: number;
    image: string;
  }

  interface PlayerMatchInformation {
    matchId: number;
    matchPlayers: string[];
    host: string;
    length: number;
    started: boolean;
    aiPlayers: { [key: number]: number };
    playerCards: PlayerCardDTO[];
    playableCards: PlayerCardDTO[];
    isGameFinished: boolean;
    isMatchFinished: boolean;
    isMyTurn: boolean;
  }

  // let playerHand = document.getElementById("hand-0");
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      const user1Token = "616755c5-1694-4029-98f3-d6dd58b3ea55";
      localStorage.setItem("token", user1Token);
      console.log("Token set for User1 automatically.");
    }
  }, []);

  useEffect(() => {
    const setupMatch = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found in localStorage.");
          return;
        }

        // Step 1: Create the match
        const matchResponse: MatchResponse = await apiService.post(`/matches`, {
          playerToken: token,
        });

        if (!matchResponse || !matchResponse.matchId) {
          throw new Error("Match creation failed");
        }

        const newMatchId = matchResponse.matchId.toString();
        console.log("Match created:", newMatchId);

        // Step 2: Add AI players
        for (let i = 2; i <= 4; i++) {
          await apiService.post(`/matches/${newMatchId}/ai`, {
            slot: i,
            difficulty: i,
          });
        }

        // Step 3: Start the match
        await apiService.post(`/matches/${newMatchId}/start`, {});
        console.log("Match started");

        // Step 4: Mark ready
        setMatchId(newMatchId);
        setMatchCreated(true);
      } catch (error) {
        console.error("Match setup failed:", error);
      }
    };

    if (!matchCreated) {
      setupMatch();
    }
  }, [matchCreated, apiService]);

  /*
  useEffect(() => {
    if (!matchCreated || !matchId) return;

    const matchRefreshIntervalId = setInterval(async () => {
      try {
        const response = await apiService.post<PlayerMatchInformation>(
          `/matches/${matchId}/logic`,
          {},
        );

        if (response.matchPlayers) {
          setPlayers(response.matchPlayers);
        }
      } catch (error) {
        console.error(`Failed to fetch match data for matchId ${matchId}:`, error);
      }
    }, 5000);

    return () => {
      clearInterval(matchRefreshIntervalId);
      console.log("Interval cleared.");
    };
  }, [apiService, matchId, matchCreated]);
  */
  const updateBoardFromLogic = (logic: PlayerMatchInformation) => {
    // Update player names
    setPlayers(logic.matchPlayers);

    // Update match state flags
    setMatchCreated(logic.started);
    setCurrentGamePhase(logic.isMatchFinished ? "finished" : "playing");
    setCurrentPlayer(logic.isMyTurn ? logic.matchPlayers[0] : "");

    // Update player's hand
    const updatedHand: cardProps[] = logic.playerCards.map((card) => ({
      ...card,
      value: BigInt(card.value),
      flipped: true,
      backimage: resolveCardBackImage(cardback),
      onClick: () => {},
    }));
    setCardsInHand(sortCards(updatedHand));

    // Simulate opponents' hands with placeholders
    const cardsPerOpponent = 13; // Or base this on game logic if available
    const createFaceDownCards = (count: number): cardProps[] =>
      Array.from({ length: count }, (_, i) => ({
        code: `XX${i}`,
        suit: "Unknown",
        value: BigInt(0),
        image: "",
        backimage: resolveCardBackImage(cardback),
        flipped: false,
        onClick: () => {},
      }));

    setOpponent1Cards(createFaceDownCards(cardsPerOpponent));
    setOpponent2Cards(createFaceDownCards(cardsPerOpponent));
    setOpponent3Cards(createFaceDownCards(cardsPerOpponent));

    // Trick slots — if your backend supports current trick info
    // For now we’ll clear them unless you implement backend support
    setTrickSlot0([]);
    setTrickSlot1([]);
    setTrickSlot2([]);
    setTrickSlot3([]);

    // You can also update other game states if the logic includes them:
    // e.g., isFirstRound, heartsBroken, firstCardPlayed, etc.
  };

  const fetchMatchLogic = async () => {
    if (!matchId) return;

    try {
      const response = await apiService.post<PlayerMatchInformation>(
        `/matches/${matchId}/logic`,
        {},
      );

      console.log("Match logic response:", response);
      updateBoardFromLogic(response); // 🔁 Use centralized update
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Logic fetch failed:", error.message);
        alert("Something went wrong.");
      } else {
        console.error("Unknown error occurred:", error);
      }
    }
  };

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

    if (currentGamePhase === "passing") {
      if (cardsToPass.find((c) => c.code === card.code)) {
        setCardsToPass(cardsToPass.filter((c) => c.code !== card.code));
        console.log("removed card from cardsToPass: ", card.code);
        console.log("cardsToPass: ", cardsToPass);
      } else if (cardsToPass.length < 3) {
        setCardsToPass([...cardsToPass, card]);
        console.log("added card to cardsToPass: ", card.code);
        console.log("cardsToPass: ", cardsToPass);
      } else {
        console.log("You may not pass more than 3 cards.");
      }
    } else if (currentGamePhase === "playing") {
      if (currentPlayer === players[0]) {
        if (!verifyTrick(card)) {
          // the linter abhors empty blocks
        } else {
          const updatedCardsInHand = cardsInHand.filter((c) =>
            c.code !== card.code
          );
          const updatedTrick0 = [card];

          setCardsInHand(updatedCardsInHand);
          setTrickSlot0(updatedTrick0);
          setCurrentPlayer(players[1] || "AI Player 1"); // Set the next player to play
        }
      } else {
        console.log("You may not play cards while it is not your turn.");
      }
    } else {
      console.log("currently unused game phase option");
    }
  };

  // Checks if the played card is a valid play in the current trick.
  // uses the played card, the existing trick, and the player's hand to determine if the play is valid.
  // We use the status of trickslot3 to determine if the player is playing the first card of the trick or not.
  const verifyTrick = (card: cardProps) => {
    console.log("Verifying trick for card: ", card.code);
    if (!firstCardPlayed) {
      if (card.code === "2C") {
        setFirstCardPlayed(false);
        setCurrentTrick(card.suit);
        console.log("First card played in the game is 2 of clubs.");
        return true; // 2 of clubs is played first
      }
      console.log("First card played in the game must be 2 of clubs.");
      return false;
    }
    if (isFirstRound) {
      if (card.code === "QS" || card.suit === "Hearts") {
        console.log(
          "Queen of Spades or Hearts cannot be played in the first round.",
        );
        return false; // Queen of Spades or Hearts cannot be played in the first round
      }
    }
    if (trickSlot3.length === 0) {
      console.log("First card played in the trick.");
      if (heartsBroken) {
        console.log("Hearts are broken, any card can be played.");
        setCurrentTrick(card.suit);
        return true; // Any card can be played if hearts are broken
      } else if (card.suit === "Hearts") {
        console.log("Hearts cannot be played until they are broken.");
        return false; // Hearts cannot be played if they haven't been broken
      } else {
        console.log("No constraints on the first card played.");
        setCurrentTrick(card.suit);
        return true; // Any non-heart card can be played
      }
    } else {
      console.log("Subsequent card played in the trick.");
      if (card.suit === currentTrick) {
        console.log("Card matches the suit of the trick.");
        return true; // Card matches the suit of the trick
      } else if (cardsInHand.some((c) => c.suit === currentTrick)) {
        console.log("Player must follow the suit.");
        return false; // Player must follow the suit if they have it in hand
      } else {
        console.log(
          "Player can play any card if they don't have the trick's suit.",
        );
        return true; // Player can play any card if they don't have the trick's suit
      }
    }
  };

  const sortCards = (cards: cardProps[]) => {
    return cards.sort((a, b) => {
      console.log("Comparing cards:", a.code, " | ", b.code);
      if (a.suit < b.suit) return -1;
      if (a.suit > b.suit) return 1;

      if (a.value < b.value) return -1;
      if (a.value > b.value) return 1;

      return 0;
    });
  };

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
                onClick={card.onClick}
              />
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
                onClick={card.onClick}
              />
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
                onClick={card.onClick}
              />
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
                onClick={card.onClick}
              />
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
        <button
          onClick={() => {
            console.log("Button clicked!");
            fetchMatchLogic();
          }}
          className="ant-btn ant-btn-primary"
          style={{ zIndex: 9999, position: "relative" }}
        >
          Fetch Match Logic
        </button>
      </div>
    </div>
  );
};

export default MatchTestPage;
