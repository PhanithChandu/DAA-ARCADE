
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { explainAlgorithm } from '../services/aiService';

interface AudioSettings {
  isEnabled: boolean;
  voice: string;
  speed: number;
  textFlow: boolean;
  autoContinue: boolean;
}

interface AudioContextType {
  settings: AudioSettings;
  updateSettings: (newSettings: Partial<AudioSettings>) => void;
  speak: (gameName: string, stateDescription: string) => Promise<void>;
  isSpeaking: boolean;
  lastTranscript: string;
  spokenIndex: number;
  stop: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AudioSettings>({
    isEnabled: true,
    voice: 'Tutor Default',
    speed: 1.0,
    textFlow: true,
    autoContinue: false
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  const [spokenIndex, setSpokenIndex] = useState(0);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AudioSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const speak = useCallback(async (gameName: string, stateDescription: string) => {
    if (!settings.isEnabled) return;
    
    stop();
    setIsSpeaking(true);
    setSpokenIndex(0);
    setLastTranscript("Generating tactical assessment...");

    try {
      const explanation = await explainAlgorithm(gameName, stateDescription);
      setLastTranscript(explanation);
      
      const utterance = new SpeechSynthesisUtterance(explanation);
      utterance.rate = settings.speed;
      
      // Select voice if possible
      const voices = window.speechSynthesis.getVoices();
      const selectedVoice = voices.find(v => v.name === settings.voice) || voices[0];
      if (selectedVoice) utterance.voice = selectedVoice;

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          setSpokenIndex(event.charIndex);
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Speech Error:", error);
      setLastTranscript("Communication failure.");
      setIsSpeaking(false);
    }
  }, [settings, stop]);

  return (
    <AudioContext.Provider value={{ settings, updateSettings, speak, isSpeaking, lastTranscript, spokenIndex, stop }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
