import React from "react";
import styles from "@/styles/settingsPopup.module.css"; // Assuming you have a CSS file for styling

interface SettingsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPopup: React.FC<SettingsPopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null; // Don't render if the popup is closed

  return (
    <div className={styles.settingsPopupOverlay}>
      <div className={styles.settingsPopup}>
        <button className={styles.closeButton} onClick={onClose}>
          ✖
        </button>
        <h2>Settings</h2>
        <div className={styles.settingsContent}>
          {/* Add your settings options here */}
          <label>
            Option 1:
            <input type="checkbox" />
          </label>
          <label>
            Option 2:
            <input type="text" placeholder="Enter value" />
          </label>
        </div>
      </div>
    </div>
  );
};

export default SettingsPopup;