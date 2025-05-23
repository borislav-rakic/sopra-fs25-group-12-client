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

// import { Match } from "@/types/match";
import { createRef, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { PollingDTO } from "@/types/polling";
import SettingsPopup from "@/components/SettingsPopup";
import Card, { cardProps } from "@/components/card";
import { TrickDTO } from "@/types/trick";
import { DownOutlined } from "@ant-design/icons";
import { useCallback } from "react";
import { PlayerCard } from "@/types/playerCard";

const MatchPage: React.FC = () => {
  const USE_AUTOMATIC_POLLING = true; // switch to true for auto every 2000ms

  const [pollingResponse, setPollingResponse] = useState<PollingDTO | null>(
    null,
  );

  const debugData = {
    matchPhase: pollingResponse?.matchPhase ?? "UNKNOWN",
    gamePhase: pollingResponse?.gamePhase ?? "UNKNOWN",
    trickPhase: pollingResponse?.trickPhase ?? "UNKNOWN",
    players: Object.values(pollingResponse?.playerPoints ?? {}).map(
      (score) => ({ gameScore: score }),
    ),
    playerPointsString: Object.values(pollingResponse?.playerPoints ?? {}).join(
      ", ",
    ),
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
  const [/*roundScore*/, setRoundScore] = useState([0, 0, 0, 0]);

  const [currentPlayer, setCurrentPlayer] = useState("");
  const [currentGamePhase, setCurrentGamePhase] = useState("");
  const [trickPhase, setTrickPhase] = useState<
    "READYFORFIRSTCARD" | "JUSTCOMPLETED" | "RUNNING" | "PROCESSINGTRICK"
  >("RUNNING");
  const [cardsToPass, setCardsToPass] = useState<cardProps[]>([]);
  const [myTurn, setMyTurn] = useState(false);
  const [playableCards, setPlayableCards] = useState<Array<string | null>>([]);
  const playableCardsRef = useRef(playableCards);
  const [pollingPausedUntil, setPollingPausedUntil] = useState<number | null>(
    null,
  );

  const [isWaitingForPlayers, setIsWaitingForPlayers] = useState(false);
  const [isLeaveGameModalVisible, setIsLeaveGameModalVisible] = useState(false);
  const [hasPassedCards, setHasPassedCards] = useState(false);
  const [hasConfirmedSkipPassing, setHasConfirmedSkipPassing] = useState(false);
  const [timer, setTimer] = useState<number | null>(null);
  const [trickWinner, setTrickWinner] = useState<string | null>(null);

  const playRandomCardCalled = useRef(false);
  const passRandomCardsCalled = useRef(false);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [playmat, setPlaymat] = useState("");
  const [cardback, setCardback] = useState("");

  const DEAL_ANIMATION_DURATION = 3500;
  const isDealing = useRef<boolean>(false);

  const PASSING_ANIMATION_DURATION = 1750;
  const passNow = useRef<boolean>(false);
  const [previousGamePhase, setPreviousGamePhase] = useState<string>("");
  const passingCardsforAnimation = useRef<string[]>(["", "", ""]);
  const passId = useRef<number>(0);
  const [pendingPassingAnimation, setPendingPassingAnimation] = useState<
    {
      passing: string[];
      receiving: string[];
      passingToId: number;
    } | null
  >(null);
  const [pendingPassingRemoveDone, setPendingPassingRemoveDone] = useState<
    null | {
      response: PollingDTO;
      receivedCards: string[];
      passingCards: string[];
      passToId: number;
    }
  >(null);

  const CLEANUP_ANIMATION_DURATION = 1000;
  const cleanupNow = useRef<boolean>(false);
  const previousWinner = useRef<number>(-1);

  const [htmlContent, setHtmlContent] = useState<string>("");
  const [serverMessages, setServerMessages] = useState<MatchMessage[]>([]);

  const gameboardRef = useRef<HTMLDivElement>(null);
  const [gameboardSize, setGameboardSize] = useState({
    width: 1000,
    height: 800,
  });

  const CARD_WIDTH = gameboardSize.width * 0.1;
  const CARD_HEIGHT = CARD_WIDTH * 1.397;

  const cardRefs = useRef<Array<React.RefObject<HTMLDivElement>>>(
    [],
  );

  const [fetchErrorCount, setFetchErrorCount] = useState(0);
  const [lastFetchError, setLastFetchError] = useState<unknown>(null);

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

  // only allow fast forward in development during a normal trick.
  const isFastForwardAvailable = process.env.NODE_ENV === "development" &&
    currentGamePhase === "NORMALTRICK";

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

  const generateCard = useCallback(
    (code: string, order: number, zIndex: number = 10): cardProps => {
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
    },
    [cardback],
  );

  const handleTrickFromLogic = useCallback((trick: TrickDTO) => {
    const tempTrick: string[] = ["", "", "", ""];
    const orders: number[] = [-1, -1, -1, -1];

    trick.cards.forEach((c) => {
      tempTrick[c.position] = c.code;
      orders[c.position] = c.order;
    });

    const updateSlot = (
      position: number,
      card: string,
      setSlot: (val: cardProps[]) => void,
      current: cardProps[],
      zIndex: number,
    ) => {
      if (
        (card === null && current.length > 0) ||
        (current.length === 0 && card !== null) ||
        (current.length > 0 && current[0].code !== card)
      ) {
        if (card !== null && card !== "") {
          const tempCardId = `${card}-${Date.now()}`;

          const HAND_POSITIONS = [
            { x: "50%", y: "80%" }, // Player's hand (bottom center)
            { x: "20%", y: "50%" }, // Opponent 1's hand (left center)
            { x: "50%", y: "20%" }, // Opponent 2's hand (top center)
            { x: "80%", y: "50%" }, // Opponent 3's hand (right center)
          ];

          const directions = [
            [0, 1], // Player 0: down
            [-1, 0], // Player 1: left
            [0, -1], // Player 2: up
            [1, 0], // Player 3: right
          ];
          const [dx, dy] = directions[position];

          const ROTATIONS = [
            0, // Position 0 (bottom)
            90, // Position 1 (left)
            180, // Position 2 (top)
            270, // Position 3 (right)
          ];

          const gameboard = document.querySelector(".gameboard") as HTMLElement;
          const gameboardRect = gameboard.getBoundingClientRect();

          const cardWidth = CARD_WIDTH;
          const cardHeight = CARD_HEIGHT;
          const scale = 1.2;

          // Start position
          const { x: startXPercent, y: startYPercent } =
            HAND_POSITIONS[position];
          let startX = (parseFloat(startXPercent) / 100) * gameboardRect.width;
          let startY = (parseFloat(startYPercent) / 100) * gameboardRect.height;

          // If it's your card, use the DOM rect
          if (position === 0 && lastPlayedCardRect.current) {
            const rect = lastPlayedCardRect.current;
            startX = rect.left - gameboardRect.left + rect.width / 2;
            startY = rect.top - gameboardRect.top + rect.height / 2;
          }

          // End position: center + shift in direction
          const centerX = gameboardRect.width / 2;
          const centerY = gameboardRect.height / 2;
          const endX = centerX + dx * ((cardHeight * scale) / 2);
          const endY = centerY + dy * ((cardHeight * scale) / 2);
          const rotation = ROTATIONS[position];

          // Create the animated card
          const animatedCardDiv = document.createElement("div");
          animatedCardDiv.id = tempCardId;
          animatedCardDiv.className = "trick-card";
          animatedCardDiv.style.position = "absolute";
          animatedCardDiv.style.left = `${startX}px`;
          animatedCardDiv.style.top = `${startY}px`;
          animatedCardDiv.style.width = `${cardWidth}px`;
          animatedCardDiv.style.height = `${cardHeight}px`;
          animatedCardDiv.style.transform =
            `translate(-50%, -50%) scale(1) rotate(${rotation}deg)`;
          animatedCardDiv.style.zIndex = "500";
          animatedCardDiv.style.pointerEvents = "none";
          animatedCardDiv.style.transition = "none";
          animatedCardDiv.style.transformOrigin = "center";

          const cardElement = document.createElement("div");
          cardElement.style.width = "100%";
          cardElement.style.height = "100%";
          cardElement.innerHTML = `<img src="${
            generateCard(card, 0, zIndex).image
          }" style="width: 100%; height: 100%;" />`;
          animatedCardDiv.appendChild(cardElement);

          // Append directly to .gameboard for robustness
          gameboard.appendChild(animatedCardDiv);

          // Animate using requestAnimationFrame
          const startTime = performance.now();
          const duration = 500;
          const targetFps = 120;
          const minFrameTime = 1000 / targetFps;
          let lastFrameTime = 0;

          function animate(currentTime: number) {
            if (currentTime - lastFrameTime < minFrameTime) {
              requestAnimationFrame(animate);
              return;
            }
            lastFrameTime = currentTime;

            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);

            const currentX = startX + (endX - startX) * progress;
            const currentY = startY + (endY - startY) * progress;
            const currentScale = 1 + (scale - 1) * progress;

            animatedCardDiv.style.left = `${currentX}px`;
            animatedCardDiv.style.top = `${currentY}px`;
            animatedCardDiv.style.transform =
              `translate(-50%, -50%) scale(${currentScale}) rotate(${rotation}deg)`;

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setTimeout(() => {
                setSlot([generateCard(card, 0, zIndex)]);
                setTimeout(() => {
                  animatedCardDiv.remove();
                }, 250);
              }, 100);
            }
          }

          requestAnimationFrame(animate);
        } else {
          setSlot([]);
        }
        console.log(`Slot ${position} updated:`, card || "empty");
      } else {
        console.log(
          `Slot ${position} unchanged:`,
          current[0]?.code || "empty",
        );
      }
    };

    updateSlot(0, tempTrick[0], setTrickSlot0, trickSlot0, orders[0]);
    updateSlot(1, tempTrick[1], setTrickSlot1, trickSlot1, orders[1]);
    updateSlot(2, tempTrick[2], setTrickSlot2, trickSlot2, orders[2]);
    updateSlot(3, tempTrick[3], setTrickSlot3, trickSlot3, orders[3]);
  }, [
    generateCard,
    trickSlot0,
    trickSlot1,
    trickSlot2,
    trickSlot3,
    CARD_HEIGHT,
    CARD_WIDTH,
  ]);

  const fetchMatchData = useCallback(async () => {
    if (typeof matchId === "string" && !/^\d+$/.test(matchId)) {
      message.open({
        type: "error",
        content: "invalid URL",
      });
      router.push("/landingpageuser");
      return;
    }

    try {
      console.log("Fetching match data");

      const response = await apiService.post<PollingDTO>(
        `/matches/${matchId}/logic`,
        {},
      );
      setPollingResponse(response);
      setFetchErrorCount(0);
      console.log("Match data response:", response);

      if (response.matchPhase === "FINISHED") {
        console.log("Match is finished. Halting polling.");
        setPollingPausedUntil(Infinity); // Halt polling permanently
      }

      if (response.matchPhase === "BEFORE_GAME") {
        return;
      }

      const localHandsEmpty = cardsInHand.length === 0 &&
        opponent1Cards.length === 0 &&
        opponent2Cards.length === 0 &&
        opponent3Cards.length === 0;

      const serverHandsFull = response.cardsInHandPerPlayer &&
        response.cardsInHandPerPlayer[0] === 13 &&
        response.cardsInHandPerPlayer[1] === 13 &&
        response.cardsInHandPerPlayer[2] === 13 &&
        response.cardsInHandPerPlayer[3] === 13;

      if (
        response.gamePhase === "FIRSTTRICK" && previousGamePhase === "PASSING"
      ) {
        passNow.current = true;
        setCurrentGamePhase(response.gamePhase ?? "");
        setPreviousGamePhase(response.gamePhase ?? "");
      }

      if (
        response.trickPhase === "READYFORFIRSTCARD" &&
        trickPhase === "PROCESSINGTRICK"
      ) {
        cleanupNow.current = true;
        setTrickPhase(response.trickPhase);
        /* setCurrentGamePhase(response.gamePhase ?? ""); */
      }

      if (
        (!localHandsEmpty || !serverHandsFull) && !passNow.current &&
        !cleanupNow.current
      ) {
        isDealing.current = false;
        setTrickPhase(response.trickPhase);
        setCurrentGamePhase(response.gamePhase ?? "");
        setMyTurn(response.myTurn ?? false);
        setPreviousGamePhase(response.gamePhase ?? "");
        previousWinner.current = response.previousTrickDTO?.winningPosition ??
          -1;
      }

      if (
        response.passingToPlayerSlot !== null && response.playerSlot !== null
      ) {
        passId.current =
          (4 + response.passingToPlayerSlot - response.playerSlot) % 4;
      }

      if (currentGamePhase === "NORMALTRICK") {
        passId.current = 0;
      }

      console.log("passId", passId.current);

      if (response.currentPlayerSlot !== null && response.playerSlot !== null) {
        setCurrentPlayer(
          players[(4 + response.currentPlayerSlot - response.playerSlot) % 4] ??
            "",
        );
      }

      if (
        response.currentTrickDTO &&
        response.currentTrickDTO.winningPosition !== null
      ) {
        setTrickWinner(players[response.currentTrickDTO.winningPosition] ?? "");
      }

      if (Array.isArray(response.matchMessages)) {
        const newMessages = response.matchMessages.filter(
          (msg): msg is MatchMessage =>
            typeof msg.content === "string" && msg.content.trim() !== "",
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
        setHtmlContent(response.resultHtml.replace(/classname=/g, "class="));
      }

      if (response.gamePhase !== "PASSING") {
        setCardsToPass([]);
        setHasPassedCards(false);
      }

      if (response.gamePhase !== "SKIP_PASSING") {
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

      console.log(localHandsEmpty, serverHandsFull, isDealing.current);
      if (localHandsEmpty && serverHandsFull && !isDealing.current) {
        isDealing.current = true;
        setPollingPausedUntil(Date.now() + DEAL_ANIMATION_DURATION);

        // Optionally trigger your animation here (e.g., set a state to show animation UI)
        console.log("Dealing animation started");

        animateDealingCards(response.playerCards ?? []);

        setTimeout(() => {
          // After animation, fill hands
          if (response.playerCards) {
            setCardsInHand(
              response.playerCards.map((item) =>
                generateCard(item.card.code, item.card.cardOrder)
              ),
            );
          }
          if (response.cardsInHandPerPlayer) {
            const hand = [
              response.cardsInHandPerPlayer["0"] ?? 0,
              response.cardsInHandPerPlayer["1"] ?? 0,
              response.cardsInHandPerPlayer["2"] ?? 0,
              response.cardsInHandPerPlayer["3"] ?? 0,
            ];
            setOpponent1Cards(
              Array.from({ length: hand[1] }, generateEnemyCard),
            );
            setOpponent2Cards(
              Array.from({ length: hand[2] }, generateEnemyCard),
            );
            setOpponent3Cards(
              Array.from({ length: hand[3] }, generateEnemyCard),
            );
          }
        }, DEAL_ANIMATION_DURATION - 500);
        console.log("Dealing animation done");
        return; // Don't update hands yet, wait for animation
      }

      console.log("passNow", passNow.current);
      if (passNow.current) {
        setPollingPausedUntil(Date.now() + PASSING_ANIMATION_DURATION);
        console.log("preparing to animate card passing");

        // Remove passed cards from player's hand
        setCardsInHand((prev) =>
          prev.filter((card) =>
            !passingCardsforAnimation.current.includes(card.code)
          )
        );

        const receivedCards = getReceivedCardCodes(
          response.playerCards ?? [],
          cardsInHand,
        );

        setCardsInHand((prev) =>
          prev.filter((card) =>
            !passingCardsforAnimation.current.includes(card.code)
          )
        );

        setPendingPassingRemoveDone({
          response,
          receivedCards,
          passingCards: passingCardsforAnimation.current,
          passToId: passId.current,
        });

        passNow.current = false;
        return;
      }

      if (cleanupNow.current) {
        setPollingPausedUntil(Date.now() + CLEANUP_ANIMATION_DURATION);
        console.log("preparing to animate cleanup");

        if (response.previousTrickDTO) {
          animateTrickCleanup(
            response.previousTrickDTO,
            previousWinner.current,
          );
        }

        setTimeout(() => {
          setTrickSlot0([]);
          setTrickSlot1([]);
          setTrickSlot2([]);
          setTrickSlot3([]);
        }, CLEANUP_ANIMATION_DURATION - 500);

        console.log("trick cleanup done");

        cleanupNow.current = false;
      }

      // Anything after this point will not be updated before the animation
      //
      //
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

      let trickChanged = false;
      if (response.currentTrickDTO) {
        // Build an array of 4 codes, filling with "" if missing
        const trickCodes = response.currentTrickDTO
          ? [0, 1, 2, 3].map(
              i => response.currentTrickDTO!.cards.find(c => c.position === i)?.code ?? ""
            )
          : ["", "", "", ""];
        const slotCodes = [
          trickSlot0[0]?.code ?? "",
          trickSlot1[0]?.code ?? "",
          trickSlot2[0]?.code ?? "",
          trickSlot3[0]?.code ?? "",
        ];
        // If any slot doesn't match the trick, a new card was played
        for (let i = 0; i < 4; i++) {
          if (trickCodes[i] !== slotCodes[i]) {
            trickChanged = true;
            break;
          }
        }
      }

      if (response.playableCards && !trickChanged) {
        const playableCardCodes = response.playableCards.map((item) =>
          item.card.code
        );
        setPlayableCards(playableCardCodes);
      }

      if (response.currentTrickDTO) {
        handleTrickFromLogic(response.currentTrickDTO);
      }

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
      setFetchErrorCount((prev) => prev + 1);
      setLastFetchError(error); // <-- store the error in state
    }

    console.log("Finished fetchMatchData for", matchId);
  }, [
    matchId,
    generateCard,
    handleTrickFromLogic,
    apiService,
    generateEnemyCard,
    cardsInHand,
    isDealing,
    opponent1Cards,
    opponent2Cards,
    opponent3Cards,
  ]);

  useEffect(() => {
    if (fetchErrorCount > 0 && fetchErrorCount < 3) {
      // Retry after 150ms
      const timeout = setTimeout(() => {
        fetchMatchData();
      }, 150);
      return () => clearTimeout(timeout);
    }
    if (fetchErrorCount >= 3 && lastFetchError) {
      // Handle error after 3 tries
      const error = lastFetchError;
      if (
        typeof error === "object" && error !== null && "status" in error &&
        error.status === 401
      ) {
        message.open({
          type: "error",
          content: "Your session has expired or is invalid. Please log in again.",
        });
        router.push("/");
      } else if (
        typeof error === "object" && error !== null && "status" in error &&
        error.status === 400) {
        message.open({
          type: "error",
          content: "Your session has expired or is invalid. Please log in again.",
        });      
        router.push("/");    
      } else if (
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
      } else if (
        typeof error === "object" && error !== null && "status" in error &&
        error.status === 404
      ) {
        message.open({
          type: "error",
          content: "This match does not exist.",
        });
        router.push("/landingpageuser");
      } else if (error instanceof Error) {
        handleApiError(error, "Failed to fetch match data.");
      } else {
        console.error("Unexpected error structure:", error);
        message.open({
          type: "error",
          content: "An unexpected error occurred. Please try again.",
        });
      }
    }
  }, [fetchErrorCount, lastFetchError, fetchMatchData, router]);

  const animateDealingCards = (playerCards: PlayerCard[]) => {
    const gameboard = document.querySelector(".gameboard") as HTMLElement;
    const gameboardRect = gameboard.getBoundingClientRect();
    const gameboardWidth = gameboardRect.width;
    const handDiv = document.querySelector(".hand-0") as HTMLElement;
    const handRect = handDiv.getBoundingClientRect();
    const handWidth = handRect.width;
    const numCards = playerCards.length;

    const DEAL_SCALE = 1.5;
    const DEAL_ROTATION = 90;
    const DEAL_DURATION = 250; // ms per card
    const DEAL_STAGGER = 50; // ms between each card
    const CARD_SPACING = (handWidth - CARD_WIDTH) / (numCards - 1);

    console.log("handwidth", handWidth);
    console.log("CARD_WIDTH", CARD_WIDTH);
    console.log("CARD_SPACING", CARD_SPACING);

    console.log(gameboardWidth * (25 / 100));
    console.log(CARD_WIDTH / 50);

    const handPositions = [
      {
        x: (gameboardWidth * (25 / 100)) + (CARD_WIDTH * (50 / 100)),
        y: (gameboardWidth * (85 / 100)), /* + (CARD_WIDTH*(50/100)) */
        rotation: 0,
        dx: CARD_SPACING,
        dy: 0,
      }, // Player (bottom)
      {
        x: (gameboardWidth * (15 / 100)), /* + (CARD_WIDTH*(50/100)) */
        y: (gameboardWidth * (25 / 100)) + (CARD_WIDTH * (50 / 100)),
        rotation: 90,
        dx: 0,
        dy: CARD_SPACING,
      }, // Enemy 1 (left)
      {
        x: (gameboardWidth * (75 / 100)) - (CARD_WIDTH * (50 / 100)),
        y: (gameboardWidth * (15 / 100)), /* + (CARD_WIDTH*(50/100)) */
        rotation: 0,
        dx: -CARD_SPACING,
        dy: 0,
      }, // Enemy 2 (top)
      {
        x: (gameboardWidth * (85 / 100)), /* + (CARD_WIDTH*(50/100)) */
        y: (gameboardWidth * (75 / 100)) - (CARD_WIDTH * (50 / 100)),
        rotation: 90,
        dx: 0,
        dy: -CARD_SPACING,
      }, // Enemy 3 (right)
    ];

    console.log("handPositions", handPositions);

    // Prepare dealing order
    const dealOrder: { hand: number; card: PlayerCard | null }[] = [];
    let playerIndex = 0;
    for (let i = 0; i < 52; i++) {
      const hand = i % 4;
      if (hand === 0 && playerCards[playerIndex]) {
        dealOrder.push({ hand, card: playerCards[playerIndex++] });
      } else {
        dealOrder.push({ hand, card: null });
      }
    }

    // Track how many cards have been dealt to each hand
    const handCardCounts = [0, 0, 0, 0];

    // Animation state for all cards in flight
    const animatingCards: {
      div: HTMLDivElement;
      hand: number;
      startTime: number;
      offset: number;
      card: PlayerCard | null;
      finished: boolean;
    }[] = [];

    const rect = gameboard.getBoundingClientRect();

    // Spawn all cards with their staggered start times
    dealOrder.forEach((deal, i) => {
      const offset = handCardCounts[deal.hand];
      handCardCounts[deal.hand]++;

      // Create card div
      const cardDiv = document.createElement("div");
      cardDiv.className = "dealing-card";
      cardDiv.style.position = "absolute";
      cardDiv.style.left = "50%";
      cardDiv.style.top = "50%";
      cardDiv.style.width = `${CARD_WIDTH}px`;
      cardDiv.style.height = `${CARD_HEIGHT}px`;
      cardDiv.style.transform =
        `translate(-50%, -50%) scale(${DEAL_SCALE}) rotate(${DEAL_ROTATION}deg)`;
      cardDiv.style.zIndex = "1001";
      if (deal.hand === 0 && deal.card) {
        cardDiv.innerHTML =
          `<img src="https://deckofcardsapi.com/static/img/${deal.card.card.code}.png" style="width:100%;height:100%;border-radius:8px;" />`;
      } else {
        cardDiv.innerHTML =
          `<img src="${cardback}" style="width:100%;height:100%;border-radius:8px;" />`;
      }
      gameboard.appendChild(cardDiv);

      animatingCards.push({
        div: cardDiv,
        hand: deal.hand,
        startTime: performance.now() + i * DEAL_STAGGER,
        offset,
        card: deal.card,
        finished: false,
      });
    });

    let lastFrameTime = 0;
    const TARGET_FPS = 120;
    const MIN_FRAME_TIME = 1000 / TARGET_FPS;

    // Animate all cards using requestAnimationFrame
    function animateAll(now: number) {
      if (now - lastFrameTime < MIN_FRAME_TIME) {
        requestAnimationFrame(animateAll);
        return;
      }
      lastFrameTime = now;

      let allFinished = true;
      animatingCards.forEach((anim) => {
        if (anim.finished) return;
        const handPos = handPositions[anim.hand];
        const baseX = handPos.x;
        const baseY = handPos.y;
        const destX = baseX + handPos.dx * anim.offset;
        const destY = baseY + handPos.dy * anim.offset;

        const elapsed = now - anim.startTime;
        if (elapsed < 0) {
          allFinished = false;
          return; // Not started yet
        }
        const progress = Math.min(elapsed / DEAL_DURATION, 1);

        // Interpolate position, scale, and rotation
        const curX = 0.5 * rect.width + (destX - 0.5 * rect.width) * progress;
        const curY = 0.5 * rect.height + (destY - 0.5 * rect.height) * progress;
        const curScale = DEAL_SCALE - (DEAL_SCALE - 1) * progress;
        const curRot = DEAL_ROTATION +
          (handPos.rotation - DEAL_ROTATION) * progress;

        anim.div.style.left = `${curX}px`;
        anim.div.style.top = `${curY}px`;
        anim.div.style.transform =
          `translate(-50%, -50%) scale(${curScale}) rotate(${curRot}deg)`;

        if (progress >= 1) {
          anim.finished = true;
        } else {
          allFinished = false;
        }
      });
      if (!allFinished) {
        requestAnimationFrame(animateAll);

        // Remove all cards and deck after the animation duration
        setTimeout(() => {
          animatingCards.forEach((anim) => anim.div.remove());
          /* deckDiv.remove(); */
        }, DEAL_ANIMATION_DURATION);
      }
    }
    requestAnimationFrame(animateAll);
  };

  const animatePassingCards = (
    passingCards: string[],
    receivingCards: string[],
    passingToId: number,
  ) => {
    if (passingToId === 0) {
      console.log("cannot pass to self");
      return;
    }

    const gameboard = document.querySelector(".gameboard") as HTMLElement;
    if (!gameboard) return;

    const PASS_SCALE = 1.2;
    const POST_DELAY = 500;
    const PASS_DURATION = PASSING_ANIMATION_DURATION - POST_DELAY;
    const PASS_STAGGER = 60;

    // Centers and rotations for each hand (0 = you, 1 = left, 2 = top, 3 = right)
    const gameboardRect = gameboard.getBoundingClientRect();
    const handCenters = [
      {
        x: gameboardRect.width * 0.5 + CARD_WIDTH / 2,
        y: gameboardRect.width * 0.85,
        rotation: 0,
      }, // you (bottom)
      {
        x: gameboardRect.width * 0.15,
        y: gameboardRect.width * 0.5 + CARD_WIDTH / 2,
        rotation: 90,
      }, // left
      {
        x: gameboardRect.width * 0.5 - CARD_WIDTH / 2,
        y: gameboardRect.width * 0.15,
        rotation: 180,
      }, // top (opposite)
      {
        x: gameboardRect.width * 0.85,
        y: gameboardRect.width * 0.5 - CARD_WIDTH / 2,
        rotation: 270,
      }, // right
    ];

    // Who passes to whom (rotates each round)
    const passingMap: { [key: number]: number[] } = {
      1: [1, 2, 3, 0],
      2: [2, 3, 0, 1],
      3: [3, 0, 1, 2],
    };
    const passTo = passingMap[passingToId];

    function getStaggeredDest(to: number, i: number) {
      const staggerOffset = (i - 1) * CARD_WIDTH;
      if (to === 1 || to === 3) {
        return { x: handCenters[to].x, y: handCenters[to].y + staggerOffset };
      } else {
        return { x: handCenters[to].x + staggerOffset, y: handCenters[to].y };
      }
    }

    const animatingCards: {
      div: HTMLDivElement;
      from: number;
      to: number;
      startTime: number;
      cardCode: string;
      finished: boolean;
      fromRot: number;
      toRot: number;
      destX: number;
      destY: number;
    }[] = [];

    function getHandInfo(handIdx: number) {
      switch (handIdx) {
        case 0:
          return {
            cards: cardsInHand,
            handWidth: gameboardSize.width * 0.5,
            handHeight: gameboardSize.height * 0.2,
            handPosition: {
              x: gameboardSize.width * 0.3,
              y: gameboardSize.height * 0.85,
            },
            rotation: 0,
          };
        case 1:
          return {
            cards: opponent1Cards,
            handWidth: gameboardSize.width * 0.5,
            handHeight: gameboardSize.height * 0.2,
            handPosition: {
              x: gameboardSize.width * 0.15,
              y: gameboardSize.height * 0.3,
            },
            rotation: 90,
          };
        case 2:
          return {
            cards: opponent2Cards,
            handWidth: gameboardSize.width * 0.5,
            handHeight: gameboardSize.height * 0.2,
            handPosition: {
              x: gameboardSize.width * 0.7,
              y: gameboardSize.height * 0.15,
            },
            rotation: 180,
          };
        case 3:
          return {
            cards: opponent3Cards,
            handWidth: gameboardSize.width * 0.5,
            handHeight: gameboardSize.height * 0.2,
            handPosition: {
              x: gameboardSize.width * 0.85,
              y: gameboardSize.height * 0.7,
            },
            rotation: 270,
          };
        default:
          throw new Error("Invalid hand index");
      }
    }

    // Animate passes for all players
    for (let fromIdx = 0; fromIdx < 4; fromIdx++) {
      const toIdx = passTo[fromIdx];
      const from = handCenters[fromIdx];
      const handInfo = getHandInfo(toIdx);

      for (let i = 0; i < 3; i++) {
        let dest = getStaggeredDest(toIdx, i);
        let animatedZIndex = 2001;
        let cardCode = "";
        let imgSrc = cardback;

        // Outgoing cards from player
        if (fromIdx === 0) {
          cardCode = passingCards[i];
          imgSrc = `https://deckofcardsapi.com/static/img/${cardCode}.png`;
        } // Incoming cards to player
        else if (toIdx === 0) {
          cardCode = receivingCards[i];
          imgSrc = `https://deckofcardsapi.com/static/img/${cardCode}.png`;
        }

        console.log("handInfo", handInfo);

        let dummyIndex = -1;
        if (toIdx === 0) {
          // For your own hand, match by code
          dummyIndex = handInfo.cards.findIndex((c) =>
            c.code === cardCode && c.isDummy
          );
        } else {
          // For opponents, use the i-th dummy card (first, second, third dummy)
          const dummyIndices = handInfo.cards
            .map((c, idx) => (c.isDummy ? idx : -1))
            .filter((idx) => idx !== -1);
          dummyIndex = dummyIndices[i];
        }
        if (dummyIndex !== -1) {
          const pos = calculateCardPosition(
            dummyIndex,
            handInfo.cards.length,
            handInfo.handWidth,
            handInfo.handHeight,
            handInfo.handPosition,
            handInfo.rotation,
            toIdx,
          );
          dest = { x: pos.left, y: pos.top };
          animatedZIndex = 50 + dummyIndex;
        }

        // ...rest of your animation card creation code...
        const cardDiv = document.createElement("div");
        cardDiv.className = "passing-card";
        cardDiv.style.position = "absolute";
        cardDiv.style.left = `${from.x}px`;
        cardDiv.style.top = `${from.y - 40 + i * 30}px`;
        cardDiv.style.width = `${CARD_WIDTH}px`;
        cardDiv.style.height = `${CARD_HEIGHT}px`;
        cardDiv.style.transform =
          `translate(-50%, -50%) scale(${PASS_SCALE}) rotate(${from.rotation}deg)`;
        cardDiv.style.zIndex = animatedZIndex.toString();
        cardDiv.innerHTML =
          `<img src="${imgSrc}" style="width:100%;height:100%;border-radius:8px;" />`;

        gameboard.appendChild(cardDiv);

        animatingCards.push({
          div: cardDiv,
          from: fromIdx,
          to: toIdx,
          startTime: performance.now() + i * PASS_STAGGER,
          cardCode,
          finished: false,
          fromRot: from.rotation,
          toRot: handCenters[toIdx].rotation,
          destX: dest.x,
          destY: dest.y,
        });
      }
    }

    let lastFrameTime = 0;
    function animateAll(now: number) {
      if (now - lastFrameTime < 1000 / 120) {
        requestAnimationFrame(animateAll);
        return;
      }
      lastFrameTime = now;

      let allFinished = true;
      animatingCards.forEach((anim) => {
        if (anim.finished) return;
        const from = handCenters[anim.from];

        const elapsed = now - anim.startTime;
        if (elapsed < 0) {
          allFinished = false;
          return;
        }
        const progress = Math.min(elapsed / PASS_DURATION, 1);

        const curX = from.x + (anim.destX - from.x) * progress;
        const curY = from.y + (anim.destY - from.y) * progress;
        const curScale = PASS_SCALE - (PASS_SCALE - 1) * progress;
        const curRot = anim.fromRot + (anim.toRot - anim.fromRot) * progress;

        anim.div.style.left = `${curX}px`;
        anim.div.style.top = `${curY}px`;
        anim.div.style.transform =
          `translate(-50%, -50%) scale(${curScale}) rotate(${curRot}deg)`;

        if (progress >= 1) {
          anim.finished = true;
        } else {
          allFinished = false;
        }
      });

      if (!allFinished) {
        requestAnimationFrame(animateAll);
      } else {
        flushSync(() => {
          setCardsInHand((prev) =>
            prev
              .map((card) => {
                if (card.isDummy) {
                  const real = (pollingResponse?.playerCards ?? []).find(
                    (pc) => pc.card.code === card.code,
                  );
                  if (real) {
                    return generateCard(real.card.code, real.card.cardOrder);
                  }
                  return null;
                }
                return card;
              })
              .filter((c): c is cardProps => c !== null) // <-- Type guard for TypeScript
          );
          setOpponent1Cards((prev) =>
            prev.map((c) => (c.isDummy ? generateEnemyCard() : c))
          );
          setOpponent2Cards((prev) =>
            prev.map((c) => (c.isDummy ? generateEnemyCard() : c))
          );
          setOpponent3Cards((prev) =>
            prev.map((c) => (c.isDummy ? generateEnemyCard() : c))
          );
        });
        setTimeout(() => {
          animatingCards.forEach((anim) => anim.div.remove());
        }, 200);
      }
    }
    requestAnimationFrame(animateAll);
  };

  function getReceivedCardCodes(
    newHand: PlayerCard[],
    currentHand: cardProps[],
  ): string[] {
    const currentCodes = new Set(currentHand.map((card) => card.code));
    return newHand
      .filter((cardObj) => !currentCodes.has(cardObj.card.code))
      .map((cardObj) => cardObj.card.code);
  }

  const createDummyCard = (code: string, cardOrder: number): cardProps => ({
    code: code,
    suit: "",
    value: BigInt(0),
    cardOrder,
    image: `https://deckofcardsapi.com/static/img/${code}.png`,
    backimage: cardback,
    flipped: false,
    onClick: () => {},
    zIndex: 1,
    isDummy: true, // Custom property to identify dummy cards
  });

  useEffect(() => {
    if (
      pendingPassingAnimation &&
      // Check player hand
      pendingPassingAnimation.receiving.every((code) =>
        cardsInHand.find((c) => c.code === code && c.isDummy)
      ) &&
      // Check opponent hands (assuming 3 dummies per hand)
      opponent1Cards.filter((c) => c.isDummy).length >= 3 &&
      opponent2Cards.filter((c) => c.isDummy).length >= 3 &&
      opponent3Cards.filter((c) => c.isDummy).length >= 3
    ) {
      animatePassingCards(
        pendingPassingAnimation.passing,
        pendingPassingAnimation.receiving,
        pendingPassingAnimation.passingToId,
      );
      setPendingPassingAnimation(null);
    }
  }, [
    pendingPassingAnimation,
    cardsInHand,
    opponent1Cards,
    opponent2Cards,
    opponent3Cards,
  ]);

  useEffect(() => {
    console.log("pendingPassingRemoveDone", pendingPassingRemoveDone);
    if (
      pendingPassingRemoveDone &&
      // Make sure the cards to be removed are actually gone
      passingCardsforAnimation.current.every(
        (code) => !cardsInHand.some((card) => card.code === code),
      )
    ) {
      console.log("now executing inside of pendingPassingRemoveDone");
      // Now add dummy cards and trigger the animation as before
      const { response, receivedCards, passingCards, passToId } =
        pendingPassingRemoveDone;

      const receivedCardOrders = receivedCards.map((code) => {
        const found = (response.playerCards ?? []).find((pc: PlayerCard) =>
          pc.card.code === code
        );
        return found ? found.card.cardOrder : 0;
      });

      const dummyCards = receivedCards.map((code, i) =>
        createDummyCard(code, receivedCardOrders[i])
      );

      console.log("dummyCards", dummyCards);

      const newHandWithDummies = sortCards([...cardsInHand, ...dummyCards]);
      setCardsInHand(newHandWithDummies);

      setOpponent1Cards((prev) => {
        if (prev.length < 3) return prev; // Not enough cards to replace
        // Get 3 unique random indices
        const indices = Array.from({ length: prev.length }, (_, i) => i)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        // Create new dummy cards
        const dummies = indices.map((_, i) =>
          createDummyCard(`op1-dummy-${Date.now()}-${i}`, 0)
        );
        // Replace cards at those indices
        return prev.map((card, idx) => {
          const dummyIdx = indices.indexOf(idx);
          return dummyIdx !== -1 ? dummies[dummyIdx] : card;
        });
      });

      setOpponent2Cards((prev) => {
        if (prev.length < 3) return prev; // Not enough cards to replace
        // Get 3 unique random indices
        const indices = Array.from({ length: prev.length }, (_, i) => i)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        // Create new dummy cards
        const dummies = indices.map((_, i) =>
          createDummyCard(`op2-dummy-${Date.now()}-${i}`, 0)
        );
        // Replace cards at those indices
        return prev.map((card, idx) => {
          const dummyIdx = indices.indexOf(idx);
          return dummyIdx !== -1 ? dummies[dummyIdx] : card;
        });
      });

      setOpponent3Cards((prev) => {
        if (prev.length < 3) return prev; // Not enough cards to replace
        // Get 3 unique random indices
        const indices = Array.from({ length: prev.length }, (_, i) => i)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        // Create new dummy cards
        const dummies = indices.map((_, i) =>
          createDummyCard(`op3-dummy-${Date.now()}-${i}`, 0)
        );
        // Replace cards at those indices
        return prev.map((card, idx) => {
          const dummyIdx = indices.indexOf(idx);
          return dummyIdx !== -1 ? dummies[dummyIdx] : card;
        });
      });

      setPendingPassingAnimation({
        passing: passingCards,
        receiving: receivedCards,
        passingToId: passToId,
      });

      setPendingPassingRemoveDone(null);
    }
  }, [pendingPassingRemoveDone, cardsInHand]);

  const animateTrickCleanup = (previousTrick: TrickDTO, winner: number) => {
    const gameboard = document.querySelector(".gameboard") as HTMLElement;
    if (!gameboard) return;

    const ANIMATION_DURATION = 900;
    const TARGET_FPS = 120;
    const MIN_FRAME_TIME = 1000 / TARGET_FPS;
    const STARTSCALE = 1.5;
    const ENDSCALE = 0.2;

    const gameboardRect = gameboard.getBoundingClientRect();
    const CARD_SCALE = 1.2;

    // Directions and rotations for each player
    const directions = [
      [0, 1], // Player 0: down
      [-1, 0], // Player 1: left
      [0, -1], // Player 2: up
      [1, 0], // Player 3: right
    ];
    const rotations = [0, 90, 0, 90];

    // Calculate pile positions (center + shift in direction)
    const centerX = gameboardRect.width / 2;
    const centerY = gameboardRect.height / 2;

    const pilePositions = [0, 1, 2, 3].map((i) => {
      const [dx, dy] = directions[i];
      return {
        x: centerX + dx * ((CARD_HEIGHT * CARD_SCALE) / 2),
        y: centerY + dy * ((CARD_HEIGHT * CARD_SCALE) / 2),
        rotation: rotations[i],
      };
    });

    const boxCenters = [0, 1, 2, 3].map((i) => {
      const el = document.querySelector(`.game-playerscore${i}`) as HTMLElement;
      if (!el) {
        // fallback to previous logic if not found
        return {
          x: gameboardRect.width * 0.5 + CARD_WIDTH / 2,
          y: gameboardRect.width * 0.85,
        };
      }
      const rect = el.getBoundingClientRect();
      // Calculate center relative to gameboard
      return {
        x: rect.left - gameboardRect.left + rect.width / 2,
        y: rect.top - gameboardRect.top + rect.height / 2,
      };
    });

    // Prepare animated cards
    const animatingCards: {
      div: HTMLDivElement;
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      startRotation: number;
      endRotation: number;
      startTime: number;
      finished: boolean;
    }[] = [];

    previousTrick.cards.forEach((card, idx) => {
      if (!card || !card.code) return;
      const start = pilePositions[idx];
      const end = boxCenters[winner];

      // Create overlay card
      const cardDiv = document.createElement("div");
      cardDiv.className = "cleanup-card";
      cardDiv.style.position = "absolute";
      cardDiv.style.left = `${start.x}px`;
      cardDiv.style.top = `${start.y}px`;
      cardDiv.style.width = `${CARD_WIDTH}px`;
      cardDiv.style.height = `${CARD_HEIGHT}px`;
      cardDiv.style.transform = "translate(-50%, -50%) scale(1.5)";
      cardDiv.style.zIndex = "3000";
      cardDiv.innerHTML =
        `<img src="https://deckofcardsapi.com/static/img/${card.code}.png" style="width:100%;height:100%;border-radius:8px;" />`;
      gameboard.appendChild(cardDiv);

      animatingCards.push({
        div: cardDiv,
        startX: start.x,
        startY: start.y,
        endX: end.x,
        endY: end.y,
        startRotation: start.rotation,
        endRotation: 0, // You can rotate to 0 or keep as start.rotation
        startTime: performance.now(),
        finished: false,
      });
    });

    let lastFrameTime = 0;
    function animateAll(now: number) {
      if (now - lastFrameTime < MIN_FRAME_TIME) {
        requestAnimationFrame(animateAll);
        return;
      }
      lastFrameTime = now;

      let allFinished = true;
      animatingCards.forEach((anim) => {
        if (anim.finished) return;
        const elapsed = now - anim.startTime;
        const progress = Math.min(elapsed / ANIMATION_DURATION, 1);

        const curX = anim.startX + (anim.endX - anim.startX) * progress;
        const curY = anim.startY + (anim.endY - anim.startY) * progress;
        const curScale = STARTSCALE + (ENDSCALE - STARTSCALE) * progress;
        const curRotation = anim.startRotation +
          (anim.endRotation - anim.startRotation) * progress;

        anim.div.style.left = `${curX}px`;
        anim.div.style.top = `${curY}px`;
        anim.div.style.transform =
          `translate(-50%, -50%) scale(${curScale}) rotate(${curRotation}deg)`;

        if (progress >= 1) {
          anim.finished = true;
        } else {
          allFinished = false;
        }
      });

      if (!allFinished) {
        requestAnimationFrame(animateAll);
      } else {
        setTimeout(() => {
          animatingCards.forEach((anim) => anim.div.remove());
        }, 200);
      }
    }
    requestAnimationFrame(animateAll);
  };

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
    const token = localStorage.getItem("token");
    if (!token) {
      message.open({
        type: "error",
        content: "You must be logged in to view this page.",
      });
      router.push("/"); // or "/landingpageuser"
    }
  }, [router]);

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

    if (
      localStorage.getItem("playmat") &&
      playMatColors.includes(localStorage.getItem("playmat") || "")
    ) {
      setPlaymat(localStorage.getItem("playmat") || "");
    } else {
      setPlaymat("#darkgreen"); // Default playmat
      localStorage.setItem("playmat", "darkgreen");
    }
    if (
      localStorage.getItem("cardback") &&
      /^\/card_back\/[b-c]10[1-6]\.png$/.test(
        localStorage.getItem("cardback") || "",
      )
    ) {
      setCardback(localStorage.getItem("cardback") || "");
    } else {
      setCardback("/card_back/c101.png"); // Default cardback
      localStorage.setItem("cardback", "/card_back/c101.png");
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

  const lastPlayedCardRect = useRef<DOMRect | null>(null);
  const handlePlayCard = async (
    card: cardProps,
    cardRef: React.RefObject<HTMLDivElement | null>,
  ) => {
    console.log("Clicked card:", card.code);
    console.log("myTurn =", myTurn);
    console.log("currentGamePhase =", currentGamePhase);

    if (cardRef.current) {
      lastPlayedCardRect.current = cardRef.current.getBoundingClientRect();
    }

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

        // Then fetch the updated game state
        setPollingPausedUntil(Date.now() + 1500); // pause for 1.5s
        await fetchMatchData();
      } catch (error) {
        handleApiError(error);
      }
    }
  };

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
      passingCardsforAnimation.current = cardsToPass.map((card) => card.code);
      setHasPassedCards(true);
      setTimer(Infinity); // Stop the timer if it was running
    } catch (error) {
      handleApiError(error, "An error occurred while passing cards.");
    }
  };

  const sortCards = (cards: cardProps[]) => {
    return [...cards].sort((a, b) => {
      if (a.cardOrder < b.cardOrder) return -1;
      if (a.cardOrder > b.cardOrder) return 1;
      return 0;
    });
  };

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
    } else if (myTurn) {
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
    console.log("playRandomCard called");
    console.log("playableCards:", playableCardsRef.current);
    if (playRandomCardCalled.current) {
      console.log("playRandomCard already called. Skipping...");
      return;
    }

    playRandomCardCalled.current = true; // Mark as called

    if (playableCardsRef.current.length === 0) {
      console.log("No playable cards available.");
      return;
    }

    lastPlayedCardRect.current = null;

    await apiService.post(`/matches/${matchId}/play/any`, {});
    console.log("setting myTurn to false");
    setMyTurn(false); // Lock the UI
    setPlayableCards([]); // Clear playable cards
    console.log("Random card played.");
  };

  useEffect(() => {
    playableCardsRef.current = playableCards;
  }, [playableCards]);

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

      passingCardsforAnimation.current = randomCardsToPass.map((card) => card.code);
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
  }, [hasConfirmedSkipPassing]);

  const hand0Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function updateSize() {
      const node = gameboardRef.current;
      if (!node) return;
      setGameboardSize({
        width: node.offsetWidth,
        height: node.offsetHeight,
      });
    }

    updateSize(); // Initial

    const node = gameboardRef.current;
    if (!node) return;

    const resizeObserver = new window.ResizeObserver(() => updateSize());
    resizeObserver.observe(node);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (cardRefs.current.length !== cardsInHand.length) {
      cardRefs.current = cardsInHand.map(
        (_, i) => cardRefs.current[i] || createRef<HTMLDivElement>(),
      );
    }
  }, [cardsInHand.length]);

  const calculateCardPosition = (
    index: number,
    totalCards: number,
    handWidth: number,
    handHeight: number,
    handPosition: { x: number; y: number },
    rotation: number,
    handIndex: number, // Add handIndex to determine the hand's behavior
  ) => {
    const MAX_SPACING = CARD_WIDTH * 1.05; // Maximum spacing between cards
    const spacing = totalCards > 1
      ? Math.min((handWidth - CARD_WIDTH) / (totalCards - 1), MAX_SPACING)
      : 0;

    let left = handPosition.x;
    let top = handPosition.y;

    // Adjust spacing based on hand index and rotation
    if (handIndex === 0 || handIndex === 2) {
      // Horizontal spacing for hands 0 and 2
      if (handIndex === 0) {
        // Hand 0: Left to right
        left += index * spacing;
      } else if (handIndex === 2) {
        // Hand 2: Right to left
        left -= index * spacing;
      }
    } else if (handIndex === 1 || handIndex === 3) {
      // Vertical spacing for hands 1 and 3
      if (handIndex === 1) {
        // Hand 1: Top to bottom
        top += index * spacing;
      } else if (handIndex === 3) {
        // Hand 3: Bottom to top
        top -= index * spacing;
      }
    }

    return {
      left,
      top,
      transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
    };
  };

  useEffect(() => {
    // All possible card codes (2-10, J, Q, K, A for each suit)
    const suits = ["H", "S", "D", "C"];
    const ranks = [
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "0",
      "J",
      "Q",
      "K",
      "A",
    ];
    const cardUrls: string[] = [];

    for (const suit of suits) {
      for (const rank of ranks) {
        cardUrls.push(
          `https://deckofcardsapi.com/static/img/${rank}${suit}.png`,
        );
      }
    }

    // Preload each image
    cardUrls.forEach((url) => {
      const img = new window.Image();
      img.src = url;
    });

    // Optionally preload cardback(s) as well
    const cardbacks = [
      "/card_back/c101.png",
      "/card_back/c102.png",
      "/card_back/c103.png",
      "/card_back/c104.png",
      "/card_back/c105.png",
      "/card_back/c106.png",
      "/card_back/b101.png",
      "/card_back/b102.png",
      "/card_back/b103.png",
      "/card_back/b104.png",
      "/card_back/b105.png",
      "/card_back/b106.png",
    ];
    cardbacks.forEach((url) => {
      const img = new window.Image();
      img.src = url;
    });
  }, []);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        console.log("Page is visible again");
        // Remove all animated card divs
        document.querySelectorAll(".dealing-card, .passing-card, .cleanup-card, .trick-card")
          .forEach((el) => el.remove());
        // Resume polling immediately
        setPollingPausedUntil(null);
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

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

      {(
        (
          (currentGamePhase === "PASSING" && timer !== Infinity &&
            timer !== null) ||
          // Show during trick phases only if timer is not Infinity/null (and it's your turn)
          (["FIRSTTRICK", "NORMALTRICK", "FINALTRICK"].includes(
            currentGamePhase,
          )) ||
          // Always show for PROCESSINGTRICK/TRICKJUSTCOMPLETED
          (["PROCESSINGTRICK", "TRICKJUSTCOMPLETED"].includes(trickPhase))
        ) &&
        currentGamePhase !== "RESULT"
      ) && (
        <div
          style={{
            position: "absolute",
            top: "7%",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor:
              ["PROCESSINGTRICK", "TRICKJUSTCOMPLETED"].includes(trickPhase)
                ? "darkgreen"
                : "darkgreen",
            color:
              ["PROCESSINGTRICK", "TRICKJUSTCOMPLETED"].includes(trickPhase)
                ? "white"
                : "white",
            padding: "8px 18px",
            borderRadius: "10px",
            border: "2px solid white",
            zIndex: 1000,
            fontSize: "1.15rem",
            textAlign: "center",
            minWidth: "200px",
          }}
        >
          {currentGamePhase === "PASSING"
            ? `Passing phase | Time Remaining: ${timer}s`
            : ["PROCESSINGTRICK", "TRICKJUSTCOMPLETED"].includes(trickPhase)
            ? (trickWinner
              ? `${trickWinner} won the trick!`
              : "Trick complete!")
            : (currentPlayer
              ? `It's ${currentPlayer}'s turn${
                myTurn && typeof timer === "number" && isFinite(timer)
                  ? ` | Time Remaining: ${timer}s`
                  : myTurn
                  ? " | Time Remaining: 0s"
                  : ""
              }`
              : "Waiting for player...")}
        </div>
      )}

      <div className="menu-dropdown">
        <Dropdown
          menu={{
            items: [
              { key: "1", label: "Settings", onClick: () => toggleSettings() },
              { key: "2", label: "Leave Match", onClick: showLeaveGameModal },
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
          <colgroup>
            <col style={{ width: "70%" }} />
            <col style={{ width: "30%" }} />
          </colgroup>
          <thead>
            <tr>
              <th>Player</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="score-playername">
                {players[0] ? players[0] : ""}
              </td>
              <td>{players[0] ? matchScore[0] : ""}</td>
            </tr>
            <tr>
              <td className="score-playername">
                {players[1] ? players[1] : ""}
              </td>
              <td>{players[1] ? matchScore[1] : ""}</td>
            </tr>
            <tr>
              <td className="score-playername">
                {players[2] ? players[2] : ""}
              </td>
              <td>{players[2] ? matchScore[2] : ""}</td>
            </tr>
            <tr>
              <td className="score-playername">
                {players[3] ? players[3] : ""}
              </td>
              <td>{players[3] ? matchScore[3] : ""}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        className="gameboard"
        ref={gameboardRef}
        style={{
          "--gameboard-height": `${gameboardSize.height}px`,
          "--gameboard-width": `${gameboardSize.width}px`,
        } as React.CSSProperties}
      >
        <div
          className="hand-0"
          ref={hand0Ref} // adjust height as needed
        >
        </div>

        {cardsInHand.map((card, index) => {
          const cardRef = cardRefs.current[index];
          const position = calculateCardPosition(
            index,
            cardsInHand.length,
            gameboardSize.width * 0.5, // Example hand width
            gameboardSize.height * 0.2, // Example hand height
            { x: gameboardSize.width * 0.3, y: gameboardSize.height * 0.85 }, // Hand position
            0, // No rotation for the player's hand
            0, // Hand index 0
          );

          return (
            <div
              key={card.code}
              ref={cardRef}
              style={{
                position: "absolute",
                left: `${position.left}px`,
                top: `${position.top}px`,
                width: `${CARD_WIDTH}px`,
                height: `${CARD_HEIGHT}px`,
                transform: position.transform,
                zIndex: 50 + index,
              }}
            >
              <Card
                code={card.code}
                suit={card.suit}
                value={card.value}
                cardOrder={card.cardOrder}
                image={card.image}
                backimage={cardback}
                flipped
                onClick={currentGamePhase === "PASSING" && hasPassedCards
                  ? () => {}
                  : () => handlePlayCard(card, cardRef)}
                isSelected={cardsToPass.some((c) => c.code === card.code)}
                isPlayable={playableCards.includes(card.code)}
                isPassable={currentGamePhase === "PASSING"}
                isDisabled={currentGamePhase === "PASSING" && hasPassedCards}
                isDummy={card.isDummy} // Pass the isDummy prop
              />
            </div>
          );
        })}

        <div
          className="hand-1"
          style={{
            position: "absolute",
            left: `25%`,
            top: `35%`,
            transform: "translateY(-50%) rotate(90deg)", // Rotate the whole hand!
            width: `50%`, // or enough for all cards
            height: `20%`,
            display: "block",
          }}
        >
        </div>

        {opponent1Cards.map((card, index) => {
          const position = calculateCardPosition(
            index,
            opponent1Cards.length,
            gameboardSize.width * 0.5, // Example hand width
            gameboardSize.height * 0.2, // Example hand height
            { x: gameboardSize.width * 0.15, y: gameboardSize.height * 0.3 }, // Hand position
            90, // Rotation for opponent 3 (right hand)
            1, // Hand index 3
          );

          return (
            <div
              key={index}
              style={{
                position: "absolute",
                left: `${position.left}px`,
                top: `${position.top}px`,
                width: `${CARD_WIDTH}px`,
                height: `${CARD_HEIGHT}px`,
                transform: position.transform,
                zIndex: 50 + index,
              }}
            >
              <Card
                code={card.code}
                suit={card.suit}
                value={card.value}
                cardOrder={card.cardOrder}
                image={card.image}
                backimage={cardback}
                flipped={false}
                onClick={card.onClick}
                isDummy={card.isDummy}
              />
            </div>
          );
        })}

        <div
          className="hand-2"
          style={{
            position: "absolute",
            left: `25%`,
            top: `15%`,
            transform: "translateY(-50%) rotate(180deg)", // Rotate the whole hand!
            width: `50%`, // or enough for all cards
            height: `20%`,
            display: "block",
          }}
        >
        </div>

        {opponent2Cards.map((card, index) => {
          const position = calculateCardPosition(
            index,
            opponent2Cards.length,
            gameboardSize.width * 0.5, // Example hand width
            gameboardSize.height * 0.2, // Example hand height
            { x: gameboardSize.width * 0.7, y: gameboardSize.height * 0.15 }, // Hand position
            180, // Rotation for opponent 2 (top hand)
            2, // Hand index 2
          );

          return (
            <div
              key={index}
              style={{
                position: "absolute",
                left: `${position.left}px`,
                top: `${position.top}px`,
                width: `${CARD_WIDTH}px`,
                height: `${CARD_HEIGHT}px`,
                transform: position.transform,
                zIndex: 50 + index,
              }}
            >
              <Card
                code={card.code}
                suit={card.suit}
                value={card.value}
                cardOrder={card.cardOrder}
                image={card.image}
                backimage={cardback}
                flipped={false}
                onClick={card.onClick}
                isDummy={card.isDummy}
              />
            </div>
          );
        })}

        <div
          className="hand-3"
          style={{
            position: "absolute",
            left: `75%`,
            top: `85%`,
            transform: "translateY(-50%) rotate(270deg)", // Rotate the whole hand!
            width: `50%`, // or enough for all cards
            height: `20%`,
            display: "block",
          }}
        >
        </div>

        {opponent3Cards.map((card, index) => {
          const position = calculateCardPosition(
            index,
            opponent3Cards.length,
            gameboardSize.width * 0.5, // Example hand width
            gameboardSize.height * 0.2, // Example hand height
            { x: gameboardSize.width * 0.85, y: gameboardSize.height * 0.7 }, // Hand position
            270, // Rotation for opponent 3 (right hand)
            3, // Hand index 3
          );

          return (
            <div
              key={index}
              style={{
                position: "absolute",
                left: `${position.left}px`,
                top: `${position.top}px`,
                width: `${CARD_WIDTH}px`,
                height: `${CARD_HEIGHT}px`,
                transform: position.transform,
                zIndex: 50 + index,
              }}
            >
              <Card
                code={card.code}
                suit={card.suit}
                value={card.value}
                cardOrder={card.cardOrder}
                image={card.image}
                backimage={cardback}
                flipped={false}
                onClick={card.onClick}
                isDummy={card.isDummy}
              />
            </div>
          );
        })}

        <div className="pile">
          {[trickSlot0, trickSlot1, trickSlot2, trickSlot3].map(
            (slot, index) => {
              const directions = [
                [0, 1], // Player 0: down
                [-1, 0], // Player 1: left
                [0, -1], // Player 2: up
                [1, 0], // Player 3: right
              ];
              const [dx, dy] = directions[index];
              const scale = 1.2; // Scale factor for the cards
              const extraShiftX = dx * ((CARD_HEIGHT * scale) / 2);
              const extraShiftY = dy * ((CARD_HEIGHT * scale) / 2);

              // Render the card if the slot is not empty
              return slot.length > 0
                ? (
                  <div
                    key={index}
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform:
                        `translate(-50%, -50%) translate(${extraShiftX}px, ${extraShiftY}px) rotate(${
                          index * 90
                        }deg) scale(1)`, // Rotate and scale
                      zIndex: slot[0].zIndex, // Use the zIndex from the card object
                      width: `${CARD_WIDTH * scale}px`,
                      height: `${CARD_HEIGHT * scale}px`,
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
                )
                : null; // Render nothing if the slot is empty
            },
          )}
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
          <div
            className="game-playername"
            style={{
              "--name-length": `${getDisplayName(players[0]).length}`,
            } as React.CSSProperties}
          >
            {getDisplayName(players[0])}
          </div>
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
          <div
            className="game-playername"
            style={{
              "--name-length": `${getDisplayName(players[1]).length}`,
            } as React.CSSProperties}
          >
            {getDisplayName(players[1])}
          </div>
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
          <div
            className="game-playername"
            style={{
              "--name-length": `${getDisplayName(players[2]).length}`,
            } as React.CSSProperties}
          >
            {getDisplayName(players[2])}
          </div>
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
          <div
            className="game-playername"
            style={{
              "--name-length": `${getDisplayName(players[3]).length}`,
            } as React.CSSProperties}
          >
            {getDisplayName(players[3])}
          </div>
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
            Select 3 cards to pass to <span className="pass-username">{players[passId.current]}</span>
          </p>
          </div>
        )}

        {currentGamePhase === "PASSING" && cardsToPass.length === 3 &&
          !hasPassedCards && (
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
              Passing phase is skipped every 4th round.
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

        {((pollingResponse?.matchPhase === "IN_PROGRESS" &&
          pollingResponse?.gamePhase === "RESULT") ||
          (pollingResponse?.matchPhase === "RESULT" &&
            pollingResponse?.gamePhase === "FINISHED")) &&
          (
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
            width: "100%",
            maxWidth: "700px",
            minWidth: "320px",
            height: "auto",
            maxHeight: "80%",
            overflowY: "auto",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
          }}
        >
          <div>
            <h2>Match Finished</h2>
            <div
              className={`${modalStyles.modalMessage} ${modalStyles.modalMessageMatchFinished}`}
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>
          <Button
            className={styles.whiteButton}
            onClick={() => router.push("/landingpageuser")} // Route to landing page
            style={{
              marginTop: "20px",
              marginBottom: "20px",
            }}
          >
            Leave Match
          </Button>
        </div>
      )}

      <DebugOverlay gameData={debugData} />
    </div>
  );
};

export default MatchPage;
