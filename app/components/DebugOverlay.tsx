import React, { useState, useEffect } from 'react';
import { DebugOverlayProps } from '@/types/DebugOverlayProps';
const DebugOverlay: React.FC<DebugOverlayProps> = ({ gameData }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isCircle = target.id === 'debug-circle';
      const isCtrl = e.ctrlKey;

      if (isCircle && isCtrl) {
        setVisible((v) => !v);
      }
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  return (
    <>
      <div
        id="debug-circle"
        style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          width: '10px',
          height: '10px',
          backgroundColor: '#0e4d1f', // your uploaded color
          borderRadius: '50%',
          cursor: 'pointer',
          zIndex: 9999
        }}
      ></div>

      {visible && (
        <div
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '10px',
            backgroundColor: 'rgba(14, 77, 31, 0.95)',
            color: 'white',
            padding: '12px',
            borderRadius: '6px',
            fontSize: '12px',
            zIndex: 9999,
            maxWidth: '300px'
          }}
        >
          <div><strong>Match Phase:</strong> {gameData.matchPhase}</div>
          <div><strong>Game Phase:</strong> {gameData.gamePhase}</div>
          <div><strong>Trick Phase:</strong> {gameData.trickPhase}</div>
          <hr style={{ margin: '6px 0', borderColor: '#2e8b57' }} />
          <div><strong>Scores:</strong></div>
          <div><strong>Scores:</strong> {gameData.playerPointsString}</div>
          
        </div>
      )}
    </>
  );
};

export default DebugOverlay;
