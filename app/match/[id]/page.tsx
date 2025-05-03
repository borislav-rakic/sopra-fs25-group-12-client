"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering
import "@ant-design/v5-patch-for-react-19";
import { useParams , useRouter  } from "next/navigation";
import Image from "next/image";
import { Button, Dropdown} from "antd";
// import { BookOutlined, CodeOutlined, GlobalOutlined } from "@ant-design/icons";
import styles from "@/styles/page.module.css";
import modalStyles from "@/styles/modalMessage.module.css";
import { useApi } from "@/hooks/useApi";
// import { Match } from "@/types/match";
import { useEffect, useState } from "react";
import { PollingDTO } from "@/types/polling";
import SettingsPopup from "@/components/SettingsPopup";
import Card, { cardProps } from "@/components/card";
import { innerCard } from "@/types/playerCard";
import { DownOutlined } from "@ant-design/icons"

const MatchPage: React.FC = () => {
  const USE_AUTOMATIC_POLLING = false; // switch to true for auto every 2000ms

  //const router = useRouter();
  const params = useParams();
  const apiService = useApi();
  const router = useRouter();

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
  const [playerAvatars, setPlayerAvatars] = useState<Array<string | null>>([
    null,
    null,
    null,
    null,
  ]);
  const [trickSlot0, setTrickSlot0] = useState<cardProps[]>([]);
  const [trickSlot1, setTrickSlot1] = useState<cardProps[]>([]);
  const [trickSlot2, setTrickSlot2] = useState<cardProps[]>([]);
  const [trickSlot3, setTrickSlot3] = useState<cardProps[]>([]);

  const [matchScore, setMatchScore] = useState([0, 0, 0, 0]);
  const [roundScore, setRoundScore] = useState([0, 0, 0, 0]);

  const [currentTrick, setCurrentTrick] = useState("");
  const [currentPlayer, setCurrentPlayer] = useState("");
  const [currentGamePhase, setCurrentGamePhase] = useState("");
  const [cardsToPass, setCardsToPass] = useState<cardProps[]>([]);
  const [opponentToPassTo, /*setOpponentToPassTo*/] = useState("");
  const [/*heartsBroken*/, setHeartsBroken] = useState(false);
  const [firstCardPlayed, setFirstCardPlayed] = useState(false);
  //const [isFirstRound, setIsFirstRound] = useState(true);
  const [myTurn, setMyTurn] = useState(false);
  const [playableCards, setPlayableCards] = useState<Array<string | null>>([]);
  const [isWaitingForPlayers, setIsWaitingForPlayers] = useState(false);
  const [isLeaveGameModalVisible, setIsLeaveGameModalVisible] = useState(false);
  //const [currentMatchPhase, setCurrentMatchPhase] = useState("");

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [playmat, setPlaymat] = useState("");
  const [cardback, setCardback] = useState("");

  //const [slot, setSlot] = useState(1);
  //const [trickLeaderSlot, setTrickLeaderSlot] = useState(2);

  const [htmlContent, setHtmlContent] = useState<string>("");
 
  const fetchMatchData = async () => {
    try {
      console.log("📡 Fetching match data");

      const response = await apiService.post<PollingDTO>(
        `/matches/${matchId}/logic`,
        {},
      );
      console.log("Match data response:", response);
      setHeartsBroken(response.heartsBroken ?? false);
      setCurrentGamePhase(response.gamePhase ?? "");
      console.log("Backend says myTurn:", response.myTurn);
      setMyTurn(response.myTurn ?? false);
      console.log("myTurn (just set):", response.myTurn ?? false);

      const slot = response.playerSlot ?? 0;
      const trickLeaderSlot = response.currentTrickLeaderPlayerSlot ?? 1;

      if(response.resultHtml) {
        setHtmlContent(response.resultHtml);
      }

      if (response.matchPlayers) {
        setPlayers([
          response.matchPlayers[(0 + slot) % 4] ?? null,
          response.matchPlayers[(1 + slot) % 4] ?? null,
          response.matchPlayers[(2 + slot) % 4] ?? null,
          response.matchPlayers[(3 + slot) % 4] ?? null,
        ]);
      }

      if (response.avatarUrls) {
        setPlayerAvatars([
          response.avatarUrls[(0 + slot) % 4] ?? null,
          response.avatarUrls[(1 + slot) % 4] ?? null,
          response.avatarUrls[(2 + slot) % 4] ?? null,
          response.avatarUrls[(3 + slot) % 4] ?? null,
        ]);
      }

      const pointsArray = [
        response.playerPoints?.[0] ?? 0,
        response.playerPoints?.[1] ?? 0,
        response.playerPoints?.[2] ?? 0,
        response.playerPoints?.[3] ?? 0,
      ];

      setMatchScore([
        pointsArray[(0 + slot) % 4],
        pointsArray[(1 + slot) % 4],
        pointsArray[(2 + slot) % 4],
        pointsArray[(3 + slot) % 4],
      ]);

      setRoundScore([
        pointsArray[(0 + slot) % 4],
        pointsArray[(1 + slot) % 4],
        pointsArray[(2 + slot) % 4],
        pointsArray[(3 + slot) % 4],
      ]);

      if (response.playerCards) {
        response.playerCards.forEach((item) => {
          setCardsInHand((prev) =>
            prev.some((card) => card.code === item.card?.code)
              ? prev
              : [...prev, generateCard(item.card?.code)]
          );
        });
      }

      if (response.playableCards) {
        const playableCardCodes = response.playableCards.map((item) => item.card.code);
        setPlayableCards(playableCardCodes);
      }
      

      if (!firstCardPlayed && (response.currentTrick?.length ?? 0) > 0) {
        setFirstCardPlayed(true);
      }

      handleTrickFromLogic(response.currentTrick || [], slot, trickLeaderSlot);

      if (response.cardsInHandPerPlayer) {
        const hand = [
          response.cardsInHandPerPlayer["1"] ?? 0,
          response.cardsInHandPerPlayer["2"] ?? 0,
          response.cardsInHandPerPlayer["3"] ?? 0,
          response.cardsInHandPerPlayer["4"] ?? 0,
        ];

        const shifted = [
          hand[(0 + slot) % 4],
          hand[(1 + slot) % 4],
          hand[(2 + slot) % 4],
          hand[(3 + slot) % 4],
        ];

        setOpponent1Cards(
          Array.from({ length: shifted[1] }, generateEnemyCard),
        );
        setOpponent2Cards(
          Array.from({ length: shifted[2] }, generateEnemyCard),
        );
        setOpponent3Cards(
          Array.from({ length: shifted[3] }, generateEnemyCard),
        );
      }
    } catch (error) {
      console.error("Error during match data fetch:", error);
    }
    console.log("Finished fetchMatchData for", matchId);
  };

  useEffect(() => {
    if (USE_AUTOMATIC_POLLING) {
      const intervalId = setInterval(() => {
        fetchMatchData();
      }, 2000);
      return () => {
        clearInterval(intervalId);
        console.log("Automatic polling stopped");
      };
    } else {
      const handleKeyPress = (event: KeyboardEvent) => {
        if (event.code === "Space") {
          event.preventDefault();
          console.log("Spacebar pressed — fetching manually");
          fetchMatchData();
        }
      };

      window.addEventListener("keydown", handleKeyPress);
      return () => {
        window.removeEventListener("keydown", handleKeyPress);
      };
    }
  }, [matchId]);

  const generateCard = (code: string) => {
    const rank = code[0];
    const suit = code[1];

    const rankToValue: { [key: string]: bigint } = {
      "2": BigInt(2),
      "3": BigInt(3),
      "4": BigInt(4),
      "5": BigInt(5),
      "6": BigInt(6),
      "7": BigInt(7),
      "8": BigInt(8),
      "9": BigInt(9),
      "0": BigInt(10),
      J: BigInt(11),
      Q: BigInt(12),
      K: BigInt(13),
      A: BigInt(14),
    };

    const suitToName: { [key: string]: string } = {
      H: "Hearts",
      S: "Spades",
      D: "Diamonds",
      C: "Clubs",
    };

    const card: cardProps = {
      code,
      suit: suitToName[suit] || suit, // Use the full name if available
      value: rankToValue[rank],
      image: `https://deckofcardsapi.com/static/img/${code}.png`, // Example image URL
      flipped: false,
      backimage: cardback, // Use the current cardback
      onClick: (code: string) => {
        console.log(`Card clicked: ${code}`);
      },
    };

    console.log("Generated card:", card);
    return card;
  };

  useEffect(() => {
    console.log("PlayableCards updated:", playableCards);
  }, [playableCards]);

  const generateEnemyCard = () => {
    const card: cardProps = {
      code: "XX",
      suit: "XX",
      value: BigInt(0),
      image: "",
      backimage: cardback,
      flipped: false,
      onClick: () => {},
    };
    return card;
  };

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  // sets default settings and sets them to local storage, unless they already exist
  useEffect(() => {
    if (localStorage.getItem("playmat")) {
      setPlaymat(localStorage.getItem("playmat") || "");
    } else {
      setPlaymat("#008000"); // Default playmat
      localStorage.setItem("playmat", "#008000");
    }
    if (localStorage.getItem("cardback")) {
      setCardback(localStorage.getItem("cardback") || "");
    } else {
      setCardback("/card_back/b101.png"); // Default cardback
      localStorage.setItem("cardback", "/card_back/b101.png");
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

  const handlePlayCard = async (card: cardProps) => {
    console.log("Clicked card:", card.code);
    console.log("myTurn =", myTurn);
    console.log("currentGamePhase =", currentGamePhase);

    if (currentGamePhase === "PASSING") {
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
    }

    else{ 
    if (
      currentGamePhase !== "NORMALTRICK" &&
      currentGamePhase !== "FIRSTTRICK" &&
      currentGamePhase !== "FINALTRICK"
    ) {
      console.log(" Not in a playable phase.");
      return;
    }

    if (!myTurn) {
      console.log("Not your turn.");
      return;
    }

    const trickOk = verifyTrick(card);
    console.log("verifyTrick =", trickOk);
    if (!trickOk) {
      console.log("Trick verification failed.");
      return;
    }

    try {
      const payload = {
        gameId: matchId,
        card: card.code,
      };
      console.log("Sending card play request:", payload);

      const response = await apiService.post(
        `/matches/${matchId}/play`,
        payload,
      );
      console.log("Card play response:", response);

      const updatedCardsInHand = cardsInHand.filter((c) =>
        c.code !== card.code
      );
      setCardsInHand(updatedCardsInHand);
      setTrickSlot0([card]);
      setCurrentPlayer(players[1] || "");
      console.log("currentPlayer:", currentPlayer);
    } catch (error) {
      console.error("Error sending card play request:", error);
    }
  }
  };

  // Checks if the played card is a valid play in the current trick.
  // uses the played card, the existing trick, and the player's hand to determine if the play is valid.
  // We use the status of trickslot3 to determine if the player is playing the first card of the trick or not.
  const verifyTrick = (card: cardProps) => {
    console.log("Verifying trick for card: ", card.code);
    console.log("playbleCards: ", playableCards);

    if (playableCards.includes(card.code)) {
      console.log("Card is valid according to the backend.");
      return true;
    } else {
      console.log("Card is not valid according to the backend.");
      return false;
    }
  };

  const handlePassCards = async () => {
    if (cardsToPass.length < 3) {
      console.log("You must pass 3 cards.");
      return;
    }
    try {
      const payload = {
        gameId: matchId,
        cards: cardsToPass.map((card) => card.code), // Send only the card codes
      };
      console.log("Payload for passing cards:", payload);

      // Make the API request
      const response = await apiService.post(
        `/matches/${matchId}/passing`,
        payload,
      );

      // Check if the response indicates an error
      if (!response || typeof response !== "object") {
        console.error(
          "Error passing cards: Invalid or empty response from server.",
        );
        return;
      }

      // If the response is valid, proceed with the success logic
      console.log("Response from server:", response);

      const updatedCardsInHand = cardsInHand.filter(
        (c) => !cardsToPass.some((card) => card.code === c.code),
      );

      // Update the opponent's hand based on the selected opponent
      if (opponentToPassTo === "Opponent1") {
        const updatedEnemyHand = opponent1Cards.concat(cardsToPass);
        setOpponent1Cards(updatedEnemyHand);
      } else if (opponentToPassTo === "Opponent2") {
        const updatedEnemyHand = opponent2Cards.concat(cardsToPass);
        setOpponent2Cards(updatedEnemyHand);
      } else if (opponentToPassTo === "Opponent3") {
        const updatedEnemyHand = opponent3Cards.concat(cardsToPass);
        setOpponent3Cards(updatedEnemyHand);
      }

      // Update the state
      setCardsInHand(updatedCardsInHand);
      setCardsToPass([]);
      setCurrentGamePhase("playing");
    } catch (error) {
      console.error("Error passing cards:", error);
    }
  };

  const handleClearTrick = () => {
    setTrickSlot0([]);
    setTrickSlot1([]);
    setTrickSlot2([]);
    setTrickSlot3([]);
    setCurrentTrick("");
  };

  const calculateTrickWinner = () => {
    console.log("Calculating trick winner...");
    const allCards = [
      ...trickSlot0,
      ...trickSlot1,
      ...trickSlot2,
      ...trickSlot3,
    ];

    if (allCards.length < 4) {
      console.log(
        "Trick may only be calulated if all players have played a card.",
      );
      return;
    }

    const matchingCards = allCards.filter((card) => card.suit === currentTrick);

    if (matchingCards.length === 0) {
      console.log("No cards match the current trick's suit.");
      return;
    }

    // Initialize the highest card and its index
    let highestCardIndex = 0;
    let highestCard = matchingCards[0];

    // Iterate through matching cards to find the highest card
    matchingCards.forEach((card) => {
      const cardIndex = allCards.indexOf(card);
      if (card.value > highestCard.value) {
        highestCard = card;
        highestCardIndex = cardIndex;
      }
    });
    return highestCardIndex;
  };

  useEffect(() => {
    // Function to check if all trick slots contain a card
    const checkAndHandleTrick = () => {
      if (
        trickSlot0.length > 0 &&
        trickSlot1.length > 0 &&
        trickSlot2.length > 0 &&
        trickSlot3.length > 0
      ) {
        console.log("All trick slots are filled. Calculating trick winner...");

        const winningPlayer = calculateTrickWinner();
        console.log("Winning player index:", winningPlayer);

        if (winningPlayer !== undefined) {
          console.log("winning player: ", players[winningPlayer]);
        } else {
          console.log("No winning player could be determined.");
        }

        setTimeout(() => {
          console.log("Clearing trick slots...");
          handleClearTrick();
        }, 2500);
      }
    };

    checkAndHandleTrick();
  }, [trickSlot0, trickSlot1, trickSlot2, trickSlot3]);
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        console.log("⏵ Spacebar pressed — fetching match data");
        fetchMatchData();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);
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

  const handleTrickFromLogic = (
    trick: innerCard[],
    slot: number,
    trickLeaderSlot: number,
  ) => {
    console.log("Received trick from logic:", trick);
    const tempTrick: string[] = ["", "", "", ""];
    const indexShift = (trickLeaderSlot - slot + 4) % 4;

    trick.forEach((card, index) => {
      if (card) {
        const shiftedIndex = (index + indexShift) % 4;
        tempTrick[shiftedIndex] = card.code;
      }
    });

    console.log("Shifted trick array:", tempTrick);

    // if trick is empty and shouldnt be or if trick is not what it should be, set it to the new trick for trick 0
    if (
      (tempTrick[0] || tempTrick[0] === "") &&
      (trickSlot0.length === 0 || trickSlot0[0].code !== tempTrick[0])
    ) {
      if (tempTrick[0] === "") {
        setTrickSlot0([]);
      } else {
        setTrickSlot0([generateCard(tempTrick[0])]);
      }
    }
    if (
      (tempTrick[1] || tempTrick[1] === "") &&
      (trickSlot1.length === 0 || trickSlot1[0].code !== tempTrick[1])
    ) {
      if (tempTrick[1] === "") {
        setTrickSlot1([]);
      } else {
        setTrickSlot1([generateCard(tempTrick[1])]);
      }
    }
    if (
      (tempTrick[2] || tempTrick[2] === "") &&
      (trickSlot2.length === 0 || trickSlot2[0].code !== tempTrick[2])
    ) {
      if (tempTrick[2] === "") {
        setTrickSlot2([]);
      } else {
        setTrickSlot2([generateCard(tempTrick[2])]);
      }
    }
    if (
      (tempTrick[3] || tempTrick[3] === "") &&
      (trickSlot3.length === 0 || trickSlot3[0].code !== tempTrick[3])
    ) {
      if (tempTrick[3] === "") {
        setTrickSlot3([]);
      } else {
        setTrickSlot3([generateCard(tempTrick[3])]);
      }
    }
  };

  const handleConfirmNewGame = async () => {
    try {
      console.log("Confirming new game...");
      await apiService.post(`/matches/${matchId}/game/confirm`, {});
      console.log("New game confirmed.");
      setIsWaitingForPlayers(true); // Update state to show "Waiting for other players"
    } catch (error) {
      console.error("Error confirming new game:", error);
    }
  };
  
  const showLeaveGameModal = () => {
    setIsLeaveGameModalVisible(true);
  };
  
  const hideLeaveGameModal = () => {
    setIsLeaveGameModalVisible(false);
  };

  const handleLeaveGame = async () => {
    try {
      console.log("Leaving game...");
      await apiService.delete(`/matches/${matchId}/leave`);
      router.push("/"); // Redirect to the home page after leaving the game
      console.log("Game left.");
    } catch (error) {
      console.error("Error leaving game:", error);
    } finally {
      hideLeaveGameModal(); // Hide the modal
    }
  };

  const getDisplayName = (fullName: string | null) => {
    if (!fullName) return "AI Player";
    return fullName.split(" (")[0]; // cuts off anything after ' ('
  };
  

  /*
  const resetGame = () => {
    setCardsInHand([]);
    setOpponent1Cards([]);
    setOpponent2Cards([]);
    setOpponent3Cards([]);
    setTrickSlot0([]);
    setTrickSlot1([]);
    setTrickSlot2([]);
    setTrickSlot3([]);
    setCurrentTrick("");
    setCurrentPlayer("");
    setCurrentGamePhase("");
    setCardsToPass([]);
    setOpponentToPassTo("");
    setHeartsBroken(false);
    setFirstCardPlayed(false);
    setIsFirstRound(true);
  }
 */
  return (
    <div className={`${styles.page} matchPage`}>
      <div className="menu-dropdown">
        <Dropdown
          menu = {{
            items: [
              { key: "1", label: "Settings", onClick: () => toggleSettings()},
              { key: "2", label: "Rules", /*onClick: () => toggleSettings()*/},
              { key: "3", label: "Leave Match", onClick: showLeaveGameModal},
            ],
          }}
        trigger={["click"]}
        >
      <Button type= "default">
        Menu <DownOutlined/>
      </Button>
      </Dropdown>
      </div>

      <SettingsPopup
        isOpen={isSettingsOpen}
        onClose={toggleSettings}
        playmat={playmat}
        setPlaymat={setPlaymat}
        cardback={cardback}
        setCardback={setCardback}
      />

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
                <td>{matchScore[0]}</td>
              </tr>
              <tr>
                <td>{players[1] ? players[1] : "AI Player"}</td>
                <td>{matchScore[1]}</td>
              </tr>
              <tr>
                <td>{players[2] ? players[2] : "AI Player"}</td>
                <td>{matchScore[2]}</td>
              </tr>
              <tr>
                <td>{players[3] ? players[3] : "AI Player"}</td>
                <td>{matchScore[3]}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className = "gameboard">

        <div className="hand-0">
          {cardsInHand.map((card, index) => (
            <Card
              key={index}
              code={card.code}
              suit={card.suit}
              value={card.value}
              image={card.image}
              backimage={cardback}
              flipped
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

        <div className="hand-0-extension"></div>
        <div className="hand-1-extension"></div>
        <div className="hand-2-extension"></div>
        <div className="hand-3-extension"></div>

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
                flipped
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
                flipped
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
                flipped
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
                flipped
                onClick={card.onClick}
              />
            ))}
          </div>
        </div>

        <div className="game-playerscore0">
          <div className="game-avatarbox">
            <Image
              className="player-avatar"
              src={playerAvatars[0]
                ? playerAvatars[0]
                : "/avatars_118x118/a104.png"}
              alt="avatar"
              width={72}
              height={72}
            />
          </div>
          <div className="game-playername">
          {getDisplayName(players[0])}
          </div>
          <div className="game-playerscore">Score: {roundScore[0]}</div>
        </div>

        <div className="game-playerscore1">
          <div className="game-avatarbox">
            <Image
              className="player-avatar"
              src={playerAvatars[1]
                ? playerAvatars[1]
                : "/avatars_118x118/a104.png"}
              alt="avatar"
              width={72}
              height={72}
            />
          </div>
          <div className="game-playername">
            {getDisplayName(players[1])}
          </div>
          <div className="game-playerscore">Score: {roundScore[1]}</div>
        </div>

        <div className="game-playerscore2">
          <div className="game-avatarbox">
            <Image
              className="player-avatar"
              src={playerAvatars[2]
                ? playerAvatars[2]
                : "/avatars_118x118/a104.png"}
              alt="avatar"
              width={72}
              height={72}
            />
          </div>
          <div className="game-playername">
              {getDisplayName(players[2])}
          </div>
          <div className="game-playerscore">Score: {roundScore[2]}</div>
        </div>

        <div className="game-playerscore3">
          <div className="game-avatarbox">
            <Image
              className="player-avatar"
              src={playerAvatars[3]
                ? playerAvatars[3]
                : "/avatars_118x118/a104.png"}
              alt="avatar"
              width={72}
              height={72}
            />
          </div>
          <div className="game-playername">
            {getDisplayName(players[3])}
          </div>
          <div className="game-playerscore">Score: {roundScore[3]}</div>
        </div>

        {cardsToPass.length === 3 && (
          <button
            type="button"
            onClick={handlePassCards}
            className="pass-cards-button"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1000,
              padding: "20px 40px", // Increased padding for a bigger button
              fontSize: "1.5rem", // Larger font size
              backgroundColor: "#d3d3d3", // Light grey background
              color: "#000", // Black text color
              border: "none",
              borderRadius: "10px", // Slightly rounded corners
              cursor: "pointer",
              transition: "background-color 0.3s ease", // Smooth transition for hover effect
            }}
            onMouseEnter={(
              e,
            ) => (e.currentTarget.style.backgroundColor = "#1890ff")} // Blue on hover
            onMouseLeave={(
              e,
            ) => (e.currentTarget.style.backgroundColor = "#d3d3d3")} // Back to grey
          >
            Pass Cards
          </button>
        )}

        {currentGamePhase === "RESULT" && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1000,
              backgroundColor: "#333", // Dark background for the box
              color: "#fff", // Light text color for contrast
              padding: "20px",
              borderRadius: "10px",
              textAlign: "center",
              width: "400px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)", // Add a shadow for better visibility
            }}
          >
            <div>
              <h2>Round Complete</h2>
              <div
                className={`${modalStyles.modalMessage} ${modalStyles.modalMessageGameResult}`}
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>

            {/* Confirm button or waiting message */}
            {!isWaitingForPlayers ? (
              <button
                onClick={handleConfirmNewGame}
                style={{
                  marginTop: "20px",
                  padding: "10px 20px",
                  fontSize: "1rem",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  transition: "background-color 0.3s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#45a049")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#4CAF50")
                }
              >
                Confirm
              </button>
            ) : (
              <div
                style={{
                  marginTop: "20px",
                  padding: "10px 20px",
                  fontSize: "1rem",
                  backgroundColor: "#555",
                  color: "white",
                  borderRadius: "5px",
                }}
              >
                Waiting for other players...
              </div>
            )}
          </div>
        )}

        {isLeaveGameModalVisible && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.7)", // Dark overlay
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 2000,
            }}
          >
            <div
              style={{
                backgroundColor: "#333", // Dark background for the modal
                padding: "20px",
                borderRadius: "10px",
                textAlign: "center",
                width: "300px",
                color: "#fff", // Light text color for contrast
              }}
            >
              <p style={{ fontSize: "1.2rem", marginBottom: "20px" }}>
                Are you sure you want to leave the game?
              </p>
              <div style={{ display: "flex", justifyContent: "space-around" }}>
                <button
                  onClick={handleLeaveGame}
                  style={{
                    padding: "10px 20px",
                    fontSize: "1rem",
                    backgroundColor: "#f44336",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Confirm
                </button>
                <button
                  onClick={hideLeaveGameModal}
                  style={{
                    padding: "10px 20px",
                    fontSize: "1rem",
                    backgroundColor: "#555", // Darker grey for the cancel button
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MatchPage;
