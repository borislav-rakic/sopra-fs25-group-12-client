"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering
import "@ant-design/v5-patch-for-react-19";
import { useParams /*, useRouter */ } from "next/navigation";
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
import { PlayerCard } from "@/types/playerCard";

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

  const [matchScore, setMatchScore] = useState([0, 0, 0, 0]); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [roundScore, setRoundScore] = useState([0, 0, 0, 0]); // eslint-disable-line @typescript-eslint/no-unused-vars

  const [currentTrick, setCurrentTrick] = useState("");
  const [currentPlayer, setCurrentPlayer] = useState(""); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [currentGamePhase, setCurrentGamePhase] = useState("");
  const [cardsToPass, setCardsToPass] = useState<cardProps[]>([]);
  const [opponentToPassTo, setOpponentToPassTo] = useState("");
  const [heartsBroken, setHeartsBroken] = useState(false);
  const [firstCardPlayed, setFirstCardPlayed] = useState(false);
  const [isFirstRound, setIsFirstRound] = useState(true);
  const [myTurn, setMyTurn] = useState(false); 

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [playmat, setPlaymat] = useState("");
  const [cardback, setCardback] = useState("");

  const [isMatchTesterVisible, setIsMatchTesterVisible] = useState(true);

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

        if (response.avatarUrls) {
          setPlayerAvatars(response.avatarUrls);
        }

        if (response.playerPoints) {
          const updatedMatchScore = [
            response.playerPoints["1"] || 0,
            response.playerPoints["2"] || 0,
            response.playerPoints["3"] || 0,
            response.playerPoints["4"] || 0,
          ];
          setMatchScore(updatedMatchScore);
        }
        if (response.playerPoints) {
          const updatedRoundScore = [
            response.playerPoints["1"] || 0,
            response.playerPoints["2"] || 0,
            response.playerPoints["3"] || 0,
            response.playerPoints["4"] || 0,
          ];
          setRoundScore(updatedRoundScore);
        }
        
        if (response.playerCards) {
          response.playerCards.forEach((item) => {
            setCardsInHand((prevCardsInHand) => {
              // Check if the card already exists in the player's hand
              if (!prevCardsInHand.some((card) => card.code === item.card?.code)) {
                // Add the new card to the player's hand
                return [...prevCardsInHand, generateCard(item.card?.code)];
              }
              // If the card already exists, return the current state
              return prevCardsInHand;
            });
          });
        }


        setHeartsBroken(response.heartsBroken || false);
        setCurrentGamePhase(response.gamePhase || "");
        setMyTurn(response.myTurn || false);
        
        handleTrickFromLogic(response.currentTrick || []);
       
        //checks number of cards in enemy hands
        if (response.cardsInHandPerPlayer) {
          const expectedOpponent1Cards = response.cardsInHandPerPlayer[1];
          const expectedOpponent2Cards = response.cardsInHandPerPlayer[2];
          const expectedOpponent3Cards = response.cardsInHandPerPlayer[3];

          //console.log("Expected opponent cards:", expectedOpponent1Cards, expectedOpponent2Cards, expectedOpponent3Cards);
          //console.log("Current opponent cards:", opponent1Cards.length, opponent2Cards.length, opponent3Cards.length);

          if (opponent1Cards.length !== expectedOpponent1Cards) {
            const difference = expectedOpponent1Cards - opponent1Cards.length;
            if (difference > 0) {
              // Add cards to opponent1Cards
              const newCards = Array.from({ length: difference }, () => generateEnemyCard());
              setOpponent1Cards(newCards);
              //console.log(`Added ${difference} cards to opponent1Cards.`);
            } else if (difference < 0) {
              // Remove cards from opponent1Cards
              setOpponent1Cards((prevCards) => prevCards.slice(0, expectedOpponent1Cards));
              //console.log(`Removed ${Math.abs(difference)} cards from opponent1Cards.`);
            }
          }
          if (opponent2Cards.length !== expectedOpponent2Cards) {
            const difference = expectedOpponent2Cards - opponent2Cards.length;
            if (difference > 0) {
              // Add cards to opponent2Cards
              const newCards = Array.from({ length: difference }, () => generateEnemyCard());
              setOpponent2Cards(newCards);
              //console.log(`Added ${difference} cards to opponent2Cards.`);
            } else if (difference < 0) {
              // Remove cards from opponent2Cards
              setOpponent2Cards((prevCards) => prevCards.slice(0, expectedOpponent2Cards));
              //console.log(`Removed ${Math.abs(difference)} cards from opponent2Cards.`);
            }
          }
          if (opponent3Cards.length !== expectedOpponent3Cards) {
            const difference = expectedOpponent3Cards - opponent3Cards.length;
            if (difference > 0) {
              // Add cards to opponent3Cards
              const newCards = Array.from({ length: difference }, () => generateEnemyCard());
              setOpponent3Cards(newCards);
              //console.log(`Added ${difference} cards to opponent3Cards.`);
            } else if (difference < 0) {
              // Remove cards from opponent3Cards
              setOpponent3Cards((prevCards) => prevCards.slice(0, expectedOpponent3Cards));
              //console.log(`Removed ${Math.abs(difference)} cards from opponent3Cards.`);
            }
          }
        }

      } catch (error) {
        console.error(
          `Failed to fetch match data for matchId ${matchId}:`,
          error,
        );
      }
    }, 2000);

    // When the component unmounts, this stops the function mapped to matchRefreshIntervalId from running every 5 seconds.
    return () => {
      clearInterval(matchRefreshIntervalId);
      console.log("Interval cleared.");
    };
  }, [apiService, matchId]);

  const generateCard = (code : string)  => {

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

  }

  const generateEnemyCard = () => {
    const card: cardProps = {
      code: "XX",
      suit: "XX",
      value: BigInt(0),
      image: "",
      backimage: cardback, 
      flipped: false,
      onClick: () => {}
    }
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
    console.log("Selected card in Match Page:", card.code);

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
    } else if (currentGamePhase === "PLAYING" || currentGamePhase === "FIRSTROUND") {
      if (!myTurn) {
        console.log("You may not play cards while it is not your turn.");
        return;
      }
  
      if (!verifyTrick(card)) {
        console.log("Invalid card play. Trick verification failed.");
        return;
      }

      try {
        const payload = {
          gameId: matchId,
          playerId: 4, // Currently the frontend has no way of knowing the playerId, so we set it to 4 for now and test with User1.
          card: card.code, // Since card in backend is only a string
        };
        console.log("Payload for playing card:", payload);
  
        const response = await apiService.post(`/matches/${matchId}/play`, { payload });
  
        console.log("Response from server:", response);
  
        // Check if the response is valid
        if (!response || typeof response !== "object") {
          console.error("Error playing card: Invalid or empty response from server.");
          return;
        }

        if (!firstCardPlayed) {
          setFirstCardPlayed(true);
        }

        if (currentTrick === "") {
          setCurrentTrick(card.suit);
        }
  
        // If the response is valid, proceed with the success logic
        console.log("Card played successfully:", card.code);
  
        const updatedCardsInHand = cardsInHand.filter((c) => c.code !== card.code);
        const updatedTrick0 = [card];
  
        setCardsInHand(updatedCardsInHand);
        setTrickSlot0(updatedTrick0);
        setCurrentPlayer(players[1] || ""); // Set the next player to play
        console.log("Current player:", currentPlayer);
      } catch (error) {
        console.error("Error playing card:", error);
      }
    } else {
      console.log("Currently unused game phase option.");
    }
  };

  // Checks if the played card is a valid play in the current trick.
  // uses the played card, the existing trick, and the player's hand to determine if the play is valid.
  // We use the status of trickslot3 to determine if the player is playing the first card of the trick or not.
  const verifyTrick = (card: cardProps) => {
    console.log("Verifying trick for card: ", card.code);
    if (!firstCardPlayed) {
      if (card.code === "2C") {
        console.log("First card played in the game is 2 of clubs.");
        return true; // 2 of clubs is played first
      }
      console.log("First card played in the game must be 2 of clubs.");
      return false;
    }
    if (currentGamePhase === "FIRSTROUND") {
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
        return true; // Any card can be played if hearts are broken
      } else if (card.suit === "Hearts") {
        console.log("Hearts cannot be played until they are broken.");
        return false; // Hearts cannot be played if they haven't been broken
      } else {
        console.log("No constraints on the first card played.");
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

  const handlePassCards = async () => {
    if (cardsToPass.length < 3) {
      console.log("You must pass 3 cards.");
      return
    } 
    try {

      const payload = {
        gameId: matchId,
        playerId: 4, // Currently the frontend has no way of knowing the playerId, so we set it to 4 for now and test with User1.
        cards: cardsToPass.map((card) => card.code), // Send only the card codes
      };
      console.log("Payload for passing cards:", payload);

    // Make the API request
    const response = await apiService.post(`/matches/${matchId}/passing`, payload);

    // Check if the response indicates an error
    if (!response || typeof response !== "object") {
      console.error("Error passing cards: Invalid or empty response from server.");
      return;
    }

    // If the response is valid, proceed with the success logic
    console.log("Response from server:", response);

    const updatedCardsInHand = cardsInHand.filter(
      (c) => !cardsToPass.some((card) => card.code === c.code)
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
      console.log("Trick may only be calulated if all players have played a card.");
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
  }

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

  const handleTrickFromLogic = (trick: PlayerCard[]) => {
    console.log("Received trick from logic:", trick);
    // if trick is empty and shouldnt be or if trick is not what it should be, set it to the new trick for trick 0
    if(trick[0] !== undefined && ((trickSlot0.length === 0 && trick[0] !== null) || trickSlot0[0].code !== trick[0].card.code)) {
      setTrickSlot0([
        generateCard(trick[0].card.code),
      ]);
    }
    if(trick[1] !== undefined && ((trickSlot1.length === 0 && trick[1] !== null) || trickSlot0[1].code !== trick[1].card.code)) {
      setTrickSlot1([
        generateCard(trick[1].card.code),
      ]);
    }
    if(trick[2] !== undefined && ((trickSlot2.length === 0 && trick[2] !== null) || trickSlot0[2].code !== trick[2].card.code)) {
      setTrickSlot2([
        generateCard(trick[2].card.code),
      ]);
    }
    if(trick[3] !== undefined && ((trickSlot3.length === 0 && trick[3] !== null) || trickSlot0[3].code !== trick[3].card.code)) {
      setTrickSlot3([
        generateCard(trick[3].card.code),
      ]);
    }
  }
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

      {isMatchTesterVisible && (
        <div
          className="matchtester"
          draggable
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
              ])}
          >
            testAddTrick2Card
          </Button>

          <Button
            onClick={() =>
              setTrickSlot3([
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
              ])}
          >
            testAddTrick3Card
          </Button>

          <Button
            onClick={() =>
              setTrickSlot0([
                {
                  code: "5S", // Example: Two of Hearts
                  suit: "Spades",
                  value: BigInt(5),
                  image: "https://deckofcardsapi.com/static/img/5S.png", // Example image URL
                  flipped: false,
                  backimage: cardback,
                  onClick: (code: string) => {
                    console.log(`Card clicked: ${code}`);
                  },
                },
              ])}
          >
            testAddTrick0Card
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
                  code: "2C", // Example: Two of Hearts
                  suit: "Clubs",
                  value: BigInt(2),
                  image: "https://deckofcardsapi.com/static/img/2C.png", // Example image URL
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
            onClick={() => {
              setCurrentGamePhase("passing");
              console.log("Game phase set to passing");
            }}
          >
            setGamePhasePassing
          </Button>

          <Button
            onClick={() => {
              setCurrentGamePhase("playing");
              console.log("Game phase set to playing");
            }}
          >
            setGamePhasePlaying
          </Button>

          <Button
            onClick={() => {
              setCurrentPlayer("User1");
              console.log("Player set to User1");
            }}
          >
            setPlayerUser1
          </Button>

          <Button
            onClick={() => console.log("current cardsToPass: ", cardsToPass)}
          >
            logCardsToPass
          </Button>

          <Button
            onClick={() => {
              handlePassCards();
            }}
          >
            PassCardsToOpponent
          </Button>

          <Button
            onClick={() => {
              setOpponentToPassTo("Opponent1");
              console.log("Opponent to pass to set to Opponent1");
            }}
          >
            SetOpponentToPassTo1
          </Button>

          <Button
            onClick={() => {
              setOpponentToPassTo("Opponent2");
              console.log("Opponent to pass to set to Opponent2");
            }}
          >
            SetOpponentToPassTo2
          </Button>

          <Button
            onClick={() => {
              setOpponentToPassTo("Opponent3");
              console.log("Opponent to pass to set to Opponent3");
            }}
          >
            SetOpponentToPassTo3
          </Button>

          <Button
            onClick={() => {
              setCurrentTrick("");
              console.log("Current trick set to empty");
            }}
          >
            SetTrickEmpty
          </Button>

          <Button
            onClick={() => {
              setCurrentTrick("Hearts");
              console.log("Current trick set to Hearts");
            }}
          >
            SetTrickHearts
          </Button>

          <Button
            onClick={() => {
              setCurrentTrick("Spades");
              console.log("Current trick set to Spades");
            }}
          >
            SetTrickSpades
          </Button>

          <Button
            onClick={() => {
              setHeartsBroken(!heartsBroken);
              console.log("Hearts broken set to: ", heartsBroken);
            }}
          >
            ToggleHeartsBroken
          </Button>

          <Button
            onClick={() => {
              setIsFirstRound(!isFirstRound);
              console.log("Set isFirstRound: ", isFirstRound);
            }}
          >
            ToggleIsFirstRound
          </Button>

          <Button
            onClick={() => {
              setFirstCardPlayed(!firstCardPlayed);
              console.log("Set FirstCardPlayed: ", firstCardPlayed);
            }}
          >
            ToggleIsFirstCard
          </Button>
            
          <Button
          onClick={() => {
            calculateTrickWinner();
          }}
          >
          CalculateTrickWinner
          </Button>

          <Button
      onClick={() => {
        setIsMatchTesterVisible(false); // Hide the matchtester
        setTimeout(() => {
          setIsMatchTesterVisible(true); // Show it again after 10 seconds
        }, 10000); // 10 seconds
      }}
    >
      Hide MatchTester
    </Button>
        </div>
      )}  
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
              src={playerAvatars[0] ? playerAvatars[0] : "/avatars_118x118/a104.png"}
              alt="avatar"
              width={72}
              height={72}
            />
          </div>
          <div className="game-playername">
            {players[0] ? players[0] : "AI Player"}
          </div>
          <div className="game-playerscore">Score: {roundScore[0]}</div>
        </div>

        <div className="game-playerscore1">
          <div className="game-avatarbox">
            <Image
              className="player-avatar"
              src={playerAvatars[1] ? playerAvatars[1] : "/avatars_118x118/a104.png"}
              alt="avatar"
              width={72}
              height={72}
            />
          </div>
          <div className="game-playername">
            {players[1] ? players[1] : "AI Player"}
          </div>
          <div className="game-playerscore">Score: {roundScore[1]}</div>
        </div>

        <div className="game-playerscore2">
          <div className="game-avatarbox">
            <Image
              className="player-avatar"
              src={playerAvatars[2] ? playerAvatars[2] : "/avatars_118x118/a104.png"}
              alt="avatar"
              width={72}
              height={72}
            />
          </div>
          <div className="game-playername">
            {players[2] ? players[2] : "AI Player"}
          </div>
          <div className="game-playerscore">Score: {roundScore[2]}</div>
        </div>

        <div className="game-playerscore3">
          <div className="game-avatarbox">
            <Image
              className="player-avatar"
              src={playerAvatars[3] ? playerAvatars[3] : "/avatars_118x118/a104.png"}
              alt="avatar"
              width={72}
              height={72}
            />
          </div>
          <div className="game-playername">
            {players[3] ? players[3] : "AI Player"}
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
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1890ff")} // Blue on hover
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#d3d3d3")} // Back to grey
          >
            Pass Cards
          </button>
        )}

      </div>
    </div>
  );
};

export default MatchPage;
