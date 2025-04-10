"use client";

import React, { useState } from "react";
import styles from "@/styles/settingsPopup.module.css";

interface SettingsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  playmat: string;
  setPlaymat: (value: string) => void;
  cardback: string;
  setCardback: (value: string) => void;
}

const playMatColors = [
  "#ec4d40", "#57d2e4", "#42db83", "#f4e841", "#040400", "#fffefa"
];

const cardBackFiles = Array.from({ length: 6 }, (_, i) => `b10${i + 1}.png`);

const SettingsPopup: React.FC<SettingsPopupProps> = ({
  isOpen,
  onClose,
  playmat,
  setPlaymat,
  cardback,
  setCardback,
}) => {
  const [oldPlaymat, setOldPlaymat] = useState(playmat);
  const [oldCardback, setOldCardback] = useState(cardback);

  if (!isOpen) return null;

  const handleApply = () => {
    localStorage.setItem("playmat", playmat);
    localStorage.setItem("cardback", cardback);
    setOldPlaymat(playmat);
    setOldCardback(cardback);
    onClose();
  };

  const handleCancel = () => {
    setPlaymat(oldPlaymat);
    setCardback(oldCardback);
    onClose();
  };

  return (
    <div className={styles.settingsPopupOverlay}>
      <div className={styles.settingsPopup}>
        <button className={styles.closeButton} onClick={handleCancel}>
          ✖
        </button>
        <h2>Settings</h2>
        <div className={styles.settingsContent}>
          <label>Playmat:</label>
          <div className={styles.colorSelector}>
            {playMatColors.map((color) => (
              <div
                key={color}
                className={styles.colorSquare}
                style={{
                  backgroundColor: color,
                  border: playmat === color ? "3px solid #1890ff" : "2px solid #ccc",
                }}
                onClick={() => setPlaymat(color)}
              />
            ))}
          </div>

          <label>Cardback:</label>
          <div className={styles.cardbackSelector}>
            {cardBackFiles.map((file) => (
              <img
                key={file}
                src={`/card_back/${file}`}
                alt={file}
                className={`${styles.cardbackImage} ${cardback === file ? styles.selected : ""}`}
                onClick={() => setCardback(file)}
              />
            ))}
          </div>
        </div>
        <button className={styles.settingsApply} onClick={handleApply}>
          Apply
        </button>
      </div>
    </div>
  );
};

export default SettingsPopup;
