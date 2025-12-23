import React, { createContext, useContext, ReactNode } from 'react';
import { useWidgetSync } from '../hooks/useWidgetSync';

interface WidgetContextType {
  syncWidgetData: () => Promise<void>;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

export const WidgetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { syncWidgetData } = useWidgetSync();

  return (
    <WidgetContext.Provider value={{ syncWidgetData }}>
      {children}
    </WidgetContext.Provider>
  );
};

export const useWidget = (): WidgetContextType => {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error('useWidget must be used within WidgetProvider');
  }
  return context;
};
