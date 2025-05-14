"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering
import "@ant-design/v5-patch-for-react-19";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button, Dropdown, message } from "antd";
import DebugOverlay from "@/components/DebugOverlay";
// import { BookOutlined, CodeOutlined, GlobalOutlined } from "@ant-design/icons";
import styles from "@/styles/page.module.css";
import modalStyles from "@/styles/modalMessage.module.css";
import { useApi } from "@/hooks/useApi";
import { handleApiError } from "@/utils/errorHandlers";
import { MatchMessage } from "@/types/matchMessage"; // adjust path as needed
import cardStyles from "@/styles/card.module.css";

// import { Match } from "@/types/match";
import { useEffect, useState, useRef } from "react";
import { PollingDTO } from "@/types/polling";
import SettingsPopup from "@/components/SettingsPopup";
import Card, { cardProps } from "@/components/card";
import { TrickDTO } from "@/types/trick";
import { DownOutlined } from "@ant-design/icons";
import { useCallback } from "react";

const MatchPage: React.FC = () => {
  const USE_AUTOMATIC_POLLING = true; // switch to true for auto every 2000ms

  
  const [pollingResponse, setPollingResponse] = useState<PollingDTO | null>(null);
  
  const debugData = {
    matchPhase: pollingResponse?.matchPhase ?? 'UNKNOWN',
    gamePhase: pollingResponse?.gamePhase ?? 'UNKNOWN',
    trickPhase: pollingResponse?.trickPhase ?? 'UNKNOWN',
    players: Object.values(pollingResponse?.playerPoints ?? {}).map(
      (score) => ({ gameScore: score })
    ),
    playerPointsString: Object.values(pollingResponse?.playerPoints ?? {}).join(', ')
  };

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

  const [/*currentTrick*/, setCurrentTrick] = useState("");
  const [currentPlayer, setCurrentPlayer] = useState("");
  const [currentGamePhase, setCurrentGamePhase] = useState("");
  const [lastTrickPhase, setLastTrickPhase] = useState<
    "READY" | "JUSTCOMPLETED" | "RUNNING"
  >("RUNNING");
  const [trickPhase, setTrickPhase] = useState<
    "READY" | "JUSTCOMPLETED" | "RUNNING"
  >("RUNNING");
  const [cardsToPass, setCardsToPass] = useState<cardProps[]>([]);
  const [/*heartsBroken*/, setHeartsBroken] = useState(false);
  const [firstCardPlayed, setFirstCardPlayed] = useState(false);
  //const [isFirstRound, setIsFirstRound] = useState(true);
  const [myTurn, setMyTurn] = useState(false);
  const [playableCards, setPlayableCards] = useState<Array<string | null>>([]);
  const [pollingPausedUntil, setPollingPausedUntil] = useState<number | null>(
    null,
  );
  
  const [isWaitingForPlayers, setIsWaitingForPlayers] = useState(false);
  const [isLeaveGameModalVisible, setIsLeaveGameModalVisible] = useState(false);
  const [hasPassedCards, setHasPassedCards] = useState(false);
  const [hasConfirmedSkipPassing, setHasConfirmedSkipPassing] = useState(false);
  const [timer, setTimer] = useState<number | null>(null);

  const playRandomCardCalled = useRef(false);
  const passRandomCardsCalled = useRef(false);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [playmat, setPlaymat] = useState("");
  const [cardback, setCardback] = useState("");

  //const [slot, setSlot] = useState(1);
  //const [trickLeaderSlot, setTrickLeaderSlot] = useState(2);

  const [htmlContent, setHtmlContent] = useState<string>("");
  const [serverMessages, setServerMessages] = useState<MatchMessage[]>([]);

  ///////////////////////////

  ///////////////////////////

  // handleFastForward for testing, game transitions
  const handleFastForwardGame = async () => {
    if (currentGamePhase !== "NORMALTRICK") {
      message.warning("Fast forward is only available during a normal trick.");
      return;
    }

    try {
      console.log("Fast forwarding game...");
      await apiService.post(`/matches/${matchId}/game/sim/game`, {});
      message.open({
        type: "success",
        content: "Fast-forward to end of game complete",
      });
      await fetchMatchData(); // refresh cards, trick, scores
    } catch (error) {
      handleApiError(error, "Fast-forward failed.");
    }
  };
  // handleFastForward for testing, game transitions
  const handleFastForwardGameShootingTheMoon = async () => {
    if (currentGamePhase !== "NORMALTRICK") {
      message.warning("Fast forward is only available during a normal trick.");
      return;
    }

    try {
      console.log("Fast forwarding game...");
      await apiService.post(`/matches/${matchId}/game/sim/moon`, {});
      message.open({
        type: "success",
        content: "Fast-forward to end of game with moon shot complete",
      });
      await fetchMatchData(); // refresh cards, trick, scores
    } catch (error) {
      handleApiError(error, "Fast-forward failed.");
    }
  };
  // handleFastForward for testing, game transitions
  const handleFastForwardToGameThree = async () => {
    if (currentGamePhase !== "NORMALTRICK") {
      message.warning("Fast forward is only available during a normal trick.");
      return;
    }

    try {
      console.log("Fast forwarding game...");
      await apiService.post(`/matches/${matchId}/game/sim/endofmatchthree`, {});
      message.open({
        type: "success",
        content: "Fast-forward to end of match 3 complete",
      });
      await fetchMatchData(); // refresh cards, trick, scores
    } catch (error) {
      handleApiError(error, "Fast-forward failed.");
    }
  };
  // handleFastForward for testing match end
  const handleFastForwardMatch = async () => {
    if (currentGamePhase !== "NORMALTRICK") {
      message.warning("Fast forward is only available during a normal trick.");
      return;
    }

    try {
      console.log("Fast forwarding match...");
      await apiService.post(`/matches/${matchId}/game/sim/match`, {});
      message.open({
        type: "success",
        content: "Fast-forwarding match complete",
      });
      await fetchMatchData(); // refresh cards, trick, scores
    } catch (error) {
      handleApiError(error, "Fast-forward failed.");
    }
  };

  const isFastForwardAvailable = currentGamePhase === "NORMALTRICK";

  const generateEnemyCard = useCallback((): cardProps => ({
    code: "XX",
    suit: "XX",
    value: BigInt(0),
    cardOrder: 0,
    image: "",
    backimage: cardback,
    flipped: false,
    onClick: () => {},
  }), [cardback]);

  const generateCard = useCallback((code: string, order: number, zIndex: number = 10): cardProps => {
    //console.log("Generating card:", code, order, zIndex);
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

    return {
      code,
      suit: suitToName[suit] || suit,
      value: rankToValue[rank],
      cardOrder: order,
      image: `https://deckofcardsapi.com/static/img/${code}.png`,
      flipped: false,
      backimage: cardback,
      onClick: (code: string) => console.log(`Card clicked: ${code}`),
      zIndex,
    };
  }, [cardback]);

  const handleTrickFromLogic = useCallback((trick: TrickDTO) => {

    const tempTrick: string[] = ["", "", "", ""];
    const orders: number[] = [-1, -1, -1, -1];
    
    trick.cards.forEach(c => {
      tempTrick[c.position] = c.code;
      orders[c.position] = c.order;
    });

    const updateSlot = (
      position: number,
      card: string,
      setSlot: (val: cardProps[]) => void,
      current: cardProps[],
      zIndex: number
    ) => {
      if (
        (card === null && current.length > 0) || // Clear the slot if it has data but should be empty
        (current.length === 0 && card !== null) || // Update the slot if it is empty but should have data
        (current.length > 0 && current[0].code !== card) // Update the slot if the card code has changed
      ) {
        // Create a temporary card before generating the actual card
        if (card !== null && card !== "") {
          const tempCardId = `${card}-${Date.now()}`;
          
          const HAND_POSITIONS = [
            { x: "50%", y: "80%" }, // Player's hand (bottom center)
            { x: "20%", y: "50%" }, // Opponent 1's hand (right center)
            { x: "50%", y: "20%" }, // Opponent 2's hand (top center)
            { x: "80%", y: "50%" }, // Opponent 3's hand (left center)
          ];

          const TRICK_POSITIONS = [
            { x: "50%", y: "60%" }, // Trick slot 0
            { x: "40%", y: "50%" }, // Trick slot 1
            { x: "50%", y: "40%" }, // Trick slot 2
            { x: "60%", y: "50%" }, // Trick slot 3
          ];

          const ROTATIONS = [
          0,    // Position 0 (bottom)
          90,   // Position 1 (left)
          0,    // Position 2 (top)
          90,   // Position 3 (right)
        ];

          const gameboard = document.querySelector(".gameboard") as HTMLElement;
          const gameboardRect = gameboard.getBoundingClientRect();

          const cardWidth = 100; // Width of the card in pixels
          const cardHeight = 140; // Height of the card in pixels

          const { x: startXPercent, y: startYPercent } = HAND_POSITIONS[position];
          const { x: endXPercent, y: endYPercent } = TRICK_POSITIONS[position];

          const startX = (parseFloat(startXPercent) / 100) * gameboardRect.width;
          const startY = (parseFloat(startYPercent) / 100) * gameboardRect.height;
          const endX = (parseFloat(endXPercent) / 100) * gameboardRect.width;
          const endY = (parseFloat(endYPercent) / 100) * gameboardRect.height;
          const rotation = ROTATIONS[position];

          // Create a new div element for the animated card
          const animatedCardDiv = document.createElement('div');
          animatedCardDiv.id = tempCardId;
          animatedCardDiv.style.position = 'absolute';
          animatedCardDiv.style.width = `${cardWidth}px`;
          animatedCardDiv.style.height = `${cardHeight}px`;
          animatedCardDiv.style.left = `${startX - cardWidth / 2}px`;
          animatedCardDiv.style.top = `${startY - cardHeight / 2}px`;
          animatedCardDiv.style.transform = `rotate(${rotation}deg)`;
          animatedCardDiv.style.zIndex = '500';

          // Set transform-origin to center
          animatedCardDiv.style.transformOrigin = 'center';
          
          // Create the card element (you'll need to adjust this based on your Card component)
          const cardElement = document.createElement('div');
          cardElement.style.width = '100%';
          cardElement.style.height = '100%';
          cardElement.innerHTML = `<img src="${generateCard(card, 0, zIndex).image}" style="width: 100%; height: 100%;" />`;
          animatedCardDiv.appendChild(cardElement);
          
          // Add the animated card to the DOM
          const temporaryCardsContainer = document.querySelector(`.${cardStyles.temporaryCards}`);
          if (temporaryCardsContainer) {
            temporaryCardsContainer.appendChild(animatedCardDiv);

            // Animate using requestAnimationFrame
            const startTime = performance.now();
            const duration = 350;

            const animate = (currentTime: number) => {
              const elapsedTime = currentTime - startTime;
              const progress = Math.min(elapsedTime / duration, 1);

              const currentX = startX + (endX - startX) * progress;
              const currentY = startY + (endY - startY) * progress;

              animatedCardDiv.style.left = `${currentX - cardWidth / 2}px`;
              animatedCardDiv.style.top = `${currentY - cardHeight / 2}px`;


              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                // Remove the element when animation is complete
                setTimeout(() => {
                  animatedCardDiv.remove();
                  setSlot([generateCard(card, 0, zIndex)]);
                }, 100);
              }
            };

            requestAnimationFrame(animate);
          }
        } else {
          setSlot([]);
        }

        //setSlot(card === null || card === "" ? [] : [generateCard(card, 0, zIndex)]);
        console.log(`Slot ${position} updated:`, card || "empty");
      } else {
        console.log(
          `Slot ${position} unchanged:`,
          current[0]?.code || "empty"
        );
      }
    };

    updateSlot(0, tempTrick[0], setTrickSlot0, trickSlot0, orders[0]);
    updateSlot(1, tempTrick[1], setTrickSlot1, trickSlot1, orders[1]);
    updateSlot(2, tempTrick[2], setTrickSlot2, trickSlot2, orders[2]);
    updateSlot(3, tempTrick[3], setTrickSlot3, trickSlot3, orders[3]);
  
    
  }, [generateCard, trickSlot0, trickSlot1, trickSlot2, trickSlot3]);


  const fetchMatchData = useCallback(async () => {
    try {
      console.log("Fetching match data");

      const response = await apiService.post<PollingDTO>(
        `/matches/${matchId}/logic`,
        {},
      );
      setPollingResponse(response);
      console.log("Match data response:", response);

      if (response.matchPhase === "FINISHED") {
        console.log("Match is finished. Halting polling.");
        setPollingPausedUntil(Infinity); // Halt polling permanently
      }
      
      setHeartsBroken(response.heartsBroken ?? false);
      setLastTrickPhase(trickPhase);
      setTrickPhase(response.trickPhase);
      setCurrentGamePhase(response.gamePhase ?? "");
      console.log("Backend says myTurn:", response.myTurn);
      setMyTurn(response.myTurn ?? false);
      console.log("myTurn (just set):", response.myTurn ?? false);

      if (Array.isArray(response.matchMessages)) {
        const newMessages = response.matchMessages.filter(
          (msg): msg is MatchMessage =>
            typeof msg.content === "string" && msg.content.trim() !== ""
        );
      
        if (newMessages.length > 0) {
          setServerMessages((prev) => {
            const combined = [...newMessages, ...prev];
      
            // Schedule each new message for removal in 10s
            newMessages.forEach((msg) => {
              setTimeout(() => {
                setServerMessages((curr) =>
                  curr.filter((m) => m.id !== msg.id)
                );
              }, 5000);
            });
      
            return combined;
          });
        }
      }

      const slot = response.playerSlot ?? 0;

      if (response.resultHtml) {
        setHtmlContent(response.resultHtml);
      }

      if (response.gamePhase !== "PASSING") {
        setCardsToPass([]);
        setHasPassedCards(false);
      }

      if (response.gamePhase !== "SKIP_PASSING"){
        setHasConfirmedSkipPassing(false);
      }

      if (response.gamePhase !== "RESULT") {
        setIsWaitingForPlayers(false);
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
        const newHand = response.playerCards.map((item) =>
          generateCard(item.card.code, item.card.cardOrder)
        );

        if (!areHandsEqual(cardsInHand, newHand)) {
          setCardsInHand(newHand);
        } else {
          console.log("No change in hand, not updating state.");
        }
      }

      if (response.playableCards) {
        const playableCardCodes = response.playableCards.map((item) =>
          item.card.code
        );
        setPlayableCards(playableCardCodes);
      }

      if (!firstCardPlayed && (response.currentTrick?.length ?? 0) > 0) {
        setFirstCardPlayed(true);
      }

      /* if (response.trickPhase === "JUSTCOMPLETED") {
        handleFullTrick(
          response.previousTrick || [],
          slot,
          response.previousTrickLeaderPlayerSlot || 0,
        );
      } else { */
        if (response.currentTrickDTO) {
          handleTrickFromLogic(response.currentTrickDTO);
        }
      /* } */

      if (response.cardsInHandPerPlayer) {
        const hand = [
          response.cardsInHandPerPlayer["0"] ?? 0,
          response.cardsInHandPerPlayer["1"] ?? 0,
          response.cardsInHandPerPlayer["2"] ?? 0,
          response.cardsInHandPerPlayer["3"] ?? 0,
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
      console.log("Error caught:", error); // Inspect the error structure

      // Check if the error has a `response` property (e.g., Axios errors)
      if (
        typeof error === "object" && error !== null && "status" in error &&
        error.status === 403
      ) {
        message.open({
          type: "error",
          content: "You are not authorized to view this match.",
        });
        router.push("/landingpageuser");
      } else if (
        typeof error === "object" && error !== null && "status" in error &&
        error.status === 409
      ) {
        message.open({
          type: "error",
          content: "You are not authorized to view this match.",
        });
        router.push("/landingpageuser");
      } else if (error instanceof Error) {
        // Handle standard Error objects
        handleApiError(error, "Failed to fetch match data.");
      } else {
        // Fallback for unexpected error structures
        console.error("Unexpected error structure:", error);
        message.open({
          type: "error",
          content: "An unexpected error occurred. Please try again.",
        });
      }
    }
    console.log("Finished fetchMatchData for", matchId);
  }, [
    matchId,
    firstCardPlayed,
    generateCard,
    handleTrickFromLogic,
    apiService,
    generateEnemyCard,
  ]);

  useEffect(() => {
    if (USE_AUTOMATIC_POLLING) {
      const intervalId = setInterval(() => {
        const now = Date.now();
        if (!pollingPausedUntil || now > pollingPausedUntil) {
          fetchMatchData();
        } else if (pollingPausedUntil === Infinity) {
          return; // Stop polling permanently
        } else {
          console.log(
            "⏸ Polling paused until",
            new Date(pollingPausedUntil).toLocaleTimeString(),
          );
        }
      }, 1000);

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

      globalThis.addEventListener("keydown", handleKeyPress);
      return () => {
        globalThis.removeEventListener("keydown", handleKeyPress);
      };
    }
  }, [matchId, USE_AUTOMATIC_POLLING, fetchMatchData, pollingPausedUntil]);

  useEffect(() => {
    if (trickPhase === "JUSTCOMPLETED") {
      // lock UI / show animation / highlight cards
      setPlayableCards([]);
      setMyTurn(false);
    }
  }, [trickPhase]);

  useEffect(() => {
    if (lastTrickPhase === "JUSTCOMPLETED" && trickPhase === "READY") {
      // Delay the clearing to let the user see the trick
      const timeoutId = setTimeout(() => {
        handleClearTrick();
      }, 1500); // 1.5 seconds delay

      // Cleanup in case the component unmounts before timeout
      return () => clearTimeout(timeoutId);
    }
  }, [lastTrickPhase, trickPhase]);

  useEffect(() => {
    console.log("PlayableCards updated:", playableCards);
  }, [cardback, playableCards]);

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  // sets default settings and sets them to local storage, unless they already exist
  useEffect(() => {

    const playMatColors = [
      "darkgreen",
      "darkred",
      "darkblue",
      "rebeccapurple",
      "orange",
      "white",
      "black",
    ];

    if (localStorage.getItem("playmat") && playMatColors.includes(localStorage.getItem("playmat") || "")) {
      setPlaymat(localStorage.getItem("playmat") || "");
    } else {
      setPlaymat("#darkgreen"); // Default playmat
      localStorage.setItem("playmat", "darkgreen");
    }
    if (localStorage.getItem("cardback") && /^\/card_back\/b10[1-6]\.png$/.test(localStorage.getItem("cardback") || "")) {
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
        message.open({
          type: "warning",
          content: "You may not pass more than 3 cards.",
        });
        console.log("You may not pass more than 3 cards.");
      }
    } else {
      if (
        currentGamePhase !== "NORMALTRICK" &&
        currentGamePhase !== "FIRSTTRICK" &&
        currentGamePhase !== "FINALTRICK"
      ) {
        message.open({
          type: "warning",
          content: "You cannot play a card in this phase.",
        });
        console.log(" Not in a playable phase.");
        return;
      }

      if (!myTurn) {
        message.open({
          type: "warning",
          content: "It's not your turn.",
        });
        console.log("Not your turn.");
        return;
      }

      const trickOk = verifyTrick(card);
      console.log("verifyTrick =", trickOk);
      if (!trickOk) {
        message.open({
          type: "error",
          content: "This card is not valid for the current trick.",
        });
        console.log("Trick verification failed.");
        return;
      }
      try {
        const payload = {
          gameId: matchId,
          card: card.code,
        };
        console.log("Sending card play request:", payload);

        // Immediately lock UI so the player can't double-click
        setPlayableCards([]);
        setMyTurn(false);

        // Send the request to play the card
        const response = await apiService.post(
          `/matches/${matchId}/play`,
          payload,
        );
        console.log("Card play response:", response);

        const updatedCardsInHand = cardsInHand.filter((c) =>
          c.code !== card.code
        );
        setCardsInHand(updatedCardsInHand);
        setCurrentPlayer(players[1] || "");
        console.log("currentPlayer:", currentPlayer);

        // Then fetch the updated game state
        setPollingPausedUntil(Date.now() + 1500); // pause for 1.5s
        await fetchMatchData();
      } catch (error) {
        handleApiError(error);
      }
    }
  };

  // Checks if the played card is a valid play in the current trick.
  // uses the played card, the existing trick, and the player's hand to determine if the play is valid.
  // We use the status of trickslot3 to determine if the player is playing the first card of the trick or not.
  const verifyTrick = (card: cardProps) => {
    console.log("Verifying trick for card: ", card.code);
    console.log("playableCards: ", playableCards);

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
      message.open({
        type: "warning",
        content: "You must select 3 cards to pass.",
      });
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
        message.open({
          type: "error",
          content: "Failed to pass cards. Please try again.",
        });
        console.error(
          "Error passing cards: Invalid or empty response from server.",
        );
        return;
      }

      setHasPassedCards(true);
      setTimer(Infinity); // Stop the timer if it was running
    } catch (error) {
      handleApiError(error, "An error occurred while passing cards.");
    }
  };

  const handleClearTrick = () => {
    setTrickSlot0([]);
    setTrickSlot1([]);
    setTrickSlot2([]);
    setTrickSlot3([]);
    setCurrentTrick("");
  };

  const sortCards = (cards: cardProps[]) => {
    return cards.sort((a, b) => {
      console.log("Comparing cards:", a.code, " | ", b.code);
      if (a.cardOrder < b.cardOrder) return -1;
      if (a.cardOrder > b.cardOrder) return 1;
      return 0;
    });
  };

  useEffect(() => {
    const sortedCards = sortCards(cardsInHand);
    setCardsInHand(sortedCards);
  }, [cardsInHand]);

  const areHandsEqual = (hand1: cardProps[], hand2: cardProps[]) => {
    if (hand1.length !== hand2.length) return false;

    const hand1Codes = hand1.map((card) => card.code).sort();
    const hand2Codes = hand2.map((card) => card.code).sort();

    return hand1Codes.every((code, index) => code === hand2Codes[index]);
  };

  const handleConfirmNewGame = async () => {
    try {
      console.log("Confirming new game...");
      await apiService.post(`/matches/${matchId}/game/confirm`, {});
      console.log("New game confirmed.");
      setIsWaitingForPlayers(true); // Update state to show "Waiting for other players"
    } catch (error) {
      handleApiError(error, "Could not confirm the new game.");
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
      setPollingPausedUntil(Infinity);
      await apiService.delete(`/matches/${matchId}/leave`);
      router.push("/landingpageuser"); // Redirect to the home page after leaving the game
      console.log("Game left.");
    } catch (error) {
      setPollingPausedUntil(null);
      handleApiError(error, "Could not leave the game.");
    } finally {
      hideLeaveGameModal(); // Hide the modal
    }
  };

  const getDisplayName = (fullName: string | null) => {
    if (!fullName) return "";
    return fullName.split(" (")[0]; // cuts off anything after ' ('
  };

  useEffect(() => {
    console.log("Cards to pass:", cardsToPass);
    console.log("Has passed cards:", hasPassedCards);
  }, [cardsToPass, hasPassedCards]);

  useEffect(() => {
    console.log("Waiting for players:", isWaitingForPlayers);
  }, [isWaitingForPlayers]);

  useEffect(() => {

    if (currentGamePhase === "PASSING") {
      console.log("It's my turn to pass cards! Starting 45-second timer...");
      setTimer(45); // Start the timer at 45 seconds
      passRandomCardsCalled.current = false;

      const intervalId = setInterval(() => {
        setTimer((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(intervalId); // Stop the timer when it reaches 0
            passRandomCards(); // Pass three random cards
            return Infinity;
          }
          return prev - 1; // Decrement the timer
        });
      }, 1000);

      return () => clearInterval(intervalId); // Cleanup on unmount or when `myTurn` changes
    } else if (myTurn){
       if (
        currentGamePhase === "FIRSTTRICK" ||
        currentGamePhase === "NORMALTRICK" ||
        currentGamePhase === "FINALTRICK"
      ) {
        console.log("It's my turn to play a card! Starting 30-second timer...");
        setTimer(30); // Start the timer at 30 seconds
        playRandomCardCalled.current = false;

        const intervalId = setInterval(() => {
          setTimer((prev) => {
            if (prev === null || prev <= 1) {
              clearInterval(intervalId); // Stop the timer when it reaches 0
              playRandomCard(); // Play a random card
              return Infinity;
            }
            return prev - 1; // Decrement the timer
          });
        }, 1000);

        return () => clearInterval(intervalId); // Cleanup on unmount or when `myTurn` changes
      }
    } else {
      setTimer(Infinity); // Reset the timer when it's no longer the player's turn
    }
  }, [myTurn, currentGamePhase]);

  const playRandomCard = async () => {
    if (playRandomCardCalled.current) {
      console.log("playRandomCard already called. Skipping...");
      return;
    }
  
    playRandomCardCalled.current = true; // Mark as called
  
    if (playableCards.length === 0) {
      console.log("No playable cards available.");
      return;
    }
  
    await apiService.post(`/matches/${matchId}/play/any`, {});
    console.log("Random card played.");
  };

  const passRandomCards = async () => {
    if (passRandomCardsCalled.current) {
      console.log("passRandomCards already called. Skipping...");
      return;
    }
  
    passRandomCardsCalled.current = true; // Mark as called
  
    if (cardsInHand.length < 3) {
      console.log("Not enough cards to pass.");
      return;
    }
  
    const shuffledCards = [...cardsInHand].sort(() => Math.random() - 0.5); // Shuffle the cards
    const randomCardsToPass = shuffledCards.slice(0, 3); // Select the first 3 cards
  
    try {
      const payload = {
        gameId: matchId,
        cards: randomCardsToPass.map((card) => card.code), // Send only the card codes
      };
      console.log("Passing random cards:", payload);
  
      // Make the API request
      const response = await apiService.post(
        `/matches/${matchId}/passing`,
        payload,
      );
  
      if (!response || typeof response !== "object") {
        message.open({
          type: "error",
          content: "Failed to pass cards. Please try again.",
        });
        console.error(
          "Error passing cards: Invalid or empty response from server.",
        );
        return;
      }
  
      setHasPassedCards(true);
      setCardsToPass(randomCardsToPass); // Update the state with the passed cards
      console.log("Random cards passed successfully.");
    } catch (error) {
      handleApiError(error, "An error occurred while passing cards.");
    }
  };

  const handleSkipPassingConfirm = async () => {
    try {
      const payload = {
        cards: [], // Empty array for SKIP_PASSING
      };
      console.log("Sending skip passing payload:", payload);
  
      // Send the request
      await apiService.post(`/matches/${matchId}/passing`, payload);
      setHasConfirmedSkipPassing(true); // Mark as confirmed
      console.log("Skip passing confirmed.");

    } catch (error) {
      handleApiError(error, "An error occurred while confirming skip passing.");
    }
  };

  useEffect(() => {
    console.log("Has confirmed skip passing:", hasConfirmedSkipPassing);
  }
  , [hasConfirmedSkipPassing]);


  return (
    <div className={`${styles.page} matchPage`}>
      <div className="message-box">
        {serverMessages.map((msg) => (
          <div
            key={msg.id}
            className={`message message-${msg.type.toLowerCase()}`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <div className="menu-dropdown">
        <Dropdown
          menu={{
            items: [
              { key: "1", label: "Settings", onClick: () => toggleSettings() },
              { key: "2", label: "Rules" /*onClick: () => toggleSettings()*/ },
              { key: "3", label: "Leave Match", onClick: showLeaveGameModal},
              { type: "divider" },
              ...(isFastForwardAvailable && myTurn
                ? [
                  {
                    key: "4",
                    label: "FF near game end",
                    onClick: handleFastForwardGame,
                  },
                  {
                    key: "5",
                    label: "FF shooting the moon",
                    onClick: handleFastForwardGameShootingTheMoon,
                  },
                  {
                    key: "6",
                    label: "FF to end of third game",
                    onClick: handleFastForwardToGameThree,
                  },
                  {
                    key: "7",
                    label: "FF near match end",
                    onClick: handleFastForwardMatch,
                  },
                ]
                : []),
            ],
          }}
          trigger={["click"]}
        >
          <Button type="default">
            Menu <DownOutlined />
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
              <td>{players[0] ? players[0] : ""}</td>
              <td>{players[0] ? matchScore[0] : ""}</td>
            </tr>
            <tr>
              <td>{players[1] ? players[1] : ""}</td>
              <td>{players[1] ? matchScore[1] : ""}</td>
            </tr>
            <tr>
              <td>{players[2] ? players[2] : ""}</td>
              <td>{players[2] ? matchScore[2] : ""}</td>
            </tr>
            <tr>
              <td>{players[3] ? players[3] : ""}</td>
              <td>{players[3] ? matchScore[3] : ""}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="gameboard">

      <div className={`${cardStyles.temporaryCards}`} />



        <div className="hand-0">
          {cardsInHand.map((card, index) => (
            <Card
              key={index}
              code={card.code}
              suit={card.suit}
              value={card.value}
              cardOrder={card.cardOrder}
              image={card.image}
              backimage={cardback}
              flipped
              onClick={currentGamePhase === "PASSING" && hasPassedCards
                ? () => {}
                : () => handlePlayCard(card)}
              isSelected={cardsToPass.some((c) => c.code === card.code)}
              isPlayable={playableCards.includes(card.code)}
              isPassable={currentGamePhase === "PASSING"}
              isDisabled={currentGamePhase === "PASSING" && hasPassedCards}
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
              cardOrder={card.cardOrder}
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
              cardOrder={card.cardOrder}
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
              cardOrder={card.cardOrder}
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
          {[trickSlot0, trickSlot1, trickSlot2, trickSlot3].map((slot, index) => {
            // Render the card if the slot is not empty
            return slot.length > 0 ? (
              <div
                key={index}
                style={{
                  position: "absolute",
                  top: index === 0 ? "75%" : index === 1 ? "50%" : index === 2 ? "25%" : "50%",
                  left: index === 0 ? "50%" : index === 1 ? "25%" : index === 2 ? "50%" : "75%",
                  transform: `translate(-50%, -50%) rotate(${index * 90}deg) scale(1.5)`, // Rotate and scale
                  zIndex: slot[0].zIndex, // Use the zIndex from the card object
                }}
              >
                <Card
                  code={slot[0].code}
                  suit={slot[0].suit}
                  value={slot[0].value}
                  cardOrder={slot[0].cardOrder}
                  image={slot[0].image}
                  backimage={cardback}
                  flipped
                  onClick={slot[0].onClick}
                  zIndex={slot[0].zIndex} // Pass zIndex to the Card component
                />
              </div>
            ) : null; // Render nothing if the slot is empty
          })}
        </div>

        <div className="game-playerscore0">
          <div className="game-avatarbox">
            <Image
              className="player-avatar"
              src={playerAvatars[0]
                ? playerAvatars[0]
                : "/avatars_118x118/a000.png"}
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
                : "/avatars_118x118/a000.png"}
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
                : "/avatars_118x118/a000.png"}
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
                : "/avatars_118x118/a000.png"}
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

        {currentGamePhase === "PASSING" && cardsToPass.length < 3 && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1000,
              backgroundColor: "darkgreen", // Dark green background
              color: "white", // White text color
              border: "2px solid white",
              padding: "20px",
              borderRadius: "10px",
              textAlign: "center",
              width: "400px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)", // Add a shadow for better visibility
            }}
          >
            <p style={{ fontSize: "1.2rem", margin: 0 }}>
              Select 3 cards to pass to your opponent
            </p>
          </div>
        )}

        {currentGamePhase === "PASSING" && cardsToPass.length === 3 && !hasPassedCards && (
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
              backgroundColor: "darkgreen", // Light grey background
              color: "white", // Black text color
              border: "2px solid white",
              borderRadius: "10px", // Slightly rounded corners
              cursor: "pointer",
              transition: "background-color 0.3s ease", // Smooth transition for hover effect
            }}
            onMouseEnter={(
              e,
            ) => (e.currentTarget.style.backgroundColor = "#1890ff")} // Blue on hover
            onMouseLeave={(
              e,
            ) => (e.currentTarget.style.backgroundColor = "darkgreen")} // Back to grey
          >
            Pass Cards
          </button>
        )}

        {currentGamePhase === "PASSING" && hasPassedCards && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1000,
              backgroundColor: "darkgreen",
              color: "white",
              border: "2px solid white",
              padding: "20px",
              borderRadius: "10px",
              textAlign: "center",
              width: "400px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
            }}
          >
            <p style={{ fontSize: "1.2rem", margin: 0 }}>
              Waiting for other players...
            </p>
          </div>
        )}

        {currentGamePhase === "SKIP_PASSING" && !hasConfirmedSkipPassing && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1000,
              backgroundColor: "darkgreen",
              color: "white",
              border: "2px solid white",
              padding: "20px",
              borderRadius: "10px",
              textAlign: "center",
              width: "400px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
            }}
          >
            <p style={{ fontSize: "1.2rem", marginBottom: "20px" }}>
              Skipping phase is skipped every 4th round.
            </p>
            <button
              type="button"
              onClick={async () => {
                await handleSkipPassingConfirm();
              }}
              style={{
                padding: "10px 20px",
                fontSize: "1rem",
                backgroundColor: "white",
                color: "darkgreen",
                border: "2px solid darkgreen",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Confirm
            </button>
          </div>
        )}

        {currentGamePhase === "SKIP_PASSING" && hasConfirmedSkipPassing && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1000,
              backgroundColor: "darkgreen",
              color: "white",
              border: "2px solid white",
              padding: "20px",
              borderRadius: "10px",
              textAlign: "center",
              width: "400px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
            }}
          >
            <p style={{ fontSize: "1.2rem", margin: 0 }}>
              Waiting for other players...
            </p>
          </div>
        )}

        {((pollingResponse?.matchPhase === "IN_PROGRESS" && pollingResponse?.gamePhase === "RESULT") ||
         (pollingResponse?.matchPhase === "RESULT" && pollingResponse?.gamePhase === "FINISHED"))
        && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1000,
              backgroundColor: "darkgreen",
              color: "white",
              padding: "20px",
              border: "2px solid white",
              borderRadius: "10px",
              textAlign: "center",
              width: "fit-content", // Automatically adjust width based on content
              maxWidth: "90%", // Optional: Limit the maximum width for responsiveness
              height: "auto", // Automatically adjust height based on content
              maxHeight: "80%", // Optional: Limit the maximum height for responsiveness
              overflowY: "auto", // Add scrolling if content overflows vertically
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

            <div style={{ marginBottom: "15px" }} />

            {/* Confirm button or waiting message */}
            {!isWaitingForPlayers
              ? (
                <Button
                  onClick={handleConfirmNewGame}
                  className={styles.whiteButton}
                >
                  Confirm
                </Button>
              )
              : (
                <div
                  style={{
                    marginTop: "20px",
                    padding: "10px 20px",
                    fontSize: "1rem",
                    backgroundColor: "darkgreen",
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
                backgroundColor: "darkgreen", // Dark background for the modal
                padding: "20px",
                border: "2px solid white",
                borderRadius: "10px",
                textAlign: "center",
                width: "300px",
                color: "white", // Light text color for contrast
              }}
            >
              <p style={{ fontSize: "1.2rem", marginBottom: "20px" }}>
                Are you sure you want to leave the game?
              </p>
              
              
              <div style={{ display: "flex", justifyContent: "space-around" }}>
                <Button
                  onClick={handleLeaveGame}
                  className={styles.whiteButton}
                  style={{
                    backgroundColor: "#f44336",
                    color: "white",
                  }}
                >
                  Leave
                </Button>
                <Button
                  onClick={hideLeaveGameModal}
                  className={styles.whiteButton}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {(myTurn && timer !== null && timer !== Infinity &&
        (currentGamePhase === "FIRSTTRICK" ||
          currentGamePhase === "NORMALTRICK" ||
          currentGamePhase === "FINALTRICK") ||
        (currentGamePhase === "PASSING" && timer !== null && timer !== Infinity)) &&
        (
          <div
            style={{
              position: "absolute",
              top: "10%",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "darkgreen",
              color: "white",
              padding: "10px 20px",
              borderRadius: "10px",
              fontSize: "1.5rem",
              zIndex: 1000,
            }}
          >
            Time Remaining: {timer}s
          </div>
        )}

      {(pollingResponse?.matchPhase === "FINISHED") && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1000,
            backgroundColor: "darkgreen",
            color: "white",
            padding: "20px",
            border: "2px solid white",
            borderRadius: "10px",
            textAlign: "center",
            width: "fit-content", // Automatically adjust width based on content
            maxWidth: "90%", // Optional: Limit the maximum width for responsiveness
            height: "auto", // Automatically adjust height based on content
            maxHeight: "80%", // Optional: Limit the maximum height for responsiveness
            overflowY: "auto", // Add scrolling if content overflows vertically
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)", // Add a shadow for better visibility
          }}
        >
          <div>
            <h2>Match Finished</h2>
            <div
              className={`${modalStyles.modalMessage} ${                
                  modalStyles.modalMessageMatchFinished
                }`}
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>
          <button
            type="button"
            onClick={() => router.push("/landingpageuser")} // Route to landing page
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              fontSize: "1rem",
              backgroundColor: "white",
              color: "darkgreen",
              border: "2px solid darkgreen",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Leave Match
          </button>          
        </div>
      )}


        <DebugOverlay gameData={debugData} />
    </div>
  );
};

export default MatchPage;
