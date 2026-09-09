import React, { createContext, useState, useContext } from 'react';

const EmotionContext = createContext(null);

export const EmotionProvider = ({ children }) => {
  const [currentEmotion, setCurrentEmotion] = useState('CALM');
  const [scores, setScores] = useState({
    HAPPY: 0.1,
    SAD: 0.1,
    CALM: 0.6,
    ANGRY: 0.1,
    FEAR: 0.1
  });
  const [inputMethod, setInputMethod] = useState(null);

  const updateEmotion = (detectedEmotion, newScores, method) => {
    setCurrentEmotion(detectedEmotion);
    setScores(newScores);
    setInputMethod(method);
  };

  const resetEmotion = () => {
    setCurrentEmotion('CALM');
    setScores({
      HAPPY: 0.1,
      SAD: 0.1,
      CALM: 0.6,
      ANGRY: 0.1,
      FEAR: 0.1
    });
    setInputMethod(null);
  };

  return (
    <EmotionContext.Provider
      value={{
        currentEmotion,
        scores,
        inputMethod,
        updateEmotion,
        resetEmotion
      }}
    >
      {children}
    </EmotionContext.Provider>
  );
};

export const useEmotion = () => {
  const context = useContext(EmotionContext);
  if (!context) {
    throw new Error('useEmotion must be used within an EmotionProvider');
  }
  return context;
};

export default EmotionContext;
