import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import MessageBox, { type MessageBoxIcon } from '../components/MessageBox';

export interface DialogOptions {
  title: string;
  message: ReactNode;
  icon?: MessageBoxIcon;
  buttons?: string[];
}

interface OpenDialog extends DialogOptions {
  key: number;
}

const DialogContext = createContext<(options: DialogOptions) => void>(() => {});

let nextKey = 1;

export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialogs, setDialogs] = useState<OpenDialog[]>([]);

  const show = useCallback((options: DialogOptions) => {
    setDialogs((d) => [...d.slice(-3), { ...options, key: nextKey++ }]);
  }, []);

  const dismiss = useCallback((key: number) => {
    setDialogs((d) => d.filter((dialog) => dialog.key !== key));
  }, []);

  const value = useMemo(() => show, [show]);

  return (
    <DialogContext.Provider value={value}>
      {children}
      {dialogs.map(({ key, ...options }, i) => (
        <MessageBox key={key} {...options} offset={i} onClose={() => dismiss(key)} />
      ))}
    </DialogContext.Provider>
  );
}

export function useDialogs() {
  return useContext(DialogContext);
}
