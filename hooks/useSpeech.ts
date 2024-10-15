import { useState, useEffect } from 'react';
import * as Speech from 'expo-speech';
import { NativeBoundaryEvent } from 'expo-speech/build/Speech.types';

export function splitStringIntoBlocks(str: string, maxLength = 4000) {
  let blocks = [];
  for (let i = 0; i < str.length; i += maxLength) {
    let chunk = str.slice(i, i + maxLength);
    blocks.push(chunk);
  }
  return blocks;
}

export const useSpeech = (text: string, voice: string = 'eb-GN-SMTf00', rate: number = 1) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [textBlockIndex, setTextBlockIndex] = useState(0);
  const [pausedCharIndex, setPausedCharIndex] = useState(0);

  const speakText = () => {
    const inputValue = text.toString();
    const textBlocks = splitStringIntoBlocks(inputValue);
  
    if (textBlockIndex < textBlocks.length) {
      const currentBlock = textBlocks[textBlockIndex];
      const startingIndex = pausedCharIndex;
      const textToSpeak = currentBlock.slice(startingIndex);
  
      if (textToSpeak.length > 0) {
        Speech.speak(textToSpeak, {
          onBoundary: (boundaries: NativeBoundaryEvent) => {
            const { charIndex } = boundaries;
            setPausedCharIndex(startingIndex + charIndex);
          },
          onDone: () => {
            if (textBlockIndex + 1 < textBlocks.length) {
              setPausedCharIndex(0);
              setTextBlockIndex(prevIndex => prevIndex + 1);
            } else {
              Speech.speak('Chapter finished.');
              setIsSpeaking(false);
            }
          },
          voice: voice,
          rate: rate,
        });
      }
    }
  };

  const handleSpeaking = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakText();
    }
  };

  useEffect(() => {
    if (isSpeaking) speakText();
  }, [textBlockIndex]);

  return { isSpeaking, handleSpeaking };
};
