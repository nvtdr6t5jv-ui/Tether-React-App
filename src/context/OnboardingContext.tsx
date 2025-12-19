import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Friend } from '../constants/mockData';

type SyncMode = 'contacts' | 'manual' | null;

interface OnboardingState {
  syncMode: SyncMode;
  selectedFriends: Friend[];
  currentFriendIndex: number;
  orbitAssignments: Record<string, string>;
}

interface OnboardingContextType extends OnboardingState {
  setSyncMode: (mode: SyncMode) => void;
  setSelectedFriends: (friends: Friend[]) => void;
  toggleFriendSelection: (friend: Friend) => void;
  addManualFriend: (friend: Friend) => void;
  removeManualFriend: (id: string) => void;
  assignOrbit: (friendId: string, orbitId: string) => void;
  nextFriend: () => boolean;
  previousFriend: () => void;
  skipFriend: () => boolean;
  resetOnboarding: () => void;
  currentFriend: Friend | null;
  isLastFriend: boolean;
}

const initialState: OnboardingState = {
  syncMode: null,
  selectedFriends: [],
  currentFriendIndex: 0,
  orbitAssignments: {},
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<OnboardingState>(initialState);

  const setSyncMode = (mode: SyncMode) => {
    setState(prev => ({ ...prev, syncMode: mode }));
  };

  const setSelectedFriends = (friends: Friend[]) => {
    setState(prev => ({ ...prev, selectedFriends: friends }));
  };

  const toggleFriendSelection = (friend: Friend) => {
    setState(prev => {
      const exists = prev.selectedFriends.find(f => f.id === friend.id);
      if (exists) {
        return {
          ...prev,
          selectedFriends: prev.selectedFriends.filter(f => f.id !== friend.id),
        };
      }
      return {
        ...prev,
        selectedFriends: [...prev.selectedFriends, friend],
      };
    });
  };

  const addManualFriend = (friend: Friend) => {
    setState(prev => ({
      ...prev,
      selectedFriends: [...prev.selectedFriends, friend],
    }));
  };

  const removeManualFriend = (id: string) => {
    setState(prev => ({
      ...prev,
      selectedFriends: prev.selectedFriends.filter(f => f.id !== id),
    }));
  };

  const assignOrbit = (friendId: string, orbitId: string) => {
    setState(prev => ({
      ...prev,
      orbitAssignments: {
        ...prev.orbitAssignments,
        [friendId]: orbitId,
      },
    }));
  };

  const nextFriend = (): boolean => {
    if (state.currentFriendIndex < state.selectedFriends.length - 1) {
      setState(prev => ({
        ...prev,
        currentFriendIndex: prev.currentFriendIndex + 1,
      }));
      return false;
    }
    return true;
  };

  const previousFriend = () => {
    if (state.currentFriendIndex > 0) {
      setState(prev => ({
        ...prev,
        currentFriendIndex: prev.currentFriendIndex - 1,
      }));
    }
  };

  const skipFriend = (): boolean => {
    return nextFriend();
  };

  const resetOnboarding = () => {
    setState(initialState);
  };

  const currentFriend = state.selectedFriends[state.currentFriendIndex] || null;
  const isLastFriend = state.currentFriendIndex === state.selectedFriends.length - 1;

  return (
    <OnboardingContext.Provider
      value={{
        ...state,
        setSyncMode,
        setSelectedFriends,
        toggleFriendSelection,
        addManualFriend,
        removeManualFriend,
        assignOrbit,
        nextFriend,
        previousFriend,
        skipFriend,
        resetOnboarding,
        currentFriend,
        isLastFriend,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};
