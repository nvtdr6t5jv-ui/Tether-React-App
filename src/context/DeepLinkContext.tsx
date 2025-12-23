import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { Linking, AppState, AppStateStatus } from 'react-native';
import * as ExpoLinking from 'expo-linking';

export type DeepLinkRoute = 
  | 'today'
  | 'people'
  | 'calendar'
  | 'insights'
  | 'settings'
  | 'progress'
  | 'garden'
  | 'quicklog'
  | 'profile';

interface DeepLinkContextType {
  pendingDeepLink: { route: DeepLinkRoute; params?: Record<string, string> } | null;
  clearDeepLink: () => void;
}

const DeepLinkContext = createContext<DeepLinkContextType | undefined>(undefined);

export const DeepLinkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pendingDeepLink, setPendingDeepLink] = useState<{ route: DeepLinkRoute; params?: Record<string, string> } | null>(null);
  const appState = useRef(AppState.currentState);
  const hasCheckedInitial = useRef(false);

  const parseUrl = useCallback((url: string | null): { route: DeepLinkRoute; params?: Record<string, string> } | null => {
    if (!url) return null;
    
    try {
      let path = '';
      
      if (url.startsWith('tether://')) {
        path = url.replace('tether://', '').split('?')[0].toLowerCase();
      } else {
        const parsed = ExpoLinking.parse(url);
        path = parsed.path?.toLowerCase() || '';
      }
      
      switch (path) {
        case 'today':
          return { route: 'today' as DeepLinkRoute };
        case 'people':
          return { route: 'people' as DeepLinkRoute };
        case 'calendar':
          return { route: 'calendar' as DeepLinkRoute };
        case 'insights':
          return { route: 'insights' as DeepLinkRoute };
        case 'settings':
          return { route: 'settings' as DeepLinkRoute };
        case 'progress':
        case 'streak':
          return { route: 'progress' as DeepLinkRoute };
        case 'garden':
          return { route: 'garden' as DeepLinkRoute };
        case 'quicklog':
          return { route: 'quicklog' as DeepLinkRoute };
        case 'profile':
          const queryString = url.split('?')[1] || '';
          const params: Record<string, string> = {};
          queryString.split('&').forEach(param => {
            const [key, value] = param.split('=');
            if (key && value) params[key] = decodeURIComponent(value);
          });
          return { route: 'profile' as DeepLinkRoute, params };
        default:
          return null;
      }
    } catch {
      return null;
    }
  }, []);

  const handleUrl = useCallback((url: string | null) => {
    const link = parseUrl(url);
    if (link) {
      setPendingDeepLink(link);
    }
  }, [parseUrl]);

  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      handleUrl(event.url);
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    if (!hasCheckedInitial.current) {
      hasCheckedInitial.current = true;
      Linking.getInitialURL().then(handleUrl);
    }

    return () => {
      subscription.remove();
    };
  }, [handleUrl]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        Linking.getInitialURL().then((url) => {
          if (url) {
            handleUrl(url);
          }
        });
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [handleUrl]);

  const clearDeepLink = useCallback(() => {
    setPendingDeepLink(null);
  }, []);

  return (
    <DeepLinkContext.Provider value={{ pendingDeepLink, clearDeepLink }}>
      {children}
    </DeepLinkContext.Provider>
  );
};

export const useDeepLink = () => {
  const context = useContext(DeepLinkContext);
  if (!context) {
    throw new Error('useDeepLink must be used within a DeepLinkProvider');
  }
  return context;
};