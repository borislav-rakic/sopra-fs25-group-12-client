import React, { useState, useCallback } from "react";
import styles from "@/styles/card.module.css";

interface cardProps {
    code: string;
    suit: string;
    value: bigint;
    image: string;
    onClick: (code: string) => void;
}

const card: React.FC<cardProps> = ({ code, 
  suit, 
  value, 
  image, 
  onClick }) => {

  return (
    <div className={styles.card} onClick={() => onClick(code)}>
      <img src={image}></img>
    </div>
    )
};

export default card;