import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ScoringContextType {
  scoringContext: string;
  setScoringContext: (context: string) => void;
}

const ScoringContext = createContext<ScoringContextType | undefined>(undefined);

export const ScoringProvider = ({ children }: { children: ReactNode }) => {
  const [scoringContext, setScoringContext] = useState(
    "Ideal angles for scoring: Shoulder alignment < 5 degrees, Knee flex 25-30 degrees, Arm swing deviation < 5 degrees, Slide foot angle < 8 degrees."
  );

  return (
    <ScoringContext.Provider value={{ scoringContext, setScoringContext }}>
      {children}
    </ScoringContext.Provider>
  );
};

export const useScoringContext = () => {
  const context = useContext(ScoringContext);
  if (!context) {
    throw new Error('useScoringContext must be used within a ScoringProvider');
  }
  return context;
};
