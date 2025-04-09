import React, { useEffect, useState } from "react";
import styles from "@/styles/settingsPopup.module.css"; // Assuming you have a CSS file for styling

interface SettingsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  playmat: string;
  setPlaymat: (value: string) => void;
  cardback: string;
  setCardback: (value: string) => void;
}

const SettingsPopup: React.FC<SettingsPopupProps> = ({ 
  isOpen, 
  onClose,
  playmat,
  setPlaymat,
  cardback,
  setCardback, }) => {
  if (!isOpen) return null; // Don't render if the popup is closed

  const [oldPlaymat, setOldPlaymat] = useState(playmat);
  const [oldCardback, setOldCardback] = useState(cardback);

  const handleApply = () => {
    localStorage.setItem("playmat", playmat);
    localStorage.setItem("cardback", cardback);
    onClose(); // Close the popup when applying settings
  }

  const handleCancel = () => {
    setPlaymat(oldPlaymat);
    setCardback(oldCardback);
    onClose(); // Close the popup when canceling settings
  }

  return (
    <div className={styles.settingsPopupOverlay}>
      <div className={styles.settingsPopup}>
        <button className={styles.closeButton} onClick={handleCancel}>
          ✖
        </button>
        <h2>Settings</h2>
        <div className={styles.settingsContent}>
          {/* Add your settings options here */}
          <label>
            Playmat:
            <select value={playmat} onChange={(e) => setPlaymat(e.target.value)}>
              <option value="Green">Green</option>
              <option value="Blue">Blue</option>
              <option value="Red">Red</option>
            </select>
          </label>
          <label>
            Cardback:
            <select value={cardback} onChange={(e) => setCardback(e.target.value)}>
              <option value="https://deckofcardsapi.com/static/img/back.png">Default</option>
              <option value="/testCardBack.jpg">test</option>
              <option value="https://deckofcardsapi.com/static/img/back.png">Temp 2</option>
            </select>
          </label>
        </div>
        <button className={styles.settingsApply} onClick ={handleApply}>Apply</button>
      </div>
    </div>
  );
};

export default SettingsPopup;