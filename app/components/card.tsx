import React, { useState, useCallback } from "react";
import styles from "@/styles/card.module.css";
import { on } from "events";

interface cardProps {
    code: string;
    suit: string;
    value: bigint;
    image: string;
    backimage: string;
    flipped: boolean;
    onClick: (code: string) => void;
}

const card: React.FC<cardProps> = ({ code, 
  suit, 
  value, 
  image,
  flipped: initialFlipped, 
  backimage,
  onClick }) => {

    const [flipped, setFlipped] = useState(initialFlipped);

    const handleCardClick = () => {
      setFlipped(!flipped); // Toggle the flipped state
      console.log("Card clicked:", code);
      console.log("Flipped:", !flipped);
      onClick(code); // Call the onClick handler passed as a prop
    };

  return (
    <div className={`${styles.cardContainer} ${flipped ? styles.scalable : ""}`} onClick={handleCardClick}>
      {flipped ? (
        <img className={styles.cardFront} src={image} alt={`${code} front`} />
      ) : (
        <img className={styles.cardBack} src={backimage} alt={`${code} back`} />
      )}
    </div>
  );
};

export default card;
export type { cardProps };
