import React, { useState, useRef, useCallback, useEffect } from 'react';
import './KittVoiceInterface.css';

interface KittVoiceInterfaceProps {
  onStartListening: () => void;
  onStopListening: () => void;
  isListening: boolean;
  isProcessing: boolean;
  audioLevel: number;
  isSpeaking: boolean;
  kittAudioLevel: number;
}

const KittVoiceInterface: React.FC<KittVoiceInterfaceProps> = ({
  onStartListening,
  onStopListening,
  isListening,
  isProcessing,
  audioLevel,
  isSpeaking,
  kittAudioLevel
}) => {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSpeaking) {
      interval = setInterval(() => {
        forceUpdate({});
      }, 50);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSpeaking]);

  const renderKittScanner = () => {
    return (
      <div className="kitt-scanner">
        {Array.from({ length: 3 }, (_, i) => {
          const baseHeight = isSpeaking 
            ? Math.max(0.2, kittAudioLevel * 1.5 + (Math.random() * 0.3))
            : 0.3 + (Math.sin(Date.now() * 0.002 + i) * 0.2);
          
          return (
            <div
              key={i}
              className={`scanner-bar ${isSpeaking ? 'speaking' : 'idle'}`}
              style={{ 
                left: `${45 + i * 5}%`,
                transform: `scaleY(${baseHeight})`,
                opacity: isSpeaking ? Math.max(0.4, kittAudioLevel + 0.3) : 0.6
              }}
            />
          );
        })}
      </div>
    );
  };

  const renderVoiceBars = () => {
    const bars = [];
    const numBars = 20;
    
    for (let i = 0; i < numBars; i++) {
      const height = isListening 
        ? Math.max(5, audioLevel * 80 * (Math.random() * 0.7 + 0.3))
        : 5;
      
      bars.push(
        <div
          key={i}
          className={`voice-bar ${isListening ? 'listening' : ''}`}
          style={{
            height: `${height}px`,
            animationDelay: `${i * 0.05}s`
          }}
        />
      );
    }
    
    return bars;
  };

  const handleToggleListening = () => {
    if (isListening) {
      onStopListening();
    } else {
      onStartListening();
    }
  };

  return (
    <div className="kitt-monitor">
      {/* Left control panel */}
      <div className="control-panel left">
        <div className="control-button red"></div>
        <div className="control-button yellow"></div>
        <div className="control-button red"></div>
        <div className="control-button yellow"></div>
      </div>

      {/* Main display area */}
      <div className="main-display">
        {/* KITT scanner lines */}
        {renderKittScanner()}
        
        {/* Voice visualization bars */}
        {isListening && (
          <div className="voice-visualization">
            {renderVoiceBars()}
          </div>
        )}

        {/* Status display */}
        <div className="status-display">
          {isListening && 'VOICE INPUT ACTIVE'}
          {isProcessing && 'PROCESSING...'}
          {isSpeaking && 'KITT SPEAKING'}
          {!isListening && !isProcessing && !isSpeaking && 'READY'}
        </div>

        {/* Main control button */}
        <button
          className={`main-control-button ${isListening ? 'active' : ''}`}
          onClick={handleToggleListening}
          disabled={isProcessing}
        >
          {isListening ? 'END TRANSMISSION' : 'VOICE COMMAND'}
        </button>
      </div>

      {/* Right control panel */}
      <div className="control-panel right">
        <div className="control-button red"></div>
        <div className="control-button yellow"></div>
        <div className="control-button red"></div>
        <div className="control-button yellow"></div>
      </div>
    </div>
  );
};

export default KittVoiceInterface;