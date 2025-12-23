import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'pending_quick_action';

export interface PendingAction {
  friendId: string;
  friendName: string;
  friendInitials: string;
  friendPhoto?: string;
  type: 'call' | 'text';
  startedAt: string;
  phone?: string;
}

interface PendingActionContextType {
  pendingAction: PendingAction | null;
  setPendingAction: (action: PendingAction | null) => void;
  clearPendingAction: () => void;
  showCompleteModal: boolean;
  setShowCompleteModal: (show: boolean) => void;
}

const PendingActionContext = createContext<PendingActionContextType | undefined>(undefined);

export const PendingActionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pendingAction, setPendingActionState] = useState<PendingAction | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const [wasInBackground, setWasInBackground] = useState(false);

  useEffect(() => {
    loadPendingAction();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [pendingAction, wasInBackground]);

  const loadPendingAction = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const action = JSON.parse(stored) as PendingAction;
        const startedAt = new Date(action.startedAt).getTime();
        const now = Date.now();
        if (now - startedAt < 30 * 60 * 1000) {
          setPendingActionState(action);
        } else {
          await AsyncStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {}
  };

  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    if (appState === 'active' && nextAppState.match(/inactive|background/)) {
      setWasInBackground(true);
    }

    if (wasInBackground && nextAppState === 'active' && pendingAction) {
      const startedAt = new Date(pendingAction.startedAt).getTime();
      const now = Date.now();
      if (now - startedAt > 3000 && now - startedAt < 30 * 60 * 1000) {
        setShowCompleteModal(true);
      }
      setWasInBackground(false);
    }

    setAppState(nextAppState);
  }, [appState, wasInBackground, pendingAction]);

  const setPendingAction = useCallback(async (action: PendingAction | null) => {
    setPendingActionState(action);
    if (action) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(action));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const clearPendingAction = useCallback(async () => {
    setPendingActionState(null);
    setShowCompleteModal(false);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <PendingActionContext.Provider
      value={{
        pendingAction,
        setPendingAction,
        clearPendingAction,
        showCompleteModal,
        setShowCompleteModal,
      }}
    >
      {children}
    </PendingActionContext.Provider>
  );
};

export const usePendingAction = () => {
  const context = useContext(PendingActionContext);
  if (!context) {
    throw new Error('usePendingAction must be used within a PendingActionProvider');
  }
  return context;
};
