import React, { useState } from "react";
import styles from "@/styles/card.module.css";
import Image from "next/image";

interface cardProps {
  code: string;
  suit: string;
  value: bigint;
  cardOrder: number;
  image: string;
  backimage: string;
  flipped: boolean;
  onClick: (code: string) => void;
  isSelected?: boolean;
  isPlayable?: boolean;
  isPassable?: boolean;
  isDisabled?: boolean;
  zIndex?: number;
}

const Card: React.FC<cardProps> = (
  {
    code,
    suit,
    value,
    //cardOrder,
    image,
    flipped: initialFlipped,
    backimage,
    onClick,
    isSelected = false,
    isPlayable = false,
    isPassable = false,
    isDisabled = false,
    zIndex
  },
) => {
  const [flipped] = useState(initialFlipped);

  const handleCardClick = () => {
    /*     setFlipped(!flipped); // Toggle the flipped state
    console.log("Card clicked:", code);
    console.log("Flipped:", !flipped);
 */ onClick(code); // Call the onClick handler passed as a prop
    console.log(suit, value); // This allows suit and value to be part of the object but be used for compilation with npm build
    console.log("playble", isPlayable); // This allows suit and value to be part of the object but be used for compilation with npm build
  };

  return (
    <div
      className={`${styles.cardContainer} ${flipped ? styles.scalable : ""} 
      ${isSelected ? styles.selected : ""}
      ${isPlayable ? styles.playableCard : ""}
      ${isPassable ? styles.passableCard : ""}
      ${isDisabled ? styles.disabledCard : ""}`}
      onClick={handleCardClick}
      style={{zIndex}}
    >
      {flipped
        ? (
          <div className={styles.imageWrapper}>
            <Image
              src={image}
              alt={`${code} front`}
              className={styles.cardFront}
              layout="fill" // Make the image fill its container
              objectFit="cover" // Ensure the image scales properly
              priority // Optional: Preload the image for better performance
            />
          </div>
        )
        : (
          <div className={styles.imageWrapper}>
            <Image
              src={backimage}
              alt={`${code} back`}
              layout="fill" // Make the image fill its container
              objectFit="cover" // Ensure the image scales properly
              priority // Optional: Preload the image for better performance
            />
          </div>
        )}
    </div>
  );
};

export default Card;
export type { cardProps };
