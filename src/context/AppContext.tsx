import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Friend } from '../constants/mockData';

export interface TetheredFriend extends Friend {
  orbitId: string;
  lastContact: Date | null;
  nextNudge: Date;
}

interface AppState {
  isOnboarded: boolean;
  friends: TetheredFriend[];
  userName: string;
}

interface AppContextType extends AppState {
  completeOnboarding: (friends: TetheredFriend[]) => void;
  updateLastContact: (friendId: string) => void;
  resetApp: () => void;
}

const initialState: AppState = {
  isOnboarded: false,
  friends: [],
  userName: '',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const getNextNudgeDate = (orbitId: string): Date => {
  const now = new Date();
  switch (orbitId) {
    case 'inner':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case 'close':
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    case 'catchup':
      return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(initialState);

  const completeOnboarding = (friends: TetheredFriend[]) => {
    setState({
      isOnboarded: true,
      friends,
      userName: '',
    });
  };

  const updateLastContact = (friendId: string) => {
    setState(prev => ({
      ...prev,
      friends: prev.friends.map(f => {
        if (f.id === friendId) {
          return {
            ...f,
            lastContact: new Date(),
            nextNudge: getNextNudgeDate(f.orbitId),
          };
        }
        return f;
      }),
    }));
  };

  const resetApp = () => {
    setState(initialState);
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        completeOnboarding,
        updateLastContact,
        resetApp,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
