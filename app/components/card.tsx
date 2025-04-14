import React, { useState } from "react";
import styles from "@/styles/card.module.css";
import Image from "next/image";

interface cardProps {
  code: string;
  suit: string;
  value: bigint;
  image: string;
  backimage: string;
  flipped: boolean;
  onClick: (code: string) => void;
  isSelected?: boolean;
}

const Card: React.FC<cardProps> = (
  { code, suit, value, image, flipped: initialFlipped, backimage, onClick, isSelected=false },
) => {
  const [flipped, setFlipped] = useState(initialFlipped);

  const handleCardClick = () => {
/*     setFlipped(!flipped); // Toggle the flipped state
    console.log("Card clicked:", code);
    console.log("Flipped:", !flipped);
 */ onClick(code); // Call the onClick handler passed as a prop
    console.log(suit, value); // This allows suit and value to be part of the object but be used for compilation with npm build
  };

  return (
    <div
      className={`${styles.cardContainer} ${flipped ? styles.scalable : ""}`}
      onClick={handleCardClick}
      style={{
        transform: isSelected ? "translateY(-20px)" : "translateY(0)", // Move the card up if selected
        transition: "transform 0.2s ease", // Smooth transition
        cursor: "pointer", // Indicate the card is clickable
      }}
    >
      {flipped
        ? (
          <img
            className={styles.cardFront}
            src={image}
            alt={`${code} front`}
          />
        )
        : (
          <img
            className={styles.cardBack}
            src={backimage}
            alt={`${code} back`}
          />
        )}
    </div>
  );
};

export default Card;
export type { cardProps };
