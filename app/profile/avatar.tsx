"use client";

import React from "react";
import Image from "next/image";
import "./avatar.css";

interface AvatarSelectorProps {
  selected: number;
  onSelect: (avatarNumber: number) => void;
}

const AvatarSelector: React.FC<AvatarSelectorProps> = (
  { selected, onSelect },
) => {
  const avatars = Array.from({ length: 49 }, (_, i) => 101 + i);

  return (
    <div className="avatar-selector">
      <p style={{ color: "white", fontWeight: "bold", marginBottom: "12px" }}>
        Select an Avatar:
      </p>
      <div className="avatar-grid">
        {avatars.map((num) => (
          <Image
            key={num}
            src={`/avatars_118x118/a${num}.png`}
            alt={`Avatar ${num}`}
            className={selected === num ? "selected" : ""}
            onClick={() => onSelect(num)}
            width={65}
            height={65}
            priority // Optional: makes sense for visible images
          />
        ))}
      </div>
    </div>
  );
};

export default AvatarSelector;
