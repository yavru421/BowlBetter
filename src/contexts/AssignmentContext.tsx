import React, { createContext, useContext, useState, SetStateAction } from 'react';

type Assignment = { [key: number]: { step: string; file: File | null } };

interface AssignmentContextType {
  assignments: Assignment;
  setAssignments: React.Dispatch<React.SetStateAction<Assignment>>;
}

const AssignmentContext = createContext<AssignmentContextType | undefined>(undefined);

export function AssignmentProvider({ children }: { children: React.ReactNode }) {
  const [assignments, setAssignmentsState] = useState<Assignment>({});

  const setAssignments = (newAssignments: Assignment) => {
    console.log('setAssignments called with:', newAssignments);
    setAssignmentsState(newAssignments);
  };

  const logAndSetAssignments = (value: SetStateAction<Assignment>) => {
    if (typeof value === 'function') {
      setAssignmentsState((prevState: Assignment) => {
        const newState = (value as (prevState: Assignment) => Assignment)(prevState);
        console.log('setAssignments called with updater function. New state:', newState);
        return newState;
      });
    } else {
      console.log('setAssignments called with direct value:', value);
      setAssignmentsState(value);
    }
  };

  return (
    <AssignmentContext.Provider value={{ assignments, setAssignments: logAndSetAssignments }}>
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
