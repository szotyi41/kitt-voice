import React, { useState, useEffect, useCallback } from 'react';
import KittVoiceInterface from './components/KittVoiceInterface';
import PasswordProtection from './components/PasswordProtection';
import { voiceService } from './services/openai';
import './App.css';

function App() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [kittAudioLevel, setKittAudioLevel] = useState(0);
  const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);

  const updateAudioLevel = useCallback(async () => {
    if (currentStream && isListening) {
      const level = await voiceService.getAudioLevel(currentStream);
      setAudioLevel(level);
      requestAnimationFrame(updateAudioLevel);
    }
  }, [currentStream, isListening]);

  useEffect(() => {
    if (isListening && currentStream) {
      updateAudioLevel();
    }
  }, [isListening, currentStream, updateAudioLevel]);

  const handleStartListening = async () => {
    try {
      setIsListening(true);
      const stream = await voiceService.startRecording();
      setCurrentStream(stream);
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsListening(false);
      alert('Hiba történt a hangfelvétel indításakor. Engedélyezd a mikrofon használatát!');
    }
  };

  const handleStopListening = async () => {
    try {
      setIsListening(false);
      setCurrentStream(null);
      setIsProcessing(true);

      const audioBlob = await voiceService.stopRecording();
      
      const transcript = await voiceService.transcribeAudio(audioBlob);
      console.log('Transcript:', transcript);
      
      const response = await voiceService.getChatResponse(transcript);
      console.log('KITT Response:', response);
      
      const audioData = await voiceService.textToSpeech(response);
      setIsSpeaking(true);
      await voiceService.playAudio(audioData, (level) => {
        setKittAudioLevel(level);
      });
      setIsSpeaking(false);
      setKittAudioLevel(0);
      
    } catch (error) {
      console.error('Error processing voice:', error);
      alert('Hiba történt a hangrögzítés feldolgozásakor.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="App">
      <PasswordProtection>
        <KittVoiceInterface
          onStartListening={handleStartListening}
          onStopListening={handleStopListening}
          isListening={isListening}
          isProcessing={isProcessing}
          audioLevel={audioLevel}
          isSpeaking={isSpeaking}
          kittAudioLevel={kittAudioLevel}
        />
      </PasswordProtection>
    </div>
  );
}

export default App;
