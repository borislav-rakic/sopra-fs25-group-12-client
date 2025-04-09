import React, { useState } from "react";
import styles from "@/styles/card.module.css";
import Image from "next/image"

interface cardProps {
    code: string;
    suit: string;
    value: bigint;
    image: string;
    backimage: string;
    flipped: boolean;
    onClick: (code: string) => void;
}

const Card: React.FC<cardProps> = ({ code, 
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
      console.log(suit, value) // This allows suit and value to be part of the object but be used for compilation with npm build
    };

  return (
    <div className={`${styles.cardContainer} ${flipped ? styles.scalable : ""}`} onClick={handleCardClick}>
      {flipped ? (
        <Image className={styles.cardFront} src={image} alt={`${code} front`} />
      ) : (
        <Image className={styles.cardBack} src={backimage} alt={`${code} back`} />
      )}
    </div>
  );
};

export default Card;
export type { cardProps };
