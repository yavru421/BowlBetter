import React, { createContext, useContext, useState } from 'react';

type Assignment = { [key: number]: { step: string; file: File | null } };

interface AssignmentContextType {
  assignments: Assignment;
  setAssignments: React.Dispatch<React.SetStateAction<Assignment>>;
}

const AssignmentContext = createContext<AssignmentContextType | undefined>(undefined);

export function AssignmentProvider({ children }: { children: React.ReactNode }) {
  const [assignments, setAssignments] = useState<Assignment>({});

  return (
    <AssignmentContext.Provider value={{ assignments, setAssignments }}>
      {children}
    </AssignmentContext.Provider>
  );
}

export function useAssignment() {
  const context = useContext(AssignmentContext);
  if (context === undefined) {
    throw new Error('useAssignment must be used within an AssignmentProvider');
  }
  return context;
}
